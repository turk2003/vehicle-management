"use client"

import { useState, useEffect } from "react"
import { getBookingStatusColor, getBookingStatusText, formatDateTime } from "@/lib/format"
import api from "@/lib/api"

interface Booking {
  id: string
  startDate: string
  endDate: string
  purpose: string
  destination?: string
  status: string
  rejectionReason?: string
  mileageStart?: number | null
  mileageEnd?: number | null
  pickedUpAt?: string | null
  returnedAt?: string | null
  createdAt: string
  vehicle: { id: string; plateNumber: string; type: { id: string; name: string } }
  approver?: { id: string; name: string; email: string }
}

export default function MyBookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [selectedStatus, setSelectedStatus] = useState("ALL")
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null)
  const [showEditModal, setShowEditModal] = useState(false)
  const [editForm, setEditForm] = useState({ id: "", startDate: "", endDate: "", purpose: "" })
  const [showPickupModal, setShowPickupModal] = useState(false)
  const [showReturnModal, setShowReturnModal] = useState(false)
  const [mileageInput, setMileageInput] = useState("")
  const [stats, setStats] = useState({ total: 0, pending: 0, approved: 0, rejected: 0, cancelled: 0, in_progress: 0, completed: 0 })

  const fetchBookings = async () => {
    try {
      setLoading(true); setError("")
      const response = await api.get("/api/booking?action=my-bookings")
      setBookings(response.data)
      const s = response.data.reduce((acc: any, b: Booking) => {
        acc.total++
        acc[b.status.toLowerCase()]++
        return acc
      }, { total: 0, pending: 0, approved: 0, rejected: 0, cancelled: 0, in_progress: 0, completed: 0 })
      setStats(s)
    } catch { setError("ไม่สามารถโหลดข้อมูลได้") }
    finally { setLoading(false) }
  }

  const cancelBooking = async (bookingId: string) => {
    if (!confirm("คุณแน่ใจที่จะยกเลิกการจองนี้หรือไม่?")) return
    try { setLoading(true); await api.put("/api/booking", { id: bookingId, status: "CANCELLED" }); fetchBookings() }
    catch { setError("ไม่สามารถยกเลิกการจองได้") }
    finally { setLoading(false) }
  }

  const openEditModal = (booking: Booking) => {
    const toLocalISO = (dateStr: string) => { const dt = new Date(dateStr); dt.setMinutes(dt.getMinutes() - dt.getTimezoneOffset()); return dt.toISOString().slice(0, 16) }
    setEditForm({ id: booking.id, startDate: toLocalISO(booking.startDate), endDate: toLocalISO(booking.endDate), purpose: booking.purpose })
    setShowEditModal(true)
  }

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try { setLoading(true); setError(""); await api.patch("/api/booking", editForm); setShowEditModal(false); fetchBookings() }
    catch (err: any) { alert(err.response?.data?.message || "ไม่สามารถแก้ไขการจองได้") }
    finally { setLoading(false) }
  }

  const handlePickup = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedBooking) return
    try {
      setLoading(true)
      await api.put("/api/booking/pickup", {
        bookingId: selectedBooking.id,
        mileageStart: Number(mileageInput)
      })
      setShowPickupModal(false)
      fetchBookings()
    } catch (err: any) {
      alert(err.response?.data?.message || "ไม่สามารถรับรถได้")
    } finally {
      setLoading(false)
    }
  }

  const handleReturn = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedBooking) return
    try {
      setLoading(true)
      await api.put("/api/booking/return", {
        bookingId: selectedBooking.id,
        mileageEnd: Number(mileageInput)
      })
      setShowReturnModal(false)
      fetchBookings()
    } catch (err: any) {
      alert(err.response?.data?.message || "ไม่สามารถคืนรถได้")
    } finally {
      setLoading(false)
    }
  }

  const filteredBookings = selectedStatus === "ALL" ? bookings : bookings.filter(b => b.status === selectedStatus)

  useEffect(() => { fetchBookings() }, [])

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">ประวัติการจอง</h1>
          <p className="text-gray-600">ดูประวัติการจองรถทั้งหมดของคุณ</p>
        </div>

        {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">{error}</div>}

        {/* Statistics */}
        <div className="grid grid-cols-2 md:grid-cols-7 gap-4 mb-6">
          {[
            { key: "ALL", label: "ทั้งหมด", value: stats.total, color: "text-gray-900", ring: "ring-blue-500" },
            { key: "PENDING", label: "รออนุมัติ", value: stats.pending, color: "text-yellow-600", ring: "ring-yellow-500" },
            { key: "APPROVED", label: "อนุมัติแล้ว", value: stats.approved, color: "text-green-600", ring: "ring-green-500" },
            { key: "IN_PROGRESS", label: "กำลังใช้งาน", value: stats.in_progress, color: "text-indigo-600", ring: "ring-indigo-500" },
            { key: "COMPLETED", label: "เสร็จสิ้น", value: stats.completed, color: "text-teal-600", ring: "ring-teal-500" },
            { key: "REJECTED", label: "ปฏิเสธ", value: stats.rejected, color: "text-red-600", ring: "ring-red-500" },
            { key: "CANCELLED", label: "ยกเลิก", value: stats.cancelled, color: "text-gray-600", ring: "ring-gray-500" },
          ].map(s => (
            <div key={s.key} className={`bg-white p-4 rounded-lg shadow cursor-pointer hover:shadow-md transition-shadow ${selectedStatus === s.key ? `ring-2 ${s.ring}` : ""}`} onClick={() => setSelectedStatus(s.key)}>
              <h3 className="text-sm font-medium text-gray-500">{s.label}</h3>
              <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
            </div>
          ))}
        </div>

        {/* Bookings List */}
        <div className="space-y-4">
          {loading ? (
            <div className="text-center py-8 text-gray-500">กำลังโหลด...</div>
          ) : filteredBookings.length === 0 ? (
            <div className="text-center py-8 text-gray-500">ไม่พบข้อมูลการจอง</div>
          ) : filteredBookings.map((booking) => (
            <div key={booking.id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">{booking.vehicle.plateNumber}</h3>
                    <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${getBookingStatusColor(booking.status)}`}>
                      {getBookingStatusText(booking.status)}
                    </span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                    <div><p className="text-sm text-gray-600">ประเภทรถ</p><p className="text-gray-900 font-medium">{booking.vehicle.type.name}</p></div>
                    <div><p className="text-sm text-gray-600">วันที่จอง</p><p className="text-gray-900 font-medium">{formatDateTime(booking.createdAt)}</p></div>
                    <div><p className="text-sm text-gray-600">เริ่มใช้รถ</p><p className="text-gray-900 font-medium">{formatDateTime(booking.startDate)}</p></div>
                    <div><p className="text-sm text-gray-600">คืนรถ</p><p className="text-gray-900 font-medium">{formatDateTime(booking.endDate)}</p></div>
                    <div className="md:col-span-2"><p className="text-sm text-gray-600">วัตถุประสงค์</p><p className="text-gray-900">{booking.purpose}</p></div>

                    {/* Mileage Info */}
                    {(booking.mileageStart != null || booking.mileageEnd != null) && (
                      <div className="md:col-span-2 bg-indigo-50 p-3 rounded-md border border-indigo-100">
                        <p className="text-sm font-medium text-indigo-800 mb-1">ข้อมูลไมล์</p>
                        <div className="grid grid-cols-3 gap-2 text-sm">
                          {booking.mileageStart != null && <div><span className="text-indigo-600">เริ่มต้น:</span> <span className="font-medium text-gray-900">{booking.mileageStart.toLocaleString()} km</span></div>}
                          {booking.mileageEnd != null && <div><span className="text-indigo-600">สิ้นสุด:</span> <span className="font-medium text-gray-900">{booking.mileageEnd.toLocaleString()} km</span></div>}
                          {booking.mileageStart != null && booking.mileageEnd != null && (
                            <div><span className="text-indigo-600">ระยะทาง:</span> <span className="font-bold text-indigo-800">{(booking.mileageEnd - booking.mileageStart).toLocaleString()} km</span></div>
                          )}
                        </div>
                        {booking.pickedUpAt && <p className="text-xs text-gray-500 mt-1">รับรถ: {formatDateTime(booking.pickedUpAt)}</p>}
                        {booking.returnedAt && <p className="text-xs text-gray-500">คืนรถ: {formatDateTime(booking.returnedAt)}</p>}
                      </div>
                    )}

                    {booking.approver && <div className="md:col-span-2"><p className="text-sm text-gray-600">ผู้อนุมัติ</p><p className="text-gray-900">{booking.approver.name}</p></div>}
                    {booking.status === "REJECTED" && booking.rejectionReason && (
                      <div className="md:col-span-2 bg-red-50 p-3 rounded-md border border-red-100">
                        <p className="text-sm font-medium text-red-800">เหตุผลที่ปฏิเสธ</p>
                        <p className="text-sm text-red-600 mt-1">{booking.rejectionReason}</p>
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex flex-col gap-2 ml-4">
                  <button onClick={() => { setSelectedBooking(booking); setShowDetailModal(true) }} className="px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-md hover:bg-blue-100">ดูรายละเอียด</button>
                  {booking.status === "PENDING" && (
                    <>
                      <button onClick={() => openEditModal(booking)} disabled={loading} className="px-4 py-2 text-sm font-medium text-amber-600 bg-amber-50 rounded-md hover:bg-amber-100 disabled:opacity-50">แก้ไข</button>
                      <button onClick={() => cancelBooking(booking.id)} disabled={loading} className="px-4 py-2 text-sm font-medium text-red-600 bg-red-50 rounded-md hover:bg-red-100 disabled:opacity-50">ยกเลิก</button>
                    </>
                  )}
                  {booking.status === "APPROVED" && (
                    <button onClick={() => { setSelectedBooking(booking); setMileageInput(""); setShowPickupModal(true) }} disabled={loading} className="px-4 py-2 text-sm font-medium text-indigo-600 bg-indigo-50 rounded-md hover:bg-indigo-100 disabled:opacity-50">🚗 รับรถ</button>
                  )}
                  {booking.status === "IN_PROGRESS" && (
                    <button onClick={() => { setSelectedBooking(booking); setMileageInput(""); setShowReturnModal(true) }} disabled={loading} className="px-4 py-2 text-sm font-medium text-teal-600 bg-teal-50 rounded-md hover:bg-teal-100 disabled:opacity-50">📥 คืนรถ</button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Detail Modal */}
        {showDetailModal && selectedBooking && (
          <div className="fixed inset-0 bg-gray-600/50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-full max-w-2xl shadow-lg rounded-md bg-white">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-xl font-semibold text-gray-900">รายละเอียดการจอง</h3>
                <button onClick={() => setShowDetailModal(false)} className="text-gray-400 hover:text-gray-600"><span className="text-2xl">×</span></button>
              </div>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div><p className="text-sm font-medium text-gray-500">สถานะ</p><span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${getBookingStatusColor(selectedBooking.status)}`}>{getBookingStatusText(selectedBooking.status)}</span></div>
                  <div><p className="text-sm font-medium text-gray-500">วันที่จอง</p><p className="text-gray-900">{formatDateTime(selectedBooking.createdAt)}</p></div>
                </div>
                <hr />
                <div><h4 className="text-lg font-semibold text-gray-900 mb-3">ข้อมูลรถ</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div><p className="text-sm font-medium text-gray-500">ทะเบียนรถ</p><p className="text-gray-900">{selectedBooking.vehicle.plateNumber}</p></div>
                    <div><p className="text-sm font-medium text-gray-500">ประเภทรถ</p><p className="text-gray-900">{selectedBooking.vehicle.type.name}</p></div>
                  </div>
                </div>
                <hr />
                <div><h4 className="text-lg font-semibold text-gray-900 mb-3">ระยะเวลาการใช้รถ</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div><p className="text-sm font-medium text-gray-500">เริ่มใช้รถ</p><p className="text-gray-900">{formatDateTime(selectedBooking.startDate)}</p></div>
                    <div><p className="text-sm font-medium text-gray-500">คืนรถ</p><p className="text-gray-900">{formatDateTime(selectedBooking.endDate)}</p></div>
                  </div>
                </div>
                {(selectedBooking.mileageStart != null || selectedBooking.mileageEnd != null) && (
                  <><hr /><div><h4 className="text-lg font-semibold text-gray-900 mb-3">ข้อมูลไมล์</h4>
                    <div className="grid grid-cols-3 gap-4">
                      {selectedBooking.mileageStart != null && <div><p className="text-sm font-medium text-gray-500">ไมล์เริ่มต้น</p><p className="text-gray-900 font-medium">{selectedBooking.mileageStart.toLocaleString()} km</p></div>}
                      {selectedBooking.mileageEnd != null && <div><p className="text-sm font-medium text-gray-500">ไมล์สิ้นสุด</p><p className="text-gray-900 font-medium">{selectedBooking.mileageEnd.toLocaleString()} km</p></div>}
                      {selectedBooking.mileageStart != null && selectedBooking.mileageEnd != null && <div><p className="text-sm font-medium text-gray-500">ระยะทาง</p><p className="text-indigo-600 font-bold">{(selectedBooking.mileageEnd - selectedBooking.mileageStart).toLocaleString()} km</p></div>}
                    </div>
                    {selectedBooking.pickedUpAt && <p className="text-sm text-gray-500 mt-2">รับรถจริง: {formatDateTime(selectedBooking.pickedUpAt)}</p>}
                    {selectedBooking.returnedAt && <p className="text-sm text-gray-500">คืนรถจริง: {formatDateTime(selectedBooking.returnedAt)}</p>}
                  </div></>
                )}
                <hr />
                <div><h4 className="text-lg font-semibold text-gray-900 mb-3">รายละเอียดการใช้งาน</h4>
                  <div><p className="text-sm font-medium text-gray-500">วัตถุประสงค์</p><p className="text-gray-900">{selectedBooking.purpose}</p></div>
                </div>
                {selectedBooking.approver && (<><hr /><div><h4 className="text-lg font-semibold text-gray-900 mb-3">ผู้อนุมัติ</h4><p className="text-gray-900">{selectedBooking.approver.name}</p><p className="text-sm text-gray-500">{selectedBooking.approver.email}</p></div></>)}
              </div>
              <div className="mt-6 flex justify-end"><button onClick={() => setShowDetailModal(false)} className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700">ปิด</button></div>
            </div>
          </div>
        )}

        {/* Edit Modal */}
        {showEditModal && (
          <div className="fixed inset-0 bg-gray-600/50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-full max-w-lg shadow-lg rounded-md bg-white">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-xl font-semibold text-gray-900">แก้ไขการจอง</h3>
                <button onClick={() => setShowEditModal(false)} className="text-gray-400 hover:text-gray-600"><span className="text-2xl">×</span></button>
              </div>
              <form onSubmit={handleEditSubmit} className="space-y-4">
                <div><label className="block text-sm font-medium text-gray-700">วันที่และเวลาเริ่ม</label><input type="datetime-local" required value={editForm.startDate} onChange={e => setEditForm(prev => ({ ...prev, startDate: e.target.value }))} className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500" /></div>
                <div><label className="block text-sm font-medium text-gray-700">วันที่และเวลาสิ้นสุด</label><input type="datetime-local" required value={editForm.endDate} onChange={e => setEditForm(prev => ({ ...prev, endDate: e.target.value }))} className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500" /></div>
                <div><label className="block text-sm font-medium text-gray-700">วัตถุประสงค์</label><textarea required rows={3} value={editForm.purpose} onChange={e => setEditForm(prev => ({ ...prev, purpose: e.target.value }))} className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"></textarea></div>
                <div className="mt-6 flex justify-end gap-3">
                  <button type="button" onClick={() => setShowEditModal(false)} className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200">ยกเลิก</button>
                  <button type="submit" disabled={loading} className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50">{loading ? 'กำลังบันทึก...' : 'บันทึกการแก้ไข'}</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Pickup Modal */}
        {showPickupModal && selectedBooking && (
          <div className="fixed inset-0 bg-gray-600/50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
              <h3 className="text-lg font-medium text-gray-900 mb-4">รับรถ: {selectedBooking.vehicle.plateNumber}</h3>
              <form onSubmit={handlePickup}>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">เลขไมล์เริ่มต้น (km) *</label>
                  <input type="number" required min="0" value={mileageInput} onChange={(e) => setMileageInput(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500" placeholder="เช่น 15000" />
                </div>
                <div className="flex justify-end gap-3">
                  <button type="button" onClick={() => setShowPickupModal(false)} className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300">ยกเลิก</button>
                  <button type="submit" disabled={loading || !mileageInput} className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 disabled:opacity-50">{loading ? "กำลังบันทึก..." : "ยืนยันการรับรถ"}</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Return Modal */}
        {showReturnModal && selectedBooking && (
          <div className="fixed inset-0 bg-gray-600/50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
              <h3 className="text-lg font-medium text-gray-900 mb-4">คืนรถ: {selectedBooking.vehicle.plateNumber}</h3>
              <form onSubmit={handleReturn}>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">เลขไมล์สิ้นสุด (km) *</label>
                  <p className="text-sm text-gray-500 mb-2">เลขไมล์เริ่มต้น: {selectedBooking.mileageStart?.toLocaleString() || 0} km</p>
                  <input type="number" required min={selectedBooking.mileageStart || 0} value={mileageInput} onChange={(e) => setMileageInput(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500" placeholder="เช่น 15200" />
                </div>
                <div className="flex justify-end gap-3">
                  <button type="button" onClick={() => setShowReturnModal(false)} className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300">ยกเลิก</button>
                  <button type="submit" disabled={loading || !mileageInput} className="px-4 py-2 text-sm font-medium text-white bg-teal-600 rounded-md hover:bg-teal-700 disabled:opacity-50">{loading ? "กำลังบันทึก..." : "ยืนยันการคืนรถ"}</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}