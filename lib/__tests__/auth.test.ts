import { beforeEach, describe, expect, it, vi } from "vitest"
import { NextRequest } from "next/server"
import jwt from "jsonwebtoken"
import { verifyUser } from "@/lib/auth"

const prismaMock = vi.hoisted(() => ({
  user: { findUnique: vi.fn() },
}))

vi.mock("@/lib/prisma", () => ({ prisma: prismaMock }))
vi.mock("jsonwebtoken", () => ({
  default: { verify: vi.fn() },
}))

function request() {
  return new NextRequest("http://localhost/api/test", {
    headers: { authorization: "Bearer old-token" },
  })
}

describe("database-backed authentication", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    process.env.JWT_SECRET = "test-secret"
    vi.mocked(jwt.verify).mockReturnValue({ userId: "user-1", role: "USER" } as never)
  })

  it("uses the latest role from the database instead of the token role", async () => {
    prismaMock.user.findUnique.mockResolvedValue({
      id: "user-1",
      role: "ADMIN",
      isActive: true,
    })

    await expect(verifyUser(request())).resolves.toMatchObject({
      userId: "user-1",
      role: "ADMIN",
    })
  })

  it("rejects a token issued before the account was deactivated", async () => {
    prismaMock.user.findUnique.mockResolvedValue({
      id: "user-1",
      role: "USER",
      isActive: false,
    })

    await expect(verifyUser(request())).rejects.toThrow("Account inactive")
  })
})
