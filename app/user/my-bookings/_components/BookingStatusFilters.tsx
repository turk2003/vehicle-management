import type { Dispatch, SetStateAction } from "react"
import type { BookingStats } from "../types"
import { STATUS_FILTERS } from "../constants"

type BookingStatusFiltersProps = {
  stats: BookingStats
  selectedStatus: string
  setSelectedStatus: Dispatch<SetStateAction<string>>
}

export default function BookingStatusFilters({
  stats,
  selectedStatus,
  setSelectedStatus,
}: BookingStatusFiltersProps) {
  return (
    <section className="mb-6 grid grid-cols-2 gap-3 md:grid-cols-4 xl:grid-cols-7">
      {STATUS_FILTERS.map((item) => {
        const Icon = item.icon
        const value = stats[item.stat]
        const selected = selectedStatus === item.key

        return (
          <button
            key={item.key}
            type="button"
            onClick={() => setSelectedStatus(item.key)}
            className={`rounded-xl bg-white p-4 text-left shadow-sm ring-1 ring-gray-200 transition-colors duration-150 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-600/25 ${
              selected ? "ring-2 ring-blue-600" : ""
            }`}
          >
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm font-medium text-gray-600">
                {item.label}
              </p>
              <Icon className="h-4 w-4 text-gray-500" aria-hidden="true" />
            </div>
            <p className={`mt-2 text-2xl font-bold ${item.color}`}>
              {value}
            </p>
          </button>
        )
      })}
    </section>
  )
}
