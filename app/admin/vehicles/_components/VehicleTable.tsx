import { Pencil, Trash2 } from "lucide-react"
import { getVehicleStatusColor, getVehicleStatusText } from "@/lib/format"
import type { Vehicle } from "../types"

type VehicleTableProps = {
  vehicles: Vehicle[]
  loading: boolean
  canManageVehicles: boolean
  openEditModal: (vehicle: Vehicle) => void
  deleteVehicle: (id: string, plateNumber: string) => Promise<void>
}

export default function VehicleTable({
  vehicles,
  loading,
  canManageVehicles,
  openEditModal,
  deleteVehicle,
}: VehicleTableProps) {
  return (
    <section
      className="overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-gray-200"
      aria-labelledby="vehicles-table-title"
    >
      <div className="border-b border-gray-200 px-6 py-4">
        <h2
          id="vehicles-table-title"
          className="text-lg font-semibold text-gray-950"
        >
          รายการรถ
        </h2>
        <p className="mt-1 text-sm text-gray-600">
          ทั้งหมด {vehicles.length} รายการ
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[840px]">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-600">
                ทะเบียนรถ
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-600">
                ประเภทรถ
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-600">
                สถานะ
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-600">
                เลขไมล์
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-600">
                การดำเนินการ
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {loading && vehicles.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-10 text-center">
                  <div className="mx-auto h-5 w-48 animate-pulse rounded bg-gray-200" />
                </td>
              </tr>
            ) : vehicles.length === 0 ? (
              <tr>
                <td
                  colSpan={5}
                  className="px-6 py-12 text-center text-sm text-gray-600"
                >
                  ยังไม่มีข้อมูลรถ
                </td>
              </tr>
            ) : (
              vehicles.map((vehicle) => (
                <tr
                  key={vehicle.id}
                  className="transition-colors duration-150 hover:bg-gray-50"
                >
                  <td className="px-6 py-4">
                    <div className="text-sm font-semibold text-gray-950">
                      {vehicle.plateNumber}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-700">
                    {vehicle.type?.name || "ไม่ระบุประเภท"}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${getVehicleStatusColor(vehicle.status)}`}
                    >
                      {getVehicleStatusText(vehicle.status)}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-700">
                    {(vehicle.currentMileage || 0).toLocaleString()} km
                  </td>
                  <td className="px-6 py-4">
                    {canManageVehicles && <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => openEditModal(vehicle)}
                        className="inline-flex min-h-9 items-center gap-1.5 rounded-md bg-blue-50 px-3 py-1.5 text-sm font-medium text-blue-700 transition-colors duration-150 hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-600/25"
                      >
                        <Pencil className="h-4 w-4" aria-hidden="true" />
                        แก้ไข
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          deleteVehicle(vehicle.id, vehicle.plateNumber)
                        }
                        disabled={loading}
                        className="inline-flex min-h-9 items-center gap-1.5 rounded-md bg-red-50 px-3 py-1.5 text-sm font-medium text-red-700 transition-colors duration-150 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-red-600/25 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        <Trash2 className="h-4 w-4" aria-hidden="true" />
                        ลบ
                      </button>
                    </div>}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </section>
  )
}
