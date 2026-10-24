import { Badge, type BadgeColor } from "@/app/component/untitled-ui/badge"
import { getBookingStatusText, getVehicleStatusText } from "@/lib/format"
import type { CalendarBookingStatus, CalendarVehicleStatus } from "@/lib/calendar/types"

const bookingColors: Record<CalendarBookingStatus, BadgeColor> = {
  PENDING: "warning", APPROVED: "success", CHANGED: "blue", IN_PROGRESS: "indigo", COMPLETED: "teal",
}
const vehicleColors: Record<CalendarVehicleStatus, BadgeColor> = {
  AVAILABLE: "success", BOOKED: "blue", IN_USE: "purple", MAINTENANCE: "orange",
}

export function BookingBadge({ status }: { status: CalendarBookingStatus }) {
  return <Badge dot color={bookingColors[status]}>{getBookingStatusText(status)}</Badge>
}

export function VehicleBadge({ status }: { status: CalendarVehicleStatus }) {
  return <Badge dot color={vehicleColors[status]}>{getVehicleStatusText(status)}</Badge>
}
