"use client"

import axios from "axios"
import { useEffect, useRef, useState } from "react"
import { Car, Gauge, Wrench } from "lucide-react"
import api from "@/lib/api"
import {
  formatDateTime,
  getBookingStatusColor,
  getBookingStatusText,
  getMaintenanceStatusColor,
  getMaintenanceStatusText,
} from "@/lib/format"

type Tab = "trips" | "mileage" | "maintenance"

type DetailsFilters = {
  vehicleId: string
  startDate: string
  endDate: string
}

type BookingItem = {
  id: string
  purpose: string
  destination: string | null
  status: string
  startDate: string
  endDate: string
  pickedUpAt: string | null
  returnedAt: string | null
  mileageStart: number | null
  mileageEnd: number | null
  distanceKm: number | null
  effectiveDate: string
  user: { id: string; name: string }
  vehicle: { id: string; plateNumber: string; type: { name: string } }
}

type MaintenanceItem = {
  id: string
  description: string
  repairDetails: string | null
  serviceCenterName: string | null
  cost: number | null
  maintenanceType: string
  status: string
  startDate: string
  endDate: string | null
  reporter: { id: string; name: string }
  vehicle: { id: string; plateNumber: string; type: { name: string } }
}

type DetailsResponse = {
  items: Array<BookingItem | MaintenanceItem>
  period: { startDate: string; endDate: string; dayCount: number }
  pagination: { page: number; pageSize: number; total: number; totalPages: number }
}

const tabs: Array<{ id: Tab; label: string; icon: typeof Car }> = [
  { id: "trips", label: "ประวัติเที่ยว", icon: Car },
  { id: "mileage", label: "เลขไมล์", icon: Gauge },
  { id: "maintenance", label: "งานซ่อม", icon: Wrench },
]

const maintenanceTypeText: Record<string, string> = {
  BREAKDOWN: "ซ่อมฉุกเฉิน",
  PREVENTIVE: "บำรุงรักษาตามแผน",
  OTHER: "อื่น ๆ",
  UNSPECIFIED: "ไม่ระบุประเภท",
}

function getErrorMessage(error: unknown) {
  if (axios.isAxiosError<{ message?: string }>(error)) {
    return error.response?.data?.message || "ไม่สามารถโหลดรายละเอียดประวัติได้"
  }
  return "ไม่สามารถโหลดรายละเอียดประวัติได้"
}

function displayDate(value: string | null) {
  return value ? formatDateTime(value) : "—"
}

function displayMileage(value: number | null) {
  return value === null ? "—" : `${value.toLocaleString()} กม.`
}

function TripsTable({ items }: { items: BookingItem[] }) {
  return (
    <table className="w-full min-w-[1100px] divide-y divide-slate-200">
      <thead className="bg-slate-50">
        <tr>
          {["ผู้ใช้ / รถ", "วัตถุประสงค์ / ปลายทาง", "เวลาที่จอง", "รับ–คืนจริง", "เลขไมล์", "สถานะ"].map((heading) => (
            <th key={heading} className="px-5 py-3 text-left text-xs font-semibold text-slate-600">{heading}</th>
          ))}
        </tr>
      </thead>
      <tbody className="divide-y divide-slate-100">
        {items.map((item) => (
          <tr key={item.id} className="align-top hover:bg-slate-50">
            <td className="px-5 py-4 text-sm">
              <p className="font-semibold text-slate-950">{item.user.name}</p>
              <p className="text-slate-600">{item.vehicle.plateNumber} · {item.vehicle.type.name}</p>
            </td>
            <td className="max-w-xs px-5 py-4 text-sm text-slate-700">
              <p>{item.purpose}</p>
              <p className="mt-1 text-slate-500">
                ปลายทาง: {item.destination || "—"}
              </p>
            </td>
            <td className="whitespace-nowrap px-5 py-4 text-sm text-slate-700">
              <p>{displayDate(item.startDate)}</p>
              <p className="mt-1">ถึง {displayDate(item.endDate)}</p>
            </td>
            <td className="whitespace-nowrap px-5 py-4 text-sm text-slate-700">
              <p>{displayDate(item.pickedUpAt)}</p>
              <p className="mt-1">ถึง {displayDate(item.returnedAt)}</p>
            </td>
            <td className="whitespace-nowrap px-5 py-4 text-sm text-slate-700">
              <p>เริ่ม {displayMileage(item.mileageStart)}</p>
              <p className="mt-1">สิ้นสุด {displayMileage(item.mileageEnd)}</p>
            </td>
            <td className="whitespace-nowrap px-5 py-4">
              <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${getBookingStatusColor(item.status)}`}>
                {getBookingStatusText(item.status)}
              </span>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}

function MileageTable({ items }: { items: BookingItem[] }) {
  return (
    <table className="w-full min-w-[900px] divide-y divide-slate-200">
      <thead className="bg-slate-50">
        <tr>
          {["รถ", "ผู้ใช้", "วันที่สิ้นสุดเที่ยว", "เลขไมล์เริ่ม", "เลขไมล์สิ้นสุด", "ระยะทาง"].map((heading) => (
            <th key={heading} className="px-5 py-3 text-left text-xs font-semibold text-slate-600">{heading}</th>
          ))}
        </tr>
      </thead>
      <tbody className="divide-y divide-slate-100">
        {items.map((item) => (
          <tr key={item.id} className="hover:bg-slate-50">
            <td className="px-5 py-4 text-sm">
              <p className="font-semibold text-slate-950">{item.vehicle.plateNumber}</p>
              <p className="text-slate-500">{item.vehicle.type.name}</p>
            </td>
            <td className="px-5 py-4 text-sm text-slate-700">{item.user.name}</td>
            <td className="whitespace-nowrap px-5 py-4 text-sm text-slate-700">{displayDate(item.effectiveDate)}</td>
            <td className="whitespace-nowrap px-5 py-4 text-sm text-slate-700">{displayMileage(item.mileageStart)}</td>
            <td className="whitespace-nowrap px-5 py-4 text-sm text-slate-700">{displayMileage(item.mileageEnd)}</td>
            <td className="whitespace-nowrap px-5 py-4 text-sm font-semibold text-slate-900">
              {item.distanceKm === null ? <span className="font-medium text-amber-700">ข้อมูลไม่ครบ</span> : `${item.distanceKm.toLocaleString()} กม.`}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}

function MaintenanceTable({ items }: { items: MaintenanceItem[] }) {
  return (
    <table className="w-full min-w-[1180px] divide-y divide-slate-200">
      <thead className="bg-slate-50">
        <tr>
          {["รถ", "ประเภท / สถานะ", "รายละเอียด", "ผู้แจ้ง", "ศูนย์บริการ / ค่าใช้จ่าย", "วันเริ่ม / เสร็จ"].map((heading) => (
            <th key={heading} className="px-5 py-3 text-left text-xs font-semibold text-slate-600">{heading}</th>
          ))}
        </tr>
      </thead>
      <tbody className="divide-y divide-slate-100">
        {items.map((item) => (
          <tr key={item.id} className="align-top hover:bg-slate-50">
            <td className="px-5 py-4 text-sm">
              <p className="font-semibold text-slate-950">{item.vehicle.plateNumber}</p>
              <p className="text-slate-500">{item.vehicle.type.name}</p>
            </td>
            <td className="whitespace-nowrap px-5 py-4 text-sm text-slate-700">
              <p>{maintenanceTypeText[item.maintenanceType] || item.maintenanceType}</p>
              <span className={`mt-2 inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${getMaintenanceStatusColor(item.status)}`}>
                {getMaintenanceStatusText(item.status)}
              </span>
            </td>
            <td className="max-w-sm px-5 py-4 text-sm text-slate-700">
              <p>{item.description}</p>
              {item.repairDetails && <p className="mt-1 text-slate-500">ผลการซ่อม: {item.repairDetails}</p>}
            </td>
            <td className="px-5 py-4 text-sm text-slate-700">{item.reporter.name}</td>
            <td className="px-5 py-4 text-sm text-slate-700">
              <p>{item.serviceCenterName || "—"}</p>
              <p className="mt-1">{item.cost === null ? "ไม่ระบุค่าใช้จ่าย" : `${item.cost.toLocaleString("th-TH", { minimumFractionDigits: 2 })} บาท`}</p>
            </td>
            <td className="whitespace-nowrap px-5 py-4 text-sm text-slate-700">
              <p>{displayDate(item.startDate)}</p>
              <p className="mt-1">ถึง {displayDate(item.endDate)}</p>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}

export default function VehicleHistoryDetails({ filters }: { filters: DetailsFilters }) {
  const [activeTab, setActiveTab] = useState<Tab>("trips")
  const [page, setPage] = useState(1)
  const [response, setResponse] = useState<DetailsResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const filterKey = `${filters.vehicleId}|${filters.startDate}|${filters.endDate}`
  const previousFilterKey = useRef(filterKey)

  useEffect(() => {
    if (previousFilterKey.current !== filterKey) {
      previousFilterKey.current = filterKey
      if (page !== 1) {
        setPage(1)
        return
      }
    }

    if (!filters.startDate || !filters.endDate) {
      setResponse(null)
      setError("กรุณาระบุวันที่เริ่มต้นและวันที่สิ้นสุดให้ครบ")
      setLoading(false)
      return
    }

    const controller = new AbortController()
    const load = async () => {
      try {
        setLoading(true)
        setError("")
        const params = new URLSearchParams({
          tab: activeTab,
          startDate: filters.startDate,
          endDate: filters.endDate,
          page: String(page),
          pageSize: "20",
        })
        if (filters.vehicleId) params.set("vehicleId", filters.vehicleId)
        const result = await api.get<DetailsResponse>(
          `/api/admin/vehicles/history/details?${params.toString()}`,
          { signal: controller.signal },
        )
        setResponse(result.data)
      } catch (error) {
        if (!axios.isCancel(error)) {
          setResponse(null)
          setError(getErrorMessage(error))
        }
      } finally {
        if (!controller.signal.aborted) setLoading(false)
      }
    }

    load()
    return () => controller.abort()
  }, [activeTab, filterKey, filters.endDate, filters.startDate, filters.vehicleId, page])

  const items = response?.items || []
  const pagination = response?.pagination

  return (
    <section className="overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-slate-200" aria-labelledby="history-details-title">
      <div className="border-b border-slate-200 px-5 py-4">
        <h2 id="history-details-title" className="text-base font-semibold text-slate-950">รายละเอียดประวัติ</h2>
        <p className="mt-1 text-sm text-slate-600">
          KPI และบทสรุป AI นับเฉพาะเที่ยวที่เสร็จสิ้น ส่วนแท็บประวัติเที่ยวแสดงทุกสถานะ
        </p>
      </div>

      <div className="border-b border-slate-200 px-3 pt-2 sm:px-5" role="tablist" aria-label="ประเภทรายละเอียดประวัติ">
        <div className="flex gap-1 overflow-x-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon
            const selected = activeTab === tab.id
            return (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={selected}
                onClick={() => {
                  setResponse(null)
                  setLoading(true)
                  setActiveTab(tab.id)
                  setPage(1)
                }}
                className={`inline-flex min-h-11 shrink-0 items-center gap-2 border-b-2 px-3 py-2 text-sm font-semibold transition ${selected ? "border-orange-600 text-orange-700" : "border-transparent text-slate-600 hover:border-slate-300 hover:text-slate-900"}`}
              >
                <Icon className="h-4 w-4" aria-hidden="true" />
                {tab.label}
              </button>
            )
          })}
        </div>
      </div>

      {error ? (
        <div role="alert" className="m-5 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">{error}</div>
      ) : loading ? (
        <div className="px-5 py-14 text-center text-sm text-slate-500">กำลังโหลดรายละเอียดประวัติ...</div>
      ) : items.length === 0 ? (
        <div className="px-5 py-14 text-center">
          <p className="text-sm font-semibold text-slate-900">ไม่พบข้อมูลในแท็บนี้</p>
          <p className="mt-1 text-sm text-slate-500">ลองเปลี่ยนช่วงวันที่หรือเลือกรถคันอื่น</p>
        </div>
      ) : (
        <div className="overflow-x-auto" role="tabpanel">
          {activeTab === "trips" && <TripsTable items={items as BookingItem[]} />}
          {activeTab === "mileage" && <MileageTable items={items as BookingItem[]} />}
          {activeTab === "maintenance" && <MaintenanceTable items={items as MaintenanceItem[]} />}
        </div>
      )}

      {pagination && pagination.total > 0 && (
        <div className="flex flex-col gap-3 border-t border-slate-200 px-5 py-4 text-sm sm:flex-row sm:items-center sm:justify-between">
          <p className="text-slate-600">
            หน้า {pagination.page.toLocaleString()} จาก {pagination.totalPages.toLocaleString()} · ทั้งหมด {pagination.total.toLocaleString()} รายการ
          </p>
          <div className="flex gap-2">
            <button
              type="button"
              disabled={loading || pagination.page <= 1}
              onClick={() => setPage((current) => Math.max(1, current - 1))}
              className="min-h-10 rounded-lg border border-slate-300 px-3 py-2 font-medium text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              ก่อนหน้า
            </button>
            <button
              type="button"
              disabled={loading || pagination.page >= pagination.totalPages}
              onClick={() => setPage((current) => current + 1)}
              className="min-h-10 rounded-lg border border-slate-300 px-3 py-2 font-medium text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              ถัดไป
            </button>
          </div>
        </div>
      )}
    </section>
  )
}
