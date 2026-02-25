import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import jwt from "jsonwebtoken"

function getToken(req: NextRequest) {
  let token = req.cookies.get("token")?.value
  if (!token) {
    const authHeader = req.headers.get("authorization")
    if (authHeader?.startsWith("Bearer ")) {
      token = authHeader.substring(7)
    }
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

// GET: รายการ maintenance ทั้งหมด
export async function GET(req: NextRequest) {
  try {
    verifyAdmin(req)
    const { searchParams } = new URL(req.url)
    const status = searchParams.get("status")
    const vehicleId = searchParams.get("vehicleId")

    const maintenances = await prisma.maintenance.findMany({
      where: {
        ...(status && { status: status as any }),
        ...(vehicleId && { vehicleId }),
      },
      include: {
        vehicle: {
          include: { type: true }
        },
        reporter: {
          select: { id: true, name: true, email: true }
        }
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

// POST: สร้าง maintenance ใหม่
export async function POST(req: NextRequest) {
  try {
    const decoded = verifyAdmin(req)
    const { vehicleId, description, startDate, endDate, status } = await req.json()

    if (!vehicleId || !description || !startDate) {
      return NextResponse.json({ message: "กรุณากรอกข้อมูลให้ครบถ้วน" }, { status: 400 })
    }

    // เช็คว่ารถมีการจองในช่วงนั้นไหม
    const conflictBooking = await prisma.booking.findFirst({
      where: {
        vehicleId,
        status: { in: ["PENDING", "APPROVED"] },
        startDate: { lte: endDate ? new Date(endDate) : new Date(startDate) },
        endDate: { gte: new Date(startDate) }
      }
    })

    if (conflictBooking) {
      return NextResponse.json({ message: "รถคันนี้มีการจองในช่วงเวลาดังกล่าว" }, { status: 400 })
    }

    const maintenance = await prisma.maintenance.create({
      data: {
        vehicleId,
        reporterId: decoded.userId,
        description,
        startDate: new Date(startDate),
        endDate: endDate ? new Date(endDate) : null,
        status: status || "REPORTED"
      },
      include: {
        vehicle: { include: { type: true } },
        reporter: { select: { id: true, name: true, email: true } }
      }
    })

    // อัพเดทสถานะรถเป็น MAINTENANCE
    await prisma.vehicle.update({
      where: { id: vehicleId },
      data: { status: "MAINTENANCE" }
    })

    return NextResponse.json(maintenance, { status: 201 })
  } catch (error: any) {
    if (error.message === "No token" || error.message === "Not authorized") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }
    return NextResponse.json({ message: "Server error" }, { status: 500 })
  }
}

// PUT: อัพเดท maintenance
export async function PUT(req: NextRequest) {
  try {
    verifyAdmin(req)
    const { id, description, startDate, endDate, status } = await req.json()

    if (!id) {
      return NextResponse.json({ message: "Missing ID" }, { status: 400 })
    }

    const existing = await prisma.maintenance.findUnique({
      where: { id },
      include: { vehicle: true }
    })

    if (!existing) {
      return NextResponse.json({ message: "ไม่พบข้อมูล" }, { status: 404 })
    }

    const updated = await prisma.maintenance.update({
      where: { id },
      data: {
        ...(description && { description }),
        ...(startDate && { startDate: new Date(startDate) }),
        endDate: endDate ? new Date(endDate) : null,
        ...(status && { status })
      },
      include: {
        vehicle: { include: { type: true } },
        reporter: { select: { id: true, name: true, email: true } }
      }
    })

    // ถ้า COMPLETED ให้เปลี่ยนสถานะรถกลับเป็น AVAILABLE
    if (status === "COMPLETED") {
      await prisma.vehicle.update({
        where: { id: existing.vehicleId },
        data: { status: "AVAILABLE" }
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

// DELETE: ลบ maintenance
export async function DELETE(req: NextRequest) {
  try {
    verifyAdmin(req)
    const { searchParams } = new URL(req.url)
    const id = searchParams.get("id")

    if (!id) {
      return NextResponse.json({ message: "Missing ID" }, { status: 400 })
    }

    const existing = await prisma.maintenance.findUnique({
      where: { id }
    })

    if (!existing) {
      return NextResponse.json({ message: "ไม่พบข้อมูล" }, { status: 404 })
    }

    // คืนสถานะรถกลับเป็น AVAILABLE ถ้ายังไม่ COMPLETED
    if (existing.status !== "COMPLETED") {
      await prisma.vehicle.update({
        where: { id: existing.vehicleId },
        data: { status: "AVAILABLE" }
      })
    }

    await prisma.maintenance.delete({ where: { id } })

    return NextResponse.json({ message: "ลบเรียบร้อยแล้ว" })
  } catch (error: any) {
    if (error.message === "No token" || error.message === "Not authorized") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }
    return NextResponse.json({ message: "Server error" }, { status: 500 })
  }
}