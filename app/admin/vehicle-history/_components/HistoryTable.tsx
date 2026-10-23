import { Car } from "lucide-react"
import { formatDateTime, getVehicleStatusColor, getVehicleStatusText } from "@/lib/format"
import type { VehicleHistoryItem } from "../types"

type HistoryTableProps = {
  hasFilters: boolean
  items: VehicleHistoryItem[]
  loading: boolean
}

export default function HistoryTable({
  hasFilters,
  items,
  loading,
}: HistoryTableProps) {
  return (
    <section className="overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-slate-200">
      <div className="flex flex-col gap-1 border-b border-slate-200 px-5 py-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-base font-semibold text-slate-950">ตารางประวัติรถ</h2>
          <p className="text-sm text-slate-500">แสดงข้อมูลรวมตามรถ {hasFilters ? "จากตัวกรองที่เลือก" : "ทุกคัน"}</p>
        </div>
        <p className="text-sm text-slate-500">{items.length.toLocaleString()} รายการ</p>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-[960px] w-full divide-y divide-slate-200">
          <thead className="bg-slate-50">
            <tr>
              {["รถ", "สถานะปัจจุบัน", "จำนวนใช้งาน", "ระยะทางรวม", "ผู้ใช้งานไม่ซ้ำ", "จำนวนซ่อม", "ใช้งานล่าสุด"].map((heading) => (
                <th key={heading} className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  {heading}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white">
            {loading ? (
              <tr>
                <td colSpan={7} className="px-5 py-12 text-center text-sm text-slate-500">
                  กำลังโหลดประวัติรถ...
                </td>
              </tr>
            ) : items.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-5 py-12 text-center">
                  <div className="mx-auto max-w-md">
                    <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-500">
                      <Car className="h-5 w-5" />
                    </div>
                    <p className="mt-3 text-sm font-semibold text-slate-900">ไม่พบข้อมูลประวัติรถ</p>
                    <p className="mt-1 text-sm text-slate-500">
                      ลองเปลี่ยนช่วงวันที่หรือเลือกรถคันอื่นเพื่อดูข้อมูลการใช้งาน
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              items.map((item) => (
                <tr key={item.vehicleId} className="transition hover:bg-slate-50">
                  <td className="whitespace-nowrap px-5 py-4">
                    <p className="text-sm font-semibold text-slate-950">{item.plateNumber}</p>
                    <p className="text-sm text-slate-500">{item.vehicleType}</p>
                    <p className="mt-1 text-xs text-slate-500">
                      ไมล์ปัจจุบัน: {item.currentMileage.toLocaleString()} กม.
                    </p>
                  </td>
                  <td className="whitespace-nowrap px-5 py-4">
                    <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${getVehicleStatusColor(item.currentStatus)}`}>
                      {getVehicleStatusText(item.currentStatus)}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-5 py-4 text-sm font-medium text-slate-900">
                    {item.usageCount.toLocaleString()} ครั้ง
                  </td>
                  <td className="whitespace-nowrap px-5 py-4 text-sm text-slate-900">
                    <p className="font-medium">{item.totalDistanceKm.toLocaleString()} กม.</p>
                    <p className="text-xs text-slate-500">
                      เฉลี่ย {item.avgDistancePerTripKm.toLocaleString()} กม./เที่ยว
                    </p>
                  </td>
                  <td className="whitespace-nowrap px-5 py-4 text-sm text-slate-900">
                    {item.uniqueUsersCount.toLocaleString()} คน
                  </td>
                  <td className="whitespace-nowrap px-5 py-4 text-sm text-slate-900">
                    {item.maintenanceCount.toLocaleString()} ครั้ง
                  </td>
                  <td className="whitespace-nowrap px-5 py-4 text-sm text-slate-700">
                    {item.lastUsedAt ? formatDateTime(item.lastUsedAt) : <span className="text-slate-400">ยังไม่มีข้อมูล</span>}
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
