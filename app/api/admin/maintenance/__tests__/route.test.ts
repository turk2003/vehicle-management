import { beforeEach, describe, expect, it, vi } from "vitest"
import { GET, POST, PUT } from "../route"
import { requireAccess } from "@/lib/permissions"

const prismaMock = vi.hoisted(() => ({
  maintenance: {
    create: vi.fn(),
    findMany: vi.fn(),
    findUnique: vi.fn(),
    update: vi.fn(),
    findFirst: vi.fn(),
  },
  booking: {
    findMany: vi.fn(),
    findFirst: vi.fn(),
  },
  vehicle: {
    update: vi.fn(),
  },
}))

vi.mock("@/lib/prisma", () => ({ prisma: prismaMock }))
vi.mock("@/lib/permissions", () => ({
  requireAccess: vi.fn(),
  accessErrorResponse: vi.fn(() => null),
}))
vi.mock("@/lib/syncStatuses", () => ({
  syncAllVehicleStatuses: vi.fn(),
}))

describe("GET /api/admin/maintenance", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(requireAccess).mockResolvedValue({
      userId: "admin-1",
      role: "ADMIN",
      isActive: true,
    })
  })

  it("adds overlapping active bookings to each maintenance item", async () => {
    prismaMock.maintenance.findMany.mockResolvedValue([
      {
        id: "maintenance-1",
        vehicleId: "vehicle-1",
        startDate: new Date("2050-01-02T09:00:00.000Z"),
        endDate: new Date("2050-01-03T09:00:00.000Z"),
      },
    ])
    prismaMock.booking.findMany.mockResolvedValue([
      {
        id: "booking-overlap",
        vehicleId: "vehicle-1",
        startDate: new Date("2050-01-02T10:00:00.000Z"),
        endDate: new Date("2050-01-02T11:00:00.000Z"),
        status: "APPROVED",
        purpose: "ส่งเอกสาร",
        destination: "สำนักงานใหญ่",
        user: { id: "user-1", name: "User One" },
      },
      {
        id: "booking-later",
        vehicleId: "vehicle-1",
        startDate: new Date("2050-01-04T10:00:00.000Z"),
        endDate: new Date("2050-01-04T11:00:00.000Z"),
        status: "APPROVED",
        purpose: "ประชุม",
        destination: null,
        user: { id: "user-2", name: "User Two" },
      },
    ])

    const response = await GET(
      new Request("http://localhost:3000/api/admin/maintenance") as Parameters<typeof GET>[0],
    )
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data[0].affectedBookings).toHaveLength(1)
    expect(data[0].affectedBookings[0]).toMatchObject({
      id: "booking-overlap",
      purpose: "ส่งเอกสาร",
      user: { name: "User One" },
    })
  })
})

describe("PUT /api/admin/maintenance", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(requireAccess).mockResolvedValue({
      userId: "admin-1",
      role: "ADMIN",
      isActive: true,
    })
    prismaMock.maintenance.findUnique.mockResolvedValue({
      id: "maintenance-1",
      vehicleId: "vehicle-1",
      status: "IN_PROGRESS",
      startDate: new Date("2026-08-01T02:00:00.000Z"),
      vehicle: { id: "vehicle-1" },
    })
    prismaMock.maintenance.update.mockResolvedValue({
      id: "maintenance-1",
      status: "COMPLETED",
    })
    prismaMock.maintenance.findFirst.mockResolvedValue(null)
    prismaMock.booking.findFirst.mockResolvedValue(null)
    prismaMock.vehicle.update.mockResolvedValue({ id: "vehicle-1" })
  })

  it("persists closing details, service center and cost", async () => {
    const response = await PUT(
      new Request("http://localhost:3000/api/admin/maintenance", {
        method: "PUT",
        body: JSON.stringify({
          id: "maintenance-1",
          description: "ซ่อมระบบเบรก",
          maintenanceType: "BREAKDOWN",
          repairDetails: "เปลี่ยนผ้าเบรกหน้า",
          serviceCenterName: "อู่ตัวอย่าง",
          cost: "2750.50",
          startDate: "2026-08-01T09:00:00.000+07:00",
          endDate: "2026-08-02T15:30:00.000+07:00",
          status: "COMPLETED",
        }),
      }) as Parameters<typeof PUT>[0],
    )

    expect(response.status).toBe(200)
    expect(prismaMock.maintenance.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          repairDetails: "เปลี่ยนผ้าเบรกหน้า",
          serviceCenterName: "อู่ตัวอย่าง",
          cost: 2750.5,
          endDate: new Date("2026-08-02T08:30:00.000Z"),
          status: "COMPLETED",
        }),
      }),
    )
  })

  it("rejects a negative closing cost before updating the database", async () => {
    const response = await PUT(
      new Request("http://localhost:3000/api/admin/maintenance", {
        method: "PUT",
        body: JSON.stringify({
          id: "maintenance-1",
          cost: "-1",
          status: "COMPLETED",
          endDate: "2026-08-02T15:30:00.000+07:00",
        }),
      }) as Parameters<typeof PUT>[0],
    )

    expect(response.status).toBe(400)
    expect(prismaMock.maintenance.update).not.toHaveBeenCalled()
  })

  it("requires an end date when closing maintenance", async () => {
    const response = await PUT(
      new Request("http://localhost:3000/api/admin/maintenance", {
        method: "PUT",
        body: JSON.stringify({
          id: "maintenance-1",
          status: "COMPLETED",
          endDate: "",
        }),
      }) as Parameters<typeof PUT>[0],
    )

    expect(response.status).toBe(400)
    await expect(response.json()).resolves.toMatchObject({
      message: "กรุณาระบุวันที่เสร็จเมื่อปิดงานซ่อม",
    })
    expect(prismaMock.maintenance.update).not.toHaveBeenCalled()
  })
})

describe("POST /api/admin/maintenance", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(requireAccess).mockResolvedValue({
      userId: "admin-1",
      role: "ADMIN",
      isActive: true,
    })
    prismaMock.booking.findMany.mockResolvedValue([])
    prismaMock.maintenance.create.mockResolvedValue({ id: "maintenance-new" })
  })

  it("persists optional service details when an admin creates maintenance", async () => {
    const response = await POST(
      new Request("http://localhost:3000/api/admin/maintenance", {
        method: "POST",
        body: JSON.stringify({
          vehicleId: "vehicle-1",
          description: "ตรวจระบบช่วงล่าง",
          maintenanceType: "PREVENTIVE",
          repairDetails: "เปลี่ยนบูชปีกนก",
          serviceCenterName: "ศูนย์บริการ B",
          cost: 1800,
          startDate: "2050-08-01T09:00:00.000+07:00",
          status: "REPORTED",
        }),
      }) as Parameters<typeof POST>[0],
    )

    expect(response.status).toBe(201)
    expect(prismaMock.maintenance.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          repairDetails: "เปลี่ยนบูชปีกนก",
          serviceCenterName: "ศูนย์บริการ B",
          cost: 1800,
        }),
      }),
    )
  })
})
