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

// GET: list vehicle types
export async function GET(req: NextRequest) {
  try {
    const token = getToken(req)
    if (!token) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    // Verify token
    jwt.verify(token, process.env.JWT_SECRET!)
    
    const vehicleTypes = await prisma.vehicleType.findMany({
      orderBy: { name: 'asc' }
    })
    
    return NextResponse.json(vehicleTypes)
  } catch (error) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
  }
}

// POST: create vehicle type (admin only)
export async function POST(req: NextRequest) {
  try {
    verifyAdmin(req)
    
    const { name } = await req.json()
    
    const vehicleType = await prisma.vehicleType.create({
      data: { name }
    })

    return NextResponse.json(vehicleType)
  } catch (error: any) {
    if (error.message === "Unauthorized" || error.message === "Not admin") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }
    return NextResponse.json({ message: "Server error" }, { status: 500 })
  }
}

// PUT: update vehicle type (admin only)
export async function PUT(req: NextRequest) {
  try {
    verifyAdmin(req)
    
    const { id, name } = await req.json()

    const vehicleType = await prisma.vehicleType.update({
      where: { id },
      data: { name }
    })

    return NextResponse.json(vehicleType)
  } catch (error: any) {
    if (error.message === "Unauthorized" || error.message === "Not admin") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }
    return NextResponse.json({ message: "Server error" }, { status: 500 })
  }
}

// DELETE: delete vehicle type (admin only)
export async function DELETE(req: NextRequest) {
  try {
    verifyAdmin(req)
    
    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')
    
    if (!id) {
      return NextResponse.json({ message: "Vehicle type ID required" }, { status: 400 })
    }

    // Check if type has vehicles
    const existingVehicles = await prisma.vehicle.findFirst({
      where: { typeId: id }
    })
    
    if (existingVehicles) {
      return NextResponse.json({ 
        message: "Cannot delete vehicle type with existing vehicles" 
      }, { status: 400 })
    }

    await prisma.vehicleType.delete({
      where: { id }
    })

    return NextResponse.json({ message: "Vehicle type deleted successfully" })
  } catch (error: any) {
    if (error.message === "Unauthorized" || error.message === "Not admin") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }
    return NextResponse.json({ message: "Server error" }, { status: 500 })
  }
}