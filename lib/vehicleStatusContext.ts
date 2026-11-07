import { prisma } from "./prisma"

/**
 * สิ่งที่ทำให้รถมีสถานะปัจจุบัน (งานซ่อมที่ค้าง / การจองที่รับรถแล้ว / การจองในช่วงเวลานี้)
 * ใช้ในหน้าจัดการรถเพื่ออธิบายสถานะ และบอกว่าต้องปิดอะไรถึงจะเปลี่ยนสถานะได้
 * เงื่อนไขต้องตรงกับ syncAllVehicleStatuses
 */
export async function getVehicleStatusContexts(vehicleIds: string[]) {
  if (vehicleIds.length === 0) return {}
  const now = new Date()

  const [maintenances, inProgressBookings, scheduledBookings] = await Promise.all([
    prisma.maintenance.findMany({
      where: {
        vehicleId: { in: vehicleIds },
        status: { in: ["REPORTED", "IN_PROGRESS"] },
        startDate: { lte: now },
        OR: [{ endDate: null }, { endDate: { gte: now } }]
      },
      select: { id: true, vehicleId: true, description: true, maintenanceType: true, startDate: true },
      orderBy: { startDate: "asc" }
    }),
    prisma.booking.findMany({
      where: { vehicleId: { in: vehicleIds }, status: "IN_PROGRESS" },
      select: {
        id: true,
        vehicleId: true,
        endDate: true,
        pickedUpAt: true,
        mileageStart: true,
        user: { select: { name: true } }
      },
      orderBy: { pickedUpAt: "asc" }
    }),
    prisma.booking.findMany({
      where: {
        vehicleId: { in: vehicleIds },
        status: { in: ["APPROVED", "CHANGED"] },
        startDate: { lte: now },
        endDate: { gte: now }
      },
      select: {
        id: true,
        vehicleId: true,
        startDate: true,
        endDate: true,
        user: { select: { name: true } }
      },
      orderBy: { startDate: "asc" }
    })
  ])

  return Object.fromEntries(
    vehicleIds.map((vehicleId) => [
      vehicleId,
      {
        activeMaintenances: maintenances.filter((m) => m.vehicleId === vehicleId),
        inProgressBookings: inProgressBookings.filter((b) => b.vehicleId === vehicleId),
        scheduledBookings: scheduledBookings.filter((b) => b.vehicleId === vehicleId)
      }
    ])
  )
}
