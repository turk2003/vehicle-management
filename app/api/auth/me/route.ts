import { NextRequest, NextResponse } from "next/server"
import jwt from "jsonwebtoken"
import { prisma } from "@/lib/prisma"

export const dynamic = "force-dynamic"


export async function GET(req: NextRequest) {

  const token = req.cookies.get("token")?.value
  
  if (!token) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { id: true, name: true, email: true, role: true }
    })

    if (!user) {
      console.log("User not found in database")
      return NextResponse.json({ message: "User not found" }, { status: 404 })
    }

    const { getPermissionsForRole } = await import("@/lib/permissions")
    const permissionsSet = await getPermissionsForRole(user.role)
    const permissions = Array.from(permissionsSet)

    return NextResponse.json({ user, permissions })
  } catch (error) {
    console.log("JWT verification failed:", error)
    return NextResponse.json({ message: "Invalid token" }, { status: 401 })
  }
}