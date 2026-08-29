import { beforeEach, describe, expect, it, vi } from "vitest"
import { GET, PATCH } from "../route"
import { verifyUser } from "@/lib/auth"

const prismaMock = vi.hoisted(() => ({
  notification: {
    findMany: vi.fn(),
    count: vi.fn(),
    updateMany: vi.fn()
  }
}))

vi.mock("@/lib/prisma", () => ({ prisma: prismaMock }))
vi.mock("@/lib/auth", () => ({
  verifyUser: vi.fn(),
  isAuthError: (error: unknown) =>
    error instanceof Error && error.message === "No token"
}))

describe("/api/notifications", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(verifyUser).mockResolvedValue({ userId: "user-1", role: "USER", isActive: true })
  })

  it("returns only the signed-in user's notifications and unread count", async () => {
    const notifications = [
      {
        id: "notification-1",
        type: "MAINTENANCE",
        message: "มีรายงานรถเสีย",
        isRead: false,
        bookingId: null,
        maintenanceId: "maintenance-1",
        createdAt: new Date("2050-01-01T00:00:00.000Z")
      }
    ]
    prismaMock.notification.findMany.mockResolvedValue(notifications)
    prismaMock.notification.count.mockResolvedValue(1)

    const response = await GET(
      new Request("http://localhost:3000/api/notifications?limit=10") as Parameters<
        typeof GET
      >[0]
    )
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.unreadCount).toBe(1)
    expect(data.items).toHaveLength(1)
    expect(prismaMock.notification.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { userId: "user-1" },
        take: 10
      })
    )
  })

  it("marks one owned notification as read", async () => {
    prismaMock.notification.updateMany.mockResolvedValue({ count: 1 })

    const response = await PATCH(
      new Request("http://localhost:3000/api/notifications", {
        method: "PATCH",
        body: JSON.stringify({ id: "notification-1" })
      }) as Parameters<typeof PATCH>[0]
    )

    expect(response.status).toBe(200)
    expect(prismaMock.notification.updateMany).toHaveBeenCalledWith({
      where: {
        userId: "user-1",
        isRead: false,
        id: "notification-1"
      },
      data: { isRead: true }
    })
  })

  it("does not expose whether another user's notification exists", async () => {
    prismaMock.notification.updateMany.mockResolvedValue({ count: 0 })

    const response = await PATCH(
      new Request("http://localhost:3000/api/notifications", {
        method: "PATCH",
        body: JSON.stringify({ id: "notification-from-another-user" })
      }) as Parameters<typeof PATCH>[0]
    )

    expect(response.status).toBe(404)
  })
})
