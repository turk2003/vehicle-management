"use client"

import { useEffect, useState } from "react"
import { Plus, Pencil, Trash2, Wrench, CheckCircle, Clock, AlertCircle, X } from "lucide-react"
import api from "@/lib/api"

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
    status: string
    type: { name: string }
  }
  reporter: {
    id: string
    name: string
    email: string
  }
}

type Vehicle = {
  id: string
  plateNumber: string
  status: string
  type: { name: string }
}

type FormData = {
  vehicleId: string
  description: string
  startDate: string
  endDate: string
  status: string
}

const defaultForm: FormData = {
  vehicleId: "",
  description: "",
  startDate: "",
  endDate: "",
  status: "REPORTED"
}

export default function AdminMaintenancePage() {
  const [maintenances, setMaintenances] = useState<Maintenance[]>([])
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [filterStatus, setFilterStatus] = useState("")
  const [showModal, setShowModal] = useState(false)
  const [editingItem, setEditingItem] = useState<Maintenance | null>(null)
  const [formData, setFormData] = useState<FormData>(defaultForm)

  // Stats
  const stats = {
    total: maintenances.length,
    pending: maintenances.filter(m => m.status === "REPORTED" && new Date(m.startDate) > new Date()).length,
    inProgress: maintenances.filter(m => m.status === "IN_PROGRESS").length,
    completed: maintenances.filter(m => m.status === "COMPLETED").length,
  }

  const fetchData = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (filterStatus) params.append("status", filterStatus)

      const [maintenanceRes, vehicleRes] = await Promise.all([
        api.get(`/api/admin/maintenance?${params}`),
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

  const openCreateModal = () => {
    setEditingItem(null)
    setFormData(defaultForm)
    setError("")
    setShowModal(true)
  }

  const openEditModal = (item: Maintenance) => {
    setEditingItem(item)
    setFormData({
      vehicleId: item.vehicle.id,
      description: item.description,
      startDate: item.startDate.slice(0, 16),
      endDate: item.endDate ? item.endDate.slice(0, 16) : "",
      status: item.status
    })
    setError("")
    setShowModal(true)
  }

  const closeModal = () => {
    setShowModal(false)
    setEditingItem(null)
    setFormData(defaultForm)
    setError("")
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      setLoading(true)
      setError("")

      if (editingItem) {
        await api.put("/api/admin/maintenance", {
          id: editingItem.id,
          ...formData
        })
        setSuccess("อัพเดทข้อมูลเรียบร้อยแล้ว")
      } else {
        await api.post("/api/admin/maintenance", formData)
        setSuccess("เพิ่มกำหนดการบำรุงรักษาเรียบร้อยแล้ว")
      }

      closeModal()
      fetchData()
    } catch (err: any) {
      setError(err.response?.data?.message || "เกิดข้อผิดพลาด")
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (item: Maintenance) => {
    if (!confirm(`ยืนยันลบรายการบำรุงรักษา "${item.description}" หรือไม่?`)) return

    try {
      setLoading(true)
      await api.delete(`/api/admin/maintenance?id=${item.id}`)
      setSuccess("ลบเรียบร้อยแล้ว")
      fetchData()
    } catch (err: any) {
      setError(err.response?.data?.message || "ไม่สามารถลบได้")
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (status: string, startDate: string) => {
    const now = new Date()
    const start = new Date(startDate)
    const isPending = start > now // วันยังไม่ถึง

    switch (status) {
      case "REPORTED":
        return isPending ? (
          <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-600">
            <Clock className="w-3 h-3" /> รอถึงวันกำหนด
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">
            <AlertCircle className="w-3 h-3" /> รายงานแล้ว
          </span>
        )
      case "IN_PROGRESS":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
            <Clock className="w-3 h-3" /> กำลังซ่อม
          </span>
        )
      case "COMPLETED":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
            <CheckCircle className="w-3 h-3" /> เสร็จสิ้น
          </span>
        )
      default:
        return null
    }
  }

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString("th-TH", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    })
  }

  useEffect(() => {
    fetchData()
  }, [filterStatus])

  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => setSuccess(""), 3000)
      return () => clearTimeout(timer)
    }
  }, [success])

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-1">จัดการการบำรุงรักษา</h1>
            <p className="text-gray-600">กำหนดและติดตามการซ่อมบำรุงรถทั้งหมด</p>
          </div>
          <button
            onClick={openCreateModal}
            className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-5 py-2.5 rounded-lg font-medium transition-colors"
          >
            <Plus className="w-5 h-5" />
            เพิ่มรายการบำรุงรักษา
          </button>
        </div>

        {/* Success/Error Messages */}
        {success && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4 flex justify-between">
            <span>{success}</span>
            <button onClick={() => setSuccess("")}><X className="w-4 h-4" /></button>
          </div>
        )}
        {error && !showModal && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 flex justify-between">
            <span>{error}</span>
            <button onClick={() => setError("")}><X className="w-4 h-4" /></button>
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            {
              label: "ทั้งหมด",
              value: stats.total,
              color: "text-gray-900",
              ring: filterStatus === "" ? "ring-2 ring-gray-400" : "",
              filter: ""
            },
            {
              label: "รอถึงวันกำหนด",  // ✅ เปลี่ยนชื่อให้ชัดขึ้น
              value: stats.pending,
              color: "text-gray-500",
              ring: filterStatus === "REPORTED" ? "ring-2 ring-gray-400" : "",
              filter: "REPORTED"
            },
            {
              label: "กำลังซ่อม",
              value: stats.inProgress,
              color: "text-blue-600",
              ring: filterStatus === "IN_PROGRESS" ? "ring-2 ring-blue-400" : "",
              filter: "IN_PROGRESS"
            },
            {
              label: "เสร็จสิ้น",
              value: stats.completed,
              color: "text-green-600",
              ring: filterStatus === "COMPLETED" ? "ring-2 ring-green-400" : "",
              filter: "COMPLETED"
            },
          ].map((stat) => (
            <div
              key={stat.label}
              onClick={() => setFilterStatus(stat.filter)}
              className={`bg-white p-5 rounded-lg shadow cursor-pointer hover:shadow-md transition-all ${stat.ring}`}
            >
              <p className="text-sm font-medium text-gray-500">{stat.label}</p>
              <p className={`text-3xl font-bold mt-1 ${stat.color}`}>{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Table */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b">
            <div className="flex items-center gap-2">
              <Wrench className="w-5 h-5 text-orange-500" />
              <h2 className="text-lg font-semibold text-gray-900">รายการบำรุงรักษา</h2>
            </div>
            {filterStatus && (
              <button
                onClick={() => setFilterStatus("")}
                className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1"
              >
                <X className="w-4 h-4" /> ล้างตัวกรอง
              </button>
            )}
          </div>

          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">รถ</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">รายละเอียด</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">วันที่เริ่ม</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">วันที่เสร็จ</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">สถานะ</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ผู้รายงาน</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">การดำเนินการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-gray-500">กำลังโหลด...</td>
                </tr>
              ) : maintenances.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-gray-500">ไม่พบข้อมูลการบำรุงรักษา</td>
                </tr>
              ) : (
                maintenances.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <p className="font-medium text-gray-900">{item.vehicle.plateNumber}</p>
                      <p className="text-sm text-gray-500">{item.vehicle.type.name}</p>
                      <span className={`inline-flex items-center mt-1 px-1.5 py-0.5 text-xs rounded font-medium
                        ${item.vehicle.status === "AVAILABLE" ? "bg-green-100 text-green-700" :
                          item.vehicle.status === "MAINTENANCE" ? "bg-orange-100 text-orange-700" :
                          "bg-red-100 text-red-700"}`}>
                        {item.vehicle.status === "AVAILABLE" ? "จองได้" :
                          item.vehicle.status === "MAINTENANCE" ? "ซ่อมบำรุง" : "ถูกจองแล้ว"}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-gray-900 max-w-xs truncate" title={item.description}>
                        {item.description}
                      </p>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatDateTime(item.startDate)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {item.endDate ? formatDateTime(item.endDate) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(item.status, item.startDate)}
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-gray-900">{item.reporter.name}</p>
                      <p className="text-xs text-gray-500">{item.reporter.email}</p>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => openEditModal(item)}
                          className="p-1.5 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                          title="แก้ไข"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(item)}
                          className="p-1.5 text-red-600 hover:bg-red-50 rounded transition-colors"
                          title="ลบ"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black/50 text-gray-500 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-lg mx-4">
              <div className="flex justify-between items-center px-6 py-4 border-b">
                <h3 className="text-lg font-semibold text-gray-900">
                  {editingItem ? "แก้ไขรายการบำรุงรักษา" : "เพิ่มรายการบำรุงรักษา"}
                </h3>
                <button onClick={closeModal} className="text-gray-400 hover:text-gray-600">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                {error && (
                  <div className="bg-red-100 text-red-700 px-4 py-3 rounded text-sm">{error}</div>
                )}

                {/* Vehicle */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    รถ <span className="text-red-500">*</span>
                  </label>
                  <select
                    required
                    value={formData.vehicleId}
                    onChange={(e) => setFormData({ ...formData, vehicleId: e.target.value })}
                    disabled={!!editingItem}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 disabled:bg-gray-100"
                  >
                    <option value="">เลือกรถ</option>
                    {vehicles.map((v) => (
                      <option key={v.id} value={v.id}>
                        {v.plateNumber} ({v.type.name})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    รายละเอียด <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    required
                    rows={3}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="ระบุรายละเอียดการบำรุงรักษา..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>

                {/* Dates */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      วันที่เริ่ม <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="datetime-local"
                      required
                      value={formData.startDate}
                      onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      วันที่เสร็จ
                    </label>
                    <input
                      type="datetime-local"
                      value={formData.endDate}
                      onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                  </div>
                </div>

                {/* Status */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    สถานะ
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  >
                    <option value="REPORTED">รายงานแล้ว</option>
                    <option value="IN_PROGRESS">กำลังซ่อม</option>
                    <option value="COMPLETED">เสร็จสิ้น</option>
                  </select>
                </div>

                {/* Buttons */}
                <div className="flex justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                  >
                    ยกเลิก
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-4 py-2 text-sm font-medium text-white bg-orange-500 rounded-lg hover:bg-orange-600 disabled:opacity-50"
                  >
                    {loading ? "กำลังบันทึก..." : editingItem ? "บันทึกการแก้ไข" : "เพิ่มรายการ"}
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