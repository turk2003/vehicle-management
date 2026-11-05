import StatStrip from "@/app/component/stat-strip"
import type { BookingStats as BookingStatistics } from "../types"

type BookingStatsProps = {
  stats: BookingStatistics
}

export default function BookingStats({ stats }: BookingStatsProps) {
  const statItems = [
    { label: "ทั้งหมด", value: stats.total },
    { label: "รออนุมัติ", value: stats.pending, dot: "bg-yellow-500" },
    { label: "อนุมัติแล้ว", value: stats.approved, dot: "bg-green-600" },
    { label: "เปลี่ยนรถแล้ว", value: stats.changed, dot: "bg-blue-600" },
    { label: "กำลังใช้งาน", value: stats.in_progress, dot: "bg-indigo-600" },
    { label: "เสร็จสิ้น", value: stats.completed, dot: "bg-teal-600" },
    { label: "ปฏิเสธ", value: stats.rejected, dot: "bg-red-600" },
    { label: "ยกเลิก", value: stats.cancelled, dot: "bg-gray-400" },
  ]

  return (
    <StatStrip
      label="สรุปสถานะการจอง"
      items={statItems}
      className="xl:grid-cols-8"
    />
  )
}
