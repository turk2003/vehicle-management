import { NextRequest } from "next/server"
import jwt from "jsonwebtoken"

export type JwtPayload = {
  userId: string
  role: "ADMIN" | "APPROVER" | "USER"
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
export function verifyToken(req: NextRequest): JwtPayload {
  const token = getToken(req)
  if (!token) throw new Error("No token")
  return jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload
}

/** เฉพาะ ADMIN เท่านั้น */
export function verifyAdmin(req: NextRequest): JwtPayload {
  const decoded = verifyToken(req)
  if (decoded.role !== "ADMIN") throw new Error("Not authorized")
  return decoded
}

/** เฉพาะ APPROVER หรือ ADMIN */
export function verifyApprover(req: NextRequest): JwtPayload {
  const decoded = verifyToken(req)
  if (decoded.role !== "APPROVER" && decoded.role !== "ADMIN") {
    throw new Error("Not authorized")
  }
  return decoded
}

/** ทุก role ที่ login แล้ว */
export function verifyUser(req: NextRequest): JwtPayload {
  return verifyToken(req)
}

/** Standard error response สำหรับ auth errors */
export function isAuthError(error: unknown): boolean {
  return (
    error instanceof Error &&
    (error.message === "No token" || error.message === "Not authorized")
  )
}
