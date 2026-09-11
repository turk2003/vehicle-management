import { beforeEach, describe, expect, it, vi } from "vitest"
import { NextRequest } from "next/server"
import { DELETE, GET, PATCH } from "../route"
import { requireAccess } from "@/lib/permissions"

const prismaMock = vi.hoisted(() => ({
  user: {
    findMany: vi.fn(),
    findUnique: vi.fn(),
    count: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
  booking: { count: vi.fn(), groupBy: vi.fn() },
  log: { create: vi.fn() },
  $transaction: vi.fn(),
}))

vi.mock("@/lib/prisma", () => ({ prisma: prismaMock }))
vi.mock("@/lib/permissions", () => ({
  requireAccess: vi.fn(),
  accessErrorResponse: vi.fn(() => null),
}))

const baseUser = {
  id: "user-1",
  name: "Somchai",
  email: "somchai@example.com",
  role: "USER",
  isActive: true,
  deactivatedAt: null,
  createdAt: new Date("2026-08-01T00:00:00Z"),
}

function patchRequest(body: unknown) {
  return new NextRequest("http://localhost/api/user", {
    method: "PATCH",
    body: JSON.stringify(body),
  })
}

describe("user lifecycle API", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(requireAccess).mockResolvedValue({
      userId: "admin-1",
      role: "ADMIN",
      isActive: true,
    })
    prismaMock.$transaction.mockImplementation(async (callback: (tx: typeof prismaMock) => Promise<unknown>) => callback(prismaMock))
  })

  it("lists lifecycle state, active booking counts and deletion eligibility", async () => {
    prismaMock.user.findMany.mockResolvedValue([
      {
        ...baseUser,
        _count: { bookings: 1, approvedJobs: 0, maintenances: 0, notifications: 0, logs: 0 },
      },
    ])
    prismaMock.booking.groupBy.mockResolvedValue([
      { userId: "user-1", _count: { _all: 2 } },
    ])

    const response = await GET(new NextRequest("http://localhost/api/user"))
    expect(response.status).toBe(200)
    await expect(response.json()).resolves.toMatchObject([
      { id: "user-1", isActive: true, activeBookingCount: 2, canDelete: false },
    ])
  })

  it("deactivates an account, reports affected bookings and writes an audit log", async () => {
    prismaMock.user.findUnique.mockResolvedValue(baseUser)
    prismaMock.booking.count.mockResolvedValue(3)
    prismaMock.user.update.mockResolvedValue({
      ...baseUser,
      isActive: false,
      deactivatedAt: new Date("2026-08-29T00:00:00Z"),
    })
    prismaMock.log.create.mockResolvedValue({ id: "log-1" })

    const response = await PATCH(patchRequest({ id: "user-1", isActive: false }))
    expect(response.status).toBe(200)
    await expect(response.json()).resolves.toMatchObject({
      id: "user-1",
      isActive: false,
      affectedBookingCount: 3,
    })
    expect(prismaMock.log.create).toHaveBeenCalledWith({
      data: {
        userId: "admin-1",
        action: "USER_DEACTIVATED",
        metadata: { targetUserId: "user-1", affectedBookingCount: 3 },
      },
    })
  })

  it("does not allow an admin to deactivate their own account", async () => {
    vi.mocked(requireAccess).mockResolvedValue({ userId: "user-1", role: "ADMIN", isActive: true })
    prismaMock.user.findUnique.mockResolvedValue({ ...baseUser, role: "ADMIN" })

    const response = await PATCH(patchRequest({ id: "user-1", isActive: false }))
    expect(response.status).toBe(409)
    await expect(response.json()).resolves.toMatchObject({ code: "CANNOT_DEACTIVATE_SELF" })
    expect(prismaMock.booking.count).not.toHaveBeenCalled()
  })

  it("does not allow deactivating the last active admin", async () => {
    prismaMock.user.findUnique.mockResolvedValue({ ...baseUser, id: "admin-2", role: "ADMIN" })
    prismaMock.user.count.mockResolvedValue(1)

    const response = await PATCH(patchRequest({ id: "admin-2", isActive: false }))
    expect(response.status).toBe(409)
    await expect(response.json()).resolves.toMatchObject({ code: "LAST_ACTIVE_ADMIN" })
  })

  it("rejects permanent deletion when the account has history", async () => {
    prismaMock.user.findUnique.mockResolvedValue({
      ...baseUser,
      _count: { bookings: 0, approvedJobs: 0, maintenances: 1, notifications: 0, logs: 0 },
    })

    const response = await DELETE(new NextRequest("http://localhost/api/user?id=user-1", { method: "DELETE" }))
    expect(response.status).toBe(409)
    await expect(response.json()).resolves.toMatchObject({ code: "USER_HAS_HISTORY" })
    expect(prismaMock.user.delete).not.toHaveBeenCalled()
  })

  it("permanently deletes a new account without history", async () => {
    prismaMock.user.findUnique.mockResolvedValue({
      ...baseUser,
      _count: { bookings: 0, approvedJobs: 0, maintenances: 0, notifications: 0, logs: 0 },
    })
    prismaMock.user.delete.mockResolvedValue(baseUser)

    const response = await DELETE(new NextRequest("http://localhost/api/user?id=user-1", { method: "DELETE" }))
    expect(response.status).toBe(200)
    expect(prismaMock.user.delete).toHaveBeenCalledWith({ where: { id: "user-1" } })
  })
})
