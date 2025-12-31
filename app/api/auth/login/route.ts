import { NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import {prisma}  from "@/lib/prisma"
import jwt from "jsonwebtoken"

export async function POST(req: Request) {
  const { email, password } = await req.json()

  const user = await prisma.user.findUnique({ where: { email } })
  if (!user) {
    return NextResponse.json({ message: "User not found" }, { status: 401 })
  }

  const isMatch = await bcrypt.compare(password, user.password)
  if (!isMatch) {
    return NextResponse.json({ message: "Invalid password" }, { status: 401 })
  }
console.log("JWT_SECRET exists:", !!process.env.JWT_SECRET)
  console.log("NODE_ENV:", process.env.NODE_ENV)
  const token = jwt.sign(
    { userId: user.id, role: user.role },
    process.env.JWT_SECRET!,
    { expiresIn: "1d" }
  )
  console.log("Token created:", token)

  const response = NextResponse.json({ 
    user: { id: user.id, name: user.name, email: user.email, role: user.role }
  })
  
  response.cookies.set("token", token, {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production", // จะเป็น false ใน development
  sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax",
  maxAge: 24 * 60 * 60 * 1000, // 1 day
  path: "/"
})

  return response
}