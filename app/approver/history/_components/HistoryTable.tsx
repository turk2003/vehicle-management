import { Eye } from "lucide-react"
import { formatDateTime, getBookingStatusColor, getBookingStatusText } from "@/lib/format"
import type { Booking } from "../types"

type HistoryTableProps = {
  bookings: Booking[]
  loading: boolean
  viewDetails: (booking: Booking) => void
}

export default function HistoryTable({
  bookings,
  loading,
  viewDetails,
}: HistoryTableProps) {
  return (
    <section
      className="overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-gray-200"
      aria-labelledby="history-table-title"
    >
      <div className="border-b border-gray-200 px-6 py-4">
        <h2
          id="history-table-title"
          className="text-lg font-semibold text-gray-950"
        >
          รายการประวัติ
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
                วันที่พิจารณา
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-600">
                ผู้ขอจอง
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-600">
                รถ
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
            {loading ? (
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
                  ไม่พบประวัติการอนุมัติในเงื่อนไขนี้
                </td>
              </tr>
            ) : (
              bookings.map((booking) => (
                <tr
                  key={booking.id}
                  className="transition-colors duration-150 hover:bg-gray-50"
                >
                  <td className="px-6 py-4 text-sm text-gray-700">
                    {formatDateTime(booking.updatedAt)}
                  </td>
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
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${getBookingStatusColor(booking.status)}`}
                    >
                      {getBookingStatusText(booking.status)}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex justify-end">
                      <button
                        type="button"
                        onClick={() => viewDetails(booking)}
                        className="inline-flex min-h-10 items-center gap-1.5 rounded-lg bg-blue-50 px-3.5 py-2 text-sm font-medium text-blue-700 transition-colors duration-150 hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-600/25"
                      >
                        <Eye className="h-4 w-4" aria-hidden="true" />
                        ดูรายละเอียด
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
  )
}
