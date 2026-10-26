import { requirePageAccess } from "@/lib/page-access"
import { getPermissionsForRole } from "@/lib/permissions"
import { bangkokDateKey } from "@/lib/calendar/dates"
import CalendarView from "./_components/CalendarView"
import "@fullcalendar/react/skeleton.css"
import "@fullcalendar/react/themes/monarch/theme.css"
import "@fullcalendar/react/themes/monarch/palettes/blue.css"
import "./calendar.css"

export const metadata = { title: "ปฏิทินการใช้รถ | PEA Vehicle Management System" }

export default async function CalendarPage() {
  const actor = await requirePageAccess({})
  const canCreateBooking = actor.role === "USER" && (await getPermissionsForRole(actor.role)).has("BOOKING_CREATE")
  return <CalendarView today={bangkokDateKey(new Date())} dashboardHref={`/${actor.role.toLowerCase()}`} canCreateBooking={canCreateBooking} />
}
