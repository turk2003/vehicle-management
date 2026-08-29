import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { verifyAdmin } from "@/lib/auth"
import { isAuthError } from "@/lib/auth"
import { MaintenanceStatus, MaintenanceType } from "@/app/generated/prisma/client"
import { syncAllVehicleStatuses } from "@/lib/syncStatuses"

// GET
export async function GET(req: NextRequest) {
  try {
    verifyAdmin(req)
    const { searchParams } = new URL(req.url)
    const status = searchParams.get("status")
    const vehicleId = searchParams.get("vehicleId")


    await syncAllVehicleStatuses()

    const maintenances = await prisma.maintenance.findMany({
      where: {
        ...(status && { status: status as MaintenanceStatus }),
        ...(vehicleId && { vehicleId })
      },
      include: {
        vehicle: { include: { type: true } },
        reporter: { select: { id: true, name: true, email: true } }
      },
      orderBy: { startDate: "desc" }
    })

    return NextResponse.json(maintenances)
  } catch (error: unknown) {
    if (isAuthError(error)) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }
    return NextResponse.json({ message: "Server error" }, { status: 500 })
  }
}

// POST
export async function POST(req: NextRequest) {
  try {
    const decoded = verifyAdmin(req)
    const {
      vehicleId,
      description,
      maintenanceType,
      startDate,
      endDate,
      status,
      allowBookingConflicts
    } = await req.json()

    const allowedTypes = new Set<MaintenanceType>([
      MaintenanceType.BREAKDOWN,
      MaintenanceType.PREVENTIVE,
      MaintenanceType.OTHER
    ])

    if (
      !vehicleId ||
      !description ||
      !startDate ||
      !allowedTypes.has(maintenanceType as MaintenanceType)
    ) {
      return NextResponse.json({ message: "กรุณากรอกข้อมูลให้ครบถ้วน" }, { status: 400 })
    }

    const affectedBookings = await prisma.booking.findMany({
      where: {
        vehicleId,
        status: { in: ["PENDING", "APPROVED", "CHANGED", "IN_PROGRESS"] },
        ...(endDate && { startDate: { lte: new Date(endDate) } }),
        endDate: { gte: new Date(startDate) }
      },
      select: {
        id: true,
        startDate: true,
        endDate: true,
        status: true,
        user: { select: { name: true } }
      }
    })

    if (affectedBookings.length > 0 && allowBookingConflicts !== true) {
      return NextResponse.json(
        {
          message: `รถคันนี้มีการจองที่ได้รับผลกระทบ ${affectedBookings.length} รายการ`,
          code: "AFFECTED_BOOKINGS",
          affectedBookings
        },
        { status: 409 }
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
        maintenanceType: maintenanceType as MaintenanceType,
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
  } catch (error: unknown) {
    if (isAuthError(error)) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }
    return NextResponse.json({ message: "Server error" }, { status: 500 })
  }
}

// PUT
export async function PUT(req: NextRequest) {
  try {
    verifyAdmin(req)
    const {
      id,
      description,
      maintenanceType,
      startDate,
      endDate,
      status,
      allowBookingConflicts
    } = await req.json()

    if (!id) return NextResponse.json({ message: "Missing ID" }, { status: 400 })

    if (
      maintenanceType &&
      !Object.values(MaintenanceType).includes(maintenanceType as MaintenanceType)
    ) {
      return NextResponse.json({ message: "ประเภทงานซ่อมไม่ถูกต้อง" }, { status: 400 })
    }

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

    if (
      resolvedStatus === MaintenanceStatus.IN_PROGRESS &&
      existing.status !== MaintenanceStatus.IN_PROGRESS
    ) {
      const affectedBookings = await prisma.booking.findMany({
        where: {
          vehicleId: existing.vehicleId,
          status: { in: ["PENDING", "APPROVED", "CHANGED", "IN_PROGRESS"] },
          ...(endDate && { startDate: { lte: new Date(endDate) } }),
          endDate: { gte: newStart }
        },
        select: {
          id: true,
          startDate: true,
          endDate: true,
          status: true,
          user: { select: { name: true } }
        }
      })

      if (affectedBookings.length > 0 && allowBookingConflicts !== true) {
        return NextResponse.json(
          {
            message: `รถคันนี้มีการจองที่ได้รับผลกระทบ ${affectedBookings.length} รายการ`,
            code: "AFFECTED_BOOKINGS",
            affectedBookings
          },
          { status: 409 }
        )
      }
    }

    const updated = await prisma.maintenance.update({
      where: { id },
      data: {
        ...(description && { description }),
        ...(maintenanceType && {
          maintenanceType: maintenanceType as MaintenanceType
        }),
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
            status: { in: ["APPROVED", "CHANGED"] },
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
  } catch (error: unknown) {
    if (isAuthError(error)) {
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
          status: { in: ["APPROVED", "CHANGED"] },
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
  } catch (error: unknown) {
    if (isAuthError(error)) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }
    return NextResponse.json({ message: "Server error" }, { status: 500 })
  }
}
