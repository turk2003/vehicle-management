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

// Helper function to verify admin
function verifyAdmin(req: NextRequest) {
  const token = getToken(req)
  if (!token) throw new Error("No token")
  
  const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any
  if (decoded.role !== "ADMIN") {
    throw new Error("Not authorized")
  }
  
  return decoded
}

// GET: list all bookings with filters
export async function GET(req: NextRequest) {
  try {
    const decoded = verifyAdmin(req)
    const { searchParams } = new URL(req.url)
    
    const status = searchParams.get('status')
    const userId = searchParams.get('userId')
    const vehicleId = searchParams.get('vehicleId')
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')

    // Build where clause
    let whereClause: any = {}

    if (status) {
      whereClause.status = status
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
  } catch (error: any) {
    console.error("Get bookings error:", error)
    if (error.message === "No token" || error.message === "Not authorized") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }
    return NextResponse.json({ message: "Server error" }, { status: 500 })
  }
}

// PUT: update booking status (Admin override)
export async function PUT(req: NextRequest) {
  try {
    const decoded = verifyAdmin(req)
    const { id, status, comment } = await req.json()

    if (!id || !status) {
      return NextResponse.json({ message: "Missing required fields" }, { status: 400 })
    }

    const validStatuses = ["PENDING", "APPROVED", "REJECTED", "CANCELLED"]
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
        approverId: status === "APPROVED" ? decoded.userId : null
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
    } else if (existingBooking.status === "APPROVED" && status !== "APPROVED") {
      // If changing from approved to something else, make vehicle available
      await prisma.vehicle.update({
        where: { id: existingBooking.vehicleId },
        data: { status: "AVAILABLE" }
      })
    }

    // Create notification for user
    const statusMessages = {
      APPROVED: "ได้รับการอนุมัติแล้ว",
      REJECTED: "ถูกปฏิเสธ",
      CANCELLED: "ถูกยกเลิก",
      PENDING: "อยู่ระหว่างการพิจารณา"
    }

    await prisma.notification.create({
      data: {
        userId: existingBooking.userId,
        type: "BOOKING",
        message: `การจองรถ ${existingBooking.vehicle.plateNumber} ${statusMessages[status as keyof typeof statusMessages]}`,
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

// DELETE: delete booking
export async function DELETE(req: NextRequest) {
  try {
    const decoded = verifyAdmin(req)
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
    if (existingBooking.status === "APPROVED") {
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
  } catch (error: any) {
    console.error("Delete booking error:", error)
    if (error.message === "No token" || error.message === "Not authorized") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }
    return NextResponse.json({ message: "Server error" }, { status: 500 })
  }
}