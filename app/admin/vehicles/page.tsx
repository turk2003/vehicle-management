"use client"

import { useEffect, useState } from "react"
import api from "@/lib/api"

type Vehicle = {
  id: string
  plateNumber: string
  status: string
  type?: {
    id: string
    name: string
  }
}

type VehicleType = {
  id: string
  name: string 
}

type CreateVehicleData = {
  plateNumber: string
  typeId: string
  status: string
}

type CreateVehicleTypeData = {
  name: string
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
  
  // Form data
  const [formData, setFormData] = useState<CreateVehicleData>({
    plateNumber: "",
    typeId: "",
    status: "AVAILABLE"
  })

  // Form data for vehicle type
  const [typeFormData, setTypeFormData] = useState<CreateVehicleTypeData>({
    name: ""
  })

  // Fetch vehicles
  const fetchVehicles = async () => {
    try {
      setLoading(true)
      const response = await api.get("/api/verhicle")
      setVehicles(response.data)
    } catch (error: any) {
      setError("Failed to fetch vehicles")
      console.error("Fetch vehicles error:", error)
    } finally {
      setLoading(false)
    }
  }

  // Fetch vehicle types
  const fetchVehicleTypes = async () => {
    try {
      const response = await api.get("/api/verhicle-type")
      setVehicleTypes(response.data)
    } catch (error: any) {
      console.error("Fetch vehicle types error:", error)
    }
  }

  // Create vehicle
  const createVehicle = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      setLoading(true)
      const response = await api.post("/api/verhicle", formData)
      setVehicles([response.data, ...vehicles])
      resetForm()
      setShowModal(false)
      setError("")
    } catch (error: any) {
      setError(error.response?.data?.message || "Failed to create vehicle")
    } finally {
      setLoading(false)
    }
  }

  // Update vehicle
  const updateVehicle = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingVehicle) return
    
    try {
      setLoading(true)
      const response = await api.put("/api/verhicle", {
        id: editingVehicle.id,
        ...formData
      })
      
      setVehicles(vehicles.map(v => v.id === editingVehicle.id ? response.data : v))
      resetForm()
      setEditingVehicle(null)
      setShowModal(false)
      setError("")
    } catch (error: any) {
      setError(error.response?.data?.message || "Failed to update vehicle")
    } finally {
      setLoading(false)
    }
  }

  // Delete vehicle
  const deleteVehicle = async (id: string, plateNumber: string) => {
    if (!confirm(`Are you sure you want to delete vehicle ${plateNumber}?`)) return
    
    try {
      setLoading(true)
      await api.delete(`/api/verhicle?id=${id}`)
      setVehicles(vehicles.filter(v => v.id !== id))
    } catch (error: any) {
      setError(error.response?.data?.message || "Failed to delete vehicle")
    } finally {
      setLoading(false)
    }
  }

  // Create vehicle type
  const createVehicleType = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      setLoading(true)
      const response = await api.post("/api/verhicle-type", typeFormData)
      setVehicleTypes([response.data, ...vehicleTypes])
      resetTypeForm()
      setShowTypeModal(false)
      setError("")
    } catch (error: any) {
      setError(error.response?.data?.message || "Failed to create vehicle type")
    } finally {
      setLoading(false)
    }
  }

  // Update vehicle type
  const updateVehicleType = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingType) return
    
    try {
      setLoading(true)
      const response = await api.put("/api/verhicle-type", {
        id: editingType.id,
        ...typeFormData
      })
      
      setVehicleTypes(vehicleTypes.map(t => t.id === editingType.id ? response.data : t))
      resetTypeForm()
      setEditingType(null)
      setShowTypeModal(false)
      setError("")
    } catch (error: any) {
      setError(error.response?.data?.message || "Failed to update vehicle type")
    } finally {
      setLoading(false)
    }
  }

  // Delete vehicle type
  const deleteVehicleType = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete vehicle type "${name}"?`)) return
    
    try {
      setLoading(true)
      await api.delete(`/api/verhicle-type?id=${id}`)
      setVehicleTypes(vehicleTypes.filter(t => t.id !== id))
    } catch (error: any) {
      setError(error.response?.data?.message || "Failed to delete vehicle type")
    } finally {
      setLoading(false)
    }
  }

  // Reset form
  const resetForm = () => {
    setFormData({
      plateNumber: "",
      typeId: "",
      status: "AVAILABLE"
    })
    setEditingVehicle(null)
    setError("")
  }

  // Reset type form
  const resetTypeForm = () => {
    setTypeFormData({ name: "" })
    setEditingType(null)
    setError("")
  }

  // Open edit modal
  const openEditModal = (vehicle: Vehicle) => {
    setEditingVehicle(vehicle)
    setFormData({
      plateNumber: vehicle.plateNumber,
      typeId: vehicle.type?.id || "",
      status: vehicle.status
    })
    setShowModal(true)
  }

  // Open create modal
  const openCreateModal = () => {
    resetForm()
    setShowModal(true)
  }

  // Open edit type modal
  const openEditTypeModal = (type: VehicleType) => {
    setEditingType(type)
    setTypeFormData({ name: type.name })
    setShowTypeModal(true)
  }

  // Open create type modal
  const openCreateTypeModal = () => {
    resetTypeForm()
    setShowTypeModal(true)
  }

  useEffect(() => {
    fetchVehicles()
    fetchVehicleTypes()
  }, [])

  const getStatusColor = (status: string) => {
    switch (status) {
      case "AVAILABLE":
        return "bg-green-100 text-green-800"
      case "BOOKED":
        return "bg-yellow-100 text-yellow-800"
      case "MAINTENANCE":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case "AVAILABLE":
        return "Available"
      case "BOOKED":
        return "Booked"
      case "MAINTENANCE":
        return "Maintenance"
      default:
        return status
    }
  }

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Vehicle Management</h1>
          
          {/* Tabs */}
          <div className="flex space-x-1 bg-gray-200 rounded-lg p-1">
            <button
              onClick={() => setActiveTab("vehicles")}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === "vehicles"
                  ? "bg-white text-blue-600 shadow-sm"
                  : "text-gray-600 hover:text-gray-800"
              }`}
            >
              Vehicles
            </button>
            <button
              onClick={() => setActiveTab("types")}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === "types"
                  ? "bg-white text-blue-600 shadow-sm"
                  : "text-gray-600 hover:text-gray-800"
              }`}
            >
              Vehicle Types
            </button>
          </div>

          <button
            onClick={activeTab === "vehicles" ? openCreateModal : openCreateTypeModal}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
          >
            <span>+</span>
            {activeTab === "vehicles" ? "Add Vehicle" : "Add Type"}
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {/* Vehicles Tab */}
        {activeTab === "vehicles" && (
          <div className="bg-white shadow-md rounded-lg overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Plate Number
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {loading && vehicles.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-4 text-center text-gray-500">
                      Loading...
                    </td>
                  </tr>
                ) : vehicles.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-4 text-center text-gray-500">
                      No vehicles found
                    </td>
                  </tr>
                ) : (
                  vehicles.map((vehicle) => (
                    <tr key={vehicle.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {vehicle.plateNumber}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{vehicle.type?.name || 'No Type'}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(vehicle.status)}`}>
                          {getStatusText(vehicle.status)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => openEditModal(vehicle)}
                          className="text-blue-600 hover:text-blue-900 mr-3"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => deleteVehicle(vehicle.id, vehicle.plateNumber)}
                          className="text-red-600 hover:text-red-900"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Vehicle Types Tab */}
        {activeTab === "types" && (
          <div className="bg-white shadow-md rounded-lg overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Vehicles Count
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {vehicleTypes.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="px-6 py-4 text-center text-gray-500">
                      No vehicle types found
                    </td>
                  </tr>
                ) : (
                  vehicleTypes.map((type) => {
                    const vehicleCount = vehicles.filter(v => v.type?.id === type.id).length
                    return (
                      <tr key={type.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {type.name}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {vehicleCount} vehicles
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <button
                            onClick={() => openEditTypeModal(type)}
                            className="text-blue-600 hover:text-blue-900 mr-3"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => deleteVehicleType(type.id, type.name)}
                            className="text-red-600 hover:text-red-900"
                            disabled={vehicleCount > 0}
                            title={vehicleCount > 0 ? "Cannot delete type with existing vehicles" : ""}
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Vehicle Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-gray-600/50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
              <div className="mt-3">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  {editingVehicle ? "Edit Vehicle" : "Add New Vehicle"}
                </h3>
                
                <form onSubmit={editingVehicle ? updateVehicle : createVehicle}>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Plate Number
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.plateNumber}
                      onChange={(e) => setFormData({...formData, plateNumber: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="e.g. ABC-1234"
                    />
                  </div>

                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Vehicle Type
                    </label>
                    <select
                      required
                      value={formData.typeId}
                      onChange={(e) => setFormData({...formData, typeId: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select Type</option>
                      {vehicleTypes.map(type => (
                        <option key={type.id} value={type.id}>{type.name}</option>
                      ))}
                    </select>
                  </div>

                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Status
                    </label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({...formData, status: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="AVAILABLE">Available</option>
                      <option value="BOOKED">Booked</option>
                      <option value="MAINTENANCE">Maintenance</option>
                    </select>
                  </div>

                  <div className="flex justify-end gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        setShowModal(false)
                        resetForm()
                      }}
                      className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50"
                    >
                      {loading ? "Saving..." : editingVehicle ? "Update" : "Add"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Vehicle Type Modal */}
        {showTypeModal && (
          <div className="fixed inset-0 bg-gray-600/50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
              <div className="mt-3">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  {editingType ? "Edit Vehicle Type" : "Add New Vehicle Type"}
                </h3>
                
                <form onSubmit={editingType ? updateVehicleType : createVehicleType}>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Type Name
                    </label>
                    <input
                      type="text"
                      required
                      value={typeFormData.name}
                      onChange={(e) => setTypeFormData({name: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="e.g. Sedan, SUV, Van"
                    />
                  </div>

                  <div className="flex justify-end gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        setShowTypeModal(false)
                        resetTypeForm()
                      }}
                      className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50"
                    >
                      {loading ? "Saving..." : editingType ? "Update" : "Add"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}