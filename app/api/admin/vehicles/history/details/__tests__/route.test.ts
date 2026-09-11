import { beforeEach, describe, expect, it, vi } from "vitest"
import { NextRequest } from "next/server"
import { GET } from "../route"
import { requireAccess } from "@/lib/permissions"
import { getVehicleHistoryDetails } from "@/lib/vehicle-history-details"

vi.mock("@/lib/permissions", async (importOriginal) => {
  const original = await importOriginal<typeof import("@/lib/permissions")>()
  return { ...original, requireAccess: vi.fn() }
})
vi.mock("@/lib/vehicle-history-details", async (importOriginal) => {
  const original = await importOriginal<typeof import("@/lib/vehicle-history-details")>()
  return { ...original, getVehicleHistoryDetails: vi.fn() }
})

describe("GET /api/admin/vehicles/history/details", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(requireAccess).mockResolvedValue({ userId: "admin-1", role: "ADMIN", isActive: true })
    vi.mocked(getVehicleHistoryDetails).mockResolvedValue({
      items: [],
      period: { startDate: "2026-08-01", endDate: "2026-08-29", dayCount: 29 },
      pagination: { page: 1, pageSize: 20, total: 0, totalPages: 0 },
    })
  })

  it("requires REPORT_VIEW and forwards validated pagination and filters", async () => {
    const response = await GET(new NextRequest(
      "http://localhost/api/admin/vehicles/history/details?tab=mileage&vehicleId=550e8400-e29b-41d4-a716-446655440000&startDate=2026-08-01&endDate=2026-08-29&page=2&pageSize=50",
    ))

    expect(response.status).toBe(200)
    expect(requireAccess).toHaveBeenCalledWith(expect.any(NextRequest), {
      roles: ["ADMIN"],
      permission: "REPORT_VIEW",
    })
    expect(getVehicleHistoryDetails).toHaveBeenCalledWith({
      tab: "mileage",
      vehicleId: "550e8400-e29b-41d4-a716-446655440000",
      startDate: "2026-08-01",
      endDate: "2026-08-29",
      page: 2,
      pageSize: 50,
    })
  })

  it("rejects requests without REPORT_VIEW", async () => {
    vi.mocked(requireAccess).mockRejectedValue(new Error("Forbidden"))

    const response = await GET(new NextRequest("http://localhost/api/admin/vehicles/history/details?tab=trips"))
    expect(response.status).toBe(403)
    expect(getVehicleHistoryDetails).not.toHaveBeenCalled()
  })

  it("rejects an unsupported tab before querying history", async () => {
    const response = await GET(new NextRequest("http://localhost/api/admin/vehicles/history/details?tab=unknown"))
    expect(response.status).toBe(400)
    expect(getVehicleHistoryDetails).not.toHaveBeenCalled()
  })
})
