import { prisma } from "@/lib/prisma"
import {
  AnalysisInputError,
  resolveAnalysisPeriod,
} from "@/lib/vehicle-usage-analysis"

export type HistoryDetailsTab = "trips" | "mileage" | "maintenance"

export type HistoryDetailsFilters = {
  tab: HistoryDetailsTab
  vehicleId?: string
  startDate?: string
  endDate?: string
  page?: number
  pageSize?: number
}

export class HistoryDetailsInputError extends AnalysisInputError {}

const BOOKING_SELECT = {
  id: true,
  purpose: true,
  status: true,
  startDate: true,
  endDate: true,
  pickedUpAt: true,
  returnedAt: true,
  mileageStart: true,
  mileageEnd: true,
  user: { select: { id: true, name: true } },
  vehicle: {
    select: {
      id: true,
      plateNumber: true,
      type: { select: { name: true } },
    },
  },
} as const

function getPagination(page = 1, pageSize = 20) {
  if (!Number.isInteger(page) || page < 1) {
    throw new HistoryDetailsInputError("page ต้องเป็นจำนวนเต็มตั้งแต่ 1 ขึ้นไป")
  }
  if (!Number.isInteger(pageSize) || pageSize < 1 || pageSize > 100) {
    throw new HistoryDetailsInputError("pageSize ต้องอยู่ระหว่าง 1 ถึง 100")
  }
  return { page, pageSize }
}

function serializePeriod(period: ReturnType<typeof resolveAnalysisPeriod>) {
  return {
    startDate: period.startDate,
    endDate: period.endDate,
    dayCount: period.dayCount,
  }
}

function paginate<T>(items: T[], page: number, pageSize: number) {
  const total = items.length
  const totalPages = total === 0 ? 0 : Math.ceil(total / pageSize)
  const start = (page - 1) * pageSize
  return {
    items: items.slice(start, start + pageSize),
    pagination: { page, pageSize, total, totalPages },
  }
}

function bookingEffectiveDate(booking: {
  status: string
  startDate: Date
  endDate: Date
  returnedAt: Date | null
}) {
  return booking.status === "COMPLETED"
    ? booking.returnedAt || booking.endDate
    : booking.startDate
}

export async function getVehicleHistoryDetails(filters: HistoryDetailsFilters) {
  const { page, pageSize } = getPagination(filters.page, filters.pageSize)
  const period = resolveAnalysisPeriod(filters)
  const vehicleWhere = filters.vehicleId ? { vehicleId: filters.vehicleId } : {}

  if (filters.tab === "maintenance") {
    const rows = await prisma.maintenance.findMany({
      where: {
        ...vehicleWhere,
        startDate: { gte: period.start, lt: period.endExclusive },
      },
      select: {
        id: true,
        description: true,
        repairDetails: true,
        serviceCenterName: true,
        cost: true,
        maintenanceType: true,
        status: true,
        startDate: true,
        endDate: true,
        reporter: { select: { id: true, name: true } },
        vehicle: {
          select: {
            id: true,
            plateNumber: true,
            type: { select: { name: true } },
          },
        },
      },
      orderBy: [{ startDate: "desc" }, { id: "desc" }],
    })
    const result = paginate(rows, page, pageSize)
    return { ...result, period: serializePeriod(period) }
  }

  const completedOnly = filters.tab === "mileage"
  const rows = await prisma.booking.findMany({
    where: {
      ...vehicleWhere,
      ...(completedOnly
        ? {
            status: "COMPLETED" as const,
            OR: [
              { returnedAt: { gte: period.start, lt: period.endExclusive } },
              {
                returnedAt: null,
                endDate: { gte: period.start, lt: period.endExclusive },
              },
            ],
          }
        : {
            OR: [
              {
                status: "COMPLETED" as const,
                returnedAt: { gte: period.start, lt: period.endExclusive },
              },
              {
                status: "COMPLETED" as const,
                returnedAt: null,
                endDate: { gte: period.start, lt: period.endExclusive },
              },
              {
                status: { not: "COMPLETED" as const },
                startDate: { gte: period.start, lt: period.endExclusive },
              },
            ],
          }),
    },
    select: BOOKING_SELECT,
  })

  const mapped = rows
    .map((booking) => {
      const effectiveDate = bookingEffectiveDate(booking)
      const distanceKm =
        booking.mileageStart !== null &&
        booking.mileageEnd !== null &&
        booking.mileageEnd >= booking.mileageStart
          ? booking.mileageEnd - booking.mileageStart
          : null
      return { ...booking, effectiveDate, distanceKm }
    })
    .sort(
      (a, b) =>
        b.effectiveDate.getTime() - a.effectiveDate.getTime() ||
        b.id.localeCompare(a.id),
    )

  const result = paginate(mapped, page, pageSize)
  return { ...result, period: serializePeriod(period) }
}
