"use client"

import axios from "axios"
import { useEffect, useMemo, useState } from "react"
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip as RechartsTooltip, XAxis, YAxis } from "recharts"
import { BarChart3, Car, Filter, Route, RotateCcw, Wrench } from "lucide-react"
import api from "@/lib/api"
import { formatDateTime, getVehicleStatusColor, getVehicleStatusText } from "@/lib/format"
import AiUsageSummaryCard from "./AiUsageSummaryCard"

type VehicleOption = {
  id: string
  plateNumber: string
}

type VehicleHistoryItem = {
  vehicleId: string
  plateNumber: string
  vehicleType: string
  currentStatus: string
  currentMileage: number
  usageCount: number
  maintenanceCount: number
  uniqueUsersCount: number
  totalDistanceKm: number
  avgDistancePerTripKm: number
  lastUsedAt: string | null
}

type VehicleHistoryResponse = {
  items?: VehicleHistoryItem[]
}

type Filters = {
  vehicleId: string
  startDate: string
  endDate: string
}

type ChartMetric = {
  title: string
  description: string
  dataKey: "usageCount" | "totalDistanceKm" | "maintenanceCount"
  name: string
  fill: string
}

const getBangkokToday = () =>
  new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Bangkok",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date())

const bangkokToday = getBangkokToday()

const defaultFilters: Filters = {
  vehicleId: "",
  startDate: `${bangkokToday.slice(0, 8)}01`,
  endDate: bangkokToday,
}

const fieldClass =
  "w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-100"

const chartMetrics: ChartMetric[] = [
  {
    title: "จำนวนครั้งที่ใช้งาน",
    description: "ดูรถที่ถูกใช้งานถี่ที่สุดในช่วงเวลานี้",
    dataKey: "usageCount",
    name: "จำนวนครั้ง",
    fill: "#2563eb",
  },
  {
    title: "ระยะทางรวม",
    description: "เปรียบเทียบภาระการวิ่งของรถแต่ละคัน",
    dataKey: "totalDistanceKm",
    name: "กิโลเมตร",
    fill: "#4f46e5",
  },
  {
    title: "จำนวนครั้งที่ซ่อม",
    description: "จับสัญญาณรถที่ต้องบำรุงรักษาบ่อย",
    dataKey: "maintenanceCount",
    name: "ครั้ง",
    fill: "#ea580c",
  },
]

const getApiErrorMessage = (error: unknown, fallback: string) => {
  if (axios.isAxiosError<{ message?: string }>(error)) {
    return error.response?.data?.message || fallback
  }

  return fallback
}

function ChartCard({ metric, items }: { metric: ChartMetric; items: VehicleHistoryItem[] }) {
  return (
    <div className="rounded-xl bg-white p-4 shadow-sm ring-1 ring-slate-200">
      <div className="mb-4">
        <h3 className="text-sm font-semibold text-slate-950">{metric.title}</h3>
        <p className="mt-1 text-xs text-slate-500">{metric.description}</p>
      </div>
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={items} margin={{ top: 8, right: 8, left: -18, bottom: 8 }}>
            <CartesianGrid stroke="#e2e8f0" strokeDasharray="3 3" vertical={false} />
            <XAxis
              dataKey="plateNumber"
              tick={{ fontSize: 12, fill: "#475569" }}
              axisLine={false}
              tickLine={false}
              interval={0}
              angle={-40}
              textAnchor="end"
              height={60}
            />
            <YAxis tick={{ fontSize: 12, fill: "#475569" }} axisLine={false} tickLine={false} />
            <RechartsTooltip
              cursor={{ fill: "#f8fafc" }}
              contentStyle={{
                border: "1px solid #e2e8f0",
                borderRadius: 8,
                boxShadow: "0 4px 8px rgba(15, 23, 42, 0.08)",
                color: "#0f172a",
              }}
            />
            <Bar dataKey={metric.dataKey} name={metric.name} fill={metric.fill} radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

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

        <section className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { label: "จำนวนรถ", value: summary.totalVehicles.toLocaleString(), icon: Car, helper: "คันที่อยู่ในรายงาน" },
            { label: "จำนวนเที่ยวใช้งาน", value: summary.totalTrips.toLocaleString(), icon: Route, helper: "เที่ยวรวมทั้งหมด" },
            { label: "ระยะทางรวม", value: `${summary.totalDistanceKm.toLocaleString()} กม.`, icon: BarChart3, helper: "ระยะทางสะสม" },
            { label: "จำนวนครั้งซ่อม", value: summary.totalMaintenance.toLocaleString(), icon: Wrench, helper: "รายการซ่อมรวม" },
          ].map((stat) => {
            const Icon = stat.icon

            return (
              <div key={stat.label} className="rounded-xl bg-white p-4 shadow-sm ring-1 ring-slate-200">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-medium text-slate-500">{stat.label}</p>
                  <span className="rounded-lg bg-orange-50 p-2 text-orange-700">
                    <Icon className="h-4 w-4" />
                  </span>
                </div>
                <p className="mt-3 text-2xl font-semibold text-slate-950">{stat.value}</p>
                <p className="mt-1 text-xs text-slate-500">{stat.helper}</p>
              </div>
            )
          })}
        </section>

        <section className="rounded-xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
          <div className="flex flex-col gap-3 border-b border-slate-200 pb-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-slate-100 p-2 text-slate-700">
                <Filter className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-base font-semibold text-slate-950">ตัวกรองรายงาน</h2>
                <p className="text-sm text-slate-500">เลือกช่วงเวลาและรถที่ต้องการตรวจสอบ</p>
              </div>
            </div>
            {hasFilters && (
              <button
                type="button"
                onClick={() => setFilters(defaultFilters)}
                className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                <RotateCcw className="h-4 w-4" />
                ล้างตัวกรอง
              </button>
            )}
          </div>

          <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-3">
            <div>
              <label htmlFor="history-vehicle" className="mb-1.5 block text-sm font-medium text-slate-700">
                รถ
              </label>
              <select
                id="history-vehicle"
                value={filters.vehicleId}
                onChange={(event) => setFilters((prev) => ({ ...prev, vehicleId: event.target.value }))}
                className={fieldClass}
              >
                <option value="">ทุกคัน</option>
                {vehicleOptions.map((vehicle) => (
                  <option key={vehicle.id} value={vehicle.id}>
                    {vehicle.plateNumber}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="history-start-date" className="mb-1.5 block text-sm font-medium text-slate-700">
                วันที่เริ่มต้น
              </label>
              <input
                id="history-start-date"
                type="date"
                required
                value={filters.startDate}
                max={filters.endDate || bangkokToday}
                onChange={(event) => setFilters((prev) => ({ ...prev, startDate: event.target.value }))}
                className={fieldClass}
              />
            </div>
            <div>
              <label htmlFor="history-end-date" className="mb-1.5 block text-sm font-medium text-slate-700">
                วันที่สิ้นสุด
              </label>
              <input
                id="history-end-date"
                type="date"
                required
                value={filters.endDate}
                min={filters.startDate || undefined}
                max={bangkokToday}
                onChange={(event) => setFilters((prev) => ({ ...prev, endDate: event.target.value }))}
                className={fieldClass}
              />
            </div>
          </div>
        </section>

        <AiUsageSummaryCard
          filters={filters}
          historyLoading={loading}
          hasUsageData={summary.totalTrips > 0}
        />

        {items.length > 0 && (
          <section className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            {chartMetrics.map((metric) => (
              <ChartCard key={metric.dataKey} metric={metric} items={items} />
            ))}
          </section>
        )}

        <section className="overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-slate-200">
          <div className="flex flex-col gap-1 border-b border-slate-200 px-5 py-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-base font-semibold text-slate-950">ตารางประวัติรถ</h2>
              <p className="text-sm text-slate-500">แสดงข้อมูลรวมตามรถ {hasFilters ? "จากตัวกรองที่เลือก" : "ทุกคัน"}</p>
            </div>
            <p className="text-sm text-slate-500">{items.length.toLocaleString()} รายการ</p>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-[960px] w-full divide-y divide-slate-200">
              <thead className="bg-slate-50">
                <tr>
                  {["รถ", "สถานะปัจจุบัน", "จำนวนใช้งาน", "ระยะทางรวม", "ผู้ใช้งานไม่ซ้ำ", "จำนวนซ่อม", "ใช้งานล่าสุด"].map((heading) => (
                    <th key={heading} className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                      {heading}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="px-5 py-12 text-center text-sm text-slate-500">
                      กำลังโหลดประวัติรถ...
                    </td>
                  </tr>
                ) : items.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-5 py-12 text-center">
                      <div className="mx-auto max-w-md">
                        <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-500">
                          <Car className="h-5 w-5" />
                        </div>
                        <p className="mt-3 text-sm font-semibold text-slate-900">ไม่พบข้อมูลประวัติรถ</p>
                        <p className="mt-1 text-sm text-slate-500">
                          ลองเปลี่ยนช่วงวันที่หรือเลือกรถคันอื่นเพื่อดูข้อมูลการใช้งาน
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  items.map((item) => (
                    <tr key={item.vehicleId} className="transition hover:bg-slate-50">
                      <td className="whitespace-nowrap px-5 py-4">
                        <p className="text-sm font-semibold text-slate-950">{item.plateNumber}</p>
                        <p className="text-sm text-slate-500">{item.vehicleType}</p>
                        <p className="mt-1 text-xs text-slate-500">
                          ไมล์ปัจจุบัน: {item.currentMileage.toLocaleString()} กม.
                        </p>
                      </td>
                      <td className="whitespace-nowrap px-5 py-4">
                        <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${getVehicleStatusColor(item.currentStatus)}`}>
                          {getVehicleStatusText(item.currentStatus)}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-5 py-4 text-sm font-medium text-slate-900">
                        {item.usageCount.toLocaleString()} ครั้ง
                      </td>
                      <td className="whitespace-nowrap px-5 py-4 text-sm text-slate-900">
                        <p className="font-medium">{item.totalDistanceKm.toLocaleString()} กม.</p>
                        <p className="text-xs text-slate-500">
                          เฉลี่ย {item.avgDistancePerTripKm.toLocaleString()} กม./เที่ยว
                        </p>
                      </td>
                      <td className="whitespace-nowrap px-5 py-4 text-sm text-slate-900">
                        {item.uniqueUsersCount.toLocaleString()} คน
                      </td>
                      <td className="whitespace-nowrap px-5 py-4 text-sm text-slate-900">
                        {item.maintenanceCount.toLocaleString()} ครั้ง
                      </td>
                      <td className="whitespace-nowrap px-5 py-4 text-sm text-slate-700">
                        {item.lastUsedAt ? formatDateTime(item.lastUsedAt) : <span className="text-slate-400">ยังไม่มีข้อมูล</span>}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  )
}
