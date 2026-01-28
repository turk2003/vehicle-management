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

// Helper function to verify user
function verifyUser(req: NextRequest) {
  const token = getToken(req)
  if (!token) throw new Error("No token")
  
  const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any
  return decoded
}

// GET: handle both available vehicles and user bookings
export async function GET(req: NextRequest) {
  try {
    const decoded = verifyUser(req)
    const { searchParams } = new URL(req.url)
    const action = searchParams.get('action')

    // If requesting user's bookings
    if (action === 'my-bookings') {
      const bookings = await prisma.booking.findMany({
        where: {
          userId: decoded.userId
        },
        include: {
          vehicle: {
            include: {
              type: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        }
      })

      return NextResponse.json(bookings)
    }

    // Default: return available vehicles for booking
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')
    const vehicleTypeId = searchParams.get('vehicleTypeId')

    // Build where clause
    let whereClause: any = {
      status: "AVAILABLE"
    }

    if (vehicleTypeId) {
      whereClause.typeId = vehicleTypeId
    }

    // Get vehicles
    let availableVehicles = await prisma.vehicle.findMany({
      where: whereClause,
      include: {
        type: true,
      }
    })

    // If date range is provided, check for conflicts
    if (startDate && endDate) {
      const conflictingBookings = await prisma.booking.findMany({
        where: {
          status: {
            in: ["PENDING", "APPROVED"]
          },
          OR: [
            {
              startDate: {
                lte: new Date(endDate)
              },
              endDate: {
                gte: new Date(startDate)
              }
            }
          ]
        },
        select: {
          vehicleId: true
        }
      })

      // ✅ แก้ไข: เพิ่ม type annotation
      const conflictingVehicleIds = conflictingBookings.map((b: { vehicleId: string }) => b.vehicleId)
      
      // ✅ แก้ไข: เพิ่ม type annotation
      availableVehicles = availableVehicles.filter(
        (vehicle: any) => !conflictingVehicleIds.includes(vehicle.id)
      )
    }

    return NextResponse.json(availableVehicles)
  } catch (error) {
    console.error("Get bookings/vehicles error:", error)
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
  }
}

// POST: create booking
export async function POST(req: NextRequest) {
  try {
    const decoded = verifyUser(req)
    const { vehicleId, startDate, endDate, purpose, destination } = await req.json()

    // Validate input
    if (!vehicleId || !startDate || !endDate || !purpose) {
      return NextResponse.json({ message: "Missing required fields" }, { status: 400 })
    }

    const start = new Date(startDate)
    const end = new Date(endDate)
    const now = new Date()

    // Validate dates
    if (start >= end) {
      return NextResponse.json({ message: "End date must be after start date" }, { status: 400 })
    }

    if (start < now) {
      return NextResponse.json({ message: "Cannot book in the past" }, { status: 400 })
    }

    // Check vehicle availability
    const vehicle = await prisma.vehicle.findUnique({
      where: { id: vehicleId },
      include: { type: true }
    })

    if (!vehicle) {
      return NextResponse.json({ message: "Vehicle not found" }, { status: 404 })
    }

    if (vehicle.status !== "AVAILABLE") {
      return NextResponse.json({ message: "Vehicle not available" }, { status: 400 })
    }

    // Check for conflicting bookings
    const conflictingBooking = await prisma.booking.findFirst({
      where: {
        vehicleId,
        status: {
          in: ["PENDING", "APPROVED"]
        },
        OR: [
          {
            startDate: {
              lte: end
            },
            endDate: {
              gte: start
            }
          }
        ]
      }
    })

    if (conflictingBooking) {
      return NextResponse.json({ 
        message: "Vehicle is already booked for this time period" 
      }, { status: 409 })
    }

    const booking = await prisma.booking.create({
      data: {
        userId: decoded.userId,
        vehicleId,
        startDate: start,
        endDate: end,
        purpose,
        status: "PENDING"
      },
      include: {
        vehicle: {
          include: {
            type: true
          }
        },
        user: {
          select: {
            name: true,
            email: true
          }
        }
      }
    })

    return NextResponse.json(booking)
  } catch (error: any) {
    console.error("Create booking error:", error)
    return NextResponse.json({ message: "Server error" }, { status: 500 })
  }
}