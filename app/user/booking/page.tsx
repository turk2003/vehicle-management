"use client"

import { useCallback, useEffect, useState } from "react"
import type { AxiosError } from "axios"
import {
  Car,
  CheckCircle2,
  Gauge,
  Search,
  ShieldCheck,
  Wrench,
  X,
} from "lucide-react"
import api from "@/lib/api"
import { formatDateTime } from "@/lib/format"

type Vehicle = {
  id: string
  plateNumber: string
  status: string
  currentMileage: number
  maintenanceCount: number
  score: number
  recommended: boolean
  type: { id: string; name: string }
}

type VehicleType = { id: string; name: string }

type BookingData = {
  vehicleId: string
  startDate: string
  endDate: string
  purpose: string
  destination: string
}

type SearchDate = {
  startDate: string
  endDate: string
}

const INITIAL_BOOKING_DATA: BookingData = {
  vehicleId: "",
  startDate: "",
  endDate: "",
  purpose: "",
  destination: "",
}

const INITIAL_SEARCH_DATE: SearchDate = {
  startDate: "",
  endDate: "",
}

function getErrorMessage(error: unknown, fallback: string) {
  const axiosError = error as AxiosError<{ message?: string }>
  return axiosError.response?.data?.message || fallback
}

function getLocalDateTimeInputValue(date = new Date()) {
  const localDate = new Date(date)
  localDate.setMinutes(localDate.getMinutes() - localDate.getTimezoneOffset())
  return localDate.toISOString().slice(0, 16)
}

export default function BookingPage() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [vehicleTypes, setVehicleTypes] = useState<VehicleType[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedType, setSelectedType] = useState("")
  const [searchDate, setSearchDate] = useState<SearchDate>(INITIAL_SEARCH_DATE)
  const [showBookingForm, setShowBookingForm] = useState(false)
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [bookingData, setBookingData] =
    useState<BookingData>(INITIAL_BOOKING_DATA)

  const fetchVehicleTypes = useCallback(async () => {
    try {
      const response = await api.get<VehicleType[]>("/api/verhicle-type")
      setVehicleTypes(response.data)
    } catch {
      setError("ไม่สามารถโหลดประเภทรถได้")
    }
  }, [])

  const searchVehicles = useCallback(async (clearSuccess = true) => {
    try {
      setLoading(true)
      setError("")
      if (clearSuccess) setSuccess("")

      const params = new URLSearchParams()
      if (selectedType) params.append("vehicleTypeId", selectedType)
      if (searchDate.startDate) params.append("startDate", searchDate.startDate)
      if (searchDate.endDate) params.append("endDate", searchDate.endDate)

      const response = await api.get<Vehicle[]>(
        `/api/vehicles/recommend?${params.toString()}`,
      )
      setVehicles(response.data)
    } catch {
      setError("ไม่สามารถค้นหารถได้ กรุณาลองใหม่อีกครั้ง")
      setVehicles([])
    } finally {
      setLoading(false)
    }
  }, [searchDate.endDate, searchDate.startDate, selectedType])

  const openBookingForm = (vehicle: Vehicle) => {
    setSelectedVehicle(vehicle)
    setBookingData({
      vehicleId: vehicle.id,
      startDate: searchDate.startDate,
      endDate: searchDate.endDate,
      purpose: "",
      destination: "",
    })
    setError("")
    setSuccess("")
    setShowBookingForm(true)
  }

  const closeBookingForm = () => {
    setShowBookingForm(false)
    setSelectedVehicle(null)
    setBookingData(INITIAL_BOOKING_DATA)
  }

  const submitBooking = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      setLoading(true)
      setError("")

      await api.post("/api/booking", bookingData)
      setSuccess("ส่งคำขอจองรถสำเร็จ รอการอนุมัติจากผู้อนุมัติ")
      closeBookingForm()
      await searchVehicles(false)
    } catch (error: unknown) {
      setError(getErrorMessage(error, "ไม่สามารถจองรถได้"))
    } finally {
      setLoading(false)
    }
  }

  const minEndDateTime = (() => {
    if (!searchDate.startDate) return ""
    const startDateTime = new Date(searchDate.startDate)
    startDateTime.setHours(startDateTime.getHours() + 1)
    return getLocalDateTimeInputValue(startDateTime)
  })()

  const canSearch = Boolean(searchDate.startDate && searchDate.endDate)
  const hasSearched = Boolean(searchDate.startDate && searchDate.endDate)

  useEffect(() => {
    fetchVehicleTypes()
  }, [fetchVehicleTypes])

  useEffect(() => {
    if (!showBookingForm) return

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeBookingForm()
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [showBookingForm])

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <header className="mb-6 rounded-xl bg-white p-6 shadow-sm ring-1 ring-gray-200">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="mb-2 text-sm font-medium text-blue-700">
                ผู้ใช้งาน
              </p>
              <h1 className="text-2xl font-bold leading-tight text-gray-950">
                จองรถ
              </h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-600">
                เลือกช่วงเวลาและประเภทรถ ระบบจะแสดงรถที่ว่างและแนะนำรถที่เหมาะสมจากเลขไมล์และประวัติซ่อม
              </p>
            </div>

            <div className="rounded-lg bg-blue-50 px-4 py-3 ring-1 ring-blue-100">
              <div className="flex items-start gap-3">
                <ShieldCheck
                  className="mt-0.5 h-5 w-5 text-blue-700"
                  aria-hidden="true"
                />
                <div>
                  <p className="text-sm font-medium text-blue-900">
                    สถานะหลังส่งคำขอ
                  </p>
                  <p className="mt-1 text-sm text-blue-800">
                    คำขอจะเข้าสถานะรออนุมัติทันที
                  </p>
                </div>
              </div>
            </div>
          </div>
        </header>

        {success && (
          <div
            role="status"
            className="mb-4 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800"
          >
            {success}
          </div>
        )}

        {error && (
          <div
            role="alert"
            aria-live="polite"
            className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"
          >
            {error}
          </div>
        )}

        <section
          className="mb-6 rounded-xl bg-white p-6 shadow-sm ring-1 ring-gray-200"
          aria-labelledby="vehicle-search-title"
        >
          <div className="mb-4 flex items-center gap-2">
            <Search className="h-5 w-5 text-blue-700" aria-hidden="true" />
            <h2
              id="vehicle-search-title"
              className="text-lg font-semibold text-gray-950"
            >
              ค้นหารถที่ว่าง
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
            <div>
              <label
                htmlFor="vehicle-type"
                className="mb-1.5 block text-sm font-medium text-gray-700"
              >
                ประเภทรถ
              </label>
              <select
                id="vehicle-type"
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="min-h-11 w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-gray-950 transition-colors duration-150 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600/25"
              >
                <option value="">ทุกประเภท</option>
                {vehicleTypes.map((type) => (
                  <option key={type.id} value={type.id}>
                    {type.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="booking-start-date"
                className="mb-1.5 block text-sm font-medium text-gray-700"
              >
                วันเวลาเริ่ม
              </label>
              <input
                id="booking-start-date"
                type="datetime-local"
                value={searchDate.startDate}
                onChange={(e) =>
                  setSearchDate((current) => ({
                    ...current,
                    startDate: e.target.value,
                    endDate:
                      current.endDate && current.endDate <= e.target.value
                        ? ""
                        : current.endDate,
                  }))
                }
                min={getLocalDateTimeInputValue()}
                className="min-h-11 w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-gray-950 transition-colors duration-150 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600/25"
              />
            </div>

            <div>
              <label
                htmlFor="booking-end-date"
                className="mb-1.5 block text-sm font-medium text-gray-700"
              >
                วันเวลาสิ้นสุด
              </label>
              <input
                id="booking-end-date"
                type="datetime-local"
                value={searchDate.endDate}
                onChange={(e) =>
                  setSearchDate((current) => ({
                    ...current,
                    endDate: e.target.value,
                  }))
                }
                min={minEndDateTime}
                disabled={!searchDate.startDate}
                className="min-h-11 w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-gray-950 transition-colors duration-150 disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-500 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600/25"
              />
            </div>

            <div className="flex items-end">
              <button
                type="button"
                onClick={() => searchVehicles()}
                disabled={loading || !canSearch}
                className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors duration-150 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-600/25 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <Search className="h-4 w-4" aria-hidden="true" />
                {loading ? "กำลังค้นหา..." : "ค้นหา"}
              </button>
            </div>
          </div>
        </section>

        {vehicles.length > 0 && (
          <section aria-labelledby="available-vehicles-title">
            <div className="mb-4 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h2
                  id="available-vehicles-title"
                  className="text-lg font-semibold text-gray-950"
                >
                  รถที่ว่าง
                </h2>
                <p className="mt-1 text-sm text-gray-600">
                  พบรถที่จองได้ {vehicles.length} คัน
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
              {vehicles.map((vehicle) => (
                <article
                  key={vehicle.id}
                  className={`rounded-xl bg-white p-5 shadow-sm ring-1 ring-gray-200 transition-colors duration-150 hover:bg-gray-50 ${
                    vehicle.recommended ? "ring-2 ring-green-600" : ""
                  }`}
                >
                  <div className="mb-4 flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h3 className="truncate text-lg font-semibold text-gray-950">
                        {vehicle.plateNumber}
                      </h3>
                      <p className="mt-1 text-sm text-gray-600">
                        {vehicle.type.name}
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <span className="inline-flex rounded-full bg-green-100 px-2.5 py-1 text-xs font-semibold text-green-800">
                        ว่าง
                      </span>
                      {vehicle.recommended && (
                        <span className="inline-flex rounded-full bg-blue-100 px-2.5 py-1 text-xs font-semibold text-blue-800">
                          แนะนำ
                        </span>
                      )}
                    </div>
                  </div>

                  <dl className="grid grid-cols-2 gap-3 text-sm">
                    <div className="rounded-lg bg-gray-50 p-3 ring-1 ring-gray-200">
                      <dt className="flex items-center gap-1.5 font-medium text-gray-600">
                        <Gauge className="h-4 w-4" aria-hidden="true" />
                        เลขไมล์
                      </dt>
                      <dd className="mt-1 font-semibold text-gray-950">
                        {vehicle.currentMileage.toLocaleString()} km
                      </dd>
                    </div>
                    <div className="rounded-lg bg-gray-50 p-3 ring-1 ring-gray-200">
                      <dt className="flex items-center gap-1.5 font-medium text-gray-600">
                        <Wrench className="h-4 w-4" aria-hidden="true" />
                        ประวัติซ่อม
                      </dt>
                      <dd className="mt-1 font-semibold text-gray-950">
                        {vehicle.maintenanceCount} ครั้ง
                      </dd>
                    </div>
                  </dl>

                  <button
                    type="button"
                    onClick={() => openBookingForm(vehicle)}
                    className={`mt-5 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-white transition-colors duration-150 focus:outline-none focus:ring-2 ${
                      vehicle.recommended
                        ? "bg-green-600 hover:bg-green-700 focus:ring-green-600/25"
                        : "bg-blue-600 hover:bg-blue-700 focus:ring-blue-600/25"
                    }`}
                  >
                    <Car className="h-4 w-4" aria-hidden="true" />
                    {vehicle.recommended ? "จองรถคันนี้ (แนะนำ)" : "จองรถคันนี้"}
                  </button>
                </article>
              ))}
            </div>
          </section>
        )}

        {vehicles.length === 0 && hasSearched && !loading && (
          <section className="rounded-xl bg-white px-6 py-12 text-center shadow-sm ring-1 ring-gray-200">
            <Car className="mx-auto h-10 w-10 text-gray-400" aria-hidden="true" />
            <h2 className="mt-4 text-lg font-semibold text-gray-950">
              ไม่พบรถที่ว่างในช่วงเวลาที่เลือก
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              กรุณาเลือกช่วงเวลาอื่น หรือเปลี่ยนประเภทรถแล้วค้นหาอีกครั้ง
            </p>
          </section>
        )}

        {showBookingForm && selectedVehicle && (
          <div
            className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-gray-900/50 px-4 py-8"
            role="dialog"
            aria-modal="true"
            aria-labelledby="booking-modal-title"
          >
            <div className="w-full max-w-lg rounded-xl bg-white shadow-lg ring-1 ring-gray-200">
              <div className="flex items-start justify-between gap-4 border-b border-gray-200 px-6 py-5">
                <div>
                  <h3
                    id="booking-modal-title"
                    className="text-lg font-semibold text-gray-950"
                  >
                    ยืนยันคำขอจองรถ
                  </h3>
                  <p className="mt-1 text-sm text-gray-600">
                    ตรวจสอบข้อมูลและระบุวัตถุประสงค์ก่อนส่งคำขอ
                  </p>
                </div>
                <button
                  type="button"
                  onClick={closeBookingForm}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-md text-gray-500 transition-colors duration-150 hover:bg-gray-100 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-600/25"
                  aria-label="ปิดหน้าต่าง"
                >
                  <X className="h-5 w-5" aria-hidden="true" />
                </button>
              </div>

              <form onSubmit={submitBooking} className="space-y-5 px-6 py-6">
                <div className="rounded-lg bg-gray-50 p-4 ring-1 ring-gray-200">
                  <dl className="grid gap-3 text-sm sm:grid-cols-2">
                    <div>
                      <dt className="font-medium text-gray-600">รถที่เลือก</dt>
                      <dd className="mt-1 text-gray-950">
                        {selectedVehicle.plateNumber}
                      </dd>
                    </div>
                    <div>
                      <dt className="font-medium text-gray-600">ประเภทรถ</dt>
                      <dd className="mt-1 text-gray-950">
                        {selectedVehicle.type.name}
                      </dd>
                    </div>
                    <div>
                      <dt className="font-medium text-gray-600">เลขไมล์</dt>
                      <dd className="mt-1 text-gray-950">
                        {selectedVehicle.currentMileage.toLocaleString()} km
                      </dd>
                    </div>
                    <div>
                      <dt className="font-medium text-gray-600">สถานะ</dt>
                      <dd className="mt-1">
                        <span className="inline-flex rounded-full bg-green-100 px-2.5 py-1 text-xs font-semibold text-green-800">
                          {selectedVehicle.recommended ? "แนะนำ" : "ว่าง"}
                        </span>
                      </dd>
                    </div>
                    <div className="sm:col-span-2">
                      <dt className="font-medium text-gray-600">ช่วงเวลา</dt>
                      <dd className="mt-1 text-gray-950">
                        {formatDateTime(searchDate.startDate)} -{" "}
                        {formatDateTime(searchDate.endDate)}
                      </dd>
                    </div>
                  </dl>
                </div>

                <div>
                  <label
                    htmlFor="booking-purpose"
                    className="mb-1.5 block text-sm font-medium text-gray-700"
                  >
                    วัตถุประสงค์ <span className="text-red-700">*</span>
                  </label>
                  <input
                    id="booking-purpose"
                    type="text"
                    required
                    value={bookingData.purpose}
                    onChange={(e) =>
                      setBookingData((current) => ({
                        ...current,
                        purpose: e.target.value,
                      }))
                    }
                    className="min-h-11 w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-gray-950 transition-colors duration-150 placeholder:text-gray-500 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600/25"
                    placeholder="เช่น ประชุมลูกค้า, ไปส่งเอกสาร"
                  />
                </div>

                <div>
                  <label
                    htmlFor="booking-destination"
                    className="mb-1.5 block text-sm font-medium text-gray-700"
                  >
                    ปลายทาง (ไม่บังคับ)
                  </label>
                  <input
                    id="booking-destination"
                    type="text"
                    value={bookingData.destination}
                    onChange={(e) =>
                      setBookingData((current) => ({
                        ...current,
                        destination: e.target.value,
                      }))
                    }
                    className="min-h-11 w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-gray-950 transition-colors duration-150 placeholder:text-gray-500 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600/25"
                    placeholder="เช่น สำนักงานเขต, สถานีไฟฟ้า"
                  />
                </div>

                <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                  <button
                    type="button"
                    onClick={closeBookingForm}
                    className="inline-flex min-h-11 items-center justify-center rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 transition-colors duration-150 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-600/25"
                  >
                    ยกเลิก
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors duration-150 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-600/25 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
                    {loading ? "กำลังส่งคำขอ..." : "ยืนยันการจอง"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </main>
  )
}
