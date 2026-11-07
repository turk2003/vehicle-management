import { useState } from "react"
import type * as React from "react"
import axios from "axios"
import { X } from "lucide-react"
import api from "@/lib/api"
import { formatDateTime, getVehicleStatusColor, getVehicleStatusText } from "@/lib/format"
import type { Vehicle } from "../types"
import { getErrorMessage } from "../utils"

type TargetStatus = "AVAILABLE" | "MAINTENANCE"

type AffectedBooking = {
  id: string
  startDate: string
  endDate: string
  user: { name: string }
}

type VehicleStatusModalProps = {
  vehicle: Vehicle
  onClose: () => void
  onDone: (message: string) => Promise<void>
  /** โหลดรายการรถใหม่ — ใช้เมื่อบางขั้นสำเร็จไปแล้วก่อนเกิด error */
  onRefresh: () => Promise<void>
}

const MAINTENANCE_TYPES = [
  { value: "BREAKDOWN", label: "ซ่อมจากความขัดข้อง" },
  { value: "PREVENTIVE", label: "บำรุงรักษาตามรอบ" },
  { value: "OTHER", label: "งานซ่อมอื่น" },
]

const fieldClass =
  "min-h-11 w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-gray-950 placeholder:text-gray-500 transition-colors duration-150 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600/25"

function toLocalInputValue(date: Date) {
  const offset = date.getTimezoneOffset() * 60_000
  return new Date(date.getTime() - offset).toISOString().slice(0, 16)
}

/**
 * เปลี่ยนสถานะรถโดยสร้าง/ปิดข้อมูลต้นทาง (งานซ่อม, การคืนรถ) แทนการเขียนสถานะตรงๆ
 * เพราะสถานะรถถูกคำนวณใหม่จากข้อมูลเหล่านี้ทุกครั้ง (syncAllVehicleStatuses)
 */
export default function VehicleStatusModal({
  vehicle,
  onClose,
  onDone,
  onRefresh,
}: VehicleStatusModalProps) {
  const context = vehicle.statusContext ?? {
    activeMaintenances: [],
    inProgressBookings: [],
    scheduledBookings: [],
  }
  const [target, setTarget] = useState<TargetStatus | null>(null)
  const [returnMileages, setReturnMileages] = useState<Record<string, string>>({})
  const [description, setDescription] = useState("")
  const [maintenanceType, setMaintenanceType] = useState("BREAKDOWN")
  const [startDate, setStartDate] = useState(() => toLocalInputValue(new Date()))
  const [affectedBookings, setAffectedBookings] = useState<AffectedBooking[] | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState("")

  const hasBlockers =
    context.activeMaintenances.length > 0 || context.inProgressBookings.length > 0

  const makeAvailable = async () => {
    for (const booking of context.inProgressBookings) {
      const mileage = Number(returnMileages[booking.id])
      if (!Number.isInteger(mileage) || mileage < (booking.mileageStart ?? 0)) {
        throw new Error(
          `เลขไมล์คืนรถของ ${booking.user.name} ต้องเป็นจำนวนเต็มและไม่น้อยกว่า ${(booking.mileageStart ?? 0).toLocaleString()} km`,
        )
      }
    }

    for (const booking of context.inProgressBookings) {
      await api.put("/api/admin/bookings/return", {
        bookingId: booking.id,
        mileageEnd: Number(returnMileages[booking.id]),
      })
    }
    const now = new Date().toISOString()
    for (const maintenance of context.activeMaintenances) {
      await api.put("/api/admin/maintenance", {
        id: maintenance.id,
        status: "COMPLETED",
        endDate: now,
      })
    }
  }

  const createMaintenance = async (allowBookingConflicts: boolean) => {
    await api.post("/api/admin/maintenance", {
      vehicleId: vehicle.id,
      description: description.trim(),
      maintenanceType,
      startDate: new Date(startDate).toISOString(),
      allowBookingConflicts,
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!target) return

    try {
      setSubmitting(true)
      setError("")
      if (target === "AVAILABLE") {
        await makeAvailable()
        await onDone(`เปลี่ยนรถ ${vehicle.plateNumber} เป็นว่างแล้ว`)
      } else {
        try {
          await createMaintenance(affectedBookings !== null)
        } catch (err) {
          if (
            axios.isAxiosError<{ code?: string; affectedBookings?: AffectedBooking[] }>(err) &&
            err.response?.data?.code === "AFFECTED_BOOKINGS"
          ) {
            setAffectedBookings(err.response.data.affectedBookings ?? [])
            return
          }
          throw err
        }
        await onDone(`สร้างงานซ่อมให้รถ ${vehicle.plateNumber} แล้ว`)
      }
    } catch (err) {
      if (axios.isAxiosError(err)) {
        setError(getErrorMessage(err, "ไม่สามารถเปลี่ยนสถานะรถได้"))
        await onRefresh()
      } else {
        setError(err instanceof Error ? err.message : "ไม่สามารถเปลี่ยนสถานะรถได้")
      }
    } finally {
      setSubmitting(false)
    }
  }

  const chooseTarget = (value: TargetStatus) => {
    setTarget(value)
    setAffectedBookings(null)
    setError("")
  }

  const optionClass = (selected: boolean) =>
    `flex-1 rounded-lg px-4 py-3 text-left text-sm ring-1 transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-blue-600/25 ${
      selected
        ? "bg-blue-50 font-semibold text-blue-800 ring-blue-300"
        : "bg-white text-gray-700 ring-gray-300 hover:bg-gray-50"
    }`

  const submitLabel =
    target === "MAINTENANCE"
      ? affectedBookings
        ? "ยืนยันสร้างงานซ่อม"
        : "สร้างงานซ่อม"
      : "เปลี่ยนเป็นว่าง"

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-gray-900/50 px-4 py-8"
      role="dialog"
      aria-modal="true"
      aria-labelledby="vehicle-status-modal-title"
    >
      <div className="w-full max-w-lg rounded-xl bg-white shadow-lg ring-1 ring-gray-200">
        <div className="flex items-start justify-between gap-4 border-b border-gray-200 px-6 py-5">
          <div>
            <h3
              id="vehicle-status-modal-title"
              className="text-lg font-semibold text-gray-950"
            >
              เปลี่ยนสถานะ: {vehicle.plateNumber}
            </h3>
            <p className="mt-1 text-sm text-gray-600">
              สถานะรถมาจากงานซ่อมและการจอง ระบบจะปิดหรือสร้างรายการเหล่านั้นให้
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            className="inline-flex h-9 w-9 items-center justify-center rounded-md text-gray-500 transition-colors duration-150 hover:bg-gray-100 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-600/25 disabled:opacity-60"
            aria-label="ปิดหน้าต่าง"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 px-6 py-6">
          <section className="rounded-lg bg-gray-50 p-4 text-sm ring-1 ring-gray-200">
            <div className="flex items-center gap-2">
              <span className="font-medium text-gray-600">สถานะตอนนี้</span>
              <span
                className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${getVehicleStatusColor(vehicle.status)}`}
              >
                {getVehicleStatusText(vehicle.status)}
              </span>
            </div>
            <ul className="mt-3 space-y-1.5 text-gray-700">
              {context.activeMaintenances.map((m) => (
                <li key={m.id}>
                  งานซ่อม: {m.description} (เริ่ม {formatDateTime(m.startDate)})
                </li>
              ))}
              {context.inProgressBookings.map((b) => (
                <li key={b.id}>
                  {b.user.name} รับรถไปแล้ว
                  {b.pickedUpAt && ` เมื่อ ${formatDateTime(b.pickedUpAt)}`} ยังไม่คืน
                </li>
              ))}
              {context.scheduledBookings.map((b) => (
                <li key={b.id}>
                  จองโดย {b.user.name} {formatDateTime(b.startDate)} – {formatDateTime(b.endDate)}
                </li>
              ))}
              {!hasBlockers && context.scheduledBookings.length === 0 && (
                <li>ไม่มีงานซ่อมหรือการจองที่ใช้รถอยู่ตอนนี้</li>
              )}
            </ul>
          </section>

          <fieldset>
            <legend className="mb-2 text-sm font-medium text-gray-700">
              เปลี่ยนเป็น
            </legend>
            <div className="flex flex-col gap-2 sm:flex-row">
              <button
                type="button"
                aria-pressed={target === "AVAILABLE"}
                disabled={!hasBlockers}
                onClick={() => chooseTarget("AVAILABLE")}
                className={`${optionClass(target === "AVAILABLE")} disabled:cursor-not-allowed disabled:opacity-50`}
              >
                ว่าง
              </button>
              <button
                type="button"
                aria-pressed={target === "MAINTENANCE"}
                onClick={() => chooseTarget("MAINTENANCE")}
                className={optionClass(target === "MAINTENANCE")}
              >
                ซ่อมบำรุง
              </button>
            </div>
            <p className="mt-2 text-sm leading-6 text-gray-600">
              &quot;จองแล้ว&quot; และ &quot;กำลังใช้งาน&quot; มาจากการจองเท่านั้น จัดการได้ที่หน้าการจอง
            </p>
          </fieldset>

          {target === "AVAILABLE" && (
            <section className="space-y-4">
              {context.inProgressBookings.map((b) => (
                <div key={b.id}>
                  <label
                    htmlFor={`return-mileage-${b.id}`}
                    className="mb-1.5 block text-sm font-medium text-gray-700"
                  >
                    เลขไมล์คืนรถแทน {b.user.name} (km)
                  </label>
                  <input
                    id={`return-mileage-${b.id}`}
                    type="number"
                    required
                    min={b.mileageStart ?? 0}
                    step="1"
                    value={returnMileages[b.id] ?? ""}
                    onChange={(e) =>
                      setReturnMileages((current) => ({ ...current, [b.id]: e.target.value }))
                    }
                    className={fieldClass}
                  />
                  <p className="mt-1.5 text-sm text-gray-600">
                    เลขไมล์ตอนรับรถ {(b.mileageStart ?? 0).toLocaleString()} km
                  </p>
                </div>
              ))}
              {context.activeMaintenances.length > 0 && (
                <p className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm leading-6 text-amber-900">
                  งานซ่อม {context.activeMaintenances.length} รายการจะถูกปิดเป็น &quot;เสร็จสิ้น&quot; โดยใช้วันที่เสร็จเป็นตอนนี้
                  รายละเอียดการซ่อมและค่าใช้จ่ายเพิ่มภายหลังได้ที่หน้าแจ้งซ่อม
                </p>
              )}
              {context.scheduledBookings.length > 0 && (
                <p className="text-sm leading-6 text-gray-600">
                  รถยังมีการจองในช่วงเวลานี้ หลังบันทึกสถานะจะเป็น &quot;จองแล้ว&quot;
                </p>
              )}
            </section>
          )}

          {target === "MAINTENANCE" && (
            <section className="space-y-4">
              <div>
                <label
                  htmlFor="status-maintenance-description"
                  className="mb-1.5 block text-sm font-medium text-gray-700"
                >
                  รายละเอียดปัญหา
                </label>
                <input
                  id="status-maintenance-description"
                  type="text"
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className={fieldClass}
                  placeholder="เช่น ยางรั่ว แอร์ไม่เย็น"
                />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="status-maintenance-type"
                    className="mb-1.5 block text-sm font-medium text-gray-700"
                  >
                    ประเภทงานซ่อม
                  </label>
                  <select
                    id="status-maintenance-type"
                    value={maintenanceType}
                    onChange={(e) => setMaintenanceType(e.target.value)}
                    className={fieldClass}
                  >
                    {MAINTENANCE_TYPES.map((type) => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label
                    htmlFor="status-maintenance-start"
                    className="mb-1.5 block text-sm font-medium text-gray-700"
                  >
                    เริ่มซ่อม
                  </label>
                  <input
                    id="status-maintenance-start"
                    type="datetime-local"
                    required
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className={fieldClass}
                  />
                </div>
              </div>
              {affectedBookings && (
                <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm leading-6 text-amber-900">
                  <p className="font-medium">
                    มีการจองที่ได้รับผลกระทบ {affectedBookings.length} รายการ
                  </p>
                  <ul className="mt-1 list-disc pl-5">
                    {affectedBookings.map((b) => (
                      <li key={b.id}>
                        {b.user.name}: {formatDateTime(b.startDate)} – {formatDateTime(b.endDate)}
                      </li>
                    ))}
                  </ul>
                  <p className="mt-1">กดยืนยันอีกครั้งเพื่อสร้างงานซ่อม แล้วไปเปลี่ยนรถให้ผู้จองที่หน้าการจอง</p>
                </div>
              )}
            </section>
          )}

          {error && (
            <div
              role="alert"
              className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"
            >
              {error}
            </div>
          )}

          <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="inline-flex min-h-11 items-center justify-center rounded-lg bg-gray-100 px-4 py-2.5 text-sm font-medium text-gray-700 transition-colors duration-150 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-600/25 disabled:opacity-60"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              disabled={submitting || !target}
              className="inline-flex min-h-11 items-center justify-center rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition-colors duration-150 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting ? "กำลังบันทึก..." : submitLabel}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
