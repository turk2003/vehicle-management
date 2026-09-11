import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { accessErrorResponse, requireAccess } from "@/lib/permissions"
import { MaintenanceStatus, MaintenanceType } from "@/app/generated/prisma/client"
import { emailAdminsAboutMaintenanceReport } from "@/lib/email/maintenanceNotifications"

// GET: Fetch maintenance history for the logged-in user
export async function GET(req: NextRequest) {
  try {
    const decoded = await requireAccess(req, {
      roles: ["USER"],
      permission: "MAINTENANCE_VIEW",
    })
    
    const maintenances = await prisma.maintenance.findMany({
      where: { reporterId: decoded.userId },
      include: {
        vehicle: { include: { type: true } }
      },
      orderBy: { startDate: "desc" }
    })

    return NextResponse.json(maintenances)
  } catch (error: unknown) {
    const accessResponse = accessErrorResponse(error)
    if (accessResponse) return accessResponse
    return NextResponse.json({ message: "Server error" }, { status: 500 })
  }
}

// POST: Report a new maintenance issue
export async function POST(req: NextRequest) {
  try {
    const decoded = await requireAccess(req, {
      roles: ["USER"],
      permission: "MAINTENANCE_REPORT",
    })
    const { vehicleId, description, startDate, maintenanceType } = await req.json()

    const allowedTypes = new Set<MaintenanceType>([
      MaintenanceType.BREAKDOWN,
      MaintenanceType.PREVENTIVE,
      MaintenanceType.OTHER
    ])

    if (
      !vehicleId ||
      !description ||
      !startDate ||
      !allowedTypes.has(maintenanceType as MaintenanceType)
    ) {
      return NextResponse.json({ message: "กรุณากรอกข้อมูลให้ครบถ้วน" }, { status: 400 })
    }

    const start = new Date(startDate)

    const { maintenance, admins } = await prisma.$transaction(async (tx) => {
      const createdMaintenance = await tx.maintenance.create({
        data: {
          vehicleId,
          reporterId: decoded.userId,
          description,
          maintenanceType: maintenanceType as MaintenanceType,
          startDate: start,
          status: MaintenanceStatus.REPORTED
        },
        include: {
          vehicle: { include: { type: true } },
          reporter: { select: { name: true, email: true } }
        }
      })

      const adminRecipients = await tx.user.findMany({
        where: { role: "ADMIN" },
        select: { id: true, name: true, email: true }
      })

      if (adminRecipients.length > 0) {
        await tx.notification.createMany({
          data: adminRecipients.map((admin) => ({
            userId: admin.id,
            type: "MAINTENANCE" as const,
            message: `มีรายงานรถเสีย ${createdMaintenance.vehicle.plateNumber}: ${description}`,
            maintenanceId: createdMaintenance.id
          }))
        })
      }

      return {
        maintenance: createdMaintenance,
        admins: adminRecipients.map(({ name, email }) => ({ name, email }))
      }
    })

    await emailAdminsAboutMaintenanceReport(maintenance, admins)

    return NextResponse.json(maintenance, { status: 201 })
  } catch (error: unknown) {
    const accessResponse = accessErrorResponse(error)
    if (accessResponse) return accessResponse
    return NextResponse.json({ message: "Server error" }, { status: 500 })
  }
}
