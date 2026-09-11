import { beforeEach, describe, expect, it, vi } from "vitest"
import { NextRequest } from "next/server"
import { verifyToken } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import {
  accessErrorResponse,
  requireAccess,
} from "@/lib/permissions"

vi.mock("@/lib/auth", async (importOriginal) => {
  const original = await importOriginal<typeof import("@/lib/auth")>()
  return { ...original, verifyToken: vi.fn() }
})

vi.mock("@/lib/prisma", () => ({
  prisma: {
    rolePermission: { findMany: vi.fn() },
  },
}))

const request = new NextRequest("http://localhost/api/example")

describe("permission enforcement", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(verifyToken).mockResolvedValue({
      userId: "admin-1",
      role: "ADMIN",
      isActive: true,
    })
  })

  it("allows an active actor with the required role and permission", async () => {
    vi.mocked(prisma.rolePermission.findMany).mockResolvedValue([
      { permission: "USER_MANAGE" },
    ] as never)

    await expect(requireAccess(request, {
      roles: ["ADMIN"],
      permission: "USER_MANAGE",
    })).resolves.toMatchObject({ userId: "admin-1", role: "ADMIN" })
  })

  it("rejects a role mismatch before reading permissions", async () => {
    vi.mocked(verifyToken).mockResolvedValue({
      userId: "user-1",
      role: "USER",
      isActive: true,
    })

    await expect(requireAccess(request, {
      roles: ["ADMIN"],
      permission: "USER_MANAGE",
    })).rejects.toThrow("Not authorized")
    expect(prisma.rolePermission.findMany).not.toHaveBeenCalled()
  })

  it("rejects an authenticated actor without the permission", async () => {
    vi.mocked(prisma.rolePermission.findMany).mockResolvedValue([])

    await expect(requireAccess(request, {
      roles: ["ADMIN"],
      permission: "USER_MANAGE",
    })).rejects.toThrow("Forbidden")
  })

  it("returns 401 only for authentication failures and 403 for denied access", async () => {
    expect(accessErrorResponse(new Error("No token"))?.status).toBe(401)
    expect(accessErrorResponse(new Error("Account inactive"))?.status).toBe(401)
    expect(accessErrorResponse(new Error("Not authorized"))?.status).toBe(403)
    expect(accessErrorResponse(new Error("Forbidden"))?.status).toBe(403)
  })
})
