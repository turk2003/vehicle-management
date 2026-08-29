import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { isAuthError, verifyAdmin } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import {
  AiSummaryUnavailableError,
  buildVehicleUsageAiPayload,
  generateVehicleUsageSummary,
  type VehicleUsageSummaryResponse,
} from "@/lib/ai/vehicle-usage-summary"
import {
  AnalysisInputError,
  calculateVehicleUsageAnalysis,
} from "@/lib/vehicle-usage-analysis"

const requestSchema = z.object({
  vehicleId: z.string().uuid().optional(),
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
}).strict()

const CACHE_TTL_MS = 10 * 60 * 1000
const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000
const RATE_LIMIT_RUNS = 10
const LOG_ACTION = "AI_USAGE_SUMMARY_REQUEST"

type CachedSummary = {
  expiresAt: number
  value: Omit<VehicleUsageSummaryResponse, "cached">
}

const summaryCache = new Map<string, CachedSummary>()
const activeAdmins = new Set<string>()

function getCachedSummary(cacheKey: string) {
  const cached = summaryCache.get(cacheKey)
  if (!cached) return null
  if (cached.expiresAt <= Date.now()) {
    summaryCache.delete(cacheKey)
    return null
  }
  return cached.value
}

function setCachedSummary(
  cacheKey: string,
  value: Omit<VehicleUsageSummaryResponse, "cached">,
) {
  for (const [key, cached] of summaryCache.entries()) {
    if (cached.expiresAt <= Date.now()) summaryCache.delete(key)
  }
  if (summaryCache.size >= 100) {
    const oldestKey = summaryCache.keys().next().value
    if (oldestKey) summaryCache.delete(oldestKey)
  }
  summaryCache.set(cacheKey, {
    expiresAt: Date.now() + CACHE_TTL_MS,
    value,
  })
}

async function recordRun(
  userId: string,
  metadata: Record<string, string | number | boolean | null>,
) {
  try {
    await prisma.log.create({
      data: {
        userId,
        action: LOG_ACTION,
        metadata,
      },
    })
  } catch {
    console.error("Failed to record AI usage summary metadata")
  }
}

export async function POST(req: NextRequest) {
  let adminId: string | null = null
  let runStartedAt = 0
  let model = process.env.OPENAI_VEHICLE_SUMMARY_MODEL || "gpt-5.6-luna"

  try {
    const admin = await verifyAdmin(req)
    adminId = admin.userId

    if (activeAdmins.has(admin.userId)) {
      return NextResponse.json(
        { message: "กำลังสร้างบทสรุปอยู่ กรุณารอให้คำขอปัจจุบันเสร็จสิ้น" },
        { status: 409 },
      )
    }
    activeAdmins.add(admin.userId)

    const body = requestSchema.parse(await req.json())
    const analysis = await calculateVehicleUsageAnalysis(body)

    if (body.vehicleId && analysis.vehicles.length === 0) {
      return NextResponse.json({ message: "ไม่พบรถที่เลือก" }, { status: 404 })
    }
    if (analysis.totals.tripCount === 0) {
      return NextResponse.json({
        status: "NO_USAGE_DATA",
        period: analysis.period,
        message: "ไม่มีข้อมูลการใช้รถในช่วงที่เลือก",
      })
    }

    const { cacheKey } = buildVehicleUsageAiPayload(analysis)
    const cached = getCachedSummary(cacheKey)
    if (cached) {
      return NextResponse.json({ ...cached, cached: true })
    }

    const runsInWindow = await prisma.log.count({
      where: {
        userId: admin.userId,
        action: LOG_ACTION,
        createdAt: { gte: new Date(Date.now() - RATE_LIMIT_WINDOW_MS) },
      },
    })
    if (runsInWindow >= RATE_LIMIT_RUNS) {
      return NextResponse.json(
        { message: "สร้างบทสรุปครบ 10 ครั้งในชั่วโมงนี้แล้ว กรุณาลองใหม่ภายหลัง" },
        { status: 429 },
      )
    }

    runStartedAt = Date.now()
    const { result, metadata } = await generateVehicleUsageSummary(analysis)
    model = metadata.model
    setCachedSummary(cacheKey, result)
    await recordRun(admin.userId, {
      model: metadata.model,
      status: "success",
      latencyMs: metadata.latencyMs,
      attempts: metadata.attempts,
      inputTokens: metadata.inputTokens,
      outputTokens: metadata.outputTokens,
      cacheHit: false,
    })

    return NextResponse.json({ ...result, cached: false })
  } catch (error) {
    if (error instanceof z.ZodError || error instanceof AnalysisInputError) {
      return NextResponse.json(
        {
          message:
            error instanceof AnalysisInputError
              ? error.message
              : "ตัวกรองสำหรับสร้างบทสรุปไม่ถูกต้อง",
        },
        { status: 400 },
      )
    }
    if (isAuthError(error)) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }
    if (error instanceof AiSummaryUnavailableError) {
      if (adminId && runStartedAt > 0) {
        await recordRun(adminId, {
          model,
          status: "failure",
          latencyMs: Date.now() - runStartedAt,
          attempts: error.attempts,
          inputTokens: null,
          outputTokens: null,
          cacheHit: false,
        })
      }
      return NextResponse.json(
        { message: "ไม่สามารถสร้างบทสรุป AI ได้ กรุณาลองใหม่" },
        { status: error.status === 429 ? 503 : 502 },
      )
    }
    return NextResponse.json({ message: "Server error" }, { status: 500 })
  } finally {
    if (adminId) activeAdmins.delete(adminId)
  }
}
