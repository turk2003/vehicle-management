import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { isAuthError, verifyUser } from "@/lib/auth"

export const dynamic = "force-dynamic"


export async function GET(req: NextRequest) {
  try {
    const decoded = await verifyUser(req)
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { id: true, name: true, email: true, role: true, isActive: true },
    })

    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const { getPermissionsForRole } = await import("@/lib/permissions")
    const permissionsSet = await getPermissionsForRole(user.role)
    const permissions = Array.from(permissionsSet)

    return NextResponse.json({ user, permissions })
  } catch (error) {
    if (!isAuthError(error)) {
      return NextResponse.json({ message: "Server error" }, { status: 500 })
    }
    return NextResponse.json({ message: "Invalid token" }, { status: 401 })
  }
}
