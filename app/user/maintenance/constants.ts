import type { MaintenanceType, MaintenanceStats } from "./types"

export const INITIAL_STATS: MaintenanceStats = {
  total: 0,
  reported: 0,
  in_progress: 0,
  completed: 0,
}

export const maintenanceTypeLabels: Record<MaintenanceType, string> = {
  BREAKDOWN: "ซ่อมจากความขัดข้อง",
  PREVENTIVE: "บำรุงรักษาตามรอบ",
  OTHER: "งานซ่อมอื่น",
  UNSPECIFIED: "ยังไม่ระบุประเภท",
}
