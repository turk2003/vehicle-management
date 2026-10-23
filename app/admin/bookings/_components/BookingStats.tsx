import type { BookingStats as BookingStatistics } from "../types"

type BookingStatsProps = {
  stats: BookingStatistics
}

export default function BookingStats({ stats }: BookingStatsProps) {
  const statItems = [
    { label: "ทั้งหมด", value: stats.total, color: "text-gray-950" },
    { label: "รออนุมัติ", value: stats.pending, color: "text-yellow-700" },
    { label: "อนุมัติแล้ว", value: stats.approved, color: "text-green-700" },
    { label: "เปลี่ยนรถแล้ว", value: stats.changed, color: "text-blue-700" },
    { label: "กำลังใช้งาน", value: stats.in_progress, color: "text-indigo-700" },
    { label: "เสร็จสิ้น", value: stats.completed, color: "text-teal-700" },
    { label: "ปฏิเสธ", value: stats.rejected, color: "text-red-700" },
    { label: "ยกเลิก", value: stats.cancelled, color: "text-gray-700" },
  ]

  return (
    <div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-4 xl:grid-cols-8">
      {statItems.map((item) => (
        <div
          key={item.label}
          className="rounded-lg bg-gray-50 p-4 ring-1 ring-gray-200"
        >
          <p className="text-sm font-medium text-gray-600">
            {item.label}
          </p>
          <p className={`mt-2 text-2xl font-bold ${item.color}`}>
            {item.value}
          </p>
        </div>
      ))}
    </div>
  )
}
