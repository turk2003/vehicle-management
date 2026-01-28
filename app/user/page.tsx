"use client"

import { useRouter } from "next/navigation"
import { useState, useEffect } from "react"

export default function UserDashboard() {
  const router = useRouter()
  
  const menuItems = [
    {
      title: "จองรถ",
      description: "เลือกรถและวันเวลาที่ต้องการใช้",
      icon: "🚗",
      href: "/user/booking",
      color: "bg-blue-500 hover:bg-blue-600"
    },
    {
      title: "ประวัติการจอง",
      description: "ดูประวัติการจองรถของคุณ",
      icon: "📋",
      href: "/user/my-bookings",
      color: "bg-green-500 hover:bg-green-600"
    },
    {
      title: "แจ้งปัญหา",
      description: "แจ้งปัญหาหรือขอซ่อมบำรุงรถ",
      icon: "🔧",
      href: "/user/maintenance",
      color: "bg-orange-500 hover:bg-orange-600"
    },
    {
      title: "โปรไฟล์",
      description: "จัดการข้อมูลส่วนตัว",
      icon: "👤",
      href: "/user/profile",
      color: "bg-purple-500 hover:bg-purple-600"
    }
  ]

  return (
    <div className="min-h-screen bg-gray-100">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">
            ยินดีต้อนรับ
          </h2>
          <p className="text-gray-600">
            เลือกบริการที่ต้องการใช้งาน
          </p>
        </div>

        {/* Menu Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
          {menuItems.map((item, index) => (
            <div
              key={index}
              onClick={() => router.push(item.href)}
              className={`${item.color} text-white rounded-lg p-8 cursor-pointer transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl`}
            >
              <div className="flex items-center mb-4">
                <span className="text-4xl mr-4">{item.icon}</span>
                <h3 className="text-xl font-semibold">{item.title}</h3>
              </div>
              <p className="text-white/90 leading-relaxed text-lg">
                {item.description}
              </p>
            </div>
          ))}
        </div>
      </main>
    </div>
  )
}