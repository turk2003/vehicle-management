import { FormEvent } from "react"
import { X } from "lucide-react"
import type { Dispatch, SetStateAction } from "react"
import type { MaintenanceStatus, Maintenance, Vehicle, FormData } from "../types"
import { fieldClass } from "../constants"

type MaintenanceFormModalProps = {
  editingItem: Maintenance | null
  closeModal: () => void
  handleSubmit: (event: FormEvent<HTMLFormElement>) => Promise<void>
  error: string
  formData: FormData
  setFormData: Dispatch<SetStateAction<FormData>>
  vehicles: Vehicle[]
  loading: boolean
}

export default function MaintenanceFormModal({
  editingItem,
  closeModal,
  handleSubmit,
  error,
  formData,
  setFormData,
  vehicles,
  loading,
}: MaintenanceFormModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/55 px-4 py-6 backdrop-blur-sm">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="maintenance-modal-title"
        className="max-h-[90vh] w-full max-w-2xl overflow-hidden rounded-xl bg-white shadow-2xl ring-1 ring-slate-900/10"
      >
        <div className="flex items-start justify-between gap-4 border-b border-slate-200 px-5 py-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-orange-700">
              Maintenance Control
            </p>
            <h3 id="maintenance-modal-title" className="mt-1 text-lg font-semibold text-slate-950">
              {editingItem ? "แก้ไขรายการบำรุงรักษา" : "เพิ่มรายการบำรุงรักษา"}
            </h3>
            <p className="mt-1 text-sm text-slate-500">
              ระบุช่วงเวลา รายละเอียดงาน และสถานะเพื่อให้ตารางรถพร้อมใช้งานถูกต้อง
            </p>
          </div>
          <button
            type="button"
            onClick={closeModal}
            className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-700 focus:outline-none focus:ring-2 focus:ring-orange-500"
            aria-label="ปิดหน้าต่าง"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="max-h-[calc(90vh-96px)] overflow-y-auto p-5">
          <div className="space-y-5">
            {error && (
              <div className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">
                {error}
              </div>
            )}

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label htmlFor="maintenance-vehicle" className="mb-1.5 block text-sm font-medium text-slate-700">
                  รถ <span className="text-rose-500">*</span>
                </label>
                <select
                  id="maintenance-vehicle"
                  required
                  value={formData.vehicleId}
                  onChange={(event) => setFormData({ ...formData, vehicleId: event.target.value })}
                  disabled={!!editingItem}
                  className={fieldClass}
                >
                  <option value="">เลือกรถ</option>
                  {vehicles.map((vehicle) => (
                    <option key={vehicle.id} value={vehicle.id}>
                      {vehicle.plateNumber} ({vehicle.type.name})
                    </option>
                  ))}
                </select>
              </div>

              <div className="sm:col-span-2">
                <label htmlFor="maintenance-type" className="mb-1.5 block text-sm font-medium text-slate-700">
                  ประเภทงานซ่อม <span className="text-rose-500">*</span>
                </label>
                <select
                  id="maintenance-type"
                  required
                  value={formData.maintenanceType}
                  onChange={(event) => setFormData({
                    ...formData,
                    maintenanceType: event.target.value as FormData["maintenanceType"],
                  })}
                  className={fieldClass}
                >
                  <option value="">เลือกประเภทงานซ่อม</option>
                  <option value="BREAKDOWN">ซ่อมจากความขัดข้อง</option>
                  <option value="PREVENTIVE">บำรุงรักษาตามรอบ</option>
                  <option value="OTHER">งานซ่อมอื่น</option>
                  {editingItem?.maintenanceType === "UNSPECIFIED" && (
                    <option value="UNSPECIFIED">ยังไม่ระบุประเภท (ข้อมูลเดิม)</option>
                  )}
                </select>
                <p className="mt-1.5 text-sm text-slate-600">
                  ประเภทนี้ใช้แยกเหตุขัดข้องออกจากการบำรุงรักษาตามแผนในรายงาน
                </p>
              </div>

              <div className="sm:col-span-2">
                <label htmlFor="maintenance-description" className="mb-1.5 block text-sm font-medium text-slate-700">
                  รายละเอียด <span className="text-rose-500">*</span>
                </label>
                <textarea
                  id="maintenance-description"
                  required
                  rows={3}
                  value={formData.description}
                  onChange={(event) => setFormData({ ...formData, description: event.target.value })}
                  placeholder="เช่น ตรวจเช็กระยะ เปลี่ยนน้ำมันเครื่อง หรือซ่อมระบบเบรก"
                  className={fieldClass}
                />
              </div>

              <div>
                <label htmlFor="maintenance-start" className="mb-1.5 block text-sm font-medium text-slate-700">
                  วันที่เริ่ม <span className="text-rose-500">*</span>
                </label>
                <input
                  id="maintenance-start"
                  type="datetime-local"
                  required
                  value={formData.startDate}
                  onChange={(event) => setFormData({ ...formData, startDate: event.target.value })}
                  className={fieldClass}
                />
              </div>

              <div>
                <label htmlFor="maintenance-end" className="mb-1.5 block text-sm font-medium text-slate-700">
                  วันที่เสร็จ {formData.status === "COMPLETED" && <span className="text-rose-500">*</span>}
                </label>
                <input
                  id="maintenance-end"
                  type="datetime-local"
                  required={formData.status === "COMPLETED"}
                  value={formData.endDate}
                  onChange={(event) => setFormData({ ...formData, endDate: event.target.value })}
                  className={fieldClass}
                />
              </div>

              <div>
                <label htmlFor="maintenance-status" className="mb-1.5 block text-sm font-medium text-slate-700">
                  สถานะ
                </label>
                <select
                  id="maintenance-status"
                  value={formData.status}
                  onChange={(event) => setFormData({ ...formData, status: event.target.value as MaintenanceStatus })}
                  className={fieldClass}
                >
                  <option value="REPORTED">รายงานแล้ว</option>
                  <option value="IN_PROGRESS">กำลังซ่อม</option>
                  <option value="COMPLETED">เสร็จสิ้น</option>
                </select>
              </div>

              <div>
                <label htmlFor="maintenance-cost" className="mb-1.5 block text-sm font-medium text-slate-700">
                  ค่าใช้จ่าย (บาท)
                </label>
                <input
                  id="maintenance-cost"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.cost}
                  onChange={(event) => setFormData({ ...formData, cost: event.target.value })}
                  placeholder="0.00"
                  className={fieldClass}
                />
              </div>

              <div className="sm:col-span-2">
                <label htmlFor="maintenance-service-center" className="mb-1.5 block text-sm font-medium text-slate-700">
                  ศูนย์บริการ / ช่าง
                </label>
                <input
                  id="maintenance-service-center"
                  type="text"
                  value={formData.serviceCenterName}
                  onChange={(event) => setFormData({ ...formData, serviceCenterName: event.target.value })}
                  placeholder="เช่น ศูนย์บริการหลัก หรือชื่ออู่ที่รับงาน"
                  className={fieldClass}
                />
              </div>

              <div className="sm:col-span-2">
                <label htmlFor="maintenance-repair-details" className="mb-1.5 block text-sm font-medium text-slate-700">
                  รายละเอียดการซ่อมเพิ่มเติม
                </label>
                <textarea
                  id="maintenance-repair-details"
                  rows={3}
                  value={formData.repairDetails}
                  onChange={(event) => setFormData({ ...formData, repairDetails: event.target.value })}
                  placeholder="บันทึกอะไหล่ที่เปลี่ยน งานที่ทำ หรือหมายเหตุจากช่าง"
                  className={fieldClass}
                />
              </div>
            </div>
          </div>

          <div className="mt-6 flex flex-col-reverse gap-3 border-t border-slate-200 pt-4 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={closeModal}
              className="inline-flex justify-center rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex justify-center rounded-lg bg-orange-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "กำลังบันทึก..." : editingItem ? "บันทึกการแก้ไข" : "เพิ่มรายการ"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
