import { NextRequest } from "next/server"
import { prisma } from "./prisma"
import { verifyToken } from "./auth"

export type Permission =
  | "BOOKING_VIEW" | "BOOKING_CREATE" | "BOOKING_APPROVE" | "BOOKING_DELETE"
  | "VEHICLE_VIEW" | "VEHICLE_MANAGE"
  | "MAINTENANCE_VIEW" | "MAINTENANCE_MANAGE"
  | "USER_MANAGE"
  | "REPORT_VIEW"

// Cache permissions in memory (reset on server restart)
// We removed local Map cache because it causes stale permissions across API requests.

/** โหลด permissions ของ role จาก DBโดยตรง ไม่ผ่าน Cache */
export async function getPermissionsForRole(role: string): Promise<Set<string>> {
  const rows = await prisma.rolePermission.findMany({
    where: { role: role as any },
    select: { permission: true },
  })

  return new Set(rows.map((r: { permission: string }) => r.permission))
}

/** ล้าง cache (ตอนนี้ไม่ได้ใช้แล้วเพราะดึงสด แต่คง function signature ไว้) */
export function clearPermissionCache(role?: string) {
  // No-op
}

/** เช็คว่า request มี permission ที่ต้องการไหม — throw ถ้าไม่มี */
export async function verifyPermission(
  req: NextRequest,
  permission: Permission
): Promise<{ userId: string; role: string }> {
  const decoded = verifyToken(req)
  const permissions = await getPermissionsForRole(decoded.role)

  if (!permissions.has(permission)) {
    throw new Error("Forbidden")
  }

  return decoded
}

/** เช็คโดยไม่ throw — return true/false */
export async function hasPermission(
  req: NextRequest,
  permission: Permission
): Promise<boolean> {
  try {
    await verifyPermission(req, permission)
    return true
  } catch {
    return false
  }
}

export function isPermissionError(error: unknown): boolean {
  return (
    error instanceof Error &&
    (error.message === "No token" ||
      error.message === "Not authorized" ||
      error.message === "Forbidden")
  )
}
