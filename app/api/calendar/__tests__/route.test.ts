import { beforeEach, afterEach, describe, expect, it, vi } from "vitest"
import { NextRequest } from "next/server"
import jwt from "jsonwebtoken"
import { prismaMock } from "@/lib/__mocks__/prisma"
import { GET } from "../route"

vi.mock("@/lib/prisma", async () => ({ prisma: (await import("@/lib/__mocks__/prisma")).prismaMock }))

function request(month = "2026-10", token = true) {
  return new NextRequest(`http://localhost/api/calendar?month=${month}`, {
    headers: token ? { authorization: `Bearer ${jwt.sign({ userId: "viewer", role: "USER" }, "calendar-test-secret")}` } : {},
  })
}

describe("GET /api/calendar", () => {
  beforeEach(() => {
    vi.stubEnv("JWT_SECRET", "calendar-test-secret")
    prismaMock.user.findUnique.mockResolvedValue({ id: "viewer", role: "USER", isActive: true } as never)
    prismaMock.booking.findMany.mockResolvedValue([])
    prismaMock.vehicle.findMany.mockResolvedValue([])
  })
  afterEach(() => vi.unstubAllEnvs())

  it.each(["USER", "ADMIN", "APPROVER"] as const)("allows an active %s without any booking permissions", async (role) => {
    prismaMock.user.findUnique.mockResolvedValue({ id: "viewer", role, isActive: true } as never)
    const response = await GET(request())
    expect(response.status).toBe(200)
    expect(response.headers.get("cache-control")).toBe("private, no-store")
    expect(await response.json()).toMatchObject({ month: "2026-10", bookings: [], vehicles: [] })
    expect(prismaMock.rolePermission.findMany).not.toHaveBeenCalled()
  })

  it("rejects unauthenticated requests before reading calendar data", async () => {
    expect((await GET(request("2026-10", false))).status).toBe(401)
    expect(prismaMock.booking.findMany).not.toHaveBeenCalled()
  })

  it("rejects inactive accounts", async () => {
    prismaMock.user.findUnique.mockResolvedValue({ id: "viewer", role: "USER", isActive: false } as never)
    expect((await GET(request())).status).toBe(401)
    expect(prismaMock.booking.findMany).not.toHaveBeenCalled()
  })

  it("rejects malformed months", async () => {
    expect((await GET(request("2026-13"))).status).toBe(400)
    expect(prismaMock.booking.findMany).not.toHaveBeenCalled()
  })

  it("defaults to the current Bangkok month", async () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date("2026-10-31T17:00:00Z"))
    try {
      const req = request()
      req.nextUrl.searchParams.delete("month")
      expect(await (await GET(req)).json()).toMatchObject({ month: "2026-11" })
    } finally {
      vi.useRealTimers()
    }
  })

  it("returns a safe error when the database fails", async () => {
    const log = vi.spyOn(console, "error").mockImplementation(() => {})
    try {
      prismaMock.booking.findMany.mockRejectedValue(new Error("private database detail"))
      const response = await GET(request())
      expect(response.status).toBe(500)
      expect(await response.text()).not.toContain("private database detail")
    } finally {
      log.mockRestore()
    }
  })
})
