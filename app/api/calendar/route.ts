import { NextRequest, NextResponse } from "next/server"
import { requireAccess, accessErrorResponse } from "@/lib/permissions"
import { getCalendarSnapshot } from "@/lib/calendar"
import { CalendarInputError } from "@/lib/calendar/dates"

export async function GET(req: NextRequest) {
  try {
    await requireAccess(req, {})
    const snapshot = await getCalendarSnapshot(req.nextUrl.searchParams.get("month"))
    return NextResponse.json(snapshot, { headers: { "Cache-Control": "private, no-store" } })
  } catch (error) {
    const accessResponse = accessErrorResponse(error)
    if (accessResponse) return accessResponse
    if (error instanceof CalendarInputError) {
      return NextResponse.json({ message: error.message }, { status: 400 })
    }
    console.error("Calendar load error:", error)
    return NextResponse.json({ message: "ไม่สามารถโหลดปฏิทินได้ กรุณาลองใหม่" }, { status: 500 })
  }
}
