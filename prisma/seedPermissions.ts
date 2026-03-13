import { PrismaClient } from "../app/generated/prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"

const connectionString = `${process.env.DATABASE_URL}`
const adapter = new PrismaPg({ connectionString })
const prisma = new PrismaClient({ adapter } as any)

// Default permissions สำหรับแต่ละ role
const DEFAULT_PERMISSIONS: Record<string, string[]> = {
  ADMIN: [
    "BOOKING_VIEW", "BOOKING_CREATE", "BOOKING_APPROVE", "BOOKING_DELETE",
    "VEHICLE_VIEW", "VEHICLE_MANAGE",
    "MAINTENANCE_VIEW", "MAINTENANCE_MANAGE",
    "USER_MANAGE",
    "REPORT_VIEW",
  ],
  APPROVER: [
    "BOOKING_VIEW", "BOOKING_APPROVE",
    "VEHICLE_VIEW",
    "MAINTENANCE_VIEW",
    "REPORT_VIEW",
  ],
  USER: [
    "BOOKING_VIEW", "BOOKING_CREATE",
    "VEHICLE_VIEW",
    "MAINTENANCE_VIEW",
  ],
}

async function main() {
  console.log("🌱 Seeding default permissions...")

  for (const [role, permissions] of Object.entries(DEFAULT_PERMISSIONS)) {
    for (const permission of permissions) {
      await prisma.rolePermission.upsert({
        where: {
          role_permission: {
            role: role as any,
            permission: permission as any,
          },
        },
        update: {},
        create: {
          role: role as any,
          permission: permission as any,
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
