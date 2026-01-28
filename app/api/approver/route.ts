import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import jwt from "jsonwebtoken"

// Helper function to get token
function getToken(req: NextRequest) {
  let token = req.cookies.get("token")?.value
  
  if (!token) {
    const authHeader = req.headers.get("authorization")
    if (authHeader && authHeader.startsWith("Bearer ")) {
      token = authHeader.substring(7)
    }
  }
  
  return token
}

// Helper function to verify approver
function verifyApprover(req: NextRequest) {
  const token = getToken(req)
  if (!token) throw new Error("No token")
  
  const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any
  if (decoded.role !== "APPROVER" && decoded.role !== "ADMIN") {
    throw new Error("Not authorized")
  }
  
  return decoded
}

// GET: list pending bookings for approval
export async function GET(req: NextRequest) {
  try {
    const decoded = verifyApprover(req)
    const { searchParams } = new URL(req.url)
    const status = searchParams.get('status') || 'PENDING'

    const bookings = await prisma.booking.findMany({
      where: {
        status: status as any
      },
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
  } catch (error: any) {
    console.error("Get bookings error:", error)
    if (error.message === "No token" || error.message === "Not authorized") {
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
      include: {
        vehicle: true,
        user: true
      }
    })

    if (!existingBooking) {
      return NextResponse.json({ message: "Booking not found" }, { status: 404 })
    }

    if (existingBooking.status !== "PENDING") {
      return NextResponse.json({ message: "Booking is not pending" }, { status: 400 })
    }

    // Update booking
    const updatedBooking = await prisma.booking.update({
      where: { id },
      data: {
        status: action,
        approverId: decoded.userId,
        // You can add a comment field to schema if needed
      },
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
      }
    })

    // If approved, update vehicle status to BOOKED
    if (action === "APPROVED") {
      await prisma.vehicle.update({
        where: { id: existingBooking.vehicleId },
        data: { status: "BOOKED" }
      })
    }

    // Create notification for user
    await prisma.notification.create({
      data: {
        userId: existingBooking.userId,
        type: "BOOKING",
        message: action === "APPROVED" 
          ? `การจองรถ ${existingBooking.vehicle.plateNumber} ได้รับการอนุมัติแล้ว`
          : `การจองรถ ${existingBooking.vehicle.plateNumber} ถูกปฏิเสธ`,
        bookingId: id
      }
    })

    return NextResponse.json(updatedBooking)
  } catch (error: any) {
    console.error("Update booking error:", error)
    if (error.message === "No token" || error.message === "Not authorized") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }
    return NextResponse.json({ message: "Server error" }, { status: 500 })
  }
}