"use client"

import { useCallback, useEffect, useState } from "react"
import { ShieldCheck } from "lucide-react"
import api from "@/lib/api"
import type * as React from "react"
import type { Vehicle, VehicleType, BookingData, SearchDate } from "./types"
import { INITIAL_BOOKING_DATA, INITIAL_SEARCH_DATE } from "./constants"
import { getErrorMessage, getLocalDateTimeInputValue } from "./utils"
import VehicleSearchFilters from "./_components/VehicleSearchFilters"
import VehicleSearchResults from "./_components/VehicleSearchResults"
import VehicleSearchPlaceholder from "./_components/VehicleSearchPlaceholder"
import BookingFormModal from "./_components/BookingFormModal"

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

        <VehicleSearchFilters
          selectedType={selectedType}
          setSelectedType={setSelectedType}
          vehicleTypes={vehicleTypes}
          searchDate={searchDate}
          setSearchDate={setSearchDate}
          minEndDateTime={minEndDateTime}
          searchVehicles={searchVehicles}
          loading={loading}
          canSearch={canSearch}
        />

        {vehicles.length > 0 && (
          <VehicleSearchResults
            vehicles={vehicles}
            openBookingForm={openBookingForm}
          />
        )}

        {vehicles.length === 0 && hasSearched && !loading && (
          <VehicleSearchPlaceholder />
        )}

        {showBookingForm && selectedVehicle && (
          <BookingFormModal
            closeBookingForm={closeBookingForm}
            submitBooking={submitBooking}
            selectedVehicle={selectedVehicle}
            searchDate={searchDate}
            bookingData={bookingData}
            setBookingData={setBookingData}
            loading={loading}
          />
        )}
      </div>
    </main>
  )
}
