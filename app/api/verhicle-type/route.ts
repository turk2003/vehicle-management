import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { accessErrorResponse, requireAccess } from "@/lib/permissions"

// GET: list vehicle types
export async function GET(req: NextRequest) {
  try {
    await requireAccess(req, { permission: "VEHICLE_VIEW" })
    const vehicleTypes = await prisma.vehicleType.findMany({ orderBy: { name: "asc" } })
    return NextResponse.json(vehicleTypes)
  } catch (error: unknown) {
    return accessErrorResponse(error) ||
      NextResponse.json({ message: "Server error" }, { status: 500 })
  }
}

// POST: create vehicle type (admin only)
export async function POST(req: NextRequest) {
  try {
    await requireAccess(req, { roles: ["ADMIN"], permission: "VEHICLE_MANAGE" })
    const { name } = await req.json()
    const vehicleType = await prisma.vehicleType.create({ data: { name } })
    return NextResponse.json(vehicleType)
  } catch (error: unknown) {
    return accessErrorResponse(error) ||
      NextResponse.json({ message: "Server error" }, { status: 500 })
  }
}

// PUT: update vehicle type (admin only)
export async function PUT(req: NextRequest) {
  try {
    await requireAccess(req, { roles: ["ADMIN"], permission: "VEHICLE_MANAGE" })
    const { id, name } = await req.json()
    const vehicleType = await prisma.vehicleType.update({ where: { id }, data: { name } })
    return NextResponse.json(vehicleType)
  } catch (error: unknown) {
    return accessErrorResponse(error) ||
      NextResponse.json({ message: "Server error" }, { status: 500 })
  }
}

// DELETE: delete vehicle type (admin only)
export async function DELETE(req: NextRequest) {
  try {
    await requireAccess(req, { roles: ["ADMIN"], permission: "VEHICLE_MANAGE" })
    const { searchParams } = new URL(req.url)
    const id = searchParams.get("id")

    if (!id) return NextResponse.json({ message: "Vehicle type ID required" }, { status: 400 })

    const existingVehicles = await prisma.vehicle.findFirst({ where: { typeId: id } })
    if (existingVehicles) {
      return NextResponse.json({ message: "Cannot delete vehicle type with existing vehicles" }, { status: 400 })
    }

    await prisma.vehicleType.delete({ where: { id } })
    return NextResponse.json({ message: "Vehicle type deleted successfully" })
  } catch (error: unknown) {
    return accessErrorResponse(error) ||
      NextResponse.json({ message: "Server error" }, { status: 500 })
  }
}
