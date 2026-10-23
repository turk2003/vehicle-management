import type * as React from "react"
import type { Dispatch, SetStateAction } from "react"
import type { EditForm } from "../types"
import { getLocalDateTimeInputValue } from "../utils"
import ModalHeader from "./ModalHeader"
import ModalActions from "./ModalActions"

type BookingEditModalProps = {
  closeModal: () => void
  handleEditSubmit: (e: React.FormEvent) => Promise<void>
  editForm: EditForm
  setEditForm: Dispatch<SetStateAction<EditForm>>
  minEditEndDateTime: string
  loading: boolean
}

export default function BookingEditModal({
  closeModal,
  handleEditSubmit,
  editForm,
  setEditForm,
  minEditEndDateTime,
  loading,
}: BookingEditModalProps) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-gray-900/50 px-4 py-8"
      role="dialog"
      aria-modal="true"
      aria-labelledby="booking-edit-title"
    >
      <div className="w-full max-w-lg rounded-xl bg-white shadow-lg ring-1 ring-gray-200">
        <ModalHeader
          id="booking-edit-title"
          title="แก้ไขการจอง"
          description="แก้ไขได้เฉพาะคำขอที่ยังรออนุมัติ"
          onClose={closeModal}
        />

        <form onSubmit={handleEditSubmit} className="space-y-5 px-6 py-6">
          <div>
            <label
              htmlFor="edit-start-date"
              className="mb-1.5 block text-sm font-medium text-gray-700"
            >
              วันที่และเวลาเริ่ม
            </label>
            <input
              id="edit-start-date"
              type="datetime-local"
              required
              value={editForm.startDate}
              min={getLocalDateTimeInputValue()}
              onChange={(e) =>
                setEditForm((current) => ({
                  ...current,
                  startDate: e.target.value,
                  endDate:
                    current.endDate && current.endDate <= e.target.value
                      ? ""
                      : current.endDate,
                }))
              }
              className="min-h-11 w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-gray-950 transition-colors duration-150 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600/25"
            />
          </div>
          <div>
            <label
              htmlFor="edit-end-date"
              className="mb-1.5 block text-sm font-medium text-gray-700"
            >
              วันที่และเวลาสิ้นสุด
            </label>
            <input
              id="edit-end-date"
              type="datetime-local"
              required
              value={editForm.endDate}
              min={minEditEndDateTime}
              disabled={!editForm.startDate}
              onChange={(e) =>
                setEditForm((current) => ({
                  ...current,
                  endDate: e.target.value,
                }))
              }
              className="min-h-11 w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-gray-950 transition-colors duration-150 disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-500 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600/25"
            />
          </div>
          <div>
            <label
              htmlFor="edit-purpose"
              className="mb-1.5 block text-sm font-medium text-gray-700"
            >
              วัตถุประสงค์
            </label>
            <textarea
              id="edit-purpose"
              required
              rows={4}
              value={editForm.purpose}
              onChange={(e) =>
                setEditForm((current) => ({
                  ...current,
                  purpose: e.target.value,
                }))
              }
              className="min-h-28 w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-gray-950 transition-colors duration-150 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600/25"
            />
          </div>
          <div>
            <label
              htmlFor="edit-destination"
              className="mb-1.5 block text-sm font-medium text-gray-700"
            >
              ปลายทาง (ไม่บังคับ)
            </label>
            <input
              id="edit-destination"
              type="text"
              maxLength={255}
              value={editForm.destination}
              onChange={(e) =>
                setEditForm((current) => ({
                  ...current,
                  destination: e.target.value,
                }))
              }
              className="min-h-11 w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-gray-950 transition-colors duration-150 placeholder:text-gray-500 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600/25"
              placeholder="เช่น สำนักงานเขต, สถานีไฟฟ้า"
            />
          </div>
          <ModalActions
            loading={loading}
            loadingLabel="กำลังบันทึก..."
            submitLabel="บันทึกการแก้ไข"
            onCancel={closeModal}
          />
        </form>
      </div>
    </div>
  )
}
