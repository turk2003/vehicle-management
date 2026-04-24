import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { verifyAdmin } from "@/lib/auth"

/**
 * PUT /api/admin/bookings/return
 * Admin กดคืนรถ — บันทึกเลขไมล์สิ้นสุด + เปลี่ยนสถานะ
 */
export async function PUT(req: NextRequest) {
  try {
    const decoded = verifyAdmin(req)
    const { bookingId, mileageEnd } = await req.json()

    if (!bookingId || mileageEnd === undefined || mileageEnd === null) {
      return NextResponse.json(
        { message: "กรุณาระบุ booking ID และเลขไมล์สิ้นสุด" },
        { status: 400 }
      )
    }

    if (typeof mileageEnd !== "number" || mileageEnd < 0) {
      return NextResponse.json(
        { message: "เลขไมล์ต้องเป็นตัวเลขที่ไม่ติดลบ" },
        { status: 400 }
      )
    }

    // ดึง booking
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: { vehicle: true, user: true }
    })

    if (!booking) {
      return NextResponse.json({ message: "ไม่พบการจอง" }, { status: 404 })
    }

    if (booking.status !== "IN_PROGRESS") {
      return NextResponse.json(
        { message: "สามารถคืนรถได้เฉพาะการจองที่กำลังใช้งานอยู่เท่านั้น" },
        { status: 400 }
      )
    }

    // Validate mileageEnd >= mileageStart
    if (booking.mileageStart !== null && mileageEnd < booking.mileageStart) {
      return NextResponse.json(
        { message: `เลขไมล์สิ้นสุดต้องไม่น้อยกว่าเลขไมล์เริ่มต้น (${booking.mileageStart} km)` },
        { status: 400 }
      )
    }

    // อัปเดต booking → COMPLETED
    const updatedBooking = await prisma.booking.update({
      where: { id: bookingId },
      data: {
        status: "COMPLETED",
        mileageEnd,
        returnedAt: new Date()
      },
      include: {
        user: { select: { id: true, name: true, email: true } },
        vehicle: { include: { type: true } },
        approver: { select: { id: true, name: true, email: true } }
      }
    })

    // อัปเดต vehicle: currentMileage + check ว่ามี booking/maintenance อื่นหรือไม่
    const now = new Date()

    // เช็คว่ามี booking IN_PROGRESS อื่นอีกไหม
    const otherActiveBooking = await prisma.booking.findFirst({
      where: {
        vehicleId: booking.vehicleId,
        id: { not: bookingId },
        status: "IN_PROGRESS"
      }
    })

    // เช็คว่ามี maintenance active อยู่ไหม
    const activeMaintenance = await prisma.maintenance.findFirst({
      where: {
        vehicleId: booking.vehicleId,
        status: "IN_PROGRESS",
        startDate: { lte: now },
        OR: [{ endDate: null }, { endDate: { gte: now } }]
      }
    })

    let newVehicleStatus: "AVAILABLE" | "IN_USE" | "BOOKED" | "MAINTENANCE" = "AVAILABLE"
    if (activeMaintenance) {
      newVehicleStatus = "MAINTENANCE"
    } else if (otherActiveBooking) {
      newVehicleStatus = "IN_USE"
    } else {
      // เช็คว่ามี booking APPROVED ที่อยู่ในช่วงเวลาไหม
      const activeApprovedBooking = await prisma.booking.findFirst({
        where: {
          vehicleId: booking.vehicleId,
          status: "APPROVED",
          startDate: { lte: now },
          endDate: { gte: now }
        }
      })
      newVehicleStatus = activeApprovedBooking ? "BOOKED" : "AVAILABLE"
    }

    await prisma.vehicle.update({
      where: { id: booking.vehicleId },
      data: {
        currentMileage: mileageEnd,
        status: newVehicleStatus
      }
    })

    // สร้าง notification ให้ user
    const distance = booking.mileageStart !== null ? mileageEnd - booking.mileageStart : 0
    await prisma.notification.create({
      data: {
        userId: booking.userId,
        type: "BOOKING",
        message: `คุณได้คืนรถ ${booking.vehicle.plateNumber} แล้ว ระยะทาง: ${distance} km`,
        bookingId
      }
    })

    // สร้าง log
    await prisma.log.create({
      data: {
        userId: decoded.userId,
        action: `Returned vehicle ${booking.vehicle.plateNumber} for booking ${bookingId}, mileage: ${mileageEnd} km, distance: ${distance} km`
      }
    })

    return NextResponse.json(updatedBooking)
  } catch (error: any) {
    console.error("Return error:", error)
    if (error.message === "No token" || error.message === "Not authorized") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }
    return NextResponse.json({ message: "Server error" }, { status: 500 })
  }
}
