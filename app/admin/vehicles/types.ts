export type Vehicle = {
  id: string
  plateNumber: string
  status: string
  currentMileage: number
  type?: {
    id: string
    name: string
  }
}

export type VehicleType = {
  id: string
  name: string
}

export type VehicleFormData = {
  plateNumber: string
  typeId: string
  status: string
  currentMileage: string
}

export type VehicleTypeFormData = {
  name: string
}
