import type { AnalysisFilters, ResolvedAnalysisPeriod } from "./types"

const BANGKOK_OFFSET = "+07:00"
const DAY_MS = 24 * 60 * 60 * 1000
const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/

export class AnalysisInputError extends Error {}

function formatBangkokDate(date: Date) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Bangkok",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date)
}

function parseBangkokDate(value: string) {
  if (!DATE_PATTERN.test(value)) {
    throw new AnalysisInputError("รูปแบบวันที่ไม่ถูกต้อง")
  }

  const date = new Date(`${value}T00:00:00${BANGKOK_OFFSET}`)
  if (Number.isNaN(date.getTime()) || formatBangkokDate(date) !== value) {
    throw new AnalysisInputError("วันที่ไม่ถูกต้อง")
  }

  return date
}

function addDays(date: Date, days: number) {
  return new Date(date.getTime() + days * DAY_MS)
}

export function resolveAnalysisPeriod(
  filters: AnalysisFilters,
  now = new Date(),
): ResolvedAnalysisPeriod {
  const hasStartDate = Boolean(filters.startDate)
  const hasEndDate = Boolean(filters.endDate)

  if (hasStartDate !== hasEndDate) {
    throw new AnalysisInputError("กรุณาระบุวันที่เริ่มต้นและวันที่สิ้นสุดให้ครบ")
  }

  const today = formatBangkokDate(now)
  const startDate = filters.startDate || `${today.slice(0, 8)}01`
  const endDate = filters.endDate || today
  const start = parseBangkokDate(startDate)
  const endStart = parseBangkokDate(endDate)

  if (endStart < start) {
    throw new AnalysisInputError("วันที่สิ้นสุดต้องไม่ก่อนวันที่เริ่มต้น")
  }

  const dayCount = Math.round((endStart.getTime() - start.getTime()) / DAY_MS) + 1
  if (dayCount > 366) {
    throw new AnalysisInputError("ช่วงวิเคราะห์ต้องไม่เกิน 366 วัน")
  }

  const endExclusive = addDays(endStart, 1)
  const comparisonEndExclusive = start
  const comparisonStart = addDays(start, -dayCount)
  const comparisonEndDate = formatBangkokDate(addDays(start, -1))

  return {
    startDate,
    endDate,
    start,
    endExclusive,
    comparisonStartDate: formatBangkokDate(comparisonStart),
    comparisonEndDate,
    comparisonStart,
    comparisonEndExclusive,
    dayCount,
  }
}

export function isDateInPeriod(date: Date, start: Date, endExclusive: Date) {
  return date >= start && date < endExclusive
}

export function getBangkokWeekdayAndHour(date: Date) {
  const shifted = new Date(date.getTime() + 7 * 60 * 60 * 1000)
  return {
    weekday: shifted.getUTCDay(),
    hour: shifted.getUTCHours(),
  }
}
