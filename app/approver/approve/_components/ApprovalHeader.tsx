import type { Dispatch, SetStateAction } from "react"
import { STATUS_FILTERS } from "../constants"

type ApprovalHeaderProps = {
  selectedStatus: string
  setSelectedStatus: Dispatch<SetStateAction<string>>
}

export default function ApprovalHeader({
  selectedStatus,
  setSelectedStatus,
}: ApprovalHeaderProps) {
  return (
    <header className="mb-6 rounded-xl bg-white p-6 shadow-sm ring-1 ring-gray-200">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="mb-2 text-sm font-medium text-blue-700">
            ผู้อนุมัติ
          </p>
          <h1 className="text-2xl font-bold leading-tight text-gray-950">
            อนุมัติการจองรถ
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-600">
            ตรวจสอบคำขอจองรถก่อนตัดสินใจอนุมัติหรือปฏิเสธ พร้อมบันทึกเหตุผลเมื่อจำเป็น
          </p>
        </div>

        <div
          className="flex flex-wrap gap-2"
          role="tablist"
          aria-label="กรองสถานะการจอง"
        >
          {STATUS_FILTERS.map(({ value, label, icon: Icon }) => (
            <button
              key={value}
              type="button"
              role="tab"
              aria-selected={selectedStatus === value}
              onClick={() => setSelectedStatus(value)}
              className={`inline-flex min-h-11 items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-blue-600/25 ${
                selectedStatus === value
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              <Icon className="h-4 w-4" aria-hidden="true" />
              {label}
            </button>
          ))}
        </div>
      </div>
    </header>
  )
}
