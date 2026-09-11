import { beforeEach, describe, expect, it, vi } from "vitest"
import { DELETE, POST, PUT } from "../route"
import { requireAccess } from "@/lib/permissions"

const prismaMock = vi.hoisted(() => ({
  vehicle: {
    findUnique: vi.fn(),
    findFirst: vi.fn(),
    create: vi.fn(),
    delete: vi.fn(),
    update: vi.fn(),
  },
  booking: { findFirst: vi.fn() },
  maintenance: { findFirst: vi.fn() },
}))

vi.mock("@/lib/prisma", () => ({ prisma: prismaMock }))
vi.mock("@/lib/permissions", async (importOriginal) => {
  const original = await importOriginal<typeof import("@/lib/permissions")>()
  return { ...original, requireAccess: vi.fn() }
})

describe("vehicle deletion", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(requireAccess).mockResolvedValue({
      userId: "admin-1",
      role: "ADMIN",
      isActive: true,
    })
    prismaMock.booking.findFirst.mockResolvedValue(null)
  })

  it("returns a conflict instead of deleting a vehicle with maintenance history", async () => {
    prismaMock.maintenance.findFirst.mockResolvedValue({ id: "maintenance-1" })

    const response = await DELETE(
      new Request("http://localhost:3000/api/verhicle?id=vehicle-1", {
        method: "DELETE",
      }) as Parameters<typeof DELETE>[0],
    )

    expect(response.status).toBe(409)
    await expect(response.json()).resolves.toMatchObject({
      code: "VEHICLE_HAS_HISTORY",
    })
    expect(prismaMock.vehicle.delete).not.toHaveBeenCalled()
  })
})
vi.mock("@/lib/syncStatuses", () => ({
  syncAllVehicleStatuses: vi.fn(),
}))

describe("vehicle mileage management", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(requireAccess).mockResolvedValue({
      userId: "admin-1",
      role: "ADMIN",
      isActive: true,
    })
    prismaMock.vehicle.findUnique.mockResolvedValue(null)
    prismaMock.vehicle.findFirst.mockResolvedValue(null)
    prismaMock.vehicle.create.mockResolvedValue({ id: "vehicle-1" })
    prismaMock.vehicle.update.mockResolvedValue({ id: "vehicle-1" })
  })

  it("stores the initial mileage when an admin creates a vehicle", async () => {
    const response = await POST(
      new Request("http://localhost:3000/api/verhicle", {
        method: "POST",
        body: JSON.stringify({
          plateNumber: "กข 1234",
          typeId: "type-1",
          status: "AVAILABLE",
          currentMileage: "12500",
        }),
      }) as Parameters<typeof POST>[0],
    )

    expect(response.status).toBe(200)
    expect(prismaMock.vehicle.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ currentMileage: 12500 }),
      }),
    )
  })

  it("updates the current mileage as a non-negative integer", async () => {
    const response = await PUT(
      new Request("http://localhost:3000/api/verhicle", {
        method: "PUT",
        body: JSON.stringify({
          id: "vehicle-1",
          plateNumber: "กข 1234",
          typeId: "type-1",
          status: "AVAILABLE",
          currentMileage: "12850",
        }),
      }) as Parameters<typeof PUT>[0],
    )

    expect(response.status).toBe(200)
    expect(prismaMock.vehicle.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ currentMileage: 12850 }),
      }),
    )
  })

  it.each([
    { value: -1, message: "เลขไมล์ต้องเป็นจำนวนเต็มตั้งแต่ 0 ขึ้นไป" },
    { value: 12.5, message: "เลขไมล์ต้องเป็นจำนวนเต็มตั้งแต่ 0 ขึ้นไป" },
    { value: "", message: "กรุณาระบุเลขไมล์ปัจจุบัน" },
  ])("rejects invalid mileage $value", async ({ value, message }) => {
    const response = await PUT(
      new Request("http://localhost:3000/api/verhicle", {
        method: "PUT",
        body: JSON.stringify({
          id: "vehicle-1",
          plateNumber: "กข 1234",
          typeId: "type-1",
          status: "AVAILABLE",
          currentMileage: value,
        }),
      }) as Parameters<typeof PUT>[0],
    )

    expect(response.status).toBe(400)
    await expect(response.json()).resolves.toEqual({ message })
    expect(prismaMock.vehicle.update).not.toHaveBeenCalled()
  })
})
