import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import jwt from "jsonwebtoken"
import { MaintenanceStatus } from "@/app/generated/prisma/client"
import { syncAllVehicleStatuses } from "@/lib/syncStatuses"

function getToken(req: NextRequest) {
  let token = req.cookies.get("token")?.value
  if (!token) {
    const authHeader = req.headers.get("authorization")
    if (authHeader?.startsWith("Bearer ")) token = authHeader.substring(7)
  }
  return token
}

function verifyAdmin(req: NextRequest) {
  const token = getToken(req)
  if (!token) throw new Error("No token")
  const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any
  if (decoded.role !== "ADMIN") throw new Error("Not authorized")
  return decoded
}

// GET
export async function GET(req: NextRequest) {
  try {
    verifyAdmin(req)
    const { searchParams } = new URL(req.url)
    const status = searchParams.get("status")
    const vehicleId = searchParams.get("vehicleId")

    // ✅ ใช้ shared helper แทน local function
    await syncAllVehicleStatuses()

    const maintenances = await prisma.maintenance.findMany({
      where: {
        ...(status && { status: status as any }),
        ...(vehicleId && { vehicleId })
      },
      include: {
        vehicle: { include: { type: true } },
        reporter: { select: { id: true, name: true, email: true } }
      },
      orderBy: { startDate: "desc" }
    })

    return NextResponse.json(maintenances)
  } catch (error: any) {
    if (error.message === "No token" || error.message === "Not authorized") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }
    return NextResponse.json({ message: "Server error" }, { status: 500 })
  }
}

// POST
export async function POST(req: NextRequest) {
  try {
    const decoded = verifyAdmin(req)
    const { vehicleId, description, startDate, endDate, status } = await req.json()

    if (!vehicleId || !description || !startDate) {
      return NextResponse.json({ message: "กรุณากรอกข้อมูลให้ครบถ้วน" }, { status: 400 })
    }

    const conflictBooking = await prisma.booking.findFirst({
      where: {
        vehicleId,
        status: { in: ["PENDING", "APPROVED"] },
        startDate: { lte: endDate ? new Date(endDate) : new Date(startDate) },
        endDate: { gte: new Date(startDate) }
      }
    })

    if (conflictBooking) {
      return NextResponse.json(
        { message: "รถคันนี้มีการจองในช่วงเวลาดังกล่าว กรุณาเลือกเวลาอื่น" },
        { status: 400 }
      )
    }

    const start = new Date(startDate)
    const now = new Date()

    // ✅ ใช้ MaintenanceStatus enum แทน string
    let resolvedStatus: MaintenanceStatus = MaintenanceStatus.REPORTED
    if (start <= now) {
      resolvedStatus = MaintenanceStatus.IN_PROGRESS
    }
    if (status && !(status === "REPORTED" && start <= now)) {
      resolvedStatus = status as MaintenanceStatus
    }

    const maintenance = await prisma.maintenance.create({
      data: {
        vehicleId,
        reporterId: decoded.userId,
        description,
        startDate: start,
        endDate: endDate ? new Date(endDate) : null,
        status: resolvedStatus  // ✅ ไม่มี error แล้ว
      },
      include: {
        vehicle: { include: { type: true } },
        reporter: { select: { id: true, name: true, email: true } }
      }
    })

    if (start <= now) {
      await prisma.vehicle.update({
        where: { id: vehicleId },
        data: { status: "MAINTENANCE" }
      })
    }

    return NextResponse.json(maintenance, { status: 201 })
  } catch (error: any) {
    if (error.message === "No token" || error.message === "Not authorized") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }
    return NextResponse.json({ message: "Server error" }, { status: 500 })
  }
}

// PUT
export async function PUT(req: NextRequest) {
  try {
    verifyAdmin(req)
    const { id, description, startDate, endDate, status } = await req.json()

    if (!id) return NextResponse.json({ message: "Missing ID" }, { status: 400 })

    const existing = await prisma.maintenance.findUnique({
      where: { id },
      include: { vehicle: true }
    })

    if (!existing) return NextResponse.json({ message: "ไม่พบข้อมูล" }, { status: 404 })

    const now = new Date()
    const newStart = startDate ? new Date(startDate) : existing.startDate

    // ✅ ใช้ MaintenanceStatus enum
    let resolvedStatus: MaintenanceStatus | undefined = status
      ? status as MaintenanceStatus
      : undefined

    if (status === "REPORTED" && newStart <= now) {
      resolvedStatus = MaintenanceStatus.IN_PROGRESS
    }

    const updated = await prisma.maintenance.update({
      where: { id },
      data: {
        ...(description && { description }),
        ...(startDate && { startDate: newStart }),
        endDate: endDate ? new Date(endDate) : null,
        ...(resolvedStatus && { status: resolvedStatus })  // ✅ ไม่มี error แล้ว
      },
      include: {
        vehicle: { include: { type: true } },
        reporter: { select: { id: true, name: true, email: true } }
      }
    })

    if (resolvedStatus === MaintenanceStatus.COMPLETED) {
      const otherActive = await prisma.maintenance.findFirst({
        where: {
          vehicleId: existing.vehicleId,
          id: { not: id },
          status: MaintenanceStatus.IN_PROGRESS,
          startDate: { lte: now },
          OR: [{ endDate: null }, { endDate: { gte: now } }]
        }
      })
      if (!otherActive) {
        const activeBooking = await prisma.booking.findFirst({
          where: {
            vehicleId: existing.vehicleId,
            status: "APPROVED",
            startDate: { lte: now },
            endDate: { gte: now }
          }
        })
        await prisma.vehicle.update({
          where: { id: existing.vehicleId },
          data: { status: activeBooking ? "BOOKED" : "AVAILABLE" }
        })
      }
    } else if (resolvedStatus === MaintenanceStatus.IN_PROGRESS) {
      await prisma.vehicle.update({
        where: { id: existing.vehicleId },
        data: { status: "MAINTENANCE" }
      })
    }

    return NextResponse.json(updated)
  } catch (error: any) {
    if (error.message === "No token" || error.message === "Not authorized") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }
    return NextResponse.json({ message: "Server error" }, { status: 500 })
  }
}

// DELETE
export async function DELETE(req: NextRequest) {
  try {
    verifyAdmin(req)
    const { searchParams } = new URL(req.url)
    const id = searchParams.get("id")

    if (!id) return NextResponse.json({ message: "Missing ID" }, { status: 400 })

    const existing = await prisma.maintenance.findUnique({ where: { id } })
    if (!existing) return NextResponse.json({ message: "ไม่พบข้อมูล" }, { status: 404 })

    await prisma.maintenance.delete({ where: { id } })

    const now = new Date()
    const otherActive = await prisma.maintenance.findFirst({
      where: {
        vehicleId: existing.vehicleId,
        status: { in: ["REPORTED", "IN_PROGRESS"] },
        startDate: { lte: now },
        OR: [{ endDate: null }, { endDate: { gte: now } }]
      }
    })

    if (!otherActive) {
      const activeBooking = await prisma.booking.findFirst({
        where: {
          vehicleId: existing.vehicleId,
          status: "APPROVED",
          startDate: { lte: now },
          endDate: { gte: now }
        }
      })
      await prisma.vehicle.update({
        where: { id: existing.vehicleId },
        data: { status: activeBooking ? "BOOKED" : "AVAILABLE" }
      })
    }

    return NextResponse.json({ message: "ลบเรียบร้อยแล้ว" })
  } catch (error: any) {
    if (error.message === "No token" || error.message === "Not authorized") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }
    return NextResponse.json({ message: "Server error" }, { status: 500 })
  }
}