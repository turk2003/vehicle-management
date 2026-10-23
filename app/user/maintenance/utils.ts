import type { AxiosError } from "axios"
import type { Maintenance, MaintenanceForm, MaintenanceStats } from "./types"
import { INITIAL_STATS } from "./constants"

export function getLocalDateTimeInputValue(date = new Date()) {
  const localDate = new Date(date)
  localDate.setMinutes(localDate.getMinutes() - localDate.getTimezoneOffset())
  return localDate.toISOString().slice(0, 16)
}

export function getInitialFormData(): MaintenanceForm {
  return {
    vehicleId: "",
    description: "",
    maintenanceType: "",
    startDate: getLocalDateTimeInputValue(),
  }
}

export function getErrorMessage(error: unknown, fallback: string) {
  const axiosError = error as AxiosError<{ message?: string }>
  return axiosError.response?.data?.message || fallback
}

export function buildStats(maintenances: Maintenance[]): MaintenanceStats {
  return maintenances.reduce<MaintenanceStats>((acc, maintenance) => {
    acc.total += 1
    const key = maintenance.status.toLowerCase() as keyof MaintenanceStats

    if (key in acc && key !== "total") {
      acc[key] += 1
    }

    return acc
  }, { ...INITIAL_STATS })
}
