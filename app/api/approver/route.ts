import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { verifyApprover } from "@/lib/auth"
import { notifyBookingEvent } from "@/lib/email/bookingNotifications"
import { BookingStatus } from "@/app/generated/prisma/client"

const bookingInclude = {
  user: {
    select: {
      id: true,
      name: true,
      email: true
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
} as const

// GET: list pending bookings for approval
export async function GET(req: NextRequest) {
  try {
    verifyApprover(req)
    const { searchParams } = new URL(req.url)
    const statusParam = searchParams.get('status') || 'PENDING'

    // Build where clause based on status
    const whereClause: { status?: BookingStatus } = {}
    
    // If status is not ALL, filter by that specific status
    if (statusParam !== 'ALL') {
      whereClause.status = statusParam as BookingStatus
    }

    const bookings = await prisma.booking.findMany({
      where: whereClause,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
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

// PUT: approve or reject booking
export async function PUT(req: NextRequest) {
  try {
    const decoded = verifyApprover(req)
    const { id, action, comment } = await req.json()

    if (!id || !action) {
      return NextResponse.json({ message: "Missing required fields" }, { status: 400 })
    }

    if (!["APPROVED", "REJECTED"].includes(action)) {
      return NextResponse.json({ message: "Invalid action" }, { status: 400 })
    }

    // Get booking
    const existingBooking = await prisma.booking.findUnique({
      where: { id },
      include: bookingInclude
    })

    if (!existingBooking) {
      return NextResponse.json({ message: "Booking not found" }, { status: 404 })
    }

    if (existingBooking.status !== "PENDING") {
      if (existingBooking.status === action && existingBooking.approverId === decoded.userId) {
        return NextResponse.json(existingBooking)
      }

      return NextResponse.json({
        message: "รายการนี้ถูกดำเนินการไปแล้ว",
        status: existingBooking.status
      }, { status: 409 })
    }

    // Update booking
    const updatedBooking = await prisma.booking.update({
      where: { id },
      data: {
        status: action,
        approverId: decoded.userId,
        ...(action === "REJECTED" && comment ? { rejectionReason: comment } : {})
      },
      include: bookingInclude
    })

    // If approved, update vehicle status to BOOKED
    if (action === "APPROVED") {
      await prisma.vehicle.update({
        where: { id: existingBooking.vehicleId },
        data: { status: "BOOKED" }
      })
    }

    await notifyBookingEvent({
      event: action,
      booking: updatedBooking,
      emailOptions: { comment }
    })

    // Create execution log for the approver
    await prisma.log.create({
      data: {
        userId: decoded.userId,
        action: `${action === "APPROVED" ? "Approved" : "Rejected"} booking ${id} for vehicle ${existingBooking.vehicle.plateNumber}`
      }
    })

    return NextResponse.json(updatedBooking)
  } catch (error: unknown) {
    console.error("Update booking error:", error)
    if (error instanceof Error && (error.message === "No token" || error.message === "Not authorized")) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }
    return NextResponse.json({ message: "Server error" }, { status: 500 })
  }
}
