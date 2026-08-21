"use client"

import axios from "axios"
import { FormEvent, useEffect, useState } from "react"
import { Pencil, Plus, SlidersHorizontal, Trash2, Wrench, X } from "lucide-react"
import api from "@/lib/api"
import { formatDateTime, getMaintenanceStatusColor, getMaintenanceStatusText } from "@/lib/format"

type MaintenanceStatus = "REPORTED" | "IN_PROGRESS" | "COMPLETED"

type Maintenance = {
  id: string
  description: string
  status: MaintenanceStatus
  startDate: string
  endDate?: string | null
  repairDetails?: string | null
  serviceCenterName?: string | null
  cost?: number | null
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
  repairDetails: string
  serviceCenterName: string
  cost: string
  startDate: string
  endDate: string
  status: MaintenanceStatus
}

const defaultForm: FormData = {
  vehicleId: "",
  description: "",
  repairDetails: "",
  serviceCenterName: "",
  cost: "",
  startDate: "",
  endDate: "",
  status: "REPORTED",
}

const statusFilters: Array<{
  label: string
  value: "" | MaintenanceStatus
  description: string
}> = [
  { label: "ทั้งหมด", value: "", description: "รายการซ่อมบำรุงทุกสถานะ" },
  { label: "รอถึงวันกำหนด", value: "REPORTED", description: "ยังไม่เริ่มดำเนินการ" },
  { label: "กำลังซ่อม", value: "IN_PROGRESS", description: "รถอยู่ระหว่างบำรุงรักษา" },
  { label: "เสร็จสิ้น", value: "COMPLETED", description: "ปิดงานเรียบร้อยแล้ว" },
]

const fieldClass =
  "w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-orange-500 focus:ring-2 focus:ring-orange-100 disabled:bg-slate-100 disabled:text-slate-500"

const getApiErrorMessage = (error: unknown, fallback: string) => {
  if (axios.isAxiosError<{ message?: string }>(error)) {
    return error.response?.data?.message || fallback
  }
  return fallback
}

const isAffectedBookingsConflict = (error: unknown) =>
  axios.isAxiosError<{ code?: string }>(error) &&
  error.response?.status === 409 &&
  error.response.data?.code === "AFFECTED_BOOKINGS"

const getVehicleStatusText = (status: string) => {
  if (status === "AVAILABLE") return "จองได้"
  if (status === "MAINTENANCE") return "ซ่อมบำรุง"
  return "ถูกจองแล้ว"
}

const getVehicleStatusClass = (status: string) => {
  if (status === "AVAILABLE") return "bg-emerald-50 text-emerald-700 ring-emerald-200"
  if (status === "MAINTENANCE") return "bg-orange-50 text-orange-700 ring-orange-200"
  return "bg-rose-50 text-rose-700 ring-rose-200"
}

export default function AdminMaintenancePage() {
  const [maintenances, setMaintenances] = useState<Maintenance[]>([])
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [filterStatus, setFilterStatus] = useState<"" | MaintenanceStatus>("")
  const [showModal, setShowModal] = useState(false)
  const [editingItem, setEditingItem] = useState<Maintenance | null>(null)
  const [formData, setFormData] = useState<FormData>(defaultForm)

  const stats = {
    total: maintenances.length,
    pending: maintenances.filter((maintenance) => maintenance.status === "REPORTED").length,
    inProgress: maintenances.filter((maintenance) => maintenance.status === "IN_PROGRESS").length,
    completed: maintenances.filter((maintenance) => maintenance.status === "COMPLETED").length,
  }

  const filteredMaintenances = filterStatus
    ? maintenances.filter((maintenance) => maintenance.status === filterStatus)
    : maintenances

  const fetchData = async () => {
    try {
      setLoading(true)
      setError("")

      const [maintenanceRes, vehicleRes] = await Promise.all([
        api.get<Maintenance[]>("/api/admin/maintenance"),
        api.get<Vehicle[]>("/api/verhicle"),
      ])

      setMaintenances(maintenanceRes.data)
      setVehicles(vehicleRes.data)
    } catch (err) {
      setError(getApiErrorMessage(err, "ไม่สามารถโหลดข้อมูลการบำรุงรักษาได้"))
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
      repairDetails: item.repairDetails || "",
      serviceCenterName: item.serviceCenterName || "",
      cost: item.cost ? item.cost.toString() : "",
      startDate: item.startDate.slice(0, 16),
      endDate: item.endDate ? item.endDate.slice(0, 16) : "",
      status: item.status,
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

  const validateForm = () => {
    const now = new Date()
    const start = new Date(formData.startDate)

    if (formData.status === "COMPLETED") {
      if (!formData.endDate) return "กรุณาระบุวันที่เสร็จสิ้นเมื่อสถานะเป็นเสร็จสิ้น"

      const end = new Date(formData.endDate)
      if (start > now) return "วันที่เริ่มซ่อมไม่สามารถเป็นวันในอนาคตได้เมื่อสถานะเสร็จสิ้น"
      if (end > now) return "วันที่ซ่อมเสร็จไม่สามารถเป็นวันในอนาคตได้"
    }

    if (formData.endDate) {
      const end = new Date(formData.endDate)
      if (end < start) return "วันที่เสร็จสิ้นต้องไม่ก่อนวันที่เริ่ม"
    }

    return ""
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const validationError = validateForm()
    if (validationError) {
      setError(validationError)
      return
    }

    try {
      setLoading(true)
      setError("")

      const saveMaintenance = (allowBookingConflicts = false) => {
        const payload = { ...formData, allowBookingConflicts }
        return editingItem
          ? api.put("/api/admin/maintenance", {
              id: editingItem.id,
              ...payload,
            })
          : api.post("/api/admin/maintenance", payload)
      }

      try {
        await saveMaintenance()
      } catch (err) {
        if (!isAffectedBookingsConflict(err)) throw err

        const affectedCount = axios.isAxiosError<{
          affectedBookings?: unknown[]
        }>(err)
          ? err.response?.data?.affectedBookings?.length || 0
          : 0
        const confirmed = window.confirm(
          `ช่วงซ่อมนี้กระทบการจอง ${affectedCount} รายการ ต้องการยืนยันและดำเนินการเปลี่ยนรถให้ผู้จองต่อหรือไม่?`,
        )
        if (!confirmed) {
          setError("ยกเลิกการบันทึกเพื่อหลีกเลี่ยงผลกระทบต่อการจอง")
          return
        }
        await saveMaintenance(true)
      }

      setSuccess(
        editingItem
          ? "อัปเดตรายการบำรุงรักษาเรียบร้อยแล้ว"
          : "เพิ่มรายการบำรุงรักษาเรียบร้อยแล้ว",
      )
      closeModal()
      fetchData()
    } catch (err) {
      setError(getApiErrorMessage(err, "เกิดข้อผิดพลาดขณะบันทึกข้อมูล"))
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (item: Maintenance) => {
    if (!confirm(`ยืนยันลบรายการบำรุงรักษา "${item.description}" หรือไม่?`)) return

    try {
      setLoading(true)
      await api.delete(`/api/admin/maintenance?id=${item.id}`)
      setSuccess("ลบรายการบำรุงรักษาเรียบร้อยแล้ว")
      fetchData()
    } catch (err) {
      setError(getApiErrorMessage(err, "ไม่สามารถลบรายการบำรุงรักษาได้"))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  useEffect(() => {
    if (!success) return

    const timer = setTimeout(() => setSuccess(""), 3000)
    return () => clearTimeout(timer)
  }, [success])

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-6 text-slate-900 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <section className="rounded-xl bg-white p-5 shadow-sm ring-1 ring-slate-200 sm:p-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 rounded-full bg-orange-50 px-3 py-1 text-xs font-semibold text-orange-700 ring-1 ring-orange-100">
                <Wrench className="h-3.5 w-3.5" />
                ศูนย์ควบคุมงานซ่อมบำรุง
              </div>
              <div>
                <h1 className="text-2xl font-semibold tracking-tight text-slate-950 sm:text-3xl">
                  จัดการการบำรุงรักษา
                </h1>
                <p className="mt-1 text-sm text-slate-600">
                  กำหนดรอบซ่อม ติดตามสถานะ และควบคุมความพร้อมของรถทุกคันจากจุดเดียว
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={openCreateModal}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-orange-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2"
            >
              <Plus className="h-4 w-4" />
              เพิ่มรายการบำรุงรักษา
            </button>
          </div>
        </section>

        {success && (
          <div className="flex items-start justify-between gap-3 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
            <span>{success}</span>
            <button
              type="button"
              onClick={() => setSuccess("")}
              className="rounded-md p-1 text-emerald-700 transition hover:bg-emerald-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              aria-label="ปิดข้อความสำเร็จ"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        {error && !showModal && (
          <div className="flex items-start justify-between gap-3 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">
            <span>{error}</span>
            <button
              type="button"
              onClick={() => setError("")}
              className="rounded-md p-1 text-rose-700 transition hover:bg-rose-100 focus:outline-none focus:ring-2 focus:ring-rose-500"
              aria-label="ปิดข้อความผิดพลาด"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        <section className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {statusFilters.map((stat) => {
            const value =
              stat.value === ""
                ? stats.total
                : stat.value === "REPORTED"
                  ? stats.pending
                  : stat.value === "IN_PROGRESS"
                    ? stats.inProgress
                    : stats.completed
            const isActive = filterStatus === stat.value

            return (
              <button
                type="button"
                key={stat.label}
                onClick={() => setFilterStatus(stat.value)}
                className={`rounded-xl bg-white p-4 text-left shadow-sm ring-1 transition hover:-translate-y-0.5 hover:shadow-md ${
                  isActive ? "ring-2 ring-orange-300" : "ring-slate-200"
                }`}
              >
                <p className="text-sm font-medium text-slate-500">{stat.label}</p>
                <p className="mt-2 text-3xl font-semibold text-slate-950">{value}</p>
                <p className="mt-1 text-xs text-slate-500">{stat.description}</p>
              </button>
            )
          })}
        </section>

        <section className="overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-slate-200">
          <div className="flex flex-col gap-3 border-b border-slate-200 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-orange-50 p-2 text-orange-700">
                <Wrench className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-base font-semibold text-slate-950">รายการบำรุงรักษา</h2>
                <p className="text-sm text-slate-500">แสดง {filteredMaintenances.length} จาก {maintenances.length} รายการ</p>
              </div>
            </div>
            {filterStatus && (
              <button
                type="button"
                onClick={() => setFilterStatus("")}
                className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                <SlidersHorizontal className="h-4 w-4" />
                ล้างตัวกรอง
              </button>
            )}
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-[1120px] w-full divide-y divide-slate-200">
              <thead className="bg-slate-50">
                <tr>
                  {["รถ", "รายละเอียด", "ศูนย์บริการ/ช่าง", "ค่าใช้จ่าย", "วันที่เริ่ม", "วันที่เสร็จ", "สถานะ", "ผู้รายงาน", "การดำเนินการ"].map((heading) => (
                    <th key={heading} className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                      {heading}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {loading ? (
                  <tr>
                    <td colSpan={9} className="px-5 py-12 text-center text-sm text-slate-500">
                      กำลังโหลดข้อมูล...
                    </td>
                  </tr>
                ) : filteredMaintenances.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="px-5 py-12 text-center text-sm text-slate-500">
                      ไม่พบรายการบำรุงรักษาตามตัวกรองนี้
                    </td>
                  </tr>
                ) : (
                  filteredMaintenances.map((item) => (
                    <tr key={item.id} className="transition hover:bg-slate-50">
                      <td className="px-5 py-4 align-top">
                        <p className="font-semibold text-slate-950">{item.vehicle.plateNumber}</p>
                        <p className="text-sm text-slate-500">{item.vehicle.type.name}</p>
                        <span className={`mt-2 inline-flex rounded-full px-2 py-0.5 text-xs font-medium ring-1 ${getVehicleStatusClass(item.vehicle.status)}`}>
                          {getVehicleStatusText(item.vehicle.status)}
                        </span>
                      </td>
                      <td className="px-5 py-4 align-top">
                        <p className="max-w-xs truncate text-sm font-medium text-slate-900" title={item.description}>
                          {item.description}
                        </p>
                        {item.repairDetails && (
                          <p className="mt-1 max-w-xs truncate text-xs text-slate-500" title={item.repairDetails}>
                            {item.repairDetails}
                          </p>
                        )}
                      </td>
                      <td className="px-5 py-4 align-top text-sm text-slate-700">
                        {item.serviceCenterName || <span className="text-slate-400">-</span>}
                      </td>
                      <td className="px-5 py-4 align-top text-sm font-medium text-slate-900">
                        {item.cost ? `฿${item.cost.toLocaleString()}` : <span className="text-slate-400">-</span>}
                      </td>
                      <td className="whitespace-nowrap px-5 py-4 align-top text-sm text-slate-700">
                        {formatDateTime(item.startDate)}
                      </td>
                      <td className="whitespace-nowrap px-5 py-4 align-top text-sm text-slate-700">
                        {item.endDate ? formatDateTime(item.endDate) : <span className="text-slate-400">-</span>}
                      </td>
                      <td className="whitespace-nowrap px-5 py-4 align-top">
                        <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${getMaintenanceStatusColor(item.status)}`}>
                          {getMaintenanceStatusText(item.status)}
                        </span>
                      </td>
                      <td className="px-5 py-4 align-top">
                        <p className="text-sm font-medium text-slate-900">{item.reporter.name}</p>
                        <p className="text-xs text-slate-500">{item.reporter.email}</p>
                      </td>
                      <td className="whitespace-nowrap px-5 py-4 align-top">
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => openEditModal(item)}
                            className="rounded-lg p-2 text-blue-600 transition hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            title="แก้ไข"
                            aria-label={`แก้ไขรายการ ${item.description}`}
                          >
                            <Pencil className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(item)}
                            className="rounded-lg p-2 text-rose-600 transition hover:bg-rose-50 focus:outline-none focus:ring-2 focus:ring-rose-500"
                            title="ลบ"
                            aria-label={`ลบรายการ ${item.description}`}
                          >
                            <Trash2 className="h-4 w-4" />
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

        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/55 px-4 py-6 backdrop-blur-sm">
            <div
              role="dialog"
              aria-modal="true"
              aria-labelledby="maintenance-modal-title"
              className="max-h-[90vh] w-full max-w-2xl overflow-hidden rounded-xl bg-white shadow-2xl ring-1 ring-slate-900/10"
            >
              <div className="flex items-start justify-between gap-4 border-b border-slate-200 px-5 py-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-orange-700">
                    Maintenance Control
                  </p>
                  <h3 id="maintenance-modal-title" className="mt-1 text-lg font-semibold text-slate-950">
                    {editingItem ? "แก้ไขรายการบำรุงรักษา" : "เพิ่มรายการบำรุงรักษา"}
                  </h3>
                  <p className="mt-1 text-sm text-slate-500">
                    ระบุช่วงเวลา รายละเอียดงาน และสถานะเพื่อให้ตารางรถพร้อมใช้งานถูกต้อง
                  </p>
                </div>
                <button
                  type="button"
                  onClick={closeModal}
                  className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-700 focus:outline-none focus:ring-2 focus:ring-orange-500"
                  aria-label="ปิดหน้าต่าง"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="max-h-[calc(90vh-96px)] overflow-y-auto p-5">
                <div className="space-y-5">
                  {error && (
                    <div className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">
                      {error}
                    </div>
                  )}

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="sm:col-span-2">
                      <label htmlFor="maintenance-vehicle" className="mb-1.5 block text-sm font-medium text-slate-700">
                        รถ <span className="text-rose-500">*</span>
                      </label>
                      <select
                        id="maintenance-vehicle"
                        required
                        value={formData.vehicleId}
                        onChange={(event) => setFormData({ ...formData, vehicleId: event.target.value })}
                        disabled={!!editingItem}
                        className={fieldClass}
                      >
                        <option value="">เลือกรถ</option>
                        {vehicles.map((vehicle) => (
                          <option key={vehicle.id} value={vehicle.id}>
                            {vehicle.plateNumber} ({vehicle.type.name})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="sm:col-span-2">
                      <label htmlFor="maintenance-description" className="mb-1.5 block text-sm font-medium text-slate-700">
                        รายละเอียด <span className="text-rose-500">*</span>
                      </label>
                      <textarea
                        id="maintenance-description"
                        required
                        rows={3}
                        value={formData.description}
                        onChange={(event) => setFormData({ ...formData, description: event.target.value })}
                        placeholder="เช่น ตรวจเช็กระยะ เปลี่ยนน้ำมันเครื่อง หรือซ่อมระบบเบรก"
                        className={fieldClass}
                      />
                    </div>

                    <div>
                      <label htmlFor="maintenance-start" className="mb-1.5 block text-sm font-medium text-slate-700">
                        วันที่เริ่ม <span className="text-rose-500">*</span>
                      </label>
                      <input
                        id="maintenance-start"
                        type="datetime-local"
                        required
                        value={formData.startDate}
                        onChange={(event) => setFormData({ ...formData, startDate: event.target.value })}
                        className={fieldClass}
                      />
                    </div>

                    <div>
                      <label htmlFor="maintenance-end" className="mb-1.5 block text-sm font-medium text-slate-700">
                        วันที่เสร็จ {formData.status === "COMPLETED" && <span className="text-rose-500">*</span>}
                      </label>
                      <input
                        id="maintenance-end"
                        type="datetime-local"
                        required={formData.status === "COMPLETED"}
                        value={formData.endDate}
                        onChange={(event) => setFormData({ ...formData, endDate: event.target.value })}
                        className={fieldClass}
                      />
                    </div>

                    <div>
                      <label htmlFor="maintenance-status" className="mb-1.5 block text-sm font-medium text-slate-700">
                        สถานะ
                      </label>
                      <select
                        id="maintenance-status"
                        value={formData.status}
                        onChange={(event) => setFormData({ ...formData, status: event.target.value as MaintenanceStatus })}
                        className={fieldClass}
                      >
                        <option value="REPORTED">รายงานแล้ว</option>
                        <option value="IN_PROGRESS">กำลังซ่อม</option>
                        <option value="COMPLETED">เสร็จสิ้น</option>
                      </select>
                    </div>

                    <div>
                      <label htmlFor="maintenance-cost" className="mb-1.5 block text-sm font-medium text-slate-700">
                        ค่าใช้จ่าย (บาท)
                      </label>
                      <input
                        id="maintenance-cost"
                        type="number"
                        min="0"
                        step="0.01"
                        value={formData.cost}
                        onChange={(event) => setFormData({ ...formData, cost: event.target.value })}
                        placeholder="0.00"
                        className={fieldClass}
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label htmlFor="maintenance-service-center" className="mb-1.5 block text-sm font-medium text-slate-700">
                        ศูนย์บริการ / ช่าง
                      </label>
                      <input
                        id="maintenance-service-center"
                        type="text"
                        value={formData.serviceCenterName}
                        onChange={(event) => setFormData({ ...formData, serviceCenterName: event.target.value })}
                        placeholder="เช่น ศูนย์บริการหลัก หรือชื่ออู่ที่รับงาน"
                        className={fieldClass}
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label htmlFor="maintenance-repair-details" className="mb-1.5 block text-sm font-medium text-slate-700">
                        รายละเอียดการซ่อมเพิ่มเติม
                      </label>
                      <textarea
                        id="maintenance-repair-details"
                        rows={3}
                        value={formData.repairDetails}
                        onChange={(event) => setFormData({ ...formData, repairDetails: event.target.value })}
                        placeholder="บันทึกอะไหล่ที่เปลี่ยน งานที่ทำ หรือหมายเหตุจากช่าง"
                        className={fieldClass}
                      />
                    </div>
                  </div>
                </div>

                <div className="mt-6 flex flex-col-reverse gap-3 border-t border-slate-200 pt-4 sm:flex-row sm:justify-end">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="inline-flex justify-center rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-orange-500"
                  >
                    ยกเลิก
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="inline-flex justify-center rounded-lg bg-orange-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
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
