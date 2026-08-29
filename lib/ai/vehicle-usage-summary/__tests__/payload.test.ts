import { describe, expect, it } from "vitest"
import type { VehicleUsageAnalysis } from "@/lib/vehicle-usage-analysis"
import { buildVehicleUsageAiPayload } from "../payload"

const analysis: VehicleUsageAnalysis = {
  filters: { vehicleId: null },
  period: {
    startDate: "2026-08-01",
    endDate: "2026-08-22",
    comparisonStartDate: "2026-07-10",
    comparisonEndDate: "2026-07-31",
    dayCount: 22,
  },
  totals: {
    vehicleCount: 1,
    tripCount: 2,
    totalDistanceKm: 200,
    validMileageTrips: 2,
    uniqueUsersCount: 1,
    maintenanceCount: 1,
    breakdownCount: 1,
    preventiveCount: 0,
    previousTripCount: 1,
    tripCountChangePercent: 100,
  },
  vehicles: [{
    vehicleId: "internal-vehicle-id",
    plateNumber: "กข-1234",
    vehicleType: "รถตู้",
    currentStatus: "AVAILABLE",
    currentMileage: 5_000,
    usageCount: 2,
    maintenanceCount: 1,
    breakdownCount: 1,
    preventiveCount: 0,
    uniqueUsersCount: 1,
    totalDistanceKm: 200,
    validMileageTrips: 2,
    avgDistancePerTripKm: 100,
    breakdownRatePer10kKm: 50,
    previousUsageCount: 1,
    usageChangePercent: 100,
    peerMedianUsageCount: null,
    peerMedianDistanceKm: null,
    peerMedianBreakdownRatePer10kKm: null,
    comparableVehicleCount: 1,
    lastUsedAt: "2026-08-20T10:00:00.000Z",
  }],
  users: [{
    userId: "internal-user-id",
    name: "สมชาย ใจดี",
    tripCount: 2,
    totalDistanceKm: 200,
    validMileageTrips: 2,
    avgDistancePerTripKm: 100,
    vehicleCount: 1,
    mostUsedVehicleType: "รถตู้",
    usageSharePercent: 100,
    previousTripCount: 1,
    tripCountChangePercent: 100,
  }],
  peakUsage: {
    weekday: 1,
    weekdayTripCount: 2,
    hour: 8,
    hourTripCount: 2,
    estimatedStartTrips: 0,
  },
  dataCompleteness: {
    mileageCoveragePercent: 100,
    actualPickupCoveragePercent: 100,
    classifiedMaintenanceCoveragePercent: 100,
    hasComparisonData: true,
    hasSufficientMileageData: true,
    hasSufficientPickupData: true,
  },
  dataLimitations: [],
}

describe("buildVehicleUsageAiPayload", () => {
  it("sends names and aggregates without internal identifiers or raw fields", () => {
    const { payload, evidence, users, cacheKey } = buildVehicleUsageAiPayload(analysis)
    const serialized = JSON.stringify(payload)

    expect(serialized).toContain("สมชาย ใจดี")
    expect(serialized).toContain("u1")
    expect(serialized).not.toContain("internal-user-id")
    expect(serialized).not.toContain("internal-vehicle-id")
    expect(serialized).not.toContain("email")
    expect(serialized).not.toContain("purpose")
    expect(serialized).not.toContain("description")
    expect(users).toEqual({ u1: { name: "สมชาย ใจดี" } })
    expect(evidence["users.u1.tripCount"].value).toBe(2)
    expect(cacheKey).toMatch(/^[a-f0-9]{64}$/)
  })

  it("produces a stable cache key for an unchanged metrics snapshot", () => {
    expect(buildVehicleUsageAiPayload(analysis).cacheKey).toBe(
      buildVehicleUsageAiPayload(analysis).cacheKey,
    )
  })
})
