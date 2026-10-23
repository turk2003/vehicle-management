import { X } from "lucide-react"
import type * as React from "react"
import type { Dispatch, SetStateAction } from "react"
import type { VehicleType, VehicleTypeFormData } from "../types"

type VehicleTypeFormModalProps = {
  typeModalTitle: "แก้ไขประเภทรถ" | "เพิ่มประเภทรถ"
  closeTypeModal: () => void
  editingType: VehicleType | null
  updateVehicleType: (e: React.FormEvent) => Promise<void>
  createVehicleType: (e: React.FormEvent) => Promise<void>
  typeFormData: VehicleTypeFormData
  setTypeFormData: Dispatch<SetStateAction<VehicleTypeFormData>>
  loading: boolean
  typeSubmitLabel: "บันทึกการแก้ไข" | "เพิ่มประเภท"
}

export default function VehicleTypeFormModal({
  typeModalTitle,
  closeTypeModal,
  editingType,
  updateVehicleType,
  createVehicleType,
  typeFormData,
  setTypeFormData,
  loading,
  typeSubmitLabel,
}: VehicleTypeFormModalProps) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-gray-900/50 px-4 py-8"
      role="dialog"
      aria-modal="true"
      aria-labelledby="type-modal-title"
    >
      <div className="w-full max-w-lg rounded-xl bg-white shadow-lg ring-1 ring-gray-200">
        <div className="flex items-start justify-between gap-4 border-b border-gray-200 px-6 py-5">
          <div>
            <h3
              id="type-modal-title"
              className="text-lg font-semibold text-gray-950"
            >
              {typeModalTitle}
            </h3>
            <p className="mt-1 text-sm text-gray-600">
              ใช้จัดกลุ่มรถในรายการและแบบฟอร์มการจอง
            </p>
          </div>
          <button
            type="button"
            onClick={closeTypeModal}
            className="inline-flex h-9 w-9 items-center justify-center rounded-md text-gray-500 transition-colors duration-150 hover:bg-gray-100 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-600/25"
            aria-label="ปิดหน้าต่าง"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>

        <form
          onSubmit={editingType ? updateVehicleType : createVehicleType}
          className="space-y-5 px-6 py-6"
        >
          <div>
            <label
              htmlFor="typeName"
              className="mb-1.5 block text-sm font-medium text-gray-700"
            >
              ชื่อประเภทรถ
            </label>
            <input
              id="typeName"
              type="text"
              required
              value={typeFormData.name}
              onChange={(e) =>
                setTypeFormData({ name: e.target.value })
              }
              className="min-h-11 w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-gray-950 placeholder:text-gray-500 transition-colors duration-150 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600/25"
              placeholder="เช่น รถเก๋ง, รถตู้, รถกระบะ"
            />
          </div>

          <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={closeTypeModal}
              className="inline-flex min-h-11 items-center justify-center rounded-lg bg-gray-100 px-4 py-2.5 text-sm font-medium text-gray-700 transition-colors duration-150 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-600/25"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex min-h-11 items-center justify-center rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition-colors duration-150 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "กำลังบันทึก..." : typeSubmitLabel}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
