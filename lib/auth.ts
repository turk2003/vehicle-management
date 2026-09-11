import { NextRequest } from "next/server"
import jwt from "jsonwebtoken"
import { prisma } from "./prisma"

export type JwtPayload = {
  userId: string
  role: "ADMIN" | "APPROVER" | "USER"
}

export type AuthenticatedUser = JwtPayload & {
  isActive: true
}

/** ดึง JWT token จาก cookie หรือ Authorization header */
export function getToken(req: NextRequest): string | undefined {
  let token = req.cookies.get("token")?.value
  if (!token) {
    const authHeader = req.headers.get("authorization")
    if (authHeader?.startsWith("Bearer ")) {
      token = authHeader.substring(7)
    }
  }
  return token
}

/** Verify token และ return decoded payload */
export function decodeToken(req: NextRequest): JwtPayload {
  return decodeTokenValue(getToken(req))
}

/** Verify a raw token so Server Components and Route Handlers share one auth path. */
export function decodeTokenValue(token: string | undefined): JwtPayload {
  if (!token) throw new Error("No token")
  return jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload
}

/** Verify JWT and refresh authorization data from the database on every request. */
export async function verifyTokenValue(
  token: string | undefined,
): Promise<AuthenticatedUser> {
  const decoded = decodeTokenValue(token)
  const user = await prisma.user.findUnique({
    where: { id: decoded.userId },
    select: { id: true, role: true, isActive: true },
  })

  if (!user || !user.isActive) throw new Error("Account inactive")

  return {
    userId: user.id,
    role: user.role,
    isActive: true,
  }
}

export async function verifyToken(req: NextRequest): Promise<AuthenticatedUser> {
  return verifyTokenValue(getToken(req))
}

/** เฉพาะ ADMIN เท่านั้น */
export async function verifyAdmin(req: NextRequest): Promise<AuthenticatedUser> {
  const decoded = await verifyToken(req)
  if (decoded.role !== "ADMIN") throw new Error("Not authorized")
  return decoded
}

/** เฉพาะ APPROVER หรือ ADMIN */
export async function verifyApprover(req: NextRequest): Promise<AuthenticatedUser> {
  const decoded = await verifyToken(req)
  if (decoded.role !== "APPROVER" && decoded.role !== "ADMIN") {
    throw new Error("Not authorized")
  }
  return decoded
}

/** ทุก role ที่ login แล้ว */
export async function verifyUser(req: NextRequest): Promise<AuthenticatedUser> {
  return verifyToken(req)
}

/** Standard error response สำหรับ auth errors */
export function isAuthError(error: unknown): boolean {
  return (
    error instanceof Error &&
    (error.message === "No token" ||
      error.message === "Not authorized" ||
      error.message === "Account inactive" ||
      error.name === "JsonWebTokenError" ||
      error.name === "TokenExpiredError")
  )
}
