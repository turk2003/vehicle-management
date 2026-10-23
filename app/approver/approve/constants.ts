import { CheckCircle2, Clock, XCircle } from "lucide-react"

export const STATUS_FILTERS = [
  { value: "PENDING", label: "รออนุมัติ", icon: Clock },
  { value: "APPROVED", label: "อนุมัติแล้ว", icon: CheckCircle2 },
  { value: "REJECTED", label: "ปฏิเสธ", icon: XCircle },
]
