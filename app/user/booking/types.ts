export type Vehicle = {
  id: string
  plateNumber: string
  status: string
  currentMileage: number
  maintenanceCount: number
  score: number
  recommended: boolean
  type: { id: string; name: string }
}

export type VehicleType = { id: string; name: string }

export type BookingData = {
  vehicleId: string
  startDate: string
  endDate: string
  purpose: string
  destination: string
}

export type SearchDate = {
  startDate: string
  endDate: string
}
