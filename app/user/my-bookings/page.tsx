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

export default function MyBookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [selectedStatus, setSelectedStatus] = useState("ALL")
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null)

  // Statistics
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
    cancelled: 0
  })

  // Fetch user's bookings
  const fetchBookings = async () => {
    try {
      setLoading(true)
      setError("")
      const response = await api.get("/api/booking?action=my-bookings")
      setBookings(response.data)

      // Calculate stats
      const bookingStats = response.data.reduce((acc: any, booking: Booking) => {
        acc.total++
        acc[booking.status.toLowerCase()]++
        return acc
      }, { total: 0, pending: 0, approved: 0, rejected: 0, cancelled: 0 })

      setStats(bookingStats)
    } catch (error: any) {
      setError("ไม่สามารถโหลดข้อมูลได้")
      console.error("Fetch bookings error:", error)
    } finally {
      setLoading(false)
    }
  }

  // Cancel booking
  const cancelBooking = async (bookingId: string) => {
    if (!confirm("คุณแน่ใจที่จะยกเลิกการจองนี้หรือไม่?")) return

    try {
      setLoading(true)
      await api.put("/api/booking", {
        id: bookingId,
        status: "CANCELLED"
      })
      fetchBookings() // Refresh
    } catch (error: any) {
      setError("ไม่สามารถยกเลิกการจองได้")
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
        return "ยกเลิกแล้ว"
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

  const filteredBookings = selectedStatus === "ALL" 
    ? bookings 
    : bookings.filter(b => b.status === selectedStatus)

  useEffect(() => {
    fetchBookings()
  }, [])

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">ประวัติการจอง</h1>
          <p className="text-gray-600">ดูประวัติการจองรถทั้งหมดของคุณ</p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        {/* Statistics Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
          <div 
            className={`bg-white p-4 rounded-lg shadow cursor-pointer hover:shadow-md transition-shadow ${selectedStatus === "ALL" ? "ring-2 ring-blue-500" : ""}`}
            onClick={() => setSelectedStatus("ALL")}
          >
            <h3 className="text-sm font-medium text-gray-500">ทั้งหมด</h3>
            <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
          </div>
          <div 
            className={`bg-white p-4 rounded-lg shadow cursor-pointer hover:shadow-md transition-shadow ${selectedStatus === "PENDING" ? "ring-2 ring-yellow-500" : ""}`}
            onClick={() => setSelectedStatus("PENDING")}
          >
            <h3 className="text-sm font-medium text-gray-500">รออนุมัติ</h3>
            <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
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
            <h3 className="text-sm font-medium text-gray-500">ปฏิเสธ</h3>
            <p className="text-2xl font-bold text-red-600">{stats.rejected}</p>
          </div>
          <div 
            className={`bg-white p-4 rounded-lg shadow cursor-pointer hover:shadow-md transition-shadow ${selectedStatus === "CANCELLED" ? "ring-2 ring-gray-500" : ""}`}
            onClick={() => setSelectedStatus("CANCELLED")}
          >
            <h3 className="text-sm font-medium text-gray-500">ยกเลิก</h3>
            <p className="text-2xl font-bold text-gray-600">{stats.cancelled}</p>
          </div>
        </div>

        {/* Bookings List */}
        <div className="space-y-4">
          {loading ? (
            <div className="text-center py-8 text-gray-500">กำลังโหลด...</div>
          ) : filteredBookings.length === 0 ? (
            <div className="text-center py-8 text-gray-500">ไม่พบข้อมูลการจอง</div>
          ) : (
            filteredBookings.map((booking) => (
              <div key={booking.id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {booking.vehicle.plateNumber}
                      </h3>
                      <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${getStatusColor(booking.status)}`}>
                        {getStatusText(booking.status)}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                      <div>
                        <p className="text-sm text-gray-600">ประเภทรถ</p>
                        <p className="text-gray-900 font-medium">{booking.vehicle.type.name}</p>
                      </div>
                      
                      <div>
                        <p className="text-sm text-gray-600">วันที่จอง</p>
                        <p className="text-gray-900 font-medium">{formatDateTime(booking.createdAt)}</p>
                      </div>
                      
                      <div>
                        <p className="text-sm text-gray-600">เริ่มใช้รถ</p>
                        <p className="text-gray-900 font-medium">{formatDateTime(booking.startDate)}</p>
                      </div>
                      
                      <div>
                        <p className="text-sm text-gray-600">คืนรถ</p>
                        <p className="text-gray-900 font-medium">{formatDateTime(booking.endDate)}</p>
                      </div>
                      
                      <div className="md:col-span-2">
                        <p className="text-sm text-gray-600">วัตถุประสงค์</p>
                        <p className="text-gray-900">{booking.purpose}</p>
                      </div>
                      
                      {booking.destination && (
                        <div className="md:col-span-2">
                          <p className="text-sm text-gray-600">ปลายทาง</p>
                          <p className="text-gray-900">{booking.destination}</p>
                        </div>
                      )}
                      
                      {booking.approver && (
                        <div className="md:col-span-2">
                          <p className="text-sm text-gray-600">ผู้อนุมัติ</p>
                          <p className="text-gray-900">{booking.approver.name}</p>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex flex-col gap-2 ml-4">
                    <button
                      onClick={() => viewDetails(booking)}
                      className="px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-md hover:bg-blue-100"
                    >
                      ดูรายละเอียด
                    </button>
                    
                    {booking.status === "PENDING" && (
                      <button
                        onClick={() => cancelBooking(booking.id)}
                        disabled={loading}
                        className="px-4 py-2 text-sm font-medium text-red-600 bg-red-50 rounded-md hover:bg-red-100 disabled:opacity-50"
                      >
                        ยกเลิก
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Detail Modal */}
        {showDetailModal && selectedBooking && (
          <div className="fixed inset-0 bg-gray-600/50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-full max-w-2xl shadow-lg rounded-md bg-white">
              <div className="mt-3">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-xl font-semibold text-gray-900">
                    รายละเอียดการจอง
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
                      <p className="text-sm font-medium text-gray-500">วันที่จอง</p>
                      <p className="text-gray-900">{formatDateTime(selectedBooking.createdAt)}</p>
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
                    <h4 className="text-lg font-semibold text-gray-900 mb-3">รายละเอียดการใช้งาน</h4>
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
                  
                  {selectedBooking.approver && (
                    <>
                      <hr />
                      <div>
                        <h4 className="text-lg font-semibold text-gray-900 mb-3">ผู้อนุมัติ</h4>
                        <div className="space-y-1">
                          <p className="text-gray-900">{selectedBooking.approver.name}</p>
                          <p className="text-sm text-gray-500">{selectedBooking.approver.email}</p>
                        </div>
                      </div>
                    </>
                  )}
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