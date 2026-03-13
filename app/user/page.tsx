"use client"

import { useRouter } from "next/navigation"
import { Car, FileText, Wrench, User, Bell, Shield } from "lucide-react"
import { useEffect, useState } from "react"
import api from "@/lib/api"

export default function UserPage() {
  const router = useRouter()
  const [permissions, setPermissions] = useState<string[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchMe = async () => {
      try {
        const res = await api.get("/api/auth/me")
        setPermissions(res.data.permissions || [])
      } catch (error) {
        console.error("Failed to load permissions", error)
      } finally {
        setLoading(false)
      }
    }
    fetchMe()
  }, [])
  
  const allMenuItems = [
    {
      title: "จองรถ",
      description: "เลือกรถและวันเวลาที่ต้องการใช้",
      icon: Car,
      href: "/user/booking",
      color: "bg-blue-500 hover:bg-blue-600",
      permission: "BOOKING_CREATE"
    },
    {
      title: "ประวัติการจอง",
      description: "ดูประวัติการจองรถของคุณ",
      icon: FileText,
      href: "/user/my-bookings",
      color: "bg-green-500 hover:bg-green-600",
      permission: "BOOKING_VIEW"
    },
    
  ]

  const menuItems = allMenuItems.filter(item => permissions.includes(item.permission))

  if (loading) {
     return <div className="min-h-screen bg-gray-100 flex items-center justify-center">กำลังโหลดข้อมูล...</div>
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">
            ผู้ใช้งาน Dashboard
          </h2>
          <p className="text-gray-600">
            จัดการการจองและใช้งานรถ
          </p>
        </div>

        {/* Menu Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {menuItems.map((item, index) => {
            const IconComponent = item.icon
            return (
              <div
                key={index}
                onClick={() => router.push(item.href)}
                className={`${item.color} text-white rounded-lg p-8 cursor-pointer transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl`}
              >
                <div className="flex items-start mb-4">
                  <div className="p-3 bg-white/20 rounded-lg mr-4">
                    <IconComponent className="w-8 h-8" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold">{item.title}</h3>
                  </div>
                </div>
                <p className="text-white/90 leading-relaxed">
                  {item.description}
                </p>
              </div>
            )
          })}
          {menuItems.length === 0 && (
            <div className="col-span-full text-center py-12 bg-white rounded-xl shadow-sm border border-gray-200">
              <Shield className="mx-auto h-12 w-12 text-gray-400 mb-3" />
              <h3 className="text-lg font-medium text-gray-900">ไม่พบเมนูที่สามารถเข้าถึงได้</h3>
              <p className="mt-1 text-gray-500">คุณยังไม่ได้รับสิทธิ์ในการเข้าถึงเมนูใดๆ ในส่วนนี้</p>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}