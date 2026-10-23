import { BarChart3, Car, Route, Wrench } from "lucide-react"

type HistoryStatsProps = {
  summary: { totalVehicles: number; totalTrips: number; totalDistanceKm: number; totalMaintenance: number; }
}

export default function HistoryStats({
  summary,
}: HistoryStatsProps) {
  return (
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
  )
}
