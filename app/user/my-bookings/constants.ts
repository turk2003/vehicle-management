import { CalendarDays, Car, CheckCircle2, Clock, RotateCcw, Trash2, XCircle } from "lucide-react"
import type { BookingStats, EditForm } from "./types"

export const INITIAL_STATS: BookingStats = {
  total: 0,
  pending: 0,
  approved: 0,
  rejected: 0,
  cancelled: 0,
  in_progress: 0,
  completed: 0,
}

export const INITIAL_EDIT_FORM: EditForm = {
  id: "",
  startDate: "",
  endDate: "",
  purpose: "",
  destination: "",
}

export const STATUS_FILTERS = [
  {
    key: "ALL",
    label: "ทั้งหมด",
    stat: "total",
    color: "text-gray-950",
    icon: CalendarDays,
  },
  {
    key: "PENDING",
    label: "รออนุมัติ",
    stat: "pending",
    color: "text-yellow-700",
    icon: Clock,
  },
  {
    key: "APPROVED",
    label: "อนุมัติแล้ว",
    stat: "approved",
    color: "text-green-700",
    icon: CheckCircle2,
  },
  {
    key: "IN_PROGRESS",
    label: "กำลังใช้งาน",
    stat: "in_progress",
    color: "text-indigo-700",
    icon: Car,
  },
  {
    key: "COMPLETED",
    label: "เสร็จสิ้น",
    stat: "completed",
    color: "text-teal-700",
    icon: RotateCcw,
  },
  {
    key: "REJECTED",
    label: "ปฏิเสธ",
    stat: "rejected",
    color: "text-red-700",
    icon: XCircle,
  },
  {
    key: "CANCELLED",
    label: "ยกเลิก",
    stat: "cancelled",
    color: "text-gray-700",
    icon: Trash2,
  },
] as const
