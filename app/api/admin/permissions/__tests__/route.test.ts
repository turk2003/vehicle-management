import { beforeEach, describe, expect, it, vi } from "vitest"
import { NextRequest } from "next/server"
import { PUT } from "../route"
import { requireAccess } from "@/lib/permissions"

const prismaMock = vi.hoisted(() => ({
  rolePermission: {
    findMany: vi.fn(),
    deleteMany: vi.fn(),
    createMany: vi.fn(),
  },
  log: { create: vi.fn() },
  $transaction: vi.fn(),
}))

vi.mock("@/lib/prisma", () => ({ prisma: prismaMock }))
vi.mock("@/lib/permissions", async (importOriginal) => {
  const original = await importOriginal<typeof import("@/lib/permissions")>()
  return { ...original, requireAccess: vi.fn() }
})

function request(body: unknown) {
  return new NextRequest("http://localhost/api/admin/permissions", {
    method: "PUT",
    body: JSON.stringify(body),
  })
}

describe("PUT /api/admin/permissions", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(requireAccess).mockResolvedValue({
      userId: "admin-1",
      role: "ADMIN",
      isActive: true,
    })
    prismaMock.$transaction.mockImplementation(
      async (callback: (tx: typeof prismaMock) => Promise<unknown>) =>
        callback(prismaMock),
    )
    prismaMock.rolePermission.findMany.mockResolvedValue([
      { permission: "BOOKING_VIEW" },
    ])
  })

  it("replaces a role matrix atomically and records its diff", async () => {
    const response = await PUT(request({
      role: "USER",
      permissions: ["BOOKING_VIEW", "BOOKING_CREATE"],
    }))

    expect(response.status).toBe(200)
    expect(requireAccess).toHaveBeenCalledWith(expect.any(NextRequest), {
      roles: ["ADMIN"],
      permission: "PERMISSION_MANAGE",
    })
    expect(prismaMock.rolePermission.deleteMany).toHaveBeenCalledWith({
      where: { role: "USER" },
    })
    expect(prismaMock.rolePermission.createMany).toHaveBeenCalledWith({
      data: [
        { role: "USER", permission: "BOOKING_VIEW" },
        { role: "USER", permission: "BOOKING_CREATE" },
      ],
    })
    expect(prismaMock.log.create).toHaveBeenCalledWith({
      data: {
        userId: "admin-1",
        action: "ROLE_PERMISSIONS_UPDATED",
        metadata: {
          role: "USER",
          added: ["BOOKING_CREATE"],
          removed: [],
        },
      },
    })
  })

  it("rejects unknown permissions before changing the database", async () => {
    const response = await PUT(request({
      role: "USER",
      permissions: ["BOOKING_VIEW", "UNKNOWN_PERMISSION"],
    }))

    expect(response.status).toBe(400)
    expect(prismaMock.$transaction).not.toHaveBeenCalled()
  })

  it("prevents removing the permission-management bootstrap from Admin", async () => {
    const response = await PUT(request({
      role: "ADMIN",
      permissions: ["USER_MANAGE", "BOOKING_VIEW", "VEHICLE_VIEW"],
    }))

    expect(response.status).toBe(400)
    expect(prismaMock.$transaction).not.toHaveBeenCalled()
  })

  it("returns 403 when an authenticated actor lacks permission", async () => {
    vi.mocked(requireAccess).mockRejectedValue(new Error("Forbidden"))

    const response = await PUT(request({ role: "USER", permissions: [] }))

    expect(response.status).toBe(403)
    expect(prismaMock.rolePermission.findMany).not.toHaveBeenCalled()
  })
})
