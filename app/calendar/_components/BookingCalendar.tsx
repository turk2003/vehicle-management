"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import FullCalendar, { type CalendarRef, type DatesSetInfo, type EventInput } from "@fullcalendar/react"
import dayGridPlugin from "@fullcalendar/react/daygrid"
import timeGridPlugin from "@fullcalendar/react/timegrid"
import interactionPlugin from "@fullcalendar/react/interaction"
import monarchTheme from "@fullcalendar/react/themes/monarch"
import thaiLocale from "@fullcalendar/react/locales/th"
import { ChevronLeft, ChevronRight } from "@untitledui/icons"
import { Button } from "@/app/component/untitled-ui/button"
import { bangkokDateKey, bookingsForDay, formatCalendarDate } from "@/lib/calendar/dates"
import { getBookingStatusText } from "@/lib/format"
import type { CalendarBooking, CalendarRange } from "@/lib/calendar/types"
import type { CalendarBookingSelection } from "@/lib/calendar/booking"

const plugins = [monarchTheme, dayGridPlugin, timeGridPlugin, interactionPlugin]
const views = [
  { id: "dayGridMonth", label: "เดือน" },
  { id: "timeGridWeek", label: "สัปดาห์" },
  { id: "timeGridDay", label: "วัน" },
] as const
const eventColors = {
  PENDING: { color: "#fef9c3", contrastColor: "#713f12" },
  APPROVED: { color: "#dcfce7", contrastColor: "#166534" },
  CHANGED: { color: "#dbeafe", contrastColor: "#1e40af" },
  IN_PROGRESS: { color: "#e0e7ff", contrastColor: "#3730a3" },
  COMPLETED: { color: "#ccfbf1", contrastColor: "#115e59" },
}

interface Props {
  today: string
  selectedDay: string
  bookings: CalendarBooking[]
  loading: boolean
  unavailable: boolean
  onRangeChange: (range: CalendarRange, anchorDay: string, anchorEnd: string) => void
  onSelectDay: (day: string) => void
  onSelectBooking: (id: string, day: string) => void
  canCreateBooking: boolean
  onRequestBooking: (selection: CalendarBookingSelection, trigger: HTMLElement | null) => void
  navigateTo: { day: string; request: number } | null
}

export default function BookingCalendar({ today, selectedDay, bookings, loading, unavailable, onRangeChange, onSelectDay, onSelectBooking, canCreateBooking, onRequestBooking, navigateTo }: Props) {
  const calendar = useRef<CalendarRef>(null)
  const [view, setView] = useState("dayGridMonth")
  const [title, setTitle] = useState(formatCalendarDate(`${today}T00:00:00+07:00`, "month"))
  useEffect(() => {
    if (navigateTo) calendar.current?.getApi().gotoDate(navigateTo.day)
  }, [navigateTo])
  const events: EventInput[] = useMemo(() => bookings.map((booking) => ({
    id: booking.id,
    title: `${booking.vehicle.plateNumber} · ${getBookingStatusText(booking.status)} · ${booking.user.name}`,
    start: booking.startDate,
    end: booking.endDate,
    ...eventColors[booking.status],
    extendedProps: { booking },
  })), [bookings])
  const datesSet = useCallback((info: DatesSetInfo) => {
    setView(info.view.type)
    const start = bangkokDateKey(info.view.currentStart)
    const end = bangkokDateKey(new Date(info.view.currentEnd.getTime() - 1))
    setTitle(info.view.type === "dayGridMonth"
      ? formatCalendarDate(info.view.currentStart.toISOString(), "month")
      : info.view.type === "timeGridDay"
        ? formatCalendarDate(info.view.currentStart.toISOString(), "date")
        : `${formatCalendarDate(info.view.currentStart.toISOString(), "date")} – ${formatCalendarDate(`${end}T00:00:00+07:00`, "date")}`)
    onRangeChange({ start: info.startStr.slice(0, 10), end: info.endStr.slice(0, 10) }, start, bangkokDateKey(info.view.currentEnd))
  }, [onRangeChange])
  const periodLabel = view === "dayGridMonth" ? "เดือน" : view === "timeGridWeek" ? "สัปดาห์" : "วัน"

  return (
    <section aria-label="ตารางการจองรถ" className="min-w-0 overflow-hidden rounded-xl border border-gray-200 bg-white">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-gray-200 p-4 sm:px-5">
        <div className="min-w-0">
          <h2 aria-live="polite" className="text-lg font-semibold text-gray-950">{title}</h2>
          <p className="mt-1 text-sm text-gray-600">เวลาไทย (UTC+7) · {canCreateBooking ? "เลือกวันเพื่อจองรถ หรือเลือกรายการเพื่อดูรายละเอียด" : "เลือกรายการเพื่อดูรายละเอียด"}</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1">
            <Button aria-label={`${periodLabel}ก่อนหน้า`} iconLeading={<ChevronLeft className="size-4" aria-hidden="true" />} onPress={() => calendar.current?.getApi().prev()} className="px-3" />
            <Button onPress={() => { calendar.current?.getApi().gotoDate(bangkokDateKey(new Date())); onSelectDay(bangkokDateKey(new Date())) }}>วันนี้</Button>
            <Button aria-label={`${periodLabel}ถัดไป`} iconLeading={<ChevronRight className="size-4" aria-hidden="true" />} onPress={() => calendar.current?.getApi().next()} className="px-3" />
          </div>
          <div role="group" aria-label="มุมมองปฏิทิน" className="inline-flex rounded-lg bg-gray-50 p-1 ring-1 ring-inset ring-gray-200">
            {views.map((item) => <Button key={item.id} size="sm" color="tertiary" aria-pressed={view === item.id} onPress={() => calendar.current?.getApi().changeView(item.id, selectedDay)} className={view === item.id ? "bg-white text-gray-950 ring-gray-300 hover:bg-white" : ""}>{item.label}</Button>)}
          </div>
        </div>
      </div>
      {view === "timeGridWeek" && <p className="border-b border-gray-200 px-4 py-2 text-sm text-gray-600 sm:hidden">เลื่อนตารางซ้าย–ขวาเพื่อดูครบทุกวัน</p>}
      <div aria-busy={loading} className="relative">
        {loading && <div role="status" className="absolute inset-x-0 top-0 z-20 h-1 bg-blue-100"><span className="sr-only">กำลังโหลดตารางการจอง</span><span className="block h-full w-1/3 bg-blue-600 motion-safe:animate-pulse" /></div>}
        <div className="calendar-schedule overflow-x-auto">
          <FullCalendar
            ref={calendar}
            plugins={plugins}
            locale={thaiLocale}
            timeZone="Asia/Bangkok"
            initialDate={today}
            initialView="dayGridMonth"
            className={view === "timeGridWeek" ? "calendar-week-grid" : ""}
            headerToolbar={false}
            firstDay={1}
            dayHeaderFormat={view === "dayGridMonth" ? { weekday: "short" } : { weekday: "short", day: "numeric", month: "short" }}
            dayHeaderInnerClass="calendar-day-heading"
            dayCellTopInnerClass="calendar-day-link"
            fixedWeekCount={false}
            height={640}
            dayMaxEvents={2}
            nowIndicator
            editable={false}
            selectable={false}
            eventInteractive
            eventDisplay="block"
            eventTimeFormat={{ hour: "2-digit", minute: "2-digit", hour12: false }}
            slotHeaderFormat={{ hour: "2-digit", minute: "2-digit", hour12: false }}
            scrollTime="07:00:00"
            allDaySlot={false}
            events={events}
            datesSet={datesSet}
            navLinks
            navLinkDayClick={(date, event) => {
              const target = event.target as HTMLElement
              onRequestBooking({ day: bangkokDateKey(date) }, target.closest<HTMLElement>("a, button, [tabindex]") ?? target)
            }}
            dateClick={(info) => {
              const trigger = info.dayEl.querySelector<HTMLElement>("a, button, [tabindex]") ?? info.dayEl
              if (!trigger.hasAttribute("tabindex") && trigger.tabIndex < 0) trigger.tabIndex = -1
              onRequestBooking({ day: info.dateStr.slice(0, 10), time: info.allDay ? undefined : info.dateStr.slice(11, 16) }, trigger)
            }}
            dayCellClass={(info) => bangkokDateKey(info.date) === selectedDay ? "calendar-selected-day" : ""}
            dayCellTopContent={(info) => {
              const day = bangkokDateKey(info.date)
              const count = bookingsForDay(bookings, day).length
              return <span className="flex items-center gap-1.5"><span className={`inline-flex size-7 items-center justify-center rounded-full text-sm font-semibold ${info.isToday ? "bg-blue-600 text-white" : ""}`}>{Number(day.slice(-2))}</span>{!loading && !unavailable && count > 0 && <span className="text-sm font-medium text-blue-800">{count}<span className="sr-only"> รายการ</span></span>}</span>
            }}
            eventClick={(info) => {
              const clickedDay = (info.jsEvent.target as HTMLElement).closest("[data-date]")?.getAttribute("data-date")
              const booking = info.event.extendedProps.booking as CalendarBooking
              const visibleStart = bangkokDateKey(info.view.activeStart)
              const visibleEnd = bangkokDateKey(info.view.activeEnd)
              const bookingStart = bangkokDateKey(info.event.start!)
              const keepSelected = selectedDay >= visibleStart && selectedDay < visibleEnd && bookingsForDay([booking], selectedDay).length > 0
              const day = clickedDay ?? (keepSelected ? selectedDay : bookingStart < visibleStart ? visibleStart : bookingStart)
              onSelectBooking(info.event.id, day)
            }}
            eventContent={(info) => <span data-booking-event={info.event.id} className="block min-w-0 px-1 py-0.5 text-sm leading-5"><span className="block truncate font-semibold">{info.event.extendedProps.booking.vehicle.plateNumber}</span><span className="block truncate">{getBookingStatusText(info.event.extendedProps.booking.status)}</span>{view !== "dayGridMonth" && <span className="block truncate">{info.timeText}</span>}</span>}
            moreLinkContent={(info) => `ดูเพิ่มเติม +${info.num}`}
            moreLinkClick={(info) => { onSelectDay(bangkokDateKey(info.date)); return "popover" }}
          />
        </div>
      </div>
    </section>
  )
}
