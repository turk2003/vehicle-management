import { Filter, RotateCcw } from "lucide-react"
import type { Dispatch, SetStateAction } from "react"
import type { VehicleOption, Filters } from "../types"
import { bangkokToday, defaultFilters, fieldClass } from "../constants"

type HistoryFiltersProps = {
  hasFilters: boolean
  setFilters: Dispatch<SetStateAction<Filters>>
  filters: Filters
  vehicleOptions: VehicleOption[]
}

export default function HistoryFilters({
  hasFilters,
  setFilters,
  filters,
  vehicleOptions,
}: HistoryFiltersProps) {
  return (
    <section className="rounded-xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
      <div className="flex flex-col gap-3 border-b border-slate-200 pb-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-slate-100 p-2 text-slate-700">
            <Filter className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-slate-950">ตัวกรองรายงาน</h2>
            <p className="text-sm text-slate-500">เลือกช่วงเวลาและรถที่ต้องการตรวจสอบ</p>
          </div>
        </div>
        {hasFilters && (
          <button
            type="button"
            onClick={() => setFilters(defaultFilters)}
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-orange-500"
          >
            <RotateCcw className="h-4 w-4" />
            ล้างตัวกรอง
          </button>
        )}
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-3">
        <div>
          <label htmlFor="history-vehicle" className="mb-1.5 block text-sm font-medium text-slate-700">
            รถ
          </label>
          <select
            id="history-vehicle"
            value={filters.vehicleId}
            onChange={(event) => setFilters((prev) => ({ ...prev, vehicleId: event.target.value }))}
            className={fieldClass}
          >
            <option value="">ทุกคัน</option>
            {vehicleOptions.map((vehicle) => (
              <option key={vehicle.id} value={vehicle.id}>
                {vehicle.plateNumber}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="history-start-date" className="mb-1.5 block text-sm font-medium text-slate-700">
            วันที่เริ่มต้น
          </label>
          <input
            id="history-start-date"
            type="date"
            required
            value={filters.startDate}
            max={filters.endDate || bangkokToday}
            onChange={(event) => setFilters((prev) => ({ ...prev, startDate: event.target.value }))}
            className={fieldClass}
          />
        </div>
        <div>
          <label htmlFor="history-end-date" className="mb-1.5 block text-sm font-medium text-slate-700">
            วันที่สิ้นสุด
          </label>
          <input
            id="history-end-date"
            type="date"
            required
            value={filters.endDate}
            min={filters.startDate || undefined}
            max={bangkokToday}
            onChange={(event) => setFilters((prev) => ({ ...prev, endDate: event.target.value }))}
            className={fieldClass}
          />
        </div>
      </div>
    </section>
  )
}
