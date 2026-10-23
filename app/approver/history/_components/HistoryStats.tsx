import { CalendarDays, CheckCircle2, XCircle } from "lucide-react"
import type { Dispatch, SetStateAction } from "react"
import type { BookingStats } from "../types"

type HistoryStatsProps = {
  stats: BookingStats
  selectedStatus: string
  setSelectedStatus: Dispatch<SetStateAction<string>>
}

export default function HistoryStats({
  stats,
  selectedStatus,
  setSelectedStatus,
}: HistoryStatsProps) {
  const approvalRate =
    stats.total > 0 ? Math.round((stats.approved / stats.total) * 100) : 0

  const statItems = [
    {
      label: "ทั้งหมด",
      value: stats.total,
      status: "ALL",
      color: "text-gray-950",
      icon: CalendarDays,
    },
    {
      label: "อนุมัติแล้ว",
      value: stats.approved,
      status: "APPROVED",
      color: "text-green-700",
      icon: CheckCircle2,
    },
    {
      label: "ปฏิเสธแล้ว",
      value: stats.rejected,
      status: "REJECTED",
      color: "text-red-700",
      icon: XCircle,
    },
    {
      label: "อัตราอนุมัติ",
      value: `${approvalRate}%`,
      status: null,
      color: "text-blue-700",
      icon: CheckCircle2,
    },
  ]

  return (
    <section className="mb-6 grid grid-cols-2 gap-3 md:grid-cols-4">
      {statItems.map((item) => {
        const Icon = item.icon
        const selected = item.status === selectedStatus
        const clickable = item.status !== null

        return (
          <button
            key={item.label}
            type="button"
            onClick={() => {
              if (item.status) setSelectedStatus(item.status)
            }}
            disabled={!clickable}
            className={`rounded-xl bg-white p-4 text-left shadow-sm ring-1 ring-gray-200 transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-blue-600/25 ${
              selected ? "ring-2 ring-blue-600" : ""
            } ${
              clickable
                ? "hover:bg-gray-50"
                : "cursor-default disabled:opacity-100"
            }`}
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
          </button>
        )
      })}
    </section>
  )
}
