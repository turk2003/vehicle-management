"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { Plus } from "lucide-react"
import api from "@/lib/api"
import { usePermissions } from "@/lib/use-permissions"
import type * as React from "react"
import type { Maintenance, Vehicle, MaintenanceForm } from "./types"
import { getInitialFormData, getErrorMessage, buildStats } from "./utils"
import MaintenanceStatsPanel from "./_components/MaintenanceStatsPanel"
import MaintenanceTable from "./_components/MaintenanceTable"
import ReportMaintenanceModal from "./_components/ReportMaintenanceModal"

export default function UserMaintenancePage() {
  const { hasPermission } = usePermissions()
  const canReportMaintenance = hasPermission("MAINTENANCE_REPORT")
  const [maintenances, setMaintenances] = useState<Maintenance[]>([])
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [showModal, setShowModal] = useState(false)
  const [formData, setFormData] =
    useState<MaintenanceForm>(getInitialFormData)

  const stats = useMemo(() => buildStats(maintenances), [maintenances])

  const fetchData = useCallback(async () => {
    try {
      setLoading(true)
      setError("")
      const [maintenanceRes, vehicleRes] = await Promise.all([
        api.get<Maintenance[]>("/api/user/maintenance"),
        api.get<Vehicle[]>("/api/verhicle"),
      ])
      setMaintenances(maintenanceRes.data)
      setVehicles(vehicleRes.data)
    } catch {
      setError("ไม่สามารถโหลดข้อมูลซ่อมบำรุงได้")
    } finally {
      setLoading(false)
    }
  }, [])

  const openReportModal = () => {
    setFormData(getInitialFormData())
    setError("")
    setSuccess("")
    setShowModal(true)
  }

  const closeReportModal = useCallback(() => {
    setShowModal(false)
    setFormData(getInitialFormData())
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      setLoading(true)
      setError("")

      await api.post("/api/user/maintenance", formData)
      setSuccess("แจ้งซ่อมเรียบร้อยแล้ว")
      closeReportModal()
      await fetchData()
    } catch (error: unknown) {
      setError(getErrorMessage(error, "เกิดข้อผิดพลาด"))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [fetchData])

  useEffect(() => {
    if (!showModal) return

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeReportModal()
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [closeReportModal, showModal])

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <header className="mb-6 rounded-xl bg-white p-6 shadow-sm ring-1 ring-gray-200">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="mb-2 text-sm font-medium text-blue-700">
                ผู้ใช้งาน
              </p>
              <h1 className="text-2xl font-bold leading-tight text-gray-950">
                แจ้งซ่อมบำรุงรถ
              </h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-600">
                รายงานปัญหารถที่พบระหว่างใช้งาน และติดตามสถานะการซ่อมบำรุงของรายการที่คุณแจ้ง
              </p>
            </div>

            {canReportMaintenance && (
              <button
                type="button"
                onClick={openReportModal}
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors duration-150 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-600/25"
              >
                <Plus className="h-4 w-4" aria-hidden="true" />
                แจ้งซ่อม
              </button>
            )}
          </div>
        </header>

        {success && (
          <div
            role="status"
            className="mb-4 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800"
          >
            {success}
          </div>
        )}

        {error && !showModal && (
          <div
            role="alert"
            aria-live="polite"
            className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"
          >
            {error}
          </div>
        )}

        <MaintenanceStatsPanel
          stats={stats}
        />

        <MaintenanceTable
          maintenances={maintenances}
          loading={loading}
        />

        {showModal && (
          <ReportMaintenanceModal
            closeReportModal={closeReportModal}
            handleSubmit={handleSubmit}
            error={error}
            formData={formData}
            setFormData={setFormData}
            vehicles={vehicles}
            loading={loading}
          />
        )}
      </div>
    </main>
  )
}
