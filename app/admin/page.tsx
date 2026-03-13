"use client"

import { useRouter } from "next/navigation"
import { Users, Car, Calendar, Wrench, BarChart3, Shield } from "lucide-react"
import { useEffect, useState } from "react"
import api from "@/lib/api"

export default function AdminPage() {
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
      title: "จัดการผู้ใช้",
      description: "เพิ่ม แก้ไข ลบผู้ใช้ในระบบ",
      icon: Users,
      href: "/admin/users",
      color: "bg-blue-500 hover:bg-blue-600",
      permission: "USER_MANAGE"
    },
    {
      title: "จัดการรถ",
      description: "เพิ่ม แก้ไข ลบข้อมูลรถและประเภทรถ",
      icon: Car,
      href: "/admin/vehicles",
      color: "bg-green-500 hover:bg-green-600",
      permission: "VEHICLE_MANAGE"
    },
    {
      title: "จัดการการจอง",
      description: "ดูและจัดการคำขอจองรถทั้งหมด",
      icon: Calendar,
      href: "/admin/bookings",
      color: "bg-purple-500 hover:bg-purple-600",
      permission: "BOOKING_DELETE"
    },
    {
      title: "จัดการการซ่อมบำรุง",
      description: "ติดตามและจัดการการซ่อมบำรุงรถ",
      icon: Wrench,
      href: "/admin/maintenance",
      color: "bg-orange-500 hover:bg-orange-600",
      permission: "MAINTENANCE_MANAGE"
    },
    {
      title: "รายงานและสถิติ",
      description: "ดูรายงานการใช้งานและสถิติต่างๆ",
      icon: BarChart3,
      href: "/admin/reports",
      color: "bg-pink-500 hover:bg-pink-600",
      permission: "REPORT_VIEW"
    },
    {
      title: "จัดการสิทธิ์",
      description: "กำหนดสิทธิ์การใช้งานของแต่ละบทบาท",
      icon: Shield,
      href: "/admin/permissions",
      color: "bg-indigo-500 hover:bg-indigo-600",
      permission: "ADMIN_ONLY_LOCKED"
    },
  ]

  const menuItems = allMenuItems.filter(item => 
    item.permission === "ADMIN_ONLY_LOCKED" || permissions.includes(item.permission)
  )

  if (loading) {
     return <div className="min-h-screen bg-gray-100 flex items-center justify-center">กำลังโหลดข้อมูล...</div>
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">
            ผู้ดูแลระบบ Dashboard
          </h2>
          <p className="text-gray-600">
            จัดการระบบและข้อมูลทั้งหมด
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