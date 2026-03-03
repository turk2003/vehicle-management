import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { verifyAdmin, verifyUser, isAuthError } from "@/lib/auth"
import { syncAllVehicleStatuses } from "@/lib/syncStatuses"

// GET: list vehicles
export async function GET(req: NextRequest) {
  try {
    verifyUser(req)
    await syncAllVehicleStatuses()

    const vehicles = await prisma.vehicle.findMany({
      include: { type: true },
      orderBy: { plateNumber: "asc" }
    })

    return NextResponse.json(vehicles)
  } catch (error) {
    if (isAuthError(error)) return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
  }
}

// POST: create vehicle
export async function POST(req: NextRequest) {
  try {
    verifyAdmin(req)
    const { plateNumber, typeId, status } = await req.json()

    const existingVehicle = await prisma.vehicle.findUnique({ where: { plateNumber } })
    if (existingVehicle) {
      return NextResponse.json({ message: "Plate number already exists" }, { status: 400 })
    }

    const vehicle = await prisma.vehicle.create({
      data: { plateNumber, typeId, status: status || "AVAILABLE" },
      include: { type: true }
    })

    return NextResponse.json(vehicle)
  } catch (error: any) {
    if (isAuthError(error)) return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    return NextResponse.json({ message: "Server error" }, { status: 500 })
  }
}

// PUT: update vehicle
export async function PUT(req: NextRequest) {
  try {
    verifyAdmin(req)
    const { id, plateNumber, typeId, status } = await req.json()

    const existingVehicle = await prisma.vehicle.findFirst({
      where: { plateNumber, id: { not: id } }
    })
    if (existingVehicle) {
      return NextResponse.json({ message: "Plate number already exists" }, { status: 400 })
    }

    const vehicle = await prisma.vehicle.update({
      where: { id },
      data: { plateNumber, typeId, status },
      include: { type: true }
    })

    return NextResponse.json(vehicle)
  } catch (error: any) {
    if (isAuthError(error)) return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    return NextResponse.json({ message: "Server error" }, { status: 500 })
  }
}

// DELETE: delete vehicle
export async function DELETE(req: NextRequest) {
  try {
    verifyAdmin(req)
    const { searchParams } = new URL(req.url)
    const id = searchParams.get("id")

    if (!id) return NextResponse.json({ message: "Vehicle ID required" }, { status: 400 })

    const existingBookings = await prisma.booking.findFirst({ where: { vehicleId: id } })
    if (existingBookings) {
      return NextResponse.json({ message: "Cannot delete vehicle with existing bookings" }, { status: 400 })
    }

    await prisma.vehicle.delete({ where: { id } })
    return NextResponse.json({ message: "Vehicle deleted successfully" })
  } catch (error: any) {
    if (isAuthError(error)) return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    return NextResponse.json({ message: "Server error" }, { status: 500 })
  }
}