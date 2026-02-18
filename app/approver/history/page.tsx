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
  updatedAt: string
  user: {
    id: string
    name: string
    email: string
    role: string
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

export default function ApprovalHistoryPage() {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [selectedStatus, setSelectedStatus] = useState("ALL")
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null)
  const [dateFilter, setDateFilter] = useState({
    startDate: "",
    endDate: ""
  })

  // Statistics
  const [stats, setStats] = useState({
    total: 0,
    approved: 0,
    rejected: 0,
    pending: 0
  })

  // Fetch approval history
  const fetchHistory = async () => {
    try {
      setLoading(true)
      setError("")

      // Fetch all non-pending bookings (my approvals)
      const statuses = selectedStatus === "ALL" 
        ? ["APPROVED", "REJECTED"] 
        : [selectedStatus]

      const allBookings = []
      for (const status of statuses) {
        const response = await api.get(`/api/approver?status=${status}`)
        allBookings.push(...response.data)
      }

      // Filter by date if provided
      let filtered = allBookings
      if (dateFilter.startDate && dateFilter.endDate) {
        const start = new Date(dateFilter.startDate)
        const end = new Date(dateFilter.endDate)
        filtered = allBookings.filter((b: Booking) => {
          const updated = new Date(b.updatedAt)
          return updated >= start && updated <= end
        })
      }

      setBookings(filtered)

      // Calculate stats
      const bookingStats = filtered.reduce((acc: any, booking: Booking) => {
        acc.total++
        if (booking.status === "APPROVED") acc.approved++
        if (booking.status === "REJECTED") acc.rejected++
        if (booking.status === "PENDING") acc.pending++
        return acc
      }, { total: 0, approved: 0, rejected: 0, pending: 0 })

      setStats(bookingStats)
    } catch (error: any) {
      setError("ไม่สามารถโหลดข้อมูลได้")
      console.error("Fetch history error:", error)
    } finally {
      setLoading(false)
    }
  }

  // View booking details
  const viewDetails = (booking: Booking) => {
    setSelectedBooking(booking)
    setShowDetailModal(true)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "APPROVED":
        return "bg-green-100 text-green-800"
      case "REJECTED":
        return "bg-red-100 text-red-800"
      case "PENDING":
        return "bg-yellow-100 text-yellow-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case "APPROVED":
        return "อนุมัติแล้ว"
      case "REJECTED":
        return "ปฏิเสธแล้ว"
      case "PENDING":
        return "รออนุมัติ"
      default:
        return status
    }
  }

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('th-TH', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  useEffect(() => {
    fetchHistory()
  }, [selectedStatus, dateFilter])

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">ประวัติการอนุมัติ</h1>
          <p className="text-gray-600">ดูประวัติการอนุมัติคำขอจองรถทั้งหมด</p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        {/* Statistics Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div 
            className={`bg-white p-4 rounded-lg shadow cursor-pointer hover:shadow-md transition-shadow ${selectedStatus === "ALL" ? "ring-2 ring-blue-500" : ""}`}
            onClick={() => setSelectedStatus("ALL")}
          >
            <h3 className="text-sm font-medium text-gray-500">ทั้งหมด</h3>
            <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
          </div>
          <div 
            className={`bg-white p-4 rounded-lg shadow cursor-pointer hover:shadow-md transition-shadow ${selectedStatus === "APPROVED" ? "ring-2 ring-green-500" : ""}`}
            onClick={() => setSelectedStatus("APPROVED")}
          >
            <h3 className="text-sm font-medium text-gray-500">อนุมัติแล้ว</h3>
            <p className="text-2xl font-bold text-green-600">{stats.approved}</p>
          </div>
          <div 
            className={`bg-white p-4 rounded-lg shadow cursor-pointer hover:shadow-md transition-shadow ${selectedStatus === "REJECTED" ? "ring-2 ring-red-500" : ""}`}
            onClick={() => setSelectedStatus("REJECTED")}
          >
            <h3 className="text-sm font-medium text-gray-500">ปฏิเสธแล้ว</h3>
            <p className="text-2xl font-bold text-red-600">{stats.rejected}</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-sm font-medium text-gray-500">อัตราอนุมัติ</h3>
            <p className="text-2xl font-bold text-blue-600">
              {stats.total > 0 ? Math.round((stats.approved / stats.total) * 100) : 0}%
            </p>
          </div>
        </div>

        {/* Date Filter */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">กรองตามวันที่</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                วันที่เริ่มต้น
              </label>
              <input
                type="date"
                value={dateFilter.startDate}
                onChange={(e) => setDateFilter({...dateFilter, startDate: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                วันที่สิ้นสุด
              </label>
              <input
                type="date"
                value={dateFilter.endDate}
                onChange={(e) => setDateFilter({...dateFilter, endDate: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex items-end">
              <button
                onClick={() => setDateFilter({ startDate: "", endDate: "" })}
                className="w-full px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
              >
                ล้างตัวกรอง
              </button>
            </div>
          </div>
        </div>

        {/* History Table */}
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  วันที่อนุมัติ
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ผู้ขอจอง
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  รถ
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
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                    กำลังโหลด...
                  </td>
                </tr>
              ) : bookings.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                    ไม่พบประวัติการอนุมัติ
                  </td>
                </tr>
              ) : (
                bookings.map((booking) => (
                  <tr key={booking.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {formatDateTime(booking.updatedAt)}
                      </div>
                    </td>
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
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 max-w-xs truncate" title={booking.purpose}>
                        {booking.purpose}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(booking.status)}`}>
                        {getStatusText(booking.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => viewDetails(booking)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        ดูรายละเอียด
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Detail Modal */}
        {showDetailModal && selectedBooking && (
          <div className="fixed inset-0 bg-gray-600/50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-full max-w-2xl shadow-lg rounded-md bg-white">
              <div className="mt-3">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-xl font-semibold text-gray-900">
                    รายละเอียดการอนุมัติ
                  </h3>
                  <button
                    onClick={() => setShowDetailModal(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <span className="text-2xl">×</span>
                  </button>
                </div>
                
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium text-gray-500">สถานะ</p>
                      <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${getStatusColor(selectedBooking.status)}`}>
                        {getStatusText(selectedBooking.status)}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">วันที่อนุมัติ</p>
                      <p className="text-gray-900">{formatDateTime(selectedBooking.updatedAt)}</p>
                    </div>
                  </div>
                  
                  <hr />
                  
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-3">ผู้ขอจอง</h4>
                    <div className="space-y-1">
                      <p className="text-gray-900 font-medium">{selectedBooking.user.name}</p>
                      <p className="text-sm text-gray-500">{selectedBooking.user.email}</p>
                      <p className="text-xs text-gray-400">{selectedBooking.user.role}</p>
                    </div>
                  </div>
                  
                  <hr />
                  
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-3">ข้อมูลรถ</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm font-medium text-gray-500">ทะเบียนรถ</p>
                        <p className="text-gray-900">{selectedBooking.vehicle.plateNumber}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500">ประเภทรถ</p>
                        <p className="text-gray-900">{selectedBooking.vehicle.type.name}</p>
                      </div>
                    </div>
                  </div>
                  
                  <hr />
                  
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-3">ระยะเวลาการใช้รถ</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm font-medium text-gray-500">เริ่มใช้รถ</p>
                        <p className="text-gray-900">{formatDateTime(selectedBooking.startDate)}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500">คืนรถ</p>
                        <p className="text-gray-900">{formatDateTime(selectedBooking.endDate)}</p>
                      </div>
                    </div>
                  </div>
                  
                  <hr />
                  
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-3">รายละเอียด</h4>
                    <div className="space-y-2">
                      <div>
                        <p className="text-sm font-medium text-gray-500">วัตถุประสงค์</p>
                        <p className="text-gray-900">{selectedBooking.purpose}</p>
                      </div>
                      {selectedBooking.destination && (
                        <div>
                          <p className="text-sm font-medium text-gray-500">ปลายทาง</p>
                          <p className="text-gray-900">{selectedBooking.destination}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="mt-6 flex justify-end">
                  <button
                    onClick={() => setShowDetailModal(false)}
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
                  >
                    ปิด
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}