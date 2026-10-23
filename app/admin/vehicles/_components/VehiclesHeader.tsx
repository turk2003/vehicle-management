import { Car, Plus, Tags } from "lucide-react"
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
    <header className="mb-6 rounded-xl bg-white p-6 shadow-sm ring-1 ring-gray-200">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="mb-2 text-sm font-medium text-blue-700">
            ผู้ดูแลระบบ
          </p>
          <h1 className="text-2xl font-bold leading-tight text-gray-950">
            จัดการรถ
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-600">
            เพิ่ม แก้ไข และตรวจสอบข้อมูลรถ ประเภทรถ สถานะ และเลขไมล์ปัจจุบัน
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="inline-flex rounded-lg bg-gray-100 p-1">
            <button
              type="button"
              onClick={() => setActiveTab("vehicles")}
              className={`inline-flex min-h-10 items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-blue-600/25 ${
                activeTab === "vehicles"
                  ? "bg-white text-blue-700 shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              <Car className="h-4 w-4" aria-hidden="true" />
              รายการรถ
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("types")}
              className={`inline-flex min-h-10 items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-blue-600/25 ${
                activeTab === "types"
                  ? "bg-white text-blue-700 shadow-sm"
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
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition-colors duration-150 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2"
            >
              <Plus className="h-4 w-4" aria-hidden="true" />
              {activeTab === "vehicles" ? "เพิ่มรถ" : "เพิ่มประเภทรถ"}
            </button>
          )}
        </div>
      </div>
    </header>
  )
}
