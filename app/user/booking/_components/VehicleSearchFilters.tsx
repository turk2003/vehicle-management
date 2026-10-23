import { Search } from "lucide-react"
import type { Dispatch, SetStateAction } from "react"
import type { VehicleType, SearchDate } from "../types"
import { getLocalDateTimeInputValue } from "../utils"

type VehicleSearchFiltersProps = {
  selectedType: string
  setSelectedType: Dispatch<SetStateAction<string>>
  vehicleTypes: VehicleType[]
  searchDate: SearchDate
  setSearchDate: Dispatch<SetStateAction<SearchDate>>
  minEndDateTime: string
  searchVehicles: (clearSuccess?: boolean) => Promise<void>
  loading: boolean
  canSearch: boolean
}

export default function VehicleSearchFilters({
  selectedType,
  setSelectedType,
  vehicleTypes,
  searchDate,
  setSearchDate,
  minEndDateTime,
  searchVehicles,
  loading,
  canSearch,
}: VehicleSearchFiltersProps) {
  return (
    <section
      className="mb-6 rounded-xl bg-white p-6 shadow-sm ring-1 ring-gray-200"
      aria-labelledby="vehicle-search-title"
    >
      <div className="mb-4 flex items-center gap-2">
        <Search className="h-5 w-5 text-blue-700" aria-hidden="true" />
        <h2
          id="vehicle-search-title"
          className="text-lg font-semibold text-gray-950"
        >
          ค้นหารถที่ว่าง
        </h2>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <div>
          <label
            htmlFor="vehicle-type"
            className="mb-1.5 block text-sm font-medium text-gray-700"
          >
            ประเภทรถ
          </label>
          <select
            id="vehicle-type"
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="min-h-11 w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-gray-950 transition-colors duration-150 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600/25"
          >
            <option value="">ทุกประเภท</option>
            {vehicleTypes.map((type) => (
              <option key={type.id} value={type.id}>
                {type.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label
            htmlFor="booking-start-date"
            className="mb-1.5 block text-sm font-medium text-gray-700"
          >
            วันเวลาเริ่ม
          </label>
          <input
            id="booking-start-date"
            type="datetime-local"
            value={searchDate.startDate}
            onChange={(e) =>
              setSearchDate((current) => ({
                ...current,
                startDate: e.target.value,
                endDate:
                  current.endDate && current.endDate <= e.target.value
                    ? ""
                    : current.endDate,
              }))
            }
            min={getLocalDateTimeInputValue()}
            className="min-h-11 w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-gray-950 transition-colors duration-150 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600/25"
          />
        </div>

        <div>
          <label
            htmlFor="booking-end-date"
            className="mb-1.5 block text-sm font-medium text-gray-700"
          >
            วันเวลาสิ้นสุด
          </label>
          <input
            id="booking-end-date"
            type="datetime-local"
            value={searchDate.endDate}
            onChange={(e) =>
              setSearchDate((current) => ({
                ...current,
                endDate: e.target.value,
              }))
            }
            min={minEndDateTime}
            disabled={!searchDate.startDate}
            className="min-h-11 w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-gray-950 transition-colors duration-150 disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-500 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600/25"
          />
        </div>

        <div className="flex items-end">
          <button
            type="button"
            onClick={() => searchVehicles()}
            disabled={loading || !canSearch}
            className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors duration-150 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-600/25 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Search className="h-4 w-4" aria-hidden="true" />
            {loading ? "กำลังค้นหา..." : "ค้นหา"}
          </button>
        </div>
      </div>
    </section>
  )
}
