import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { verifyAdmin } from "@/lib/auth"
import { clearPermissionCache } from "@/lib/permissions"

const ALL_PERMISSIONS = [
  "BOOKING_VIEW", "BOOKING_CREATE", "BOOKING_APPROVE", "BOOKING_DELETE",
  "VEHICLE_VIEW", "VEHICLE_MANAGE",
  "MAINTENANCE_VIEW", "MAINTENANCE_MANAGE",
  "USER_MANAGE",
  "REPORT_VIEW",
]

const ROLES = ["ADMIN", "APPROVER", "USER"]

// ADMIN ต้องมีสิทธิ์เหล่านี้เสมอ (lock ไว้ ลบไม่ได้)
const LOCKED_ADMIN_PERMISSIONS = ["USER_MANAGE", "BOOKING_VIEW", "VEHICLE_VIEW"]

// GET: ดึง permissions ทั้งหมดของทุก role
export async function GET(req: NextRequest) {
  try {
    verifyAdmin(req)

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
  } catch (error: any) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
  }
}

// PUT: อัพเดท permissions ของ role
export async function PUT(req: NextRequest) {
  try {
    verifyAdmin(req)
    const { role, permissions } = await req.json()

    if (!ROLES.includes(role)) {
      return NextResponse.json({ message: "Invalid role" }, { status: 400 })
    }

    // ป้องกันการลบ locked permissions ของ ADMIN
    if (role === "ADMIN") {
      const missingLocked = LOCKED_ADMIN_PERMISSIONS.filter(
        (p) => !permissions.includes(p)
      )
      if (missingLocked.length > 0) {
        return NextResponse.json(
          { message: `ไม่สามารถลบสิทธิ์ ${missingLocked.join(", ")} ของ ADMIN ได้` },
          { status: 400 }
        )
      }
    }

    // ลบ permissions เก่าของ role นี้ทั้งหมด
    await prisma.rolePermission.deleteMany({
      where: { role: role as any },
    })

    // สร้าง permissions ใหม่
    if (permissions.length > 0) {
      await prisma.rolePermission.createMany({
        data: permissions.map((permission: string) => ({
          role: role as any,
          permission: permission as any,
        })),
      })
    }

    // ล้าง cache ของ role นี้
    clearPermissionCache(role)

    return NextResponse.json({ message: "อัพเดทสิทธิ์เรียบร้อยแล้ว" })
  } catch (error: any) {
    if (error.message === "Not authorized" || error.message === "No token") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }
    return NextResponse.json({ message: "Server error" }, { status: 500 })
  }
}
