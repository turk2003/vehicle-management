import { beforeEach, describe, expect, it, vi } from "vitest"
import { POST } from "../route"
import { requireAccess } from "@/lib/permissions"
import { calculateVehicleUsageAnalysis } from "@/lib/vehicle-usage-analysis"
import {
  buildVehicleUsageAiPayload,
  generateVehicleUsageSummary,
} from "@/lib/ai/vehicle-usage-summary"

const prismaMock = vi.hoisted(() => ({
  log: {
    count: vi.fn(),
    create: vi.fn(),
  },
}))

vi.mock("@/lib/prisma", () => ({ prisma: prismaMock }))
vi.mock("@/lib/permissions", async (importOriginal) => {
  const original = await importOriginal<typeof import("@/lib/permissions")>()
  return { ...original, requireAccess: vi.fn() }
})
vi.mock("@/lib/vehicle-usage-analysis", () => ({
  AnalysisInputError: class AnalysisInputError extends Error {},
  calculateVehicleUsageAnalysis: vi.fn(),
}))
vi.mock("@/lib/ai/vehicle-usage-summary", () => ({
  AiSummaryUnavailableError: class AiSummaryUnavailableError extends Error {},
  buildVehicleUsageAiPayload: vi.fn(),
  generateVehicleUsageSummary: vi.fn(),
}))

const vehicleId = "11111111-1111-4111-8111-111111111111"
const analysis = {
  filters: { vehicleId: null },
  period: {
    startDate: "2026-08-01",
    endDate: "2026-08-22",
    comparisonStartDate: "2026-07-10",
    comparisonEndDate: "2026-07-31",
    dayCount: 22,
  },
  totals: { tripCount: 2 },
  vehicles: [{ vehicleId }],
  dataLimitations: [],
}

const summaryResult = {
  status: "READY" as const,
  summary: {
    executiveSummary: "มีการใช้งานต่อเนื่องตามภารกิจ",
    vehicleUsageInsights: [],
    userUsageInsights: [],
    maintenanceInsights: [],
    recommendations: [],
    dataLimitations: [],
  },
  evidence: {},
  users: {},
  generatedAt: "2026-08-22T10:00:00.000Z",
  model: "gpt-5.6-luna",
}

function request(body: Record<string, unknown> = {}) {
  return new Request("http://localhost:3000/api/admin/vehicles/history/analysis", {
    method: "POST",
    body: JSON.stringify(body),
  }) as Parameters<typeof POST>[0]
}

describe("POST /api/admin/vehicles/history/analysis", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(requireAccess).mockResolvedValue({ userId: "admin-1", role: "ADMIN", isActive: true })
    vi.mocked(calculateVehicleUsageAnalysis).mockResolvedValue(analysis as never)
    vi.mocked(buildVehicleUsageAiPayload).mockReturnValue({ cacheKey: `cache-${Math.random()}` } as never)
    vi.mocked(generateVehicleUsageSummary).mockResolvedValue({
      result: summaryResult,
      metadata: {
        model: "gpt-5.6-luna",
        attempts: 1,
        latencyMs: 150,
        inputTokens: 200,
        outputTokens: 80,
      },
    })
    prismaMock.log.count.mockResolvedValue(0)
    prismaMock.log.create.mockResolvedValue({ id: "log-1" })
  })

  it("allows Admin and records only operational metadata", async () => {
    const response = await POST(request({
      vehicleId,
      startDate: "2026-08-01",
      endDate: "2026-08-22",
    }))

    expect(response.status).toBe(200)
    expect(generateVehicleUsageSummary).toHaveBeenCalledOnce()
    expect(prismaMock.log.create).toHaveBeenCalledWith({
      data: {
        userId: "admin-1",
        action: "AI_USAGE_SUMMARY_REQUEST",
        metadata: expect.objectContaining({
          model: "gpt-5.6-luna",
          status: "success",
          inputTokens: 200,
          outputTokens: 80,
        }),
      },
    })
    expect(JSON.stringify(prismaMock.log.create.mock.calls[0])).not.toContain("สมชาย")
  })

  it("rejects non-Admin users before reading analysis data", async () => {
    vi.mocked(requireAccess).mockImplementation(() => {
      throw new Error("Not authorized")
    })

    const response = await POST(request())

    expect(response.status).toBe(403)
    expect(calculateVehicleUsageAnalysis).not.toHaveBeenCalled()
    expect(generateVehicleUsageSummary).not.toHaveBeenCalled()
  })

  it("does not call AI when there is no actual usage", async () => {
    vi.mocked(calculateVehicleUsageAnalysis).mockResolvedValue({
      ...analysis,
      totals: { tripCount: 0 },
    } as never)

    const response = await POST(request({
      startDate: "2026-08-01",
      endDate: "2026-08-22",
    }))
    const body = await response.json()

    expect(body.status).toBe("NO_USAGE_DATA")
    expect(generateVehicleUsageSummary).not.toHaveBeenCalled()
  })

  it("rejects unknown request fields", async () => {
    const response = await POST(request({
      startDate: "2026-08-01",
      endDate: "2026-08-22",
      totalTrips: 999,
    }))

    expect(response.status).toBe(400)
    expect(calculateVehicleUsageAnalysis).not.toHaveBeenCalled()
  })

  it("enforces the non-cached hourly run limit", async () => {
    prismaMock.log.count.mockResolvedValue(10)

    const response = await POST(request({
      startDate: "2026-08-01",
      endDate: "2026-08-22",
    }))

    expect(response.status).toBe(429)
    expect(generateVehicleUsageSummary).not.toHaveBeenCalled()
  })
})
