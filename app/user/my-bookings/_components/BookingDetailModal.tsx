import type { Booking } from "../types"
import ModalHeader from "./ModalHeader"
import BookingDetailPanel from "./BookingDetailPanel"
import PrimaryButton from "./PrimaryButton"

type BookingDetailModalProps = {
  closeModal: () => void
  selectedBooking: Booking
}

export default function BookingDetailModal({
  closeModal,
  selectedBooking,
}: BookingDetailModalProps) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-gray-900/50 px-4 py-8"
      role="dialog"
      aria-modal="true"
      aria-labelledby="booking-detail-title"
    >
      <div className="w-full max-w-2xl rounded-xl bg-white shadow-lg ring-1 ring-gray-200">
        <ModalHeader
          id="booking-detail-title"
          title="รายละเอียดการจอง"
          description="ข้อมูลรถ ช่วงเวลา สถานะ และผลการดำเนินการ"
          onClose={closeModal}
        />

        <div className="space-y-5 px-6 py-6">
          <BookingDetailPanel booking={selectedBooking} />
          <div className="flex justify-end">
            <PrimaryButton onClick={closeModal}>ปิด</PrimaryButton>
          </div>
        </div>
      </div>
    </div>
  )
}
