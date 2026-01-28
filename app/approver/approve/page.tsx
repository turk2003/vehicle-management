"use client"

import { useEffect, useState } from "react"
import api from "@/lib/api"

type Booking = {
  id: string
  startDate: string
  endDate: string
  purpose: string
  destination?: string
  status: string
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

export default function ApproverBookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedStatus, setSelectedStatus] = useState("PENDING")
  const [showModal, setShowModal] = useState(false)
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null)
  const [actionType, setActionType] = useState<"APPROVED" | "REJECTED">("APPROVED")
  const [comment, setComment] = useState("")
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  // Fetch bookings
  const fetchBookings = async () => {
    try {
      setLoading(true)
      const response = await api.get(`/api/approver?status=${selectedStatus}`)
      setBookings(response.data)
    } catch (error: any) {
      setError("ไม่สามารถโหลดข้อมูลได้")
      console.error("Fetch bookings error:", error)
    } finally {
      setLoading(false)
    }
  }

  // Open approval modal
  const openApprovalModal = (booking: Booking, action: "APPROVED" | "REJECTED") => {
    setSelectedBooking(booking)
    setActionType(action)
    setComment("")
    setShowModal(true)
  }

  // Submit approval/rejection
  const submitApproval = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedBooking) return

    try {
      setLoading(true)
      setError("")

      await api.put("/api/approver", {
        id: selectedBooking.id,
        action: actionType,
        comment
      })

      setSuccess(`การจองได้รับการ${actionType === "APPROVED" ? "อนุมัติ" : "ปฏิเสธ"}แล้ว`)
      setShowModal(false)
      setSelectedBooking(null)
      fetchBookings() // Refresh bookings
    } catch (error: any) {
      setError(error.response?.data?.message || "เกิดข้อผิดพลาด")
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "PENDING":
        return "bg-yellow-100 text-yellow-800"
      case "APPROVED":
        return "bg-green-100 text-green-800"
      case "REJECTED":
        return "bg-red-100 text-red-800"
      case "CANCELLED":
        return "bg-gray-100 text-gray-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case "PENDING":
        return "รออนุมัติ"
      case "APPROVED":
        return "อนุมัติแล้ว"
      case "REJECTED":
        return "ปฏิเสธ"
      case "CANCELLED":
        return "ยกเลิก"
      default:
        return status
    }
  }

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('th-TH', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  useEffect(() => {
    fetchBookings()
  }, [selectedStatus])

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900">อนุมัติการจองรถ</h1>
          
          {/* Status Filter */}
          <div className="flex space-x-2">
            {["PENDING", "APPROVED", "REJECTED"].map((status) => (
              <button
                key={status}
                onClick={() => setSelectedStatus(status)}
                className={`px-4 py-2 rounded-md font-medium ${
                  selectedStatus === status
                    ? "bg-blue-600 text-white"
                    : "bg-white text-gray-700 hover:bg-gray-50"
                } border`}
              >
                {getStatusText(status)}
              </button>
            ))}
          </div>
        </div>

        {/* Success Message */}
        {success && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-6">
            {success}
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        {/* Bookings Table */}
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ผู้จอง
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  รถ
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ช่วงเวลา
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  วัตถุประสงค์
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  สถานะ
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  การดำเนินการ
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading && bookings.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                    กำลังโหลด...
                  </td>
                </tr>
              ) : bookings.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                    ไม่พบข้อมูลการจอง
                  </td>
                </tr>
              ) : (
                bookings.map((booking) => (
                  <tr key={booking.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {booking.user.name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {booking.user.email}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {booking.vehicle.plateNumber}
                        </div>
                        <div className="text-sm text-gray-500">
                          {booking.vehicle.type.name}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        <div>เริ่ม: {formatDateTime(booking.startDate)}</div>
                        <div>สิ้นสุด: {formatDateTime(booking.endDate)}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 max-w-xs">
                        <div className="truncate" title={booking.purpose}>
                          {booking.purpose}
                        </div>
                        {booking.destination && (
                          <div className="text-xs text-gray-500 truncate" title={booking.destination}>
                            ปลายทาง: {booking.destination}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(booking.status)}`}>
                        {getStatusText(booking.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      {booking.status === "PENDING" ? (
                        <div className="flex space-x-2">
                          <button
                            onClick={() => openApprovalModal(booking, "APPROVED")}
                            className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-xs"
                          >
                            อนุมัติ
                          </button>
                          <button
                            onClick={() => openApprovalModal(booking, "REJECTED")}
                            className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-xs"
                          >
                            ปฏิเสธ
                          </button>
                        </div>
                      ) : (
                        <div className="text-xs text-gray-500">
                          {booking.approver && (
                            <div>อนุมัติโดย: {booking.approver.name}</div>
                          )}
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Approval Modal */}
        {showModal && selectedBooking && (
          <div className="fixed inset-0 bg-gray-600/50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
              <div className="mt-3">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  {actionType === "APPROVED" ? "อนุมัติการจอง" : "ปฏิเสธการจอง"}
                </h3>
                
                <form onSubmit={submitApproval}>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      รายละเอียดการจอง
                    </label>
                    <div className="bg-gray-100 p-3 rounded-md">
                      <p className="text-sm"><strong>ผู้จอง:</strong> {selectedBooking.user.name}</p>
                      <p className="text-sm"><strong>รถ:</strong> {selectedBooking.vehicle.plateNumber}</p>
                      <p className="text-sm"><strong>วัตถุประสงค์:</strong> {selectedBooking.purpose}</p>
                    </div>
                  </div>

                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      หมายเหตุ (ไม่บังคับ)
                    </label>
                    <textarea
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      rows={3}
                      placeholder="เพิ่มหมายเหตุ..."
                    />
                  </div>

                  <div className="flex justify-end gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        setShowModal(false)
                        setSelectedBooking(null)
                      }}
                      className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
                    >
                      ยกเลิก
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className={`px-4 py-2 text-sm font-medium text-white rounded-md disabled:opacity-50 ${
                        actionType === "APPROVED"
                          ? "bg-green-600 hover:bg-green-700"
                          : "bg-red-600 hover:bg-red-700"
                      }`}
                    >
                      {loading ? "กำลังดำเนินการ..." : 
                       actionType === "APPROVED" ? "ยืนยันการอนุมัติ" : "ยืนยันการปฏิเสธ"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}