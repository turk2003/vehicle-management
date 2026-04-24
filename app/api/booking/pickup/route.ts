import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { verifyUser } from "@/lib/auth"

/**
 * PUT /api/booking/pickup
 * User กดรับรถ — บันทึกเลขไมล์เริ่มต้น + เปลี่ยนสถานะ
 */
export async function PUT(req: NextRequest) {
  try {
    const decoded = verifyUser(req)
    const { bookingId, mileageStart } = await req.json()

    if (!bookingId || mileageStart === undefined || mileageStart === null) {
      return NextResponse.json(
        { message: "กรุณาระบุ booking ID และเลขไมล์เริ่มต้น" },
        { status: 400 }
      )
    }

    if (typeof mileageStart !== "number" || mileageStart < 0) {
      return NextResponse.json(
        { message: "เลขไมล์ต้องเป็นตัวเลขที่ไม่ติดลบ" },
        { status: 400 }
      )
    }

    // ดึง booking
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: { vehicle: true }
    })

    if (!booking) {
      return NextResponse.json({ message: "ไม่พบการจอง" }, { status: 404 })
    }

    // ตรวจสอบว่าคนที่กดรับรถ คือคนเดียวกับเจ้าของการจอง
    if (booking.userId !== decoded.userId) {
      return NextResponse.json({ message: "ไม่มีสิทธิ์ทำรายการนี้" }, { status: 403 })
    }

    if (booking.status !== "APPROVED") {
      return NextResponse.json(
        { message: "สามารถรับรถได้เฉพาะการจองที่อนุมัติแล้วเท่านั้น" },
        { status: 400 }
      )
    }

    // Validate mileageStart >= vehicle.currentMileage
    if (mileageStart < booking.vehicle.currentMileage) {
      return NextResponse.json(
        { message: `เลขไมล์เริ่มต้นต้องไม่น้อยกว่าเลขไมล์ปัจจุบันของรถ (${booking.vehicle.currentMileage} km)` },
        { status: 400 }
      )
    }

    // อัปเดต booking → IN_PROGRESS
    const updatedBooking = await prisma.booking.update({
      where: { id: bookingId },
      data: {
        status: "IN_PROGRESS",
        mileageStart,
        pickedUpAt: new Date()
      }
    })

    // อัปเดตสถานะรถ → IN_USE
    await prisma.vehicle.update({
      where: { id: booking.vehicleId },
      data: { status: "IN_USE" }
    })

    // สร้าง log
    await prisma.log.create({
      data: {
        userId: decoded.userId,
        action: `User picked up vehicle ${booking.vehicle.plateNumber} for booking ${bookingId}, mileage: ${mileageStart} km`
      }
    })

    return NextResponse.json(updatedBooking)
  } catch (error: any) {
    console.error("Pickup error:", error)
    if (error.message === "No token" || error.message === "Not authorized") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }
    return NextResponse.json({ message: "Server error" }, { status: 500 })
  }
}
