"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import type { AxiosError } from "axios"
import { Check, CheckCircle2, Clock, X, XCircle } from "lucide-react"
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
  createdAt: string
  user: {
    id: string
    name: string
    email: string
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

const STATUS_FILTERS = [
  { value: "PENDING", label: "รออนุมัติ", icon: Clock },
  { value: "APPROVED", label: "อนุมัติแล้ว", icon: CheckCircle2 },
  { value: "REJECTED", label: "ปฏิเสธ", icon: XCircle },
]

export default function ApproverBookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedStatus, setSelectedStatus] = useState("PENDING")
  const [showModal, setShowModal] = useState(false)
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null)
  const [actionType, setActionType] = useState<"APPROVED" | "REJECTED">(
    "APPROVED",
  )
  const [comment, setComment] = useState("")
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const submittingRef = useRef(false)

  const fetchBookings = useCallback(async () => {
    try {
      setLoading(true)
      setError("")
      const response = await api.get(`/api/approver?status=${selectedStatus}`)
      setBookings(response.data)
    } catch {
      setError("ไม่สามารถโหลดข้อมูลได้")
    } finally {
      setLoading(false)
    }
  }, [selectedStatus])

  const openApprovalModal = (
    booking: Booking,
    action: "APPROVED" | "REJECTED",
  ) => {
    setSelectedBooking(booking)
    setActionType(action)
    setComment("")
    setError("")
    setSuccess("")
    setShowModal(true)
  }

  const closeApprovalModal = () => {
    setShowModal(false)
    setSelectedBooking(null)
    setComment("")
  }

  const submitApproval = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedBooking || submittingRef.current) return

    try {
      submittingRef.current = true
      setLoading(true)
      setError("")

      await api.put("/api/approver", {
        id: selectedBooking.id,
        action: actionType,
        comment,
      })

      setSuccess(
        `การจองได้รับการ${actionType === "APPROVED" ? "อนุมัติ" : "ปฏิเสธ"}แล้ว`,
      )
      closeApprovalModal()
      await fetchBookings()
    } catch (error: unknown) {
      const axiosError = error as AxiosError<{ message?: string }>
      setError(axiosError.response?.data?.message || "เกิดข้อผิดพลาด")
    } finally {
      submittingRef.current = false
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchBookings()
  }, [fetchBookings])

  useEffect(() => {
    if (!showModal) return

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeApprovalModal()
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [showModal])

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
                อนุมัติการจองรถ
              </h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-600">
                ตรวจสอบคำขอจองรถก่อนตัดสินใจอนุมัติหรือปฏิเสธ พร้อมบันทึกเหตุผลเมื่อจำเป็น
              </p>
            </div>

            <div
              className="flex flex-wrap gap-2"
              role="tablist"
              aria-label="กรองสถานะการจอง"
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

        {/* Success Message */}
        {success && (
          <div
            role="status"
            className="mb-4 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800"
          >
            {success}
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div
            role="alert"
            aria-live="polite"
            className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"
          >
            {error}
          </div>
        )}

        {/* Bookings Table */}
        <section
          className="overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-gray-200"
          aria-labelledby="approval-table-title"
        >
          <div className="border-b border-gray-200 px-6 py-4">
            <h2
              id="approval-table-title"
              className="text-lg font-semibold text-gray-950"
            >
              รายการ{getBookingStatusText(selectedStatus)}
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
                    ผู้จอง
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-600">
                    รถ
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-600">
                    ช่วงเวลา
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
                {loading && bookings.length === 0 ? (
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
                      ไม่พบข้อมูลการจองในสถานะนี้
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
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700">
                        <div>เริ่ม: {formatDateTime(booking.startDate)}</div>
                        <div className="mt-1">
                          สิ้นสุด: {formatDateTime(booking.endDate)}
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
                        {booking.status === "REJECTED" &&
                          booking.rejectionReason && (
                            <div
                              className="mt-1 max-w-xs truncate text-sm text-red-700"
                              title={booking.rejectionReason}
                            >
                              เหตุผล: {booking.rejectionReason}
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
                        {booking.status === "PENDING" ? (
                          <div className="flex justify-end gap-2">
                            <button
                              type="button"
                              onClick={() =>
                                openApprovalModal(booking, "APPROVED")
                              }
                              disabled={loading}
                              className="inline-flex min-h-10 items-center gap-1.5 rounded-lg bg-green-50 px-3.5 py-2 text-sm font-medium text-green-700 transition-colors duration-150 hover:bg-green-100 focus:outline-none focus:ring-2 focus:ring-green-600/25 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                              <Check className="h-4 w-4" aria-hidden="true" />
                              อนุมัติ
                            </button>
                            <button
                              type="button"
                              onClick={() =>
                                openApprovalModal(booking, "REJECTED")
                              }
                              disabled={loading}
                              className="inline-flex min-h-10 items-center gap-1.5 rounded-lg bg-red-50 px-3.5 py-2 text-sm font-medium text-red-700 transition-colors duration-150 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-red-600/25 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                              <X className="h-4 w-4" aria-hidden="true" />
                              ปฏิเสธ
                            </button>
                          </div>
                        ) : (
                          <p className="text-right text-sm text-gray-600">
                            {booking.approver
                              ? `ดำเนินการโดย ${booking.approver.name}`
                              : "ดำเนินการแล้ว"}
                          </p>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>

        {/* Approval Modal */}
        {showModal && selectedBooking && (
          <div
            className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-gray-900/50 px-4 py-8"
            role="dialog"
            aria-modal="true"
            aria-labelledby="approval-modal-title"
          >
            <div className="w-full max-w-lg rounded-xl bg-white shadow-lg ring-1 ring-gray-200">
              <div className="flex items-start justify-between gap-4 border-b border-gray-200 px-6 py-5">
                <div>
                  <h3
                    id="approval-modal-title"
                    className="text-lg font-semibold text-gray-950"
                  >
                    {actionType === "APPROVED"
                      ? "ยืนยันการอนุมัติ"
                      : "ยืนยันการปฏิเสธ"}
                  </h3>
                  <p className="mt-1 text-sm text-gray-600">
                    ตรวจสอบรายละเอียดก่อนบันทึกผลการพิจารณา
                  </p>
                </div>
                <button
                  type="button"
                  onClick={closeApprovalModal}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-md text-gray-500 transition-colors duration-150 hover:bg-gray-100 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-600/25"
                  aria-label="ปิดหน้าต่าง"
                >
                  <X className="h-5 w-5" aria-hidden="true" />
                </button>
              </div>

              <form onSubmit={submitApproval} className="space-y-5 px-6 py-6">
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
                        {selectedBooking.vehicle.plateNumber} (
                        {selectedBooking.vehicle.type.name})
                      </dd>
                    </div>
                    <div>
                      <dt className="font-medium text-gray-600">ช่วงเวลา</dt>
                      <dd className="mt-1 text-gray-950">
                        {formatDateTime(selectedBooking.startDate)} -{" "}
                        {formatDateTime(selectedBooking.endDate)}
                      </dd>
                    </div>
                    <div>
                      <dt className="font-medium text-gray-600">
                        วัตถุประสงค์
                      </dt>
                      <dd className="mt-1 text-gray-950">
                        {selectedBooking.purpose}
                      </dd>
                    </div>
                    {selectedBooking.destination && (
                      <div>
                        <dt className="font-medium text-gray-600">ปลายทาง</dt>
                        <dd className="mt-1 text-gray-950">
                          {selectedBooking.destination}
                        </dd>
                      </div>
                    )}
                  </dl>
                </div>

                <div>
                  <label
                    htmlFor="approval-comment"
                    className="mb-1.5 block text-sm font-medium text-gray-700"
                  >
                    {actionType === "APPROVED"
                      ? "หมายเหตุ (ไม่บังคับ)"
                      : "เหตุผลที่ปฏิเสธ (บังคับ)"}
                  </label>
                  <textarea
                    id="approval-comment"
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    required={actionType === "REJECTED"}
                    className="min-h-28 w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-gray-950 transition-colors duration-150 placeholder:text-gray-500 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600/25"
                    rows={4}
                    placeholder={
                      actionType === "APPROVED"
                        ? "เพิ่มหมายเหตุสำหรับผู้จอง"
                        : "ระบุเหตุผลเพื่อให้ผู้จองแก้ไขคำขอได้"
                    }
                  />
                </div>

                <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                  <button
                    type="button"
                    onClick={closeApprovalModal}
                    className="inline-flex min-h-11 items-center justify-center rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 transition-colors duration-150 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-600/25"
                  >
                    ยกเลิก
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-white transition-colors duration-150 focus:outline-none focus:ring-2 disabled:cursor-not-allowed disabled:opacity-60 ${
                      actionType === "APPROVED"
                        ? "bg-green-600 hover:bg-green-700 focus:ring-green-600/25"
                        : "bg-red-600 hover:bg-red-700 focus:ring-red-600/25"
                    }`}
                  >
                    {actionType === "APPROVED" ? (
                      <Check className="h-4 w-4" aria-hidden="true" />
                    ) : (
                      <X className="h-4 w-4" aria-hidden="true" />
                    )}
                    {loading
                      ? "กำลังดำเนินการ..."
                      : actionType === "APPROVED"
                        ? "ยืนยันการอนุมัติ"
                        : "ยืนยันการปฏิเสธ"}
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
