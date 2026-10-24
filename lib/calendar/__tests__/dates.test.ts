import { describe, expect, it } from "vitest"
import { bangkokDateKey, bookingsForDay, resolveCalendarMonth, resolveCalendarRange, shiftCalendarMonth } from "../dates"
import type { CalendarBooking } from "../types"

function booking(startDate: string, endDate: string): CalendarBooking {
  return {
    id: "booking-1", startDate, endDate, status: "APPROVED", purpose: "ตรวจงาน", destination: null,
    user: { name: "ผู้จอง" }, vehicle: { id: "vehicle-1", plateNumber: "กข 123", type: { name: "รถเก๋ง" } },
  }
}

describe("calendar dates in Bangkok", () => {
  it("resolves a week across a month boundary with an exclusive end in Bangkok", () => {
    const range = resolveCalendarRange("2026-10-26", "2026-11-02")
    expect(range.start.toISOString()).toBe("2026-10-25T17:00:00.000Z")
    expect(range.endExclusive.toISOString()).toBe("2026-11-01T17:00:00.000Z")
  })

  it.each([
    [null, "2026-11-02"], ["2026-10-26", null], ["2026-02-30", "2026-03-02"],
    ["2026-10-26", "2026-10-26"], ["2026-10-26", "2026-10-25"],
    ["2026-01-01", "2026-04-01"], ["2026-1-1", "2026-01-02"],
  ])("rejects an invalid date range %s to %s", (start, end) => {
    expect(() => resolveCalendarRange(start, end)).toThrow()
  })

  it("resolves the current month at the Thai midnight boundary", () => {
    const now = new Date("2026-10-31T17:00:00Z")
    expect(bangkokDateKey(now)).toBe("2026-11-01")
    const period = resolveCalendarMonth(null, now)
    expect(period.month).toBe("2026-11")
    expect(period.start.toISOString()).toBe("2026-10-31T17:00:00.000Z")
    expect(period.endExclusive.toISOString()).toBe("2026-11-30T17:00:00.000Z")
  })

  it.each(["", "2026-13", "2026-00", "2026-1", "26-10", "2026-10-01", "0000-01", "invalid"])("rejects invalid month %j", (month) => {
    expect(() => resolveCalendarMonth(month)).toThrow("YYYY-MM")
  })

  it("handles leap years, year transitions and the supported year boundaries", () => {
    expect(resolveCalendarMonth("2028-02").dayCount).toBe(29)
    expect(resolveCalendarMonth("2026-02").dayCount).toBe(28)
    expect(shiftCalendarMonth("2026-12", 1)).toBe("2027-01")
    expect(shiftCalendarMonth("2026-01", -1)).toBe("2025-12")
    expect(shiftCalendarMonth("0001-01", -1)).toBeNull()
    expect(shiftCalendarMonth("9999-12", 1)).toBeNull()
  })

  it("shows multi-day bookings on every overlapping day, excluding an end at midnight", () => {
    const trip = booking("2026-09-30T20:00:00+07:00", "2026-10-02T00:00:00+07:00")
    expect(bookingsForDay([trip], "2026-09-30")).toEqual([trip])
    expect(bookingsForDay([trip], "2026-10-01")).toEqual([trip])
    expect(bookingsForDay([trip], "2026-10-02")).toEqual([])
  })

  it("uses Bangkok rather than UTC when grouping trips", () => {
    const trip = booking("2026-10-21T18:00:00Z", "2026-10-21T19:00:00Z")
    expect(bookingsForDay([trip], "2026-10-21")).toEqual([])
    expect(bookingsForDay([trip], "2026-10-22")).toEqual([trip])
  })
})
