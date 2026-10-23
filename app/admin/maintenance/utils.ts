import axios from "axios"
import type { MaintenanceType } from "./types"

export const getApiErrorMessage = (error: unknown, fallback: string) => {
  if (axios.isAxiosError<{ message?: string }>(error)) {
    return error.response?.data?.message || fallback
  }
  return fallback
}

export const isAffectedBookingsConflict = (error: unknown) =>
  axios.isAxiosError<{ code?: string }>(error) &&
  error.response?.status === 409 &&
  error.response.data?.code === "AFFECTED_BOOKINGS"

export const getVehicleStatusText = (status: string) => {
  if (status === "AVAILABLE") return "จองได้"
  if (status === "MAINTENANCE") return "ซ่อมบำรุง"
  return "ถูกจองแล้ว"
}

export const getVehicleStatusClass = (status: string) => {
  if (status === "AVAILABLE") return "bg-emerald-50 text-emerald-700 ring-emerald-200"
  if (status === "MAINTENANCE") return "bg-orange-50 text-orange-700 ring-orange-200"
  return "bg-rose-50 text-rose-700 ring-rose-200"
}

export const getMaintenanceTypeClass = (type: MaintenanceType) => {
  if (type === "BREAKDOWN") return "bg-rose-50 text-rose-700 ring-rose-200"
  if (type === "PREVENTIVE") return "bg-emerald-50 text-emerald-700 ring-emerald-200"
  if (type === "OTHER") return "bg-blue-50 text-blue-700 ring-blue-200"
  return "bg-slate-100 text-slate-700 ring-slate-200"
}
