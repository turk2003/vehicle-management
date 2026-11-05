import { Car, Plus, Tags } from "lucide-react"
import PageHeader from "@/app/component/page-header"
import type { Dispatch, SetStateAction } from "react"

type VehiclesHeaderProps = {
  setActiveTab: Dispatch<SetStateAction<"vehicles" | "types">>
  activeTab: "vehicles" | "types"
  canManageVehicles: boolean
  openCreateModal: () => void
  openCreateTypeModal: () => void
}

export default function VehiclesHeader({
  setActiveTab,
  activeTab,
  canManageVehicles,
  openCreateModal,
  openCreateTypeModal,
}: VehiclesHeaderProps) {
  return (
    <PageHeader
      title="จัดการรถ"
      description="เพิ่ม แก้ไข และตรวจสอบข้อมูลรถ ประเภทรถ สถานะ และเลขไมล์ปัจจุบัน"
      actions={
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="inline-flex rounded-lg bg-gray-200/60 p-1">
            <button
              type="button"
              onClick={() => setActiveTab("vehicles")}
              className={`inline-flex min-h-9 items-center gap-2 rounded-md px-3.5 py-1.5 text-sm font-medium transition-colors duration-150 ${
                activeTab === "vehicles"
                  ? "bg-white text-gray-950 shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              <Car className="h-4 w-4" aria-hidden="true" />
              รายการรถ
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("types")}
              className={`inline-flex min-h-9 items-center gap-2 rounded-md px-3.5 py-1.5 text-sm font-medium transition-colors duration-150 ${
                activeTab === "types"
                  ? "bg-white text-gray-950 shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              <Tags className="h-4 w-4" aria-hidden="true" />
              ประเภทรถ
            </button>
          </div>

          {canManageVehicles && (
            <button
              type="button"
              onClick={
                activeTab === "vehicles" ? openCreateModal : openCreateTypeModal
              }
              className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors duration-150 hover:bg-blue-700 shadow-sm"
            >
              <Plus className="h-4 w-4" aria-hidden="true" />
              {activeTab === "vehicles" ? "เพิ่มรถ" : "เพิ่มประเภทรถ"}
            </button>
          )}
        </div>
      }
    />
  )
}
