import type { AxiosError } from "axios"
import type { Booking, BookingStats } from "./types"
import { INITIAL_STATS } from "./constants"

export function getErrorMessage(error: unknown, fallback: string) {
  const axiosError = error as AxiosError<{ message?: string }>
  return axiosError.response?.data?.message || fallback
}

export function toLocalDateTimeInputValue(dateString: string) {
  const date = new Date(dateString)
  date.setMinutes(date.getMinutes() - date.getTimezoneOffset())
  return date.toISOString().slice(0, 16)
}

export function getLocalDateTimeInputValue(date = new Date()) {
  const localDate = new Date(date)
  localDate.setMinutes(localDate.getMinutes() - localDate.getTimezoneOffset())
  return localDate.toISOString().slice(0, 16)
}

export function buildStats(bookings: Booking[]): BookingStats {
  return bookings.reduce<BookingStats>((acc, booking) => {
    acc.total += 1
    const key = booking.status.toLowerCase() as keyof BookingStats

    if (key in acc && key !== "total") {
      acc[key] += 1
    }

    return acc
  }, { ...INITIAL_STATS })
}

export function getDistance(booking: Booking) {
  if (booking.mileageStart == null || booking.mileageEnd == null) return null
  return booking.mileageEnd - booking.mileageStart
}
