import { NextRequest, NextResponse } from "next/server"
import { accessErrorResponse, requireAccess } from "@/lib/permissions"
import { PickupError, pickUpBooking } from "@/lib/booking/pickup"

/**
 * PUT /api/admin/bookings/pickup
 * Admin กดรับรถ — บันทึกเลขไมล์เริ่มต้น + เปลี่ยนสถานะ
 * ถ้าคนก่อนหน้ายังไม่กดคืน ระบบจะปิดการจองนั้นให้อัตโนมัติ
 */
export async function PUT(req: NextRequest) {
  try {
    const decoded = await requireAccess(req, {
      roles: ["ADMIN"],
      permission: "BOOKING_MANAGE",
    })
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

    const { booking, autoReturned } = await pickUpBooking({
      bookingId,
      mileageStart,
      actorUserId: decoded.userId,
      logLabel: "Picked up",
    })

    return NextResponse.json({
      ...booking,
      autoReturnedCount: autoReturned.length,
    })
  } catch (error: unknown) {
    if (error instanceof PickupError) {
      return NextResponse.json({ message: error.message }, { status: error.status })
    }
    console.error("Pickup error:", error)
    const accessResponse = accessErrorResponse(error)
    if (accessResponse) return accessResponse
    return NextResponse.json({ message: "Server error" }, { status: 500 })
  }
}
