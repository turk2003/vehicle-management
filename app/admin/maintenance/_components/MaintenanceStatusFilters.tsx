import type { Dispatch, SetStateAction } from "react"
import type { MaintenanceStatus } from "../types"
import { statusFilters } from "../constants"

type MaintenanceStatusFiltersProps = {
  stats: { total: number; pending: number; inProgress: number; completed: number; }
  filterStatus: "" | MaintenanceStatus
  setFilterStatus: Dispatch<SetStateAction<"" | MaintenanceStatus>>
}

export default function MaintenanceStatusFilters({
  stats,
  filterStatus,
  setFilterStatus,
}: MaintenanceStatusFiltersProps) {
  return (
    <section className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {statusFilters.map((stat) => {
        const value =
          stat.value === ""
            ? stats.total
            : stat.value === "REPORTED"
              ? stats.pending
              : stat.value === "IN_PROGRESS"
                ? stats.inProgress
                : stats.completed
        const isActive = filterStatus === stat.value

        return (
          <button
            type="button"
            key={stat.label}
            onClick={() => setFilterStatus(stat.value)}
            className={`rounded-xl bg-white p-4 text-left shadow-sm ring-1 transition hover:-translate-y-0.5 hover:shadow-md ${
              isActive ? "ring-2 ring-orange-300" : "ring-slate-200"
            }`}
          >
            <p className="text-sm font-medium text-slate-500">{stat.label}</p>
            <p className="mt-2 text-3xl font-semibold text-slate-950">{value}</p>
            <p className="mt-1 text-xs text-slate-500">{stat.description}</p>
          </button>
        )
      })}
    </section>
  )
}
