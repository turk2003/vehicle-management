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
  if (decoded.role !== "ADMIN") throw new Error("Not admin")
  
  return decoded
}

// GET: list vehicles
export async function GET(req: NextRequest) {
  try {
    const token = getToken(req)
    if (!token) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    // Verify token
    jwt.verify(token, process.env.JWT_SECRET!)
    
    const vehicles = await prisma.vehicle.findMany({
      include: {
        type: true, 
      },
      orderBy: { plateNumber: 'asc' }
    })
    
    console.log("Vehicles with types:", vehicles) 
    
    return NextResponse.json(vehicles)
  } catch (error) {
    console.error("Vehicle fetch error:", error)
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
  }
}

// POST: create vehicle
export async function POST(req: NextRequest) {
  try {
    verifyAdmin(req)
    
    const { plateNumber, typeId, status } = await req.json()
    
    // Check if plate number already exists
    const existingVehicle = await prisma.vehicle.findUnique({
      where: { plateNumber }
    })
    
    if (existingVehicle) {
      return NextResponse.json({ message: "Plate number already exists" }, { status: 400 })
    }

    const vehicle = await prisma.vehicle.create({
      data: {
        plateNumber,
        typeId,
        status: status || "AVAILABLE",
      },
      include: {
        type: true, 
      }
    })

    return NextResponse.json(vehicle)
  } catch (error: any) {
    console.error("Vehicle create error:", error)
    if (error.message === "Unauthorized" || error.message === "Not admin") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }
    return NextResponse.json({ message: "Server error" }, { status: 500 })
  }
}

// PUT: update vehicle
export async function PUT(req: NextRequest) {
  try {
    verifyAdmin(req)
    
    const { id, plateNumber, typeId, status } = await req.json()

    // Check if plate number exists for other vehicles
    const existingVehicle = await prisma.vehicle.findFirst({
      where: { 
        plateNumber,
        id: { not: id }
      }
    })
    
    if (existingVehicle) {
      return NextResponse.json({ message: "Plate number already exists" }, { status: 400 })
    }

    const vehicle = await prisma.vehicle.update({
      where: { id },
      data: { 
        plateNumber, 
        typeId, 
        status 
      },
      include: {
        type: true, 
      }
    })

    return NextResponse.json(vehicle)
  } catch (error: any) {
    console.error("Vehicle update error:", error)
    if (error.message === "Unauthorized" || error.message === "Not admin") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }
    return NextResponse.json({ message: "Server error" }, { status: 500 })
  }
}

// DELETE: delete vehicle
export async function DELETE(req: NextRequest) {
  try {
    verifyAdmin(req)
    
    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')
    
    if (!id) {
      return NextResponse.json({ message: "Vehicle ID required" }, { status: 400 })
    }

    // Check if vehicle has bookings
    const existingBookings = await prisma.booking.findFirst({
      where: { vehicleId: id }
    })
    
    if (existingBookings) {
      return NextResponse.json({ 
        message: "Cannot delete vehicle with existing bookings" 
      }, { status: 400 })
    }

    await prisma.vehicle.delete({
      where: { id }
    })

    return NextResponse.json({ message: "Vehicle deleted successfully" })
  } catch (error: any) {
    console.error("Vehicle delete error:", error)
    if (error.message === "Unauthorized" || error.message === "Not admin") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }
    return NextResponse.json({ message: "Server error" }, { status: 500 })
  }
}