export type BookingEmailEvent =
  | "APPROVED"
  | "REJECTED"
  | "CANCELLED"
  | "PICKED_UP"
  | "RETURNED"
  | "VEHICLE_CHANGED"

export type BookingEmailData = {
  id: string
  startDate: Date | string
  endDate: Date | string
  purpose: string
  rejectionReason?: string | null
  mileageStart?: number | null
  mileageEnd?: number | null
  pickedUpAt?: Date | string | null
  returnedAt?: Date | string | null
  userId: string
  user: {
    name: string
    email: string
  }
  vehicle: {
    plateNumber: string
    type?: {
      name: string
    } | null
  }
}

export type BookingEmailOptions = {
  comment?: string | null
  previousVehiclePlate?: string | null
  newVehiclePlate?: string | null
}

export type BookingEmailTemplate = {
  subject: string
  text: string
  html: string
}

const eventTitles: Record<BookingEmailEvent, string> = {
  APPROVED: "การจองรถได้รับการอนุมัติ",
  REJECTED: "การจองรถถูกปฏิเสธ",
  CANCELLED: "การจองรถถูกยกเลิก",
  PICKED_UP: "ยืนยันการรับรถ",
  RETURNED: "ยืนยันการคืนรถ",
  VEHICLE_CHANGED: "มีการเปลี่ยนรถสำหรับการจอง"
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;")
}

function formatDateTime(value: Date | string | null | undefined): string {
  if (!value) return "-"

  return new Date(value).toLocaleString("th-TH", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  })
}

function getVehicleName(booking: BookingEmailData): string {
  const typeName = booking.vehicle.type?.name
  return typeName
    ? `${booking.vehicle.plateNumber} (${typeName})`
    : booking.vehicle.plateNumber
}

function getActionDetail(
  event: BookingEmailEvent,
  booking: BookingEmailData,
  options: BookingEmailOptions
): string {
  switch (event) {
    case "APPROVED":
      return "การจองของคุณได้รับการอนุมัติแล้ว กรุณาตรวจสอบวันและเวลาการใช้งานรถ"
    case "REJECTED":
      return `การจองของคุณถูกปฏิเสธ${options.comment || booking.rejectionReason ? `: ${options.comment || booking.rejectionReason}` : ""}`
    case "CANCELLED":
      return "การจองของคุณถูกยกเลิกแล้ว"
    case "PICKED_UP":
      return `ระบบบันทึกการรับรถแล้ว เลขไมล์เริ่มต้น: ${booking.mileageStart ?? "-"} km`
    case "RETURNED": {
      const distance = booking.mileageStart !== null && booking.mileageStart !== undefined && booking.mileageEnd !== null && booking.mileageEnd !== undefined
        ? booking.mileageEnd - booking.mileageStart
        : null
      return `ระบบบันทึกการคืนรถแล้ว เลขไมล์สิ้นสุด: ${booking.mileageEnd ?? "-"} km${distance !== null ? ` ระยะทาง: ${distance} km` : ""}`
    }
    case "VEHICLE_CHANGED":
      return `รถสำหรับการจองถูกเปลี่ยนจาก ${options.previousVehiclePlate || "-"} เป็น ${options.newVehiclePlate || booking.vehicle.plateNumber}`
  }
}

export function buildBookingEmail(
  event: BookingEmailEvent,
  booking: BookingEmailData,
  options: BookingEmailOptions = {}
): BookingEmailTemplate {
  const title = eventTitles[event]
  const vehicleName = getVehicleName(booking)
  const detail = getActionDetail(event, booking, options)
  const appBaseUrl = process.env.APP_BASE_URL
  const bookingUrl = appBaseUrl ? `${appBaseUrl.replace(/\/$/, "")}/user/my-bookings` : null
  const lines = [
    `สวัสดี ${booking.user.name}`,
    "",
    detail,
    "",
    `รถ: ${vehicleName}`,
    `วัตถุประสงค์: ${booking.purpose}`,
    `เริ่มใช้งาน: ${formatDateTime(booking.startDate)}`,
    `สิ้นสุด: ${formatDateTime(booking.endDate)}`,
    ...(booking.pickedUpAt ? [`รับรถจริง: ${formatDateTime(booking.pickedUpAt)}`] : []),
    ...(booking.returnedAt ? [`คืนรถจริง: ${formatDateTime(booking.returnedAt)}`] : []),
    ...(bookingUrl ? ["", `ดูรายละเอียด: ${bookingUrl}`] : [])
  ]

  const rows = [
    ["รถ", vehicleName],
    ["วัตถุประสงค์", booking.purpose],
    ["เริ่มใช้งาน", formatDateTime(booking.startDate)],
    ["สิ้นสุด", formatDateTime(booking.endDate)],
    ...(booking.pickedUpAt ? [["รับรถจริง", formatDateTime(booking.pickedUpAt)]] : []),
    ...(booking.returnedAt ? [["คืนรถจริง", formatDateTime(booking.returnedAt)]] : [])
  ]

  const htmlRows = rows
    .map(([label, value]) => `
      <tr>
        <td style="padding:8px 12px;border:1px solid #e5e7eb;font-weight:600;background:#f9fafb;">${escapeHtml(label)}</td>
        <td style="padding:8px 12px;border:1px solid #e5e7eb;">${escapeHtml(value)}</td>
      </tr>
    `)
    .join("")

  return {
    subject: `[Vehicle Management] ${title}`,
    text: lines.join("\n"),
    html: `
      <div style="font-family:Arial,sans-serif;line-height:1.6;color:#111827;">
        <h2 style="margin:0 0 12px;">${escapeHtml(title)}</h2>
        <p>สวัสดี ${escapeHtml(booking.user.name)}</p>
        <p>${escapeHtml(detail)}</p>
        <table style="border-collapse:collapse;margin-top:16px;">${htmlRows}</table>
        ${bookingUrl ? `<p style="margin-top:16px;"><a href="${escapeHtml(bookingUrl)}">ดูรายละเอียดการจอง</a></p>` : ""}
      </div>
    `
  }
}

