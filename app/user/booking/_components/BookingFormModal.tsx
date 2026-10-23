import { CheckCircle2, X } from "lucide-react"
import { formatDateTime } from "@/lib/format"
import type * as React from "react"
import type { Dispatch, SetStateAction } from "react"
import type { Vehicle, BookingData, SearchDate } from "../types"

type BookingFormModalProps = {
  closeBookingForm: () => void
  submitBooking: (e: React.FormEvent) => Promise<void>
  selectedVehicle: Vehicle
  searchDate: SearchDate
  bookingData: BookingData
  setBookingData: Dispatch<SetStateAction<BookingData>>
  loading: boolean
}

export default function BookingFormModal({
  closeBookingForm,
  submitBooking,
  selectedVehicle,
  searchDate,
  bookingData,
  setBookingData,
  loading,
}: BookingFormModalProps) {
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
              ยืนยันคำขอจองรถ
            </h3>
            <p className="mt-1 text-sm text-gray-600">
              ตรวจสอบข้อมูลและระบุวัตถุประสงค์ก่อนส่งคำขอ
            </p>
          </div>
          <button
            type="button"
            onClick={closeBookingForm}
            className="inline-flex h-9 w-9 items-center justify-center rounded-md text-gray-500 transition-colors duration-150 hover:bg-gray-100 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-600/25"
            aria-label="ปิดหน้าต่าง"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>

        <form onSubmit={submitBooking} className="space-y-5 px-6 py-6">
          <div className="rounded-lg bg-gray-50 p-4 ring-1 ring-gray-200">
            <dl className="grid gap-3 text-sm sm:grid-cols-2">
              <div>
                <dt className="font-medium text-gray-600">รถที่เลือก</dt>
                <dd className="mt-1 text-gray-950">
                  {selectedVehicle.plateNumber}
                </dd>
              </div>
              <div>
                <dt className="font-medium text-gray-600">ประเภทรถ</dt>
                <dd className="mt-1 text-gray-950">
                  {selectedVehicle.type.name}
                </dd>
              </div>
              <div>
                <dt className="font-medium text-gray-600">เลขไมล์</dt>
                <dd className="mt-1 text-gray-950">
                  {selectedVehicle.currentMileage.toLocaleString()} km
                </dd>
              </div>
              <div>
                <dt className="font-medium text-gray-600">สถานะ</dt>
                <dd className="mt-1">
                  <span className="inline-flex rounded-full bg-green-100 px-2.5 py-1 text-xs font-semibold text-green-800">
                    {selectedVehicle.recommended ? "แนะนำ" : "ว่าง"}
                  </span>
                </dd>
              </div>
              <div className="sm:col-span-2">
                <dt className="font-medium text-gray-600">ช่วงเวลา</dt>
                <dd className="mt-1 text-gray-950">
                  {formatDateTime(searchDate.startDate)} -{" "}
                  {formatDateTime(searchDate.endDate)}
                </dd>
              </div>
            </dl>
          </div>

          <div>
            <label
              htmlFor="booking-purpose"
              className="mb-1.5 block text-sm font-medium text-gray-700"
            >
              วัตถุประสงค์ <span className="text-red-700">*</span>
            </label>
            <input
              id="booking-purpose"
              type="text"
              required
              value={bookingData.purpose}
              onChange={(e) =>
                setBookingData((current) => ({
                  ...current,
                  purpose: e.target.value,
                }))
              }
              className="min-h-11 w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-gray-950 transition-colors duration-150 placeholder:text-gray-500 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600/25"
              placeholder="เช่น ประชุมลูกค้า, ไปส่งเอกสาร"
            />
          </div>

          <div>
            <label
              htmlFor="booking-destination"
              className="mb-1.5 block text-sm font-medium text-gray-700"
            >
              ปลายทาง (ไม่บังคับ)
            </label>
            <input
              id="booking-destination"
              type="text"
              maxLength={255}
              value={bookingData.destination}
              onChange={(e) =>
                setBookingData((current) => ({
                  ...current,
                  destination: e.target.value,
                }))
              }
              className="min-h-11 w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-gray-950 transition-colors duration-150 placeholder:text-gray-500 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600/25"
              placeholder="เช่น สำนักงานเขต, สถานีไฟฟ้า"
            />
          </div>

          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={closeBookingForm}
              className="inline-flex min-h-11 items-center justify-center rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 transition-colors duration-150 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-600/25"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors duration-150 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-600/25 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
              {loading ? "กำลังส่งคำขอ..." : "ยืนยันการจอง"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
