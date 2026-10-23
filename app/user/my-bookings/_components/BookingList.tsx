import { CalendarDays, Car, Eye, Gauge, Pencil, Trash2, Undo2 } from "lucide-react"
import { formatDateTime, getBookingStatusColor, getBookingStatusText } from "@/lib/format"
import type { Booking } from "../types"
import { getDistance } from "../utils"

type BookingListProps = {
  filteredBookings: Booking[]
  loading: boolean
  bookings: Booking[]
  openDetailModal: (booking: Booking) => void
  canManageOwnBookings: boolean
  openEditModal: (booking: Booking) => void
  cancelBooking: (booking: Booking) => Promise<void>
  openMileageModal: (booking: Booking, modal: "pickup" | "return") => void
}

export default function BookingList({
  filteredBookings,
  loading,
  bookings,
  openDetailModal,
  canManageOwnBookings,
  openEditModal,
  cancelBooking,
  openMileageModal,
}: BookingListProps) {
  return (
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
                    {canManageOwnBookings && booking.status === "PENDING" && (
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
                    {canManageOwnBookings && ["APPROVED", "CHANGED"].includes(booking.status) && (
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
                    {canManageOwnBookings && booking.status === "IN_PROGRESS" && (
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
  )
}
