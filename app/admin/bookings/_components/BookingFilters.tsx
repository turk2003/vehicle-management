import { SlidersHorizontal } from "lucide-react"
import { BOOKING_STATUS_OPTIONS } from "../constants"
import type { BookingFilters as BookingFilterValues, User, Vehicle } from "../types"

type BookingFiltersProps = {
  filters: BookingFilterValues
  users: User[]
  vehicles: Vehicle[]
  onChange: (key: keyof BookingFilterValues, value: string) => void
  onReset: () => void
}

export default function BookingFilters({
  filters,
  users,
  vehicles,
  onChange,
  onReset,
}: BookingFiltersProps) {
  return (
    <section
      className="mb-6 rounded-xl bg-white p-6 shadow-sm ring-1 ring-gray-200"
      aria-labelledby="booking-filter-title"
    >
      <div className="mb-4 flex items-center gap-2">
        <SlidersHorizontal
          className="h-5 w-5 text-blue-700"
          aria-hidden="true"
        />
        <h2
          id="booking-filter-title"
          className="text-lg font-semibold text-gray-950"
        >
          กรองข้อมูล
        </h2>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-5">
        <div>
          <label
            htmlFor="status-filter"
            className="mb-1.5 block text-sm font-medium text-gray-700"
          >
            สถานะ
          </label>
          <select
            id="status-filter"
            value={filters.status}
            onChange={(e) => onChange("status", e.target.value)}
            className="min-h-11 w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-gray-950 transition-colors duration-150 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600/25"
          >
            <option value="">ทุกสถานะ</option>
            {BOOKING_STATUS_OPTIONS.map((status) => (
              <option key={status.value} value={status.value}>
                {status.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label
            htmlFor="user-filter"
            className="mb-1.5 block text-sm font-medium text-gray-700"
          >
            ผู้จอง
          </label>
          <select
            id="user-filter"
            value={filters.userId}
            onChange={(e) => onChange("userId", e.target.value)}
            className="min-h-11 w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-gray-950 transition-colors duration-150 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600/25"
          >
            <option value="">ทุกคน</option>
            {users.map((user) => (
              <option key={user.id} value={user.id}>
                {user.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label
            htmlFor="vehicle-filter"
            className="mb-1.5 block text-sm font-medium text-gray-700"
          >
            รถ
          </label>
          <select
            id="vehicle-filter"
            value={filters.vehicleId}
            onChange={(e) =>
              onChange("vehicleId", e.target.value)
            }
            className="min-h-11 w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-gray-950 transition-colors duration-150 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600/25"
          >
            <option value="">ทุกคัน</option>
            {vehicles.map((vehicle) => (
              <option key={vehicle.id} value={vehicle.id}>
                {vehicle.plateNumber} ({vehicle.type.name})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label
            htmlFor="start-date-filter"
            className="mb-1.5 block text-sm font-medium text-gray-700"
          >
            วันที่เริ่ม
          </label>
          <input
            id="start-date-filter"
            type="date"
            value={filters.startDate}
            onChange={(e) =>
              onChange("startDate", e.target.value)
            }
            className="min-h-11 w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-gray-950 transition-colors duration-150 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600/25"
          />
        </div>

        <div>
          <label
            htmlFor="end-date-filter"
            className="mb-1.5 block text-sm font-medium text-gray-700"
          >
            วันที่สิ้นสุด
          </label>
          <input
            id="end-date-filter"
            type="date"
            value={filters.endDate}
            onChange={(e) => onChange("endDate", e.target.value)}
            className="min-h-11 w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-gray-950 transition-colors duration-150 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600/25"
          />
        </div>
      </div>

      <div className="mt-5 flex justify-end">
        <button
          type="button"
          onClick={onReset}
          className="inline-flex min-h-10 items-center justify-center rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 transition-colors duration-150 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-600/25"
        >
          ล้างตัวกรอง
        </button>
      </div>
    </section>
  )
}
