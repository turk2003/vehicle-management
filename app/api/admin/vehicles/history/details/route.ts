import { NextRequest, NextResponse } from "next/server"
import { isPermissionError, verifyPermission } from "@/lib/permissions"
import {
  getVehicleHistoryDetails,
  HistoryDetailsInputError,
  type HistoryDetailsTab,
} from "@/lib/vehicle-history-details"
import { AnalysisInputError } from "@/lib/vehicle-usage-analysis"

const TABS = new Set<HistoryDetailsTab>(["trips", "mileage", "maintenance"])
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

function parsePositiveInteger(value: string | null, fallback: number, field: string) {
  if (value === null) return fallback
  if (!/^\d+$/.test(value)) {
    throw new HistoryDetailsInputError(`${field} ต้องเป็นจำนวนเต็มบวก`)
  }
  return Number(value)
}

export async function GET(req: NextRequest) {
  try {
    await verifyPermission(req, "REPORT_VIEW")
    const params = new URL(req.url).searchParams
    const tab = params.get("tab") || "trips"
    const vehicleId = params.get("vehicleId") || undefined

    if (!TABS.has(tab as HistoryDetailsTab)) {
      throw new HistoryDetailsInputError("tab ต้องเป็น trips, mileage หรือ maintenance")
    }
    if (vehicleId && !UUID_PATTERN.test(vehicleId)) {
      throw new HistoryDetailsInputError("vehicleId ไม่ถูกต้อง")
    }

    const result = await getVehicleHistoryDetails({
      tab: tab as HistoryDetailsTab,
      vehicleId,
      startDate: params.get("startDate") || undefined,
      endDate: params.get("endDate") || undefined,
      page: parsePositiveInteger(params.get("page"), 1, "page"),
      pageSize: parsePositiveInteger(params.get("pageSize"), 20, "pageSize"),
    })
    return NextResponse.json(result)
  } catch (error) {
    if (error instanceof HistoryDetailsInputError || error instanceof AnalysisInputError) {
      return NextResponse.json({ message: error.message }, { status: 400 })
    }
    if (isPermissionError(error)) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }
    return NextResponse.json({ message: "Server error" }, { status: 500 })
  }
}
