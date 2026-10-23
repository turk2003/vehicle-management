export type MaintenanceType = "BREAKDOWN" | "PREVENTIVE" | "OTHER" | "UNSPECIFIED"

export type Maintenance = {
  id: string
  description: string
  maintenanceType: MaintenanceType
  status: string
  startDate: string
  endDate?: string | null
  createdAt: string
  vehicle: {
    id: string
    plateNumber: string
    type: { name: string }
  }
}

export type Vehicle = {
  id: string
  plateNumber: string
  status: string
  type: { name: string }
}

export type MaintenanceForm = {
  vehicleId: string
  description: string
  maintenanceType: "" | Exclude<MaintenanceType, "UNSPECIFIED">
  startDate: string
}

export type MaintenanceStats = {
  total: number
  reported: number
  in_progress: number
  completed: number
}
