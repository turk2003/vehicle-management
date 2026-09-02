import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { verifyAdmin } from "@/lib/auth"
import { isAuthError } from "@/lib/auth"
import { MaintenanceStatus, MaintenanceType } from "@/app/generated/prisma/client"
import { syncAllVehicleStatuses } from "@/lib/syncStatuses"

class MaintenanceInputError extends Error {}

function parseRequiredDate(value: unknown, fieldName: string) {
  if (typeof value !== "string" || !value) {
    throw new MaintenanceInputError(`กรุณาระบุ${fieldName}`)
  }
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    throw new MaintenanceInputError(`${fieldName}ไม่ถูกต้อง`)
  }
  return date
}

function parseOptionalDate(value: unknown, fieldName: string) {
  if (value === undefined) return undefined
  if (value === null || value === "") return null
  return parseRequiredDate(value, fieldName)
}

function parseOptionalText(value: unknown, fieldName: string) {
  if (value === undefined) return undefined
  if (value === null || value === "") return null
  if (typeof value !== "string") {
    throw new MaintenanceInputError(`${fieldName}ไม่ถูกต้อง`)
  }
  return value.trim() || null
}

function parseOptionalCost(value: unknown) {
  if (value === undefined) return undefined
  if (value === null || value === "") return null
  if (typeof value !== "number" && typeof value !== "string") {
    throw new MaintenanceInputError("ค่าใช้จ่ายไม่ถูกต้อง")
  }
  const normalized = typeof value === "string" ? value.trim() : value
  if (normalized === "") return null
  const parsed = typeof normalized === "number" ? normalized : Number(normalized)
  if (!Number.isFinite(parsed) || parsed < 0) {
    throw new MaintenanceInputError("ค่าใช้จ่ายต้องเป็นตัวเลขที่ไม่ติดลบ")
  }
  return parsed
}

function inputErrorResponse(error: unknown) {
  if (error instanceof MaintenanceInputError) {
    return NextResponse.json({ message: error.message }, { status: 400 })
  }
  return null
}

// GET
export async function GET(req: NextRequest) {
  try {
    await verifyAdmin(req)
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
    const decoded = await verifyAdmin(req)
    const {
      vehicleId,
      description,
      maintenanceType,
      repairDetails,
      serviceCenterName,
      cost,
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

    const start = parseRequiredDate(startDate, "วันที่เริ่ม")
    const parsedEnd = parseOptionalDate(endDate, "วันที่เสร็จ")
    const parsedCost = parseOptionalCost(cost)
    const parsedRepairDetails = parseOptionalText(repairDetails, "รายละเอียดการซ่อม")
    const parsedServiceCenterName = parseOptionalText(serviceCenterName, "ศูนย์บริการ")

    if (parsedEnd && parsedEnd < start) {
      throw new MaintenanceInputError("วันที่เสร็จสิ้นต้องไม่ก่อนวันที่เริ่ม")
    }
    if (status && !Object.values(MaintenanceStatus).includes(status as MaintenanceStatus)) {
      throw new MaintenanceInputError("สถานะงานซ่อมไม่ถูกต้อง")
    }

    const now = new Date()
    let resolvedStatus: MaintenanceStatus = MaintenanceStatus.REPORTED
    if (start <= now) resolvedStatus = MaintenanceStatus.IN_PROGRESS
    if (status && !(status === "REPORTED" && start <= now)) {
      resolvedStatus = status as MaintenanceStatus
    }
    if (resolvedStatus === MaintenanceStatus.COMPLETED && !parsedEnd) {
      throw new MaintenanceInputError("กรุณาระบุวันที่เสร็จเมื่อปิดงานซ่อม")
    }

    const affectedBookings = await prisma.booking.findMany({
      where: {
        vehicleId,
        status: { in: ["PENDING", "APPROVED", "CHANGED", "IN_PROGRESS"] },
        ...(parsedEnd && { startDate: { lte: parsedEnd } }),
        endDate: { gte: start }
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

    const maintenance = await prisma.maintenance.create({
      data: {
        vehicleId,
        reporterId: decoded.userId,
        description,
        maintenanceType: maintenanceType as MaintenanceType,
        repairDetails: parsedRepairDetails,
        serviceCenterName: parsedServiceCenterName,
        cost: parsedCost,
        startDate: start,
        endDate: parsedEnd,
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
    const inputResponse = inputErrorResponse(error)
    if (inputResponse) return inputResponse
    if (isAuthError(error)) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }
    return NextResponse.json({ message: "Server error" }, { status: 500 })
  }
}

// PUT
export async function PUT(req: NextRequest) {
  try {
    await verifyAdmin(req)
    const {
      id,
      description,
      maintenanceType,
      repairDetails,
      serviceCenterName,
      cost,
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
    if (status && !Object.values(MaintenanceStatus).includes(status as MaintenanceStatus)) {
      return NextResponse.json({ message: "สถานะงานซ่อมไม่ถูกต้อง" }, { status: 400 })
    }

    const parsedRepairDetails = parseOptionalText(repairDetails, "รายละเอียดการซ่อม")
    const parsedServiceCenterName = parseOptionalText(serviceCenterName, "ศูนย์บริการ")
    const parsedCost = parseOptionalCost(cost)

    const existing = await prisma.maintenance.findUnique({
      where: { id },
      include: { vehicle: true }
    })

    if (!existing) return NextResponse.json({ message: "ไม่พบข้อมูล" }, { status: 404 })

    const now = new Date()
    const newStart = startDate
      ? parseRequiredDate(startDate, "วันที่เริ่ม")
      : existing.startDate
    const parsedEnd = parseOptionalDate(endDate, "วันที่เสร็จ")
    const finalEnd = parsedEnd === undefined ? existing.endDate : parsedEnd

    // ✅ ใช้ MaintenanceStatus enum
    let resolvedStatus: MaintenanceStatus | undefined = status
      ? status as MaintenanceStatus
      : undefined

    if (status === "REPORTED" && newStart <= now) {
      resolvedStatus = MaintenanceStatus.IN_PROGRESS
    }

    const finalStatus = resolvedStatus || existing.status
    if (finalStatus === MaintenanceStatus.COMPLETED && !finalEnd) {
      throw new MaintenanceInputError("กรุณาระบุวันที่เสร็จเมื่อปิดงานซ่อม")
    }
    if (finalEnd && finalEnd < newStart) {
      throw new MaintenanceInputError("วันที่เสร็จสิ้นต้องไม่ก่อนวันที่เริ่ม")
    }

    if (
      resolvedStatus === MaintenanceStatus.IN_PROGRESS &&
      existing.status !== MaintenanceStatus.IN_PROGRESS
    ) {
      const affectedBookings = await prisma.booking.findMany({
        where: {
          vehicleId: existing.vehicleId,
          status: { in: ["PENDING", "APPROVED", "CHANGED", "IN_PROGRESS"] },
          ...(finalEnd && { startDate: { lte: finalEnd } }),
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
        ...(repairDetails !== undefined && { repairDetails: parsedRepairDetails }),
        ...(serviceCenterName !== undefined && { serviceCenterName: parsedServiceCenterName }),
        ...(cost !== undefined && { cost: parsedCost }),
        ...(startDate && { startDate: newStart }),
        ...(endDate !== undefined && { endDate: parsedEnd }),
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
    const inputResponse = inputErrorResponse(error)
    if (inputResponse) return inputResponse
    if (isAuthError(error)) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }
    return NextResponse.json({ message: "Server error" }, { status: 500 })
  }
}

// DELETE
export async function DELETE(req: NextRequest) {
  try {
    await verifyAdmin(req)
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
