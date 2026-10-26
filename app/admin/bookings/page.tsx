"use client"

import { useCallback, useEffect, useState } from "react"
import axios from "axios"
import { useToast } from "@/app/component/toast-provider"
import api from "@/lib/api"
import { usePermissions } from "@/lib/use-permissions"
import { getBookingStatusText } from "@/lib/format"
import BookingStatsPanel from "./_components/BookingStats"
import BookingFiltersPanel from "./_components/BookingFilters"
import BookingTable from "./_components/BookingTable"
import BookingStatusModal from "./_components/BookingStatusModal"
import BookingMileageModal from "./_components/BookingMileageModal"
import ChangeVehicleModal from "./_components/ChangeVehicleModal"
import { INITIAL_FILTERS, INITIAL_STATS, STATUS_UPDATE_OPTIONS } from "./constants"
import type {
  Booking,
  BookingFilters,
  BookingStats,
  MileageAction,
  ReplacementVehicle,
  User,
  Vehicle,
} from "./types"

function getErrorMessage(error: unknown, fallback: string) {
  if (axios.isAxiosError<{ message?: string }>(error)) {
    return error.response?.data?.message || fallback
  }

  return fallback
}

function buildStats(bookings: Booking[]): BookingStats {
  return bookings.reduce<BookingStats>((acc, booking) => {
    acc.total += 1
    const key = booking.status.toLowerCase() as keyof BookingStats

    if (key in acc && key !== "total") {
      acc[key] += 1
    }

    return acc
  }, { ...INITIAL_STATS })
}

export default function AdminBookingsPage() {
  const toast = useToast()
  const { hasPermission } = usePermissions()
  const canManageBookings = hasPermission("BOOKING_MANAGE")
  const canDeleteBookings = hasPermission("BOOKING_DELETE")
  const [bookings, setBookings] = useState<Booking[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [filters, setFilters] = useState<BookingFilters>(INITIAL_FILTERS)
  const [showModal, setShowModal] = useState(false)
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null)
  const [newStatus, setNewStatus] = useState("")
  const [stats, setStats] = useState<BookingStats>(INITIAL_STATS)
  const [showChangeModal, setShowChangeModal] = useState(false)
  const [replacementVehicles, setReplacementVehicles] = useState<
    ReplacementVehicle[]
  >([])
  const [selectedReplacementId, setSelectedReplacementId] = useState("")
  const [changeReason, setChangeReason] = useState("")
  const [changeLoading, setChangeLoading] = useState(false)
  const [changeError, setChangeError] = useState("")
  const [mileageAction, setMileageAction] = useState<MileageAction | null>(null)
  const [mileageValue, setMileageValue] = useState("")
  const [mileageLoading, setMileageLoading] = useState(false)
  const [mileageError, setMileageError] = useState("")

  const fetchData = useCallback(async () => {
    try {
      setLoading(true)
      setError("")
      const params = new URLSearchParams()
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value)
      })

      const [bookingsRes, usersRes, vehiclesRes] = await Promise.all([
        api.get<Booking[]>(`/api/admin/bookings?${params.toString()}`),
        api.get<User[]>("/api/user"),
        api.get<Vehicle[]>("/api/verhicle"),
      ])

      setBookings(bookingsRes.data)
      setUsers(usersRes.data)
      setVehicles(vehiclesRes.data)
      setStats(buildStats(bookingsRes.data))
    } catch (error) {
      setError(getErrorMessage(error, "ไม่สามารถโหลดข้อมูลการจองได้"))
    } finally {
      setLoading(false)
    }
  }, [filters])

  const updateBookingStatus = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedBooking || !newStatus) return

    try {
      setLoading(true)
      setError("")
      await api.put("/api/admin/bookings", {
        id: selectedBooking.id,
        status: newStatus,
      })
      toast.success(`อัพเดทสถานะเป็น ${getBookingStatusText(newStatus)} แล้ว`)
      closeStatusModal()
      await fetchData()
    } catch (error) {
      toast.error(getErrorMessage(error, "ไม่สามารถอัพเดทสถานะได้"))
    } finally {
      setLoading(false)
    }
  }

  const deleteBooking = async (booking: Booking) => {
    const confirmed = confirm(
      `ต้องการลบการจองของ "${booking.user.name}" ใช่หรือไม่?`,
    )
    if (!confirmed) return

    try {
      setLoading(true)
      setError("")
      await api.delete(`/api/admin/bookings?id=${booking.id}`)
      toast.success("ลบการจองเรียบร้อยแล้ว")
      await fetchData()
    } catch (error) {
      toast.error(getErrorMessage(error, "ไม่สามารถลบการจองได้"))
    } finally {
      setLoading(false)
    }
  }

  const handleFilterChange = (key: keyof BookingFilters, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }))
  }

  const openStatusModal = (booking: Booking) => {
    setSelectedBooking(booking)
    setNewStatus(
      STATUS_UPDATE_OPTIONS.some((option) => option.value === booking.status)
        ? booking.status
        : "CANCELLED",
    )
    setShowModal(true)
  }

  const closeStatusModal = () => {
    setShowModal(false)
    setSelectedBooking(null)
    setNewStatus("")
  }

  const openChangeVehicleModal = async (booking: Booking) => {
    setSelectedBooking(booking)
    setShowChangeModal(true)
    setReplacementVehicles([])
    setSelectedReplacementId("")
    setChangeReason("")
    setChangeError("")
    setChangeLoading(true)

    try {
      const response = await api.get<{
        candidates: ReplacementVehicle[]
      }>(
        `/api/admin/bookings/change-vehicle?bookingId=${encodeURIComponent(booking.id)}`,
      )
      setReplacementVehicles(response.data.candidates)
      const recommended = response.data.candidates.find(
        (vehicle) => vehicle.recommended,
      )
      setSelectedReplacementId(recommended?.id || "")
    } catch (error) {
      setChangeError(
        getErrorMessage(error, "ไม่สามารถโหลดรายการรถทดแทนได้"),
      )
    } finally {
      setChangeLoading(false)
    }
  }

  const closeChangeVehicleModal = () => {
    setShowChangeModal(false)
    setSelectedBooking(null)
    setReplacementVehicles([])
    setSelectedReplacementId("")
    setChangeReason("")
    setChangeError("")
  }

  const openMileageModal = (booking: Booking, action: MileageAction) => {
    const initialMileage =
      action === "pickup"
        ? booking.vehicle.currentMileage
        : booking.mileageStart ?? booking.vehicle.currentMileage

    setSelectedBooking(booking)
    setMileageAction(action)
    setMileageValue(String(initialMileage))
    setMileageError("")
  }

  const closeMileageModal = () => {
    setMileageAction(null)
    setSelectedBooking(null)
    setMileageValue("")
    setMileageError("")
  }

  const submitMileage = async (event: React.FormEvent) => {
    event.preventDefault()
    if (!selectedBooking || !mileageAction) return

    const mileage = Number(mileageValue)
    if (!Number.isInteger(mileage) || mileage < 0) {
      setMileageError("เลขไมล์ต้องเป็นจำนวนเต็มตั้งแต่ 0 ขึ้นไป")
      return
    }

    try {
      setMileageLoading(true)
      setMileageError("")
      setError("")

      const endpoint =
        mileageAction === "pickup"
          ? "/api/admin/bookings/pickup"
          : "/api/admin/bookings/return"
      const mileageField =
        mileageAction === "pickup" ? "mileageStart" : "mileageEnd"

      await api.put(endpoint, {
        bookingId: selectedBooking.id,
        [mileageField]: mileage,
      })

      toast.success(
        mileageAction === "pickup"
          ? `บันทึกรับรถ ${selectedBooking.vehicle.plateNumber} เรียบร้อยแล้ว`
          : `บันทึกคืนรถ ${selectedBooking.vehicle.plateNumber} เรียบร้อยแล้ว`,
      )
      closeMileageModal()
      await fetchData()
    } catch (error) {
      toast.error(
        getErrorMessage(
          error,
          mileageAction === "pickup"
            ? "ไม่สามารถบันทึกรับรถได้"
            : "ไม่สามารถบันทึกคืนรถได้",
        ),
      )
    } finally {
      setMileageLoading(false)
    }
  }

  const changeVehicle = async (event: React.FormEvent) => {
    event.preventDefault()
    if (!selectedBooking || !selectedReplacementId || !changeReason.trim()) {
      setChangeError("กรุณาเลือกรถทดแทนและระบุเหตุผล")
      return
    }

    try {
      setChangeLoading(true)
      setChangeError("")
      setError("")
      const response = await api.put<{
        booking: Booking
        previousVehiclePlate: string
        newVehiclePlate: string
      }>("/api/admin/bookings/change-vehicle", {
        bookingId: selectedBooking.id,
        newVehicleId: selectedReplacementId,
        reason: changeReason.trim(),
      })
      toast.success(
        `เปลี่ยนรถจาก ${response.data.previousVehiclePlate} เป็น ${response.data.newVehiclePlate} และแจ้งผู้จองแล้ว`,
      )
      closeChangeVehicleModal()
      await fetchData()
    } catch (error) {
      toast.error(getErrorMessage(error, "ไม่สามารถเปลี่ยนรถได้"))
    } finally {
      setChangeLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [fetchData])

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <header className="mb-6 rounded-xl bg-white p-6 shadow-sm ring-1 ring-gray-200">
          <div>
            <p className="mb-2 text-sm font-medium text-blue-700">
              ผู้ดูแลระบบ
            </p>
            <h1 className="text-2xl font-bold leading-tight text-gray-950">
              จัดการการจอง
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-600">
              ตรวจสอบคำขอจองรถ กรองข้อมูลตามสถานะ ผู้จอง รถ และช่วงวันที่
            </p>
          </div>

          <BookingStatsPanel stats={stats} />
        </header>
        {error && (
          <div
            role="alert"
            aria-live="polite"
            className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"
          >
            {error}
          </div>
        )}

        <BookingFiltersPanel
          filters={filters}
          users={users}
          vehicles={vehicles}
          onChange={handleFilterChange}
          onReset={() => setFilters(INITIAL_FILTERS)}
        />

        <BookingTable
          bookings={bookings}
          loading={loading}
          canManageBookings={canManageBookings}
          canDeleteBookings={canDeleteBookings}
          onChangeVehicle={openChangeVehicleModal}
          onMileageAction={openMileageModal}
          onEditStatus={openStatusModal}
          onDelete={deleteBooking}
        />

        {showModal && selectedBooking && (
          <BookingStatusModal
            booking={selectedBooking}
            status={newStatus}
            loading={loading}
            onStatusChange={setNewStatus}
            onClose={closeStatusModal}
            onSubmit={updateBookingStatus}
          />
        )}

        {mileageAction && selectedBooking && (
          <BookingMileageModal
            booking={selectedBooking}
            action={mileageAction}
            value={mileageValue}
            loading={mileageLoading}
            error={mileageError}
            onValueChange={setMileageValue}
            onClose={closeMileageModal}
            onSubmit={submitMileage}
          />
        )}

        {showChangeModal && selectedBooking && (
          <ChangeVehicleModal
            booking={selectedBooking}
            candidates={replacementVehicles}
            selectedVehicleId={selectedReplacementId}
            reason={changeReason}
            loading={changeLoading}
            error={changeError}
            onVehicleChange={setSelectedReplacementId}
            onReasonChange={setChangeReason}
            onClose={closeChangeVehicleModal}
            onSubmit={changeVehicle}
          />
        )}
      </div>
    </main>
  )
}
