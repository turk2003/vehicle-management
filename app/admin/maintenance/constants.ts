import type { MaintenanceStatus, MaintenanceType, FormData } from "./types"

export const defaultForm: FormData = {
  vehicleId: "",
  description: "",
  maintenanceType: "",
  repairDetails: "",
  serviceCenterName: "",
  cost: "",
  startDate: "",
  endDate: "",
  status: "REPORTED",
}

export const statusFilters: Array<{
  label: string
  value: "" | MaintenanceStatus
  description: string
}> = [
  { label: "ทั้งหมด", value: "", description: "รายการซ่อมบำรุงทุกสถานะ" },
  { label: "รอถึงวันกำหนด", value: "REPORTED", description: "ยังไม่เริ่มดำเนินการ" },
  { label: "กำลังซ่อม", value: "IN_PROGRESS", description: "รถอยู่ระหว่างบำรุงรักษา" },
  { label: "เสร็จสิ้น", value: "COMPLETED", description: "ปิดงานเรียบร้อยแล้ว" },
]

export const fieldClass =
  "w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-orange-500 focus:ring-2 focus:ring-orange-100 disabled:bg-slate-100 disabled:text-slate-500"

export const maintenanceTypeLabels: Record<MaintenanceType, string> = {
  BREAKDOWN: "ซ่อมจากความขัดข้อง",
  PREVENTIVE: "บำรุงรักษาตามรอบ",
  OTHER: "งานซ่อมอื่น",
  UNSPECIFIED: "ยังไม่ระบุประเภท",
}
