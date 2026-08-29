import { describe, expect, it } from "vitest"
import {
  AnalysisInputError,
  getBangkokWeekdayAndHour,
  isDateInPeriod,
  resolveAnalysisPeriod,
} from "../period"

describe("vehicle usage analysis period", () => {
  it("defaults to month-to-date in Bangkok", () => {
    const period = resolveAnalysisPeriod(
      {},
      new Date("2026-08-22T03:00:00.000Z"),
    )

    expect(period.startDate).toBe("2026-08-01")
    expect(period.endDate).toBe("2026-08-22")
    expect(period.dayCount).toBe(22)
    expect(period.start.toISOString()).toBe("2026-07-31T17:00:00.000Z")
    expect(period.endExclusive.toISOString()).toBe("2026-08-22T17:00:00.000Z")
  })

  it("creates an immediately preceding comparison period of equal length", () => {
    const period = resolveAnalysisPeriod({
      startDate: "2026-08-10",
      endDate: "2026-08-12",
    })

    expect(period.dayCount).toBe(3)
    expect(period.comparisonStartDate).toBe("2026-08-07")
    expect(period.comparisonEndDate).toBe("2026-08-09")
  })

  it("uses an exclusive end boundary", () => {
    const period = resolveAnalysisPeriod({
      startDate: "2026-08-10",
      endDate: "2026-08-10",
    })

    expect(isDateInPeriod(new Date("2026-08-09T17:00:00.000Z"), period.start, period.endExclusive)).toBe(true)
    expect(isDateInPeriod(new Date("2026-08-10T16:59:59.999Z"), period.start, period.endExclusive)).toBe(true)
    expect(isDateInPeriod(new Date("2026-08-10T17:00:00.000Z"), period.start, period.endExclusive)).toBe(false)
  })

  it("rejects partial and oversized ranges", () => {
    expect(() => resolveAnalysisPeriod({ startDate: "2026-08-01" })).toThrow(AnalysisInputError)
    expect(() => resolveAnalysisPeriod({
      startDate: "2025-01-01",
      endDate: "2026-01-02",
    })).toThrow("ช่วงวิเคราะห์ต้องไม่เกิน 366 วัน")
  })

  it("extracts weekday and hour in Bangkok", () => {
    expect(getBangkokWeekdayAndHour(new Date("2026-08-03T01:30:00.000Z"))).toEqual({
      weekday: 1,
      hour: 8,
    })
  })
})
