import type { CalendarBooking } from "@/lib/calendar/types"
import { formatCalendarDate } from "@/lib/calendar/dates"
import { Badge } from "@/app/component/untitled-ui/badge"
import { BookingBadge } from "./StatusBadge"
import { Calendar, User01 } from "@untitledui/icons"

export default function DailyBookings({ day, bookings, loading, unavailable, selectedBookingId }: {
  day: string
  bookings: CalendarBooking[]
  loading: boolean
  unavailable: boolean
  selectedBookingId: string | null
}) {
  return (
    <section aria-labelledby="daily-bookings-title" aria-busy={loading} className="min-w-0 overflow-hidden rounded-xl border border-gray-200 bg-white xl:max-h-[48rem] xl:overflow-y-auto">
      <div className="border-b border-gray-200 bg-white p-4 sm:p-5 xl:sticky xl:top-0 xl:z-10">
        <div className="flex flex-wrap items-center gap-2"><h2 id="daily-bookings-title" className="text-lg font-semibold text-gray-950">รายการจองรายวัน</h2>{!loading && !unavailable && <Badge>{bookings.length}</Badge>}</div>
        <p className="mt-1 text-sm text-gray-600">{formatCalendarDate(`${day}T00:00:00+07:00`, "date")}</p>
        {!loading && !unavailable && <p role="status" className="sr-only">{bookings.length} รายการ</p>}
      </div>
      {loading ? (
        <div role="status" className="space-y-4 p-5">
          <span className="sr-only">กำลังโหลดรายการจอง</span>
          {[1, 2, 3].map((index) => <div key={index} className="h-20 rounded bg-gray-100 motion-safe:animate-pulse" />)}
        </div>
      ) : unavailable ? (
        <p className="p-5 text-sm text-gray-700">ยังไม่สามารถแสดงรายการของช่วงนี้ได้ กรุณาลองใหม่</p>
      ) : bookings.length === 0 ? (
        <div className="px-5 py-10 text-center"><Calendar className="mx-auto mb-3 size-8 text-gray-500" aria-hidden="true" /><p className="text-sm leading-6 text-gray-600">ไม่มีการจองในวันนี้ เลือกวันอื่นเพื่อดูตารางการใช้รถ</p></div>
      ) : (
        <ul className="divide-y divide-gray-200">
          {bookings.map((booking) => (
            <li key={booking.id} data-booking-id={booking.id} data-selected={booking.id === selectedBookingId} className={`p-4 sm:p-5 ${booking.id === selectedBookingId ? "bg-blue-50/60 ring-2 ring-inset ring-blue-600" : ""}`}>
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div className="min-w-0">
                  <h3 className="break-words font-semibold text-gray-950">{booking.vehicle.plateNumber}</h3>
                  <p className="mt-1 break-words text-sm text-gray-600">{booking.vehicle.type.name}</p>
                </div>
                <BookingBadge status={booking.status} />
              </div>
              <dl className="mt-3 space-y-2 text-sm">
                <div><dt className="flex items-center gap-1.5 text-gray-600"><User01 className="size-4" aria-hidden="true" />ผู้จอง</dt><dd className="mt-1 break-words font-medium text-gray-950">{booking.user.name}</dd></div>
                <div><dt className="text-gray-600">เริ่มใช้รถ</dt><dd className="mt-1 text-gray-950">{formatCalendarDate(booking.startDate)}</dd></div>
                <div><dt className="text-gray-600">สิ้นสุดการจอง</dt><dd className="mt-1 text-gray-950">{formatCalendarDate(booking.endDate)}</dd></div>
              </dl>
              <details open={booking.id === selectedBookingId ? true : undefined} className="mt-4 text-sm">
                <summary className="w-fit cursor-pointer rounded font-medium text-blue-700 outline-none hover:text-blue-800 focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2">รายละเอียดการเดินทาง</summary>
                <dl className="mt-3 space-y-3 rounded-md bg-gray-50 p-3">
                  <div><dt className="text-gray-600">วัตถุประสงค์</dt><dd className="mt-1 whitespace-pre-wrap break-words text-gray-950">{booking.purpose}</dd></div>
                  <div><dt className="text-gray-600">ปลายทาง</dt><dd className="mt-1 whitespace-pre-wrap break-words text-gray-950">{booking.destination || "ไม่ระบุ"}</dd></div>
                </dl>
              </details>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
