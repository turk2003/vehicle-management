import { NextRequest, NextResponse } from "next/server"
import { requireAccess, accessErrorResponse } from "@/lib/permissions"
import { getCalendarSnapshot } from "@/lib/calendar"
import { CalendarInputError } from "@/lib/calendar/dates"

export async function GET(req: NextRequest) {
  try {
    await requireAccess(req, {})
    const params = req.nextUrl.searchParams
    const hasRange = params.has("start") || params.has("end")
    if (hasRange && params.has("month")) throw new CalendarInputError("เลือกส่งเดือนหรือช่วงวันที่อย่างใดอย่างหนึ่ง")
    const snapshot = await getCalendarSnapshot(params.get("month"), new Date(), hasRange ? { start: params.get("start"), end: params.get("end") } : undefined)
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
