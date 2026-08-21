import { sendEmail } from "@/lib/email/service"

export type MaintenanceReportEmailData = {
  id: string
  description: string
  startDate: Date | string
  reporter: {
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

export type AdminEmailRecipient = {
  name: string
  email: string
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;")
}

function formatDateTime(value: Date | string): string {
  return new Date(value).toLocaleString("th-TH", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  })
}

export function buildMaintenanceReportEmail(
  maintenance: MaintenanceReportEmailData,
  admin: AdminEmailRecipient
) {
  const typeName = maintenance.vehicle.type?.name
  const vehicleName = typeName
    ? `${maintenance.vehicle.plateNumber} (${typeName})`
    : maintenance.vehicle.plateNumber
  const appBaseUrl = process.env.APP_BASE_URL
  const maintenanceUrl = appBaseUrl
    ? `${appBaseUrl.replace(/\/$/, "")}/admin/maintenance`
    : null
  const subject = `[Vehicle Management] มีรายงานรถเสีย ${maintenance.vehicle.plateNumber}`
  const text = [
    `สวัสดี ${admin.name}`,
    "",
    `มีรายงานรถเสียใหม่จาก ${maintenance.reporter.name} (${maintenance.reporter.email})`,
    `รถ: ${vehicleName}`,
    `รายละเอียด: ${maintenance.description}`,
    `วันที่เริ่ม: ${formatDateTime(maintenance.startDate)}`,
    ...(maintenanceUrl ? ["", `ตรวจสอบรายการ: ${maintenanceUrl}`] : [])
  ].join("\n")

  return {
    subject,
    text,
    html: `
      <div style="font-family:Arial,sans-serif;line-height:1.6;color:#111827;">
        <h2 style="margin:0 0 12px;">มีรายงานรถเสียใหม่</h2>
        <p>สวัสดี ${escapeHtml(admin.name)}</p>
        <p>มีรายงานรถเสียจาก ${escapeHtml(maintenance.reporter.name)} (${escapeHtml(maintenance.reporter.email)})</p>
        <table style="border-collapse:collapse;margin-top:16px;">
          <tr>
            <td style="padding:8px 12px;border:1px solid #e5e7eb;font-weight:600;background:#f9fafb;">รถ</td>
            <td style="padding:8px 12px;border:1px solid #e5e7eb;">${escapeHtml(vehicleName)}</td>
          </tr>
          <tr>
            <td style="padding:8px 12px;border:1px solid #e5e7eb;font-weight:600;background:#f9fafb;">รายละเอียด</td>
            <td style="padding:8px 12px;border:1px solid #e5e7eb;">${escapeHtml(maintenance.description)}</td>
          </tr>
          <tr>
            <td style="padding:8px 12px;border:1px solid #e5e7eb;font-weight:600;background:#f9fafb;">วันที่เริ่ม</td>
            <td style="padding:8px 12px;border:1px solid #e5e7eb;">${escapeHtml(formatDateTime(maintenance.startDate))}</td>
          </tr>
        </table>
        ${maintenanceUrl ? `<p style="margin-top:16px;"><a href="${escapeHtml(maintenanceUrl)}">เปิดหน้าจัดการซ่อมบำรุง</a></p>` : ""}
      </div>
    `
  }
}

export async function emailAdminsAboutMaintenanceReport(
  maintenance: MaintenanceReportEmailData,
  admins: AdminEmailRecipient[]
): Promise<void> {
  await Promise.allSettled(
    admins.map((admin) => {
      const email = buildMaintenanceReportEmail(maintenance, admin)
      return sendEmail({
        to: admin.email,
        subject: email.subject,
        text: email.text,
        html: email.html
      })
    })
  )
}
