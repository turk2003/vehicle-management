"use client"

import { useCallback, useEffect, useState } from "react"
import axios from "axios"
import { Pencil, SlidersHorizontal, Trash2, X } from "lucide-react"
import api from "@/lib/api"
import {
  formatDateTime,
  getBookingStatusColor,
  getBookingStatusText,
  getVehicleStatusColor,
  getVehicleStatusText,
} from "@/lib/format"

type Booking = {
  id: string
  startDate: string
  endDate: string
  purpose: string
  destination?: string
  status: string
  mileageStart?: number | null
  mileageEnd?: number | null
  pickedUpAt?: string | null
  returnedAt?: string | null
  createdAt: string
  user: { id: string; name: string; email: string; role: string }
  vehicle: {
    id: string
    plateNumber: string
    status: string
    currentMileage: number
    type: { id: string; name: string }
  }
  approver?: { id: string; name: string; email: string }
}

type User = { id: string; name: string; email: string }
type Vehicle = { id: string; plateNumber: string; type: { name: string } }

type BookingFilters = {
  status: string
  userId: string
  vehicleId: string
  startDate: string
  endDate: string
}

type BookingStats = {
  total: number
  pending: number
  approved: number
  rejected: number
  cancelled: number
  in_progress: number
  completed: number
}

const INITIAL_FILTERS: BookingFilters = {
  status: "",
  userId: "",
  vehicleId: "",
  startDate: "",
  endDate: "",
}

const INITIAL_STATS: BookingStats = {
  total: 0,
  pending: 0,
  approved: 0,
  rejected: 0,
  cancelled: 0,
  in_progress: 0,
  completed: 0,
}

const BOOKING_STATUS_OPTIONS = [
  { value: "PENDING", label: "รออนุมัติ" },
  { value: "APPROVED", label: "อนุมัติแล้ว" },
  { value: "IN_PROGRESS", label: "กำลังใช้งาน" },
  { value: "COMPLETED", label: "เสร็จสิ้น" },
  { value: "REJECTED", label: "ปฏิเสธ" },
  { value: "CANCELLED", label: "ยกเลิก" },
]

function getErrorMessage(error: unknown, fallback: string) {
  if (axios.isAxiosError<{ message?: string }>(error)) {
    return error.response?.data?.message || fallback
  }

  return fallback
}

function buildStats(bookings: Booking[]): BookingStats {
  return bookings.reduce<BookingStats>((acc, booking) => {
    acc.total += 1
    const key = booking.status.toLowerCase() as keyof BookingStats

    if (key in acc && key !== "total") {
      acc[key] += 1
    }

    return acc
  }, { ...INITIAL_STATS })
}

export default function AdminBookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [filters, setFilters] = useState<BookingFilters>(INITIAL_FILTERS)
  const [showModal, setShowModal] = useState(false)
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null)
  const [newStatus, setNewStatus] = useState("")
  const [stats, setStats] = useState<BookingStats>(INITIAL_STATS)

  const fetchData = useCallback(async () => {
    try {
      setLoading(true)
      setError("")
      const params = new URLSearchParams()
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value)
      })

      const [bookingsRes, usersRes, vehiclesRes] = await Promise.all([
        api.get<Booking[]>(`/api/admin/bookings?${params.toString()}`),
        api.get<User[]>("/api/user"),
        api.get<Vehicle[]>("/api/verhicle"),
      ])

      setBookings(bookingsRes.data)
      setUsers(usersRes.data)
      setVehicles(vehiclesRes.data)
      setStats(buildStats(bookingsRes.data))
    } catch (error) {
      setError(getErrorMessage(error, "ไม่สามารถโหลดข้อมูลการจองได้"))
    } finally {
      setLoading(false)
    }
  }, [filters])

  const updateBookingStatus = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedBooking || !newStatus) return

    try {
      setLoading(true)
      setError("")
      setSuccess("")
      await api.put("/api/admin/bookings", {
        id: selectedBooking.id,
        status: newStatus,
      })
      setSuccess(`อัพเดทสถานะเป็น ${getBookingStatusText(newStatus)} แล้ว`)
      closeStatusModal()
      await fetchData()
    } catch (error) {
      setError(getErrorMessage(error, "ไม่สามารถอัพเดทสถานะได้"))
    } finally {
      setLoading(false)
    }
  }

  const deleteBooking = async (booking: Booking) => {
    const confirmed = confirm(
      `ต้องการลบการจองของ "${booking.user.name}" ใช่หรือไม่?`,
    )
    if (!confirmed) return

    try {
      setLoading(true)
      setError("")
      setSuccess("")
      await api.delete(`/api/admin/bookings?id=${booking.id}`)
      setSuccess("ลบการจองเรียบร้อยแล้ว")
      await fetchData()
    } catch (error) {
      setError(getErrorMessage(error, "ไม่สามารถลบการจองได้"))
    } finally {
      setLoading(false)
    }
  }

  const handleFilterChange = (key: keyof BookingFilters, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }))
  }

  const openStatusModal = (booking: Booking) => {
    setSelectedBooking(booking)
    setNewStatus(booking.status)
    setShowModal(true)
  }

  const closeStatusModal = () => {
    setShowModal(false)
    setSelectedBooking(null)
    setNewStatus("")
  }

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const statItems = [
    { label: "ทั้งหมด", value: stats.total, color: "text-gray-950" },
    { label: "รออนุมัติ", value: stats.pending, color: "text-yellow-700" },
    { label: "อนุมัติแล้ว", value: stats.approved, color: "text-green-700" },
    { label: "กำลังใช้งาน", value: stats.in_progress, color: "text-indigo-700" },
    { label: "เสร็จสิ้น", value: stats.completed, color: "text-teal-700" },
    { label: "ปฏิเสธ", value: stats.rejected, color: "text-red-700" },
    { label: "ยกเลิก", value: stats.cancelled, color: "text-gray-700" },
  ]

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <header className="mb-6 rounded-xl bg-white p-6 shadow-sm ring-1 ring-gray-200">
          <div>
            <p className="mb-2 text-sm font-medium text-blue-700">
              ผู้ดูแลระบบ
            </p>
            <h1 className="text-2xl font-bold leading-tight text-gray-950">
              จัดการการจอง
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-600">
              ตรวจสอบคำขอจองรถ กรองข้อมูลตามสถานะ ผู้จอง รถ และช่วงวันที่
            </p>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-4 xl:grid-cols-7">
            {statItems.map((item) => (
              <div
                key={item.label}
                className="rounded-lg bg-gray-50 p-4 ring-1 ring-gray-200"
              >
                <p className="text-sm font-medium text-gray-600">
                  {item.label}
                </p>
                <p className={`mt-2 text-2xl font-bold ${item.color}`}>
                  {item.value}
                </p>
              </div>
            ))}
          </div>
        </header>

        {success && (
          <div
            role="status"
            className="mb-4 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800"
          >
            {success}
          </div>
        )}
        {error && (
          <div
            role="alert"
            aria-live="polite"
            className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"
          >
            {error}
          </div>
        )}

        <section
          className="mb-6 rounded-xl bg-white p-6 shadow-sm ring-1 ring-gray-200"
          aria-labelledby="booking-filter-title"
        >
          <div className="mb-4 flex items-center gap-2">
            <SlidersHorizontal
              className="h-5 w-5 text-blue-700"
              aria-hidden="true"
            />
            <h2
              id="booking-filter-title"
              className="text-lg font-semibold text-gray-950"
            >
              กรองข้อมูล
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-5">
            <div>
              <label
                htmlFor="status-filter"
                className="mb-1.5 block text-sm font-medium text-gray-700"
              >
                สถานะ
              </label>
              <select
                id="status-filter"
                value={filters.status}
                onChange={(e) => handleFilterChange("status", e.target.value)}
                className="min-h-11 w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-gray-950 transition-colors duration-150 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600/25"
              >
                <option value="">ทุกสถานะ</option>
                {BOOKING_STATUS_OPTIONS.map((status) => (
                  <option key={status.value} value={status.value}>
                    {status.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="user-filter"
                className="mb-1.5 block text-sm font-medium text-gray-700"
              >
                ผู้จอง
              </label>
              <select
                id="user-filter"
                value={filters.userId}
                onChange={(e) => handleFilterChange("userId", e.target.value)}
                className="min-h-11 w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-gray-950 transition-colors duration-150 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600/25"
              >
                <option value="">ทุกคน</option>
                {users.map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="vehicle-filter"
                className="mb-1.5 block text-sm font-medium text-gray-700"
              >
                รถ
              </label>
              <select
                id="vehicle-filter"
                value={filters.vehicleId}
                onChange={(e) =>
                  handleFilterChange("vehicleId", e.target.value)
                }
                className="min-h-11 w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-gray-950 transition-colors duration-150 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600/25"
              >
                <option value="">ทุกคัน</option>
                {vehicles.map((vehicle) => (
                  <option key={vehicle.id} value={vehicle.id}>
                    {vehicle.plateNumber} ({vehicle.type.name})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="start-date-filter"
                className="mb-1.5 block text-sm font-medium text-gray-700"
              >
                วันที่เริ่ม
              </label>
              <input
                id="start-date-filter"
                type="date"
                value={filters.startDate}
                onChange={(e) =>
                  handleFilterChange("startDate", e.target.value)
                }
                className="min-h-11 w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-gray-950 transition-colors duration-150 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600/25"
              />
            </div>

            <div>
              <label
                htmlFor="end-date-filter"
                className="mb-1.5 block text-sm font-medium text-gray-700"
              >
                วันที่สิ้นสุด
              </label>
              <input
                id="end-date-filter"
                type="date"
                value={filters.endDate}
                onChange={(e) => handleFilterChange("endDate", e.target.value)}
                className="min-h-11 w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-gray-950 transition-colors duration-150 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600/25"
              />
            </div>
          </div>

          <div className="mt-5 flex justify-end">
            <button
              type="button"
              onClick={() => setFilters(INITIAL_FILTERS)}
              className="inline-flex min-h-10 items-center justify-center rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 transition-colors duration-150 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-600/25"
            >
              ล้างตัวกรอง
            </button>
          </div>
        </section>

        <section
          className="overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-gray-200"
          aria-labelledby="bookings-table-title"
        >
          <div className="border-b border-gray-200 px-6 py-4">
            <h2
              id="bookings-table-title"
              className="text-lg font-semibold text-gray-950"
            >
              รายการจอง
            </h2>
            <p className="mt-1 text-sm text-gray-600">
              ทั้งหมด {bookings.length} รายการ
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[1120px]">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-600">
                    ผู้จอง
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-600">
                    รถ
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-600">
                    ช่วงเวลา
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-600">
                    วัตถุประสงค์
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-600">
                    สถานะ
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-600">
                    ไมล์
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-600">
                    การดำเนินการ
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {loading && bookings.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-10 text-center">
                      <div className="mx-auto h-5 w-48 animate-pulse rounded bg-gray-200" />
                    </td>
                  </tr>
                ) : bookings.length === 0 ? (
                  <tr>
                    <td
                      colSpan={7}
                      className="px-6 py-12 text-center text-sm text-gray-600"
                    >
                      ไม่พบข้อมูลการจอง
                    </td>
                  </tr>
                ) : (
                  bookings.map((booking) => (
                    <tr
                      key={booking.id}
                      className="transition-colors duration-150 hover:bg-gray-50"
                    >
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
                        <span
                          className={`mt-1 inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${getVehicleStatusColor(booking.vehicle.status)}`}
                        >
                          {getVehicleStatusText(booking.vehicle.status)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700">
                        <div>เริ่ม: {formatDateTime(booking.startDate)}</div>
                        <div className="mt-1">
                          สิ้นสุด: {formatDateTime(booking.endDate)}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div
                          className="max-w-xs truncate text-sm text-gray-950"
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
                      <td className="px-6 py-4 text-sm text-gray-700">
                        {booking.mileageStart != null && (
                          <div>
                            เริ่ม: {booking.mileageStart.toLocaleString()} km
                          </div>
                        )}
                        {booking.mileageEnd != null && (
                          <>
                            <div>
                              สิ้นสุด: {booking.mileageEnd.toLocaleString()} km
                            </div>
                            <div className="font-medium text-indigo-700">
                              ระยะทาง:{" "}
                              {(
                                booking.mileageEnd -
                                (booking.mileageStart || 0)
                              ).toLocaleString()}{" "}
                              km
                            </div>
                          </>
                        )}
                        {booking.mileageStart == null &&
                          booking.mileageEnd == null && (
                            <span className="text-gray-500">-</span>
                          )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => openStatusModal(booking)}
                            className="inline-flex min-h-9 items-center gap-1.5 rounded-md bg-blue-50 px-3 py-1.5 text-sm font-medium text-blue-700 transition-colors duration-150 hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-600/25"
                          >
                            <Pencil className="h-4 w-4" aria-hidden="true" />
                            แก้ไข
                          </button>
                          <button
                            type="button"
                            onClick={() => deleteBooking(booking)}
                            disabled={loading}
                            className="inline-flex min-h-9 items-center gap-1.5 rounded-md bg-red-50 px-3 py-1.5 text-sm font-medium text-red-700 transition-colors duration-150 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-red-600/25 disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            <Trash2 className="h-4 w-4" aria-hidden="true" />
                            ลบ
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

        {showModal && selectedBooking && (
          <div
            className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-gray-900/50 px-4 py-8"
            role="dialog"
            aria-modal="true"
            aria-labelledby="booking-modal-title"
          >
            <div className="w-full max-w-lg rounded-xl bg-white shadow-lg ring-1 ring-gray-200">
              <div className="flex items-start justify-between gap-4 border-b border-gray-200 px-6 py-5">
                <div>
                  <h3
                    id="booking-modal-title"
                    className="text-lg font-semibold text-gray-950"
                  >
                    แก้ไขสถานะการจอง
                  </h3>
                  <p className="mt-1 text-sm text-gray-600">
                    เปลี่ยนสถานะคำขอและแจ้งเตือนผู้จองตามระบบ
                  </p>
                </div>
                <button
                  type="button"
                  onClick={closeStatusModal}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-md text-gray-500 transition-colors duration-150 hover:bg-gray-100 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-600/25"
                  aria-label="ปิดหน้าต่าง"
                >
                  <X className="h-5 w-5" aria-hidden="true" />
                </button>
              </div>

              <form onSubmit={updateBookingStatus} className="space-y-5 px-6 py-6">
                <div className="rounded-lg bg-gray-50 p-4 ring-1 ring-gray-200">
                  <dl className="grid gap-3 text-sm">
                    <div>
                      <dt className="font-medium text-gray-600">ผู้จอง</dt>
                      <dd className="mt-1 text-gray-950">
                        {selectedBooking.user.name}
                      </dd>
                    </div>
                    <div>
                      <dt className="font-medium text-gray-600">รถ</dt>
                      <dd className="mt-1 text-gray-950">
                        {selectedBooking.vehicle.plateNumber}
                      </dd>
                    </div>
                    <div>
                      <dt className="font-medium text-gray-600">
                        สถานะปัจจุบัน
                      </dt>
                      <dd className="mt-1">
                        <span
                          className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${getBookingStatusColor(selectedBooking.status)}`}
                        >
                          {getBookingStatusText(selectedBooking.status)}
                        </span>
                      </dd>
                    </div>
                  </dl>
                </div>

                <div>
                  <label
                    htmlFor="new-status"
                    className="mb-1.5 block text-sm font-medium text-gray-700"
                  >
                    สถานะใหม่
                  </label>
                  <select
                    id="new-status"
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value)}
                    required
                    className="min-h-11 w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-gray-950 transition-colors duration-150 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600/25"
                  >
                    {BOOKING_STATUS_OPTIONS.map((status) => (
                      <option key={status.value} value={status.value}>
                        {status.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
                  <button
                    type="button"
                    onClick={closeStatusModal}
                    className="inline-flex min-h-11 items-center justify-center rounded-lg bg-gray-100 px-4 py-2.5 text-sm font-medium text-gray-700 transition-colors duration-150 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-600/25"
                  >
                    ยกเลิก
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="inline-flex min-h-11 items-center justify-center rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition-colors duration-150 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {loading ? "กำลังบันทึก..." : "บันทึกสถานะ"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </main>
  )
}
