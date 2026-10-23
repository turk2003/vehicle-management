import type { BookingFilters, BookingStats } from "./types"

export const INITIAL_FILTERS: BookingFilters = {
  status: "",
  userId: "",
  vehicleId: "",
  startDate: "",
  endDate: "",
}

export const INITIAL_STATS: BookingStats = {
  total: 0,
  pending: 0,
  approved: 0,
  rejected: 0,
  cancelled: 0,
  changed: 0,
  in_progress: 0,
  completed: 0,
}

export const BOOKING_STATUS_OPTIONS = [
  { value: "PENDING", label: "รออนุมัติ" },
  { value: "APPROVED", label: "อนุมัติแล้ว" },
  { value: "CHANGED", label: "เปลี่ยนรถแล้ว" },
  { value: "IN_PROGRESS", label: "กำลังใช้งาน" },
  { value: "COMPLETED", label: "เสร็จสิ้น" },
  { value: "REJECTED", label: "ปฏิเสธ" },
  { value: "CANCELLED", label: "ยกเลิก" },
]

export const STATUS_UPDATE_OPTIONS = BOOKING_STATUS_OPTIONS.filter(
  (status) =>
    ["PENDING", "APPROVED", "REJECTED", "CANCELLED"].includes(status.value),
)
