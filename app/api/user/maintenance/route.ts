import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { verifyToken } from "@/lib/auth"
import { MaintenanceStatus } from "@/app/generated/prisma/client"

// GET: Fetch maintenance history for the logged-in user
export async function GET(req: NextRequest) {
  try {
    const decoded = verifyToken(req)
    
    const maintenances = await prisma.maintenance.findMany({
      where: { reporterId: decoded.userId },
      include: {
        vehicle: { include: { type: true } }
      },
      orderBy: { startDate: "desc" }
    })

    return NextResponse.json(maintenances)
  } catch (error: any) {
    if (error.message === "No token" || error.message === "Not authorized") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }
    return NextResponse.json({ message: "Server error" }, { status: 500 })
  }
}

// POST: Report a new maintenance issue
export async function POST(req: NextRequest) {
  try {
    const decoded = verifyToken(req)
    const { vehicleId, description, startDate } = await req.json()

    if (!vehicleId || !description || !startDate) {
      return NextResponse.json({ message: "กรุณากรอกข้อมูลให้ครบถ้วน" }, { status: 400 })
    }

    const start = new Date(startDate)

    const maintenance = await prisma.maintenance.create({
      data: {
        vehicleId,
        reporterId: decoded.userId,
        description,
        startDate: start,
        status: MaintenanceStatus.REPORTED
      },
      include: {
        vehicle: { include: { type: true } }
      }
    })

    return NextResponse.json(maintenance, { status: 201 })
  } catch (error: any) {
    if (error.message === "No token" || error.message === "Not authorized") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }
    return NextResponse.json({ message: "Server error" }, { status: 500 })
  }
}
