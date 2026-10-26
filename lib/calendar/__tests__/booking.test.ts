import { describe, expect, it } from "vitest"
import { bookingPeriod, validateBookingPeriod } from "../booking"

const now = new Date("2026-10-26T01:00:00Z")
const period = { startDay: "2026-10-26", startTime: "09:00", endDay: "2026-10-26", endTime: "10:00" }

describe("calendar booking periods", () => {
  it("prefills only the clicked day and, for time slots, the start time", () => {
    expect(bookingPeriod({ day: "2026-10-26" })).toEqual({ startDay: "2026-10-26", startTime: "", endDay: "2026-10-26", endTime: "" })
    expect(bookingPeriod({ day: "2026-10-26", time: "09:30" })).toEqual({ startDay: "2026-10-26", startTime: "09:30", endDay: "2026-10-26", endTime: "" })
  })

  it("sends explicit Bangkok offsets, independent of the computer's timezone", () => {
    const result = validateBookingPeriod(period, now)
    expect(result).toEqual({ startDate: "2026-10-26T09:00:00+07:00", endDate: "2026-10-26T10:00:00+07:00" })
    if (!result.error) expect(new Date(result.startDate).toISOString()).toBe("2026-10-26T02:00:00.000Z")
  })

  it("supports trips across midnight and year boundaries", () => {
    expect(validateBookingPeriod({ startDay: "2026-12-31", startTime: "23:00", endDay: "2027-01-01", endTime: "01:00" }, now)).toEqual({ startDate: "2026-12-31T23:00:00+07:00", endDate: "2027-01-01T01:00:00+07:00" })
  })

  it.each(["startDay", "startTime", "endDay", "endTime"] as const)("rejects missing %s", (key) => {
    expect(validateBookingPeriod({ ...period, [key]: "" }, now)).toHaveProperty("error", expect.stringContaining("ครบถ้วน"))
  })

  it("rejects past start times on today's Bangkok date", () => {
    expect(validateBookingPeriod({ ...period, startTime: "07:59" }, now)).toHaveProperty("error", "ไม่สามารถจองย้อนหลังได้")
  })

  it.each(["08:30", "09:00"])("rejects an end at %s that is not after the start", (endTime) => {
    expect(validateBookingPeriod({ ...period, endTime }, now)).toHaveProperty("error", "วันที่สิ้นสุดต้องหลังวันที่เริ่มต้น")
  })

  it.each([
    { ...period, startDay: "2026-02-30" },
    { ...period, startDay: "invalid" },
    { ...period, startTime: "24:00" },
    { ...period, endTime: "12:99" },
  ])("rejects invalid dates and times", (invalid) => {
    expect(validateBookingPeriod(invalid, now)).toHaveProperty("error", "วันหรือเวลาไม่ถูกต้อง")
  })
})
