export type Booking = {
  id: string
  startDate: string
  endDate: string
  purpose: string
  destination?: string | null
  status: string
  rejectionReason?: string
  mileageStart?: number | null
  mileageEnd?: number | null
  pickedUpAt?: string | null
  returnedAt?: string | null
  createdAt: string
  vehicle: {
    id: string
    plateNumber: string
    type: { id: string; name: string }
  }
  approver?: { id: string; name: string; email: string }
}

export type BookingStats = {
  total: number
  pending: number
  approved: number
  rejected: number
  cancelled: number
  in_progress: number
  completed: number
}

export type EditForm = {
  id: string
  startDate: string
  endDate: string
  purpose: string
  destination: string
}

export type ModalType = "detail" | "edit" | "pickup" | "return" | null
