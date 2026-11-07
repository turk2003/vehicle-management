import { describe, it, expect, vi, beforeEach } from "vitest"
import { pickUpBooking, PickupError, attachUnreturnedHolders } from "../pickup"
import { notifyBookingEvent } from "@/lib/email/bookingNotifications"

const prismaMock = vi.hoisted(() => ({
  booking: { findUnique: vi.fn(), findMany: vi.fn(), update: vi.fn(), updateMany: vi.fn() },
  vehicle: { update: vi.fn() },
  log: { create: vi.fn() },
  $transaction: vi.fn(),
  $executeRaw: vi.fn(),
}))

vi.mock("@/lib/prisma", () => ({ prisma: prismaMock }))
vi.mock("@/lib/email/bookingNotifications", () => ({ notifyBookingEvent: vi.fn() }))

const now = new Date("2026-11-07T05:00:00.000Z")

const approvedBooking = {
  id: "b2",
  userId: "user2",
  vehicleId: "v1",
  status: "APPROVED",
  startDate: new Date("2026-11-07T05:00:00.000Z"),
  vehicle: { id: "v1", plateNumber: "กข 1234", currentMileage: 15000 },
}

const baseInput = {
  bookingId: "b2",
  mileageStart: 15100,
  actorUserId: "user2",
  ownerId: "user2",
  enforcePickupWindow: true,
  logLabel: "User picked up",
}

describe("pickUpBooking", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.useFakeTimers()
    vi.setSystemTime(now)
    prismaMock.$transaction.mockImplementation(async (fn: (tx: typeof prismaMock) => unknown) => fn(prismaMock))
    prismaMock.booking.findUnique.mockResolvedValue(approvedBooking)
    prismaMock.booking.findMany.mockResolvedValue([])
    prismaMock.booking.update.mockResolvedValue({ id: "b2", status: "IN_PROGRESS" })
  })

  it("picks up normally when no one is holding the vehicle", async () => {
    const result = await pickUpBooking(baseInput)

    expect(result.autoReturned).toEqual([])
    expect(prismaMock.booking.updateMany).not.toHaveBeenCalled()
    expect(prismaMock.booking.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: "b2" },
        data: expect.objectContaining({ status: "IN_PROGRESS", mileageStart: 15100 }),
      })
    )
    expect(prismaMock.vehicle.update).toHaveBeenCalledWith({
      where: { id: "v1" },
      data: { status: "IN_USE" },
    })
    expect(prismaMock.$executeRaw).toHaveBeenCalled()
    expect(notifyBookingEvent).toHaveBeenCalledWith(expect.objectContaining({ event: "PICKED_UP" }))
  })

  it("auto-completes the previous unreturned booking using the new start mileage", async () => {
    const previous = { id: "b1", vehicleId: "v1", status: "IN_PROGRESS", mileageStart: 15049 }
    const closedPrevious = { ...previous, status: "COMPLETED", vehicle: { plateNumber: "กข 1234" } }
    prismaMock.booking.findMany
      .mockResolvedValueOnce([previous])
      .mockResolvedValueOnce([closedPrevious])

    const result = await pickUpBooking(baseInput)

    expect(prismaMock.booking.updateMany).toHaveBeenCalledWith({
      where: { id: { in: ["b1"] } },
      data: { status: "COMPLETED", mileageEnd: 15100, returnedAt: now, autoReturned: true },
    })
    expect(prismaMock.vehicle.update).toHaveBeenCalledWith({
      where: { id: "v1" },
      data: { status: "IN_USE", currentMileage: 15100 },
    })
    expect(result.autoReturned).toEqual([closedPrevious])
    expect(notifyBookingEvent).toHaveBeenCalledWith(
      expect.objectContaining({ event: "RETURNED", booking: closedPrevious })
    )
    expect(prismaMock.log.create).toHaveBeenCalledTimes(2)
  })

  it("rejects mileage lower than the previous holder's start mileage", async () => {
    prismaMock.booking.findMany.mockResolvedValueOnce([
      { id: "b1", vehicleId: "v1", status: "IN_PROGRESS", mileageStart: 15200 },
    ])

    await expect(pickUpBooking(baseInput)).rejects.toMatchObject({ status: 400 })
    expect(prismaMock.booking.updateMany).not.toHaveBeenCalled()
    expect(prismaMock.booking.update).not.toHaveBeenCalled()
  })

  it("rejects mileage lower than the vehicle's current mileage", async () => {
    await expect(
      pickUpBooking({ ...baseInput, mileageStart: 14000 })
    ).rejects.toMatchObject({ status: 400 })
  })

  it("returns 409 when the booking was already picked up", async () => {
    prismaMock.booking.findUnique
      .mockResolvedValueOnce(approvedBooking)
      .mockResolvedValueOnce({ ...approvedBooking, status: "IN_PROGRESS" })

    await expect(pickUpBooking(baseInput)).rejects.toMatchObject({
      status: 409,
      message: "การจองนี้รับรถไปแล้ว",
    })
  })

  it("rejects bookings that are not approved", async () => {
    prismaMock.booking.findUnique.mockResolvedValue({ ...approvedBooking, status: "PENDING" })

    await expect(pickUpBooking(baseInput)).rejects.toMatchObject({ status: 400 })
  })

  it("returns 404 when the booking does not exist", async () => {
    prismaMock.booking.findUnique.mockResolvedValue(null)

    await expect(pickUpBooking(baseInput)).rejects.toMatchObject({ status: 404 })
  })

  it("returns 403 when the user does not own the booking", async () => {
    await expect(
      pickUpBooking({ ...baseInput, ownerId: "someone-else" })
    ).rejects.toMatchObject({ status: 403 })
  })

  it("blocks users from picking up more than 30 minutes early", async () => {
    prismaMock.booking.findUnique.mockResolvedValue({
      ...approvedBooking,
      startDate: new Date("2026-11-07T05:31:00.000Z"),
    })

    await expect(pickUpBooking(baseInput)).rejects.toBeInstanceOf(PickupError)
  })

  it("lets admins pick up early", async () => {
    prismaMock.booking.findUnique.mockResolvedValue({
      ...approvedBooking,
      startDate: new Date("2026-11-07T08:00:00.000Z"),
    })

    await expect(
      pickUpBooking({ ...baseInput, ownerId: undefined, enforcePickupWindow: false })
    ).resolves.toBeDefined()
  })

  it("does not notify when the transaction fails", async () => {
    prismaMock.booking.update.mockRejectedValue(new Error("db down"))

    await expect(pickUpBooking(baseInput)).rejects.toThrow("db down")
    expect(notifyBookingEvent).not.toHaveBeenCalled()
  })
})

describe("attachUnreturnedHolders", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("adds the current holder to approved bookings of the same vehicle", async () => {
    prismaMock.booking.findMany.mockResolvedValue([
      { id: "b1", vehicleId: "v1", mileageStart: 15049, pickedUpAt: now, user: { name: "test01" } },
    ])

    const result = await attachUnreturnedHolders([
      { id: "b2", vehicleId: "v1", status: "APPROVED" },
      { id: "b3", vehicleId: "v1", status: "COMPLETED" },
    ])

    expect(result[0].unreturnedHolder).toEqual({ name: "test01", mileageStart: 15049, pickedUpAt: now })
    expect(result[1].unreturnedHolder).toBeNull()
  })

  it("skips the query when no booking is waiting for pickup", async () => {
    const result = await attachUnreturnedHolders([{ id: "b3", vehicleId: "v1", status: "COMPLETED" }])

    expect(prismaMock.booking.findMany).not.toHaveBeenCalled()
    expect(result[0].unreturnedHolder).toBeNull()
  })
})
