import { beforeEach, describe, expect, it, vi } from "vitest"

vi.mock("@/lib/page-access", () => ({ requirePageAccess: vi.fn() }))
vi.mock("@/lib/permissions", () => ({ getPermissionsForRole: vi.fn() }))
vi.mock("../_components/CalendarView", () => ({ default: () => null }))

import { requirePageAccess } from "@/lib/page-access"
import { getPermissionsForRole } from "@/lib/permissions"
import CalendarPage from "../page"

describe("calendar booking access", () => {
  beforeEach(() => vi.clearAllMocks())

  it.each([
    ["USER", ["BOOKING_CREATE"], true],
    ["USER", [], false],
    ["USER", ["BOOKING_VIEW"], false],
    ["ADMIN", ["BOOKING_CREATE"], false],
    ["APPROVER", ["BOOKING_CREATE"], false],
  ] as const)("%s with %j can create: %s", async (role, permissions, allowed) => {
    vi.mocked(requirePageAccess).mockResolvedValue({ userId: "actor", role, isActive: true })
    vi.mocked(getPermissionsForRole).mockResolvedValue(new Set(permissions))
    const page = await CalendarPage()
    expect(page.props.canCreateBooking).toBe(allowed)
    expect(requirePageAccess).toHaveBeenCalledWith({})
    if (role !== "USER") expect(getPermissionsForRole).not.toHaveBeenCalled()
  })
})
