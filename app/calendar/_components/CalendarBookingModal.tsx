"use client"

import { useEffect, useRef, useState, type FormEvent } from "react"
import { isAxiosError } from "axios"
import { X } from "lucide-react"
import { ToastDialogTarget, useToast } from "@/app/component/toast-provider"
import api from "@/lib/api"
import { bangkokDateKey } from "@/lib/calendar/dates"
import { bookingPeriod, validateBookingPeriod, type CalendarBookingPeriod, type CalendarBookingSelection } from "@/lib/calendar/booking"
import type { Vehicle } from "@/app/user/booking/types"
import { getErrorMessage } from "@/app/user/booking/utils"

type Props = {
  selection: CalendarBookingSelection
  returnFocus: HTMLElement | null
  onClose: () => void
  onBooked: (day: string) => void
}

const fieldClass = "min-h-11 w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-950 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600/25 disabled:bg-gray-100"
const secondaryClass = "inline-flex min-h-11 items-center justify-center rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 disabled:opacity-60"
const primaryClass = "inline-flex min-h-11 items-center justify-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 disabled:cursor-not-allowed disabled:opacity-60"

export default function CalendarBookingModal({ selection, returnFocus, onClose, onBooked }: Props) {
  const toast = useToast()
  const dialog = useRef<HTMLDialogElement>(null)
  const [period, setPeriod] = useState(() => bookingPeriod(selection))
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [vehicleId, setVehicleId] = useState("")
  const [purpose, setPurpose] = useState("")
  const [destination, setDestination] = useState("")
  const [searching, setSearching] = useState(false)
  const [searched, setSearched] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState("")
  const submittingRef = useRef(false)
  const searchRequest = useRef(0)
  const controller = useRef<AbortController | null>(null)

  useEffect(() => {
    const element = dialog.current!
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = "hidden"
    element.showModal()
    return () => {
      searchRequest.current += 1
      controller.current?.abort()
      element.close()
      document.body.style.overflow = previousOverflow
      if (returnFocus?.isConnected) returnFocus.focus()
    }
  }, [returnFocus])

  const changePeriod = (key: keyof CalendarBookingPeriod, value: string) => {
    searchRequest.current += 1
    controller.current?.abort()
    setPeriod((current) => ({ ...current, [key]: value }))
    setVehicles([])
    setVehicleId("")
    setSearched(false)
    setSearching(false)
    setError("")
  }

  const searchVehicles = async (preserveError = false) => {
    const validated = validateBookingPeriod(period)
    if (validated.error) {
      setError(validated.error)
      return
    }
    const request = ++searchRequest.current
    controller.current?.abort()
    const nextController = new AbortController()
    controller.current = nextController
    setSearching(true)
    setSearched(false)
    setVehicles([])
    setVehicleId("")
    if (!preserveError) setError("")
    try {
      const response = await api.get<Vehicle[]>("/api/vehicles/recommend", {
        params: { startDate: validated.startDate, endDate: validated.endDate },
        signal: nextController.signal,
      })
      if (searchRequest.current !== request) return
      setVehicles(response.data)
      setSearched(true)
    } catch (cause) {
      if (searchRequest.current === request) setError(getErrorMessage(cause, "ไม่สามารถค้นหารถได้ กรุณาลองใหม่อีกครั้ง"))
    } finally {
      if (searchRequest.current === request) setSearching(false)
    }
  }

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (submittingRef.current) return
    const validated = validateBookingPeriod(period)
    if (validated.error) return setError(validated.error)
    if (!searched || searching || !vehicles.some((vehicle) => vehicle.id === vehicleId)) return setError("กรุณาค้นหาและเลือกรถที่ว่างก่อนยืนยันการจอง")
    if (!purpose.trim()) return setError("กรุณาระบุวัตถุประสงค์")
    submittingRef.current = true
    setSubmitting(true)
    setError("")
    try {
      await api.post("/api/booking", {
        vehicleId,
        startDate: validated.startDate,
        endDate: validated.endDate,
        purpose: purpose.trim(),
        destination: destination.trim(),
      })
    } catch (cause) {
      const message = getErrorMessage(cause, "ไม่สามารถจองรถได้ กรุณาลองใหม่อีกครั้ง")
      toast.error(message)
      if (isAxiosError(cause) && cause.response?.status === 409) {
        setError(message)
        await searchVehicles(true)
      }
      submittingRef.current = false
      setSubmitting(false)
      return
    }
    onBooked(period.startDay)
  }

  const close = () => { if (!submittingRef.current) onClose() }
  const today = bangkokDateKey(new Date())

  return (
    <dialog
      ref={dialog}
      aria-labelledby="calendar-booking-title"
      aria-describedby="calendar-booking-description"
      aria-modal="true"
      onCancel={(event) => { event.preventDefault(); close() }}
      onKeyDown={(event) => {
        if (event.key !== "Tab") return
        const element = event.currentTarget
        const controls = Array.from(element.querySelectorAll<HTMLElement>("button, input, select, textarea, a[href], [tabindex]"))
          .filter((control) => !control.matches(":disabled") && control.tabIndex >= 0 && control.getClientRects().length > 0)
        const first = controls[0]
        const last = controls.at(-1)
        if (!first) {
          event.preventDefault()
          element.focus()
        } else if (event.shiftKey && document.activeElement === first) {
          event.preventDefault()
          last?.focus()
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault()
          first.focus()
        }
      }}
      tabIndex={-1}
      className="m-auto max-h-[calc(100dvh_-_2rem)] w-[calc(100%_-_2rem)] max-w-2xl overflow-hidden rounded-xl bg-white p-0 text-gray-950 backdrop:bg-gray-900/50 open:flex open:flex-col"
    >
      <header className="flex shrink-0 items-start justify-between gap-4 border-b border-gray-200 px-5 py-4 sm:px-6">
        <div>
          <h2 id="calendar-booking-title" className="text-lg font-semibold">จองรถ</h2>
          <p id="calendar-booking-description" className="mt-1 text-sm leading-6 text-gray-600">เลือกช่วงเวลา ค้นหารถว่าง และกรอกรายละเอียด · เวลาไทย (UTC+7)</p>
        </div>
        <button type="button" onClick={close} disabled={submitting} aria-label="ปิดหน้าต่าง" className="flex size-11 shrink-0 items-center justify-center rounded-lg text-gray-600 hover:bg-gray-100 focus-visible:outline-2 focus-visible:outline-blue-600 disabled:opacity-60"><X className="size-5" aria-hidden="true" /></button>
      </header>
      <form onSubmit={submit} className="flex min-h-0 flex-col" aria-busy={submitting}>
        <div className="min-h-0 space-y-5 overflow-y-auto p-5 sm:p-6">
          <fieldset disabled={submitting} className="space-y-5">
            <legend className="sr-only">รายละเอียดการจองรถ</legend>
            <div className="grid grid-cols-2 gap-4">
              {([
                ["startDay", "วันเริ่มต้น", "date", today],
                ["startTime", "เวลาเริ่มต้น", "time", undefined],
                ["endDay", "วันสิ้นสุด", "date", period.startDay || today],
                ["endTime", "เวลาสิ้นสุด", "time", undefined],
              ] as const).map(([key, label, type, min]) => (
                <div key={key} className="min-w-0">
                  <label htmlFor={`calendar-${key}`} className="mb-1.5 block text-sm font-medium text-gray-700">{label} <span className="text-red-700">*</span></label>
                  <input id={`calendar-${key}`} type={type} min={min} required value={period[key]} onChange={(event) => changePeriod(key, event.target.value)} className={fieldClass} />
                </div>
              ))}
            </div>
            <button type="button" disabled={searching} onClick={() => void searchVehicles()} className={secondaryClass}>{searching ? "กำลังค้นหา…" : "ค้นหารถว่าง"}</button>
            <div aria-live="polite" aria-busy={searching}>
              {searching ? <p role="status" className="text-sm text-gray-600">กำลังค้นหารถที่ว่างในช่วงเวลานี้…</p>
                : searched && vehicles.length === 0 ? <p role="status" className="rounded-lg bg-gray-50 p-4 text-sm text-gray-700">ไม่มีรถว่างในช่วงเวลานี้ กรุณาเลือกช่วงเวลาอื่นแล้วค้นหาใหม่</p>
                : !searched ? <p className="text-sm text-gray-600">ระบุช่วงเวลาแล้วกดค้นหาเพื่อเลือกรถที่ว่าง</p> : null}
            </div>
            {searched && vehicles.length > 0 && (
              <div>
                <label htmlFor="calendar-vehicle" className="mb-1.5 block text-sm font-medium text-gray-700">รถที่ต้องการจอง <span className="text-red-700">*</span></label>
                <select id="calendar-vehicle" required value={vehicleId} onChange={(event) => setVehicleId(event.target.value)} className={fieldClass}>
                  <option value="">เลือกรถ ({vehicles.length} คัน)</option>
                  {vehicles.map((vehicle) => <option key={vehicle.id} value={vehicle.id}>{vehicle.plateNumber} · {vehicle.type.name}{vehicle.recommended ? " · แนะนำ" : ""}</option>)}
                </select>
              </div>
            )}
            <div>
              <label htmlFor="calendar-purpose" className="mb-1.5 block text-sm font-medium text-gray-700">วัตถุประสงค์ <span className="text-red-700">*</span></label>
              <input id="calendar-purpose" required value={purpose} onChange={(event) => setPurpose(event.target.value)} placeholder="เช่น ประชุมลูกค้า, ไปส่งเอกสาร" className={fieldClass} />
            </div>
            <div>
              <label htmlFor="calendar-destination" className="mb-1.5 block text-sm font-medium text-gray-700">ปลายทาง (ไม่บังคับ)</label>
              <input id="calendar-destination" maxLength={255} value={destination} onChange={(event) => setDestination(event.target.value)} placeholder="เช่น สำนักงานเขต, สถานีไฟฟ้า" className={fieldClass} />
            </div>
          </fieldset>
          {error && <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-800">{error}</p>}
        </div>
        <div className="flex shrink-0 flex-col-reverse gap-3 border-t border-gray-200 bg-white px-5 py-4 sm:flex-row sm:justify-end sm:px-6">
          <button type="button" onClick={close} disabled={submitting} className={secondaryClass}>ยกเลิก</button>
          <button type="submit" disabled={submitting || searching || !vehicleId || !searched} className={primaryClass}>{submitting ? "กำลังส่งคำขอ…" : "ยืนยันการจอง"}</button>
        </div>
      </form>
      <ToastDialogTarget />
    </dialog>
  )
}
