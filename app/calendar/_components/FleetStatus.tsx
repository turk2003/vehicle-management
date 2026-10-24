import type { CalendarVehicle } from "@/lib/calendar/types"
import { formatCalendarDate } from "@/lib/calendar/dates"
import { Badge } from "@/app/component/untitled-ui/badge"
import { VehicleBadge } from "./StatusBadge"

const columns = "md:grid-cols-[minmax(150px,1fr)_140px_minmax(0,1.5fr)_minmax(0,1.2fr)]"

export default function FleetStatus({ vehicles, loading }: { vehicles: CalendarVehicle[]; loading: boolean }) {
  return (
    <section aria-labelledby="fleet-status-title" aria-busy={loading} className="overflow-hidden rounded-xl border border-gray-200 bg-white">
      <div className="border-b border-gray-200 p-4 sm:p-5">
        <div className="flex flex-wrap items-center gap-2"><h2 id="fleet-status-title" className="text-lg font-semibold text-gray-950">สถานะรถปัจจุบัน</h2>{!loading && <Badge>{vehicles.length} คัน</Badge>}</div>
        <p className="mt-1 text-sm leading-6 text-gray-600">ข้อมูล ณ เวลาอัปเดตล่าสุด แยกจากวันที่เลือก ผู้ถือรถอ้างอิงจากการรับรถแล้วและยังไม่คืน</p>
      </div>
      {loading ? (
        <div role="status" className="p-5"><span className="sr-only">กำลังโหลดสถานะรถ</span><div className="h-24 rounded-lg bg-gray-100 motion-safe:animate-pulse" /></div>
      ) : vehicles.length === 0 ? <p className="p-5 text-sm text-gray-600">ยังไม่มีรถในระบบ</p> : (
        <>
          <div aria-hidden="true" className={`hidden gap-4 border-b border-gray-200 bg-gray-50 px-5 py-3 text-sm font-medium text-gray-600 md:grid ${columns}`}><span>รถ / ประเภท</span><span>สถานะ</span><span>ผู้ถือรถ</span><span>กำหนดคืน</span></div>
          <ul className="divide-y divide-gray-200">
            {vehicles.map((vehicle) => (
              <li key={vehicle.id} className={`grid min-w-0 gap-4 p-4 hover:bg-gray-50/60 sm:p-5 ${columns}`}>
                <div className="min-w-0"><h3 className="break-words font-semibold text-gray-950">{vehicle.plateNumber}</h3><p className="mt-1 break-words text-sm text-gray-600">{vehicle.type.name}</p></div>
                <div><VehicleBadge status={vehicle.status} /></div>
                <div className="min-w-0 space-y-3 text-sm">
                  {vehicle.holders.length > 1 && <p className="rounded-md bg-yellow-50 p-3 font-medium text-yellow-900">พบผู้ถือรถหลายรายการ กรุณาให้ผู้ดูแลระบบตรวจสอบ</p>}
                  {vehicle.holders.length === 0 ? <p className="text-gray-600">ไม่มีผู้ถือรถตามข้อมูลระบบ</p> : vehicle.holders.map((holder) => (
                    <div key={holder.bookingId}><p className="break-words font-medium text-gray-950"><span className="md:sr-only">ผู้ถือรถ: </span>{holder.name}</p><p className="mt-1 text-gray-600">รับรถ: {formatCalendarDate(holder.pickedUpAt)}</p></div>
                  ))}
                </div>
                <div className="min-w-0 space-y-3 text-sm">
                  {vehicle.holders.length === 0 ? <span className="text-gray-500" aria-label="ไม่มีกำหนดคืน">—</span> : vehicle.holders.map((holder) => (
                    <div key={holder.bookingId}>
                      {vehicle.holders.length > 1 && <p className="mb-1 break-words font-medium text-gray-700">{holder.name}</p>}
                      <p className="text-gray-700"><span className="md:sr-only">กำหนดคืน: </span>{formatCalendarDate(holder.dueAt)}</p>
                      {holder.overdue && <Badge color="error" className="mt-2">เกินกำหนดคืน</Badge>}
                    </div>
                  ))}
                </div>
              </li>
            ))}
          </ul>
        </>
      )}
    </section>
  )
}
