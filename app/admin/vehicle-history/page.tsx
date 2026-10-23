"use client"

import { useEffect, useMemo, useState } from "react"
import { BarChart3 } from "lucide-react"
import api from "@/lib/api"
import AiUsageSummaryCard from "./AiUsageSummaryCard"
import VehicleHistoryDetails from "./VehicleHistoryDetails"
import type { VehicleOption, VehicleHistoryItem, VehicleHistoryResponse, Filters } from "./types"
import { defaultFilters } from "./constants"
import { getApiErrorMessage } from "./utils"
import HistoryStats from "./_components/HistoryStats"
import HistoryFilters from "./_components/HistoryFilters"
import HistoryCharts from "./_components/HistoryCharts"
import HistoryTable from "./_components/HistoryTable"

export default function AdminVehicleHistoryPage() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [items, setItems] = useState<VehicleHistoryItem[]>([])
  const [vehicleOptions, setVehicleOptions] = useState<VehicleOption[]>([])
  const [filters, setFilters] = useState<Filters>(defaultFilters)

  const summary = useMemo(() => {
    return items.reduce(
      (acc, item) => {
        acc.totalVehicles += 1
        acc.totalTrips += item.usageCount
        acc.totalDistanceKm += item.totalDistanceKm
        acc.totalMaintenance += item.maintenanceCount
        return acc
      },
      {
        totalVehicles: 0,
        totalTrips: 0,
        totalDistanceKm: 0,
        totalMaintenance: 0,
      },
    )
  }, [items])

  const hasFilters =
    filters.vehicleId !== defaultFilters.vehicleId ||
    filters.startDate !== defaultFilters.startDate ||
    filters.endDate !== defaultFilters.endDate
  const selectedVehicle = vehicleOptions.find((vehicle) => vehicle.id === filters.vehicleId)

  useEffect(() => {
    const fetchVehicles = async () => {
      try {
        const response = await api.get<VehicleOption[]>("/api/verhicle")
        setVehicleOptions(
          response.data.map((vehicle) => ({
            id: vehicle.id,
            plateNumber: vehicle.plateNumber,
          })),
        )
      } catch {
        setVehicleOptions([])
      }
    }

    fetchVehicles()
  }, [])

  useEffect(() => {
    const fetchHistory = async () => {
      if (Boolean(filters.startDate) !== Boolean(filters.endDate)) {
        setItems([])
        setError("กรุณาระบุวันที่เริ่มต้นและวันที่สิ้นสุดให้ครบ")
        return
      }

      try {
        setLoading(true)
        setError("")

        const params = new URLSearchParams()
        if (filters.vehicleId) params.set("vehicleId", filters.vehicleId)
        if (filters.startDate) params.set("startDate", filters.startDate)
        if (filters.endDate) params.set("endDate", filters.endDate)

        const response = await api.get<VehicleHistoryResponse>(`/api/admin/vehicles/history?${params.toString()}`)
        setItems(response.data.items || [])
      } catch (err) {
        setError(getApiErrorMessage(err, "ไม่สามารถโหลดประวัติการใช้งานรถได้"))
      } finally {
        setLoading(false)
      }
    }

    fetchHistory()
  }, [filters])

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-6 text-slate-900 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <section className="rounded-xl bg-white p-5 shadow-sm ring-1 ring-slate-200 sm:p-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 rounded-full bg-orange-50 px-3 py-1 text-xs font-semibold text-orange-700 ring-1 ring-orange-100">
                <BarChart3 className="h-3.5 w-3.5" />
                รายงานประวัติรถ
              </div>
              <div>
                <h1 className="text-2xl font-semibold tracking-tight text-slate-950 sm:text-3xl">
                  ประวัติการใช้งานรถ
                </h1>
                <p className="mt-1 max-w-3xl text-sm text-slate-600">
                  สรุปการใช้งาน ระยะทาง ผู้ใช้งาน และประวัติซ่อม เพื่อช่วยตัดสินใจเรื่องความพร้อมของรถแต่ละคัน
                </p>
              </div>
            </div>
            <div className="rounded-lg bg-slate-50 px-4 py-3 text-sm text-slate-600 ring-1 ring-slate-200">
              <span className="font-medium text-slate-900">มุมมองปัจจุบัน:</span>{" "}
              {selectedVehicle ? selectedVehicle.plateNumber : "รถทุกคัน"}
            </div>
          </div>
        </section>

        {error && (
          <div className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">
            {error}
          </div>
        )}

        <HistoryStats
          summary={summary}
        />

        <HistoryFilters
          hasFilters={hasFilters}
          setFilters={setFilters}
          filters={filters}
          vehicleOptions={vehicleOptions}
        />

        <AiUsageSummaryCard
          filters={filters}
          historyLoading={loading}
          hasUsageData={summary.totalTrips > 0}
        />

        {items.length > 0 && (
          <HistoryCharts
            items={items}
          />
        )}

        <HistoryTable
          hasFilters={hasFilters}
          items={items}
          loading={loading}
        />

        <VehicleHistoryDetails filters={filters} />
      </div>
    </div>
  )
}
