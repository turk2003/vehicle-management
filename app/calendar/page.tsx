import { requirePageAccess } from "@/lib/page-access"
import { bangkokDateKey } from "@/lib/calendar/dates"
import CalendarView from "./_components/CalendarView"

export const metadata = { title: "ปฏิทินการใช้รถ | PEA Vehicle Management System" }

export default async function CalendarPage() {
  const actor = await requirePageAccess({})
  return <CalendarView today={bangkokDateKey(new Date())} dashboardHref={`/${actor.role.toLowerCase()}`} />
}
