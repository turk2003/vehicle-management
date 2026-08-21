"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import type { AxiosError } from "axios"
import {
  CalendarDays,
  Car,
  CheckCircle2,
  Clock,
  Eye,
  Gauge,
  Pencil,
  RotateCcw,
  Trash2,
  Undo2,
  X,
  XCircle,
} from "lucide-react"
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
  rejectionReason?: string
  mileageStart?: number | null
  mileageEnd?: number | null
  pickedUpAt?: string | null
  returnedAt?: string | null
  createdAt: string
  vehicle: {
    id: string
    plateNumber: string
    type: { id: string; name: string }
  }
  approver?: { id: string; name: string; email: string }
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

type EditForm = {
  id: string
  startDate: string
  endDate: string
  purpose: string
}

type ModalType = "detail" | "edit" | "pickup" | "return" | null

const INITIAL_STATS: BookingStats = {
  total: 0,
  pending: 0,
  approved: 0,
  rejected: 0,
  cancelled: 0,
  in_progress: 0,
  completed: 0,
}

const INITIAL_EDIT_FORM: EditForm = {
  id: "",
  startDate: "",
  endDate: "",
  purpose: "",
}

const STATUS_FILTERS = [
  {
    key: "ALL",
    label: "ทั้งหมด",
    stat: "total",
    color: "text-gray-950",
    icon: CalendarDays,
  },
  {
    key: "PENDING",
    label: "รออนุมัติ",
    stat: "pending",
    color: "text-yellow-700",
    icon: Clock,
  },
  {
    key: "APPROVED",
    label: "อนุมัติแล้ว",
    stat: "approved",
    color: "text-green-700",
    icon: CheckCircle2,
  },
  {
    key: "IN_PROGRESS",
    label: "กำลังใช้งาน",
    stat: "in_progress",
    color: "text-indigo-700",
    icon: Car,
  },
  {
    key: "COMPLETED",
    label: "เสร็จสิ้น",
    stat: "completed",
    color: "text-teal-700",
    icon: RotateCcw,
  },
  {
    key: "REJECTED",
    label: "ปฏิเสธ",
    stat: "rejected",
    color: "text-red-700",
    icon: XCircle,
  },
  {
    key: "CANCELLED",
    label: "ยกเลิก",
    stat: "cancelled",
    color: "text-gray-700",
    icon: Trash2,
  },
] as const

function getErrorMessage(error: unknown, fallback: string) {
  const axiosError = error as AxiosError<{ message?: string }>
  return axiosError.response?.data?.message || fallback
}

function toLocalDateTimeInputValue(dateString: string) {
  const date = new Date(dateString)
  date.setMinutes(date.getMinutes() - date.getTimezoneOffset())
  return date.toISOString().slice(0, 16)
}

function getLocalDateTimeInputValue(date = new Date()) {
  const localDate = new Date(date)
  localDate.setMinutes(localDate.getMinutes() - localDate.getTimezoneOffset())
  return localDate.toISOString().slice(0, 16)
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

function getDistance(booking: Booking) {
  if (booking.mileageStart == null || booking.mileageEnd == null) return null
  return booking.mileageEnd - booking.mileageStart
}

export default function MyBookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [selectedStatus, setSelectedStatus] = useState("ALL")
  const [activeModal, setActiveModal] = useState<ModalType>(null)
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null)
  const [editForm, setEditForm] = useState<EditForm>(INITIAL_EDIT_FORM)
  const [mileageInput, setMileageInput] = useState("")
  const [stats, setStats] = useState<BookingStats>(INITIAL_STATS)

  const closeModal = useCallback(() => {
    setActiveModal(null)
    setSelectedBooking(null)
    setMileageInput("")
    setEditForm(INITIAL_EDIT_FORM)
  }, [])

  const fetchBookings = useCallback(async () => {
    try {
      setLoading(true)
      setError("")
      const response = await api.get<Booking[]>("/api/booking?action=my-bookings")
      setBookings(response.data)
      setStats(buildStats(response.data))
    } catch {
      setError("ไม่สามารถโหลดข้อมูลการจองได้")
    } finally {
      setLoading(false)
    }
  }, [])

  const cancelBooking = async (booking: Booking) => {
    const confirmed = confirm(
      `ต้องการยกเลิกการจองรถ "${booking.vehicle.plateNumber}" ใช่หรือไม่?`,
    )
    if (!confirmed) return

    try {
      setLoading(true)
      setError("")
      setSuccess("")
      await api.put("/api/booking", { id: booking.id, status: "CANCELLED" })
      setSuccess("ยกเลิกการจองเรียบร้อยแล้ว")
      await fetchBookings()
    } catch (error: unknown) {
      setError(getErrorMessage(error, "ไม่สามารถยกเลิกการจองได้"))
    } finally {
      setLoading(false)
    }
  }

  const openDetailModal = (booking: Booking) => {
    setSelectedBooking(booking)
    setActiveModal("detail")
  }

  const openEditModal = (booking: Booking) => {
    setSelectedBooking(booking)
    setEditForm({
      id: booking.id,
      startDate: toLocalDateTimeInputValue(booking.startDate),
      endDate: toLocalDateTimeInputValue(booking.endDate),
      purpose: booking.purpose,
    })
    setError("")
    setSuccess("")
    setActiveModal("edit")
  }

  const openMileageModal = (booking: Booking, modal: "pickup" | "return") => {
    setSelectedBooking(booking)
    setMileageInput("")
    setError("")
    setSuccess("")
    setActiveModal(modal)
  }

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      setLoading(true)
      setError("")
      setSuccess("")
      await api.patch("/api/booking", editForm)
      setSuccess("บันทึกการแก้ไขการจองเรียบร้อยแล้ว")
      closeModal()
      await fetchBookings()
    } catch (error: unknown) {
      setError(getErrorMessage(error, "ไม่สามารถแก้ไขการจองได้"))
    } finally {
      setLoading(false)
    }
  }

  const handlePickup = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedBooking) return

    try {
      setLoading(true)
      setError("")
      setSuccess("")
      await api.put("/api/booking/pickup", {
        bookingId: selectedBooking.id,
        mileageStart: Number(mileageInput),
      })
      setSuccess("บันทึกการรับรถเรียบร้อยแล้ว")
      closeModal()
      await fetchBookings()
    } catch (error: unknown) {
      setError(getErrorMessage(error, "ไม่สามารถรับรถได้"))
    } finally {
      setLoading(false)
    }
  }

  const handleReturn = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedBooking) return

    try {
      setLoading(true)
      setError("")
      setSuccess("")
      await api.put("/api/booking/return", {
        bookingId: selectedBooking.id,
        mileageEnd: Number(mileageInput),
      })
      setSuccess("บันทึกการคืนรถเรียบร้อยแล้ว")
      closeModal()
      await fetchBookings()
    } catch (error: unknown) {
      setError(getErrorMessage(error, "ไม่สามารถคืนรถได้"))
    } finally {
      setLoading(false)
    }
  }

  const filteredBookings = useMemo(() => {
    if (selectedStatus === "ALL") return bookings
    return bookings.filter((booking) => booking.status === selectedStatus)
  }, [bookings, selectedStatus])

  const minEditEndDateTime = useMemo(() => {
    if (!editForm.startDate) return ""
    const start = new Date(editForm.startDate)
    start.setHours(start.getHours() + 1)
    return getLocalDateTimeInputValue(start)
  }, [editForm.startDate])

  useEffect(() => {
    fetchBookings()
  }, [fetchBookings])

  useEffect(() => {
    if (!activeModal) return

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeModal()
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [activeModal, closeModal])

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <header className="mb-6 rounded-xl bg-white p-6 shadow-sm ring-1 ring-gray-200">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="mb-2 text-sm font-medium text-blue-700">
                ผู้ใช้งาน
              </p>
              <h1 className="text-2xl font-bold leading-tight text-gray-950">
                การจองของฉัน
              </h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-600">
                ตรวจสอบสถานะ แก้ไขคำขอที่รออนุมัติ และบันทึกการรับหรือคืนรถเมื่อถึงเวลาใช้งาน
              </p>
            </div>

            <div className="rounded-lg bg-blue-50 px-4 py-3 ring-1 ring-blue-100">
              <div className="flex items-start gap-3">
                <Car
                  className="mt-0.5 h-5 w-5 text-blue-700"
                  aria-hidden="true"
                />
                <div>
                  <p className="text-sm font-medium text-blue-900">
                    รายการทั้งหมด
                  </p>
                  <p className="mt-1 text-sm text-blue-800">
                    {stats.total} รายการในบัญชีของคุณ
                  </p>
                </div>
              </div>
            </div>
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

        <section className="mb-6 grid grid-cols-2 gap-3 md:grid-cols-4 xl:grid-cols-7">
          {STATUS_FILTERS.map((item) => {
            const Icon = item.icon
            const value = stats[item.stat]
            const selected = selectedStatus === item.key

            return (
              <button
                key={item.key}
                type="button"
                onClick={() => setSelectedStatus(item.key)}
                className={`rounded-xl bg-white p-4 text-left shadow-sm ring-1 ring-gray-200 transition-colors duration-150 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-600/25 ${
                  selected ? "ring-2 ring-blue-600" : ""
                }`}
              >
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-medium text-gray-600">
                    {item.label}
                  </p>
                  <Icon className="h-4 w-4 text-gray-500" aria-hidden="true" />
                </div>
                <p className={`mt-2 text-2xl font-bold ${item.color}`}>
                  {value}
                </p>
              </button>
            )
          })}
        </section>

        <section
          className="rounded-xl bg-white shadow-sm ring-1 ring-gray-200"
          aria-labelledby="my-bookings-list-title"
        >
          <div className="border-b border-gray-200 px-6 py-4">
            <h2
              id="my-bookings-list-title"
              className="text-lg font-semibold text-gray-950"
            >
              รายการจอง
            </h2>
            <p className="mt-1 text-sm text-gray-600">
              แสดง {filteredBookings.length} รายการ
            </p>
          </div>

          <div className="divide-y divide-gray-200">
            {loading && bookings.length === 0 ? (
              <div className="px-6 py-10">
                <div className="h-5 w-48 animate-pulse rounded bg-gray-200" />
                <div className="mt-3 h-4 w-72 max-w-full animate-pulse rounded bg-gray-100" />
              </div>
            ) : filteredBookings.length === 0 ? (
              <div className="px-6 py-12 text-center">
                <CalendarDays
                  className="mx-auto h-10 w-10 text-gray-400"
                  aria-hidden="true"
                />
                <h3 className="mt-4 text-lg font-semibold text-gray-950">
                  ไม่พบข้อมูลการจอง
                </h3>
                <p className="mt-2 text-sm text-gray-600">
                  ไม่มีรายการในสถานะที่เลือก
                </p>
              </div>
            ) : (
              filteredBookings.map((booking) => {
                const distance = getDistance(booking)

                return (
                  <article key={booking.id} className="px-6 py-5">
                    <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-3">
                          <h3 className="text-lg font-semibold text-gray-950">
                            {booking.vehicle.plateNumber}
                          </h3>
                          <span
                            className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${getBookingStatusColor(booking.status)}`}
                          >
                            {getBookingStatusText(booking.status)}
                          </span>
                        </div>

                        <dl className="mt-4 grid grid-cols-1 gap-4 text-sm md:grid-cols-2 xl:grid-cols-4">
                          <div>
                            <dt className="font-medium text-gray-600">
                              ประเภทรถ
                            </dt>
                            <dd className="mt-1 text-gray-950">
                              {booking.vehicle.type.name}
                            </dd>
                          </div>
                          <div>
                            <dt className="font-medium text-gray-600">
                              วันที่จอง
                            </dt>
                            <dd className="mt-1 text-gray-950">
                              {formatDateTime(booking.createdAt)}
                            </dd>
                          </div>
                          <div>
                            <dt className="font-medium text-gray-600">
                              เริ่มใช้รถ
                            </dt>
                            <dd className="mt-1 text-gray-950">
                              {formatDateTime(booking.startDate)}
                            </dd>
                          </div>
                          <div>
                            <dt className="font-medium text-gray-600">คืนรถ</dt>
                            <dd className="mt-1 text-gray-950">
                              {formatDateTime(booking.endDate)}
                            </dd>
                          </div>
                          <div className="md:col-span-2 xl:col-span-4">
                            <dt className="font-medium text-gray-600">
                              วัตถุประสงค์
                            </dt>
                            <dd className="mt-1 text-gray-950">
                              {booking.purpose}
                            </dd>
                          </div>
                          {booking.destination && (
                            <div className="md:col-span-2 xl:col-span-4">
                              <dt className="font-medium text-gray-600">
                                ปลายทาง
                              </dt>
                              <dd className="mt-1 text-gray-950">
                                {booking.destination}
                              </dd>
                            </div>
                          )}
                        </dl>

                        {(booking.mileageStart != null ||
                          booking.mileageEnd != null) && (
                          <div className="mt-4 rounded-lg bg-indigo-50 p-4 ring-1 ring-indigo-100">
                            <div className="mb-3 flex items-center gap-2">
                              <Gauge
                                className="h-4 w-4 text-indigo-700"
                                aria-hidden="true"
                              />
                              <p className="text-sm font-semibold text-indigo-900">
                                ข้อมูลไมล์
                              </p>
                            </div>
                            <dl className="grid gap-3 text-sm sm:grid-cols-3">
                              {booking.mileageStart != null && (
                                <div>
                                  <dt className="font-medium text-indigo-700">
                                    เริ่มต้น
                                  </dt>
                                  <dd className="mt-1 text-gray-950">
                                    {booking.mileageStart.toLocaleString()} km
                                  </dd>
                                </div>
                              )}
                              {booking.mileageEnd != null && (
                                <div>
                                  <dt className="font-medium text-indigo-700">
                                    สิ้นสุด
                                  </dt>
                                  <dd className="mt-1 text-gray-950">
                                    {booking.mileageEnd.toLocaleString()} km
                                  </dd>
                                </div>
                              )}
                              {distance != null && (
                                <div>
                                  <dt className="font-medium text-indigo-700">
                                    ระยะทาง
                                  </dt>
                                  <dd className="mt-1 font-semibold text-indigo-900">
                                    {distance.toLocaleString()} km
                                  </dd>
                                </div>
                              )}
                            </dl>
                            {booking.pickedUpAt && (
                              <p className="mt-3 text-sm text-indigo-800">
                                รับรถจริง: {formatDateTime(booking.pickedUpAt)}
                              </p>
                            )}
                            {booking.returnedAt && (
                              <p className="mt-1 text-sm text-indigo-800">
                                คืนรถจริง: {formatDateTime(booking.returnedAt)}
                              </p>
                            )}
                          </div>
                        )}

                        {booking.approver && (
                          <p className="mt-4 text-sm text-gray-600">
                            ผู้อนุมัติ:{" "}
                            <span className="font-medium text-gray-950">
                              {booking.approver.name}
                            </span>
                          </p>
                        )}

                        {booking.status === "REJECTED" &&
                          booking.rejectionReason && (
                            <div className="mt-4 rounded-lg bg-red-50 p-4 ring-1 ring-red-100">
                              <p className="text-sm font-semibold text-red-900">
                                เหตุผลที่ปฏิเสธ
                              </p>
                              <p className="mt-1 text-sm text-red-800">
                                {booking.rejectionReason}
                              </p>
                            </div>
                          )}
                      </div>

                      <div className="flex flex-wrap gap-2 lg:w-40 lg:flex-col">
                        <button
                          type="button"
                          onClick={() => openDetailModal(booking)}
                          className="inline-flex min-h-10 items-center justify-center gap-1.5 rounded-lg bg-blue-50 px-3.5 py-2 text-sm font-medium text-blue-700 transition-colors duration-150 hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-600/25"
                        >
                          <Eye className="h-4 w-4" aria-hidden="true" />
                          ดูรายละเอียด
                        </button>
                        {booking.status === "PENDING" && (
                          <>
                            <button
                              type="button"
                              onClick={() => openEditModal(booking)}
                              disabled={loading}
                              className="inline-flex min-h-10 items-center justify-center gap-1.5 rounded-lg bg-amber-50 px-3.5 py-2 text-sm font-medium text-amber-700 transition-colors duration-150 hover:bg-amber-100 focus:outline-none focus:ring-2 focus:ring-amber-600/25 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                              <Pencil className="h-4 w-4" aria-hidden="true" />
                              แก้ไข
                            </button>
                            <button
                              type="button"
                              onClick={() => cancelBooking(booking)}
                              disabled={loading}
                              className="inline-flex min-h-10 items-center justify-center gap-1.5 rounded-lg bg-red-50 px-3.5 py-2 text-sm font-medium text-red-700 transition-colors duration-150 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-red-600/25 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                              <Trash2 className="h-4 w-4" aria-hidden="true" />
                              ยกเลิก
                            </button>
                          </>
                        )}
                        {["APPROVED", "CHANGED"].includes(booking.status) && (
                          <button
                            type="button"
                            onClick={() => openMileageModal(booking, "pickup")}
                            disabled={loading}
                            className="inline-flex min-h-10 items-center justify-center gap-1.5 rounded-lg bg-indigo-50 px-3.5 py-2 text-sm font-medium text-indigo-700 transition-colors duration-150 hover:bg-indigo-100 focus:outline-none focus:ring-2 focus:ring-indigo-600/25 disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            <Car className="h-4 w-4" aria-hidden="true" />
                            รับรถ
                          </button>
                        )}
                        {booking.status === "IN_PROGRESS" && (
                          <button
                            type="button"
                            onClick={() => openMileageModal(booking, "return")}
                            disabled={loading}
                            className="inline-flex min-h-10 items-center justify-center gap-1.5 rounded-lg bg-teal-50 px-3.5 py-2 text-sm font-medium text-teal-700 transition-colors duration-150 hover:bg-teal-100 focus:outline-none focus:ring-2 focus:ring-teal-600/25 disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            <Undo2 className="h-4 w-4" aria-hidden="true" />
                            คืนรถ
                          </button>
                        )}
                      </div>
                    </div>
                  </article>
                )
              })
            )}
          </div>
        </section>

        {activeModal === "detail" && selectedBooking && (
          <div
            className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-gray-900/50 px-4 py-8"
            role="dialog"
            aria-modal="true"
            aria-labelledby="booking-detail-title"
          >
            <div className="w-full max-w-2xl rounded-xl bg-white shadow-lg ring-1 ring-gray-200">
              <ModalHeader
                id="booking-detail-title"
                title="รายละเอียดการจอง"
                description="ข้อมูลรถ ช่วงเวลา สถานะ และผลการดำเนินการ"
                onClose={closeModal}
              />

              <div className="space-y-5 px-6 py-6">
                <BookingDetailPanel booking={selectedBooking} />
                <div className="flex justify-end">
                  <PrimaryButton onClick={closeModal}>ปิด</PrimaryButton>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeModal === "edit" && selectedBooking && (
          <div
            className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-gray-900/50 px-4 py-8"
            role="dialog"
            aria-modal="true"
            aria-labelledby="booking-edit-title"
          >
            <div className="w-full max-w-lg rounded-xl bg-white shadow-lg ring-1 ring-gray-200">
              <ModalHeader
                id="booking-edit-title"
                title="แก้ไขการจอง"
                description="แก้ไขได้เฉพาะคำขอที่ยังรออนุมัติ"
                onClose={closeModal}
              />

              <form onSubmit={handleEditSubmit} className="space-y-5 px-6 py-6">
                <div>
                  <label
                    htmlFor="edit-start-date"
                    className="mb-1.5 block text-sm font-medium text-gray-700"
                  >
                    วันที่และเวลาเริ่ม
                  </label>
                  <input
                    id="edit-start-date"
                    type="datetime-local"
                    required
                    value={editForm.startDate}
                    min={getLocalDateTimeInputValue()}
                    onChange={(e) =>
                      setEditForm((current) => ({
                        ...current,
                        startDate: e.target.value,
                        endDate:
                          current.endDate && current.endDate <= e.target.value
                            ? ""
                            : current.endDate,
                      }))
                    }
                    className="min-h-11 w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-gray-950 transition-colors duration-150 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600/25"
                  />
                </div>
                <div>
                  <label
                    htmlFor="edit-end-date"
                    className="mb-1.5 block text-sm font-medium text-gray-700"
                  >
                    วันที่และเวลาสิ้นสุด
                  </label>
                  <input
                    id="edit-end-date"
                    type="datetime-local"
                    required
                    value={editForm.endDate}
                    min={minEditEndDateTime}
                    disabled={!editForm.startDate}
                    onChange={(e) =>
                      setEditForm((current) => ({
                        ...current,
                        endDate: e.target.value,
                      }))
                    }
                    className="min-h-11 w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-gray-950 transition-colors duration-150 disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-500 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600/25"
                  />
                </div>
                <div>
                  <label
                    htmlFor="edit-purpose"
                    className="mb-1.5 block text-sm font-medium text-gray-700"
                  >
                    วัตถุประสงค์
                  </label>
                  <textarea
                    id="edit-purpose"
                    required
                    rows={4}
                    value={editForm.purpose}
                    onChange={(e) =>
                      setEditForm((current) => ({
                        ...current,
                        purpose: e.target.value,
                      }))
                    }
                    className="min-h-28 w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-gray-950 transition-colors duration-150 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600/25"
                  />
                </div>
                <ModalActions
                  loading={loading}
                  loadingLabel="กำลังบันทึก..."
                  submitLabel="บันทึกการแก้ไข"
                  onCancel={closeModal}
                />
              </form>
            </div>
          </div>
        )}

        {activeModal === "pickup" && selectedBooking && (
          <MileageModal
            id="booking-pickup-title"
            title={`รับรถ: ${selectedBooking.vehicle.plateNumber}`}
            description="ระบุเลขไมล์เริ่มต้นก่อนเปลี่ยนสถานะเป็นกำลังใช้งาน"
            label="เลขไมล์เริ่มต้น (km)"
            value={mileageInput}
            min={0}
            loading={loading}
            loadingLabel="กำลังบันทึก..."
            submitLabel="ยืนยันการรับรถ"
            tone="indigo"
            onChange={setMileageInput}
            onClose={closeModal}
            onSubmit={handlePickup}
          />
        )}

        {activeModal === "return" && selectedBooking && (
          <MileageModal
            id="booking-return-title"
            title={`คืนรถ: ${selectedBooking.vehicle.plateNumber}`}
            description={`เลขไมล์เริ่มต้น: ${(selectedBooking.mileageStart || 0).toLocaleString()} km`}
            label="เลขไมล์สิ้นสุด (km)"
            value={mileageInput}
            min={selectedBooking.mileageStart || 0}
            loading={loading}
            loadingLabel="กำลังบันทึก..."
            submitLabel="ยืนยันการคืนรถ"
            tone="teal"
            onChange={setMileageInput}
            onClose={closeModal}
            onSubmit={handleReturn}
          />
        )}
      </div>
    </main>
  )
}

function ModalHeader({
  id,
  title,
  description,
  onClose,
}: {
  id: string
  title: string
  description: string
  onClose: () => void
}) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-gray-200 px-6 py-5">
      <div>
        <h3 id={id} className="text-lg font-semibold text-gray-950">
          {title}
        </h3>
        <p className="mt-1 text-sm text-gray-600">{description}</p>
      </div>
      <button
        type="button"
        onClick={onClose}
        className="inline-flex h-9 w-9 items-center justify-center rounded-md text-gray-500 transition-colors duration-150 hover:bg-gray-100 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-600/25"
        aria-label="ปิดหน้าต่าง"
      >
        <X className="h-5 w-5" aria-hidden="true" />
      </button>
    </div>
  )
}

function BookingDetailPanel({ booking }: { booking: Booking }) {
  const distance = getDistance(booking)

  return (
    <div className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-lg bg-gray-50 p-4 ring-1 ring-gray-200">
          <p className="text-sm font-medium text-gray-600">สถานะ</p>
          <span
            className={`mt-2 inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${getBookingStatusColor(booking.status)}`}
          >
            {getBookingStatusText(booking.status)}
          </span>
        </div>
        <div className="rounded-lg bg-gray-50 p-4 ring-1 ring-gray-200">
          <p className="text-sm font-medium text-gray-600">วันที่จอง</p>
          <p className="mt-2 text-sm text-gray-950">
            {formatDateTime(booking.createdAt)}
          </p>
        </div>
      </div>

      <div className="rounded-lg bg-gray-50 p-4 ring-1 ring-gray-200">
        <dl className="grid gap-4 text-sm sm:grid-cols-2">
          <div>
            <dt className="font-medium text-gray-600">ทะเบียนรถ</dt>
            <dd className="mt-1 text-gray-950">{booking.vehicle.plateNumber}</dd>
          </div>
          <div>
            <dt className="font-medium text-gray-600">ประเภทรถ</dt>
            <dd className="mt-1 text-gray-950">{booking.vehicle.type.name}</dd>
          </div>
          <div>
            <dt className="font-medium text-gray-600">เริ่มใช้รถ</dt>
            <dd className="mt-1 text-gray-950">
              {formatDateTime(booking.startDate)}
            </dd>
          </div>
          <div>
            <dt className="font-medium text-gray-600">คืนรถ</dt>
            <dd className="mt-1 text-gray-950">
              {formatDateTime(booking.endDate)}
            </dd>
          </div>
          <div className="sm:col-span-2">
            <dt className="font-medium text-gray-600">วัตถุประสงค์</dt>
            <dd className="mt-1 text-gray-950">{booking.purpose}</dd>
          </div>
          {booking.destination && (
            <div className="sm:col-span-2">
              <dt className="font-medium text-gray-600">ปลายทาง</dt>
              <dd className="mt-1 text-gray-950">{booking.destination}</dd>
            </div>
          )}
        </dl>
      </div>

      {(booking.mileageStart != null || booking.mileageEnd != null) && (
        <div className="rounded-lg bg-indigo-50 p-4 ring-1 ring-indigo-100">
          <h4 className="text-sm font-semibold text-indigo-900">ข้อมูลไมล์</h4>
          <dl className="mt-3 grid gap-3 text-sm sm:grid-cols-3">
            {booking.mileageStart != null && (
              <div>
                <dt className="font-medium text-indigo-700">ไมล์เริ่มต้น</dt>
                <dd className="mt-1 text-gray-950">
                  {booking.mileageStart.toLocaleString()} km
                </dd>
              </div>
            )}
            {booking.mileageEnd != null && (
              <div>
                <dt className="font-medium text-indigo-700">ไมล์สิ้นสุด</dt>
                <dd className="mt-1 text-gray-950">
                  {booking.mileageEnd.toLocaleString()} km
                </dd>
              </div>
            )}
            {distance != null && (
              <div>
                <dt className="font-medium text-indigo-700">ระยะทาง</dt>
                <dd className="mt-1 font-semibold text-indigo-900">
                  {distance.toLocaleString()} km
                </dd>
              </div>
            )}
          </dl>
          {booking.pickedUpAt && (
            <p className="mt-3 text-sm text-indigo-800">
              รับรถจริง: {formatDateTime(booking.pickedUpAt)}
            </p>
          )}
          {booking.returnedAt && (
            <p className="mt-1 text-sm text-indigo-800">
              คืนรถจริง: {formatDateTime(booking.returnedAt)}
            </p>
          )}
        </div>
      )}

      {booking.approver && (
        <div className="rounded-lg bg-gray-50 p-4 ring-1 ring-gray-200">
          <p className="text-sm font-medium text-gray-600">ผู้อนุมัติ</p>
          <p className="mt-1 text-sm text-gray-950">{booking.approver.name}</p>
          <p className="mt-1 text-sm text-gray-600">{booking.approver.email}</p>
        </div>
      )}
    </div>
  )
}

function PrimaryButton({
  children,
  onClick,
}: {
  children: React.ReactNode
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex min-h-11 items-center justify-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors duration-150 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-600/25"
    >
      {children}
    </button>
  )
}

function ModalActions({
  loading,
  loadingLabel,
  submitLabel,
  onCancel,
}: {
  loading: boolean
  loadingLabel: string
  submitLabel: string
  onCancel: () => void
}) {
  return (
    <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
      <button
        type="button"
        onClick={onCancel}
        className="inline-flex min-h-11 items-center justify-center rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 transition-colors duration-150 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-600/25"
      >
        ยกเลิก
      </button>
      <button
        type="submit"
        disabled={loading}
        className="inline-flex min-h-11 items-center justify-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors duration-150 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-600/25 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loading ? loadingLabel : submitLabel}
      </button>
    </div>
  )
}

function MileageModal({
  id,
  title,
  description,
  label,
  value,
  min,
  loading,
  loadingLabel,
  submitLabel,
  tone,
  onChange,
  onClose,
  onSubmit,
}: {
  id: string
  title: string
  description: string
  label: string
  value: string
  min: number
  loading: boolean
  loadingLabel: string
  submitLabel: string
  tone: "indigo" | "teal"
  onChange: (value: string) => void
  onClose: () => void
  onSubmit: (e: React.FormEvent) => void
}) {
  const toneClasses =
    tone === "indigo"
      ? "bg-indigo-600 hover:bg-indigo-700 focus:ring-indigo-600/25"
      : "bg-teal-600 hover:bg-teal-700 focus:ring-teal-600/25"

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-gray-900/50 px-4 py-8"
      role="dialog"
      aria-modal="true"
      aria-labelledby={id}
    >
      <div className="w-full max-w-md rounded-xl bg-white shadow-lg ring-1 ring-gray-200">
        <ModalHeader
          id={id}
          title={title}
          description={description}
          onClose={onClose}
        />

        <form onSubmit={onSubmit} className="space-y-5 px-6 py-6">
          <div>
            <label
              htmlFor={`${id}-mileage`}
              className="mb-1.5 block text-sm font-medium text-gray-700"
            >
              {label} <span className="text-red-700">*</span>
            </label>
            <input
              id={`${id}-mileage`}
              type="number"
              required
              min={min}
              value={value}
              onChange={(e) => onChange(e.target.value)}
              className="min-h-11 w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-gray-950 transition-colors duration-150 placeholder:text-gray-500 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600/25"
              placeholder="เช่น 15000"
            />
          </div>

          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={onClose}
              className="inline-flex min-h-11 items-center justify-center rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 transition-colors duration-150 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-600/25"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              disabled={loading || !value}
              className={`inline-flex min-h-11 items-center justify-center rounded-lg px-4 py-2 text-sm font-medium text-white transition-colors duration-150 focus:outline-none focus:ring-2 disabled:cursor-not-allowed disabled:opacity-60 ${toneClasses}`}
            >
              {loading ? loadingLabel : submitLabel}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
