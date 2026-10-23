"use client"

import { useCallback, useEffect, useState } from "react"
import api from "@/lib/api"
import type { Booking, BookingStats, DateFilter } from "./types"
import { INITIAL_DATE_FILTER, INITIAL_STATS } from "./constants"
import { buildStats, filterByDate } from "./utils"
import HistoryHeader from "./_components/HistoryHeader"
import HistoryStats from "./_components/HistoryStats"
import HistoryFilters from "./_components/HistoryFilters"
import HistoryTable from "./_components/HistoryTable"
import BookingDetailModal from "./_components/BookingDetailModal"

export default function ApprovalHistoryPage() {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [selectedStatus, setSelectedStatus] = useState("ALL")
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null)
  const [dateFilter, setDateFilter] =
    useState<DateFilter>(INITIAL_DATE_FILTER)
  const [stats, setStats] = useState<BookingStats>(INITIAL_STATS)

  const fetchHistory = useCallback(async () => {
    try {
      setLoading(true)
      setError("")

      const response = await api.get<Booking[]>("/api/approver?status=ALL")
      const decidedBookings = response.data.filter(
        (booking) =>
          booking.status === "APPROVED" ||
          booking.status === "CHANGED" ||
          booking.status === "REJECTED",
      )
      const dateFilteredBookings = filterByDate(decidedBookings, dateFilter)
      const statusFilteredBookings =
        selectedStatus === "ALL"
          ? dateFilteredBookings
          : dateFilteredBookings.filter(
              (booking) => booking.status === selectedStatus,
            )

      setStats(buildStats(dateFilteredBookings))
      setBookings(statusFilteredBookings)
    } catch {
      setError("ไม่สามารถโหลดข้อมูลประวัติการอนุมัติได้")
    } finally {
      setLoading(false)
    }
  }, [dateFilter, selectedStatus])

  const viewDetails = (booking: Booking) => {
    setSelectedBooking(booking)
    setShowDetailModal(true)
  }

  const closeDetailModal = () => {
    setShowDetailModal(false)
    setSelectedBooking(null)
  }

  useEffect(() => {
    fetchHistory()
  }, [fetchHistory])

  useEffect(() => {
    if (!showDetailModal) return

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeDetailModal()
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [showDetailModal])

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <HistoryHeader
          selectedStatus={selectedStatus}
          setSelectedStatus={setSelectedStatus}
        />

        {error && (
          <div
            role="alert"
            aria-live="polite"
            className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"
          >
            {error}
          </div>
        )}

        <HistoryStats
          stats={stats}
          selectedStatus={selectedStatus}
          setSelectedStatus={setSelectedStatus}
        />

        <HistoryFilters
          dateFilter={dateFilter}
          setDateFilter={setDateFilter}
        />

        <HistoryTable
          bookings={bookings}
          loading={loading}
          viewDetails={viewDetails}
        />

        {showDetailModal && selectedBooking && (
          <BookingDetailModal
            closeDetailModal={closeDetailModal}
            selectedBooking={selectedBooking}
          />
        )}
      </div>
    </main>
  )
}
