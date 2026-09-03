"use client"

import { useEffect, useState } from "react"
import axios from "axios"
import { Car, Pencil, Plus, Tags, Trash2, X } from "lucide-react"
import api from "@/lib/api"
import { getVehicleStatusColor, getVehicleStatusText } from "@/lib/format"

type Vehicle = {
  id: string
  plateNumber: string
  status: string
  currentMileage: number
  type?: {
    id: string
    name: string
  }
}

type VehicleType = {
  id: string
  name: string
}

type VehicleFormData = {
  plateNumber: string
  typeId: string
  status: string
  currentMileage: string
}

type VehicleTypeFormData = {
  name: string
}

const INITIAL_VEHICLE_FORM: VehicleFormData = {
  plateNumber: "",
  typeId: "",
  status: "AVAILABLE",
  currentMileage: "0",
}

const INITIAL_TYPE_FORM: VehicleTypeFormData = {
  name: "",
}

const VEHICLE_STATUSES = [
  { value: "AVAILABLE", label: "ว่าง" },
  { value: "BOOKED", label: "จองแล้ว" },
  { value: "IN_USE", label: "กำลังใช้งาน" },
  { value: "MAINTENANCE", label: "ซ่อมบำรุง" },
]

function getErrorMessage(error: unknown, fallback: string) {
  if (axios.isAxiosError<{ message?: string }>(error)) {
    return error.response?.data?.message || fallback
  }

  return fallback
}

export default function AdminVehiclesPage() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [vehicleTypes, setVehicleTypes] = useState<VehicleType[]>([])
  const [loading, setLoading] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [showTypeModal, setShowTypeModal] = useState(false)
  const [activeTab, setActiveTab] = useState<"vehicles" | "types">("vehicles")
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null)
  const [editingType, setEditingType] = useState<VehicleType | null>(null)
  const [error, setError] = useState("")
  const [formData, setFormData] = useState<VehicleFormData>(
    INITIAL_VEHICLE_FORM,
  )
  const [typeFormData, setTypeFormData] =
    useState<VehicleTypeFormData>(INITIAL_TYPE_FORM)

  const fetchVehicles = async () => {
    try {
      setLoading(true)
      setError("")
      const response = await api.get<Vehicle[]>("/api/verhicle")
      setVehicles(response.data)
    } catch (error) {
      setError(getErrorMessage(error, "ไม่สามารถโหลดข้อมูลรถได้"))
    } finally {
      setLoading(false)
    }
  }

  const fetchVehicleTypes = async () => {
    try {
      const response = await api.get<VehicleType[]>("/api/verhicle-type")
      setVehicleTypes(response.data)
    } catch (error) {
      setError(getErrorMessage(error, "ไม่สามารถโหลดประเภทรถได้"))
    }
  }

  const resetForm = () => {
    setFormData(INITIAL_VEHICLE_FORM)
    setEditingVehicle(null)
    setError("")
  }

  const resetTypeForm = () => {
    setTypeFormData(INITIAL_TYPE_FORM)
    setEditingType(null)
    setError("")
  }

  const closeVehicleModal = () => {
    setShowModal(false)
    resetForm()
  }

  const closeTypeModal = () => {
    setShowTypeModal(false)
    resetTypeForm()
  }

  const createVehicle = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      setLoading(true)
      setError("")
      const response = await api.post<Vehicle>("/api/verhicle", formData)
      setVehicles((currentVehicles) => [response.data, ...currentVehicles])
      closeVehicleModal()
    } catch (error) {
      setError(getErrorMessage(error, "ไม่สามารถเพิ่มรถได้"))
    } finally {
      setLoading(false)
    }
  }

  const updateVehicle = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingVehicle) return

    try {
      setLoading(true)
      setError("")
      const response = await api.put<Vehicle>("/api/verhicle", {
        id: editingVehicle.id,
        ...formData,
      })

      setVehicles((currentVehicles) =>
        currentVehicles.map((vehicle) =>
          vehicle.id === editingVehicle.id ? response.data : vehicle,
        ),
      )
      closeVehicleModal()
    } catch (error) {
      setError(getErrorMessage(error, "ไม่สามารถแก้ไขข้อมูลรถได้"))
    } finally {
      setLoading(false)
    }
  }

  const deleteVehicle = async (id: string, plateNumber: string) => {
    const confirmed = confirm(`ต้องการลบรถทะเบียน "${plateNumber}" ใช่หรือไม่?`)
    if (!confirmed) return

    try {
      setLoading(true)
      setError("")
      await api.delete(`/api/verhicle?id=${id}`)
      setVehicles((currentVehicles) =>
        currentVehicles.filter((vehicle) => vehicle.id !== id),
      )
    } catch (error) {
      setError(getErrorMessage(error, "ไม่สามารถลบรถได้"))
    } finally {
      setLoading(false)
    }
  }

  const createVehicleType = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      setLoading(true)
      setError("")
      const response = await api.post<VehicleType>(
        "/api/verhicle-type",
        typeFormData,
      )
      setVehicleTypes((currentTypes) => [response.data, ...currentTypes])
      closeTypeModal()
    } catch (error) {
      setError(getErrorMessage(error, "ไม่สามารถเพิ่มประเภทรถได้"))
    } finally {
      setLoading(false)
    }
  }

  const updateVehicleType = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingType) return

    try {
      setLoading(true)
      setError("")
      const response = await api.put<VehicleType>("/api/verhicle-type", {
        id: editingType.id,
        ...typeFormData,
      })

      setVehicleTypes((currentTypes) =>
        currentTypes.map((type) =>
          type.id === editingType.id ? response.data : type,
        ),
      )
      closeTypeModal()
    } catch (error) {
      setError(getErrorMessage(error, "ไม่สามารถแก้ไขประเภทรถได้"))
    } finally {
      setLoading(false)
    }
  }

  const deleteVehicleType = async (id: string, name: string) => {
    const confirmed = confirm(`ต้องการลบประเภทรถ "${name}" ใช่หรือไม่?`)
    if (!confirmed) return

    try {
      setLoading(true)
      setError("")
      await api.delete(`/api/verhicle-type?id=${id}`)
      setVehicleTypes((currentTypes) =>
        currentTypes.filter((type) => type.id !== id),
      )
    } catch (error) {
      setError(getErrorMessage(error, "ไม่สามารถลบประเภทรถได้"))
    } finally {
      setLoading(false)
    }
  }

  const openEditModal = (vehicle: Vehicle) => {
    setEditingVehicle(vehicle)
    setFormData({
      plateNumber: vehicle.plateNumber,
      typeId: vehicle.type?.id || "",
      status: vehicle.status,
      currentMileage: String(vehicle.currentMileage),
    })
    setError("")
    setShowModal(true)
  }

  const openCreateModal = () => {
    resetForm()
    setShowModal(true)
  }

  const openEditTypeModal = (type: VehicleType) => {
    setEditingType(type)
    setTypeFormData({ name: type.name })
    setError("")
    setShowTypeModal(true)
  }

  const openCreateTypeModal = () => {
    resetTypeForm()
    setShowTypeModal(true)
  }

  useEffect(() => {
    fetchVehicles()
    fetchVehicleTypes()
  }, [])

  const vehicleModalTitle = editingVehicle ? "แก้ไขข้อมูลรถ" : "เพิ่มรถ"
  const vehicleSubmitLabel = editingVehicle ? "บันทึกการแก้ไข" : "เพิ่มรถ"
  const typeModalTitle = editingType ? "แก้ไขประเภทรถ" : "เพิ่มประเภทรถ"
  const typeSubmitLabel = editingType ? "บันทึกการแก้ไข" : "เพิ่มประเภท"

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
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

        {activeTab === "vehicles" && (
          <section
            className="overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-gray-200"
            aria-labelledby="vehicles-table-title"
          >
            <div className="border-b border-gray-200 px-6 py-4">
              <h2
                id="vehicles-table-title"
                className="text-lg font-semibold text-gray-950"
              >
                รายการรถ
              </h2>
              <p className="mt-1 text-sm text-gray-600">
                ทั้งหมด {vehicles.length} รายการ
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[840px]">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-600">
                      ทะเบียนรถ
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-600">
                      ประเภทรถ
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-600">
                      สถานะ
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-600">
                      เลขไมล์
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-600">
                      การดำเนินการ
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {loading && vehicles.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-10 text-center">
                        <div className="mx-auto h-5 w-48 animate-pulse rounded bg-gray-200" />
                      </td>
                    </tr>
                  ) : vehicles.length === 0 ? (
                    <tr>
                      <td
                        colSpan={5}
                        className="px-6 py-12 text-center text-sm text-gray-600"
                      >
                        ยังไม่มีข้อมูลรถ
                      </td>
                    </tr>
                  ) : (
                    vehicles.map((vehicle) => (
                      <tr
                        key={vehicle.id}
                        className="transition-colors duration-150 hover:bg-gray-50"
                      >
                        <td className="px-6 py-4">
                          <div className="text-sm font-semibold text-gray-950">
                            {vehicle.plateNumber}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-700">
                          {vehicle.type?.name || "ไม่ระบุประเภท"}
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${getVehicleStatusColor(vehicle.status)}`}
                          >
                            {getVehicleStatusText(vehicle.status)}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-700">
                          {(vehicle.currentMileage || 0).toLocaleString()} km
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => openEditModal(vehicle)}
                              className="inline-flex min-h-9 items-center gap-1.5 rounded-md bg-blue-50 px-3 py-1.5 text-sm font-medium text-blue-700 transition-colors duration-150 hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-600/25"
                            >
                              <Pencil className="h-4 w-4" aria-hidden="true" />
                              แก้ไข
                            </button>
                            <button
                              type="button"
                              onClick={() =>
                                deleteVehicle(vehicle.id, vehicle.plateNumber)
                              }
                              disabled={loading}
                              className="inline-flex min-h-9 items-center gap-1.5 rounded-md bg-red-50 px-3 py-1.5 text-sm font-medium text-red-700 transition-colors duration-150 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-red-600/25 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                              <Trash2 className="h-4 w-4" aria-hidden="true" />
                              ลบ
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {activeTab === "types" && (
          <section
            className="overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-gray-200"
            aria-labelledby="types-table-title"
          >
            <div className="border-b border-gray-200 px-6 py-4">
              <h2
                id="types-table-title"
                className="text-lg font-semibold text-gray-950"
              >
                ประเภทรถ
              </h2>
              <p className="mt-1 text-sm text-gray-600">
                ทั้งหมด {vehicleTypes.length} ประเภท
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[640px]">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-600">
                      ชื่อประเภท
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-600">
                      จำนวนรถ
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-600">
                      การดำเนินการ
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {vehicleTypes.length === 0 ? (
                    <tr>
                      <td
                        colSpan={3}
                        className="px-6 py-12 text-center text-sm text-gray-600"
                      >
                        ยังไม่มีประเภทรถ
                      </td>
                    </tr>
                  ) : (
                    vehicleTypes.map((type) => {
                      const vehicleCount = vehicles.filter(
                        (vehicle) => vehicle.type?.id === type.id,
                      ).length

                      return (
                        <tr
                          key={type.id}
                          className="transition-colors duration-150 hover:bg-gray-50"
                        >
                          <td className="px-6 py-4 text-sm font-semibold text-gray-950">
                            {type.name}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-700">
                            {vehicleCount} คัน
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex justify-end gap-2">
                              <button
                                type="button"
                                onClick={() => openEditTypeModal(type)}
                                className="inline-flex min-h-9 items-center gap-1.5 rounded-md bg-blue-50 px-3 py-1.5 text-sm font-medium text-blue-700 transition-colors duration-150 hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-600/25"
                              >
                                <Pencil
                                  className="h-4 w-4"
                                  aria-hidden="true"
                                />
                                แก้ไข
                              </button>
                              <button
                                type="button"
                                onClick={() =>
                                  deleteVehicleType(type.id, type.name)
                                }
                                disabled={vehicleCount > 0 || loading}
                                title={
                                  vehicleCount > 0
                                    ? "ไม่สามารถลบประเภทที่มีรถอยู่ได้"
                                    : undefined
                                }
                                className="inline-flex min-h-9 items-center gap-1.5 rounded-md bg-red-50 px-3 py-1.5 text-sm font-medium text-red-700 transition-colors duration-150 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-red-600/25 disabled:cursor-not-allowed disabled:opacity-50"
                              >
                                <Trash2
                                  className="h-4 w-4"
                                  aria-hidden="true"
                                />
                                ลบ
                              </button>
                            </div>
                          </td>
                        </tr>
                      )
                    })
                  )}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {showModal && (
          <div
            className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-gray-900/50 px-4 py-8"
            role="dialog"
            aria-modal="true"
            aria-labelledby="vehicle-modal-title"
          >
            <div className="w-full max-w-lg rounded-xl bg-white shadow-lg ring-1 ring-gray-200">
              <div className="flex items-start justify-between gap-4 border-b border-gray-200 px-6 py-5">
                <div>
                  <h3
                    id="vehicle-modal-title"
                    className="text-lg font-semibold text-gray-950"
                  >
                    {vehicleModalTitle}
                  </h3>
                  <p className="mt-1 text-sm text-gray-600">
                    กำหนดทะเบียน ประเภท สถานะ และเลขไมล์ปัจจุบันของรถ
                  </p>
                </div>
                <button
                  type="button"
                  onClick={closeVehicleModal}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-md text-gray-500 transition-colors duration-150 hover:bg-gray-100 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-600/25"
                  aria-label="ปิดหน้าต่าง"
                >
                  <X className="h-5 w-5" aria-hidden="true" />
                </button>
              </div>

              <form
                onSubmit={editingVehicle ? updateVehicle : createVehicle}
                className="space-y-5 px-6 py-6"
              >
                <div>
                  <label
                    htmlFor="plateNumber"
                    className="mb-1.5 block text-sm font-medium text-gray-700"
                  >
                    ทะเบียนรถ
                  </label>
                  <input
                    id="plateNumber"
                    type="text"
                    required
                    value={formData.plateNumber}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        plateNumber: e.target.value,
                      })
                    }
                    className="min-h-11 w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-gray-950 placeholder:text-gray-500 transition-colors duration-150 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600/25"
                    placeholder="เช่น กข 1234"
                  />
                </div>

                <div>
                  <label
                    htmlFor="typeId"
                    className="mb-1.5 block text-sm font-medium text-gray-700"
                  >
                    ประเภทรถ
                  </label>
                  <select
                    id="typeId"
                    required
                    value={formData.typeId}
                    onChange={(e) =>
                      setFormData({ ...formData, typeId: e.target.value })
                    }
                    className="min-h-11 w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-gray-950 transition-colors duration-150 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600/25"
                  >
                    <option value="">เลือกประเภทรถ</option>
                    {vehicleTypes.map((type) => (
                      <option key={type.id} value={type.id}>
                        {type.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="status"
                    className="mb-1.5 block text-sm font-medium text-gray-700"
                  >
                    สถานะ
                  </label>
                  <select
                    id="status"
                    value={formData.status}
                    onChange={(e) =>
                      setFormData({ ...formData, status: e.target.value })
                    }
                    className="min-h-11 w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-gray-950 transition-colors duration-150 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600/25"
                  >
                    {VEHICLE_STATUSES.map((status) => (
                      <option key={status.value} value={status.value}>
                        {status.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="currentMileage"
                    className="mb-1.5 block text-sm font-medium text-gray-700"
                  >
                    เลขไมล์ปัจจุบัน (km)
                  </label>
                  <input
                    id="currentMileage"
                    type="number"
                    inputMode="numeric"
                    min={0}
                    max={2147483647}
                    step={1}
                    required
                    aria-describedby="current-mileage-help"
                    value={formData.currentMileage}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        currentMileage: e.target.value,
                      })
                    }
                    className="min-h-11 w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-gray-950 placeholder:text-gray-500 transition-colors duration-150 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600/25"
                    placeholder="เช่น 25000"
                  />
                  <p
                    id="current-mileage-help"
                    className="mt-1.5 text-sm leading-5 text-gray-600"
                  >
                    ใช้ตรวจเลขไมล์ตอนรับรถและช่วยจัดอันดับรถที่แนะนำ
                  </p>
                  {editingVehicle &&
                    formData.currentMileage !== "" &&
                    Number(formData.currentMileage) < editingVehicle.currentMileage && (
                      <p className="mt-2 rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-900 ring-1 ring-amber-200">
                        กำลังปรับลดจาก {editingVehicle.currentMileage.toLocaleString()} km
                        โปรดตรวจสอบว่าเป็นการแก้ไขข้อมูลที่บันทึกผิด
                      </p>
                    )}
                </div>

                <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
                  <button
                    type="button"
                    onClick={closeVehicleModal}
                    className="inline-flex min-h-11 items-center justify-center rounded-lg bg-gray-100 px-4 py-2.5 text-sm font-medium text-gray-700 transition-colors duration-150 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-600/25"
                  >
                    ยกเลิก
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="inline-flex min-h-11 items-center justify-center rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition-colors duration-150 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {loading ? "กำลังบันทึก..." : vehicleSubmitLabel}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {showTypeModal && (
          <div
            className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-gray-900/50 px-4 py-8"
            role="dialog"
            aria-modal="true"
            aria-labelledby="type-modal-title"
          >
            <div className="w-full max-w-lg rounded-xl bg-white shadow-lg ring-1 ring-gray-200">
              <div className="flex items-start justify-between gap-4 border-b border-gray-200 px-6 py-5">
                <div>
                  <h3
                    id="type-modal-title"
                    className="text-lg font-semibold text-gray-950"
                  >
                    {typeModalTitle}
                  </h3>
                  <p className="mt-1 text-sm text-gray-600">
                    ใช้จัดกลุ่มรถในรายการและแบบฟอร์มการจอง
                  </p>
                </div>
                <button
                  type="button"
                  onClick={closeTypeModal}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-md text-gray-500 transition-colors duration-150 hover:bg-gray-100 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-600/25"
                  aria-label="ปิดหน้าต่าง"
                >
                  <X className="h-5 w-5" aria-hidden="true" />
                </button>
              </div>

              <form
                onSubmit={editingType ? updateVehicleType : createVehicleType}
                className="space-y-5 px-6 py-6"
              >
                <div>
                  <label
                    htmlFor="typeName"
                    className="mb-1.5 block text-sm font-medium text-gray-700"
                  >
                    ชื่อประเภทรถ
                  </label>
                  <input
                    id="typeName"
                    type="text"
                    required
                    value={typeFormData.name}
                    onChange={(e) =>
                      setTypeFormData({ name: e.target.value })
                    }
                    className="min-h-11 w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-gray-950 placeholder:text-gray-500 transition-colors duration-150 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600/25"
                    placeholder="เช่น รถเก๋ง, รถตู้, รถกระบะ"
                  />
                </div>

                <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
                  <button
                    type="button"
                    onClick={closeTypeModal}
                    className="inline-flex min-h-11 items-center justify-center rounded-lg bg-gray-100 px-4 py-2.5 text-sm font-medium text-gray-700 transition-colors duration-150 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-600/25"
                  >
                    ยกเลิก
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="inline-flex min-h-11 items-center justify-center rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition-colors duration-150 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {loading ? "กำลังบันทึก..." : typeSubmitLabel}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </main>
  )
}
