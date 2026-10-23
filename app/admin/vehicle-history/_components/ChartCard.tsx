import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip as RechartsTooltip, XAxis, YAxis } from "recharts"
import type { VehicleHistoryItem, ChartMetric } from "../types"

export default function ChartCard({ metric, items }: { metric: ChartMetric; items: VehicleHistoryItem[] }) {
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
