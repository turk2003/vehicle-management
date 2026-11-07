import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { accessErrorResponse, requireAccess } from "@/lib/permissions"
import { syncAllVehicleStatuses } from "@/lib/syncStatuses"
import { getVehicleStatusContexts } from "@/lib/vehicleStatusContext"

const MAX_MILEAGE = 2_147_483_647

class VehicleInputError extends Error {}

function parseCurrentMileage(value: unknown) {
  if (value === undefined) return undefined
  if (value === null || value === "") {
    throw new VehicleInputError("กรุณาระบุเลขไมล์ปัจจุบัน")
  }
  if (typeof value !== "number" && typeof value !== "string") {
    throw new VehicleInputError("เลขไมล์ต้องเป็นจำนวนเต็มตั้งแต่ 0 ขึ้นไป")
  }

  const normalized = typeof value === "string" ? value.trim() : value
  if (normalized === "") {
    throw new VehicleInputError("กรุณาระบุเลขไมล์ปัจจุบัน")
  }

  const mileage = typeof normalized === "number" ? normalized : Number(normalized)
  if (!Number.isInteger(mileage) || mileage < 0) {
    throw new VehicleInputError("เลขไมล์ต้องเป็นจำนวนเต็มตั้งแต่ 0 ขึ้นไป")
  }
  if (mileage > MAX_MILEAGE) {
    throw new VehicleInputError(`เลขไมล์ต้องไม่เกิน ${MAX_MILEAGE.toLocaleString("en-US")}`)
  }

  return mileage
}

function inputErrorResponse(error: unknown) {
  if (error instanceof VehicleInputError) {
    return NextResponse.json({ message: error.message }, { status: 400 })
  }
  return null
}

// GET: list vehicles
export async function GET(req: NextRequest) {
  try {
    await requireAccess(req, { permission: "VEHICLE_VIEW" })
    const includeStatusContext =
      req.nextUrl.searchParams.get("include") === "statusContext"
    if (includeStatusContext) {
      await requireAccess(req, { roles: ["ADMIN"], permission: "VEHICLE_MANAGE" })
    }
    await syncAllVehicleStatuses()

    const vehicles = await prisma.vehicle.findMany({
      include: { type: true },
      orderBy: { plateNumber: "asc" }
    })

    if (!includeStatusContext) return NextResponse.json(vehicles)

    const contexts = await getVehicleStatusContexts(vehicles.map((v) => v.id))
    return NextResponse.json(
      vehicles.map((vehicle) => ({ ...vehicle, statusContext: contexts[vehicle.id] }))
    )
  } catch (error) {
    return accessErrorResponse(error) ||
      NextResponse.json({ message: "Server error" }, { status: 500 })
  }
}

// POST: create vehicle
export async function POST(req: NextRequest) {
  try {
    await requireAccess(req, { roles: ["ADMIN"], permission: "VEHICLE_MANAGE" })
    const { plateNumber, typeId, currentMileage } = await req.json()
    const parsedMileage = parseCurrentMileage(currentMileage) ?? 0

    const existingVehicle = await prisma.vehicle.findUnique({ where: { plateNumber } })
    if (existingVehicle) {
      return NextResponse.json({ message: "Plate number already exists" }, { status: 400 })
    }

    const vehicle = await prisma.vehicle.create({
      data: {
        plateNumber,
        typeId,
        // สถานะรถคำนวณจากการจอง/งานซ่อม — รถใหม่เริ่มที่ว่างเสมอ
        status: "AVAILABLE",
        currentMileage: parsedMileage
      },
      include: { type: true }
    })

    return NextResponse.json(vehicle)
  } catch (error: unknown) {
    const inputResponse = inputErrorResponse(error)
    if (inputResponse) return inputResponse
    const accessResponse = accessErrorResponse(error)
    if (accessResponse) return accessResponse
    return NextResponse.json({ message: "Server error" }, { status: 500 })
  }
}

// PUT: update vehicle
export async function PUT(req: NextRequest) {
  try {
    await requireAccess(req, { roles: ["ADMIN"], permission: "VEHICLE_MANAGE" })
    // ไม่รับ status — เปลี่ยนสถานะผ่านการสร้าง/ปิดงานซ่อม หรือคืนรถ (ดูหน้าต่างเปลี่ยนสถานะในหน้าจัดการรถ)
    const { id, plateNumber, typeId, currentMileage } = await req.json()
    const parsedMileage = parseCurrentMileage(currentMileage)

    const existingVehicle = await prisma.vehicle.findFirst({
      where: { plateNumber, id: { not: id } }
    })
    if (existingVehicle) {
      return NextResponse.json({ message: "Plate number already exists" }, { status: 400 })
    }

    const vehicle = await prisma.vehicle.update({
      where: { id },
      data: {
        plateNumber,
        typeId,
        ...(parsedMileage !== undefined && { currentMileage: parsedMileage })
      },
      include: { type: true }
    })

    return NextResponse.json(vehicle)
  } catch (error: unknown) {
    const inputResponse = inputErrorResponse(error)
    if (inputResponse) return inputResponse
    const accessResponse = accessErrorResponse(error)
    if (accessResponse) return accessResponse
    return NextResponse.json({ message: "Server error" }, { status: 500 })
  }
}

// DELETE: delete vehicle
export async function DELETE(req: NextRequest) {
  try {
    await requireAccess(req, { roles: ["ADMIN"], permission: "VEHICLE_MANAGE" })
    const { searchParams } = new URL(req.url)
    const id = searchParams.get("id")

    if (!id) return NextResponse.json({ message: "Vehicle ID required" }, { status: 400 })

    const [existingBooking, existingMaintenance] = await Promise.all([
      prisma.booking.findFirst({ where: { vehicleId: id }, select: { id: true } }),
      prisma.maintenance.findFirst({ where: { vehicleId: id }, select: { id: true } }),
    ])
    if (existingBooking || existingMaintenance) {
      return NextResponse.json(
        {
          message: "รถคันนี้มีประวัติการจองหรือการซ่อม จึงไม่สามารถลบได้",
          code: "VEHICLE_HAS_HISTORY",
        },
        { status: 409 },
      )
    }

    await prisma.vehicle.delete({ where: { id } })
    return NextResponse.json({ message: "Vehicle deleted successfully" })
  } catch (error: unknown) {
    const accessResponse = accessErrorResponse(error)
    if (accessResponse) return accessResponse
    return NextResponse.json({ message: "Server error" }, { status: 500 })
  }
}
