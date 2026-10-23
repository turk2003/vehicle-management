export type Booking = {
  id: string
  startDate: string
  endDate: string
  purpose: string
  destination?: string | null
  status: string
  mileageStart?: number | null
  mileageEnd?: number | null
  pickedUpAt?: string | null
  returnedAt?: string | null
  createdAt: string
  user: { id: string; name: string; email: string; role: string }
  vehicle: {
    id: string
    plateNumber: string
    status: string
    currentMileage: number
    type: { id: string; name: string }
  }
  approver?: { id: string; name: string; email: string }
}

export type User = { id: string; name: string; email: string }
export type Vehicle = { id: string; plateNumber: string; type: { name: string } }

export type ReplacementVehicle = {
  id: string
  plateNumber: string
  status: string
  currentMileage: number
  sameType: boolean
  recommended: boolean
  type: { id: string; name: string }
}

export type BookingFilters = {
  status: string
  userId: string
  vehicleId: string
  startDate: string
  endDate: string
}

export type BookingStats = {
  total: number
  pending: number
  approved: number
  rejected: number
  cancelled: number
  changed: number
  in_progress: number
  completed: number
}

export type MileageAction = "pickup" | "return"
