import { formatDateTime, getBookingStatusColor, getBookingStatusText } from "@/lib/format"
import type { Booking } from "../types"
import { getDistance } from "../utils"

export default function BookingDetailPanel({ booking }: { booking: Booking }) {
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
