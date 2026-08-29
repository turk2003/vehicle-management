import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { verifyAdmin } from "@/lib/auth"
import { notifyBookingEvent } from "@/lib/email/bookingNotifications"
import type { BookingEmailEvent } from "@/lib/email/templates"
import { BookingStatus } from "@/app/generated/prisma/client"

// GET: list all bookings with filters
export async function GET(req: NextRequest) {
  try {
    await verifyAdmin(req)
    const { searchParams } = new URL(req.url)

    const status = searchParams.get('status')
    const userId = searchParams.get('userId')
    const vehicleId = searchParams.get('vehicleId')
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')

    // Build where clause
    const whereClause: {
      status?: BookingStatus
      userId?: string
      vehicleId?: string
      startDate?: {
        gte: Date
        lte: Date
      }
    } = {}

    if (status) {
      whereClause.status = status as BookingStatus
    }

    if (userId) {
      whereClause.userId = userId
    }

    if (vehicleId) {
      whereClause.vehicleId = vehicleId
    }

    if (startDate && endDate) {
      whereClause.startDate = {
        gte: new Date(startDate),
        lte: new Date(endDate)
      }
    }

    const bookings = await prisma.booking.findMany({
      where: whereClause,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true
          }
        },
        vehicle: {
          include: {
            type: true
          }
        },
        approver: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json(bookings)
  } catch (error: unknown) {
    console.error("Get bookings error:", error)
    if (error instanceof Error && (error.message === "No token" || error.message === "Not authorized")) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }
    return NextResponse.json({ message: "Server error" }, { status: 500 })
  }
}

// PUT: update booking status (Admin override)
export async function PUT(req: NextRequest) {
  try {
    const decoded = await verifyAdmin(req)
    const { id, status, comment } = await req.json()

    if (!id || !status) {
      return NextResponse.json({ message: "Missing required fields" }, { status: 400 })
    }

    const validStatuses = ["PENDING", "APPROVED", "REJECTED", "CANCELLED", "IN_PROGRESS", "COMPLETED"]
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ message: "Invalid status" }, { status: 400 })
    }

    // Get existing booking
    const existingBooking = await prisma.booking.findUnique({
      where: { id },
      include: {
        vehicle: true,
        user: true
      }
    })

    if (!existingBooking) {
      return NextResponse.json({ message: "Booking not found" }, { status: 404 })
    }

    // Update booking
    const updatedBooking = await prisma.booking.update({
      where: { id },
      data: {
        status,
        approverId: status === "APPROVED" ? decoded.userId : existingBooking.approverId
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true
          }
        },
        vehicle: {
          include: {
            type: true
          }
        },
        approver: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    })

    // Update vehicle status based on booking status
    if (status === "APPROVED") {
      await prisma.vehicle.update({
        where: { id: existingBooking.vehicleId },
        data: { status: "BOOKED" }
      })
    } else if (
      ["APPROVED", "CHANGED"].includes(existingBooking.status) &&
      !["APPROVED", "CHANGED"].includes(status)
    ) {
      // If changing from approved to something else, make vehicle available
      await prisma.vehicle.update({
        where: { id: existingBooking.vehicleId },
        data: { status: "AVAILABLE" }
      })
    }

    const statusMessages = {
      APPROVED: "ได้รับการอนุมัติแล้ว",
      REJECTED: "ถูกปฏิเสธ",
      CANCELLED: "ถูกยกเลิก",
      PENDING: "อยู่ระหว่างการพิจารณา",
      IN_PROGRESS: "เริ่มใช้งานแล้ว",
      COMPLETED: "เสร็จสิ้นแล้ว"
    }

    const emailEvents: Partial<Record<string, BookingEmailEvent>> = {
      APPROVED: "APPROVED",
      REJECTED: "REJECTED",
      CANCELLED: "CANCELLED"
    }

    const emailEvent = emailEvents[status]
    if (emailEvent) {
      await notifyBookingEvent({
        event: emailEvent,
        booking: updatedBooking,
        message: `การจองรถ ${existingBooking.vehicle.plateNumber} ${statusMessages[status as keyof typeof statusMessages]}`,
        emailOptions: { comment }
      })
    } else {
      await prisma.notification.create({
        data: {
          userId: existingBooking.userId,
          type: "BOOKING",
          message: `การจองรถ ${existingBooking.vehicle.plateNumber} ${statusMessages[status as keyof typeof statusMessages]}`,
          bookingId: id
        }
      })
    }

    return NextResponse.json(updatedBooking)
  } catch (error: unknown) {
    console.error("Update booking error:", error)
    if (error instanceof Error && (error.message === "No token" || error.message === "Not authorized")) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }
    return NextResponse.json({ message: "Server error" }, { status: 500 })
  }
}

// DELETE: delete booking
export async function DELETE(req: NextRequest) {
  try {
    await verifyAdmin(req)
    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ message: "Missing booking ID" }, { status: 400 })
    }

    // Get existing booking
    const existingBooking = await prisma.booking.findUnique({
      where: { id },
      include: { vehicle: true }
    })

    if (!existingBooking) {
      return NextResponse.json({ message: "Booking not found" }, { status: 404 })
    }

    // If booking was approved, make vehicle available again
    if (["APPROVED", "CHANGED"].includes(existingBooking.status)) {
      await prisma.vehicle.update({
        where: { id: existingBooking.vehicleId },
        data: { status: "AVAILABLE" }
      })
    }

    // Delete booking
    await prisma.booking.delete({
      where: { id }
    })

    return NextResponse.json({ message: "Booking deleted successfully" })
  } catch (error: unknown) {
    console.error("Delete booking error:", error)
    if (error instanceof Error && (error.message === "No token" || error.message === "Not authorized")) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }
    return NextResponse.json({ message: "Server error" }, { status: 500 })
  }
}
