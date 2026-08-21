import { beforeEach, describe, expect, it, vi } from "vitest"
import {
  buildMaintenanceReportEmail,
  emailAdminsAboutMaintenanceReport
} from "@/lib/email/maintenanceNotifications"
import { sendEmail } from "@/lib/email/service"

vi.mock("@/lib/email/service", () => ({
  sendEmail: vi.fn()
}))

const maintenance = {
  id: "maintenance-1",
  description: "เบรกมีเสียงดัง <ตรวจด่วน>",
  startDate: new Date("2050-05-01T09:00:00.000Z"),
  reporter: {
    name: "Somchai",
    email: "somchai@example.com"
  },
  vehicle: {
    plateNumber: "กข-1234",
    type: { name: "Van" }
  }
}

describe("maintenance report emails", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    delete process.env.APP_BASE_URL
    vi.mocked(sendEmail).mockResolvedValue(true)
  })

  it("builds an admin email and escapes report content", () => {
    process.env.APP_BASE_URL = "https://vehicles.example.com/"

    const email = buildMaintenanceReportEmail(maintenance, {
      name: "Admin",
      email: "admin@example.com"
    })

    expect(email.subject).toContain("กข-1234")
    expect(email.text).toContain("Somchai")
    expect(email.text).toContain("https://vehicles.example.com/admin/maintenance")
    expect(email.html).toContain("&lt;ตรวจด่วน&gt;")
    expect(email.html).not.toContain("<ตรวจด่วน>")
  })

  it("sends a separate email to every admin", async () => {
    await emailAdminsAboutMaintenanceReport(maintenance, [
      { name: "Admin One", email: "admin1@example.com" },
      { name: "Admin Two", email: "admin2@example.com" }
    ])

    expect(sendEmail).toHaveBeenCalledTimes(2)
    expect(sendEmail).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({ to: "admin1@example.com" })
    )
    expect(sendEmail).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({ to: "admin2@example.com" })
    )
  })
})
