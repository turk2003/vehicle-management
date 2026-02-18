import "dotenv/config"
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient, UserRole } from '../app/generated/prisma/client'
import bcrypt from "bcryptjs"

const connectionString = `${process.env.DATABASE_URL}`
const adapter = new PrismaPg({ connectionString })
const prisma = new PrismaClient({ adapter })

async function main() {
  try {
    // Create Admin User
    const adminEmail = "admin@system.com"
    const adminPassword = "admin123"

    const existingAdmin = await prisma.user.findUnique({
      where: { email: adminEmail },
    })

    if (!existingAdmin) {
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
    } else {
      console.log("👤 Admin user already exists")
    }

    // Create Vehicle Types
    const vehicleTypes = [
      { name: "Van" },
      { name: "Cable Car" },
      { name: "Truck" }
    ]

    console.log("Creating vehicle types...")
    for (const typeData of vehicleTypes) {
      const existingType = await prisma.vehicleType.findFirst({
        where: { name: typeData.name }
      })

      if (!existingType) {
        await prisma.vehicleType.create({
          data: typeData
        })
        console.log(`🚗 Vehicle type "${typeData.name}" created`)
      } else {
        console.log(`🚗 Vehicle type "${typeData.name}" already exists`)
      }
    }

    // Get all vehicle types for creating vehicles
    const createdTypes = await prisma.vehicleType.findMany()
    
    // Create Sample Vehicles
    const sampleVehicles = [
      { plateNumber: "ABC-1234", typeName: "Van", status: "AVAILABLE" },
      { plateNumber: "DEF-5678", typeName: "Cable Car", status: "AVAILABLE" },
      { plateNumber: "GHI-9012", typeName: "Truck", status: "BOOKED" },
    ]

    console.log("Creating sample vehicles...")
    for (const vehicleData of sampleVehicles) {
      const existingVehicle = await prisma.vehicle.findUnique({
        where: { plateNumber: vehicleData.plateNumber }
      })

      if (!existingVehicle) {
        const vehicleType = createdTypes.find(type => type.name === vehicleData.typeName)
        
        if (vehicleType) {
          await prisma.vehicle.create({
            data: {
              plateNumber: vehicleData.plateNumber,
              typeId: vehicleType.id,
              status: vehicleData.status as any,
            }
          })
          console.log(`🚙 Vehicle "${vehicleData.plateNumber}" created`)
        } else {
          console.log(`❌ Vehicle type "${vehicleData.typeName}" not found for ${vehicleData.plateNumber}`)
        }
      } else {
        console.log(`🚙 Vehicle "${vehicleData.plateNumber}" already exists`)
      }
    }

    console.log("✅ Seed completed successfully!")

  } catch (error) {
    console.error("❌ Error during seeding:", error)
    throw error
  }
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
    console.log("🔌 Database disconnected")
  })