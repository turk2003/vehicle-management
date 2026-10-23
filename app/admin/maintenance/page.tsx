"use client"

import axios from "axios"
import { FormEvent, useEffect, useState } from "react"
import { Plus, Wrench, X } from "lucide-react"
import api from "@/lib/api"
import { formatDateTime } from "@/lib/format"
import { usePermissions } from "@/lib/use-permissions"
import type { MaintenanceStatus, AffectedBooking, Maintenance, Vehicle, FormData } from "./types"
import { defaultForm } from "./constants"
import { getApiErrorMessage, isAffectedBookingsConflict } from "./utils"
import MaintenanceStatusFilters from "./_components/MaintenanceStatusFilters"
import MaintenanceTable from "./_components/MaintenanceTable"
import MaintenanceFormModal from "./_components/MaintenanceFormModal"

export default function AdminMaintenancePage() {
  const { hasPermission } = usePermissions()
  const canManageMaintenance = hasPermission("MAINTENANCE_MANAGE")
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
      maintenanceType: item.maintenanceType,
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

    if (!formData.maintenanceType) return "กรุณาเลือกประเภทงานซ่อม"

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

        const affectedBookings = axios.isAxiosError<{
          affectedBookings?: AffectedBooking[]
        }>(err)
          ? err.response?.data?.affectedBookings || []
          : []
        const affectedDetails = affectedBookings
          .map(
            (booking) =>
              `• ${booking.user.name} — ${booking.purpose}${
                booking.destination ? ` (${booking.destination})` : ""
              }\n  ${formatDateTime(booking.startDate)} – ${formatDateTime(booking.endDate)}`,
          )
          .join("\n")
        const confirmed = window.confirm(
          `ช่วงซ่อมนี้กระทบการจอง ${affectedBookings.length} รายการ:\n\n${affectedDetails}\n\nต้องการยืนยันและดำเนินการเปลี่ยนรถให้ผู้จองต่อหรือไม่?`,
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
            {canManageMaintenance && (
              <button
                type="button"
                onClick={openCreateModal}
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-orange-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2"
              >
                <Plus className="h-4 w-4" />
                เพิ่มรายการบำรุงรักษา
              </button>
            )}
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

        <MaintenanceStatusFilters
          stats={stats}
          filterStatus={filterStatus}
          setFilterStatus={setFilterStatus}
        />

        <MaintenanceTable
          filteredMaintenances={filteredMaintenances}
          maintenances={maintenances}
          filterStatus={filterStatus}
          setFilterStatus={setFilterStatus}
          loading={loading}
          canManageMaintenance={canManageMaintenance}
          openEditModal={openEditModal}
          handleDelete={handleDelete}
        />

        {showModal && (
          <MaintenanceFormModal
            editingItem={editingItem}
            closeModal={closeModal}
            handleSubmit={handleSubmit}
            error={error}
            formData={formData}
            setFormData={setFormData}
            vehicles={vehicles}
            loading={loading}
          />
        )}
      </div>
    </div>
  )
}
