import { CalendarDays, History, Wrench } from "lucide-react"
import type { MaintenanceStats } from "../types"

type MaintenanceStatsPanelProps = {
  stats: MaintenanceStats
}

export default function MaintenanceStatsPanel({
  stats,
}: MaintenanceStatsPanelProps) {
  return (
    <section className="mb-6 grid grid-cols-2 gap-3 md:grid-cols-4">
      {[
        {
          label: "ทั้งหมด",
          value: stats.total,
          color: "text-gray-950",
          icon: History,
        },
        {
          label: "แจ้งแล้ว",
          value: stats.reported,
          color: "text-yellow-700",
          icon: Wrench,
        },
        {
          label: "กำลังซ่อม",
          value: stats.in_progress,
          color: "text-blue-700",
          icon: Wrench,
        },
        {
          label: "เสร็จสิ้น",
          value: stats.completed,
          color: "text-green-700",
          icon: CalendarDays,
        },
      ].map((item) => {
        const Icon = item.icon

        return (
          <div
            key={item.label}
            className="rounded-xl bg-white p-4 shadow-sm ring-1 ring-gray-200"
          >
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm font-medium text-gray-600">
                {item.label}
              </p>
              <Icon className="h-4 w-4 text-gray-500" aria-hidden="true" />
            </div>
            <p className={`mt-2 text-2xl font-bold ${item.color}`}>
              {item.value}
            </p>
          </div>
        )
      })}
    </section>
  )
}
