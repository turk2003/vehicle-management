import { prisma } from "@/lib/prisma"
import type { Prisma } from "@/app/generated/prisma/client"
import { bangkokDateKey, resolveCalendarMonth, resolveCalendarRange } from "./dates"
import type { CalendarBookingStatus, CalendarSnapshot, CalendarVehicle } from "./types"

const visibleStatuses: CalendarBookingStatus[] = ["PENDING", "APPROVED", "CHANGED", "IN_PROGRESS", "COMPLETED"]

const currentBookingSelect = {
  id: true,
  status: true,
  startDate: true,
  endDate: true,
  pickedUpAt: true,
  returnedAt: true,
  user: { select: { name: true } },
} satisfies Prisma.BookingSelect

type CurrentBooking = Prisma.BookingGetPayload<{ select: typeof currentBookingSelect }>
type CurrentMaintenance = { startDate: Date; endDate: Date | null; status: string }

export function deriveCurrentVehicle(
  vehicle: { id: string; plateNumber: string; type: { name: string }; bookings: CurrentBooking[]; maintenances: CurrentMaintenance[] },
  now: Date,
): CalendarVehicle {
  const holders = vehicle.bookings
    .filter((booking) => booking.status === "IN_PROGRESS" && booking.pickedUpAt !== null && booking.returnedAt === null)
    .map((booking) => ({
      bookingId: booking.id,
      name: booking.user.name,
      pickedUpAt: booking.pickedUpAt!.toISOString(),
      dueAt: booking.endDate.toISOString(),
      overdue: booking.endDate < now,
    }))
  const maintenance = vehicle.maintenances.some((item) =>
    ["REPORTED", "IN_PROGRESS"].includes(item.status) && item.startDate <= now && (item.endDate === null || item.endDate > now),
  )
  const inUse = vehicle.bookings.some((booking) => booking.status === "IN_PROGRESS" && booking.returnedAt === null)
  const booked = vehicle.bookings.some((booking) =>
    ["APPROVED", "CHANGED"].includes(booking.status) && booking.startDate <= now && booking.endDate > now,
  )
  return {
    id: vehicle.id,
    plateNumber: vehicle.plateNumber,
    type: vehicle.type,
    status: maintenance ? "MAINTENANCE" : inUse ? "IN_USE" : booked ? "BOOKED" : "AVAILABLE",
    holders,
  }
}

export async function getCalendarSnapshot(value: string | null, now = new Date(), range?: { start: string | null; end: string | null }): Promise<CalendarSnapshot> {
  const { month, start, endExclusive } = range ? resolveCalendarRange(range.start, range.end) : resolveCalendarMonth(value, now)
  const [bookings, vehicles] = await Promise.all([
    prisma.booking.findMany({
      where: {
        status: { in: visibleStatuses },
        startDate: { lt: endExclusive },
        endDate: { gt: start },
      },
      select: {
        id: true,
        startDate: true,
        endDate: true,
        status: true,
        purpose: true,
        destination: true,
        user: { select: { name: true } },
        vehicle: { select: { id: true, plateNumber: true, type: { select: { name: true } } } },
      },
      orderBy: [{ startDate: "asc" }, { id: "asc" }],
    }),
    prisma.vehicle.findMany({
      select: {
        id: true,
        plateNumber: true,
        type: { select: { name: true } },
        bookings: {
          where: {
            OR: [
              { status: "IN_PROGRESS", returnedAt: null },
              { status: { in: ["APPROVED", "CHANGED"] }, startDate: { lte: now }, endDate: { gt: now } },
            ],
          },
          select: currentBookingSelect,
          orderBy: [{ pickedUpAt: "asc" }, { id: "asc" }],
        },
        maintenances: {
          where: {
            status: { in: ["REPORTED", "IN_PROGRESS"] },
            startDate: { lte: now },
            OR: [{ endDate: null }, { endDate: { gt: now } }],
          },
          select: { status: true, startDate: true, endDate: true },
        },
      },
      orderBy: { plateNumber: "asc" },
    }),
  ])
  return {
    month,
    ...(range && { range: { start: bangkokDateKey(start), end: bangkokDateKey(endExclusive) } }),
    asOf: now.toISOString(),
    bookings: bookings.map((booking) => ({
      ...booking,
      status: booking.status as CalendarBookingStatus,
      startDate: booking.startDate.toISOString(),
      endDate: booking.endDate.toISOString(),
    })),
    vehicles: vehicles.map((vehicle) => deriveCurrentVehicle(vehicle, now)),
  }
}
