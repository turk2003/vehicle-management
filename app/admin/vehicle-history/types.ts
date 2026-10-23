export type VehicleOption = {
  id: string
  plateNumber: string
}

export type VehicleHistoryItem = {
  vehicleId: string
  plateNumber: string
  vehicleType: string
  currentStatus: string
  currentMileage: number
  usageCount: number
  maintenanceCount: number
  uniqueUsersCount: number
  totalDistanceKm: number
  avgDistancePerTripKm: number
  lastUsedAt: string | null
}

export type VehicleHistoryResponse = {
  items?: VehicleHistoryItem[]
}

export type Filters = {
  vehicleId: string
  startDate: string
  endDate: string
}

export type ChartMetric = {
  title: string
  description: string
  dataKey: "usageCount" | "totalDistanceKm" | "maintenanceCount"
  name: string
  fill: string
}
