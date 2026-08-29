import { beforeEach, describe, expect, it, vi } from "vitest"
import { calculateVehicleUsageAnalysis } from "../calculate"

const prismaMock = vi.hoisted(() => ({
  vehicle: { findMany: vi.fn() },
  booking: { findMany: vi.fn() },
  maintenance: { findMany: vi.fn() },
}))

vi.mock("@/lib/prisma", () => ({ prisma: prismaMock }))

const vehicles = [
  {
    id: "vehicle-1",
    plateNumber: "กข-1111",
    status: "AVAILABLE",
    currentMileage: 1_000,
    typeId: "type-van",
    type: { name: "รถตู้" },
  },
  {
    id: "vehicle-2",
    plateNumber: "กข-2222",
    status: "AVAILABLE",
    currentMileage: 2_000,
    typeId: "type-van",
    type: { name: "รถตู้" },
  },
  {
    id: "vehicle-3",
    plateNumber: "กข-3333",
    status: "AVAILABLE",
    currentMileage: 3_000,
    typeId: "type-van",
    type: { name: "รถตู้" },
  },
]

const booking = (
  overrides: Partial<{
    vehicleId: string
    userId: string
    userName: string
    startDate: Date
    endDate: Date
    returnedAt: Date | null
    pickedUpAt: Date | null
    mileageStart: number | null
    mileageEnd: number | null
  }> = {},
) => ({
  vehicleId: overrides.vehicleId || "vehicle-1",
  userId: overrides.userId || "user-1",
  startDate: overrides.startDate || new Date("2026-08-03T01:00:00.000Z"),
  endDate: overrides.endDate || new Date("2026-08-03T03:00:00.000Z"),
  returnedAt:
    overrides.returnedAt === undefined
      ? new Date("2026-08-03T03:00:00.000Z")
      : overrides.returnedAt,
  pickedUpAt:
    overrides.pickedUpAt === undefined
      ? new Date("2026-08-03T01:00:00.000Z")
      : overrides.pickedUpAt,
  mileageStart: overrides.mileageStart === undefined ? 100 : overrides.mileageStart,
  mileageEnd: overrides.mileageEnd === undefined ? 200 : overrides.mileageEnd,
  user: { name: overrides.userName || "สมชาย" },
})

describe("calculateVehicleUsageAnalysis", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    prismaMock.vehicle.findMany.mockResolvedValue(vehicles)
    prismaMock.booking.findMany.mockResolvedValue([
      booking(),
      booking({
        endDate: new Date("2026-08-04T04:00:00.000Z"),
        returnedAt: null,
        pickedUpAt: null,
        mileageStart: 200,
        mileageEnd: 350,
      }),
      booking({
        vehicleId: "vehicle-2",
        userId: "user-2",
        userName: "สมหญิง",
        returnedAt: new Date("2026-08-05T03:00:00.000Z"),
        mileageStart: 500,
        mileageEnd: 700,
      }),
      booking({
        vehicleId: "vehicle-3",
        userId: "user-2",
        userName: "สมหญิง",
        returnedAt: new Date("2026-08-06T03:00:00.000Z"),
        mileageStart: 700,
        mileageEnd: 1_000,
      }),
      booking({
        returnedAt: new Date("2026-07-10T03:00:00.000Z"),
        mileageStart: 50,
        mileageEnd: 100,
      }),
    ])
    prismaMock.maintenance.findMany.mockResolvedValue([
      { vehicleId: "vehicle-1", maintenanceType: "BREAKDOWN" },
      { vehicleId: "vehicle-1", maintenanceType: "PREVENTIVE" },
      { vehicleId: "vehicle-2", maintenanceType: "BREAKDOWN" },
    ])
  })

  it("computes deterministic vehicle, user, peer, and maintenance metrics", async () => {
    const result = await calculateVehicleUsageAnalysis({
      startDate: "2026-08-01",
      endDate: "2026-08-31",
    })

    expect(result.totals).toMatchObject({
      tripCount: 4,
      totalDistanceKm: 750,
      uniqueUsersCount: 2,
      breakdownCount: 2,
      preventiveCount: 1,
      previousTripCount: 1,
      tripCountChangePercent: 300,
    })
    expect(result.vehicles[0]).toMatchObject({
      usageCount: 2,
      totalDistanceKm: 250,
      avgDistancePerTripKm: 125,
      breakdownRatePer10kKm: 40,
      comparableVehicleCount: 3,
      peerMedianUsageCount: 1,
      peerMedianDistanceKm: 250,
      peerMedianBreakdownRatePer10kKm: 40,
    })
    expect(result.users.map((user) => user.name)).toEqual(["สมหญิง", "สมชาย"])
    expect(result.users[0]).toMatchObject({
      tripCount: 2,
      totalDistanceKm: 500,
      usageSharePercent: 50,
      vehicleCount: 2,
    })
    expect(result.dataCompleteness.actualPickupCoveragePercent).toBe(75)
    expect(result.dataLimitations).toContain(
      "เที่ยวข้อมูลเดิมบางรายการใช้เวลาสิ้นสุดการจองแทนเวลาคืนรถจริง",
    )
  })

  it("focuses user totals on one vehicle but keeps same-type peer medians", async () => {
    const result = await calculateVehicleUsageAnalysis({
      vehicleId: "vehicle-1",
      startDate: "2026-08-01",
      endDate: "2026-08-31",
    })

    expect(result.totals.tripCount).toBe(2)
    expect(result.users).toHaveLength(1)
    expect(result.vehicles).toHaveLength(1)
    expect(result.vehicles[0].peerMedianUsageCount).toBe(1)
  })

  it("returns null rates and a mileage limitation when distance is unusable", async () => {
    prismaMock.booking.findMany.mockResolvedValue([
      booking({ mileageStart: null, mileageEnd: null }),
    ])
    prismaMock.maintenance.findMany.mockResolvedValue([
      { vehicleId: "vehicle-1", maintenanceType: "BREAKDOWN" },
    ])

    const result = await calculateVehicleUsageAnalysis({
      vehicleId: "vehicle-1",
      startDate: "2026-08-01",
      endDate: "2026-08-31",
    })

    expect(result.vehicles[0].breakdownRatePer10kKm).toBeNull()
    expect(result.dataCompleteness.mileageCoveragePercent).toBe(0)
    expect(result.dataLimitations[0]).toContain("ข้อมูลเลขไมล์ครบ 0%")
  })

  it("does not publish a peer breakdown median from fewer than three usable rates", async () => {
    prismaMock.booking.findMany.mockResolvedValue([
      booking({ vehicleId: "vehicle-1", mileageStart: 100, mileageEnd: 200 }),
      booking({ vehicleId: "vehicle-2", mileageStart: 300, mileageEnd: 300 }),
      booking({ vehicleId: "vehicle-3", mileageStart: 400, mileageEnd: 400 }),
    ])
    prismaMock.maintenance.findMany.mockResolvedValue([
      { vehicleId: "vehicle-1", maintenanceType: "BREAKDOWN" },
    ])

    const result = await calculateVehicleUsageAnalysis({
      startDate: "2026-08-01",
      endDate: "2026-08-31",
    })

    expect(result.vehicles[0].comparableVehicleCount).toBe(3)
    expect(result.vehicles[0].peerMedianBreakdownRatePer10kKm).toBeNull()
  })
})
