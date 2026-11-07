export type Vehicle = {
  id: string
  plateNumber: string
  status: string
  currentMileage: number
  type?: {
    id: string
    name: string
  }
  statusContext?: VehicleStatusContext
}

export type VehicleStatusContext = {
  activeMaintenances: {
    id: string
    description: string
    maintenanceType: string
    startDate: string
  }[]
  inProgressBookings: {
    id: string
    endDate: string
    pickedUpAt: string | null
    mileageStart: number | null
    user: { name: string }
  }[]
  scheduledBookings: {
    id: string
    startDate: string
    endDate: string
    user: { name: string }
  }[]
}

export type VehicleType = {
  id: string
  name: string
}

export type VehicleFormData = {
  plateNumber: string
  typeId: string
  currentMileage: string
}

export type VehicleTypeFormData = {
  name: string
}
