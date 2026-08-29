"use client"

import axios from "axios"
import { useEffect, useState } from "react"
import {
  AlertTriangle,
  Bot,
  CarFront,
  Clock3,
  Lightbulb,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  Users,
  Wrench,
} from "lucide-react"
import api from "@/lib/api"
import { formatDateTime } from "@/lib/format"
import type {
  EvidenceValue,
  VehicleUsageSummaryResponse,
} from "@/lib/ai/vehicle-usage-summary/schema"

type Filters = {
  vehicleId: string
  startDate: string
  endDate: string
}

type NoUsageDataResponse = {
  status: "NO_USAGE_DATA"
  message: string
}

type AnalysisResponse = VehicleUsageSummaryResponse | NoUsageDataResponse

type AiUsageSummaryCardProps = {
  filters: Filters
  historyLoading: boolean
  hasUsageData: boolean
}

function getApiErrorMessage(error: unknown) {
  if (axios.isAxiosError<{ message?: string }>(error)) {
    return error.response?.data?.message || "ไม่สามารถสร้างบทสรุป AI ได้"
  }
  return "ไม่สามารถสร้างบทสรุป AI ได้"
}

function formatEvidenceValue(evidence: EvidenceValue) {
  if (evidence.value === null) return "ข้อมูลไม่เพียงพอ"
  const value =
    typeof evidence.value === "number"
      ? evidence.value.toLocaleString("th-TH", { maximumFractionDigits: 2 })
      : evidence.value
  return evidence.unit ? `${value} ${evidence.unit}` : value
}

function EvidenceList({
  keys,
  evidence,
}: {
  keys: string[]
  evidence: Record<string, EvidenceValue>
}) {
  const values = keys.map((key) => evidence[key]).filter(Boolean)
  if (values.length === 0) return null

  return (
    <div className="mt-3 flex flex-wrap gap-2" aria-label="ข้อมูลประกอบข้อสรุป">
      {values.map((item, index) => (
        <span
          key={`${item.label}-${index}`}
          className="inline-flex flex-wrap items-baseline gap-x-1 rounded-full bg-slate-100 px-2.5 py-1 text-sm text-slate-700 ring-1 ring-slate-200"
        >
          {item.subject && <span className="font-medium text-slate-900">{item.subject}:</span>}
          <span>{item.label}</span>
          <span className="font-semibold text-slate-950">{formatEvidenceValue(item)}</span>
        </span>
      ))}
    </div>
  )
}

function LoadingSummary() {
  return (
    <div className="space-y-4" role="status" aria-live="polite">
      <div className="h-5 w-4/5 animate-pulse rounded bg-slate-200" />
      <div className="h-5 w-3/5 animate-pulse rounded bg-slate-200" />
      <div className="grid gap-3 md:grid-cols-2">
        <div className="h-28 animate-pulse rounded-lg bg-slate-100" />
        <div className="h-28 animate-pulse rounded-lg bg-slate-100" />
      </div>
      <span className="sr-only">กำลังสร้างบทสรุปการใช้รถจาก AI</span>
    </div>
  )
}

export default function AiUsageSummaryCard({
  filters,
  historyLoading,
  hasUsageData,
}: AiUsageSummaryCardProps) {
  const [result, setResult] = useState<VehicleUsageSummaryResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    setResult(null)
    setError("")
  }, [filters.vehicleId, filters.startDate, filters.endDate])

  const generateSummary = async () => {
    try {
      setLoading(true)
      setError("")

      const response = await api.post<AnalysisResponse>(
        "/api/admin/vehicles/history/analysis",
        {
          ...(filters.vehicleId && { vehicleId: filters.vehicleId }),
          startDate: filters.startDate,
          endDate: filters.endDate,
        },
      )

      if (response.data.status === "NO_USAGE_DATA") {
        setResult(null)
        setError(response.data.message)
        return
      }
      setResult(response.data)
    } catch (requestError) {
      setResult(null)
      setError(getApiErrorMessage(requestError))
    } finally {
      setLoading(false)
    }
  }

  const canGenerate =
    !historyLoading &&
    !loading &&
    hasUsageData &&
    Boolean(filters.startDate && filters.endDate)

  return (
    <section
      className="overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-slate-200"
      aria-labelledby="ai-usage-summary-title"
    >
      <div className="flex flex-col gap-4 border-b border-slate-200 px-5 py-5 sm:flex-row sm:items-start sm:justify-between sm:px-6">
        <div className="flex items-start gap-3">
          <span className="mt-0.5 rounded-lg bg-blue-50 p-2.5 text-blue-700" aria-hidden="true">
            <Bot className="h-5 w-5" />
          </span>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 id="ai-usage-summary-title" className="text-lg font-semibold text-slate-950">
                บทสรุปการใช้รถจาก AI
              </h2>
              <span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-800 ring-1 ring-blue-200">
                สำหรับ Admin
              </span>
            </div>
            <p className="mt-1 max-w-3xl text-sm leading-6 text-slate-600">
              สรุปรูปแบบการใช้งาน ภาระงาน และความสัมพันธ์กับการซ่อม เพื่อช่วยพิจารณาแนวทางบริหารรถ
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={generateSummary}
          disabled={!canGenerate}
          className="inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors duration-150 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-slate-600"
        >
          {loading ? (
            <RefreshCw className="h-4 w-4 animate-spin motion-reduce:animate-none" aria-hidden="true" />
          ) : result ? (
            <RefreshCw className="h-4 w-4" aria-hidden="true" />
          ) : (
            <Sparkles className="h-4 w-4" aria-hidden="true" />
          )}
          {loading ? "กำลังวิเคราะห์..." : result ? "สร้างใหม่" : "สร้างบทสรุป AI"}
        </button>
      </div>

      <div className="px-5 py-5 sm:px-6">
        {loading ? (
          <LoadingSummary />
        ) : error ? (
          <div className="flex flex-col gap-3 rounded-lg bg-rose-50 p-4 text-rose-900 ring-1 ring-rose-200 sm:flex-row sm:items-center sm:justify-between" role="alert">
            <div className="flex items-start gap-3">
              <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-rose-700" aria-hidden="true" />
              <div>
                <p className="text-sm font-semibold">ไม่สามารถแสดงบทสรุป AI</p>
                <p className="mt-1 text-sm leading-6">{error}</p>
              </div>
            </div>
            {hasUsageData && (
              <button
                type="button"
                onClick={generateSummary}
                className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg bg-white px-3 py-2 text-sm font-semibold text-rose-800 ring-1 ring-rose-300 transition hover:bg-rose-100 focus:outline-none focus:ring-2 focus:ring-rose-600"
              >
                <RefreshCw className="h-4 w-4" aria-hidden="true" />
                ลองใหม่
              </button>
            )}
          </div>
        ) : result ? (
          <div className="space-y-6">
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-slate-600">
              <span className="inline-flex items-center gap-1.5">
                <Clock3 className="h-4 w-4" aria-hidden="true" />
                สร้างเมื่อ {formatDateTime(result.generatedAt)}
              </span>
              <span>โมเดล {result.model}</span>
              {result.cached && <span>ผลชั่วคราวจาก cache</span>}
            </div>

            <div className="rounded-lg bg-blue-50 px-4 py-4 text-blue-950 ring-1 ring-blue-200">
              <p className="text-base font-medium leading-7">{result.summary.executiveSummary}</p>
            </div>

            <div className="grid gap-x-8 gap-y-6 lg:grid-cols-2">
              {[
                {
                  title: "ภาพรวมการใช้รถ",
                  icon: CarFront,
                  items: result.summary.vehicleUsageInsights,
                },
                {
                  title: "ภาพรวมผู้ใช้งาน",
                  icon: Users,
                  items: result.summary.userUsageInsights.map((item) => ({
                    ...item,
                    insight: `${result.users[item.userRef]?.name || "ผู้ใช้งาน"}: ${item.insight}`,
                  })),
                },
                {
                  title: "การซ่อมและบำรุงรักษา",
                  icon: Wrench,
                  items: result.summary.maintenanceInsights,
                },
              ].map((section) => {
                const Icon = section.icon
                return (
                  <div key={section.title}>
                    <h3 className="flex items-center gap-2 text-base font-semibold text-slate-950">
                      <Icon className="h-4.5 w-4.5 text-blue-700" aria-hidden="true" />
                      {section.title}
                    </h3>
                    <ul className="mt-3 divide-y divide-slate-200 border-y border-slate-200">
                      {section.items.map((item, index) => (
                        <li key={`${section.title}-${index}`} className="py-3.5">
                          <p className="text-sm leading-6 text-slate-800">{item.insight}</p>
                          <EvidenceList keys={item.evidenceMetricKeys} evidence={result.evidence} />
                        </li>
                      ))}
                    </ul>
                  </div>
                )
              })}

              <div>
                <h3 className="flex items-center gap-2 text-base font-semibold text-slate-950">
                  <Lightbulb className="h-4.5 w-4.5 text-blue-700" aria-hidden="true" />
                  คำแนะนำสำหรับผู้บริหาร
                </h3>
                <ol className="mt-3 divide-y divide-slate-200 border-y border-slate-200">
                  {result.summary.recommendations.map((item, index) => (
                    <li key={`recommendation-${index}`} className="py-3.5">
                      <p className="text-sm font-semibold leading-6 text-slate-950">{item.recommendation}</p>
                      <p className="mt-1 text-sm leading-6 text-slate-600">{item.reason}</p>
                      <EvidenceList keys={item.evidenceMetricKeys} evidence={result.evidence} />
                    </li>
                  ))}
                </ol>
              </div>
            </div>

            {result.summary.dataLimitations.length > 0 && (
              <div className="rounded-lg bg-amber-50 px-4 py-4 text-amber-950 ring-1 ring-amber-200">
                <h3 className="flex items-center gap-2 text-sm font-semibold">
                  <AlertTriangle className="h-4 w-4" aria-hidden="true" />
                  ข้อจำกัดของข้อมูล
                </h3>
                <ul className="mt-2 list-disc space-y-1 pl-5 text-sm leading-6">
                  {result.summary.dataLimitations.map((limitation) => (
                    <li key={limitation}>{limitation}</li>
                  ))}
                </ul>
              </div>
            )}

            <div className="flex items-start gap-2 border-t border-slate-200 pt-4 text-sm leading-6 text-slate-600">
              <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-slate-700" aria-hidden="true" />
              <p>AI ช่วยสรุปข้อมูลเท่านั้น การจัดสรรรถและการดำเนินการด้านซ่อมบำรุงเป็นการตัดสินใจของผู้บริหาร</p>
            </div>
          </div>
        ) : (
          <div className="py-4 text-center">
            <Sparkles className="mx-auto h-7 w-7 text-slate-400" aria-hidden="true" />
            <p className="mt-3 text-sm font-semibold text-slate-900">
              {historyLoading
                ? "กำลังเตรียมข้อมูลรายงาน"
                : hasUsageData
                  ? "พร้อมสร้างบทสรุปจากข้อมูลที่เลือก"
                  : "ไม่มีข้อมูลการใช้รถในช่วงที่เลือก"}
            </p>
            <p className="mx-auto mt-1 max-w-xl text-sm leading-6 text-slate-600">
              {hasUsageData
                ? "ระบบจะคำนวณตัวเลขจากฐานข้อมูลก่อนส่งข้อมูลรวมที่จำเป็นให้ AI"
                : "ลองเปลี่ยนรถหรือช่วงวันที่ เมื่อมีเที่ยวใช้งานจริงจึงจะเรียก AI ได้"}
            </p>
          </div>
        )}
      </div>
    </section>
  )
}
