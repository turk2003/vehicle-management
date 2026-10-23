import type { Booking, BookingStats, DateFilter } from "./types"
import { INITIAL_STATS } from "./constants"

export function buildStats(bookings: Booking[]): BookingStats {
  return bookings.reduce<BookingStats>((acc, booking) => {
    acc.total += 1
    if (booking.status === "APPROVED" || booking.status === "CHANGED") acc.approved += 1
    if (booking.status === "REJECTED") acc.rejected += 1
    return acc
  }, { ...INITIAL_STATS })
}

export function filterByDate(bookings: Booking[], dateFilter: DateFilter) {
  if (!dateFilter.startDate && !dateFilter.endDate) return bookings

  const start = dateFilter.startDate
    ? new Date(`${dateFilter.startDate}T00:00:00`)
    : null
  const end = dateFilter.endDate
    ? new Date(`${dateFilter.endDate}T23:59:59`)
    : null

  return bookings.filter((booking) => {
    const updated = new Date(booking.updatedAt)
    if (start && updated < start) return false
    if (end && updated > end) return false
    return true
  })
}
