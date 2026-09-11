"use client"

import { Car, FileText, Wrench } from "lucide-react"
import { useEffect, useState } from "react"
import api from "@/lib/api"
import RoleDashboard, {
  DashboardLoading,
  type DashboardMenuItem,
} from "@/app/component/role-dashboard"

export default function UserPage() {
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
  
  const allMenuItems: DashboardMenuItem[] = [
    {
      title: "จองรถ",
      description: "เลือกรถและวันเวลาที่ต้องการใช้",
      icon: Car,
      href: "/user/booking",
      tone: "blue",
      permission: "BOOKING_CREATE"
    },
    {
      title: "การจองของฉัน",
      description: "ดูการจองของคุณ",
      icon: FileText,
      href: "/user/my-bookings",
      tone: "green",
      permission: "BOOKING_VIEW"
    },
    {
      title: "แจ้งซ่อมบำรุง",
      description: "แจ้งปัญหารถเสียและติดตามสถานะ",
      icon: Wrench,
      href: "/user/maintenance",
      tone: "orange",
      permission: "MAINTENANCE_VIEW"
    },
    
  ]

  const menuItems = allMenuItems.filter(item => permissions.includes(item.permission))

  if (loading) {
     return <DashboardLoading />
  }

  return (
    <RoleDashboard
      title="ผู้ใช้งาน Dashboard"
      description="จองรถ ตรวจการจองของคุณ และแจ้งซ่อมบำรุงเมื่อพบปัญหา"
      items={menuItems}
    />
  )
}
