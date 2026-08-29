import { beforeEach, describe, expect, it, vi } from "vitest"
import { getVehicleHistoryDetails, HistoryDetailsInputError } from "../index"

const prismaMock = vi.hoisted(() => ({
  booking: { findMany: vi.fn() },
  maintenance: { findMany: vi.fn() },
}))

vi.mock("@/lib/prisma", () => ({ prisma: prismaMock }))

const vehicle = { id: "vehicle-1", plateNumber: "กข 1234", type: { name: "รถตู้" } }
const user = { id: "user-1", name: "สมชาย" }

describe("vehicle history details", () => {
  beforeEach(() => vi.clearAllMocks())

  it("sorts every trip status by its effective date and paginates", async () => {
    prismaMock.booking.findMany.mockResolvedValue([
      {
        id: "completed",
        purpose: "ประชุม",
        status: "COMPLETED",
        startDate: new Date("2026-08-01T01:00:00Z"),
        endDate: new Date("2026-08-01T08:00:00Z"),
        pickedUpAt: null,
        returnedAt: new Date("2026-08-02T04:00:00Z"),
        mileageStart: 100,
        mileageEnd: 130,
        user,
        vehicle,
      },
      {
        id: "pending",
        purpose: "ส่งเอกสาร",
        status: "PENDING",
        startDate: new Date("2026-08-03T01:00:00Z"),
        endDate: new Date("2026-08-03T04:00:00Z"),
        pickedUpAt: null,
        returnedAt: null,
        mileageStart: null,
        mileageEnd: null,
        user,
        vehicle,
      },
    ])

    const result = await getVehicleHistoryDetails({
      tab: "trips",
      startDate: "2026-08-01",
      endDate: "2026-08-03",
      page: 1,
      pageSize: 1,
    })

    expect(result.pagination).toEqual({ page: 1, pageSize: 1, total: 2, totalPages: 2 })
    expect(result.items[0]).toMatchObject({ id: "pending", distanceKm: null })
    expect(prismaMock.booking.findMany).toHaveBeenCalledWith(expect.objectContaining({
      where: expect.objectContaining({ OR: expect.any(Array) }),
    }))
  })

  it("keeps completed mileage rows with missing mileage as distanceKm null", async () => {
    prismaMock.booking.findMany.mockResolvedValue([
      {
        id: "missing-mileage",
        purpose: "ลงพื้นที่",
        status: "COMPLETED",
        startDate: new Date("2026-08-01T01:00:00Z"),
        endDate: new Date("2026-08-01T08:00:00Z"),
        pickedUpAt: null,
        returnedAt: null,
        mileageStart: 500,
        mileageEnd: null,
        user,
        vehicle,
      },
    ])

    const result = await getVehicleHistoryDetails({
      tab: "mileage",
      startDate: "2026-08-01",
      endDate: "2026-08-01",
    })

    expect(result.items[0]).toMatchObject({ id: "missing-mileage", distanceKm: null })
  })

  it("returns all maintenance types and statuses within the Bangkok date range", async () => {
    const maintenance = {
      id: "maintenance-1",
      description: "เปลี่ยนน้ำมันเครื่อง",
      repairDetails: null,
      serviceCenterName: "ศูนย์ A",
      cost: 1500,
      maintenanceType: "PREVENTIVE",
      status: "COMPLETED",
      startDate: new Date("2026-08-01T02:00:00Z"),
      endDate: new Date("2026-08-01T05:00:00Z"),
      reporter: user,
      vehicle,
    }
    prismaMock.maintenance.findMany.mockResolvedValue([maintenance])

    const result = await getVehicleHistoryDetails({
      tab: "maintenance",
      vehicleId: "vehicle-1",
      startDate: "2026-08-01",
      endDate: "2026-08-01",
    })

    expect(result.items).toEqual([maintenance])
    expect(prismaMock.maintenance.findMany).toHaveBeenCalledWith(expect.objectContaining({
      where: {
        vehicleId: "vehicle-1",
        startDate: {
          gte: new Date("2026-07-31T17:00:00.000Z"),
          lt: new Date("2026-08-01T17:00:00.000Z"),
        },
      },
    }))
  })

  it("rejects page sizes over 100", async () => {
    await expect(getVehicleHistoryDetails({ tab: "trips", pageSize: 101 })).rejects.toBeInstanceOf(HistoryDetailsInputError)
  })
})
