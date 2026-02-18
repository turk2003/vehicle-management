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
    role: string
  }
  vehicle: {
    id: string
    plateNumber: string
    status: string
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

type User = {
  id: string
  name: string
  email: string
}

type Vehicle = {
  id: string
  plateNumber: string
  type: {
    name: string
  }
}

export default function AdminBookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  
  // Filters
  const [filters, setFilters] = useState({
    status: "",
    userId: "",
    vehicleId: "",
    startDate: "",
    endDate: ""
  })

  // Modal states
  const [showModal, setShowModal] = useState(false)
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null)
  const [newStatus, setNewStatus] = useState("")

  // Statistics
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
    cancelled: 0
  })

  // Fetch all data
  const fetchData = async () => {
    try {
      setLoading(true)
      
      // Build query params
      const params = new URLSearchParams()
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value)
      })

      const [bookingsRes, usersRes, vehiclesRes] = await Promise.all([
        api.get(`/api/admin/bookings?${params.toString()}`),
        api.get('/api/user'),
        api.get('/api/verhicle')
      ])

      setBookings(bookingsRes.data)
      setUsers(usersRes.data)
      setVehicles(vehiclesRes.data)

      // Calculate stats
      const bookingStats = bookingsRes.data.reduce((acc: any, booking: Booking) => {
        acc.total++
        acc[booking.status.toLowerCase()]++
        return acc
      }, { total: 0, pending: 0, approved: 0, rejected: 0, cancelled: 0 })

      setStats(bookingStats)
    } catch (error: any) {
      setError("ไม่สามารถโหลดข้อมูลได้")
      console.error("Fetch data error:", error)
    } finally {
      setLoading(false)
    }
  }

  // Update booking status
  const updateBookingStatus = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedBooking || !newStatus) return

    try {
      setLoading(true)
      setError("")

      await api.put("/api/admin/bookings", {
        id: selectedBooking.id,
        status: newStatus
      })

      setSuccess(`การจองได้รับการอัพเดทเป็น ${getStatusText(newStatus)} แล้ว`)
      setShowModal(false)
      setSelectedBooking(null)
      setNewStatus("")
      fetchData() // Refresh data
    } catch (error: any) {
      setError(error.response?.data?.message || "เกิดข้อผิดพลาด")
    } finally {
      setLoading(false)
    }
  }

  // Delete booking
  const deleteBooking = async (booking: Booking) => {
    if (!confirm(`คุณแน่ใจที่จะลบการจองของ ${booking.user.name} หรือไม่?`)) return

    try {
      setLoading(true)
      await api.delete(`/api/admin/bookings?id=${booking.id}`)
      setSuccess("ลบการจองเรียบร้อยแล้ว")
      fetchData()
    } catch (error: any) {
      setError(error.response?.data?.message || "ไม่สามารถลบการจองได้")
    } finally {
      setLoading(false)
    }
  }

  // Open status modal
  const openStatusModal = (booking: Booking) => {
    setSelectedBooking(booking)
    setNewStatus(booking.status)
    setShowModal(true)
  }

  // Helper functions
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

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }))
  }

  useEffect(() => {
    fetchData()
  }, [filters])

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto text-gray-700">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">จัดการการจอง</h1>
          
          {/* Statistics Cards */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
            <div className="bg-white p-4 rounded-lg shadow">
              <h3 className="text-sm font-medium text-gray-500">ทั้งหมด</h3>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow">
              <h3 className="text-sm font-medium text-gray-500">รออนุมัติ</h3>
              <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow">
              <h3 className="text-sm font-medium text-gray-500">อนุมัติแล้ว</h3>
              <p className="text-2xl font-bold text-green-600">{stats.approved}</p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow">
              <h3 className="text-sm font-medium text-gray-500">ปฏิเสธ</h3>
              <p className="text-2xl font-bold text-red-600">{stats.rejected}</p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow">
              <h3 className="text-sm font-medium text-gray-500">ยกเลิก</h3>
              <p className="text-2xl font-bold text-gray-600">{stats.cancelled}</p>
            </div>
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

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">กรองข้อมูล</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                สถานะ
              </label>
              <select
                value={filters.status}
                onChange={(e) => handleFilterChange('status', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">ทุกสถานะ</option>
                <option value="PENDING">รออนุมัติ</option>
                <option value="APPROVED">อนุมัติแล้ว</option>
                <option value="REJECTED">ปฏิเสธ</option>
                <option value="CANCELLED">ยกเลิก</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                ผู้จอง
              </label>
              <select
                value={filters.userId}
                onChange={(e) => handleFilterChange('userId', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">ทุกคน</option>
                {users.map(user => (
                  <option key={user.id} value={user.id}>{user.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                รถ
              </label>
              <select
                value={filters.vehicleId}
                onChange={(e) => handleFilterChange('vehicleId', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">ทุกคัน</option>
                {vehicles.map(vehicle => (
                  <option key={vehicle.id} value={vehicle.id}>
                    {vehicle.plateNumber} ({vehicle.type.name})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                วันที่เริ่ม
              </label>
              <input
                type="date"
                value={filters.startDate}
                onChange={(e) => handleFilterChange('startDate', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                วันที่สิ้นสุด
              </label>
              <input
                type="date"
                value={filters.endDate}
                onChange={(e) => handleFilterChange('endDate', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="mt-4 flex justify-end">
            <button
              onClick={() => setFilters({
                status: "",
                userId: "",
                vehicleId: "",
                startDate: "",
                endDate: ""
              })}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
            >
              ล้างตัวกรอง
            </button>
          </div>
        </div>

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
                  ผู้อนุมัติ
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  การดำเนินการ
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading && bookings.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-4 text-center text-gray-500">
                    กำลังโหลด...
                  </td>
                </tr>
              ) : bookings.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-4 text-center text-gray-500">
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
                        <div className="text-xs text-gray-400">
                          {booking.user.role}
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
                        <div className="text-xs text-gray-400">
                          {booking.vehicle.status}
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
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {booking.approver ? booking.approver.name : "-"}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => openStatusModal(booking)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          แก้ไข
                        </button>
                        <button
                          onClick={() => deleteBooking(booking)}
                          className="text-red-600 hover:text-red-900"
                        >
                          ลบ
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Status Update Modal */}
        {showModal && selectedBooking && (
          <div className="fixed inset-0 bg-gray-600/50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
              <div className="mt-3">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  แก้ไขสถานะการจอง
                </h3>
                
                <form onSubmit={updateBookingStatus}>
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
                      สถานะใหม่
                    </label>
                    <select
                      value={newStatus}
                      onChange={(e) => setNewStatus(e.target.value)}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="PENDING">รออนุมัติ</option>
                      <option value="APPROVED">อนุมัติแล้ว</option>
                      <option value="REJECTED">ปฏิเสธ</option>
                      <option value="CANCELLED">ยกเลิก</option>
                    </select>
                  </div>

                  <div className="flex justify-end gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        setShowModal(false)
                        setSelectedBooking(null)
                        setNewStatus("")
                      }}
                      className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
                    >
                      ยกเลิก
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50"
                    >
                      {loading ? "กำลังอัพเดท..." : "บันทึก"}
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