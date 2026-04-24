import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { verifyUser } from "@/lib/auth"

/**
 * GET /api/vehicles/recommend
 * แนะนำรถที่เหมาะสมที่สุดตามเลขไมล์น้อย + ประวัติซ่อมน้อย
 * Query params: startDate, endDate, vehicleTypeId (optional)
 */
export async function GET(req: NextRequest) {
  try {
    verifyUser(req)
    const { searchParams } = new URL(req.url)

    const startDate = searchParams.get("startDate")
    const endDate = searchParams.get("endDate")
    const vehicleTypeId = searchParams.get("vehicleTypeId")

    // ดึงรถที่ไม่ได้อยู่ระหว่างซ่อม
    let vehicles = await prisma.vehicle.findMany({
      where: {
        status: { in: ["AVAILABLE", "BOOKED"] },
        ...(vehicleTypeId && { typeId: vehicleTypeId })
      },
      include: { type: true }
    })

    // กรองรถที่ว่างในช่วงเวลาที่ต้องการ
    if (startDate && endDate) {
      const start = new Date(startDate)
      const end = new Date(endDate)

      // เช็ค booking ที่ทับช่วงเวลา
      const conflictingBookings = await prisma.booking.findMany({
        where: {
          status: { in: ["PENDING", "APPROVED", "IN_PROGRESS"] },
          startDate: { lte: end },
          endDate: { gte: start }
        },
        select: { vehicleId: true }
      })

      // เช็ค maintenance ที่ทับช่วงเวลา
      const conflictingMaintenances = await prisma.maintenance.findMany({
        where: {
          status: { in: ["REPORTED", "IN_PROGRESS"] },
          startDate: { lte: end },
          OR: [{ endDate: null }, { endDate: { gte: start } }]
        },
        select: { vehicleId: true }
      })

      const conflictIds = [
        ...conflictingBookings.map(b => b.vehicleId),
        ...conflictingMaintenances.map(m => m.vehicleId)
      ]

      vehicles = vehicles.filter(v => !conflictIds.includes(v.id))
    }

    // คำนวณ recommendation score สำหรับแต่ละคัน
    const vehicleIds = vehicles.map(v => v.id)

    // นับจำนวนครั้งที่ซ่อมของแต่ละคัน
    const maintenanceCounts = await prisma.maintenance.groupBy({
      by: ["vehicleId"],
      where: { vehicleId: { in: vehicleIds } },
      _count: { id: true }
    })

    const maintenanceMap = new Map(
      maintenanceCounts.map(m => [m.vehicleId, m._count.id])
    )

    // คำนวณ score: currentMileage + (maintenanceCount × 10000)
    // score ยิ่งน้อย = แนะนำมาก
    const scoredVehicles = vehicles.map(v => {
      const maintenanceCount = maintenanceMap.get(v.id) || 0
      const score = v.currentMileage + (maintenanceCount * 10000)

      return {
        ...v,
        maintenanceCount,
        score
      }
    })

    // เรียงจาก score น้อยสุด (แนะนำมากสุด)
    scoredVehicles.sort((a, b) => a.score - b.score)

    // Mark อันดับ 1 เป็น recommended
    const result = scoredVehicles.map((v, index) => ({
      ...v,
      recommended: index === 0 && scoredVehicles.length > 0
    }))

    return NextResponse.json(result)
  } catch (error) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
  }
}
