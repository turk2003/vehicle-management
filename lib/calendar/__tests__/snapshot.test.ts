import { beforeEach, describe, expect, it, vi } from "vitest"
import { prismaMock } from "@/lib/__mocks__/prisma"
import { deriveCurrentVehicle, getCalendarSnapshot } from ".."

vi.mock("@/lib/prisma", async () => ({ prisma: (await import("@/lib/__mocks__/prisma")).prismaMock }))

const now = new Date("2026-10-22T05:00:00Z")
const base = { id: "vehicle-1", plateNumber: "กข 123", type: { name: "รถเก๋ง" } }
function currentBooking(overrides: Partial<Parameters<typeof deriveCurrentVehicle>[0]["bookings"][number]> = {}) {
  return {
    id: "trip-1", status: "IN_PROGRESS" as const,
    startDate: new Date("2026-09-30T01:00:00Z"), endDate: new Date("2026-10-01T10:00:00Z"),
    pickedUpAt: new Date("2026-09-30T01:00:00Z"), returnedAt: null, user: { name: "ผู้ถือรถเดิม" }, ...overrides,
  }
}

describe("current vehicle status and custody", () => {
  it("keeps overdue holders from previous months until a return is recorded", () => {
    const result = deriveCurrentVehicle({ ...base, bookings: [currentBooking()], maintenances: [] }, now)
    expect(result.status).toBe("IN_USE")
    expect(result.holders).toEqual([expect.objectContaining({ name: "ผู้ถือรถเดิม", overdue: true })])
  })

  it("does not infer a holder from an approval or an incomplete pickup", () => {
    const pendingPickup = currentBooking({ status: "APPROVED", startDate: new Date(now.getTime() - 1000), endDate: new Date(now.getTime() + 1000), pickedUpAt: null })
    expect(deriveCurrentVehicle({ ...base, bookings: [pendingPickup], maintenances: [] }, now)).toMatchObject({ status: "BOOKED", holders: [] })
    expect(deriveCurrentVehicle({ ...base, bookings: [currentBooking({ pickedUpAt: null })], maintenances: [] }, now)).toMatchObject({ status: "IN_USE", holders: [] })
  })

  it("removes returned holders and excludes expired or future approvals", () => {
    const bookings = [
      currentBooking({ status: "COMPLETED", returnedAt: now }),
      currentBooking({ status: "APPROVED", pickedUpAt: null }),
      currentBooking({ status: "CHANGED", startDate: new Date(now.getTime() + 1000), endDate: new Date(now.getTime() + 2000), pickedUpAt: null }),
    ]
    expect(deriveCurrentVehicle({ ...base, bookings, maintenances: [] }, now)).toMatchObject({ status: "AVAILABLE", holders: [] })
  })

  it("prioritizes active maintenance while retaining all holders", () => {
    const result = deriveCurrentVehicle({
      ...base,
      bookings: [currentBooking(), currentBooking({ id: "trip-2", user: { name: "ผู้ถือรถคนที่สอง" } })],
      maintenances: [{ status: "REPORTED", startDate: now, endDate: null }],
    }, now)
    expect(result.status).toBe("MAINTENANCE")
    expect(result.holders.map((holder) => holder.name)).toEqual(["ผู้ถือรถเดิม", "ผู้ถือรถคนที่สอง"])
  })

  it("prioritizes a pickup over an approval and accepts changed vehicle bookings", () => {
    const approval = currentBooking({ status: "CHANGED", startDate: now, endDate: new Date(now.getTime() + 1000), pickedUpAt: null })
    expect(deriveCurrentVehicle({ ...base, bookings: [approval], maintenances: [] }, now).status).toBe("BOOKED")
    expect(deriveCurrentVehicle({ ...base, bookings: [approval, currentBooking()], maintenances: [] }, now).status).toBe("IN_USE")
  })

  it("ignores expired, future and completed maintenance", () => {
    const maintenances = [
      { status: "IN_PROGRESS", startDate: new Date(now.getTime() - 1000), endDate: now },
      { status: "REPORTED", startDate: new Date(now.getTime() + 1000), endDate: null },
      { status: "COMPLETED", startDate: now, endDate: null },
    ]
    expect(deriveCurrentVehicle({ ...base, bookings: [], maintenances }, now).status).toBe("AVAILABLE")
  })
})

describe("calendar snapshot query", () => {
  beforeEach(() => {
    prismaMock.booking.findMany.mockResolvedValue([])
    prismaMock.vehicle.findMany.mockResolvedValue([])
  })

  it("loads overlapping bookings with a privacy-limited select and no mutations", async () => {
    const snapshot = await getCalendarSnapshot("2026-10", now)
    expect(snapshot).toEqual({ month: "2026-10", asOf: now.toISOString(), bookings: [], vehicles: [] })
    const query = prismaMock.booking.findMany.mock.calls[0][0]!
    expect(query.where).toEqual({
      status: { in: ["PENDING", "APPROVED", "CHANGED", "IN_PROGRESS", "COMPLETED"] },
      startDate: { lt: new Date("2026-10-31T17:00:00Z") },
      endDate: { gt: new Date("2026-09-30T17:00:00Z") },
    })
    expect(query.select?.user).toEqual({ select: { name: true } })
    expect(query.select).not.toHaveProperty("mileageStart")
    expect(query.select).not.toHaveProperty("mileageEnd")
    expect(prismaMock.booking.updateMany).not.toHaveBeenCalled()
    expect(prismaMock.vehicle.updateMany).not.toHaveBeenCalled()
    expect(prismaMock.maintenance.updateMany).not.toHaveBeenCalled()
  })

  it("queries the full current fleet independently of the selected month", async () => {
    await getCalendarSnapshot("2020-01", now)
    const query = prismaMock.vehicle.findMany.mock.calls[0][0]!
    expect(query.where).toBeUndefined()
    expect(query.select?.bookings).toMatchObject({ where: { OR: [
      { status: "IN_PROGRESS", returnedAt: null },
      { status: { in: ["APPROVED", "CHANGED"] }, startDate: { lte: now }, endDate: { gt: now } },
    ] } })
  })

  it("validates the month before querying the database", async () => {
    await expect(getCalendarSnapshot("2026-99", now)).rejects.toThrow("YYYY-MM")
    expect(prismaMock.booking.findMany).not.toHaveBeenCalled()
    expect(prismaMock.vehicle.findMany).not.toHaveBeenCalled()
  })
})
