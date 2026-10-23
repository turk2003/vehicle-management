import { Car, Gauge, Wrench } from "lucide-react"
import type { Vehicle } from "../types"

type VehicleSearchResultsProps = {
  vehicles: Vehicle[]
  openBookingForm: (vehicle: Vehicle) => void
}

export default function VehicleSearchResults({
  vehicles,
  openBookingForm,
}: VehicleSearchResultsProps) {
  return (
    <section aria-labelledby="available-vehicles-title">
      <div className="mb-4 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2
            id="available-vehicles-title"
            className="text-lg font-semibold text-gray-950"
          >
            รถที่ว่าง
          </h2>
          <p className="mt-1 text-sm text-gray-600">
            พบรถที่จองได้ {vehicles.length} คัน
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {vehicles.map((vehicle) => (
          <article
            key={vehicle.id}
            className={`rounded-xl bg-white p-5 shadow-sm ring-1 ring-gray-200 transition-colors duration-150 hover:bg-gray-50 ${
              vehicle.recommended ? "ring-2 ring-green-600" : ""
            }`}
          >
            <div className="mb-4 flex items-start justify-between gap-3">
              <div className="min-w-0">
                <h3 className="truncate text-lg font-semibold text-gray-950">
                  {vehicle.plateNumber}
                </h3>
                <p className="mt-1 text-sm text-gray-600">
                  {vehicle.type.name}
                </p>
              </div>
              <div className="flex flex-col items-end gap-1">
                <span className="inline-flex rounded-full bg-green-100 px-2.5 py-1 text-xs font-semibold text-green-800">
                  ว่าง
                </span>
                {vehicle.recommended && (
                  <span className="inline-flex rounded-full bg-blue-100 px-2.5 py-1 text-xs font-semibold text-blue-800">
                    แนะนำ
                  </span>
                )}
              </div>
            </div>

            <dl className="grid grid-cols-2 gap-3 text-sm">
              <div className="rounded-lg bg-gray-50 p-3 ring-1 ring-gray-200">
                <dt className="flex items-center gap-1.5 font-medium text-gray-600">
                  <Gauge className="h-4 w-4" aria-hidden="true" />
                  เลขไมล์
                </dt>
                <dd className="mt-1 font-semibold text-gray-950">
                  {vehicle.currentMileage.toLocaleString()} km
                </dd>
              </div>
              <div className="rounded-lg bg-gray-50 p-3 ring-1 ring-gray-200">
                <dt className="flex items-center gap-1.5 font-medium text-gray-600">
                  <Wrench className="h-4 w-4" aria-hidden="true" />
                  ประวัติซ่อม
                </dt>
                <dd className="mt-1 font-semibold text-gray-950">
                  {vehicle.maintenanceCount} ครั้ง
                </dd>
              </div>
            </dl>

            <button
              type="button"
              onClick={() => openBookingForm(vehicle)}
              className={`mt-5 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-white transition-colors duration-150 focus:outline-none focus:ring-2 ${
                vehicle.recommended
                  ? "bg-green-600 hover:bg-green-700 focus:ring-green-600/25"
                  : "bg-blue-600 hover:bg-blue-700 focus:ring-blue-600/25"
              }`}
            >
              <Car className="h-4 w-4" aria-hidden="true" />
              {vehicle.recommended ? "จองรถคันนี้ (แนะนำ)" : "จองรถคันนี้"}
            </button>
          </article>
        ))}
      </div>
    </section>
  )
}
