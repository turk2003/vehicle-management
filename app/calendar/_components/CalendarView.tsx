"use client"

import Link from "next/link"
import { ArrowLeft, CalendarDays, ChevronLeft, ChevronRight, RefreshCw } from "lucide-react"
import { useEffect, useState } from "react"
import api from "@/lib/api"
import { bangkokDateKey, bookingsForDay, formatCalendarDate, shiftCalendarMonth } from "@/lib/calendar/dates"
import type { CalendarSnapshot } from "@/lib/calendar/types"
import CalendarMonthGrid from "./CalendarMonthGrid"
import DailyBookings from "./DailyBookings"
import FleetStatus from "./FleetStatus"

const buttonClass = "inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 transition-colors duration-150 hover:bg-gray-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"

export default function CalendarView({ today, dashboardHref }: { today: string; dashboardHref: string }) {
  const [selectedDay, setSelectedDay] = useState(today)
  const [data, setData] = useState<CalendarSnapshot | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [refreshKey, setRefreshKey] = useState(0)
  const month = selectedDay.slice(0, 7)

  useEffect(() => {
    let active = true
    const controller = new AbortController()
    async function load() {
      setLoading(true)
      setError(null)
      try {
        const response = await api.get<CalendarSnapshot>("/api/calendar", { params: { month }, signal: controller.signal })
        if (active) setData(response.data)
      } catch {
        if (active) setError("อัปเดตข้อมูลไม่สำเร็จ กรุณาลองใหม่ ข้อมูลที่แสดงยังเป็นข้อมูลจากครั้งล่าสุด")
      } finally {
        if (active) setLoading(false)
      }
    }
    void load()
    return () => {
      active = false
      controller.abort()
    }
  }, [month, refreshKey])

  useEffect(() => {
    const refresh = () => {
      if (document.visibilityState === "visible") setRefreshKey((key) => key + 1)
    }
    const interval = window.setInterval(refresh, 30_000)
    window.addEventListener("focus", refresh)
    document.addEventListener("visibilitychange", refresh)
    return () => {
      window.clearInterval(interval)
      window.removeEventListener("focus", refresh)
      document.removeEventListener("visibilitychange", refresh)
    }
  }, [])

  const monthData = data?.month === month ? data : null
  const monthLoading = !monthData && (loading || !error)
  const bookings = monthData?.bookings ?? []
  const previousMonth = shiftCalendarMonth(month, -1)
  const nextMonth = shiftCalendarMonth(month, 1)
  const currentToday = data ? bangkokDateKey(new Date(data.asOf)) : today

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-7xl space-y-6 px-3 py-6 sm:px-6 sm:py-8 lg:px-8">
        <header>
          <Link href={dashboardHref} className="mb-4 inline-flex min-h-11 items-center gap-2 rounded text-sm font-medium text-blue-700 hover:text-blue-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600">
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />กลับ Dashboard
          </Link>
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h1 className="flex items-center gap-2 text-2xl font-bold text-gray-950"><CalendarDays className="h-6 w-6 shrink-0 text-blue-700" aria-hidden="true" />ปฏิทินการใช้รถ</h1>
              <p className="mt-2 text-sm leading-6 text-gray-600">ดูการจองในแต่ละวันและผู้ที่กำลังถือรถ ทุกบทบาทเห็นข้อมูลเดียวกัน</p>
            </div>
            <button type="button" onClick={() => setRefreshKey((key) => key + 1)} disabled={loading} className={buttonClass}>
              <RefreshCw className={`h-4 w-4 ${loading ? "motion-safe:animate-spin" : ""}`} aria-hidden="true" />{loading ? "กำลังอัปเดต" : "รีเฟรชข้อมูล"}
            </button>
          </div>
          <p role="status" className="mt-3 text-sm text-gray-600">{data ? `อัปเดตล่าสุด ${formatCalendarDate(data.asOf)} · อัปเดตอัตโนมัติทุก 30 วินาที` : error ? "ยังไม่มีข้อมูลที่อัปเดตสำเร็จ" : "กำลังเตรียมข้อมูลปฏิทิน"}</p>
        </header>

        {error && (
          <div role="alert" className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800">
            <p>{data ? error : "ไม่สามารถโหลดข้อมูลปฏิทินได้ กรุณาลองใหม่"}</p>
            <button type="button" className={buttonClass} disabled={loading} onClick={() => setRefreshKey((key) => key + 1)}>ลองใหม่</button>
          </div>
        )}

        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 aria-live="polite" className="text-xl font-semibold text-gray-950">{formatCalendarDate(`${month}-01T00:00:00+07:00`, "month")}</h2>
          <div className="flex items-center gap-2">
            <button type="button" aria-label="เดือนก่อนหน้า" disabled={!previousMonth} onClick={() => previousMonth && setSelectedDay(`${previousMonth}-01`)} className={buttonClass}><ChevronLeft className="h-4 w-4" aria-hidden="true" /></button>
            <button type="button" onClick={() => setSelectedDay(bangkokDateKey(new Date()))} className={buttonClass}>วันนี้</button>
            <button type="button" aria-label="เดือนถัดไป" disabled={!nextMonth} onClick={() => nextMonth && setSelectedDay(`${nextMonth}-01`)} className={buttonClass}><ChevronRight className="h-4 w-4" aria-hidden="true" /></button>
          </div>
        </div>

        <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
          <div className="min-w-0 space-y-3">
            <CalendarMonthGrid month={month} selectedDay={selectedDay} today={currentToday} bookings={bookings} loading={monthLoading} unavailable={!monthData && Boolean(error)} onSelect={setSelectedDay} />
            <p className="text-sm leading-6 text-gray-600">เลือกวันที่เพื่อดูรายการ รวมคำขอรออนุมัติถึงรายการเสร็จสิ้น โดยซ่อนรายการยกเลิกและปฏิเสธ</p>
          </div>
          <DailyBookings day={selectedDay} bookings={bookingsForDay(bookings, selectedDay)} loading={monthLoading} unavailable={!monthData && Boolean(error)} />
        </div>

        {data ? <FleetStatus vehicles={data.vehicles} loading={false} /> : !error ? <FleetStatus vehicles={[]} loading /> : null}
      </div>
    </main>
  )
}
