"use client"

import { useRouter } from "next/navigation"

export default function ApproverPage() {
  const router = useRouter()
  
  const menuItems = [
    {
      title: "อนุมัติการจอง",
      description: "พิจารณาคำขออนุมัติการจองรถ",
      icon: "✅",
      href: "/approver/approve",
      color: "bg-blue-500 hover:bg-blue-600",
      count: "pending"
    },
    {
      title: "ประวัติการอนุมัติ",
      description: "ดูประวัติการอนุมัติทั้งหมด",
      icon: "📋",
      href: "/approver/history",
      color: "bg-green-500 hover:bg-green-600"
    },
    {
      title: "รายงานการใช้รถ",
      description: "สถิติและรายงานการใช้รถ",
      icon: "📊",
      href: "/approver/reports",
      color: "bg-purple-500 hover:bg-purple-600"
    },
  ]

  return (
    <div className="min-h-screen bg-gray-100">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">
            ผู้อนุมัติ Dashboard
          </h2>
          <p className="text-gray-600">
            จัดการและอนุมัติการจองรถ
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
                <div>
                  <h3 className="text-xl font-semibold">{item.title}</h3>
                  {item.count === "pending" && (
                    <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-red-100 text-red-800 rounded-full mt-1">
                      รอการอนุมัติ
                    </span>
                  )}
                </div>
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