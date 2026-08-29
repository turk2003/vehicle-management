import type { VehicleUsageSummary } from "./schema"

const unsafePatterns = [
  /ผู้ใช้.{0,40}(?:เป็นความผิด|ต้องรับผิดชอบ|ควรถูกลงโทษ)/,
  /การใช้งาน.{0,50}ทำให้.{0,30}(?:รถเสีย|ขัดข้อง)/,
  /ควรจัดรถ.{0,50}ให้(?:นาย|นาง|คุณ)/,
]

export class InvalidAiSummaryError extends Error {}

export function validateAiSummary(
  summary: VehicleUsageSummary,
  allowedEvidenceKeys: Set<string>,
  users: Record<string, { name: string }>,
  allowedLimitations: string[],
) {
  const allEvidenceGroups = [
    ...summary.vehicleUsageInsights,
    ...summary.userUsageInsights,
    ...summary.maintenanceInsights,
    ...summary.recommendations,
  ]

  for (const item of allEvidenceGroups) {
    for (const key of item.evidenceMetricKeys) {
      if (!allowedEvidenceKeys.has(key)) {
        throw new InvalidAiSummaryError(`Unknown evidence key: ${key}`)
      }
    }
  }

  for (const item of summary.userUsageInsights) {
    if (!users[item.userRef]) {
      throw new InvalidAiSummaryError(`Unknown user reference: ${item.userRef}`)
    }
  }

  const prose = [
    summary.executiveSummary,
    ...summary.vehicleUsageInsights.map((item) => item.insight),
    ...summary.userUsageInsights.map((item) => item.insight),
    ...summary.maintenanceInsights.map((item) => item.insight),
    ...summary.recommendations.flatMap((item) => [item.recommendation, item.reason]),
  ]

  for (const text of prose) {
    if (/\d/.test(text)) {
      throw new InvalidAiSummaryError("AI prose must reference evidence instead of writing numbers")
    }
    if (unsafePatterns.some((pattern) => pattern.test(text))) {
      throw new InvalidAiSummaryError("AI summary contains a disallowed conclusion")
    }
    if (Object.values(users).some(({ name }) => name.length > 1 && text.includes(name))) {
      throw new InvalidAiSummaryError("AI prose must use userRef instead of writing a name")
    }
  }

  const allowedLimitationSet = new Set(allowedLimitations)
  if (
    summary.dataLimitations.some(
      (limitation) => !allowedLimitationSet.has(limitation),
    )
  ) {
    throw new InvalidAiSummaryError("AI returned an unsupported data limitation")
  }

  return {
    ...summary,
    dataLimitations: allowedLimitations,
  }
}
