import { bangkokDateKey } from "./dates"

export type CalendarBookingPeriod = {
  startDay: string
  startTime: string
  endDay: string
  endTime: string
}

export type CalendarBookingSelection = { day: string; time?: string }

export function bookingPeriod(selection: CalendarBookingSelection): CalendarBookingPeriod {
  return {
    startDay: selection.day,
    startTime: selection.time ?? "",
    endDay: selection.day,
    endTime: "",
  }
}

export function validateBookingPeriod(period: CalendarBookingPeriod, now = new Date()) {
  const { startDay, startTime, endDay, endTime } = period
  if (!startDay || !startTime || !endDay || !endTime) {
    return { error: "กรุณาระบุวันและเวลาเริ่มต้นและสิ้นสุดให้ครบถ้วน" } as const
  }
  const parse = (day: string, time: string) => {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(day) || !/^([01]\d|2[0-3]):[0-5]\d$/.test(time)) return null
    const value = `${day}T${time}:00+07:00`
    const date = new Date(value)
    if (!Number.isFinite(date.getTime()) || bangkokDateKey(date) !== day) return null
    return { value, date }
  }
  const start = parse(startDay, startTime)
  const end = parse(endDay, endTime)
  if (!start || !end) return { error: "วันหรือเวลาไม่ถูกต้อง" } as const
  if (start.date < now) return { error: "ไม่สามารถจองย้อนหลังได้" } as const
  if (end.date <= start.date) return { error: "วันที่สิ้นสุดต้องหลังวันที่เริ่มต้น" } as const
  return { startDate: start.value, endDate: end.value } as const
}
