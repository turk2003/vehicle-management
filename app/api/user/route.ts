import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcrypt"
import { verifyAdmin, isAuthError } from "@/lib/auth"

const USER_SELECT = {
  id: true, name: true, email: true, role: true, createdAt: true,
}

// GET: list users
export async function GET(req: NextRequest) {
  try {
    verifyAdmin(req)
    const users = await prisma.user.findMany({
      select: USER_SELECT,
      orderBy: { createdAt: "desc" }
    })
    return NextResponse.json(users)
  } catch (error) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
  }
}

// POST: create user
export async function POST(req: NextRequest) {
  try {
    verifyAdmin(req)
    const { name, email, password, role } = await req.json()

    const existingUser = await prisma.user.findUnique({ where: { email } })
    if (existingUser) return NextResponse.json({ message: "Email already exists" }, { status: 400 })

    const hashed = await bcrypt.hash(password, 10)
    const user = await prisma.user.create({
      data: { name, email, password: hashed, role },
      select: USER_SELECT
    })
    return NextResponse.json(user)
  } catch (error: any) {
    if (isAuthError(error)) return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    return NextResponse.json({ message: "Server error" }, { status: 500 })
  }
}

// PUT: update user
export async function PUT(req: NextRequest) {
  try {
    verifyAdmin(req)
    const { id, name, role } = await req.json()
    const user = await prisma.user.update({
      where: { id },
      data: { name, role },
      select: USER_SELECT
    })
    return NextResponse.json(user)
  } catch (error: any) {
    if (isAuthError(error)) return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    return NextResponse.json({ message: "Server error" }, { status: 500 })
  }
}

// DELETE: delete user
export async function DELETE(req: NextRequest) {
  try {
    verifyAdmin(req)
    const { searchParams } = new URL(req.url)
    const id = searchParams.get("id")
    if (!id) return NextResponse.json({ message: "User ID required" }, { status: 400 })

    await prisma.user.delete({ where: { id } })
    return NextResponse.json({ message: "User deleted successfully" })
  } catch (error: any) {
    if (isAuthError(error)) return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    return NextResponse.json({ message: "Server error" }, { status: 500 })
  }
}

