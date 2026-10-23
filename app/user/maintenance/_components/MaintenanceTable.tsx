import { History } from "lucide-react"
import { formatDateTime, getMaintenanceStatusColor, getMaintenanceStatusText } from "@/lib/format"
import type { Maintenance } from "../types"
import { maintenanceTypeLabels } from "../constants"

type MaintenanceTableProps = {
  maintenances: Maintenance[]
  loading: boolean
}

export default function MaintenanceTable({
  maintenances,
  loading,
}: MaintenanceTableProps) {
  return (
    <section
      className="overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-gray-200"
      aria-labelledby="maintenance-history-title"
    >
      <div className="flex items-center gap-2 border-b border-gray-200 px-6 py-4">
        <History className="h-5 w-5 text-blue-700" aria-hidden="true" />
        <div>
          <h2
            id="maintenance-history-title"
            className="text-lg font-semibold text-gray-950"
          >
            ประวัติการแจ้งซ่อมของฉัน
          </h2>
          <p className="mt-1 text-sm text-gray-600">
            ทั้งหมด {maintenances.length} รายการ
          </p>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[980px]">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-600">
                รถ
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-600">
                รายละเอียดปัญหา
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-600">
                ประเภท
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-600">
                วันที่พบปัญหา
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-600">
                สถานะ
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {loading && maintenances.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-10 text-center">
                  <div className="mx-auto h-5 w-48 animate-pulse rounded bg-gray-200" />
                </td>
              </tr>
            ) : maintenances.length === 0 ? (
              <tr>
                <td
                  colSpan={5}
                  className="px-6 py-12 text-center text-sm text-gray-600"
                >
                  คุณยังไม่มีประวัติการแจ้งซ่อม
                </td>
              </tr>
            ) : (
              maintenances.map((item) => (
                <tr
                  key={item.id}
                  className="transition-colors duration-150 hover:bg-gray-50"
                >
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-gray-950">
                      {item.vehicle.plateNumber}
                    </div>
                    <div className="text-sm text-gray-600">
                      {item.vehicle.type.name}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <p className="max-w-md text-sm leading-6 text-gray-950">
                      {item.description}
                    </p>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-700">
                    {maintenanceTypeLabels[item.maintenanceType]}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-700">
                    {formatDateTime(item.startDate)}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${getMaintenanceStatusColor(item.status)}`}
                    >
                      {getMaintenanceStatusText(item.status)}
                    </span>
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
