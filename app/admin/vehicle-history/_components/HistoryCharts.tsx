import type { VehicleHistoryItem } from "../types"
import { chartMetrics } from "../constants"
import ChartCard from "./ChartCard"

type HistoryChartsProps = {
  items: VehicleHistoryItem[]
}

export default function HistoryCharts({
  items,
}: HistoryChartsProps) {
  return (
    <section className="grid grid-cols-1 gap-4 lg:grid-cols-3">
      {chartMetrics.map((metric) => (
        <ChartCard key={metric.dataKey} metric={metric} items={items} />
      ))}
    </section>
  )
}
