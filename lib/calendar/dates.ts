import type { CalendarBooking } from "./types"

const DAY_MS = 86_400_000
const BANGKOK_OFFSET_MS = 7 * 60 * 60 * 1000

export class CalendarInputError extends Error {}

export function resolveCalendarRange(startValue: string | null, endValue: string | null) {
  const parse = (value: string | null) => {
    if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value) || value.startsWith("0000")) {
      throw new CalendarInputError("กรุณาระบุวันเริ่มต้นและสิ้นสุดในรูปแบบ YYYY-MM-DD ให้ครบ")
    }
    const date = new Date(`${value}T00:00:00+07:00`)
    if (!Number.isFinite(date.getTime()) || bangkokDateKey(date) !== value) {
      throw new CalendarInputError("วันที่ไม่ถูกต้อง")
    }
    return date
  }
  const start = parse(startValue)
  const endExclusive = parse(endValue)
  if (endExclusive <= start || endExclusive.getTime() - start.getTime() > 62 * DAY_MS) {
    throw new CalendarInputError("ช่วงวันที่ต้องมากกว่า 0 และไม่เกิน 62 วัน โดยไม่รวมวันสิ้นสุด")
  }
  return { month: startValue!.slice(0, 7), start, endExclusive }
}

export function bangkokDateKey(date: Date): string {
  return new Date(date.getTime() + BANGKOK_OFFSET_MS).toISOString().slice(0, 10)
}

export function resolveCalendarMonth(value: string | null, now = new Date()) {
  const month = value === null ? bangkokDateKey(now).slice(0, 7) : value
  if (!/^\d{4}-(0[1-9]|1[0-2])$/.test(month) || month.startsWith("0000")) {
    throw new CalendarInputError("กรุณาระบุเดือนในรูปแบบ YYYY-MM (ค.ศ.)")
  }
  const utcMonth = new Date(`${month}-01T00:00:00Z`)
  const nextUtcMonth = new Date(utcMonth)
  nextUtcMonth.setUTCMonth(nextUtcMonth.getUTCMonth() + 1)
  return {
    month,
    start: new Date(utcMonth.getTime() - BANGKOK_OFFSET_MS),
    endExclusive: new Date(nextUtcMonth.getTime() - BANGKOK_OFFSET_MS),
    dayCount: Math.round((nextUtcMonth.getTime() - utcMonth.getTime()) / DAY_MS),
  }
}

export function shiftCalendarMonth(month: string, amount: number): string | null {
  resolveCalendarMonth(month)
  const date = new Date(`${month}-01T00:00:00Z`)
  date.setUTCMonth(date.getUTCMonth() + amount)
  const year = date.getUTCFullYear()
  return year >= 1 && year <= 9999 ? date.toISOString().slice(0, 7) : null
}

export function bookingsForDay(bookings: CalendarBooking[], day: string) {
  const start = new Date(`${day}T00:00:00+07:00`).getTime()
  const end = start + DAY_MS
  return bookings.filter((booking) =>
    Date.parse(booking.startDate) < end && Date.parse(booking.endDate) > start,
  )
}

export function formatCalendarDate(value: string, mode: "date" | "time" | "datetime" | "month" = "datetime") {
  const options: Intl.DateTimeFormatOptions = { timeZone: "Asia/Bangkok" }
  if (mode !== "time") {
    options.year = "numeric"
    options.month = "long"
    if (mode !== "month") options.day = "numeric"
  }
  if (mode === "time" || mode === "datetime") {
    options.hour = "2-digit"
    options.minute = "2-digit"
    options.hourCycle = "h23"
  }
  return new Intl.DateTimeFormat("th-TH", options).format(new Date(value))
}
