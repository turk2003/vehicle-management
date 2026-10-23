import type { CalendarVehicle } from "@/lib/calendar/types"
import { formatCalendarDate } from "@/lib/calendar/dates"
import { getVehicleStatusColor, getVehicleStatusText } from "@/lib/format"

export default function FleetStatus({ vehicles, loading }: { vehicles: CalendarVehicle[]; loading: boolean }) {
  return (
    <section aria-labelledby="fleet-status-title" aria-busy={loading} className="rounded-lg border border-gray-300 bg-white">
      <div className="border-b border-gray-200 p-4 sm:p-5">
        <h2 id="fleet-status-title" className="text-lg font-semibold text-gray-950">สถานะรถปัจจุบัน</h2>
        <p className="mt-1 text-sm leading-6 text-gray-600">ข้อมูล ณ เวลาอัปเดตล่าสุด แยกจากวันที่เลือกในปฏิทิน ผู้ถือรถอ้างอิงจากการรับรถแล้วและยังไม่คืน</p>
      </div>
      {loading ? (
        <div role="status" className="p-5"><span className="sr-only">กำลังโหลดสถานะรถ</span><div className="h-24 rounded bg-gray-100 motion-safe:animate-pulse" /></div>
      ) : vehicles.length === 0 ? (
        <p className="p-5 text-sm text-gray-600">ยังไม่มีรถในระบบ</p>
      ) : (
        <ul className="divide-y divide-gray-200">
          {vehicles.map((vehicle) => (
            <li key={vehicle.id} className="grid min-w-0 gap-3 p-4 sm:grid-cols-[minmax(0,1fr)_minmax(0,2fr)] sm:gap-6 sm:p-5">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="break-words font-semibold text-gray-950">{vehicle.plateNumber}</h3>
                  <span className={`rounded-full px-2.5 py-1 text-sm font-medium ${getVehicleStatusColor(vehicle.status)}`}>{getVehicleStatusText(vehicle.status)}</span>
                </div>
                <p className="mt-1 break-words text-sm text-gray-600">{vehicle.type.name}</p>
              </div>
              <div className="min-w-0 text-sm">
                {vehicle.holders.length > 1 && <p className="mb-3 rounded-md bg-yellow-50 p-3 font-medium text-yellow-900">พบผู้ถือรถหลายรายการ กรุณาให้ผู้ดูแลระบบตรวจสอบ</p>}
                {vehicle.holders.length === 0 ? (
                  <p className="text-gray-600">ไม่มีผู้ถือรถตามข้อมูลระบบ</p>
                ) : (
                  <ul className="space-y-3">
                    {vehicle.holders.map((holder) => (
                      <li key={holder.bookingId}>
                        <p className="break-words font-medium text-gray-950">ผู้ถือรถ: {holder.name}</p>
                        <p className="mt-1 text-gray-600">รับรถ: {formatCalendarDate(holder.pickedUpAt)}</p>
                        <p className="mt-1 text-gray-600">กำหนดคืน: {formatCalendarDate(holder.dueAt)}</p>
                        {holder.overdue && <span className="mt-2 inline-flex rounded-full bg-red-100 px-2.5 py-1 font-medium text-red-800">เกินกำหนดคืน</span>}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
