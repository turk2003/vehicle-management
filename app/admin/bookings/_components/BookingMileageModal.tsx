import type { FormEvent } from "react"
import { Gauge, X } from "lucide-react"
import type { Booking, MileageAction } from "../types"

type BookingMileageModalProps = {
  booking: Booking
  action: MileageAction
  value: string
  loading: boolean
  error: string
  onValueChange: (value: string) => void
  onClose: () => void
  onSubmit: (event: FormEvent) => void
}

export default function BookingMileageModal({
  booking,
  action,
  value,
  loading,
  error,
  onValueChange,
  onClose,
  onSubmit,
}: BookingMileageModalProps) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-gray-900/50 px-4 py-8"
      role="dialog"
      aria-modal="true"
      aria-labelledby="mileage-modal-title"
    >
      <div className="w-full max-w-lg rounded-xl bg-white shadow-lg ring-1 ring-gray-200">
        <div className="flex items-start justify-between gap-4 border-b border-gray-200 px-6 py-5">
          <div>
            <h3
              id="mileage-modal-title"
              className="text-lg font-semibold text-gray-950"
            >
              {action === "pickup"
                ? "บันทึกรับรถแทนผู้ใช้"
                : "บันทึกคืนรถแทนผู้ใช้"}
            </h3>
            <p className="mt-1 text-sm text-gray-600">
              ระบบจะบันทึกเวลา อัปเดทสถานะการจอง และแจ้งผู้จอง
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="inline-flex h-9 w-9 items-center justify-center rounded-md text-gray-500 transition-colors duration-150 hover:bg-gray-100 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-600/25 disabled:opacity-60"
            aria-label="ปิดหน้าต่าง"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>

        <form onSubmit={onSubmit} className="space-y-5 px-6 py-6">
          <dl className="grid gap-3 rounded-lg bg-gray-50 p-4 text-sm ring-1 ring-gray-200 sm:grid-cols-2">
            <div>
              <dt className="font-medium text-gray-600">ผู้ใช้รถ</dt>
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
            <div className="sm:col-span-2">
              <dt className="font-medium text-gray-600">
                {action === "pickup"
                  ? "เลขไมล์ปัจจุบันของรถ"
                  : "เลขไมล์ตอนรับรถ"}
              </dt>
              <dd className="mt-1 font-semibold text-gray-950">
                {(action === "pickup"
                  ? booking.vehicle.currentMileage
                  : booking.mileageStart ?? 0
                ).toLocaleString()} km
              </dd>
            </div>
          </dl>

          {error && (
            <div
              role="alert"
              className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"
            >
              {error}
            </div>
          )}

          <div>
            <label
              htmlFor="admin-booking-mileage"
              className="mb-1.5 block text-sm font-medium text-gray-700"
            >
              {action === "pickup"
                ? "เลขไมล์เริ่มต้น"
                : "เลขไมล์สิ้นสุด"}
            </label>
            <input
              id="admin-booking-mileage"
              type="number"
              min={
                action === "pickup"
                  ? booking.vehicle.currentMileage
                  : booking.mileageStart ?? 0
              }
              step="1"
              required
              value={value}
              onChange={(event) => onValueChange(event.target.value)}
              className="min-h-11 w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-gray-950 transition-colors duration-150 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600/25"
            />
            <p className="mt-1.5 text-sm text-gray-600">
              ต้องไม่น้อยกว่าเลขไมล์ที่แสดงด้านบน
            </p>
          </div>

          <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="inline-flex min-h-11 items-center justify-center rounded-lg bg-gray-100 px-4 py-2.5 text-sm font-medium text-gray-700 transition-colors duration-150 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-600/25 disabled:opacity-60"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition-colors duration-150 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Gauge className="h-4 w-4" aria-hidden="true" />
              {loading
                ? "กำลังบันทึก..."
                : action === "pickup"
                  ? "ยืนยันรับรถ"
                  : "ยืนยันคืนรถ"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
