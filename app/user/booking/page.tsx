"use client"

import { useEffect, useState } from "react"
import api from "@/lib/api"

type Vehicle = {
  id: string
  plateNumber: string
  status: string
  type: {
    id: string
    name: string
  }
}

type VehicleType = {
  id: string
  name: string
}

type BookingData = {
  vehicleId: string
  startDate: string
  endDate: string
  purpose: string
  destination: string
}

export default function BookingPage() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [vehicleTypes, setVehicleTypes] = useState<VehicleType[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedType, setSelectedType] = useState("")
  const [searchDate, setSearchDate] = useState({
    startDate: "",
    endDate: ""
  })
  const [showBookingForm, setShowBookingForm] = useState(false)
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  const [bookingData, setBookingData] = useState<BookingData>({
    vehicleId: "",
    startDate: "",
    endDate: "",
    purpose: "",
    destination: ""
  })

  // Fetch vehicle types
  const fetchVehicleTypes = async () => {
    try {
      const response = await api.get("/api/verhicle-type")
      setVehicleTypes(response.data)
    } catch (error: any) {
      console.error("Fetch vehicle types error:", error)
    }
  }

  // Search available vehicles
  const searchVehicles = async () => {
    try {
      setLoading(true)
      setError("")

      const params = new URLSearchParams()
      if (selectedType) params.append('vehicleTypeId', selectedType)
      if (searchDate.startDate) params.append('startDate', searchDate.startDate)
      if (searchDate.endDate) params.append('endDate', searchDate.endDate)

      const response = await api.get(`/api/booking?${params.toString()}`)
      setVehicles(response.data)
    } catch (error: any) {
      setError("ไม่สามารถค้นหารถได้ กรุณาลองใหม่อีกครั้ง")
      console.error("Search vehicles error:", error)
    } finally {
      setLoading(false)
    }
  }

  // Open booking form
  const openBookingForm = (vehicle: Vehicle) => {
    setSelectedVehicle(vehicle)
    setBookingData({
      vehicleId: vehicle.id,
      startDate: searchDate.startDate,
      endDate: searchDate.endDate,
      purpose: "",
      destination: ""
    })
    setShowBookingForm(true)
  }

  // Submit booking
  const submitBooking = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      setLoading(true)
      setError("")

      await api.post("/api/booking", bookingData)
      
      setSuccess("จองรถสำเร็จ! รอการอนุมัติจากผู้จัดการ")
      setShowBookingForm(false)
      searchVehicles() // Refresh available vehicles
      
      // Clear form
      setBookingData({
        vehicleId: "",
        startDate: "",
        endDate: "",
        purpose: "",
        destination: ""
      })
    } catch (error: any) {
      setError(error.response?.data?.message || "ไม่สามารถจองรถได้")
    } finally {
      setLoading(false)
    }
  }

  // Get today's date in YYYY-MM-DD format
  const getTodayDate = () => {
    return new Date().toISOString().split('T')[0]
  }

  // Get minimum end date (start date + 1 hour)
  const getMinEndDateTime = () => {
    if (!searchDate.startDate) return ""
    
    const startDateTime = new Date(searchDate.startDate)
    startDateTime.setHours(startDateTime.getHours() + 1)
    return startDateTime.toISOString().slice(0, 16)
  }

  useEffect(() => {
    fetchVehicleTypes()
  }, [])

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">จองรถ</h1>
          <p className="text-gray-600">เลือกประเภทรถและช่วงเวลาที่ต้องการใช้</p>
        </div>

        {/* Success Message */}
        {success && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-6">
            {success}
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        {/* Search Filters */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">ค้นหารถที่ว่าง</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                ประเภทรถ
              </label>
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">ทุกประเภท</option>
                {vehicleTypes.map(type => (
                  <option key={type.id} value={type.id}>{type.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                วันเวลาเริ่ม
              </label>
              <input
                type="datetime-local"
                value={searchDate.startDate}
                onChange={(e) => setSearchDate({...searchDate, startDate: e.target.value})}
                min={new Date().toISOString().slice(0, 16)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                วันเวลาสิ้นสุด
              </label>
              <input
                type="datetime-local"
                value={searchDate.endDate}
                onChange={(e) => setSearchDate({...searchDate, endDate: e.target.value})}
                min={getMinEndDateTime()}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex items-end">
              <button
                onClick={searchVehicles}
                disabled={loading || !searchDate.startDate || !searchDate.endDate}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-4 py-2 rounded-md font-medium"
              >
                {loading ? "กำลังค้นหา..." : "ค้นหา"}
              </button>
            </div>
          </div>
        </div>

        {/* Available Vehicles */}
        {vehicles.length > 0 && (
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              รถที่ว่าง ({vehicles.length} คัน)
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {vehicles.map((vehicle) => (
                <div key={vehicle.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <h4 className="text-lg font-semibold text-gray-900">
                        {vehicle.plateNumber}
                      </h4>
                      <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                        ว่าง
                      </span>
                    </div>
                    
                    <div className="mb-4">
                      <p className="text-sm text-gray-600 mb-1">ประเภทรถ</p>
                      <p className="text-gray-900 font-medium">{vehicle.type.name}</p>
                    </div>

                    <button
                      onClick={() => openBookingForm(vehicle)}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-medium"
                    >
                      จองรถคันนี้
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* No vehicles message */}
        {vehicles.length === 0 && searchDate.startDate && searchDate.endDate && !loading && (
          <div className="text-center py-8">
            <div className="text-gray-500 text-lg">ไม่พบรถที่ว่างในช่วงเวลาที่เลือก</div>
            <p className="text-gray-400 mt-2">กรุณาเลือกช่วงเวลาอื่น หรือเปลี่ยนประเภทรถ</p>
          </div>
        )}

        {/* Booking Form Modal */}
        {showBookingForm && selectedVehicle && (
          <div className="fixed inset-0 bg-gray-600/50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
              <div className="mt-3">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  จองรถ {selectedVehicle.plateNumber}
                </h3>
                
                <form onSubmit={submitBooking}>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      รถที่เลือก
                    </label>
                    <div className="bg-gray-100 p-3 rounded-md">
                      <p className="font-medium">{selectedVehicle.plateNumber}</p>
                      <p className="text-sm text-gray-600">{selectedVehicle.type.name}</p>
                    </div>
                  </div>

                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      ช่วงเวลา
                    </label>
                    <div className="bg-gray-100 p-3 rounded-md">
                      <p className="text-sm">
                        {new Date(searchDate.startDate).toLocaleString('th-TH')}
                      </p>
                      <p className="text-sm text-gray-600">ถึง</p>
                      <p className="text-sm">
                        {new Date(searchDate.endDate).toLocaleString('th-TH')}
                      </p>
                    </div>
                  </div>

                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      วัตถุประสงค์ *
                    </label>
                    <input
                      type="text"
                      required
                      value={bookingData.purpose}
                      onChange={(e) => setBookingData({...bookingData, purpose: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="เช่น ประชุมลูกค้า, ไปส่งเอกสาร"
                    />
                  </div>

                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      ปลายทาง
                    </label>
                    <input
                      type="text"
                      value={bookingData.destination}
                      onChange={(e) => setBookingData({...bookingData, destination: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="สถานที่ที่จะไป (ไม่บังคับ)"
                    />
                  </div>

                  <div className="flex justify-end gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        setShowBookingForm(false)
                        setSelectedVehicle(null)
                      }}
                      className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
                    >
                      ยกเลิก
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50"
                    >
                      {loading ? "กำลังจอง..." : "ยืนยันการจอง"}
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