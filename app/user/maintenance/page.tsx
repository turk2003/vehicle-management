"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import type { AxiosError } from "axios"
import { CalendarDays, History, Plus, Wrench, X } from "lucide-react"
import api from "@/lib/api"
import {
  formatDateTime,
  getMaintenanceStatusColor,
  getMaintenanceStatusText,
} from "@/lib/format"

type MaintenanceType = "BREAKDOWN" | "PREVENTIVE" | "OTHER" | "UNSPECIFIED"

type Maintenance = {
  id: string
  description: string
  maintenanceType: MaintenanceType
  status: string
  startDate: string
  endDate?: string | null
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

type MaintenanceForm = {
  vehicleId: string
  description: string
  maintenanceType: "" | Exclude<MaintenanceType, "UNSPECIFIED">
  startDate: string
}

type MaintenanceStats = {
  total: number
  reported: number
  in_progress: number
  completed: number
}

const INITIAL_STATS: MaintenanceStats = {
  total: 0,
  reported: 0,
  in_progress: 0,
  completed: 0,
}

function getLocalDateTimeInputValue(date = new Date()) {
  const localDate = new Date(date)
  localDate.setMinutes(localDate.getMinutes() - localDate.getTimezoneOffset())
  return localDate.toISOString().slice(0, 16)
}

function getInitialFormData(): MaintenanceForm {
  return {
    vehicleId: "",
    description: "",
    maintenanceType: "",
    startDate: getLocalDateTimeInputValue(),
  }
}

function getErrorMessage(error: unknown, fallback: string) {
  const axiosError = error as AxiosError<{ message?: string }>
  return axiosError.response?.data?.message || fallback
}

function buildStats(maintenances: Maintenance[]): MaintenanceStats {
  return maintenances.reduce<MaintenanceStats>((acc, maintenance) => {
    acc.total += 1
    const key = maintenance.status.toLowerCase() as keyof MaintenanceStats

    if (key in acc && key !== "total") {
      acc[key] += 1
    }

    return acc
  }, { ...INITIAL_STATS })
}

const maintenanceTypeLabels: Record<MaintenanceType, string> = {
  BREAKDOWN: "ซ่อมจากความขัดข้อง",
  PREVENTIVE: "บำรุงรักษาตามรอบ",
  OTHER: "งานซ่อมอื่น",
  UNSPECIFIED: "ยังไม่ระบุประเภท",
}

export default function UserMaintenancePage() {
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

            <button
              type="button"
              onClick={openReportModal}
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors duration-150 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-600/25"
            >
              <Plus className="h-4 w-4" aria-hidden="true" />
              แจ้งซ่อม
            </button>
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

        <section className="mb-6 grid grid-cols-2 gap-3 md:grid-cols-4">
          {[
            {
              label: "ทั้งหมด",
              value: stats.total,
              color: "text-gray-950",
              icon: History,
            },
            {
              label: "แจ้งแล้ว",
              value: stats.reported,
              color: "text-yellow-700",
              icon: Wrench,
            },
            {
              label: "กำลังซ่อม",
              value: stats.in_progress,
              color: "text-blue-700",
              icon: Wrench,
            },
            {
              label: "เสร็จสิ้น",
              value: stats.completed,
              color: "text-green-700",
              icon: CalendarDays,
            },
          ].map((item) => {
            const Icon = item.icon

            return (
              <div
                key={item.label}
                className="rounded-xl bg-white p-4 shadow-sm ring-1 ring-gray-200"
              >
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-medium text-gray-600">
                    {item.label}
                  </p>
                  <Icon className="h-4 w-4 text-gray-500" aria-hidden="true" />
                </div>
                <p className={`mt-2 text-2xl font-bold ${item.color}`}>
                  {item.value}
                </p>
              </div>
            )
          })}
        </section>

        <section
          className="overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-gray-200"
          aria-labelledby="maintenance-history-title"
        >
          <div className="flex items-center gap-2 border-b border-gray-200 px-6 py-4">
            <History className="h-5 w-5 text-blue-700" aria-hidden="true" />
            <div>
              <h2
                id="maintenance-history-title"
                className="text-lg font-semibold text-gray-950"
              >
                ประวัติการแจ้งซ่อมของฉัน
              </h2>
              <p className="mt-1 text-sm text-gray-600">
                ทั้งหมด {maintenances.length} รายการ
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[980px]">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-600">
                    รถ
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-600">
                    รายละเอียดปัญหา
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-600">
                    ประเภท
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-600">
                    วันที่พบปัญหา
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-600">
                    สถานะ
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {loading && maintenances.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-10 text-center">
                      <div className="mx-auto h-5 w-48 animate-pulse rounded bg-gray-200" />
                    </td>
                  </tr>
                ) : maintenances.length === 0 ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-6 py-12 text-center text-sm text-gray-600"
                    >
                      คุณยังไม่มีประวัติการแจ้งซ่อม
                    </td>
                  </tr>
                ) : (
                  maintenances.map((item) => (
                    <tr
                      key={item.id}
                      className="transition-colors duration-150 hover:bg-gray-50"
                    >
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-950">
                          {item.vehicle.plateNumber}
                        </div>
                        <div className="text-sm text-gray-600">
                          {item.vehicle.type.name}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <p className="max-w-md text-sm leading-6 text-gray-950">
                          {item.description}
                        </p>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700">
                        {maintenanceTypeLabels[item.maintenanceType]}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700">
                        {formatDateTime(item.startDate)}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${getMaintenanceStatusColor(item.status)}`}
                        >
                          {getMaintenanceStatusText(item.status)}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>

        {showModal && (
          <div
            className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-gray-900/50 px-4 py-8"
            role="dialog"
            aria-modal="true"
            aria-labelledby="maintenance-report-title"
          >
            <div className="w-full max-w-lg rounded-xl bg-white shadow-lg ring-1 ring-gray-200">
              <div className="flex items-start justify-between gap-4 border-b border-gray-200 px-6 py-5">
                <div>
                  <h3
                    id="maintenance-report-title"
                    className="text-lg font-semibold text-gray-950"
                  >
                    แจ้งรถเสีย / ส่งซ่อม
                  </h3>
                  <p className="mt-1 text-sm text-gray-600">
                    ระบุรถและรายละเอียดปัญหาเพื่อส่งเข้าคิวซ่อมบำรุง
                  </p>
                </div>
                <button
                  type="button"
                  onClick={closeReportModal}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-md text-gray-500 transition-colors duration-150 hover:bg-gray-100 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-600/25"
                  aria-label="ปิดหน้าต่าง"
                >
                  <X className="h-5 w-5" aria-hidden="true" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5 px-6 py-6">
                {error && (
                  <div
                    role="alert"
                    className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"
                  >
                    {error}
                  </div>
                )}

                <div>
                  <label
                    htmlFor="maintenance-vehicle"
                    className="mb-1.5 block text-sm font-medium text-gray-700"
                  >
                    เลือกรถที่พบปัญหา{" "}
                    <span className="text-red-700">*</span>
                  </label>
                  <select
                    id="maintenance-vehicle"
                    required
                    value={formData.vehicleId}
                    onChange={(e) =>
                      setFormData((current) => ({
                        ...current,
                        vehicleId: e.target.value,
                      }))
                    }
                    className="min-h-11 w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-gray-950 transition-colors duration-150 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600/25"
                  >
                    <option value="">เลือกรถ</option>
                    {vehicles.map((vehicle) => (
                      <option key={vehicle.id} value={vehicle.id}>
                        {vehicle.plateNumber} ({vehicle.type.name})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="maintenance-type"
                    className="mb-1.5 block text-sm font-medium text-gray-700"
                  >
                    ประเภทงานซ่อม <span className="text-red-700">*</span>
                  </label>
                  <select
                    id="maintenance-type"
                    required
                    value={formData.maintenanceType}
                    onChange={(e) =>
                      setFormData((current) => ({
                        ...current,
                        maintenanceType: e.target.value as MaintenanceForm["maintenanceType"],
                      }))
                    }
                    className="min-h-11 w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-gray-950 transition-colors duration-150 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600/25"
                  >
                    <option value="">เลือกประเภทงานซ่อม</option>
                    <option value="BREAKDOWN">ซ่อมจากความขัดข้อง</option>
                    <option value="PREVENTIVE">บำรุงรักษาตามรอบ</option>
                    <option value="OTHER">งานซ่อมอื่น</option>
                  </select>
                  <p className="mt-1.5 text-sm text-gray-600">
                    ช่วยให้รายงานแยกเหตุขัดข้องออกจากการดูแลรถตามแผน
                  </p>
                </div>

                <div>
                  <label
                    htmlFor="maintenance-description"
                    className="mb-1.5 block text-sm font-medium text-gray-700"
                  >
                    รายละเอียดปัญหา <span className="text-red-700">*</span>
                  </label>
                  <textarea
                    id="maintenance-description"
                    required
                    rows={4}
                    value={formData.description}
                    onChange={(e) =>
                      setFormData((current) => ({
                        ...current,
                        description: e.target.value,
                      }))
                    }
                    placeholder="เช่น แอร์ไม่เย็น, ยางแบน, ไฟหน้าไม่ติด"
                    className="min-h-28 w-full resize-none rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-gray-950 transition-colors duration-150 placeholder:text-gray-500 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600/25"
                  />
                </div>

                <div>
                  <label
                    htmlFor="maintenance-start-date"
                    className="mb-1.5 block text-sm font-medium text-gray-700"
                  >
                    วันที่พบปัญหา <span className="text-red-700">*</span>
                  </label>
                  <input
                    id="maintenance-start-date"
                    type="datetime-local"
                    required
                    value={formData.startDate}
                    onChange={(e) =>
                      setFormData((current) => ({
                        ...current,
                        startDate: e.target.value,
                      }))
                    }
                    max={getLocalDateTimeInputValue()}
                    className="min-h-11 w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-gray-950 transition-colors duration-150 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600/25"
                  />
                </div>

                <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                  <button
                    type="button"
                    onClick={closeReportModal}
                    className="inline-flex min-h-11 items-center justify-center rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 transition-colors duration-150 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-600/25"
                  >
                    ยกเลิก
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors duration-150 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-600/25 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <Wrench className="h-4 w-4" aria-hidden="true" />
                    {loading ? "กำลังบันทึก..." : "ยืนยันแจ้งซ่อม"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </main>
  )
}
