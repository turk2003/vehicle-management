import { NextRequest, NextResponse } from "next/server"
import bcrypt from "bcrypt"
import { prisma } from "@/lib/prisma"
import { accessErrorResponse, requireAccess } from "@/lib/permissions"

const ACTIVE_BOOKING_STATUSES = [
  "PENDING",
  "APPROVED",
  "CHANGED",
  "IN_PROGRESS",
] as const

const USER_SELECT = {
  id: true,
  name: true,
  email: true,
  role: true,
  isActive: true,
  deactivatedAt: true,
  createdAt: true,
} as const

const USER_WITH_HISTORY_SELECT = {
  ...USER_SELECT,
  _count: {
    select: {
      bookings: true,
      approvedJobs: true,
      maintenances: true,
      notifications: true,
      logs: true,
    },
  },
} as const

function hasHistory(counts: {
  bookings: number
  approvedJobs: number
  maintenances: number
  notifications: number
  logs: number
}) {
  return Object.values(counts).some((count) => count > 0)
}

function isPrismaNotFound(error: unknown) {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    error.code === "P2025"
  )
}

export async function GET(req: NextRequest) {
  try {
    await requireAccess(req, { roles: ["ADMIN"], permission: "USER_MANAGE" })
    const [users, activeBookingCounts] = await Promise.all([
      prisma.user.findMany({
        select: USER_WITH_HISTORY_SELECT,
        orderBy: { createdAt: "desc" },
      }),
      prisma.booking.groupBy({
        by: ["userId"],
        where: { status: { in: [...ACTIVE_BOOKING_STATUSES] } },
        _count: { _all: true },
      }),
    ])
    const bookingCountByUser = new Map(
      activeBookingCounts.map((row) => [row.userId, row._count._all]),
    )

    return NextResponse.json(
      users.map(({ _count, ...user }) => ({
        ...user,
        activeBookingCount: bookingCountByUser.get(user.id) || 0,
        canDelete: !hasHistory(_count),
      })),
    )
  } catch (error) {
    const accessResponse = accessErrorResponse(error)
    if (accessResponse) return accessResponse
    return NextResponse.json({ message: "Server error" }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    await requireAccess(req, { roles: ["ADMIN"], permission: "USER_MANAGE" })
    const { name, email, password, role } = await req.json()

    if (!name || !email || !password || !["USER", "APPROVER", "ADMIN"].includes(role)) {
      return NextResponse.json({ message: "ข้อมูลผู้ใช้ไม่ครบหรือไม่ถูกต้อง" }, { status: 400 })
    }

    const existingUser = await prisma.user.findUnique({ where: { email } })
    if (existingUser) {
      return NextResponse.json({ message: "Email already exists" }, { status: 400 })
    }

    const hashed = await bcrypt.hash(password, 10)
    const user = await prisma.user.create({
      data: { name, email, password: hashed, role },
      select: USER_SELECT,
    })
    return NextResponse.json({ ...user, activeBookingCount: 0, canDelete: true })
  } catch (error) {
    const accessResponse = accessErrorResponse(error)
    if (accessResponse) return accessResponse
    return NextResponse.json({ message: "Server error" }, { status: 500 })
  }
}

export async function PUT(req: NextRequest) {
  try {
    await requireAccess(req, { roles: ["ADMIN"], permission: "USER_MANAGE" })
    const { id, name, role } = await req.json()

    if (!id || !name || !["USER", "APPROVER", "ADMIN"].includes(role)) {
      return NextResponse.json({ message: "ข้อมูลผู้ใช้ไม่ถูกต้อง" }, { status: 400 })
    }

    const current = await prisma.user.findUnique({
      where: { id },
      select: { role: true, isActive: true },
    })
    if (!current) return NextResponse.json({ message: "ไม่พบผู้ใช้" }, { status: 404 })

    if (current.role === "ADMIN" && current.isActive && role !== "ADMIN") {
      const activeAdminCount = await prisma.user.count({
        where: { role: "ADMIN", isActive: true },
      })
      if (activeAdminCount <= 1) {
        return NextResponse.json(
          { message: "ไม่สามารถเปลี่ยนบทบาทผู้ดูแลระบบที่ใช้งานอยู่คนสุดท้าย", code: "LAST_ACTIVE_ADMIN" },
          { status: 409 },
        )
      }
    }

    const user = await prisma.user.update({
      where: { id },
      data: { name, role },
      select: USER_SELECT,
    })
    const [activeBookingCount, counts] = await Promise.all([
      prisma.booking.count({
        where: { userId: id, status: { in: [...ACTIVE_BOOKING_STATUSES] } },
      }),
      prisma.user.findUnique({
        where: { id },
        select: { _count: USER_WITH_HISTORY_SELECT._count },
      }),
    ])

    return NextResponse.json({
      ...user,
      activeBookingCount,
      canDelete: counts ? !hasHistory(counts._count) : false,
    })
  } catch (error) {
    const accessResponse = accessErrorResponse(error)
    if (accessResponse) return accessResponse
    if (isPrismaNotFound(error)) {
      return NextResponse.json({ message: "ไม่พบผู้ใช้" }, { status: 404 })
    }
    return NextResponse.json({ message: "Server error" }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const admin = await requireAccess(req, {
      roles: ["ADMIN"],
      permission: "USER_MANAGE",
    })
    const { id, isActive } = await req.json()

    if (!id || typeof isActive !== "boolean") {
      return NextResponse.json({ message: "ข้อมูลสถานะผู้ใช้ไม่ถูกต้อง" }, { status: 400 })
    }

    const target = await prisma.user.findUnique({
      where: { id },
      select: USER_SELECT,
    })
    if (!target) return NextResponse.json({ message: "ไม่พบผู้ใช้" }, { status: 404 })

    if (!isActive && admin.userId === id) {
      return NextResponse.json(
        { message: "ไม่สามารถปิดใช้งานบัญชีของตนเอง", code: "CANNOT_DEACTIVATE_SELF" },
        { status: 409 },
      )
    }

    if (!isActive && target.isActive && target.role === "ADMIN") {
      const activeAdminCount = await prisma.user.count({
        where: { role: "ADMIN", isActive: true },
      })
      if (activeAdminCount <= 1) {
        return NextResponse.json(
          { message: "ไม่สามารถปิดผู้ดูแลระบบที่ใช้งานอยู่คนสุดท้าย", code: "LAST_ACTIVE_ADMIN" },
          { status: 409 },
        )
      }
    }

    const affectedBookingCount = await prisma.booking.count({
      where: { userId: id, status: { in: [...ACTIVE_BOOKING_STATUSES] } },
    })

    if (target.isActive === isActive) {
      return NextResponse.json({ ...target, affectedBookingCount })
    }

    const action = isActive ? "USER_REACTIVATED" : "USER_DEACTIVATED"
    const user = await prisma.$transaction(async (tx) => {
      const updated = await tx.user.update({
        where: { id },
        data: {
          isActive,
          deactivatedAt: isActive ? null : new Date(),
        },
        select: USER_SELECT,
      })
      await tx.log.create({
        data: {
          userId: admin.userId,
          action,
          metadata: { targetUserId: id, affectedBookingCount },
        },
      })
      return updated
    })

    return NextResponse.json({ ...user, affectedBookingCount })
  } catch (error) {
    const accessResponse = accessErrorResponse(error)
    if (accessResponse) return accessResponse
    if (isPrismaNotFound(error)) {
      return NextResponse.json({ message: "ไม่พบผู้ใช้" }, { status: 404 })
    }
    return NextResponse.json({ message: "Server error" }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const admin = await requireAccess(req, {
      roles: ["ADMIN"],
      permission: "USER_MANAGE",
    })
    const id = new URL(req.url).searchParams.get("id")
    if (!id) return NextResponse.json({ message: "User ID required" }, { status: 400 })
    if (id === admin.userId) {
      return NextResponse.json(
        { message: "ไม่สามารถลบบัญชีของตนเอง", code: "CANNOT_DELETE_SELF" },
        { status: 409 },
      )
    }

    const target = await prisma.user.findUnique({
      where: { id },
      select: USER_WITH_HISTORY_SELECT,
    })
    if (!target) return NextResponse.json({ message: "ไม่พบผู้ใช้" }, { status: 404 })

    if (hasHistory(target._count)) {
      return NextResponse.json(
        { message: "บัญชีนี้มีประวัติในระบบ จึงไม่สามารถลบถาวรได้", code: "USER_HAS_HISTORY" },
        { status: 409 },
      )
    }

    if (target.role === "ADMIN" && target.isActive) {
      const activeAdminCount = await prisma.user.count({
        where: { role: "ADMIN", isActive: true },
      })
      if (activeAdminCount <= 1) {
        return NextResponse.json(
          { message: "ไม่สามารถลบผู้ดูแลระบบที่ใช้งานอยู่คนสุดท้าย", code: "LAST_ACTIVE_ADMIN" },
          { status: 409 },
        )
      }
    }

    await prisma.user.delete({ where: { id } })
    return NextResponse.json({ message: "User deleted successfully" })
  } catch (error) {
    const accessResponse = accessErrorResponse(error)
    if (accessResponse) return accessResponse
    if (isPrismaNotFound(error)) {
      return NextResponse.json({ message: "ไม่พบผู้ใช้" }, { status: 404 })
    }
    return NextResponse.json({ message: "Server error" }, { status: 500 })
  }
}
