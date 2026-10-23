import { Gauge, Pencil, RefreshCw, Trash2 } from "lucide-react"
import {
  formatDateTime,
  getBookingStatusColor,
  getBookingStatusText,
  getVehicleStatusColor,
  getVehicleStatusText,
} from "@/lib/format"
import type { Booking, MileageAction } from "../types"

type BookingTableProps = {
  bookings: Booking[]
  loading: boolean
  canManageBookings: boolean
  canDeleteBookings: boolean
  onChangeVehicle: (booking: Booking) => void
  onMileageAction: (booking: Booking, action: MileageAction) => void
  onEditStatus: (booking: Booking) => void
  onDelete: (booking: Booking) => void
}

export default function BookingTable({
  bookings,
  loading,
  canManageBookings,
  canDeleteBookings,
  onChangeVehicle,
  onMileageAction,
  onEditStatus,
  onDelete,
}: BookingTableProps) {
  return (
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
                    <div className="flex flex-wrap justify-end gap-2">
                      {canManageBookings &&
                        ["APPROVED", "CHANGED"].includes(booking.status) &&
                        !booking.pickedUpAt &&
                        booking.vehicle.status === "MAINTENANCE" &&
                        new Date(booking.endDate) >= new Date() && (
                          <button
                            type="button"
                            onClick={() => onChangeVehicle(booking)}
                            className="inline-flex min-h-9 items-center gap-1.5 rounded-md bg-orange-50 px-3 py-1.5 text-sm font-medium text-orange-800 transition-colors duration-150 hover:bg-orange-100 focus:outline-none focus:ring-2 focus:ring-orange-600/25"
                          >
                            <RefreshCw
                              className="h-4 w-4"
                              aria-hidden="true"
                            />
                            เปลี่ยนรถ
                          </button>
                        )}
                      {canManageBookings &&
                        ["APPROVED", "CHANGED"].includes(booking.status) &&
                        booking.vehicle.status !== "MAINTENANCE" && (
                          <button
                            type="button"
                            onClick={() => onMileageAction(booking, "pickup")}
                            className="inline-flex min-h-9 items-center gap-1.5 rounded-md bg-emerald-50 px-3 py-1.5 text-sm font-medium text-emerald-700 transition-colors duration-150 hover:bg-emerald-100 focus:outline-none focus:ring-2 focus:ring-emerald-600/25"
                          >
                            <Gauge className="h-4 w-4" aria-hidden="true" />
                            รับรถแทนผู้ใช้
                          </button>
                        )}
                      {canManageBookings && booking.status === "IN_PROGRESS" && (
                        <button
                          type="button"
                          onClick={() => onMileageAction(booking, "return")}
                          className="inline-flex min-h-9 items-center gap-1.5 rounded-md bg-indigo-50 px-3 py-1.5 text-sm font-medium text-indigo-700 transition-colors duration-150 hover:bg-indigo-100 focus:outline-none focus:ring-2 focus:ring-indigo-600/25"
                        >
                          <Gauge className="h-4 w-4" aria-hidden="true" />
                          คืนรถแทนผู้ใช้
                        </button>
                      )}
                      {canManageBookings &&
                        !["IN_PROGRESS", "COMPLETED"].includes(
                          booking.status,
                        ) && (
                        <button
                          type="button"
                          onClick={() => onEditStatus(booking)}
                          className="inline-flex min-h-9 items-center gap-1.5 rounded-md bg-blue-50 px-3 py-1.5 text-sm font-medium text-blue-700 transition-colors duration-150 hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-600/25"
                        >
                          <Pencil className="h-4 w-4" aria-hidden="true" />
                          แก้ไข
                        </button>
                      )}
                      {canDeleteBookings && (
                        <button
                          type="button"
                          onClick={() => onDelete(booking)}
                          disabled={loading}
                          className="inline-flex min-h-9 items-center gap-1.5 rounded-md bg-red-50 px-3 py-1.5 text-sm font-medium text-red-700 transition-colors duration-150 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-red-600/25 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          <Trash2 className="h-4 w-4" aria-hidden="true" />
                          ลบ
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </section>
  )
}
