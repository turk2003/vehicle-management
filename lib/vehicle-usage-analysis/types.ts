export type AnalysisFilters = {
  vehicleId?: string
  startDate?: string
  endDate?: string
}

export type ResolvedAnalysisPeriod = {
  startDate: string
  endDate: string
  start: Date
  endExclusive: Date
  comparisonStartDate: string
  comparisonEndDate: string
  comparisonStart: Date
  comparisonEndExclusive: Date
  dayCount: number
}

export type VehicleHistoryItem = {
  vehicleId: string
  plateNumber: string
  vehicleType: string
  currentStatus: string
  currentMileage: number
  usageCount: number
  maintenanceCount: number
  breakdownCount: number
  preventiveCount: number
  uniqueUsersCount: number
  totalDistanceKm: number
  validMileageTrips: number
  avgDistancePerTripKm: number
  breakdownRatePer10kKm: number | null
  previousUsageCount: number
  usageChangePercent: number | null
  peerMedianUsageCount: number | null
  peerMedianDistanceKm: number | null
  peerMedianBreakdownRatePer10kKm: number | null
  comparableVehicleCount: number
  lastUsedAt: string | null
}

export type UserUsageMetric = {
  userId: string
  name: string
  tripCount: number
  totalDistanceKm: number
  validMileageTrips: number
  avgDistancePerTripKm: number
  vehicleCount: number
  mostUsedVehicleType: string | null
  usageSharePercent: number
  previousTripCount: number
  tripCountChangePercent: number | null
}

export type PeakUsageMetric = {
  weekday: number | null
  weekdayTripCount: number
  hour: number | null
  hourTripCount: number
  estimatedStartTrips: number
}

export type DataCompleteness = {
  mileageCoveragePercent: number
  actualPickupCoveragePercent: number
  classifiedMaintenanceCoveragePercent: number
  hasComparisonData: boolean
  hasSufficientMileageData: boolean
  hasSufficientPickupData: boolean
}

export type VehicleUsageAnalysis = {
  filters: {
    vehicleId: string | null
  }
  period: Omit<
    ResolvedAnalysisPeriod,
    "start" | "endExclusive" | "comparisonStart" | "comparisonEndExclusive"
  >
  totals: {
    vehicleCount: number
    tripCount: number
    totalDistanceKm: number
    validMileageTrips: number
    uniqueUsersCount: number
    maintenanceCount: number
    breakdownCount: number
    preventiveCount: number
    previousTripCount: number
    tripCountChangePercent: number | null
  }
  vehicles: VehicleHistoryItem[]
  users: UserUsageMetric[]
  peakUsage: PeakUsageMetric
  dataCompleteness: DataCompleteness
  dataLimitations: string[]
}
