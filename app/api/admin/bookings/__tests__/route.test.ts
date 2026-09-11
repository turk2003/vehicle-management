import { beforeEach, describe, expect, it, vi } from "vitest"
import { PUT } from "../route"
import { requireAccess } from "@/lib/permissions"

const prismaMock = vi.hoisted(() => ({
  booking: { findUnique: vi.fn() },
}))

vi.mock("@/lib/prisma", () => ({ prisma: prismaMock }))
vi.mock("@/lib/permissions", () => ({
  requireAccess: vi.fn(),
  accessErrorResponse: vi.fn(() => null),
}))
vi.mock("@/lib/email/bookingNotifications", () => ({
  notifyBookingEvent: vi.fn(),
}))

describe("PUT /api/admin/bookings", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(requireAccess).mockResolvedValue({
      userId: "admin-1",
      role: "ADMIN",
      isActive: true,
    })
  })

  it.each(["IN_PROGRESS", "COMPLETED"])(
    "rejects direct transition to %s because mileage is required",
    async (status) => {
      const response = await PUT(
        new Request("http://localhost:3000/api/admin/bookings", {
          method: "PUT",
          body: JSON.stringify({ id: "booking-1", status }),
        }) as Parameters<typeof PUT>[0],
      )

      expect(response.status).toBe(400)
      await expect(response.json()).resolves.toMatchObject({
        code: "USE_MILEAGE_WORKFLOW",
      })
      expect(prismaMock.booking.findUnique).not.toHaveBeenCalled()
    },
  )
})
