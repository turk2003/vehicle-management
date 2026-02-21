"use client"

import { useRouter } from "next/navigation"
import { Car, FileText, Wrench, User, Bell } from "lucide-react"

export default function UserPage() {
  const router = useRouter()
  
  const menuItems = [
    {
      title: "จองรถ",
      description: "เลือกรถและวันเวลาที่ต้องการใช้",
      icon: Car,
      href: "/user/booking",
      color: "bg-blue-500 hover:bg-blue-600"
    },
    {
      title: "ประวัติการจอง",
      description: "ดูประวัติการจองรถของคุณ",
      icon: FileText,
      href: "/user/my-bookings",
      color: "bg-green-500 hover:bg-green-600"
    },
    {
      title: "แจ้งซ่อมบำรุง",
      description: "แจ้งปัญหาหรือขอซ่อมบำรุงรถ",
      icon: Wrench,
      href: "/user/maintenance",
      color: "bg-orange-500 hover:bg-orange-600"
    },
    {
      title: "จัดการโปรไฟล์",
      description: "แก้ไขข้อมูลส่วนตัว",
      icon: User,
      href: "/user/profile",
      color: "bg-purple-500 hover:bg-purple-600"
    },
    {
      title: "การแจ้งเตือน",
      description: "ดูการแจ้งเตือนทั้งหมด",
      icon: Bell,
      href: "/user/notifications",
      color: "bg-pink-500 hover:bg-pink-600"
    },
  ]

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
        </div>
      </main>
    </div>
  )
}