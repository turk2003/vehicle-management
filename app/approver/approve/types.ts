export type Booking = {
  id: string
  startDate: string
  endDate: string
  purpose: string
  destination?: string | null
  status: string
  rejectionReason?: string
  createdAt: string
  user: {
    id: string
    name: string
    email: string
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
