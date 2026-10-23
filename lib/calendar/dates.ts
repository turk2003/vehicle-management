import type { CalendarBooking } from "./types"

const DAY_MS = 86_400_000
const BANGKOK_OFFSET_MS = 7 * 60 * 60 * 1000

export class CalendarInputError extends Error {}

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
    // Monday is the first column.
    leadingDays: (utcMonth.getUTCDay() + 6) % 7,
  }
}

export function shiftCalendarMonth(month: string, amount: number): string | null {
  resolveCalendarMonth(month)
  const date = new Date(`${month}-01T00:00:00Z`)
  date.setUTCMonth(date.getUTCMonth() + amount)
  const year = date.getUTCFullYear()
  return year >= 1 && year <= 9999 ? date.toISOString().slice(0, 7) : null
}

export function monthDays(month: string): (string | null)[] {
  const { dayCount, leadingDays } = resolveCalendarMonth(month)
  const days: (string | null)[] = Array(leadingDays).fill(null)
  for (let day = 1; day <= dayCount; day++) {
    days.push(`${month}-${String(day).padStart(2, "0")}`)
  }
  while (days.length % 7 !== 0) days.push(null)
  return days
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
  }
  return new Intl.DateTimeFormat("th-TH", options).format(new Date(value))
}
