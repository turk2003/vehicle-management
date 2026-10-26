"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { Car } from "lucide-react"
import { useToast } from "@/app/component/toast-provider"
import api from "@/lib/api"
import { usePermissions } from "@/lib/use-permissions"
import type * as React from "react"
import type { Booking, BookingStats, EditForm, ModalType } from "./types"
import { INITIAL_STATS, INITIAL_EDIT_FORM } from "./constants"
import { getErrorMessage, toLocalDateTimeInputValue, getLocalDateTimeInputValue, buildStats } from "./utils"
import MileageModal from "./_components/MileageModal"
import BookingStatusFilters from "./_components/BookingStatusFilters"
import BookingList from "./_components/BookingList"
import BookingDetailModal from "./_components/BookingDetailModal"
import BookingEditModal from "./_components/BookingEditModal"

export default function MyBookingsPage() {
  const toast = useToast()
  const { hasPermission } = usePermissions()
  const canManageOwnBookings = hasPermission("BOOKING_CREATE")
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [selectedStatus, setSelectedStatus] = useState("ALL")
  const [activeModal, setActiveModal] = useState<ModalType>(null)
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null)
  const [editForm, setEditForm] = useState<EditForm>(INITIAL_EDIT_FORM)
  const [mileageInput, setMileageInput] = useState("")
  const [stats, setStats] = useState<BookingStats>(INITIAL_STATS)

  const closeModal = useCallback(() => {
    setActiveModal(null)
    setSelectedBooking(null)
    setMileageInput("")
    setEditForm(INITIAL_EDIT_FORM)
  }, [])

  const fetchBookings = useCallback(async () => {
    try {
      setLoading(true)
      setError("")
      const response = await api.get<Booking[]>("/api/booking?action=my-bookings")
      setBookings(response.data)
      setStats(buildStats(response.data))
    } catch {
      setError("ไม่สามารถโหลดข้อมูลการจองได้")
    } finally {
      setLoading(false)
    }
  }, [])

  const cancelBooking = async (booking: Booking) => {
    const confirmed = confirm(
      `ต้องการยกเลิกการจองรถ "${booking.vehicle.plateNumber}" ใช่หรือไม่?`,
    )
    if (!confirmed) return

    try {
      setLoading(true)
      setError("")
      await api.put("/api/booking", { id: booking.id, status: "CANCELLED" })
      toast.success("ยกเลิกการจองเรียบร้อยแล้ว")
      await fetchBookings()
    } catch (error: unknown) {
      toast.error(getErrorMessage(error, "ไม่สามารถยกเลิกการจองได้"))
    } finally {
      setLoading(false)
    }
  }

  const openDetailModal = (booking: Booking) => {
    setSelectedBooking(booking)
    setActiveModal("detail")
  }

  const openEditModal = (booking: Booking) => {
    setSelectedBooking(booking)
    setEditForm({
      id: booking.id,
      startDate: toLocalDateTimeInputValue(booking.startDate),
      endDate: toLocalDateTimeInputValue(booking.endDate),
      purpose: booking.purpose,
      destination: booking.destination || "",
    })
    setError("")
    setActiveModal("edit")
  }

  const openMileageModal = (booking: Booking, modal: "pickup" | "return") => {
    setSelectedBooking(booking)
    setMileageInput("")
    setError("")
    setActiveModal(modal)
  }

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      setLoading(true)
      setError("")
      await api.patch("/api/booking", editForm)
      toast.success("บันทึกการแก้ไขการจองเรียบร้อยแล้ว")
      closeModal()
      await fetchBookings()
    } catch (error: unknown) {
      toast.error(getErrorMessage(error, "ไม่สามารถแก้ไขการจองได้"))
    } finally {
      setLoading(false)
    }
  }

  const handlePickup = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedBooking) return

    try {
      setLoading(true)
      setError("")
      await api.put("/api/booking/pickup", {
        bookingId: selectedBooking.id,
        mileageStart: Number(mileageInput),
      })
      toast.success("บันทึกการรับรถเรียบร้อยแล้ว")
      closeModal()
      await fetchBookings()
    } catch (error: unknown) {
      toast.error(getErrorMessage(error, "ไม่สามารถรับรถได้"))
    } finally {
      setLoading(false)
    }
  }

  const handleReturn = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedBooking) return

    try {
      setLoading(true)
      setError("")
      await api.put("/api/booking/return", {
        bookingId: selectedBooking.id,
        mileageEnd: Number(mileageInput),
      })
      toast.success("บันทึกการคืนรถเรียบร้อยแล้ว")
      closeModal()
      await fetchBookings()
    } catch (error: unknown) {
      toast.error(getErrorMessage(error, "ไม่สามารถคืนรถได้"))
    } finally {
      setLoading(false)
    }
  }

  const filteredBookings = useMemo(() => {
    if (selectedStatus === "ALL") return bookings
    return bookings.filter((booking) => booking.status === selectedStatus)
  }, [bookings, selectedStatus])

  const minEditEndDateTime = useMemo(() => {
    if (!editForm.startDate) return ""
    const start = new Date(editForm.startDate)
    start.setHours(start.getHours() + 1)
    return getLocalDateTimeInputValue(start)
  }, [editForm.startDate])

  useEffect(() => {
    fetchBookings()
  }, [fetchBookings])

  useEffect(() => {
    if (!activeModal) return

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeModal()
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [activeModal, closeModal])

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
                การจองของฉัน
              </h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-600">
                ตรวจสอบสถานะ แก้ไขคำขอที่รออนุมัติ และบันทึกการรับหรือคืนรถเมื่อถึงเวลาใช้งาน
              </p>
            </div>

            <div className="rounded-lg bg-blue-50 px-4 py-3 ring-1 ring-blue-100">
              <div className="flex items-start gap-3">
                <Car
                  className="mt-0.5 h-5 w-5 text-blue-700"
                  aria-hidden="true"
                />
                <div>
                  <p className="text-sm font-medium text-blue-900">
                    รายการทั้งหมด
                  </p>
                  <p className="mt-1 text-sm text-blue-800">
                    {stats.total} รายการในบัญชีของคุณ
                  </p>
                </div>
              </div>
            </div>
          </div>
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

        <BookingStatusFilters
          stats={stats}
          selectedStatus={selectedStatus}
          setSelectedStatus={setSelectedStatus}
        />

        <BookingList
          filteredBookings={filteredBookings}
          loading={loading}
          bookings={bookings}
          openDetailModal={openDetailModal}
          canManageOwnBookings={canManageOwnBookings}
          openEditModal={openEditModal}
          cancelBooking={cancelBooking}
          openMileageModal={openMileageModal}
        />

        {activeModal === "detail" && selectedBooking && (
          <BookingDetailModal
            closeModal={closeModal}
            selectedBooking={selectedBooking}
          />
        )}

        {activeModal === "edit" && selectedBooking && (
          <BookingEditModal
            closeModal={closeModal}
            handleEditSubmit={handleEditSubmit}
            editForm={editForm}
            setEditForm={setEditForm}
            minEditEndDateTime={minEditEndDateTime}
            loading={loading}
          />
        )}

        {activeModal === "pickup" && selectedBooking && (
          <MileageModal
            id="booking-pickup-title"
            title={`รับรถ: ${selectedBooking.vehicle.plateNumber}`}
            description="ระบุเลขไมล์เริ่มต้นก่อนเปลี่ยนสถานะเป็นกำลังใช้งาน"
            label="เลขไมล์เริ่มต้น (km)"
            value={mileageInput}
            min={0}
            loading={loading}
            loadingLabel="กำลังบันทึก..."
            submitLabel="ยืนยันการรับรถ"
            tone="indigo"
            onChange={setMileageInput}
            onClose={closeModal}
            onSubmit={handlePickup}
          />
        )}

        {activeModal === "return" && selectedBooking && (
          <MileageModal
            id="booking-return-title"
            title={`คืนรถ: ${selectedBooking.vehicle.plateNumber}`}
            description={`เลขไมล์เริ่มต้น: ${(selectedBooking.mileageStart || 0).toLocaleString()} km`}
            label="เลขไมล์สิ้นสุด (km)"
            value={mileageInput}
            min={selectedBooking.mileageStart || 0}
            loading={loading}
            loadingLabel="กำลังบันทึก..."
            submitLabel="ยืนยันการคืนรถ"
            tone="teal"
            onChange={setMileageInput}
            onClose={closeModal}
            onSubmit={handleReturn}
          />
        )}
      </div>
    </main>
  )
}
