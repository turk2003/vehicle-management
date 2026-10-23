import { Wrench, X } from "lucide-react"
import type * as React from "react"
import type { Dispatch, SetStateAction } from "react"
import type { Vehicle, MaintenanceForm } from "../types"
import { getLocalDateTimeInputValue } from "../utils"

type ReportMaintenanceModalProps = {
  closeReportModal: () => void
  handleSubmit: (e: React.FormEvent) => Promise<void>
  error: string
  formData: MaintenanceForm
  setFormData: Dispatch<SetStateAction<MaintenanceForm>>
  vehicles: Vehicle[]
  loading: boolean
}

export default function ReportMaintenanceModal({
  closeReportModal,
  handleSubmit,
  error,
  formData,
  setFormData,
  vehicles,
  loading,
}: ReportMaintenanceModalProps) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-gray-900/50 px-4 py-8"
      role="dialog"
      aria-modal="true"
      aria-labelledby="maintenance-report-title"
    >
      <div className="w-full max-w-lg rounded-xl bg-white shadow-lg ring-1 ring-gray-200">
        <div className="flex items-start justify-between gap-4 border-b border-gray-200 px-6 py-5">
          <div>
            <h3
              id="maintenance-report-title"
              className="text-lg font-semibold text-gray-950"
            >
              แจ้งรถเสีย / ส่งซ่อม
            </h3>
            <p className="mt-1 text-sm text-gray-600">
              ระบุรถและรายละเอียดปัญหาเพื่อส่งเข้าคิวซ่อมบำรุง
            </p>
          </div>
          <button
            type="button"
            onClick={closeReportModal}
            className="inline-flex h-9 w-9 items-center justify-center rounded-md text-gray-500 transition-colors duration-150 hover:bg-gray-100 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-600/25"
            aria-label="ปิดหน้าต่าง"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 px-6 py-6">
          {error && (
            <div
              role="alert"
              className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"
            >
              {error}
            </div>
          )}

          <div>
            <label
              htmlFor="maintenance-vehicle"
              className="mb-1.5 block text-sm font-medium text-gray-700"
            >
              เลือกรถที่พบปัญหา{" "}
              <span className="text-red-700">*</span>
            </label>
            <select
              id="maintenance-vehicle"
              required
              value={formData.vehicleId}
              onChange={(e) =>
                setFormData((current) => ({
                  ...current,
                  vehicleId: e.target.value,
                }))
              }
              className="min-h-11 w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-gray-950 transition-colors duration-150 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600/25"
            >
              <option value="">เลือกรถ</option>
              {vehicles.map((vehicle) => (
                <option key={vehicle.id} value={vehicle.id}>
                  {vehicle.plateNumber} ({vehicle.type.name})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor="maintenance-type"
              className="mb-1.5 block text-sm font-medium text-gray-700"
            >
              ประเภทงานซ่อม <span className="text-red-700">*</span>
            </label>
            <select
              id="maintenance-type"
              required
              value={formData.maintenanceType}
              onChange={(e) =>
                setFormData((current) => ({
                  ...current,
                  maintenanceType: e.target.value as MaintenanceForm["maintenanceType"],
                }))
              }
              className="min-h-11 w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-gray-950 transition-colors duration-150 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600/25"
            >
              <option value="">เลือกประเภทงานซ่อม</option>
              <option value="BREAKDOWN">ซ่อมจากความขัดข้อง</option>
              <option value="PREVENTIVE">บำรุงรักษาตามรอบ</option>
              <option value="OTHER">งานซ่อมอื่น</option>
            </select>
            <p className="mt-1.5 text-sm text-gray-600">
              ช่วยให้รายงานแยกเหตุขัดข้องออกจากการดูแลรถตามแผน
            </p>
          </div>

          <div>
            <label
              htmlFor="maintenance-description"
              className="mb-1.5 block text-sm font-medium text-gray-700"
            >
              รายละเอียดปัญหา <span className="text-red-700">*</span>
            </label>
            <textarea
              id="maintenance-description"
              required
              rows={4}
              value={formData.description}
              onChange={(e) =>
                setFormData((current) => ({
                  ...current,
                  description: e.target.value,
                }))
              }
              placeholder="เช่น แอร์ไม่เย็น, ยางแบน, ไฟหน้าไม่ติด"
              className="min-h-28 w-full resize-none rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-gray-950 transition-colors duration-150 placeholder:text-gray-500 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600/25"
            />
          </div>

          <div>
            <label
              htmlFor="maintenance-start-date"
              className="mb-1.5 block text-sm font-medium text-gray-700"
            >
              วันที่พบปัญหา <span className="text-red-700">*</span>
            </label>
            <input
              id="maintenance-start-date"
              type="datetime-local"
              required
              value={formData.startDate}
              onChange={(e) =>
                setFormData((current) => ({
                  ...current,
                  startDate: e.target.value,
                }))
              }
              max={getLocalDateTimeInputValue()}
              className="min-h-11 w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-gray-950 transition-colors duration-150 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600/25"
            />
          </div>

          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={closeReportModal}
              className="inline-flex min-h-11 items-center justify-center rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 transition-colors duration-150 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-600/25"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors duration-150 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-600/25 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Wrench className="h-4 w-4" aria-hidden="true" />
              {loading ? "กำลังบันทึก..." : "ยืนยันแจ้งซ่อม"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
