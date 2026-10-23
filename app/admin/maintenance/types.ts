export type MaintenanceStatus = "REPORTED" | "IN_PROGRESS" | "COMPLETED"

export type MaintenanceType = "BREAKDOWN" | "PREVENTIVE" | "OTHER" | "UNSPECIFIED"

export type AffectedBooking = {
  id: string
  startDate: string
  endDate: string
  status: string
  purpose: string
  destination?: string | null
  user: { id?: string; name: string }
}

export type Maintenance = {
  id: string
  description: string
  maintenanceType: MaintenanceType
  status: MaintenanceStatus
  startDate: string
  endDate?: string | null
  repairDetails?: string | null
  serviceCenterName?: string | null
  cost?: number | null
  createdAt: string
  vehicle: {
    id: string
    plateNumber: string
    status: string
    type: { name: string }
  }
  reporter: {
    id: string
    name: string
    email: string
  }
  affectedBookings: AffectedBooking[]
}

export type Vehicle = {
  id: string
  plateNumber: string
  status: string
  type: { name: string }
}

export type FormData = {
  vehicleId: string
  description: string
  maintenanceType: "" | MaintenanceType
  repairDetails: string
  serviceCenterName: string
  cost: string
  startDate: string
  endDate: string
  status: MaintenanceStatus
}
