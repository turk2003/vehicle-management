"use client"

import { useEffect, useState } from "react"
import api from "@/lib/api"
import { getBookingStatusColor, getBookingStatusText } from "@/lib/format"

type Booking = {
  id: string
  startDate: string
  endDate: string
  purpose: string
  destination?: string
  status: string
  mileageStart?: number | null
  mileageEnd?: number | null
  pickedUpAt?: string | null
  returnedAt?: string | null
  createdAt: string
  user: { id: string; name: string; email: string; role: string }
  vehicle: {
    id: string; plateNumber: string; status: string; currentMileage: number
    type: { id: string; name: string }
  }
  approver?: { id: string; name: string; email: string }
}

type User = { id: string; name: string; email: string }
type Vehicle = { id: string; plateNumber: string; type: { name: string } }

export default function AdminBookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [filters, setFilters] = useState({ status: "", userId: "", vehicleId: "", startDate: "", endDate: "" })

  // Modal states
  const [showModal, setShowModal] = useState(false)
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null)
  const [newStatus, setNewStatus] = useState("")

  const [stats, setStats] = useState({ total: 0, pending: 0, approved: 0, rejected: 0, cancelled: 0, in_progress: 0, completed: 0 })

  const fetchData = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      Object.entries(filters).forEach(([key, value]) => { if (value) params.append(key, value) })

      const [bookingsRes, usersRes, vehiclesRes] = await Promise.all([
        api.get(`/api/admin/bookings?${params.toString()}`),
        api.get('/api/user'),
        api.get('/api/verhicle')
      ])

      setBookings(bookingsRes.data)
      setUsers(usersRes.data)
      setVehicles(vehiclesRes.data)

      const bookingStats = bookingsRes.data.reduce((acc: any, b: Booking) => {
        acc.total++
        acc[b.status.toLowerCase()]++
        return acc
      }, { total: 0, pending: 0, approved: 0, rejected: 0, cancelled: 0, in_progress: 0, completed: 0 })
      setStats(bookingStats)
    } catch {
      setError("ไม่สามารถโหลดข้อมูลได้")
    } finally {
      setLoading(false)
    }
  }

  const updateBookingStatus = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedBooking || !newStatus) return
    try {
      setLoading(true); setError("")
      await api.put("/api/admin/bookings", { id: selectedBooking.id, status: newStatus })
      setSuccess(`การจองได้รับการอัพเดทเป็น ${getBookingStatusText(newStatus)} แล้ว`)
      setShowModal(false); setSelectedBooking(null); setNewStatus("")
      fetchData()
    } catch (error: any) {
      setError(error.response?.data?.message || "เกิดข้อผิดพลาด")
    } finally { setLoading(false) }
  }

  const deleteBooking = async (booking: Booking) => {
    if (!confirm(`คุณแน่ใจที่จะลบการจองของ ${booking.user.name} หรือไม่?`)) return
    try {
      setLoading(true)
      await api.delete(`/api/admin/bookings?id=${booking.id}`)
      setSuccess("ลบการจองเรียบร้อยแล้ว"); fetchData()
    } catch (error: any) {
      setError(error.response?.data?.message || "ไม่สามารถลบการจองได้")
    } finally { setLoading(false) }
  }

  const formatDateTime = (dateString: string) => new Date(dateString).toLocaleString('th-TH', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })

  const getVehicleStatusBadge = (status: string) => {
    const map: Record<string, { bg: string; text: string }> = {
      AVAILABLE: { bg: "bg-green-100 text-green-700", text: "ว่าง" },
      BOOKED: { bg: "bg-blue-100 text-blue-700", text: "จองแล้ว" },
      IN_USE: { bg: "bg-purple-100 text-purple-700", text: "กำลังใช้งาน" },
      MAINTENANCE: { bg: "bg-orange-100 text-orange-700", text: "ซ่อมบำรุง" },
    }
    const s = map[status]
    return s ? <span className={`text-xs px-2 py-0.5 rounded-full ${s.bg}`}>{s.text}</span> : null
  }

  const handleFilterChange = (key: string, value: string) => setFilters(prev => ({ ...prev, [key]: value }))

  useEffect(() => { fetchData() }, [filters])

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto text-gray-700">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">จัดการการจอง</h1>
          <div className="grid grid-cols-2 md:grid-cols-7 gap-4 mb-6">
            {[
              { label: "ทั้งหมด", value: stats.total, color: "text-gray-900" },
              { label: "รออนุมัติ", value: stats.pending, color: "text-yellow-600" },
              { label: "อนุมัติแล้ว", value: stats.approved, color: "text-green-600" },
              { label: "กำลังใช้งาน", value: stats.in_progress, color: "text-indigo-600" },
              { label: "เสร็จสิ้น", value: stats.completed, color: "text-teal-600" },
              { label: "ปฏิเสธ", value: stats.rejected, color: "text-red-600" },
              { label: "ยกเลิก", value: stats.cancelled, color: "text-gray-600" },
            ].map((s, i) => (
              <div key={i} className="bg-white p-4 rounded-lg shadow">
                <h3 className="text-sm font-medium text-gray-500">{s.label}</h3>
                <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
              </div>
            ))}
          </div>
        </div>

        {success && <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-6">{success}</div>}
        {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">{error}</div>}

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">กรองข้อมูล</h3>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">สถานะ</label>
              <select value={filters.status} onChange={(e) => handleFilterChange('status', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="">ทุกสถานะ</option>
                <option value="PENDING">รออนุมัติ</option>
                <option value="APPROVED">อนุมัติแล้ว</option>
                <option value="IN_PROGRESS">กำลังใช้งาน</option>
                <option value="COMPLETED">เสร็จสิ้น</option>
                <option value="REJECTED">ปฏิเสธ</option>
                <option value="CANCELLED">ยกเลิก</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">ผู้จอง</label>
              <select value={filters.userId} onChange={(e) => handleFilterChange('userId', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="">ทุกคน</option>
                {users.map(user => <option key={user.id} value={user.id}>{user.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">รถ</label>
              <select value={filters.vehicleId} onChange={(e) => handleFilterChange('vehicleId', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="">ทุกคัน</option>
                {vehicles.map(v => <option key={v.id} value={v.id}>{v.plateNumber} ({v.type.name})</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">วันที่เริ่ม</label>
              <input type="date" value={filters.startDate} onChange={(e) => handleFilterChange('startDate', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">วันที่สิ้นสุด</label>
              <input type="date" value={filters.endDate} onChange={(e) => handleFilterChange('endDate', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
          </div>
          <div className="mt-4 flex justify-end">
            <button onClick={() => setFilters({ status: "", userId: "", vehicleId: "", startDate: "", endDate: "" })} className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300">ล้างตัวกรอง</button>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ผู้จอง</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">รถ</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ช่วงเวลา</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">วัตถุประสงค์</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">สถานะ</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ไมล์</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">การดำเนินการ</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading && bookings.length === 0 ? (
                <tr><td colSpan={7} className="px-6 py-4 text-center text-gray-500">กำลังโหลด...</td></tr>
              ) : bookings.length === 0 ? (
                <tr><td colSpan={7} className="px-6 py-4 text-center text-gray-500">ไม่พบข้อมูลการจอง</td></tr>
              ) : bookings.map((booking) => (
                <tr key={booking.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{booking.user.name}</div>
                    <div className="text-sm text-gray-500">{booking.user.email}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{booking.vehicle.plateNumber}</div>
                    <div className="text-sm text-gray-500">{booking.vehicle.type.name}</div>
                    <div className="mt-1">{getVehicleStatusBadge(booking.vehicle.status)}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      <div>เริ่ม: {formatDateTime(booking.startDate)}</div>
                      <div>สิ้นสุด: {formatDateTime(booking.endDate)}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900 max-w-xs truncate" title={booking.purpose}>{booking.purpose}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getBookingStatusColor(booking.status)}`}>
                      {getBookingStatusText(booking.status)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {booking.mileageStart != null && (
                      <div className="text-gray-900">เริ่ม: {booking.mileageStart.toLocaleString()} km</div>
                    )}
                    {booking.mileageEnd != null && (
                      <>
                        <div className="text-gray-900">สิ้นสุด: {booking.mileageEnd.toLocaleString()} km</div>
                        <div className="text-indigo-600 font-medium">
                          ระยะทาง: {(booking.mileageEnd - (booking.mileageStart || 0)).toLocaleString()} km
                        </div>
                      </>
                    )}
                    {booking.mileageStart == null && booking.mileageEnd == null && (
                      <span className="text-gray-400">-</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex flex-col gap-1">
                      <button onClick={() => { setSelectedBooking(booking); setNewStatus(booking.status); setShowModal(true) }} className="text-blue-600 hover:text-blue-900 text-left">แก้ไข</button>
                      <button onClick={() => deleteBooking(booking)} className="text-red-600 hover:text-red-900 text-left">ลบ</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Status Update Modal */}
        {showModal && selectedBooking && (
          <div className="fixed inset-0 bg-gray-600/50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
              <h3 className="text-lg font-medium text-gray-900 mb-4">แก้ไขสถานะการจอง</h3>
              <form onSubmit={updateBookingStatus}>
                <div className="mb-4">
                  <div className="bg-gray-100 p-3 rounded-md">
                    <p className="text-sm"><strong>ผู้จอง:</strong> {selectedBooking.user.name}</p>
                    <p className="text-sm"><strong>รถ:</strong> {selectedBooking.vehicle.plateNumber}</p>
                  </div>
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">สถานะใหม่</label>
                  <select value={newStatus} onChange={(e) => setNewStatus(e.target.value)} required className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option value="PENDING">รออนุมัติ</option>
                    <option value="APPROVED">อนุมัติแล้ว</option>
                    <option value="REJECTED">ปฏิเสธ</option>
                    <option value="CANCELLED">ยกเลิก</option>
                  </select>
                </div>
                <div className="flex justify-end gap-3">
                  <button type="button" onClick={() => { setShowModal(false); setSelectedBooking(null) }} className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300">ยกเลิก</button>
                  <button type="submit" disabled={loading} className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50">{loading ? "กำลังอัพเดท..." : "บันทึก"}</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}