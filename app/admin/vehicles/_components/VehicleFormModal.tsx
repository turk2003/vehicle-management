import { X } from "lucide-react"
import type * as React from "react"
import type { Dispatch, SetStateAction } from "react"
import type { Vehicle, VehicleType, VehicleFormData } from "../types"
import { VEHICLE_STATUSES } from "../constants"

type VehicleFormModalProps = {
  vehicleModalTitle: "แก้ไขข้อมูลรถ" | "เพิ่มรถ"
  closeVehicleModal: () => void
  editingVehicle: Vehicle | null
  updateVehicle: (e: React.FormEvent) => Promise<void>
  createVehicle: (e: React.FormEvent) => Promise<void>
  formData: VehicleFormData
  setFormData: Dispatch<SetStateAction<VehicleFormData>>
  vehicleTypes: VehicleType[]
  loading: boolean
  vehicleSubmitLabel: "เพิ่มรถ" | "บันทึกการแก้ไข"
}

export default function VehicleFormModal({
  vehicleModalTitle,
  closeVehicleModal,
  editingVehicle,
  updateVehicle,
  createVehicle,
  formData,
  setFormData,
  vehicleTypes,
  loading,
  vehicleSubmitLabel,
}: VehicleFormModalProps) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-gray-900/50 px-4 py-8"
      role="dialog"
      aria-modal="true"
      aria-labelledby="vehicle-modal-title"
    >
      <div className="w-full max-w-lg rounded-xl bg-white shadow-lg ring-1 ring-gray-200">
        <div className="flex items-start justify-between gap-4 border-b border-gray-200 px-6 py-5">
          <div>
            <h3
              id="vehicle-modal-title"
              className="text-lg font-semibold text-gray-950"
            >
              {vehicleModalTitle}
            </h3>
            <p className="mt-1 text-sm text-gray-600">
              กำหนดทะเบียน ประเภท สถานะ และเลขไมล์ปัจจุบันของรถ
            </p>
          </div>
          <button
            type="button"
            onClick={closeVehicleModal}
            className="inline-flex h-9 w-9 items-center justify-center rounded-md text-gray-500 transition-colors duration-150 hover:bg-gray-100 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-600/25"
            aria-label="ปิดหน้าต่าง"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>

        <form
          onSubmit={editingVehicle ? updateVehicle : createVehicle}
          className="space-y-5 px-6 py-6"
        >
          <div>
            <label
              htmlFor="plateNumber"
              className="mb-1.5 block text-sm font-medium text-gray-700"
            >
              ทะเบียนรถ
            </label>
            <input
              id="plateNumber"
              type="text"
              required
              value={formData.plateNumber}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  plateNumber: e.target.value,
                })
              }
              className="min-h-11 w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-gray-950 placeholder:text-gray-500 transition-colors duration-150 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600/25"
              placeholder="เช่น กข 1234"
            />
          </div>

          <div>
            <label
              htmlFor="typeId"
              className="mb-1.5 block text-sm font-medium text-gray-700"
            >
              ประเภทรถ
            </label>
            <select
              id="typeId"
              required
              value={formData.typeId}
              onChange={(e) =>
                setFormData({ ...formData, typeId: e.target.value })
              }
              className="min-h-11 w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-gray-950 transition-colors duration-150 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600/25"
            >
              <option value="">เลือกประเภทรถ</option>
              {vehicleTypes.map((type) => (
                <option key={type.id} value={type.id}>
                  {type.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor="status"
              className="mb-1.5 block text-sm font-medium text-gray-700"
            >
              สถานะ
            </label>
            <select
              id="status"
              value={formData.status}
              onChange={(e) =>
                setFormData({ ...formData, status: e.target.value })
              }
              className="min-h-11 w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-gray-950 transition-colors duration-150 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600/25"
            >
              {VEHICLE_STATUSES.map((status) => (
                <option key={status.value} value={status.value}>
                  {status.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor="currentMileage"
              className="mb-1.5 block text-sm font-medium text-gray-700"
            >
              เลขไมล์ปัจจุบัน (km)
            </label>
            <input
              id="currentMileage"
              type="number"
              inputMode="numeric"
              min={0}
              max={2147483647}
              step={1}
              required
              aria-describedby="current-mileage-help"
              value={formData.currentMileage}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  currentMileage: e.target.value,
                })
              }
              className="min-h-11 w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-gray-950 placeholder:text-gray-500 transition-colors duration-150 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600/25"
              placeholder="เช่น 25000"
            />
            <p
              id="current-mileage-help"
              className="mt-1.5 text-sm leading-5 text-gray-600"
            >
              ใช้ตรวจเลขไมล์ตอนรับรถและช่วยจัดอันดับรถที่แนะนำ
            </p>
            {editingVehicle &&
              formData.currentMileage !== "" &&
              Number(formData.currentMileage) < editingVehicle.currentMileage && (
                <p className="mt-2 rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-900 ring-1 ring-amber-200">
                  กำลังปรับลดจาก {editingVehicle.currentMileage.toLocaleString()} km
                  โปรดตรวจสอบว่าเป็นการแก้ไขข้อมูลที่บันทึกผิด
                </p>
              )}
          </div>

          <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={closeVehicleModal}
              className="inline-flex min-h-11 items-center justify-center rounded-lg bg-gray-100 px-4 py-2.5 text-sm font-medium text-gray-700 transition-colors duration-150 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-600/25"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex min-h-11 items-center justify-center rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition-colors duration-150 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "กำลังบันทึก..." : vehicleSubmitLabel}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
