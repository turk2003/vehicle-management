import { prisma } from "./prisma"

/**
 * Sync สถานะรถทั้งหมดตามเวลาจริง
 * - Booking APPROVED + startDate ถึงแล้ว → รถเป็น BOOKED
 * - Booking APPROVED + endDate ผ่านแล้ว  → รถกลับเป็น AVAILABLE
 * - Maintenance IN_PROGRESS + startDate ถึงแล้ว → รถเป็น MAINTENANCE
 * - Maintenance COMPLETED / endDate ผ่านแล้ว → รถกลับเป็น AVAILABLE
 */
export async function syncAllVehicleStatuses() {
  const now = new Date()

  // ────────────────────────────────────────────────────────────
  // 1. Maintenance: REPORTED → IN_PROGRESS (ถึงวันแล้ว)
  // ────────────────────────────────────────────────────────────
  const shouldStart = await prisma.maintenance.findMany({
    where: { status: "REPORTED", startDate: { lte: now } },
    select: { id: true, vehicleId: true }
  })
  if (shouldStart.length > 0) {
    await prisma.maintenance.updateMany({
      where: { id: { in: shouldStart.map(m => m.id) } },
      data: { status: "IN_PROGRESS" }
    })
  }

  // ────────────────────────────────────────────────────────────
  // 2. Maintenance: IN_PROGRESS → COMPLETED (endDate ผ่านแล้ว)
  // ────────────────────────────────────────────────────────────
  const shouldComplete = await prisma.maintenance.findMany({
    where: { status: "IN_PROGRESS", endDate: { not: null, lte: now } },
    select: { id: true, vehicleId: true }
  })
  if (shouldComplete.length > 0) {
    await prisma.maintenance.updateMany({
      where: { id: { in: shouldComplete.map(m => m.id) } },
      data: { status: "COMPLETED" }
    })
  }

  // ────────────────────────────────────────────────────────────
  // 3. รถที่ Booking APPROVED กำลังใช้งานอยู่จริง → BOOKED
  // ────────────────────────────────────────────────────────────
  const activeBookings = await prisma.booking.findMany({
    where: {
      status: "APPROVED",
      startDate: { lte: now },
      endDate: { gte: now }
    },
    select: { vehicleId: true }
  })
  if (activeBookings.length > 0) {
    const ids = [...new Set(activeBookings.map(b => b.vehicleId))]
    await prisma.vehicle.updateMany({
      where: { id: { in: ids }, status: "AVAILABLE" },
      data: { status: "BOOKED" }
    })
  }

  // ────────────────────────────────────────────────────────────
  // 4. รถที่ Maintenance IN_PROGRESS กำลังซ่อมอยู่ → MAINTENANCE
  // ────────────────────────────────────────────────────────────
  const activeMaint = await prisma.maintenance.findMany({
    where: {
      status: "IN_PROGRESS",
      startDate: { lte: now },
      OR: [{ endDate: null }, { endDate: { gte: now } }]
    },
    select: { vehicleId: true }
  })
  if (activeMaint.length > 0) {
    const ids = [...new Set(activeMaint.map(m => m.vehicleId))]
    await prisma.vehicle.updateMany({
      where: { id: { in: ids }, status: { not: "MAINTENANCE" } },
      data: { status: "MAINTENANCE" }
    })
  }

  // ────────────────────────────────────────────────────────────
  // 5. รถที่ BOOKED หรือ MAINTENANCE แต่ไม่มี active อีกแล้ว → AVAILABLE
  // ────────────────────────────────────────────────────────────
  const occupiedVehicles = await prisma.vehicle.findMany({
    where: { status: { in: ["BOOKED", "MAINTENANCE"] } },
    select: { id: true, status: true }
  })

  for (const v of occupiedVehicles) {
    const hasActiveBooking = await prisma.booking.findFirst({
      where: {
        vehicleId: v.id,
        status: "APPROVED",
        startDate: { lte: now },
        endDate: { gte: now }
      }
    })
    const hasActiveMaint = await prisma.maintenance.findFirst({
      where: {
        vehicleId: v.id,
        status: "IN_PROGRESS",
        startDate: { lte: now },
        OR: [{ endDate: null }, { endDate: { gte: now } }]
      }
    })

    if (!hasActiveBooking && !hasActiveMaint) {
      await prisma.vehicle.update({
        where: { id: v.id },
        data: { status: "AVAILABLE" }
      })
    } else if (hasActiveMaint && v.status !== "MAINTENANCE") {
      // maintenance มี priority สูงกว่า booking
      await prisma.vehicle.update({
        where: { id: v.id },
        data: { status: "MAINTENANCE" }
      })
    }
  }
}
