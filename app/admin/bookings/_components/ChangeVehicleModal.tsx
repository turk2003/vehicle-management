import type { FormEvent } from "react"
import { RefreshCw, X } from "lucide-react"
import { formatDateTime } from "@/lib/format"
import type { Booking, ReplacementVehicle } from "../types"

type ChangeVehicleModalProps = {
  booking: Booking
  candidates: ReplacementVehicle[]
  selectedVehicleId: string
  reason: string
  loading: boolean
  error: string
  onVehicleChange: (vehicleId: string) => void
  onReasonChange: (reason: string) => void
  onClose: () => void
  onSubmit: (event: FormEvent) => void
}

export default function ChangeVehicleModal({
  booking,
  candidates,
  selectedVehicleId,
  reason,
  loading,
  error,
  onVehicleChange,
  onReasonChange,
  onClose,
  onSubmit,
}: ChangeVehicleModalProps) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-gray-900/50 px-4 py-8"
      role="dialog"
      aria-modal="true"
      aria-labelledby="change-vehicle-modal-title"
    >
      <div className="w-full max-w-2xl rounded-xl bg-white shadow-lg">
        <div className="flex items-start justify-between gap-4 border-b border-gray-200 px-6 py-5">
          <div>
            <h3
              id="change-vehicle-modal-title"
              className="text-lg font-semibold text-gray-950"
            >
              เปลี่ยนรถกรณีฉุกเฉิน
            </h3>
            <p className="mt-1 text-sm leading-6 text-gray-600">
              เลือกรถที่ว่างตลอดช่วงการจอง ระบบจะแจ้งผู้จองทั้งในระบบและทางอีเมล
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
          <dl className="grid gap-4 rounded-lg bg-orange-50 p-4 text-sm sm:grid-cols-2">
            <div>
              <dt className="font-medium text-orange-900">ผู้จอง</dt>
              <dd className="mt-1 text-gray-950">
                {booking.user.name}
              </dd>
            </div>
            <div>
              <dt className="font-medium text-orange-900">รถเดิม</dt>
              <dd className="mt-1 text-gray-950">
                {booking.vehicle.plateNumber} (
                {booking.vehicle.type.name})
              </dd>
            </div>
            <div className="sm:col-span-2">
              <dt className="font-medium text-orange-900">ช่วงการจอง</dt>
              <dd className="mt-1 text-gray-950">
                {formatDateTime(booking.startDate)} –{" "}
                {formatDateTime(booking.endDate)}
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
              htmlFor="replacement-vehicle"
              className="mb-1.5 block text-sm font-medium text-gray-700"
            >
              รถทดแทน
            </label>
            {loading && candidates.length === 0 ? (
              <div className="space-y-2" aria-label="กำลังโหลดรถทดแทน">
                <div className="h-11 animate-pulse rounded-lg bg-gray-200" />
                <div className="h-4 w-2/3 animate-pulse rounded bg-gray-100" />
              </div>
            ) : candidates.length === 0 ? (
              <div className="rounded-lg border border-gray-200 bg-gray-50 px-4 py-5 text-center">
                <p className="text-sm font-medium text-gray-800">
                  ไม่มีรถทดแทนที่ว่างในช่วงเวลานี้
                </p>
                <p className="mt-1 text-sm text-gray-600">
                  ตรวจสอบช่วงเวลา หรือจัดการตารางรถก่อนลองใหม่
                </p>
              </div>
            ) : (
              <>
                <select
                  id="replacement-vehicle"
                  value={selectedVehicleId}
                  onChange={(event) =>
                    onVehicleChange(event.target.value)
                  }
                  required
                  className="min-h-11 w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-gray-950 transition-colors duration-150 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600/25"
                >
                  <option value="">เลือกรถทดแทน</option>
                  {candidates.map((vehicle) => (
                    <option key={vehicle.id} value={vehicle.id}>
                      {vehicle.recommended ? "แนะนำ — " : ""}
                      {vehicle.plateNumber} ({vehicle.type.name}) ·{" "}
                      {vehicle.currentMileage.toLocaleString()} km
                      {!vehicle.sameType ? " · ต่างประเภท" : ""}
                    </option>
                  ))}
                </select>
                <p className="mt-1.5 text-sm text-gray-600">
                  ระบบเรียงรถประเภทเดียวกันก่อน และตรวจสอบการจองกับงานซ่อมที่ทับช่วงเวลาแล้ว
                </p>
              </>
            )}
          </div>

          <div>
            <label
              htmlFor="change-reason"
              className="mb-1.5 block text-sm font-medium text-gray-700"
            >
              เหตุผลในการเปลี่ยนรถ
            </label>
            <textarea
              id="change-reason"
              value={reason}
              onChange={(event) => onReasonChange(event.target.value)}
              maxLength={500}
              rows={4}
              required
              placeholder="เช่น รถเดิมระบบเบรกขัดข้องและต้องเข้าซ่อมฉุกเฉิน"
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-gray-950 placeholder:text-gray-500 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600/25"
            />
            <p className="mt-1 text-right text-sm text-gray-500">
              {reason.length}/500
            </p>
          </div>

          <div className="flex flex-col-reverse gap-3 border-t border-gray-200 pt-5 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={onClose}
              className="inline-flex min-h-11 items-center justify-center rounded-lg bg-gray-100 px-4 py-2.5 text-sm font-medium text-gray-700 transition-colors duration-150 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-600/25"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              disabled={
                loading ||
                !selectedVehicleId ||
                !reason.trim()
              }
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-orange-600 px-4 py-2.5 text-sm font-medium text-white transition-colors duration-150 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-600 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <RefreshCw className="h-4 w-4" aria-hidden="true" />
              {loading ? "กำลังเปลี่ยนรถ..." : "ยืนยันเปลี่ยนรถ"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
