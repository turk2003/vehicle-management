"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import type { AxiosError } from "axios"
import api from "@/lib/api"
import type * as React from "react"
import type { Booking } from "./types"
import ApprovalHeader from "./_components/ApprovalHeader"
import ApprovalTable from "./_components/ApprovalTable"
import ApprovalModal from "./_components/ApprovalModal"

export default function ApproverBookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedStatus, setSelectedStatus] = useState("PENDING")
  const [showModal, setShowModal] = useState(false)
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null)
  const [actionType, setActionType] = useState<"APPROVED" | "REJECTED">(
    "APPROVED",
  )
  const [comment, setComment] = useState("")
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const submittingRef = useRef(false)

  const fetchBookings = useCallback(async () => {
    try {
      setLoading(true)
      setError("")
      const response = await api.get(`/api/approver?status=${selectedStatus}`)
      setBookings(response.data)
    } catch {
      setError("ไม่สามารถโหลดข้อมูลได้")
    } finally {
      setLoading(false)
    }
  }, [selectedStatus])

  const openApprovalModal = (
    booking: Booking,
    action: "APPROVED" | "REJECTED",
  ) => {
    setSelectedBooking(booking)
    setActionType(action)
    setComment("")
    setError("")
    setSuccess("")
    setShowModal(true)
  }

  const closeApprovalModal = () => {
    setShowModal(false)
    setSelectedBooking(null)
    setComment("")
  }

  const submitApproval = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedBooking || submittingRef.current) return

    try {
      submittingRef.current = true
      setLoading(true)
      setError("")

      await api.put("/api/approver", {
        id: selectedBooking.id,
        action: actionType,
        comment,
      })

      setSuccess(
        `การจองได้รับการ${actionType === "APPROVED" ? "อนุมัติ" : "ปฏิเสธ"}แล้ว`,
      )
      closeApprovalModal()
      await fetchBookings()
    } catch (error: unknown) {
      const axiosError = error as AxiosError<{ message?: string }>
      setError(axiosError.response?.data?.message || "เกิดข้อผิดพลาด")
    } finally {
      submittingRef.current = false
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchBookings()
  }, [fetchBookings])

  useEffect(() => {
    if (!showModal) return

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeApprovalModal()
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [showModal])

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <ApprovalHeader
          selectedStatus={selectedStatus}
          setSelectedStatus={setSelectedStatus}
        />

        {/* Success Message */}
        {success && (
          <div
            role="status"
            className="mb-4 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800"
          >
            {success}
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div
            role="alert"
            aria-live="polite"
            className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"
          >
            {error}
          </div>
        )}

        {/* Bookings Table */}
        <ApprovalTable
          selectedStatus={selectedStatus}
          bookings={bookings}
          loading={loading}
          openApprovalModal={openApprovalModal}
        />

        {/* Approval Modal */}
        {showModal && selectedBooking && (
          <ApprovalModal
            actionType={actionType}
            closeApprovalModal={closeApprovalModal}
            submitApproval={submitApproval}
            selectedBooking={selectedBooking}
            comment={comment}
            setComment={setComment}
            loading={loading}
          />
        )}
      </div>
    </main>
  )
}
