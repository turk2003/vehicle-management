import { describe, expect, it } from "vitest"
import type { VehicleUsageSummary } from "../schema"
import { InvalidAiSummaryError, validateAiSummary } from "../validate"

const validSummary: VehicleUsageSummary = {
  executiveSummary: "ภาพรวมสะท้อนกิจกรรมการทำงานต่อเนื่อง และควรติดตามความพร้อมของกองรถควบคู่กัน",
  vehicleUsageInsights: [{
    insight: "รถในกลุ่มมีระดับการใช้งานแตกต่างกันตามภารกิจ",
    evidenceMetricKeys: ["fleet.tripCount"],
  }],
  userUsageInsights: [{
    userRef: "u1",
    insight: "มีภาระการใช้รถสูงในช่วงที่เลือก",
    evidenceMetricKeys: ["users.u1.tripCount"],
  }],
  maintenanceInsights: [{
    insight: "ควรติดตามเหตุขัดข้องร่วมกับระดับการใช้งานโดยไม่สรุปเชิงสาเหตุ",
    evidenceMetricKeys: ["fleet.breakdownCount"],
  }],
  recommendations: [{
    recommendation: "ทบทวนรอบตรวจสภาพรถในระดับกองรถ",
    reason: "ช่วยรักษาความพร้อมให้สอดคล้องกับภารกิจ",
    evidenceMetricKeys: ["fleet.tripCount"],
  }],
  dataLimitations: [],
}

const evidence = new Set([
  "fleet.tripCount",
  "users.u1.tripCount",
  "fleet.breakdownCount",
])
const users = { u1: { name: "สมชาย" } }

describe("validateAiSummary", () => {
  it("accepts references that match server-computed evidence", () => {
    expect(validateAiSummary(validSummary, evidence, users, [])).toEqual(validSummary)
  })

  it("rejects invented evidence keys", () => {
    expect(() => validateAiSummary({
      ...validSummary,
      vehicleUsageInsights: [{
        insight: "มีรูปแบบการใช้งานที่ควรติดตาม",
        evidenceMetricKeys: ["invented.metric"],
      }],
    }, evidence, users, [])).toThrow(InvalidAiSummaryError)
  })

  it("rejects numbers and direct names in AI-authored prose", () => {
    expect(() => validateAiSummary({
      ...validSummary,
      executiveSummary: "มีการใช้งาน 12 เที่ยว",
    }, evidence, users, [])).toThrow("reference evidence")

    expect(() => validateAiSummary({
      ...validSummary,
      userUsageInsights: [{
        userRef: "u1",
        insight: "สมชายมีภาระการใช้รถสูง",
        evidenceMetricKeys: ["users.u1.tripCount"],
      }],
    }, evidence, users, [])).toThrow("use userRef")
  })

  it("uses only deterministic data limitations", () => {
    expect(() => validateAiSummary({
      ...validSummary,
      dataLimitations: ["AI คาดว่าข้อมูลอาจไม่ครบ"],
    }, evidence, users, ["ไม่มีข้อมูลช่วงก่อนหน้า"])).toThrow("unsupported data limitation")
  })
})
