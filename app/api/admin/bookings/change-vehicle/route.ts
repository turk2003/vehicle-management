import { NextRequest, NextResponse } from "next/server"
import { Prisma } from "@/app/generated/prisma/client"
import { verifyAdmin } from "@/lib/auth"
import { sendBookingEventEmail } from "@/lib/email/bookingNotifications"
import { prisma } from "@/lib/prisma"

const ACTIVE_BOOKING_STATUSES = ["PENDING", "APPROVED", "CHANGED", "IN_PROGRESS"] as const
const ACTIVE_MAINTENANCE_STATUSES = ["REPORTED", "IN_PROGRESS"] as const

class ChangeVehicleError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly code: string
  ) {
    super(message)
  }
}

function assertReplaceableBooking(booking: {
  status: string
  pickedUpAt: Date | null
  endDate: Date
  vehicle: { status: string }
}) {
  if (!["APPROVED", "CHANGED"].includes(booking.status)) {
    throw new ChangeVehicleError(
      "เปลี่ยนรถได้เฉพาะการจองที่อนุมัติแล้วเท่านั้น",
      409,
      "BOOKING_NOT_REPLACEABLE"
    )
  }
  if (booking.pickedUpAt) {
    throw new ChangeVehicleError(
      "ไม่สามารถเปลี่ยนรถหลังจากรับรถแล้ว",
      409,
      "BOOKING_ALREADY_PICKED_UP"
    )
  }
  if (booking.endDate < new Date()) {
    throw new ChangeVehicleError(
      "ไม่สามารถเปลี่ยนรถสำหรับการจองที่สิ้นสุดแล้ว",
      409,
      "BOOKING_ENDED"
    )
  }
  if (booking.vehicle.status !== "MAINTENANCE") {
    throw new ChangeVehicleError(
      "รถเดิมต้องอยู่ในสถานะซ่อมบำรุงก่อนจึงจะเปลี่ยนรถได้",
      409,
      "ORIGINAL_VEHICLE_NOT_IN_MAINTENANCE"
    )
  }
}

function errorResponse(error: unknown) {
  if (error instanceof ChangeVehicleError) {
    return NextResponse.json(
      { message: error.message, code: error.code },
      { status: error.status }
    )
  }
  if (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    error.code === "P2034"
  ) {
    return NextResponse.json(
      {
        message: "มีผู้ดูแลระบบเปลี่ยนข้อมูลพร้อมกัน กรุณาโหลดข้อมูลแล้วลองใหม่",
        code: "CONCURRENT_CHANGE"
      },
      { status: 409 }
    )
  }
  if (
    error instanceof Error &&
    (error.message === "No token" || error.message === "Not authorized")
  ) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
  }
  console.error("Change vehicle error:", error)
  return NextResponse.json({ message: "Server error" }, { status: 500 })
}

export async function GET(req: NextRequest) {
  try {
    await verifyAdmin(req)
    const bookingId = new URL(req.url).searchParams.get("bookingId")

    if (!bookingId) {
      return NextResponse.json(
        { message: "กรุณาระบุ bookingId" },
        { status: 400 }
      )
    }

    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        user: { select: { id: true, name: true, email: true } },
        vehicle: { include: { type: true } }
      }
    })

    if (!booking) {
      throw new ChangeVehicleError("ไม่พบการจอง", 404, "BOOKING_NOT_FOUND")
    }
    assertReplaceableBooking(booking)

    const candidates = await prisma.vehicle.findMany({
      where: {
        id: { not: booking.vehicleId },
        status: { in: ["AVAILABLE", "BOOKED"] },
        bookings: {
          none: {
            status: { in: [...ACTIVE_BOOKING_STATUSES] },
            startDate: { lte: booking.endDate },
            endDate: { gte: booking.startDate }
          }
        },
        maintenances: {
          none: {
            status: { in: [...ACTIVE_MAINTENANCE_STATUSES] },
            startDate: { lte: booking.endDate },
            OR: [
              { endDate: null },
              { endDate: { gte: booking.startDate } }
            ]
          }
        }
      },
      include: { type: true },
      orderBy: [{ currentMileage: "asc" }, { plateNumber: "asc" }]
    })

    const sortedCandidates = candidates
      .map((vehicle) => ({
        ...vehicle,
        sameType: vehicle.typeId === booking.vehicle.typeId
      }))
      .sort((a, b) => Number(b.sameType) - Number(a.sameType))
      .map((vehicle, index) => ({
        ...vehicle,
        recommended: index === 0
      }))

    return NextResponse.json({ booking, candidates: sortedCandidates })
  } catch (error: unknown) {
    return errorResponse(error)
  }
}

export async function PUT(req: NextRequest) {
  try {
    const decoded = await verifyAdmin(req)
    const body = await req.json()
    const bookingId = typeof body.bookingId === "string" ? body.bookingId : ""
    const newVehicleId = typeof body.newVehicleId === "string" ? body.newVehicleId : ""
    const reason = typeof body.reason === "string" ? body.reason.trim() : ""

    if (!bookingId || !newVehicleId || !reason) {
      return NextResponse.json(
        { message: "กรุณาระบุการจอง รถทดแทน และเหตุผลให้ครบถ้วน" },
        { status: 400 }
      )
    }
    if (reason.length > 500) {
      return NextResponse.json(
        { message: "เหตุผลต้องมีความยาวไม่เกิน 500 ตัวอักษร" },
        { status: 400 }
      )
    }

    const result = await prisma.$transaction(
      async (tx) => {
        const booking = await tx.booking.findUnique({
          where: { id: bookingId },
          include: {
            user: { select: { id: true, name: true, email: true } },
            vehicle: { include: { type: true } }
          }
        })

        if (!booking) {
          throw new ChangeVehicleError("ไม่พบการจอง", 404, "BOOKING_NOT_FOUND")
        }
        assertReplaceableBooking(booking)

        if (booking.vehicleId === newVehicleId) {
          throw new ChangeVehicleError(
            "กรุณาเลือกรถทดแทนที่ไม่ใช่รถคันเดิม",
            400,
            "SAME_VEHICLE"
          )
        }

        const replacement = await tx.vehicle.findFirst({
          where: {
            id: newVehicleId,
            status: { in: ["AVAILABLE", "BOOKED"] },
            bookings: {
              none: {
                status: { in: [...ACTIVE_BOOKING_STATUSES] },
                startDate: { lte: booking.endDate },
                endDate: { gte: booking.startDate }
              }
            },
            maintenances: {
              none: {
                status: { in: [...ACTIVE_MAINTENANCE_STATUSES] },
                startDate: { lte: booking.endDate },
                OR: [
                  { endDate: null },
                  { endDate: { gte: booking.startDate } }
                ]
              }
            }
          },
          include: { type: true }
        })

        if (!replacement) {
          throw new ChangeVehicleError(
            "รถทดแทนไม่ว่างในช่วงเวลาการจอง กรุณาเลือกรถคันอื่น",
            409,
            "REPLACEMENT_UNAVAILABLE"
          )
        }

        const updatedBooking = await tx.booking.update({
          where: { id: booking.id },
          data: {
            vehicleId: replacement.id,
            status: "CHANGED"
          },
          include: {
            user: { select: { id: true, name: true, email: true } },
            vehicle: { include: { type: true } },
            approver: { select: { id: true, name: true, email: true } }
          }
        })

        await tx.vehicle.update({
          where: { id: replacement.id },
          data: { status: "BOOKED" }
        })

        await tx.notification.create({
          data: {
            userId: booking.userId,
            type: "BOOKING",
            message: `การจองรถของคุณถูกเปลี่ยนจาก ${booking.vehicle.plateNumber} เป็น ${replacement.plateNumber}: ${reason}`,
            bookingId: booking.id
          }
        })

        await tx.log.create({
          data: {
            userId: decoded.userId,
            action: `Changed booking ${booking.id} vehicle from ${booking.vehicle.plateNumber} (${booking.vehicleId}) to ${replacement.plateNumber} (${replacement.id}). Reason: ${reason}`
          }
        })

        return {
          booking: updatedBooking,
          previousVehiclePlate: booking.vehicle.plateNumber,
          newVehiclePlate: replacement.plateNumber
        }
      },
      {
        isolationLevel: Prisma.TransactionIsolationLevel.Serializable
      }
    )

    await sendBookingEventEmail("VEHICLE_CHANGED", result.booking, {
      previousVehiclePlate: result.previousVehiclePlate,
      newVehiclePlate: result.newVehiclePlate,
      reason
    })

    return NextResponse.json(result)
  } catch (error: unknown) {
    return errorResponse(error)
  }
}
