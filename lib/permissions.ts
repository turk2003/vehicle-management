import { NextRequest } from "next/server"
import { NextResponse } from "next/server"
import { prisma } from "./prisma"
import { isAuthError, verifyToken, type AuthenticatedUser } from "./auth"

export type Permission =
  | "BOOKING_VIEW" | "BOOKING_CREATE" | "BOOKING_APPROVE" | "BOOKING_MANAGE" | "BOOKING_DELETE"
  | "VEHICLE_VIEW" | "VEHICLE_MANAGE"
  | "MAINTENANCE_VIEW" | "MAINTENANCE_REPORT" | "MAINTENANCE_MANAGE"
  | "USER_MANAGE"
  | "REPORT_VIEW"
  | "PERMISSION_MANAGE"

export type AccessPolicy = {
  roles?: AuthenticatedUser["role"][]
  permission?: Permission
}

// Cache permissions in memory (reset on server restart)
// We removed local Map cache because it causes stale permissions across API requests.

/** โหลด permissions ของ role จาก DBโดยตรง ไม่ผ่าน Cache */
export async function getPermissionsForRole(
  role: "USER" | "ADMIN" | "APPROVER",
): Promise<Set<string>> {
  const rows = await prisma.rolePermission.findMany({
    where: { role },
    select: { permission: true },
  })

  return new Set(rows.map((r: { permission: string }) => r.permission))
}

/** ล้าง cache (ตอนนี้ไม่ได้ใช้แล้วเพราะดึงสด แต่คง function signature ไว้) */
export function clearPermissionCache(role?: string) {
  void role
  // No-op
}

/** เช็คว่า request มี permission ที่ต้องการไหม — throw ถ้าไม่มี */
export async function verifyPermission(
  req: NextRequest,
  permission: Permission,
  roles?: AuthenticatedUser["role"][],
): Promise<AuthenticatedUser> {
  return requireAccess(req, { permission, roles })
}

export async function assertAccess(
  actor: AuthenticatedUser,
  policy: AccessPolicy,
): Promise<AuthenticatedUser> {
  if (policy.roles && !policy.roles.includes(actor.role)) {
    throw new Error("Not authorized")
  }

  if (!policy.permission) return actor

  const permissions = await getPermissionsForRole(actor.role)

  if (!permissions.has(policy.permission)) {
    throw new Error("Forbidden")
  }

  return actor
}

export async function requireAccess(
  req: NextRequest,
  policy: AccessPolicy,
): Promise<AuthenticatedUser> {
  const actor = await verifyToken(req)
  return assertAccess(actor, policy)
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
      error.message === "Account inactive" ||
      error.message === "Forbidden")
  )
}

export function isAuthenticationError(error: unknown): boolean {
  return (
    error instanceof Error &&
    (error.message === "No token" ||
      error.message === "Account inactive" ||
      error.name === "JsonWebTokenError" ||
      error.name === "TokenExpiredError")
  )
}

export function accessErrorResponse(error: unknown): NextResponse | null {
  if (isAuthenticationError(error)) {
    return NextResponse.json(
      { message: "Unauthorized", code: "UNAUTHENTICATED" },
      { status: 401 },
    )
  }

  if (
    error instanceof Error &&
    (error.message === "Not authorized" || error.message === "Forbidden")
  ) {
    return NextResponse.json(
      { message: "ไม่มีสิทธิ์ดำเนินการ", code: "PERMISSION_DENIED" },
      { status: 403 },
    )
  }

  if (isAuthError(error)) {
    return NextResponse.json(
      { message: "Unauthorized", code: "UNAUTHENTICATED" },
      { status: 401 },
    )
  }

  return null
}
