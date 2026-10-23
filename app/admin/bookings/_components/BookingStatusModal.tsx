import type { FormEvent } from "react"
import { X } from "lucide-react"
import { getBookingStatusColor, getBookingStatusText } from "@/lib/format"
import { STATUS_UPDATE_OPTIONS } from "../constants"
import type { Booking } from "../types"

type BookingStatusModalProps = {
  booking: Booking
  status: string
  loading: boolean
  onStatusChange: (status: string) => void
  onClose: () => void
  onSubmit: (event: FormEvent) => void
}

export default function BookingStatusModal({
  booking,
  status,
  loading,
  onStatusChange,
  onClose,
  onSubmit,
}: BookingStatusModalProps) {
  return (
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
            onClick={onClose}
            className="inline-flex h-9 w-9 items-center justify-center rounded-md text-gray-500 transition-colors duration-150 hover:bg-gray-100 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-600/25"
            aria-label="ปิดหน้าต่าง"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>

        <form onSubmit={onSubmit} className="space-y-5 px-6 py-6">
          <div className="rounded-lg bg-gray-50 p-4 ring-1 ring-gray-200">
            <dl className="grid gap-3 text-sm">
              <div>
                <dt className="font-medium text-gray-600">ผู้จอง</dt>
                <dd className="mt-1 text-gray-950">
                  {booking.user.name}
                </dd>
              </div>
              <div>
                <dt className="font-medium text-gray-600">รถ</dt>
                <dd className="mt-1 text-gray-950">
                  {booking.vehicle.plateNumber}
                </dd>
              </div>
              <div>
                <dt className="font-medium text-gray-600">
                  สถานะปัจจุบัน
                </dt>
                <dd className="mt-1">
                  <span
                    className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${getBookingStatusColor(booking.status)}`}
                  >
                    {getBookingStatusText(booking.status)}
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
              value={status}
              onChange={(e) => onStatusChange(e.target.value)}
              required
              className="min-h-11 w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-gray-950 transition-colors duration-150 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600/25"
            >
              {STATUS_UPDATE_OPTIONS.map((status) => (
                <option key={status.value} value={status.value}>
                  {status.label}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={onClose}
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
  )
}
