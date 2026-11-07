import type { VehicleUsageSummary } from "./schema"

const unsafePatterns = [
  /ผู้ใช้.{0,40}(?:เป็นความผิด|ต้องรับผิดชอบ|ควรถูกลงโทษ)/,
  /การใช้งาน.{0,50}ทำให้.{0,30}(?:รถเสีย|ขัดข้อง)/,
  /ควรจัดรถ.{0,50}ให้(?:นาย|นาง|คุณ)/,
]

export class InvalidAiSummaryError extends Error {}

const refPattern = /\b[uv]\d+\b/g

export function validateAiSummary(
  summary: VehicleUsageSummary,
  allowedEvidenceKeys: Set<string>,
  users: Record<string, { name: string }>,
  allowedLimitations: string[],
  vehicles: Record<string, { plateNumber: string }> = {},
) {
  // vehicleRef/userRef เช่น v4, u1 มีตัวเลขอยู่ในตัว — ยกเว้นเฉพาะ ref ที่มีอยู่จริงก่อนตรวจตัวเลข
  const refNames: Record<string, string> = {
    ...Object.fromEntries(Object.entries(vehicles).map(([ref, v]) => [ref, v.plateNumber])),
    ...Object.fromEntries(Object.entries(users).map(([ref, u]) => [ref, u.name])),
  }
  const withoutKnownRefs = (text: string) =>
    text.replace(refPattern, (ref) => (ref in refNames ? "" : ref))
  const resolveRefs = (text: string) =>
    text.replace(refPattern, (ref) => refNames[ref] ?? ref)

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
    if (/\d/.test(withoutKnownRefs(text))) {
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

  // แปลง ref เป็นทะเบียนรถ/ชื่อหลังผ่านการตรวจแล้ว เพื่อให้ผู้อ่านเข้าใจได้
  return {
    ...summary,
    executiveSummary: resolveRefs(summary.executiveSummary),
    vehicleUsageInsights: summary.vehicleUsageInsights.map((item) => ({
      ...item,
      insight: resolveRefs(item.insight),
    })),
    userUsageInsights: summary.userUsageInsights.map((item) => ({
      ...item,
      insight: resolveRefs(item.insight),
    })),
    maintenanceInsights: summary.maintenanceInsights.map((item) => ({
      ...item,
      insight: resolveRefs(item.insight),
    })),
    recommendations: summary.recommendations.map((item) => ({
      ...item,
      recommendation: resolveRefs(item.recommendation),
      reason: resolveRefs(item.reason),
    })),
    dataLimitations: allowedLimitations,
  }
}
