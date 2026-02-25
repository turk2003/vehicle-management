import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import jwt from "jsonwebtoken"
import { syncAllVehicleStatuses } from "@/lib/syncStatuses"

function getToken(req: NextRequest) {
  let token = req.cookies.get("token")?.value
  if (!token) {
    const authHeader = req.headers.get("authorization")
    if (authHeader?.startsWith("Bearer ")) token = authHeader.substring(7)
  }
  return token
}

function verifyUser(req: NextRequest) {
  const token = getToken(req)
  if (!token) throw new Error("No token")
  return jwt.verify(token, process.env.JWT_SECRET!) as any
}

// GET
export async function GET(req: NextRequest) {
  try {
    const decoded = verifyUser(req)
    const { searchParams } = new URL(req.url)
    const action = searchParams.get("action")

    // ✅ Sync สถานะรถจาก shared helper
    await syncAllVehicleStatuses()

    if (action === "my-bookings") {
      const bookings = await prisma.booking.findMany({
        where: { userId: decoded.userId },
        include: {
          vehicle: { include: { type: true } },
          approver: { select: { id: true, name: true, email: true } }
        },
        orderBy: { createdAt: "desc" }
      })
      return NextResponse.json(bookings)
    }

    // ดึงรถที่จองได้ (ตามช่วงเวลา)
    const startDate = searchParams.get("startDate")
    const endDate = searchParams.get("endDate")
    const vehicleTypeId = searchParams.get("vehicleTypeId")

    let availableVehicles = await prisma.vehicle.findMany({
      where: {
        // ✅ ดึงทั้ง AVAILABLE และ BOOKED (เพราะ BOOKED อาจว่างในช่วงที่ต้องการจอง)
        status: { in: ["AVAILABLE", "BOOKED"] },
        ...(vehicleTypeId && { typeId: vehicleTypeId })
      },
      include: { type: true }
    })

    if (startDate && endDate) {
      const start = new Date(startDate)
      const end = new Date(endDate)

      // เช็ค booking ที่ทับช่วงเวลา
      const conflictingBookings = await prisma.booking.findMany({
        where: {
          status: { in: ["PENDING", "APPROVED"] },
          startDate: { lte: end },
          endDate: { gte: start }
        },
        select: { vehicleId: true }
      })

      // เช็ค maintenance ที่ทับช่วงเวลา
      const conflictingMaintenances = await prisma.maintenance.findMany({
        where: {
          status: { in: ["REPORTED", "IN_PROGRESS"] },
          startDate: { lte: end },
          OR: [{ endDate: null }, { endDate: { gte: start } }]
        },
        select: { vehicleId: true }
      })

      const conflictIds = [
        ...conflictingBookings.map(b => b.vehicleId),
        ...conflictingMaintenances.map(m => m.vehicleId)
      ]

      availableVehicles = availableVehicles.filter(v => !conflictIds.includes(v.id))
    }

    return NextResponse.json(availableVehicles)
  } catch (error) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
  }
}

// POST
export async function POST(req: NextRequest) {
  try {
    const decoded = verifyUser(req)
    const { vehicleId, startDate, endDate, purpose, destination } = await req.json()

    if (!vehicleId || !startDate || !endDate || !purpose) {
      return NextResponse.json({ message: "กรุณากรอกข้อมูลให้ครบถ้วน" }, { status: 400 })
    }

    const start = new Date(startDate)
    const end = new Date(endDate)
    const now = new Date()

    if (start >= end) {
      return NextResponse.json({ message: "วันที่สิ้นสุดต้องหลังวันที่เริ่มต้น" }, { status: 400 })
    }
    if (start < now) {
      return NextResponse.json({ message: "ไม่สามารถจองย้อนหลังได้" }, { status: 400 })
    }

    const vehicle = await prisma.vehicle.findUnique({
      where: { id: vehicleId },
      include: { type: true }
    })

    if (!vehicle) {
      return NextResponse.json({ message: "ไม่พบรถคันนี้" }, { status: 404 })
    }

    // ✅ MAINTENANCE = ห้ามจองเด็ดขาด
    if (vehicle.status === "MAINTENANCE") {
      return NextResponse.json({ message: "รถคันนี้อยู่ระหว่างซ่อมบำรุง" }, { status: 400 })
    }

    // เช็ค booking conflict ในช่วงเวลา
    const conflictingBooking = await prisma.booking.findFirst({
      where: {
        vehicleId,
        status: { in: ["PENDING", "APPROVED"] },
        startDate: { lte: end },
        endDate: { gte: start }
      }
    })

    if (conflictingBooking) {
      return NextResponse.json({ message: "รถคันนี้มีการจองในช่วงเวลาดังกล่าวแล้ว" }, { status: 409 })
    }

    // เช็ค maintenance conflict ในช่วงเวลา
    const conflictingMaintenance = await prisma.maintenance.findFirst({
      where: {
        vehicleId,
        status: { in: ["REPORTED", "IN_PROGRESS"] },
        startDate: { lte: end },
        OR: [{ endDate: null }, { endDate: { gte: start } }]
      }
    })

    if (conflictingMaintenance) {
      return NextResponse.json({
        message: "รถคันนี้มีกำหนดการซ่อมบำรุงในช่วงเวลาดังกล่าว ไม่สามารถจองได้"
      }, { status: 409 })
    }

    const booking = await prisma.booking.create({
      data: {
        userId: decoded.userId,
        vehicleId,
        startDate: start,
        endDate: end,
        purpose,
        ...(destination && { destination }),
        status: "PENDING"
        // ✅ ไม่เปลี่ยนสถานะรถตอนจอง เพราะยังไม่ได้ใช้จริง
      },
      include: {
        vehicle: { include: { type: true } },
        user: { select: { name: true, email: true } }
      }
    })

    return NextResponse.json(booking)
  } catch (error) {
    console.error("Create booking error:", error)
    return NextResponse.json({ message: "Server error" }, { status: 500 })
  }
}

// PUT: user cancel booking
export async function PUT(req: NextRequest) {
  try {
    const decoded = verifyUser(req)
    const { id, status } = await req.json()

    if (!id || status !== "CANCELLED") {
      return NextResponse.json({ message: "Invalid request" }, { status: 400 })
    }

    const booking = await prisma.booking.findUnique({ where: { id } })

    if (!booking) {
      return NextResponse.json({ message: "ไม่พบการจอง" }, { status: 404 })
    }

    if (booking.userId !== decoded.userId) {
      return NextResponse.json({ message: "ไม่มีสิทธิ์" }, { status: 403 })
    }

    if (booking.status !== "PENDING") {
      return NextResponse.json({ message: "ยกเลิกได้เฉพาะการจองที่รออนุมัติเท่านั้น" }, { status: 400 })
    }

    const updated = await prisma.booking.update({
      where: { id },
      data: { status: "CANCELLED" }
    })

    return NextResponse.json(updated)
  } catch (error) {
    return NextResponse.json({ message: "Server error" }, { status: 500 })
  }
}