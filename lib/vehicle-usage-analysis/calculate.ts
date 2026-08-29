import { prisma } from "@/lib/prisma"
import {
  getBangkokWeekdayAndHour,
  isDateInPeriod,
  resolveAnalysisPeriod,
} from "./period"
import type {
  AnalysisFilters,
  PeakUsageMetric,
  UserUsageMetric,
  VehicleHistoryItem,
  VehicleUsageAnalysis,
} from "./types"

const DATA_COMPLETENESS_THRESHOLD = 80

type BookingRow = {
  vehicleId: string
  userId: string
  startDate: Date
  endDate: Date
  mileageStart: number | null
  mileageEnd: number | null
  pickedUpAt: Date | null
  returnedAt: Date | null
  user: { name: string }
}

type MaintenanceRow = {
  vehicleId: string
  maintenanceType: "BREAKDOWN" | "PREVENTIVE" | "OTHER" | "UNSPECIFIED"
}

type VehicleRow = {
  id: string
  plateNumber: string
  status: string
  currentMileage: number
  typeId: string
  type: { name: string }
}

type VehicleAggregate = {
  usageCount: number
  totalDistanceKm: number
  validMileageTrips: number
  maintenanceCount: number
  breakdownCount: number
  preventiveCount: number
  uniqueUserIds: Set<string>
  lastUsedAt: Date | null
}

function round(value: number, digits = 1) {
  const factor = 10 ** digits
  return Math.round(value * factor) / factor
}

function coverage(part: number, total: number) {
  return total === 0 ? 100 : round((part / total) * 100)
}

function percentChange(current: number, previous: number) {
  if (previous === 0) return null
  return round(((current - previous) / previous) * 100)
}

function median(values: number[]) {
  if (values.length === 0) return null
  const sorted = [...values].sort((a, b) => a - b)
  const middle = Math.floor(sorted.length / 2)
  return sorted.length % 2 === 0
    ? round((sorted[middle - 1] + sorted[middle]) / 2)
    : round(sorted[middle])
}

function getDistance(booking: BookingRow) {
  if (
    booking.mileageStart === null ||
    booking.mileageEnd === null ||
    booking.mileageEnd < booking.mileageStart
  ) {
    return null
  }
  return booking.mileageEnd - booking.mileageStart
}

function aggregateVehicle(
  bookings: BookingRow[],
  maintenances: MaintenanceRow[],
): VehicleAggregate {
  let totalDistanceKm = 0
  let validMileageTrips = 0
  let lastUsedAt: Date | null = null
  const uniqueUserIds = new Set<string>()

  for (const booking of bookings) {
    uniqueUserIds.add(booking.userId)
    const distance = getDistance(booking)
    if (distance !== null) {
      totalDistanceKm += distance
      validMileageTrips += 1
    }

    const usedAt = booking.returnedAt || booking.endDate
    if (!lastUsedAt || usedAt > lastUsedAt) lastUsedAt = usedAt
  }

  return {
    usageCount: bookings.length,
    totalDistanceKm,
    validMileageTrips,
    maintenanceCount: maintenances.length,
    breakdownCount: maintenances.filter(
      (maintenance) => maintenance.maintenanceType === "BREAKDOWN",
    ).length,
    preventiveCount: maintenances.filter(
      (maintenance) => maintenance.maintenanceType === "PREVENTIVE",
    ).length,
    uniqueUserIds,
    lastUsedAt,
  }
}

function breakdownRate(aggregate: VehicleAggregate) {
  if (aggregate.totalDistanceKm <= 0) return null
  return round((aggregate.breakdownCount / aggregate.totalDistanceKm) * 10_000, 2)
}

function buildPeakUsage(bookings: BookingRow[]): PeakUsageMetric {
  const weekdays = new Map<number, number>()
  const hours = new Map<number, number>()
  let estimatedStartTrips = 0

  for (const booking of bookings) {
    const usageStart = booking.pickedUpAt || booking.startDate
    if (!booking.pickedUpAt) estimatedStartTrips += 1
    const { weekday, hour } = getBangkokWeekdayAndHour(usageStart)
    weekdays.set(weekday, (weekdays.get(weekday) || 0) + 1)
    hours.set(hour, (hours.get(hour) || 0) + 1)
  }

  const peakEntry = (values: Map<number, number>) =>
    [...values.entries()].sort((a, b) => b[1] - a[1] || a[0] - b[0])[0]

  const weekday = peakEntry(weekdays)
  const hour = peakEntry(hours)

  return {
    weekday: weekday?.[0] ?? null,
    weekdayTripCount: weekday?.[1] ?? 0,
    hour: hour?.[0] ?? null,
    hourTripCount: hour?.[1] ?? 0,
    estimatedStartTrips,
  }
}

function buildUserMetrics(
  currentBookings: BookingRow[],
  previousBookings: BookingRow[],
  vehicleById: Map<string, VehicleRow>,
): UserUsageMetric[] {
  const previousCounts = new Map<string, number>()
  for (const booking of previousBookings) {
    previousCounts.set(booking.userId, (previousCounts.get(booking.userId) || 0) + 1)
  }

  const grouped = new Map<
    string,
    {
      name: string
      tripCount: number
      totalDistanceKm: number
      validMileageTrips: number
      vehicleIds: Set<string>
      vehicleTypeCounts: Map<string, number>
    }
  >()

  for (const booking of currentBookings) {
    const current = grouped.get(booking.userId) || {
      name: booking.user.name,
      tripCount: 0,
      totalDistanceKm: 0,
      validMileageTrips: 0,
      vehicleIds: new Set<string>(),
      vehicleTypeCounts: new Map<string, number>(),
    }
    current.tripCount += 1
    current.vehicleIds.add(booking.vehicleId)
    const distance = getDistance(booking)
    if (distance !== null) {
      current.totalDistanceKm += distance
      current.validMileageTrips += 1
    }
    const vehicleType = vehicleById.get(booking.vehicleId)?.type.name
    if (vehicleType) {
      current.vehicleTypeCounts.set(
        vehicleType,
        (current.vehicleTypeCounts.get(vehicleType) || 0) + 1,
      )
    }
    grouped.set(booking.userId, current)
  }

  return [...grouped.entries()]
    .map(([userId, item]) => {
      const previousTripCount = previousCounts.get(userId) || 0
      const mostUsedVehicleType = [...item.vehicleTypeCounts.entries()].sort(
        (a, b) => b[1] - a[1] || a[0].localeCompare(b[0], "th"),
      )[0]?.[0] ?? null

      return {
        userId,
        name: item.name,
        tripCount: item.tripCount,
        totalDistanceKm: item.totalDistanceKm,
        validMileageTrips: item.validMileageTrips,
        avgDistancePerTripKm:
          item.validMileageTrips > 0
            ? round(item.totalDistanceKm / item.validMileageTrips)
            : 0,
        vehicleCount: item.vehicleIds.size,
        mostUsedVehicleType,
        usageSharePercent:
          currentBookings.length > 0
            ? round((item.tripCount / currentBookings.length) * 100)
            : 0,
        previousTripCount,
        tripCountChangePercent: percentChange(item.tripCount, previousTripCount),
      }
    })
    .sort(
      (a, b) =>
        b.tripCount - a.tripCount ||
        b.totalDistanceKm - a.totalDistanceKm ||
        a.name.localeCompare(b.name, "th"),
    )
}

export async function calculateVehicleUsageAnalysis(
  filters: AnalysisFilters,
  now = new Date(),
): Promise<VehicleUsageAnalysis> {
  const resolvedPeriod = resolveAnalysisPeriod(filters, now)
  const vehicles = (await prisma.vehicle.findMany({
    include: { type: true },
    orderBy: { plateNumber: "asc" },
  })) as VehicleRow[]
  const allVehicleIds = vehicles.map((vehicle) => vehicle.id)
  const targetVehicles = filters.vehicleId
    ? vehicles.filter((vehicle) => vehicle.id === filters.vehicleId)
    : vehicles
  const targetVehicleIds = new Set(targetVehicles.map((vehicle) => vehicle.id))

  const [bookingRows, maintenanceRows] = await Promise.all([
    allVehicleIds.length === 0
      ? Promise.resolve([] as BookingRow[])
      : prisma.booking.findMany({
          where: {
            vehicleId: { in: allVehicleIds },
            status: "COMPLETED",
            OR: [
              {
                returnedAt: {
                  gte: resolvedPeriod.comparisonStart,
                  lt: resolvedPeriod.endExclusive,
                },
              },
              {
                returnedAt: null,
                endDate: {
                  gte: resolvedPeriod.comparisonStart,
                  lt: resolvedPeriod.endExclusive,
                },
              },
            ],
          },
          select: {
            vehicleId: true,
            userId: true,
            startDate: true,
            endDate: true,
            mileageStart: true,
            mileageEnd: true,
            pickedUpAt: true,
            returnedAt: true,
            user: { select: { name: true } },
          },
        }) as Promise<BookingRow[]>,
    allVehicleIds.length === 0
      ? Promise.resolve([] as MaintenanceRow[])
      : prisma.maintenance.findMany({
          where: {
            vehicleId: { in: allVehicleIds },
            startDate: {
              gte: resolvedPeriod.start,
              lt: resolvedPeriod.endExclusive,
            },
          },
          select: {
            vehicleId: true,
            maintenanceType: true,
          },
        }) as Promise<MaintenanceRow[]>,
  ])

  const currentBookings = bookingRows.filter((booking) =>
    isDateInPeriod(
      booking.returnedAt || booking.endDate,
      resolvedPeriod.start,
      resolvedPeriod.endExclusive,
    ),
  )
  const previousBookings = bookingRows.filter((booking) =>
    isDateInPeriod(
      booking.returnedAt || booking.endDate,
      resolvedPeriod.comparisonStart,
      resolvedPeriod.comparisonEndExclusive,
    ),
  )

  const aggregateByVehicle = new Map<string, VehicleAggregate>()
  const previousAggregateByVehicle = new Map<string, VehicleAggregate>()
  for (const vehicle of vehicles) {
    aggregateByVehicle.set(
      vehicle.id,
      aggregateVehicle(
        currentBookings.filter((booking) => booking.vehicleId === vehicle.id),
        maintenanceRows.filter((maintenance) => maintenance.vehicleId === vehicle.id),
      ),
    )
    previousAggregateByVehicle.set(
      vehicle.id,
      aggregateVehicle(
        previousBookings.filter((booking) => booking.vehicleId === vehicle.id),
        [],
      ),
    )
  }

  const peerStatsByType = new Map<
    string,
    {
      count: number
      medianUsage: number | null
      medianDistance: number | null
      medianBreakdownRate: number | null
    }
  >()
  for (const vehicleTypeId of new Set(vehicles.map((vehicle) => vehicle.typeId))) {
    const eligible = vehicles
      .filter((vehicle) => vehicle.typeId === vehicleTypeId)
      .map((vehicle) => aggregateByVehicle.get(vehicle.id)!)
      .filter(
        (aggregate) =>
          aggregate.usageCount > 0 &&
          coverage(aggregate.validMileageTrips, aggregate.usageCount) >=
            DATA_COMPLETENESS_THRESHOLD,
      )
    const eligibleBreakdownRates = eligible
      .map(breakdownRate)
      .filter((rate): rate is number => rate !== null)
    peerStatsByType.set(vehicleTypeId, {
      count: eligible.length,
      medianUsage: eligible.length >= 3
        ? median(eligible.map((aggregate) => aggregate.usageCount))
        : null,
      medianDistance: eligible.length >= 3
        ? median(eligible.map((aggregate) => aggregate.totalDistanceKm))
        : null,
      medianBreakdownRate: eligibleBreakdownRates.length >= 3
        ? median(eligibleBreakdownRates)
        : null,
    })
  }

  const historyItems: VehicleHistoryItem[] = targetVehicles.map((vehicle) => {
    const aggregate = aggregateByVehicle.get(vehicle.id)!
    const previous = previousAggregateByVehicle.get(vehicle.id)!
    const peers = peerStatsByType.get(vehicle.typeId)!
    return {
      vehicleId: vehicle.id,
      plateNumber: vehicle.plateNumber,
      vehicleType: vehicle.type.name,
      currentStatus: vehicle.status,
      currentMileage: vehicle.currentMileage,
      usageCount: aggregate.usageCount,
      maintenanceCount: aggregate.maintenanceCount,
      breakdownCount: aggregate.breakdownCount,
      preventiveCount: aggregate.preventiveCount,
      uniqueUsersCount: aggregate.uniqueUserIds.size,
      totalDistanceKm: aggregate.totalDistanceKm,
      validMileageTrips: aggregate.validMileageTrips,
      avgDistancePerTripKm:
        aggregate.validMileageTrips > 0
          ? round(aggregate.totalDistanceKm / aggregate.validMileageTrips)
          : 0,
      breakdownRatePer10kKm: breakdownRate(aggregate),
      previousUsageCount: previous.usageCount,
      usageChangePercent: percentChange(aggregate.usageCount, previous.usageCount),
      peerMedianUsageCount: peers.medianUsage,
      peerMedianDistanceKm: peers.medianDistance,
      peerMedianBreakdownRatePer10kKm: peers.medianBreakdownRate,
      comparableVehicleCount: peers.count,
      lastUsedAt: aggregate.lastUsedAt?.toISOString() || null,
    }
  })

  const targetCurrentBookings = currentBookings.filter((booking) =>
    targetVehicleIds.has(booking.vehicleId),
  )
  const targetPreviousBookings = previousBookings.filter((booking) =>
    targetVehicleIds.has(booking.vehicleId),
  )
  const targetMaintenances = maintenanceRows.filter((maintenance) =>
    targetVehicleIds.has(maintenance.vehicleId),
  )
  const totalDistanceKm = targetCurrentBookings.reduce(
    (sum, booking) => sum + (getDistance(booking) || 0),
    0,
  )
  const validMileageTrips = targetCurrentBookings.filter(
    (booking) => getDistance(booking) !== null,
  ).length
  const actualPickupTrips = targetCurrentBookings.filter(
    (booking) => booking.pickedUpAt !== null,
  ).length
  const classifiedMaintenances = targetMaintenances.filter(
    (maintenance) => maintenance.maintenanceType !== "UNSPECIFIED",
  ).length
  const mileageCoveragePercent = coverage(
    validMileageTrips,
    targetCurrentBookings.length,
  )
  const actualPickupCoveragePercent = coverage(
    actualPickupTrips,
    targetCurrentBookings.length,
  )
  const classifiedMaintenanceCoveragePercent = coverage(
    classifiedMaintenances,
    targetMaintenances.length,
  )
  const hasComparisonData = targetPreviousBookings.length > 0
  const dataLimitations: string[] = []

  if (mileageCoveragePercent < DATA_COMPLETENESS_THRESHOLD) {
    dataLimitations.push(
      `ข้อมูลเลขไมล์ครบ ${mileageCoveragePercent}% ซึ่งต่ำกว่าเกณฑ์ 80%`,
    )
  }
  if (actualPickupCoveragePercent < DATA_COMPLETENESS_THRESHOLD) {
    dataLimitations.push(
      `เวลารับรถจริงครบ ${actualPickupCoveragePercent}% ซึ่งต่ำกว่าเกณฑ์ 80%`,
    )
  }
  if (classifiedMaintenanceCoveragePercent < DATA_COMPLETENESS_THRESHOLD) {
    dataLimitations.push(
      `ประเภทงานซ่อมที่ใช้วิเคราะห์ครบ ${classifiedMaintenanceCoveragePercent}% ซึ่งต่ำกว่าเกณฑ์ 80%`,
    )
  }
  if (!hasComparisonData && targetCurrentBookings.length > 0) {
    dataLimitations.push("ไม่มีข้อมูลการใช้รถในช่วงเปรียบเทียบก่อนหน้า")
  }
  if (
    targetCurrentBookings.some((booking) => booking.returnedAt === null)
  ) {
    dataLimitations.push("เที่ยวข้อมูลเดิมบางรายการใช้เวลาสิ้นสุดการจองแทนเวลาคืนรถจริง")
  }
  if (
    targetVehicles.some(
      (vehicle) => (peerStatsByType.get(vehicle.typeId)?.count || 0) < 3,
    ) && targetCurrentBookings.length > 0
  ) {
    dataLimitations.push("รถประเภทเดียวกันที่มีข้อมูลสมบูรณ์มีน้อยกว่า 3 คัน")
  }

  const vehicleById = new Map(vehicles.map((vehicle) => [vehicle.id, vehicle]))
  const uniqueUsers = new Set(targetCurrentBookings.map((booking) => booking.userId))

  return {
    filters: { vehicleId: filters.vehicleId || null },
    period: {
      startDate: resolvedPeriod.startDate,
      endDate: resolvedPeriod.endDate,
      comparisonStartDate: resolvedPeriod.comparisonStartDate,
      comparisonEndDate: resolvedPeriod.comparisonEndDate,
      dayCount: resolvedPeriod.dayCount,
    },
    totals: {
      vehicleCount: targetVehicles.length,
      tripCount: targetCurrentBookings.length,
      totalDistanceKm,
      validMileageTrips,
      uniqueUsersCount: uniqueUsers.size,
      maintenanceCount: targetMaintenances.length,
      breakdownCount: targetMaintenances.filter(
        (maintenance) => maintenance.maintenanceType === "BREAKDOWN",
      ).length,
      preventiveCount: targetMaintenances.filter(
        (maintenance) => maintenance.maintenanceType === "PREVENTIVE",
      ).length,
      previousTripCount: targetPreviousBookings.length,
      tripCountChangePercent: percentChange(
        targetCurrentBookings.length,
        targetPreviousBookings.length,
      ),
    },
    vehicles: historyItems,
    users: buildUserMetrics(
      targetCurrentBookings,
      targetPreviousBookings,
      vehicleById,
    ),
    peakUsage: buildPeakUsage(targetCurrentBookings),
    dataCompleteness: {
      mileageCoveragePercent,
      actualPickupCoveragePercent,
      classifiedMaintenanceCoveragePercent,
      hasComparisonData,
      hasSufficientMileageData:
        mileageCoveragePercent >= DATA_COMPLETENESS_THRESHOLD,
      hasSufficientPickupData:
        actualPickupCoveragePercent >= DATA_COMPLETENESS_THRESHOLD,
    },
    dataLimitations,
  }
}
