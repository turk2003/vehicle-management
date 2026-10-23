import type { VehicleFormData, VehicleTypeFormData } from "./types"

export const INITIAL_VEHICLE_FORM: VehicleFormData = {
  plateNumber: "",
  typeId: "",
  status: "AVAILABLE",
  currentMileage: "0",
}

export const INITIAL_TYPE_FORM: VehicleTypeFormData = {
  name: "",
}

export const VEHICLE_STATUSES = [
  { value: "AVAILABLE", label: "ว่าง" },
  { value: "BOOKED", label: "จองแล้ว" },
  { value: "IN_USE", label: "กำลังใช้งาน" },
  { value: "MAINTENANCE", label: "ซ่อมบำรุง" },
]
