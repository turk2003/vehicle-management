import { CalendarDays, CheckCircle2, XCircle } from "lucide-react"
import type { BookingStats, DateFilter } from "./types"

export const INITIAL_DATE_FILTER: DateFilter = {
  startDate: "",
  endDate: "",
}

export const INITIAL_STATS: BookingStats = {
  total: 0,
  approved: 0,
  rejected: 0,
}

export const STATUS_FILTERS = [
  { value: "ALL", label: "ทั้งหมด", icon: CalendarDays },
  { value: "APPROVED", label: "อนุมัติแล้ว", icon: CheckCircle2 },
  { value: "REJECTED", label: "ปฏิเสธ", icon: XCircle },
]
