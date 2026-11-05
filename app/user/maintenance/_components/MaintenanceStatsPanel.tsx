import StatStrip from "@/app/component/stat-strip"
import type { MaintenanceStats } from "../types"

type MaintenanceStatsPanelProps = {
  stats: MaintenanceStats
}

export default function MaintenanceStatsPanel({
  stats,
}: MaintenanceStatsPanelProps) {
  return (
    <StatStrip
      label="สรุปสถานะการแจ้งซ่อม"
      items={[
        { label: "ทั้งหมด", value: stats.total },
        { label: "แจ้งแล้ว", value: stats.reported, dot: "bg-yellow-500" },
        { label: "กำลังซ่อม", value: stats.in_progress, dot: "bg-orange-500" },
        { label: "เสร็จสิ้น", value: stats.completed, dot: "bg-green-600" },
      ]}
    />
  )
}
