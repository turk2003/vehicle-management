export type User = {
  id: string
  name: string
  email: string
  role: string
  isActive: boolean
  deactivatedAt: string | null
  activeBookingCount: number
  canDelete: boolean
  createdAt: string
}

export type CurrentUser = Pick<User, "id" | "role">

export type StatusFilter = "ALL" | "ACTIVE" | "INACTIVE"

export type UserFormData = {
  name: string
  email: string
  password: string
  role: string
}
