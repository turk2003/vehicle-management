import "dotenv/config"
import {
  Permission,
  PrismaClient,
  UserRole,
} from "../app/generated/prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"

const connectionString = `${process.env.DATABASE_URL}`
const adapter = new PrismaPg({ connectionString })
const prisma = new PrismaClient({ adapter })

// Default permissions สำหรับแต่ละ role
const DEFAULT_PERMISSIONS: Record<UserRole, Permission[]> = {
  [UserRole.ADMIN]: [
    "BOOKING_VIEW", "BOOKING_CREATE", "BOOKING_APPROVE", "BOOKING_MANAGE", "BOOKING_DELETE",
    "VEHICLE_VIEW", "VEHICLE_MANAGE",
    "MAINTENANCE_VIEW", "MAINTENANCE_REPORT", "MAINTENANCE_MANAGE",
    "USER_MANAGE",
    "REPORT_VIEW",
    "PERMISSION_MANAGE",
  ],
  [UserRole.APPROVER]: [
    "BOOKING_VIEW", "BOOKING_APPROVE",
    "VEHICLE_VIEW",
    "MAINTENANCE_VIEW",
  ],
  [UserRole.USER]: [
    "BOOKING_VIEW", "BOOKING_CREATE",
    "VEHICLE_VIEW",
    "MAINTENANCE_VIEW", "MAINTENANCE_REPORT",
  ],
}

async function main() {
  console.log("🌱 Seeding default permissions...")

  for (const role of Object.values(UserRole)) {
    const permissions = DEFAULT_PERMISSIONS[role]
    for (const permission of permissions) {
      await prisma.rolePermission.upsert({
        where: {
          role_permission: {
            role,
            permission,
          },
        },
        update: {},
        create: {
          role,
          permission,
        },
      })
    }
    console.log(`✅ ${role}: ${permissions.length} permissions`)
  }

  console.log("✅ Default permissions seeded!")
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
