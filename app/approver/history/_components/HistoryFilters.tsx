import { CalendarDays } from "lucide-react"
import type { Dispatch, SetStateAction } from "react"
import type { DateFilter } from "../types"
import { INITIAL_DATE_FILTER } from "../constants"

type HistoryFiltersProps = {
  dateFilter: DateFilter
  setDateFilter: Dispatch<SetStateAction<DateFilter>>
}

export default function HistoryFilters({
  dateFilter,
  setDateFilter,
}: HistoryFiltersProps) {
  return (
    <section
      className="mb-6 rounded-xl bg-white p-6 shadow-sm ring-1 ring-gray-200"
      aria-labelledby="history-filter-title"
    >
      <div className="mb-4 flex items-center gap-2">
        <CalendarDays className="h-5 w-5 text-blue-700" aria-hidden="true" />
        <h2
          id="history-filter-title"
          className="text-lg font-semibold text-gray-950"
        >
          กรองตามวันที่
        </h2>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div>
          <label
            htmlFor="history-start-date"
            className="mb-1.5 block text-sm font-medium text-gray-700"
          >
            วันที่เริ่มต้น
          </label>
          <input
            id="history-start-date"
            type="date"
            value={dateFilter.startDate}
            onChange={(e) =>
              setDateFilter((current) => ({
                ...current,
                startDate: e.target.value,
              }))
            }
            className="min-h-11 w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-gray-950 transition-colors duration-150 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600/25"
          />
        </div>
        <div>
          <label
            htmlFor="history-end-date"
            className="mb-1.5 block text-sm font-medium text-gray-700"
          >
            วันที่สิ้นสุด
          </label>
          <input
            id="history-end-date"
            type="date"
            value={dateFilter.endDate}
            onChange={(e) =>
              setDateFilter((current) => ({
                ...current,
                endDate: e.target.value,
              }))
            }
            className="min-h-11 w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-gray-950 transition-colors duration-150 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600/25"
          />
        </div>
        <div className="flex items-end">
          <button
            type="button"
            onClick={() => setDateFilter(INITIAL_DATE_FILTER)}
            className="inline-flex min-h-11 w-full items-center justify-center rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 transition-colors duration-150 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-600/25"
          >
            ล้างตัวกรอง
          </button>
        </div>
      </div>
    </section>
  )
}
