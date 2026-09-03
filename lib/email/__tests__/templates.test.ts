import { describe, expect, it } from "vitest"
import { buildBookingEmail } from "@/lib/email/templates"

const booking = {
  id: "booking-1",
  userId: "user-1",
  user: {
    name: "Somchai",
    email: "somchai@example.com"
  },
  vehicle: {
    plateNumber: "กข-1234",
    type: { name: "Van" }
  },
  startDate: new Date("2050-05-01T09:00:00.000Z"),
  endDate: new Date("2050-05-01T17:00:00.000Z"),
  purpose: "Site visit",
  destination: "สำนักงานใหญ่",
  rejectionReason: null,
  mileageStart: null,
  mileageEnd: null,
  pickedUpAt: null,
  returnedAt: null
}

describe("booking email templates", () => {
  it("builds an approved booking email", () => {
    const email = buildBookingEmail("APPROVED", booking)

    expect(email.subject).toContain("การจองรถได้รับการอนุมัติ")
    expect(email.text).toContain("กข-1234")
    expect(email.text).toContain("Site visit")
    expect(email.text).toContain("ปลายทาง: สำนักงานใหญ่")
    expect(email.html).toContain("Somchai")
    expect(email.html).toContain("สำนักงานใหญ่")
  })

  it("includes rejection comments", () => {
    const email = buildBookingEmail("REJECTED", booking, { comment: "รถไม่ว่าง" })

    expect(email.subject).toContain("การจองรถถูกปฏิเสธ")
    expect(email.text).toContain("รถไม่ว่าง")
  })

  it("builds a vehicle changed email", () => {
    const email = buildBookingEmail("VEHICLE_CHANGED", booking, {
      previousVehiclePlate: "เดิม-1111",
      newVehiclePlate: "ใหม่-2222"
    })

    expect(email.subject).toContain("มีการเปลี่ยนรถ")
    expect(email.text).toContain("เดิม-1111")
    expect(email.text).toContain("ใหม่-2222")
  })
})
