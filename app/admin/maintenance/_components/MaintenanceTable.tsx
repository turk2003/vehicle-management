import { Pencil, SlidersHorizontal, Trash2, Wrench } from "lucide-react"
import { formatDateTime, getBookingStatusText, getMaintenanceStatusColor, getMaintenanceStatusText } from "@/lib/format"
import type { Dispatch, SetStateAction } from "react"
import type { MaintenanceStatus, Maintenance } from "../types"
import { maintenanceTypeLabels } from "../constants"
import { getVehicleStatusText, getVehicleStatusClass, getMaintenanceTypeClass } from "../utils"

type MaintenanceTableProps = {
  filteredMaintenances: Maintenance[]
  maintenances: Maintenance[]
  filterStatus: "" | MaintenanceStatus
  setFilterStatus: Dispatch<SetStateAction<"" | MaintenanceStatus>>
  loading: boolean
  canManageMaintenance: boolean
  openEditModal: (item: Maintenance) => void
  handleDelete: (item: Maintenance) => Promise<void>
}

export default function MaintenanceTable({
  filteredMaintenances,
  maintenances,
  filterStatus,
  setFilterStatus,
  loading,
  canManageMaintenance,
  openEditModal,
  handleDelete,
}: MaintenanceTableProps) {
  return (
    <section className="overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-slate-200">
      <div className="flex flex-col gap-3 border-b border-slate-200 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-orange-50 p-2 text-orange-700">
            <Wrench className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-slate-950">รายการบำรุงรักษา</h2>
            <p className="text-sm text-slate-500">แสดง {filteredMaintenances.length} จาก {maintenances.length} รายการ</p>
          </div>
        </div>
        {filterStatus && (
          <button
            type="button"
            onClick={() => setFilterStatus("")}
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-orange-500"
          >
            <SlidersHorizontal className="h-4 w-4" />
            ล้างตัวกรอง
          </button>
        )}
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-[1480px] w-full divide-y divide-slate-200">
          <thead className="bg-slate-50">
            <tr>
              {["รถ", "ประเภท", "รายละเอียด", "ศูนย์บริการ/ช่าง", "ค่าใช้จ่าย", "วันที่เริ่ม", "วันที่เสร็จ", "การจองที่กระทบ", "สถานะ", "ผู้รายงาน", "การดำเนินการ"].map((heading) => (
                <th key={heading} className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  {heading}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white">
            {loading ? (
              <tr>
                <td colSpan={11} className="px-5 py-12 text-center text-sm text-slate-500">
                  กำลังโหลดข้อมูล...
                </td>
              </tr>
            ) : filteredMaintenances.length === 0 ? (
              <tr>
                <td colSpan={11} className="px-5 py-12 text-center text-sm text-slate-500">
                  ไม่พบรายการบำรุงรักษาตามตัวกรองนี้
                </td>
              </tr>
            ) : (
              filteredMaintenances.map((item) => (
                <tr key={item.id} className="transition hover:bg-slate-50">
                  <td className="px-5 py-4 align-top">
                    <p className="font-semibold text-slate-950">{item.vehicle.plateNumber}</p>
                    <p className="text-sm text-slate-500">{item.vehicle.type.name}</p>
                    <span className={`mt-2 inline-flex rounded-full px-2 py-0.5 text-xs font-medium ring-1 ${getVehicleStatusClass(item.vehicle.status)}`}>
                      {getVehicleStatusText(item.vehicle.status)}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-5 py-4 align-top">
                    <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ${getMaintenanceTypeClass(item.maintenanceType)}`}>
                      {maintenanceTypeLabels[item.maintenanceType]}
                    </span>
                  </td>
                  <td className="px-5 py-4 align-top">
                    <p className="max-w-xs truncate text-sm font-medium text-slate-900" title={item.description}>
                      {item.description}
                    </p>
                    {item.repairDetails && (
                      <p className="mt-1 max-w-xs truncate text-xs text-slate-500" title={item.repairDetails}>
                        {item.repairDetails}
                      </p>
                    )}
                  </td>
                  <td className="px-5 py-4 align-top text-sm text-slate-700">
                    {item.serviceCenterName || <span className="text-slate-400">-</span>}
                  </td>
                  <td className="px-5 py-4 align-top text-sm font-medium text-slate-900">
                    {item.cost ? `฿${item.cost.toLocaleString()}` : <span className="text-slate-400">-</span>}
                  </td>
                  <td className="whitespace-nowrap px-5 py-4 align-top text-sm text-slate-700">
                    {formatDateTime(item.startDate)}
                  </td>
                  <td className="whitespace-nowrap px-5 py-4 align-top text-sm text-slate-700">
                    {item.endDate ? formatDateTime(item.endDate) : <span className="text-slate-400">-</span>}
                  </td>
                  <td className="px-5 py-4 align-top text-sm text-slate-700">
                    {item.affectedBookings.length === 0 ? (
                      <span className="text-slate-400">ไม่มี</span>
                    ) : (
                      <details className="w-72 rounded-lg bg-amber-50 p-3 ring-1 ring-amber-200">
                        <summary className="cursor-pointer font-semibold text-amber-900">
                          {item.affectedBookings.length} รายการ
                        </summary>
                        <ul className="mt-3 space-y-3">
                          {item.affectedBookings.map((booking) => (
                            <li
                              key={booking.id}
                              className="border-t border-amber-200 pt-3 first:border-0 first:pt-0"
                            >
                              <p className="font-medium text-slate-950">
                                {booking.user.name}
                              </p>
                              <p className="mt-0.5 text-slate-700">
                                {booking.purpose}
                                {booking.destination
                                  ? ` · ${booking.destination}`
                                  : ""}
                              </p>
                              <p className="mt-1 text-xs leading-5 text-slate-600">
                                {formatDateTime(booking.startDate)} –{" "}
                                {formatDateTime(booking.endDate)}
                                <br />
                                {getBookingStatusText(booking.status)}
                              </p>
                            </li>
                          ))}
                        </ul>
                      </details>
                    )}
                  </td>
                  <td className="whitespace-nowrap px-5 py-4 align-top">
                    <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${getMaintenanceStatusColor(item.status)}`}>
                      {getMaintenanceStatusText(item.status)}
                    </span>
                  </td>
                  <td className="px-5 py-4 align-top">
                    <p className="text-sm font-medium text-slate-900">{item.reporter.name}</p>
                    <p className="text-xs text-slate-500">{item.reporter.email}</p>
                  </td>
                  <td className="whitespace-nowrap px-5 py-4 align-top">
                    {canManageMaintenance && <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => openEditModal(item)}
                        className="rounded-lg p-2 text-blue-600 transition hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        title="แก้ไข"
                        aria-label={`แก้ไขรายการ ${item.description}`}
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(item)}
                        className="rounded-lg p-2 text-rose-600 transition hover:bg-rose-50 focus:outline-none focus:ring-2 focus:ring-rose-500"
                        title="ลบ"
                        aria-label={`ลบรายการ ${item.description}`}
                      >
                        <Trash2 className="h-4 w-4" />
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
