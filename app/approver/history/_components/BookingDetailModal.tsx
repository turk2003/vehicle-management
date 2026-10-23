import { X } from "lucide-react"
import { formatDateTime, getBookingStatusColor, getBookingStatusText } from "@/lib/format"
import type { Booking } from "../types"

type BookingDetailModalProps = {
  closeDetailModal: () => void
  selectedBooking: Booking
}

export default function BookingDetailModal({
  closeDetailModal,
  selectedBooking,
}: BookingDetailModalProps) {
  return (
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
  )
}
