import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import {
  accessErrorResponse,
  clearPermissionCache,
  requireAccess,
  type Permission,
} from "@/lib/permissions"

const ALL_PERMISSIONS = [
  "BOOKING_VIEW", "BOOKING_CREATE", "BOOKING_APPROVE", "BOOKING_MANAGE", "BOOKING_DELETE",
  "VEHICLE_VIEW", "VEHICLE_MANAGE",
  "MAINTENANCE_VIEW", "MAINTENANCE_REPORT", "MAINTENANCE_MANAGE",
  "USER_MANAGE",
  "REPORT_VIEW",
  "PERMISSION_MANAGE",
] satisfies Permission[]

const ROLES = ["ADMIN", "APPROVER", "USER"] as const

// ADMIN ต้องมีสิทธิ์เหล่านี้เสมอ (lock ไว้ ลบไม่ได้)
const LOCKED_ADMIN_PERMISSIONS: Permission[] = [
  "PERMISSION_MANAGE",
  "USER_MANAGE",
  "BOOKING_VIEW",
  "VEHICLE_VIEW",
]

// GET: ดึง permissions ทั้งหมดของทุก role
export async function GET(req: NextRequest) {
  try {
    await requireAccess(req, {
      roles: ["ADMIN"],
      permission: "PERMISSION_MANAGE",
    })

    const rows = await prisma.rolePermission.findMany()

    // จัด format เป็น { role: { permission: boolean } }
    const result: Record<string, Record<string, boolean>> = {}

    for (const role of ROLES) {
      result[role] = {}
      for (const perm of ALL_PERMISSIONS) {
        result[role][perm] = false
      }
    }

    for (const row of rows) {
      if (result[row.role]) {
        result[row.role][row.permission] = true
      }
    }

    return NextResponse.json({
      permissions: result,
      allPermissions: ALL_PERMISSIONS,
      roles: ROLES,
      lockedAdminPermissions: LOCKED_ADMIN_PERMISSIONS,
    })
  } catch (error: unknown) {
    return accessErrorResponse(error) ||
      NextResponse.json({ message: "Server error" }, { status: 500 })
  }
}

// PUT: อัพเดท permissions ของ role
export async function PUT(req: NextRequest) {
  try {
    const actor = await requireAccess(req, {
      roles: ["ADMIN"],
      permission: "PERMISSION_MANAGE",
    })
    const body = await req.json()
    const role = typeof body.role === "string" ? body.role : ""
    const permissions = Array.isArray(body.permissions) ? body.permissions : null

    if (!ROLES.includes(role as (typeof ROLES)[number]) || !permissions) {
      return NextResponse.json({ message: "ข้อมูลสิทธิ์ไม่ถูกต้อง" }, { status: 400 })
    }
    if (
      permissions.some(
        (permission: unknown) =>
          typeof permission !== "string" ||
          !ALL_PERMISSIONS.includes(permission as Permission),
      )
    ) {
      return NextResponse.json({ message: "พบสิทธิ์ที่ระบบไม่รองรับ" }, { status: 400 })
    }

    const normalizedPermissions = Array.from(new Set(permissions)) as Permission[]

    // ป้องกันการลบ locked permissions ของ ADMIN
    if (role === "ADMIN") {
      const missingLocked = LOCKED_ADMIN_PERMISSIONS.filter(
        (permission) => !normalizedPermissions.includes(permission)
      )
      if (missingLocked.length > 0) {
        return NextResponse.json(
          { message: `ไม่สามารถลบสิทธิ์ ${missingLocked.join(", ")} ของ ADMIN ได้` },
          { status: 400 }
        )
      }
    }

    const previousRows = await prisma.rolePermission.findMany({
      where: { role: role as (typeof ROLES)[number] },
      select: { permission: true },
    })
    const previousPermissions = previousRows.map((row) => row.permission)
    const added = normalizedPermissions.filter(
      (permission) => !previousPermissions.includes(permission),
    )
    const removed = previousPermissions.filter(
      (permission) => !normalizedPermissions.includes(permission),
    )

    await prisma.$transaction(async (tx) => {
      await tx.rolePermission.deleteMany({
        where: { role: role as (typeof ROLES)[number] },
      })

      if (normalizedPermissions.length > 0) {
        await tx.rolePermission.createMany({
          data: normalizedPermissions.map((permission) => ({
            role: role as (typeof ROLES)[number],
            permission,
          })),
        })
      }

      await tx.log.create({
        data: {
          userId: actor.userId,
          action: "ROLE_PERMISSIONS_UPDATED",
          metadata: { role, added, removed },
        },
      })
    })

    // ล้าง cache ของ role นี้
    clearPermissionCache(role)

    return NextResponse.json({ message: "อัพเดทสิทธิ์เรียบร้อยแล้ว" })
  } catch (error: unknown) {
    return accessErrorResponse(error) ||
      NextResponse.json({ message: "Server error" }, { status: 500 })
  }
}
