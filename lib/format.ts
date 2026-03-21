// ─── Booking Status ─────────────────────────────────────────────────────────

/** Tailwind class สำหรับ badge สถานะการจอง */
export function getBookingStatusColor(status: string): string {
  switch (status) {
    case "PENDING":   return "bg-yellow-100 text-yellow-800"
    case "APPROVED":  return "bg-green-100 text-green-800"
    case "REJECTED":  return "bg-red-100 text-red-800"
    case "CANCELLED": return "bg-gray-100 text-gray-800"
    case "CHANGED":   return "bg-blue-100 text-blue-800"
    default:          return "bg-gray-100 text-gray-800"
  }
}

/** ข้อความภาษาไทยสำหรับสถานะการจอง */
export function getBookingStatusText(status: string): string {
  switch (status) {
    case "PENDING":   return "รออนุมัติ"
    case "APPROVED":  return "อนุมัติแล้ว"
    case "REJECTED":  return "ปฏิเสธ"
    case "CANCELLED": return "ยกเลิก"
    case "CHANGED":   return "เปลี่ยนแปลง"
    default:          return status
  }
}

// ─── Vehicle Status ──────────────────────────────────────────────────────────

/** Tailwind class สำหรับ badge สถานะรถ */
export function getVehicleStatusColor(status: string): string {
  switch (status) {
    case "AVAILABLE":   return "bg-green-100 text-green-800"
    case "BOOKED":      return "bg-blue-100 text-blue-800"
    case "MAINTENANCE": return "bg-orange-100 text-orange-800"
    default:            return "bg-gray-100 text-gray-800"
  }
}

/** ข้อความภาษาไทยสำหรับสถานะรถ */
export function getVehicleStatusText(status: string): string {
  switch (status) {
    case "AVAILABLE":   return "ว่าง"
    case "BOOKED":      return "กำลังถูกใช้งาน"
    case "MAINTENANCE": return "ซ่อมบำรุง"
    default:            return status
  }
}

// ─── Maintenance Status ──────────────────────────────────────────────────────

/** Tailwind class สำหรับ badge สถานะการบำรุงรักษา */
export function getMaintenanceStatusColor(status: string): string {
  switch (status) {
    case "REPORTED":    return "bg-yellow-100 text-yellow-800"
    case "IN_PROGRESS": return "bg-blue-100 text-blue-800"
    case "COMPLETED":   return "bg-green-100 text-green-800"
    default:            return "bg-gray-100 text-gray-800"
  }
}

/** ข้อความภาษาไทยสำหรับสถานะการบำรุงรักษา */
export function getMaintenanceStatusText(status: string): string {
  switch (status) {
    case "REPORTED":    return "รอถึงวันกำหนด"
    case "IN_PROGRESS": return "กำลังซ่อม"
    case "COMPLETED":   return "เสร็จสิ้น"
    default:            return status
  }
}

// ─── Date Formatting ─────────────────────────────────────────────────────────

/** วันที่ + เวลา แบบสั้น: "25 ก.พ. 2569 14:30" */
export function formatDateTime(dateString: string): string {
  return new Date(dateString).toLocaleString("th-TH", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

/** วันที่อย่างเดียว แบบสั้น: "25 ก.พ. 2569" */
export function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString("th-TH", {
    year: "numeric",
    month: "short",
    day: "numeric",
  })
}

/** วันที่ + เวลา แบบยาว: "25 กุมภาพันธ์ 2569 14:30" */
export function formatDateTimeLong(dateString: string): string {
  return new Date(dateString).toLocaleString("th-TH", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

// ─── User Role ──────────────────────────────────────────────────────────────

/** Tailwind class สำหรับ badge บทบาทผู้ใช้ */
export function getRoleColor(role: string): string {
  switch (role) {
    case "ADMIN":
      return "bg-red-100 text-red-800"
    case "APPROVER":
      return "bg-blue-100 text-blue-800"
    case "USER":
      return "bg-green-100 text-green-800"
    default:
      return "bg-gray-100 text-gray-800"
  }
}

/** ข้อความภาษาไทยสำหรับบทบาทผู้ใช้ */
export function getRoleDisplayName(role: string): string {
  switch (role) {
    case "ADMIN":
      return "ผู้ดูแลระบบ"
    case "APPROVER":
      return "ผู้อนุมัติ"
    case "USER":
      return "ผู้ใช้งาน"
    default:
      return role
  }
}
