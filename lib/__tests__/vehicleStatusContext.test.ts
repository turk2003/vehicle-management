import { beforeEach, describe, expect, it, vi } from "vitest"
import { getVehicleStatusContexts } from "../vehicleStatusContext"

const prismaMock = vi.hoisted(() => ({
  maintenance: { findMany: vi.fn() },
  booking: { findMany: vi.fn() },
}))

vi.mock("../prisma", () => ({ prisma: prismaMock }))

describe("getVehicleStatusContexts", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("groups active maintenance and bookings by vehicle", async () => {
    prismaMock.maintenance.findMany.mockResolvedValue([
      { id: "m1", vehicleId: "v1", description: "ยางรั่ว" },
    ])
    prismaMock.booking.findMany
      .mockResolvedValueOnce([{ id: "b1", vehicleId: "v2", user: { name: "test01" } }])
      .mockResolvedValueOnce([{ id: "b2", vehicleId: "v1", user: { name: "turk" } }])

    const result = await getVehicleStatusContexts(["v1", "v2"])

    expect(result.v1).toEqual({
      activeMaintenances: [{ id: "m1", vehicleId: "v1", description: "ยางรั่ว" }],
      inProgressBookings: [],
      scheduledBookings: [{ id: "b2", vehicleId: "v1", user: { name: "turk" } }],
    })
    expect(result.v2.inProgressBookings).toHaveLength(1)
    expect(prismaMock.maintenance.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ status: { in: ["REPORTED", "IN_PROGRESS"] } }),
      }),
    )
  })

  it("skips queries when there are no vehicles", async () => {
    await expect(getVehicleStatusContexts([])).resolves.toEqual({})
    expect(prismaMock.maintenance.findMany).not.toHaveBeenCalled()
  })
})
