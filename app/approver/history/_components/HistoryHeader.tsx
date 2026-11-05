import PageHeader from "@/app/component/page-header"
import type { Dispatch, SetStateAction } from "react"
import { STATUS_FILTERS } from "../constants"

type HistoryHeaderProps = {
  selectedStatus: string
  setSelectedStatus: Dispatch<SetStateAction<string>>
}

export default function HistoryHeader({
  selectedStatus,
  setSelectedStatus,
}: HistoryHeaderProps) {
  return (
    <PageHeader
      title="ประวัติการอนุมัติ"
      description="ตรวจสอบผลการพิจารณาคำขอจองรถย้อนหลังตามสถานะและช่วงวันที่"
      actions={
        <div
          className="inline-flex flex-wrap gap-1 rounded-lg bg-gray-200/60 p-1"
          role="tablist"
          aria-label="กรองสถานะประวัติการอนุมัติ"
        >
          {STATUS_FILTERS.map(({ value, label, icon: Icon }) => (
            <button
              key={value}
              type="button"
              role="tab"
              aria-selected={selectedStatus === value}
              onClick={() => setSelectedStatus(value)}
              className={`inline-flex min-h-9 items-center gap-2 rounded-md px-3.5 py-1.5 text-sm font-medium transition-colors duration-150 ${
                selectedStatus === value
                  ? "bg-white text-gray-950 shadow-sm"
                  : "text-gray-600 hover:text-gray-950"
              }`}
            >
              <Icon className="h-4 w-4" aria-hidden="true" />
              {label}
            </button>
          ))}
        </div>
      }
    />
  )
}
