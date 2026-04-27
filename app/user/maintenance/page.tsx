"use client"

import { useEffect, useState } from "react"
import { Plus, Wrench, X, History } from "lucide-react"
import api from "@/lib/api"
import { getMaintenanceStatusColor, getMaintenanceStatusText, formatDateTime } from "@/lib/format"

type Maintenance = {
  id: string
  description: string
  status: string
  startDate: string
  endDate?: string
  createdAt: string
  vehicle: {
    id: string
    plateNumber: string
    type: { name: string }
  }
}

type Vehicle = {
  id: string
  plateNumber: string
  status: string
  type: { name: string }
}

export default function UserMaintenancePage() {
  const [maintenances, setMaintenances] = useState<Maintenance[]>([])
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [showModal, setShowModal] = useState(false)
  
  const [formData, setFormData] = useState({
    vehicleId: "",
    description: "",
    startDate: new Date().toISOString().slice(0, 16)
  })

  const fetchData = async () => {
    try {
      setLoading(true)
      const [maintenanceRes, vehicleRes] = await Promise.all([
        api.get("/api/user/maintenance"),
        api.get("/api/verhicle")
      ])
      setMaintenances(maintenanceRes.data)
      setVehicles(vehicleRes.data)
    } catch (err: any) {
      setError("ไม่สามารถโหลดข้อมูลได้")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      setLoading(true)
      setError("")

      await api.post("/api/user/maintenance", formData)
      
      setSuccess("แจ้งซ่อมเรียบร้อยแล้ว")
      setShowModal(false)
      setFormData({
        vehicleId: "",
        description: "",
        startDate: new Date().toISOString().slice(0, 16)
      })
      fetchData()
    } catch (err: any) {
      setError(err.response?.data?.message || "เกิดข้อผิดพลาด")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => setSuccess(""), 3000)
      return () => clearTimeout(timer)
    }
  }, [success])

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Wrench className="w-6 h-6 text-orange-500" />
              แจ้งซ่อมบำรุงรถ
            </h1>
            <p className="text-gray-600 mt-1">รายงานปัญหารถและติดตามสถานะการซ่อมบำรุง</p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-5 py-2.5 rounded-lg font-medium transition-colors shadow-sm"
          >
            <Plus className="w-5 h-5" />
            แจ้งซ่อม
          </button>
        </div>

        {/* Alerts */}
        {success && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg mb-6 flex justify-between items-center">
            <span>{success}</span>
            <button onClick={() => setSuccess("")}><X className="w-4 h-4" /></button>
          </div>
        )}
        {error && !showModal && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-6 flex justify-between items-center">
            <span>{error}</span>
            <button onClick={() => setError("")}><X className="w-4 h-4" /></button>
          </div>
        )}

        {/* History Table */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-2">
            <History className="w-5 h-5 text-gray-500" />
            <h2 className="text-lg font-semibold text-gray-900">ประวัติการแจ้งซ่อมของฉัน</h2>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">รถ</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">รายละเอียดปัญหา</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">วันที่แจ้งซ่อม</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">สถานะ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {loading && maintenances.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-8 text-center text-gray-500">กำลังโหลดข้อมูล...</td>
                  </tr>
                ) : maintenances.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-8 text-center text-gray-500">คุณยังไม่มีประวัติการแจ้งซ่อม</td>
                  </tr>
                ) : (
                  maintenances.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-medium text-gray-900">{item.vehicle.plateNumber}</div>
                        <div className="text-sm text-gray-500">{item.vehicle.type.name}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900 max-w-md">{item.description}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatDateTime(item.startDate)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2.5 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getMaintenanceStatusColor(item.status)}`}>
                          {getMaintenanceStatusText(item.status)}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Report Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black/50 text-gray-500 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-md mx-auto">
              <div className="flex justify-between items-center px-6 py-4 border-b">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <Wrench className="w-5 h-5 text-orange-500" />
                  แจ้งรถเสีย / ส่งซ่อม
                </h3>
                <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-5">
                {error && (
                  <div className="bg-red-50 text-red-700 px-4 py-3 rounded-lg text-sm border border-red-100">{error}</div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    เลือกรถที่พบปัญหา <span className="text-red-500">*</span>
                  </label>
                  <select
                    required
                    value={formData.vehicleId}
                    onChange={(e) => setFormData({ ...formData, vehicleId: e.target.value })}
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white"
                  >
                    <option value="">-- เลือกรถ --</option>
                    {vehicles.map((v) => (
                      <option key={v.id} value={v.id}>
                        {v.plateNumber} ({v.type.name})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    รายละเอียดปัญหา <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    required
                    rows={4}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="เช่น แอร์ไม่เย็น, ยางแบน, ไฟหน้าไม่ติด..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    วันที่พบปัญหา <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="datetime-local"
                    required
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    ยกเลิก
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-4 py-2 text-sm font-medium text-white bg-orange-500 rounded-lg hover:bg-orange-600 disabled:opacity-50 transition-colors shadow-sm"
                  >
                    {loading ? "กำลังบันทึก..." : "ยืนยันแจ้งซ่อม"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
