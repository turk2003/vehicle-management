import { NextRequest, NextResponse } from "next/server"
import { verifyPermission, isPermissionError } from "@/lib/permissions"
import {
  AnalysisInputError,
  calculateVehicleUsageAnalysis,
} from "@/lib/vehicle-usage-analysis"

export async function GET(req: NextRequest) {
  try {
    await verifyPermission(req, "REPORT_VIEW")

    const { searchParams } = new URL(req.url)
    const analysis = await calculateVehicleUsageAnalysis({
      vehicleId: searchParams.get("vehicleId") || undefined,
      startDate: searchParams.get("startDate") || undefined,
      endDate: searchParams.get("endDate") || undefined,
    })

    return NextResponse.json({
      items: analysis.vehicles,
      totals: analysis.totals,
      period: analysis.period,
      dataCompleteness: analysis.dataCompleteness,
      dataLimitations: analysis.dataLimitations,
    })
  } catch (error) {
    if (error instanceof AnalysisInputError) {
      return NextResponse.json({ message: error.message }, { status: 400 })
    }
    if (isPermissionError(error)) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }
    return NextResponse.json({ message: "Server error" }, { status: 500 })
  }
}
