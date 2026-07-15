"use client"

import { CheckCircle, FileText } from "lucide-react"
import { useEffect, useState } from "react"
import api from "@/lib/api"
import RoleDashboard, {
  DashboardLoading,
  type DashboardMenuItem,
} from "@/app/component/role-dashboard"

export default function ApproverPage() {
  const [permissions, setPermissions] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [pendingCount, setPendingCount] = useState(0)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [authRes, pendingRes] = await Promise.all([
          api.get("/api/auth/me"),
          api.get("/api/approver?status=PENDING")
        ])
        setPermissions(authRes.data.permissions || [])
        setPendingCount(pendingRes.data.length || 0)
      } catch (error) {
        console.error("Failed to load data", error)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])
  
  const allMenuItems: DashboardMenuItem[] = [
    {
      title: "อนุมัติการจอง",
      description: "พิจารณาคำขออนุมัติการจองรถ",
      icon: CheckCircle,
      href: "/approver/approve",
      tone: "blue",
      badge: pendingCount > 0 ? `${pendingCount} รายการรออนุมัติ` : undefined,
      permission: "BOOKING_APPROVE"
    },
    {
      title: "ประวัติการอนุมัติ",
      description: "ดูประวัติการอนุมัติทั้งหมด",
      icon: FileText,
      href: "/approver/history",
      tone: "green",
      permission: "BOOKING_VIEW"
    },
   
  ]

  const menuItems = allMenuItems.filter(item => permissions.includes(item.permission))

  if (loading) {
     return <DashboardLoading />
  }

  return (
    <RoleDashboard
      title="ผู้อนุมัติ Dashboard"
      description="ตรวจคำขออนุมัติและดูประวัติการตัดสินใจเกี่ยวกับการจองรถ"
      items={menuItems}
    />
  )
}
