"use client"

import { useEffect, useState } from "react"
import api from "@/lib/api"
import { usePermissions } from "@/lib/use-permissions"
import type * as React from "react"
import type { Vehicle, VehicleType, VehicleFormData, VehicleTypeFormData } from "./types"
import { INITIAL_VEHICLE_FORM, INITIAL_TYPE_FORM } from "./constants"
import { getErrorMessage } from "./utils"
import VehiclesHeader from "./_components/VehiclesHeader"
import VehicleTable from "./_components/VehicleTable"
import VehicleTypesTable from "./_components/VehicleTypesTable"
import VehicleFormModal from "./_components/VehicleFormModal"
import VehicleTypeFormModal from "./_components/VehicleTypeFormModal"

export default function AdminVehiclesPage() {
  const { hasPermission } = usePermissions()
  const canManageVehicles = hasPermission("VEHICLE_MANAGE")
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
        <VehiclesHeader
          setActiveTab={setActiveTab}
          activeTab={activeTab}
          canManageVehicles={canManageVehicles}
          openCreateModal={openCreateModal}
          openCreateTypeModal={openCreateTypeModal}
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

        {activeTab === "vehicles" && (
          <VehicleTable
            vehicles={vehicles}
            loading={loading}
            canManageVehicles={canManageVehicles}
            openEditModal={openEditModal}
            deleteVehicle={deleteVehicle}
          />
        )}

        {activeTab === "types" && (
          <VehicleTypesTable
            vehicleTypes={vehicleTypes}
            vehicles={vehicles}
            canManageVehicles={canManageVehicles}
            openEditTypeModal={openEditTypeModal}
            deleteVehicleType={deleteVehicleType}
            loading={loading}
          />
        )}

        {showModal && (
          <VehicleFormModal
            vehicleModalTitle={vehicleModalTitle}
            closeVehicleModal={closeVehicleModal}
            editingVehicle={editingVehicle}
            updateVehicle={updateVehicle}
            createVehicle={createVehicle}
            formData={formData}
            setFormData={setFormData}
            vehicleTypes={vehicleTypes}
            loading={loading}
            vehicleSubmitLabel={vehicleSubmitLabel}
          />
        )}

        {showTypeModal && (
          <VehicleTypeFormModal
            typeModalTitle={typeModalTitle}
            closeTypeModal={closeTypeModal}
            editingType={editingType}
            updateVehicleType={updateVehicleType}
            createVehicleType={createVehicleType}
            typeFormData={typeFormData}
            setTypeFormData={setTypeFormData}
            loading={loading}
            typeSubmitLabel={typeSubmitLabel}
          />
        )}
      </div>
    </main>
  )
}
