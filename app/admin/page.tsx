"use client"

import { useRouter } from "next/navigation"
import { useState, useEffect } from "react"

export default function AdminPage() {
  const router = useRouter()
  const menuItems = [
    {
      title: "จัดการผู้ใช้",
      description: "เพิ่ม แก้ไข ลบผู้ใช้ในระบบ",
      icon: "👥",
      href: "/admin/users",
      color: "bg-blue-500 hover:bg-blue-600"
    },
    {
      title: "จัดการรถ",
      description: "เพิ่ม แก้ไข ลบข้อมูลรถและประเภทรถ",
      icon: "🚗",
      href: "/admin/vehicles",
      color: "bg-green-500 hover:bg-green-600"
    },
    {
      title: "จัดการการจอง",
      description: "ดูและจัดการคำขอจองรถทั้งหมด",
      icon: "📅",
      href: "/admin/bookings",
      color: "bg-purple-500 hover:bg-purple-600"
    },
    {
      title: "จัดการการซ่อมบำรุง",
      description: "ติดตามและจัดการการซ่อมบำรุงรถ",
      icon: "🔧",
      href: "/admin/maintenance",
      color: "bg-orange-500 hover:bg-orange-600"
    },
    {
      title: "รายงานและสถิติ",
      description: "ดูรายงานการใช้งานและสถิติต่างๆ",
      icon: "📊",
      href: "/admin/reports",
      color: "bg-pink-500 hover:bg-pink-600"
    },
    {
      title: "ตั้งค่าระบบ",
      description: "จัดการการตั้งค่าระบบทั่วไป",
      icon: "⚙️",
      href: "/admin/settings",
      color: "bg-gray-500 hover:bg-gray-600"
    }
  ]

  return (
    <div className="min-h-screen bg-gray-100">
      

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            เมนูการจัดการ
          </h2>
          <p className="text-gray-600">
            เลือกหมวดหมู่ที่ต้องการจัดการ
          </p>
        </div>

        {/* Menu Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {menuItems.map((item, index) => (
            <div
              key={index}
              onClick={() => router.push(item.href)}
              className={`${item.color} text-white rounded-lg p-6 cursor-pointer transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl`}
            >
              <div className="flex items-center mb-4">
                <span className="text-3xl mr-3">{item.icon}</span>
                <h3 className="text-xl font-semibold">{item.title}</h3>
              </div>
              <p className="text-white/90 leading-relaxed">
                {item.description}
              </p>
            </div>
          ))}
        </div>

        
       
      </main>
    </div>
  )
}