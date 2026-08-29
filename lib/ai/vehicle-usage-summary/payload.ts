import { createHash } from "node:crypto"
import type { VehicleUsageAnalysis } from "@/lib/vehicle-usage-analysis"
import type { EvidenceValue } from "./schema"

const WEEKDAY_LABELS = [
  "วันอาทิตย์",
  "วันจันทร์",
  "วันอังคาร",
  "วันพุธ",
  "วันพฤหัสบดี",
  "วันศุกร์",
  "วันเสาร์",
]

function addEvidence(
  evidence: Record<string, EvidenceValue>,
  key: string,
  label: string,
  value: number | string | null,
  unit: string | null,
  subject: string | null = null,
) {
  evidence[key] = { label, value, unit, subject }
}

export function buildVehicleUsageAiPayload(analysis: VehicleUsageAnalysis) {
  const evidence: Record<string, EvidenceValue> = {}
  const users: Record<string, { name: string }> = {}

  addEvidence(evidence, "fleet.tripCount", "จำนวนเที่ยวใช้งานจริง", analysis.totals.tripCount, "เที่ยว")
  addEvidence(evidence, "fleet.totalDistanceKm", "ระยะทางรวม", analysis.totals.totalDistanceKm, "กม.")
  addEvidence(evidence, "fleet.uniqueUsersCount", "ผู้ใช้รถ", analysis.totals.uniqueUsersCount, "คน")
  addEvidence(evidence, "fleet.breakdownCount", "งานซ่อมจากความขัดข้อง", analysis.totals.breakdownCount, "รายการ")
  addEvidence(evidence, "fleet.preventiveCount", "งานบำรุงรักษาตามรอบ", analysis.totals.preventiveCount, "รายการ")
  addEvidence(evidence, "fleet.previousTripCount", "จำนวนเที่ยวช่วงก่อนหน้า", analysis.totals.previousTripCount, "เที่ยว")
  addEvidence(evidence, "fleet.tripCountChangePercent", "การเปลี่ยนแปลงจำนวนเที่ยว", analysis.totals.tripCountChangePercent, "%")
  addEvidence(evidence, "quality.mileageCoveragePercent", "ความครบถ้วนของเลขไมล์", analysis.dataCompleteness.mileageCoveragePercent, "%")
  addEvidence(evidence, "quality.actualPickupCoveragePercent", "ความครบถ้วนของเวลารับรถจริง", analysis.dataCompleteness.actualPickupCoveragePercent, "%")

  if (analysis.peakUsage.weekday !== null) {
    addEvidence(
      evidence,
      "peak.weekday",
      "วันที่เริ่มใช้รถมากที่สุด",
      WEEKDAY_LABELS[analysis.peakUsage.weekday],
      null,
    )
    addEvidence(evidence, "peak.weekdayTripCount", "เที่ยวในวันที่ใช้สูงสุด", analysis.peakUsage.weekdayTripCount, "เที่ยว")
  }
  if (analysis.peakUsage.hour !== null) {
    addEvidence(
      evidence,
      "peak.hour",
      "ช่วงเวลาที่เริ่มใช้รถมากที่สุด",
      `${String(analysis.peakUsage.hour).padStart(2, "0")}:00–${String(analysis.peakUsage.hour).padStart(2, "0")}:59`,
      null,
    )
    addEvidence(evidence, "peak.hourTripCount", "เที่ยวในช่วงเวลาที่ใช้สูงสุด", analysis.peakUsage.hourTripCount, "เที่ยว")
  }

  const vehiclePayload = analysis.vehicles.map((vehicle, index) => {
    const vehicleRef = `v${index + 1}`
    const subject = `${vehicle.plateNumber} (${vehicle.vehicleType})`
    addEvidence(evidence, `vehicles.${vehicleRef}.usageCount`, "จำนวนเที่ยว", vehicle.usageCount, "เที่ยว", subject)
    addEvidence(evidence, `vehicles.${vehicleRef}.totalDistanceKm`, "ระยะทางรวม", vehicle.totalDistanceKm, "กม.", subject)
    addEvidence(evidence, `vehicles.${vehicleRef}.breakdownCount`, "งานซ่อมจากความขัดข้อง", vehicle.breakdownCount, "รายการ", subject)
    addEvidence(evidence, `vehicles.${vehicleRef}.preventiveCount`, "งานบำรุงรักษาตามรอบ", vehicle.preventiveCount, "รายการ", subject)
    addEvidence(evidence, `vehicles.${vehicleRef}.breakdownRatePer10kKm`, "อัตราซ่อมจากความขัดข้อง", vehicle.breakdownRatePer10kKm, "รายการ/10,000 กม.", subject)
    addEvidence(evidence, `vehicles.${vehicleRef}.peerMedianUsageCount`, "ค่ามัธยฐานจำนวนเที่ยวของรถประเภทเดียวกัน", vehicle.peerMedianUsageCount, "เที่ยว", subject)
    addEvidence(evidence, `vehicles.${vehicleRef}.peerMedianDistanceKm`, "ค่ามัธยฐานระยะทางของรถประเภทเดียวกัน", vehicle.peerMedianDistanceKm, "กม.", subject)
    addEvidence(evidence, `vehicles.${vehicleRef}.peerMedianBreakdownRatePer10kKm`, "ค่ามัธยฐานอัตราซ่อมของรถประเภทเดียวกัน", vehicle.peerMedianBreakdownRatePer10kKm, "รายการ/10,000 กม.", subject)

    return {
      vehicleRef,
      plateNumber: vehicle.plateNumber.slice(0, 40),
      vehicleType: vehicle.vehicleType.slice(0, 80),
      usageCount: vehicle.usageCount,
      totalDistanceKm: vehicle.totalDistanceKm,
      averageDistancePerValidTripKm: vehicle.avgDistancePerTripKm,
      breakdownCount: vehicle.breakdownCount,
      preventiveCount: vehicle.preventiveCount,
      breakdownRatePer10kKm: vehicle.breakdownRatePer10kKm,
      comparableVehicleCount: vehicle.comparableVehicleCount,
      peerMedians: {
        usageCount: vehicle.peerMedianUsageCount,
        totalDistanceKm: vehicle.peerMedianDistanceKm,
        breakdownRatePer10kKm: vehicle.peerMedianBreakdownRatePer10kKm,
      },
    }
  })

  const userPayload = analysis.users.map((user, index) => {
    const userRef = `u${index + 1}`
    const name = user.name.slice(0, 120)
    users[userRef] = { name }
    addEvidence(evidence, `users.${userRef}.tripCount`, "จำนวนเที่ยว", user.tripCount, "เที่ยว", name)
    addEvidence(evidence, `users.${userRef}.totalDistanceKm`, "ระยะทางรวม", user.totalDistanceKm, "กม.", name)
    addEvidence(evidence, `users.${userRef}.vehicleCount`, "จำนวนรถที่ใช้", user.vehicleCount, "คัน", name)
    addEvidence(evidence, `users.${userRef}.usageSharePercent`, "สัดส่วนการใช้งาน", user.usageSharePercent, "%", name)
    addEvidence(evidence, `users.${userRef}.previousTripCount`, "จำนวนเที่ยวช่วงก่อนหน้า", user.previousTripCount, "เที่ยว", name)
    addEvidence(evidence, `users.${userRef}.tripCountChangePercent`, "การเปลี่ยนแปลงจำนวนเที่ยว", user.tripCountChangePercent, "%", name)

    return {
      userRef,
      name,
      tripCount: user.tripCount,
      totalDistanceKm: user.totalDistanceKm,
      averageDistancePerValidTripKm: user.avgDistancePerTripKm,
      vehicleCount: user.vehicleCount,
      mostUsedVehicleType: user.mostUsedVehicleType,
      usageSharePercent: user.usageSharePercent,
      previousTripCount: user.previousTripCount,
      tripCountChangePercent: user.tripCountChangePercent,
    }
  })

  const payload = {
    period: analysis.period,
    scope: analysis.filters.vehicleId ? "ONE_VEHICLE" : "ALL_VEHICLES",
    fleet: analysis.totals,
    vehicles: vehiclePayload,
    users: userPayload,
    peakUsage: analysis.peakUsage,
    dataCompleteness: analysis.dataCompleteness,
    dataLimitations: analysis.dataLimitations,
    allowedEvidenceMetricKeys: Object.keys(evidence),
  }

  return {
    payload,
    evidence,
    users,
    cacheKey: createHash("sha256").update(JSON.stringify(payload)).digest("hex"),
  }
}
