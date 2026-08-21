import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { isAuthError, verifyUser } from "@/lib/auth"

export const dynamic = "force-dynamic"

export async function GET(req: NextRequest) {
  try {
    const decoded = verifyUser(req)
    const { searchParams } = new URL(req.url)
    const requestedLimit = Number(searchParams.get("limit") || "10")
    const limit = Number.isFinite(requestedLimit)
      ? Math.min(Math.max(Math.trunc(requestedLimit), 1), 50)
      : 10
    const unreadOnly = searchParams.get("unreadOnly") === "true"

    const [items, unreadCount] = await Promise.all([
      prisma.notification.findMany({
        where: {
          userId: decoded.userId,
          ...(unreadOnly && { isRead: false })
        },
        orderBy: { createdAt: "desc" },
        take: limit,
        select: {
          id: true,
          type: true,
          message: true,
          isRead: true,
          bookingId: true,
          maintenanceId: true,
          createdAt: true
        }
      }),
      prisma.notification.count({
        where: { userId: decoded.userId, isRead: false }
      })
    ])

    return NextResponse.json({ items, unreadCount })
  } catch (error: unknown) {
    if (isAuthError(error)) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }
    console.error("Get notifications error:", error)
    return NextResponse.json({ message: "Server error" }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const decoded = verifyUser(req)
    const { id, markAll } = await req.json()

    if (!id && markAll !== true) {
      return NextResponse.json(
        { message: "กรุณาระบุ notification หรือเลือกอ่านทั้งหมด" },
        { status: 400 }
      )
    }

    const result = await prisma.notification.updateMany({
      where: {
        userId: decoded.userId,
        isRead: false,
        ...(id && { id })
      },
      data: { isRead: true }
    })

    if (id && result.count === 0) {
      return NextResponse.json({ message: "ไม่พบการแจ้งเตือน" }, { status: 404 })
    }

    return NextResponse.json({ updated: result.count })
  } catch (error: unknown) {
    if (isAuthError(error)) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }
    console.error("Update notifications error:", error)
    return NextResponse.json({ message: "Server error" }, { status: 500 })
  }
}
