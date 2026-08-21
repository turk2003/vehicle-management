import { beforeEach, describe, expect, it, vi } from "vitest"
import { POST } from "../route"
import { verifyToken } from "@/lib/auth"
import { emailAdminsAboutMaintenanceReport } from "@/lib/email/maintenanceNotifications"

const prismaMock = vi.hoisted(() => ({
  maintenance: {
    create: vi.fn()
  },
  user: {
    findMany: vi.fn()
  },
  notification: {
    createMany: vi.fn()
  },
  $transaction: vi.fn()
}))

vi.mock("@/lib/prisma", () => ({ prisma: prismaMock }))
vi.mock("@/lib/auth", () => ({ verifyToken: vi.fn() }))
vi.mock("@/lib/email/maintenanceNotifications", () => ({
  emailAdminsAboutMaintenanceReport: vi.fn()
}))

describe("POST /api/user/maintenance", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(verifyToken).mockReturnValue({ userId: "user-1", role: "USER" })
    prismaMock.$transaction.mockImplementation(
      async (callback: (tx: typeof prismaMock) => Promise<unknown>) =>
        callback(prismaMock)
    )
  })

  it("creates in-app notifications and emails every admin", async () => {
    const maintenance = {
      id: "maintenance-1",
      vehicleId: "vehicle-1",
      reporterId: "user-1",
      description: "ระบบเบรกขัดข้อง",
      startDate: new Date("2050-05-01T09:00:00.000Z"),
      status: "REPORTED",
      vehicle: {
        id: "vehicle-1",
        plateNumber: "กข-1234",
        type: { name: "Van" }
      },
      reporter: {
        name: "Somchai",
        email: "somchai@example.com"
      }
    }
    const admins = [
      {
        id: "admin-1",
        name: "Admin One",
        email: "admin1@example.com"
      },
      {
        id: "admin-2",
        name: "Admin Two",
        email: "admin2@example.com"
      }
    ]

    prismaMock.maintenance.create.mockResolvedValue(maintenance)
    prismaMock.user.findMany.mockResolvedValue(admins)
    prismaMock.notification.createMany.mockResolvedValue({ count: 2 })

    const response = await POST(
      new Request("http://localhost:3000/api/user/maintenance", {
        method: "POST",
        body: JSON.stringify({
          vehicleId: "vehicle-1",
          description: "ระบบเบรกขัดข้อง",
          startDate: "2050-05-01T09:00:00.000Z"
        })
      }) as Parameters<typeof POST>[0]
    )

    expect(response.status).toBe(201)
    expect(prismaMock.notification.createMany).toHaveBeenCalledWith({
      data: [
        expect.objectContaining({
          userId: "admin-1",
          type: "MAINTENANCE",
          maintenanceId: "maintenance-1"
        }),
        expect.objectContaining({
          userId: "admin-2",
          type: "MAINTENANCE",
          maintenanceId: "maintenance-1"
        })
      ]
    })
    expect(emailAdminsAboutMaintenanceReport).toHaveBeenCalledWith(
      maintenance,
      [
        { name: "Admin One", email: "admin1@example.com" },
        { name: "Admin Two", email: "admin2@example.com" }
      ]
    )
  })

  it("does not fail when no administrators exist", async () => {
    prismaMock.maintenance.create.mockResolvedValue({
      id: "maintenance-1",
      vehicleId: "vehicle-1",
      reporterId: "user-1",
      description: "ยางแบน",
      startDate: new Date("2050-05-01T09:00:00.000Z"),
      status: "REPORTED",
      vehicle: {
        id: "vehicle-1",
        plateNumber: "กข-1234",
        type: { name: "Van" }
      },
      reporter: {
        name: "Somchai",
        email: "somchai@example.com"
      }
    })
    prismaMock.user.findMany.mockResolvedValue([])

    const response = await POST(
      new Request("http://localhost:3000/api/user/maintenance", {
        method: "POST",
        body: JSON.stringify({
          vehicleId: "vehicle-1",
          description: "ยางแบน",
          startDate: "2050-05-01T09:00:00.000Z"
        })
      }) as Parameters<typeof POST>[0]
    )

    expect(response.status).toBe(201)
    expect(prismaMock.notification.createMany).not.toHaveBeenCalled()
    expect(emailAdminsAboutMaintenanceReport).toHaveBeenCalledWith(
      expect.any(Object),
      []
    )
  })
})
