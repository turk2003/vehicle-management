"use client"

import { useCallback, useEffect, useState } from "react"
import { CalendarDays, CheckCircle2, Eye, X, XCircle } from "lucide-react"
import api from "@/lib/api"
import {
  formatDateTime,
  getBookingStatusColor,
  getBookingStatusText,
} from "@/lib/format"

type Booking = {
  id: string
  startDate: string
  endDate: string
  purpose: string
  destination?: string
  status: string
  createdAt: string
  updatedAt: string
  user: {
    id: string
    name: string
    email: string
    role: string
  }
  vehicle: {
    id: string
    plateNumber: string
    type: {
      id: string
      name: string
    }
  }
  approver?: {
    id: string
    name: string
    email: string
  }
}

type BookingStats = {
  total: number
  approved: number
  rejected: number
}

type DateFilter = {
  startDate: string
  endDate: string
}

const INITIAL_DATE_FILTER: DateFilter = {
  startDate: "",
  endDate: "",
}

const INITIAL_STATS: BookingStats = {
  total: 0,
  approved: 0,
  rejected: 0,
}

const STATUS_FILTERS = [
  { value: "ALL", label: "ทั้งหมด", icon: CalendarDays },
  { value: "APPROVED", label: "อนุมัติแล้ว", icon: CheckCircle2 },
  { value: "REJECTED", label: "ปฏิเสธ", icon: XCircle },
]

function buildStats(bookings: Booking[]): BookingStats {
  return bookings.reduce<BookingStats>((acc, booking) => {
    acc.total += 1
    if (booking.status === "APPROVED" || booking.status === "CHANGED") acc.approved += 1
    if (booking.status === "REJECTED") acc.rejected += 1
    return acc
  }, { ...INITIAL_STATS })
}

function filterByDate(bookings: Booking[], dateFilter: DateFilter) {
  if (!dateFilter.startDate && !dateFilter.endDate) return bookings

  const start = dateFilter.startDate
    ? new Date(`${dateFilter.startDate}T00:00:00`)
    : null
  const end = dateFilter.endDate
    ? new Date(`${dateFilter.endDate}T23:59:59`)
    : null

  return bookings.filter((booking) => {
    const updated = new Date(booking.updatedAt)
    if (start && updated < start) return false
    if (end && updated > end) return false
    return true
  })
}

export default function ApprovalHistoryPage() {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [selectedStatus, setSelectedStatus] = useState("ALL")
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null)
  const [dateFilter, setDateFilter] =
    useState<DateFilter>(INITIAL_DATE_FILTER)
  const [stats, setStats] = useState<BookingStats>(INITIAL_STATS)

  const fetchHistory = useCallback(async () => {
    try {
      setLoading(true)
      setError("")

      const response = await api.get<Booking[]>("/api/approver?status=ALL")
      const decidedBookings = response.data.filter(
        (booking) =>
          booking.status === "APPROVED" ||
          booking.status === "CHANGED" ||
          booking.status === "REJECTED",
      )
      const dateFilteredBookings = filterByDate(decidedBookings, dateFilter)
      const statusFilteredBookings =
        selectedStatus === "ALL"
          ? dateFilteredBookings
          : dateFilteredBookings.filter(
              (booking) => booking.status === selectedStatus,
            )

      setStats(buildStats(dateFilteredBookings))
      setBookings(statusFilteredBookings)
    } catch {
      setError("ไม่สามารถโหลดข้อมูลประวัติการอนุมัติได้")
    } finally {
      setLoading(false)
    }
  }, [dateFilter, selectedStatus])

  const viewDetails = (booking: Booking) => {
    setSelectedBooking(booking)
    setShowDetailModal(true)
  }

  const closeDetailModal = () => {
    setShowDetailModal(false)
    setSelectedBooking(null)
  }

  const approvalRate =
    stats.total > 0 ? Math.round((stats.approved / stats.total) * 100) : 0

  const statItems = [
    {
      label: "ทั้งหมด",
      value: stats.total,
      status: "ALL",
      color: "text-gray-950",
      icon: CalendarDays,
    },
    {
      label: "อนุมัติแล้ว",
      value: stats.approved,
      status: "APPROVED",
      color: "text-green-700",
      icon: CheckCircle2,
    },
    {
      label: "ปฏิเสธแล้ว",
      value: stats.rejected,
      status: "REJECTED",
      color: "text-red-700",
      icon: XCircle,
    },
    {
      label: "อัตราอนุมัติ",
      value: `${approvalRate}%`,
      status: null,
      color: "text-blue-700",
      icon: CheckCircle2,
    },
  ]

  useEffect(() => {
    fetchHistory()
  }, [fetchHistory])

  useEffect(() => {
    if (!showDetailModal) return

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeDetailModal()
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [showDetailModal])

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <header className="mb-6 rounded-xl bg-white p-6 shadow-sm ring-1 ring-gray-200">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="mb-2 text-sm font-medium text-blue-700">
                ผู้อนุมัติ
              </p>
              <h1 className="text-2xl font-bold leading-tight text-gray-950">
                ประวัติการอนุมัติ
              </h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-600">
                ตรวจสอบผลการพิจารณาคำขอจองรถย้อนหลังตามสถานะและช่วงวันที่
              </p>
            </div>

            <div
              className="flex flex-wrap gap-2"
              role="tablist"
              aria-label="กรองสถานะประวัติการอนุมัติ"
            >
              {STATUS_FILTERS.map(({ value, label, icon: Icon }) => (
                <button
                  key={value}
                  type="button"
                  role="tab"
                  aria-selected={selectedStatus === value}
                  onClick={() => setSelectedStatus(value)}
                  className={`inline-flex min-h-11 items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-blue-600/25 ${
                    selectedStatus === value
                      ? "bg-blue-600 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  <Icon className="h-4 w-4" aria-hidden="true" />
                  {label}
                </button>
              ))}
            </div>
          </div>
        </header>

        {error && (
          <div
            role="alert"
            aria-live="polite"
            className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"
          >
            {error}
          </div>
        )}

        <section className="mb-6 grid grid-cols-2 gap-3 md:grid-cols-4">
          {statItems.map((item) => {
            const Icon = item.icon
            const selected = item.status === selectedStatus
            const clickable = item.status !== null

            return (
              <button
                key={item.label}
                type="button"
                onClick={() => {
                  if (item.status) setSelectedStatus(item.status)
                }}
                disabled={!clickable}
                className={`rounded-xl bg-white p-4 text-left shadow-sm ring-1 ring-gray-200 transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-blue-600/25 ${
                  selected ? "ring-2 ring-blue-600" : ""
                } ${
                  clickable
                    ? "hover:bg-gray-50"
                    : "cursor-default disabled:opacity-100"
                }`}
              >
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-medium text-gray-600">
                    {item.label}
                  </p>
                  <Icon className="h-4 w-4 text-gray-500" aria-hidden="true" />
                </div>
                <p className={`mt-2 text-2xl font-bold ${item.color}`}>
                  {item.value}
                </p>
              </button>
            )
          })}
        </section>

        <section
          className="mb-6 rounded-xl bg-white p-6 shadow-sm ring-1 ring-gray-200"
          aria-labelledby="history-filter-title"
        >
          <div className="mb-4 flex items-center gap-2">
            <CalendarDays className="h-5 w-5 text-blue-700" aria-hidden="true" />
            <h2
              id="history-filter-title"
              className="text-lg font-semibold text-gray-950"
            >
              กรองตามวันที่
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div>
              <label
                htmlFor="history-start-date"
                className="mb-1.5 block text-sm font-medium text-gray-700"
              >
                วันที่เริ่มต้น
              </label>
              <input
                id="history-start-date"
                type="date"
                value={dateFilter.startDate}
                onChange={(e) =>
                  setDateFilter((current) => ({
                    ...current,
                    startDate: e.target.value,
                  }))
                }
                className="min-h-11 w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-gray-950 transition-colors duration-150 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600/25"
              />
            </div>
            <div>
              <label
                htmlFor="history-end-date"
                className="mb-1.5 block text-sm font-medium text-gray-700"
              >
                วันที่สิ้นสุด
              </label>
              <input
                id="history-end-date"
                type="date"
                value={dateFilter.endDate}
                onChange={(e) =>
                  setDateFilter((current) => ({
                    ...current,
                    endDate: e.target.value,
                  }))
                }
                className="min-h-11 w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-gray-950 transition-colors duration-150 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600/25"
              />
            </div>
            <div className="flex items-end">
              <button
                type="button"
                onClick={() => setDateFilter(INITIAL_DATE_FILTER)}
                className="inline-flex min-h-11 w-full items-center justify-center rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 transition-colors duration-150 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-600/25"
              >
                ล้างตัวกรอง
              </button>
            </div>
          </div>
        </section>

        <section
          className="overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-gray-200"
          aria-labelledby="history-table-title"
        >
          <div className="border-b border-gray-200 px-6 py-4">
            <h2
              id="history-table-title"
              className="text-lg font-semibold text-gray-950"
            >
              รายการประวัติ
            </h2>
            <p className="mt-1 text-sm text-gray-600">
              ทั้งหมด {bookings.length} รายการ
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[1040px]">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-600">
                    วันที่พิจารณา
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-600">
                    ผู้ขอจอง
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-600">
                    รถ
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-600">
                    รายละเอียด
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-600">
                    สถานะ
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-600">
                    การดำเนินการ
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-10 text-center">
                      <div className="mx-auto h-5 w-48 animate-pulse rounded bg-gray-200" />
                    </td>
                  </tr>
                ) : bookings.length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-6 py-12 text-center text-sm text-gray-600"
                    >
                      ไม่พบประวัติการอนุมัติในเงื่อนไขนี้
                    </td>
                  </tr>
                ) : (
                  bookings.map((booking) => (
                    <tr
                      key={booking.id}
                      className="transition-colors duration-150 hover:bg-gray-50"
                    >
                      <td className="px-6 py-4 text-sm text-gray-700">
                        {formatDateTime(booking.updatedAt)}
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-950">
                          {booking.user.name}
                        </div>
                        <div className="text-sm text-gray-600">
                          {booking.user.email}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-950">
                          {booking.vehicle.plateNumber}
                        </div>
                        <div className="text-sm text-gray-600">
                          {booking.vehicle.type.name}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div
                          className="max-w-xs truncate text-sm font-medium text-gray-950"
                          title={booking.purpose}
                        >
                          {booking.purpose}
                        </div>
                        {booking.destination && (
                          <div
                            className="mt-1 max-w-xs truncate text-sm text-gray-600"
                            title={booking.destination}
                          >
                            ปลายทาง: {booking.destination}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${getBookingStatusColor(booking.status)}`}
                        >
                          {getBookingStatusText(booking.status)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex justify-end">
                          <button
                            type="button"
                            onClick={() => viewDetails(booking)}
                            className="inline-flex min-h-10 items-center gap-1.5 rounded-lg bg-blue-50 px-3.5 py-2 text-sm font-medium text-blue-700 transition-colors duration-150 hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-600/25"
                          >
                            <Eye className="h-4 w-4" aria-hidden="true" />
                            ดูรายละเอียด
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>

        {showDetailModal && selectedBooking && (
          <div
            className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-gray-900/50 px-4 py-8"
            role="dialog"
            aria-modal="true"
            aria-labelledby="history-modal-title"
          >
            <div className="w-full max-w-2xl rounded-xl bg-white shadow-lg ring-1 ring-gray-200">
              <div className="flex items-start justify-between gap-4 border-b border-gray-200 px-6 py-5">
                <div>
                  <h3
                    id="history-modal-title"
                    className="text-lg font-semibold text-gray-950"
                  >
                    รายละเอียดการอนุมัติ
                  </h3>
                  <p className="mt-1 text-sm text-gray-600">
                    ข้อมูลคำขอจองและผลการพิจารณา
                  </p>
                </div>
                <button
                  type="button"
                  onClick={closeDetailModal}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-md text-gray-500 transition-colors duration-150 hover:bg-gray-100 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-600/25"
                  aria-label="ปิดหน้าต่าง"
                >
                  <X className="h-5 w-5" aria-hidden="true" />
                </button>
              </div>

              <div className="space-y-5 px-6 py-6">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="rounded-lg bg-gray-50 p-4 ring-1 ring-gray-200">
                    <p className="text-sm font-medium text-gray-600">สถานะ</p>
                    <span
                      className={`mt-2 inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${getBookingStatusColor(selectedBooking.status)}`}
                    >
                      {getBookingStatusText(selectedBooking.status)}
                    </span>
                  </div>
                  <div className="rounded-lg bg-gray-50 p-4 ring-1 ring-gray-200">
                    <p className="text-sm font-medium text-gray-600">
                      วันที่พิจารณา
                    </p>
                    <p className="mt-2 text-sm text-gray-950">
                      {formatDateTime(selectedBooking.updatedAt)}
                    </p>
                  </div>
                </div>

                <div className="rounded-lg bg-gray-50 p-4 ring-1 ring-gray-200">
                  <dl className="grid gap-4 text-sm sm:grid-cols-2">
                    <div>
                      <dt className="font-medium text-gray-600">ผู้ขอจอง</dt>
                      <dd className="mt-1 text-gray-950">
                        {selectedBooking.user.name}
                      </dd>
                      <dd className="mt-1 text-gray-600">
                        {selectedBooking.user.email}
                      </dd>
                    </div>
                    <div>
                      <dt className="font-medium text-gray-600">ผู้พิจารณา</dt>
                      <dd className="mt-1 text-gray-950">
                        {selectedBooking.approver?.name || "-"}
                      </dd>
                      {selectedBooking.approver?.email && (
                        <dd className="mt-1 text-gray-600">
                          {selectedBooking.approver.email}
                        </dd>
                      )}
                    </div>
                    <div>
                      <dt className="font-medium text-gray-600">ทะเบียนรถ</dt>
                      <dd className="mt-1 text-gray-950">
                        {selectedBooking.vehicle.plateNumber}
                      </dd>
                    </div>
                    <div>
                      <dt className="font-medium text-gray-600">ประเภทรถ</dt>
                      <dd className="mt-1 text-gray-950">
                        {selectedBooking.vehicle.type.name}
                      </dd>
                    </div>
                    <div>
                      <dt className="font-medium text-gray-600">เริ่มใช้รถ</dt>
                      <dd className="mt-1 text-gray-950">
                        {formatDateTime(selectedBooking.startDate)}
                      </dd>
                    </div>
                    <div>
                      <dt className="font-medium text-gray-600">คืนรถ</dt>
                      <dd className="mt-1 text-gray-950">
                        {formatDateTime(selectedBooking.endDate)}
                      </dd>
                    </div>
                    <div className="sm:col-span-2">
                      <dt className="font-medium text-gray-600">
                        วัตถุประสงค์
                      </dt>
                      <dd className="mt-1 text-gray-950">
                        {selectedBooking.purpose}
                      </dd>
                    </div>
                    {selectedBooking.destination && (
                      <div className="sm:col-span-2">
                        <dt className="font-medium text-gray-600">ปลายทาง</dt>
                        <dd className="mt-1 text-gray-950">
                          {selectedBooking.destination}
                        </dd>
                      </div>
                    )}
                  </dl>
                </div>

                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={closeDetailModal}
                    className="inline-flex min-h-11 items-center justify-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors duration-150 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-600/25"
                  >
                    ปิด
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  )
}
