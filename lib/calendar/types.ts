export type CalendarBookingStatus = "PENDING" | "APPROVED" | "CHANGED" | "IN_PROGRESS" | "COMPLETED"
export type CalendarVehicleStatus = "AVAILABLE" | "BOOKED" | "IN_USE" | "MAINTENANCE"

export interface CalendarBooking {
  id: string
  startDate: string
  endDate: string
  status: CalendarBookingStatus
  purpose: string
  destination: string | null
  user: { name: string }
  vehicle: { id: string; plateNumber: string; type: { name: string } }
}

export interface CalendarHolder {
  bookingId: string
  name: string
  pickedUpAt: string
  dueAt: string
  overdue: boolean
}

export interface CalendarVehicle {
  id: string
  plateNumber: string
  type: { name: string }
  status: CalendarVehicleStatus
  holders: CalendarHolder[]
}

export interface CalendarSnapshot {
  month: string
  range?: CalendarRange
  asOf: string
  bookings: CalendarBooking[]
  vehicles: CalendarVehicle[]
}

export interface CalendarRange {
  start: string
  end: string
}
