export type Booking = {
  id: string
  startDate: string
  endDate: string
  purpose: string
  destination?: string | null
  status: string
  createdAt: string
  updatedAt: string
  user: {
    id: string
    name: string
    email: string
    role: string
  }
  vehicle: {
    id: string
    plateNumber: string
    type: {
      id: string
      name: string
    }
  }
  approver?: {
    id: string
    name: string
    email: string
  }
}

export type BookingStats = {
  total: number
  approved: number
  rejected: number
}

export type DateFilter = {
  startDate: string
  endDate: string
}
