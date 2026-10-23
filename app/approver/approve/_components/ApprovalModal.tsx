import { Check, X } from "lucide-react"
import { formatDateTime } from "@/lib/format"
import type * as React from "react"
import type { Dispatch, SetStateAction } from "react"
import type { Booking } from "../types"

type ApprovalModalProps = {
  actionType: "APPROVED" | "REJECTED"
  closeApprovalModal: () => void
  submitApproval: (e: React.FormEvent) => Promise<void>
  selectedBooking: Booking
  comment: string
  setComment: Dispatch<SetStateAction<string>>
  loading: boolean
}

export default function ApprovalModal({
  actionType,
  closeApprovalModal,
  submitApproval,
  selectedBooking,
  comment,
  setComment,
  loading,
}: ApprovalModalProps) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-gray-900/50 px-4 py-8"
      role="dialog"
      aria-modal="true"
      aria-labelledby="approval-modal-title"
    >
      <div className="w-full max-w-lg rounded-xl bg-white shadow-lg ring-1 ring-gray-200">
        <div className="flex items-start justify-between gap-4 border-b border-gray-200 px-6 py-5">
          <div>
            <h3
              id="approval-modal-title"
              className="text-lg font-semibold text-gray-950"
            >
              {actionType === "APPROVED"
                ? "ยืนยันการอนุมัติ"
                : "ยืนยันการปฏิเสธ"}
            </h3>
            <p className="mt-1 text-sm text-gray-600">
              ตรวจสอบรายละเอียดก่อนบันทึกผลการพิจารณา
            </p>
          </div>
          <button
            type="button"
            onClick={closeApprovalModal}
            className="inline-flex h-9 w-9 items-center justify-center rounded-md text-gray-500 transition-colors duration-150 hover:bg-gray-100 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-600/25"
            aria-label="ปิดหน้าต่าง"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>

        <form onSubmit={submitApproval} className="space-y-5 px-6 py-6">
          <div className="rounded-lg bg-gray-50 p-4 ring-1 ring-gray-200">
            <dl className="grid gap-3 text-sm">
              <div>
                <dt className="font-medium text-gray-600">ผู้จอง</dt>
                <dd className="mt-1 text-gray-950">
                  {selectedBooking.user.name}
                </dd>
              </div>
              <div>
                <dt className="font-medium text-gray-600">รถ</dt>
                <dd className="mt-1 text-gray-950">
                  {selectedBooking.vehicle.plateNumber} (
                  {selectedBooking.vehicle.type.name})
                </dd>
              </div>
              <div>
                <dt className="font-medium text-gray-600">ช่วงเวลา</dt>
                <dd className="mt-1 text-gray-950">
                  {formatDateTime(selectedBooking.startDate)} -{" "}
                  {formatDateTime(selectedBooking.endDate)}
                </dd>
              </div>
              <div>
                <dt className="font-medium text-gray-600">
                  วัตถุประสงค์
                </dt>
                <dd className="mt-1 text-gray-950">
                  {selectedBooking.purpose}
                </dd>
              </div>
              {selectedBooking.destination && (
                <div>
                  <dt className="font-medium text-gray-600">ปลายทาง</dt>
                  <dd className="mt-1 text-gray-950">
                    {selectedBooking.destination}
                  </dd>
                </div>
              )}
            </dl>
          </div>

          <div>
            <label
              htmlFor="approval-comment"
              className="mb-1.5 block text-sm font-medium text-gray-700"
            >
              {actionType === "APPROVED"
                ? "หมายเหตุ (ไม่บังคับ)"
                : "เหตุผลที่ปฏิเสธ (บังคับ)"}
            </label>
            <textarea
              id="approval-comment"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              required={actionType === "REJECTED"}
              className="min-h-28 w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-gray-950 transition-colors duration-150 placeholder:text-gray-500 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600/25"
              rows={4}
              placeholder={
                actionType === "APPROVED"
                  ? "เพิ่มหมายเหตุสำหรับผู้จอง"
                  : "ระบุเหตุผลเพื่อให้ผู้จองแก้ไขคำขอได้"
              }
            />
          </div>

          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={closeApprovalModal}
              className="inline-flex min-h-11 items-center justify-center rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 transition-colors duration-150 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-600/25"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              disabled={loading}
              className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-white transition-colors duration-150 focus:outline-none focus:ring-2 disabled:cursor-not-allowed disabled:opacity-60 ${
                actionType === "APPROVED"
                  ? "bg-green-600 hover:bg-green-700 focus:ring-green-600/25"
                  : "bg-red-600 hover:bg-red-700 focus:ring-red-600/25"
              }`}
            >
              {actionType === "APPROVED" ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <X className="h-4 w-4" aria-hidden="true" />
              )}
              {loading
                ? "กำลังดำเนินการ..."
                : actionType === "APPROVED"
                  ? "ยืนยันการอนุมัติ"
                  : "ยืนยันการปฏิเสธ"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
