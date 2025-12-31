import "dotenv/config"
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient, UserRole } from "../app/generated/prisma"
import bcrypt from "bcryptjs"

const connectionString = `${process.env.DATABASE_URL}`
const adapter = new PrismaPg({ connectionString })
const prisma = new PrismaClient({ adapter })

async function main() {
  const adminEmail = "admin@system.com"
  const adminPassword = "admin123"

  const existingAdmin = await prisma.user.findUnique({
    where: { email: adminEmail },
  })

  if (existingAdmin) {
    console.log(" Admin already exists")
    return
  }

  const hashedPassword = await bcrypt.hash(adminPassword, 10)

  await prisma.user.create({
    data: {
      name: "System Admin",
      email: adminEmail,
      password: hashedPassword,
      role: UserRole.ADMIN,
    },
  })

  console.log("🚀 Admin user created")
  console.log("📧 Email: admin@system.com")
  console.log("🔐 Password: admin123")
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect()
  })