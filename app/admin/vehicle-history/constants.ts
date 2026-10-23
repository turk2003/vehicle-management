import type { Filters, ChartMetric } from "./types"
import { getBangkokToday } from "./utils"

export const bangkokToday = getBangkokToday()

export const defaultFilters: Filters = {
  vehicleId: "",
  startDate: `${bangkokToday.slice(0, 8)}01`,
  endDate: bangkokToday,
}

export const fieldClass =
  "w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-100"

export const chartMetrics: ChartMetric[] = [
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
