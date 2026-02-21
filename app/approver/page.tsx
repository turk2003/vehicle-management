"use client"

import { useRouter } from "next/navigation"
import { CheckCircle, FileText, BarChart3 } from "lucide-react"

export default function ApproverPage() {
  const router = useRouter()
  
  const menuItems = [
    {
      title: "อนุมัติการจอง",
      description: "พิจารณาคำขออนุมัติการจองรถ",
      icon: CheckCircle,
      href: "/approver/approve",
      color: "bg-blue-500 hover:bg-blue-600",
      count: "pending"
    },
    {
      title: "ประวัติการอนุมัติ",
      description: "ดูประวัติการอนุมัติทั้งหมด",
      icon: FileText,
      href: "/approver/history",
      color: "bg-green-500 hover:bg-green-600"
    },
    {
      title: "รายงานการใช้รถ",
      description: "สถิติและรายงานการใช้รถ",
      icon: BarChart3,
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
                    <h3 className="text-xl font-semibold mb-1">{item.title}</h3>
                    {item.count === "pending" && (
                      <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-red-100 text-red-800 rounded-full">
                        รอการอนุมัติ
                      </span>
                    )}
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