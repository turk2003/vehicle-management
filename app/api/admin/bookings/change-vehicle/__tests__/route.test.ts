import { beforeEach, describe, expect, it, vi } from "vitest"
import { PUT } from "../route"
import { verifyAdmin } from "@/lib/auth"
import { sendBookingEventEmail } from "@/lib/email/bookingNotifications"

const prismaMock = vi.hoisted(() => ({
  booking: {
    findUnique: vi.fn(),
    update: vi.fn()
  },
  vehicle: {
    findFirst: vi.fn(),
    update: vi.fn()
  },
  notification: {
    create: vi.fn()
  },
  log: {
    create: vi.fn()
  },
  $transaction: vi.fn()
}))

vi.mock("@/lib/prisma", () => ({ prisma: prismaMock }))
vi.mock("@/lib/auth", () => ({ verifyAdmin: vi.fn() }))
vi.mock("@/lib/email/bookingNotifications", () => ({
  sendBookingEventEmail: vi.fn()
}))

const existingBooking = {
  id: "booking-1",
  userId: "user-1",
  vehicleId: "old-vehicle",
  status: "APPROVED",
  pickedUpAt: null,
  startDate: new Date("2050-05-01T09:00:00.000Z"),
  endDate: new Date("2050-05-01T17:00:00.000Z"),
  purpose: "Site visit",
  vehicle: {
    id: "old-vehicle",
    typeId: "type-1",
    plateNumber: "OLD-1111",
    status: "MAINTENANCE",
    type: { id: "type-1", name: "Van" }
  },
  user: {
    id: "user-1",
    name: "Somchai",
    email: "somchai@example.com"
  }
}

const replacement = {
  id: "new-vehicle",
  typeId: "type-1",
  plateNumber: "NEW-2222",
  status: "AVAILABLE",
  currentMileage: 12000,
  type: { id: "type-1", name: "Van" }
}

describe("PUT /api/admin/bookings/change-vehicle", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(verifyAdmin).mockReturnValue({
      userId: "admin-1",
      role: "ADMIN"
    })
    prismaMock.$transaction.mockImplementation(
      async (callback: (tx: typeof prismaMock) => Promise<unknown>) =>
        callback(prismaMock)
    )
  })

  it("changes the vehicle atomically and emails the booking owner", async () => {
    const updatedBooking = {
      ...existingBooking,
      vehicleId: replacement.id,
      status: "CHANGED",
      vehicle: replacement,
      approver: null
    }

    prismaMock.booking.findUnique.mockResolvedValue(existingBooking)
    prismaMock.vehicle.findFirst.mockResolvedValue(replacement)
    prismaMock.booking.update.mockResolvedValue(updatedBooking)
    prismaMock.vehicle.update.mockResolvedValue({
      ...replacement,
      status: "BOOKED"
    })
    prismaMock.notification.create.mockResolvedValue({ id: "notification-1" })
    prismaMock.log.create.mockResolvedValue({ id: "log-1" })

    const request = new Request(
      "http://localhost:3000/api/admin/bookings/change-vehicle",
      {
        method: "PUT",
        body: JSON.stringify({
          bookingId: existingBooking.id,
          newVehicleId: replacement.id,
          reason: "ระบบเบรกขัดข้อง"
        })
      }
    )

    const response = await PUT(request as Parameters<typeof PUT>[0])
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.booking.status).toBe("CHANGED")
    expect(data.previousVehiclePlate).toBe("OLD-1111")
    expect(data.newVehiclePlate).toBe("NEW-2222")
    expect(prismaMock.booking.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: "booking-1" },
        data: {
          vehicleId: "new-vehicle",
          status: "CHANGED"
        }
      })
    )
    expect(prismaMock.notification.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        userId: "user-1",
        type: "BOOKING",
        bookingId: "booking-1"
      })
    })
    expect(sendBookingEventEmail).toHaveBeenCalledWith(
      "VEHICLE_CHANGED",
      updatedBooking,
      {
        previousVehiclePlate: "OLD-1111",
        newVehiclePlate: "NEW-2222",
        reason: "ระบบเบรกขัดข้อง"
      }
    )
  })

  it("rejects a booking whose original vehicle is not in maintenance", async () => {
    prismaMock.booking.findUnique.mockResolvedValue({
      ...existingBooking,
      vehicle: {
        ...existingBooking.vehicle,
        status: "BOOKED"
      }
    })

    const request = new Request(
      "http://localhost:3000/api/admin/bookings/change-vehicle",
      {
        method: "PUT",
        body: JSON.stringify({
          bookingId: existingBooking.id,
          newVehicleId: replacement.id,
          reason: "ทดสอบ"
        })
      }
    )

    const response = await PUT(request as Parameters<typeof PUT>[0])
    const data = await response.json()

    expect(response.status).toBe(409)
    expect(data.code).toBe("ORIGINAL_VEHICLE_NOT_IN_MAINTENANCE")
    expect(prismaMock.booking.update).not.toHaveBeenCalled()
    expect(sendBookingEventEmail).not.toHaveBeenCalled()
  })

  it("returns a conflict when the replacement became unavailable", async () => {
    prismaMock.booking.findUnique.mockResolvedValue(existingBooking)
    prismaMock.vehicle.findFirst.mockResolvedValue(null)

    const request = new Request(
      "http://localhost:3000/api/admin/bookings/change-vehicle",
      {
        method: "PUT",
        body: JSON.stringify({
          bookingId: existingBooking.id,
          newVehicleId: replacement.id,
          reason: "ระบบเบรกขัดข้อง"
        })
      }
    )

    const response = await PUT(request as Parameters<typeof PUT>[0])
    const data = await response.json()

    expect(response.status).toBe(409)
    expect(data.code).toBe("REPLACEMENT_UNAVAILABLE")
    expect(prismaMock.booking.update).not.toHaveBeenCalled()
  })
})
