import { Pencil, Trash2 } from "lucide-react"
import type { Vehicle, VehicleType } from "../types"

type VehicleTypesTableProps = {
  vehicleTypes: VehicleType[]
  vehicles: Vehicle[]
  canManageVehicles: boolean
  openEditTypeModal: (type: VehicleType) => void
  deleteVehicleType: (id: string, name: string) => Promise<void>
  loading: boolean
}

export default function VehicleTypesTable({
  vehicleTypes,
  vehicles,
  canManageVehicles,
  openEditTypeModal,
  deleteVehicleType,
  loading,
}: VehicleTypesTableProps) {
  return (
    <section
      className="overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-gray-200"
      aria-labelledby="types-table-title"
    >
      <div className="border-b border-gray-200 px-6 py-4">
        <h2
          id="types-table-title"
          className="text-lg font-semibold text-gray-950"
        >
          ประเภทรถ
        </h2>
        <p className="mt-1 text-sm text-gray-600">
          ทั้งหมด {vehicleTypes.length} ประเภท
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[640px]">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-600">
                ชื่อประเภท
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-600">
                จำนวนรถ
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-600">
                การดำเนินการ
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {vehicleTypes.length === 0 ? (
              <tr>
                <td
                  colSpan={3}
                  className="px-6 py-12 text-center text-sm text-gray-600"
                >
                  ยังไม่มีประเภทรถ
                </td>
              </tr>
            ) : (
              vehicleTypes.map((type) => {
                const vehicleCount = vehicles.filter(
                  (vehicle) => vehicle.type?.id === type.id,
                ).length

                return (
                  <tr
                    key={type.id}
                    className="transition-colors duration-150 hover:bg-gray-50"
                  >
                    <td className="px-6 py-4 text-sm font-semibold text-gray-950">
                      {type.name}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">
                      {vehicleCount} คัน
                    </td>
                    <td className="px-6 py-4">
                      {canManageVehicles && <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => openEditTypeModal(type)}
                          className="inline-flex min-h-9 items-center gap-1.5 rounded-md bg-blue-50 px-3 py-1.5 text-sm font-medium text-blue-700 transition-colors duration-150 hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-600/25"
                        >
                          <Pencil
                            className="h-4 w-4"
                            aria-hidden="true"
                          />
                          แก้ไข
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            deleteVehicleType(type.id, type.name)
                          }
                          disabled={vehicleCount > 0 || loading}
                          title={
                            vehicleCount > 0
                              ? "ไม่สามารถลบประเภทที่มีรถอยู่ได้"
                              : undefined
                          }
                          className="inline-flex min-h-9 items-center gap-1.5 rounded-md bg-red-50 px-3 py-1.5 text-sm font-medium text-red-700 transition-colors duration-150 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-red-600/25 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          <Trash2
                            className="h-4 w-4"
                            aria-hidden="true"
                          />
                          ลบ
                        </button>
                      </div>}
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>
    </section>
  )
}
