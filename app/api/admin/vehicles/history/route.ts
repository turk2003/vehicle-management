import { NextRequest, NextResponse } from "next/server"
import { accessErrorResponse, requireAccess } from "@/lib/permissions"
import {
  AnalysisInputError,
  calculateVehicleUsageAnalysis,
} from "@/lib/vehicle-usage-analysis"

export async function GET(req: NextRequest) {
  try {
    await requireAccess(req, { roles: ["ADMIN"], permission: "REPORT_VIEW" })

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
    const accessResponse = accessErrorResponse(error)
    if (accessResponse) return accessResponse
    return NextResponse.json({ message: "Server error" }, { status: 500 })
  }
}
