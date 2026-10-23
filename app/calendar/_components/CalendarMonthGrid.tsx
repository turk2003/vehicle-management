import { bookingsForDay, formatCalendarDate, monthDays } from "@/lib/calendar/dates"
import { getBookingStatusColor, getBookingStatusText } from "@/lib/format"
import type { CalendarBooking } from "@/lib/calendar/types"

interface Props {
  month: string
  selectedDay: string
  today: string
  bookings: CalendarBooking[]
  loading: boolean
  unavailable: boolean
  onSelect: (day: string) => void
}

const weekdays = ["จันทร์", "อังคาร", "พุธ", "พฤหัสบดี", "ศุกร์", "เสาร์", "อาทิตย์"]

export default function CalendarMonthGrid({ month, selectedDay, today, bookings, loading, unavailable, onSelect }: Props) {
  return (
    <section aria-label="ปฏิทินรายเดือน" aria-busy={loading} className="overflow-hidden rounded-lg border border-gray-300 bg-white">
      <div className="grid grid-cols-7 border-b border-gray-200 bg-gray-50">
        {weekdays.map((day) => (
          <div key={day} className="py-3 text-center text-sm font-medium text-gray-700">
            <span className="sm:hidden" aria-hidden="true">{day === "พฤหัสบดี" ? "พฤ" : day === "อาทิตย์" ? "อา" : day.slice(0, 1)}</span>
            <span className="sr-only sm:not-sr-only">{day}</span>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-px bg-gray-200">
        {monthDays(month).map((day, index) => {
          if (!day) return <div key={`empty-${index}`} aria-hidden="true" className="min-h-24 bg-gray-50 sm:min-h-36" />
          const items = bookingsForDay(bookings, day)
          const selected = day === selectedDay
          const isToday = day === today
          return (
            <button
              key={day}
              type="button"
              data-date={day}
              onClick={() => onSelect(day)}
              aria-pressed={selected}
              aria-current={isToday ? "date" : undefined}
              aria-label={`${formatCalendarDate(`${day}T00:00:00+07:00`, "date")}${isToday ? " วันนี้" : ""}, ${loading ? "กำลังโหลด" : unavailable ? "ยังไม่มีข้อมูล" : `${items.length} รายการ`}`}
              className={`relative flex min-h-24 min-w-0 flex-col gap-2 p-1.5 text-left outline-none transition-colors duration-150 focus-visible:z-10 focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-blue-600 sm:min-h-36 sm:p-2 ${selected ? "bg-blue-50 ring-2 ring-inset ring-blue-600" : "bg-white hover:bg-gray-50"}`}
            >
              <span className={`inline-flex h-7 min-w-7 self-start items-center justify-center rounded-full text-sm font-semibold ${isToday ? "bg-blue-600 text-white" : "text-gray-950"}`}>
                {Number(day.slice(-2))}
              </span>
              {loading ? (
                <span className="h-3 w-full rounded bg-gray-200 motion-safe:animate-pulse" aria-hidden="true" />
              ) : items.length > 0 ? (
                <>
                  <span className="text-sm font-medium text-blue-800">{items.length}<span className="sr-only sm:not-sr-only"> รายการ</span></span>
                  <span className="hidden w-full min-w-0 space-y-1 lg:block" aria-hidden="true">
                    {items.slice(0, 2).map((booking) => (
                      <span key={booking.id} className={`block rounded px-1.5 py-1 text-sm ${getBookingStatusColor(booking.status)}`}>
                        <span className="block truncate font-medium" title={booking.vehicle.plateNumber}>{booking.vehicle.plateNumber}</span>
                        <span className="block break-words">{getBookingStatusText(booking.status)}</span>
                      </span>
                    ))}
                    {items.length > 2 && <span className="block text-sm font-medium text-blue-800">ดูเพิ่มเติม +{items.length - 2}</span>}
                  </span>
                </>
              ) : null}
            </button>
          )
        })}
      </div>
    </section>
  )
}
