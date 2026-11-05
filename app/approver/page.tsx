"use client"

import { useEffect, useState } from "react"
import api from "@/lib/api"
import RoleDashboard, { DashboardLoading } from "@/app/component/role-dashboard"
import { getRoleMenu } from "@/app/component/role-menus"

export default function ApproverPage() {
  const [permissions, setPermissions] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [pendingCount, setPendingCount] = useState(0)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const authRes = await api.get("/api/auth/me")
        const loadedPermissions = authRes.data.permissions || []
        setPermissions(loadedPermissions)

        if (loadedPermissions.includes("BOOKING_APPROVE")) {
          const pendingRes = await api.get("/api/approver?status=PENDING")
          setPendingCount(pendingRes.data.length || 0)
        } else {
          setPendingCount(0)
        }
      } catch (error) {
        console.error("Failed to load data", error)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])
  
  const menuItems = getRoleMenu("APPROVER", permissions).map((item) =>
    item.href === "/approver/approve" && pendingCount > 0
      ? { ...item, badge: `${pendingCount} รายการรออนุมัติ` }
      : item,
  )

  if (loading) {
     return <DashboardLoading />
  }

  return (
    <RoleDashboard
      title="หน้าหลักผู้อนุมัติ"
      description="ตรวจคำขออนุมัติและดูประวัติการตัดสินใจเกี่ยวกับการจองรถ"
      items={menuItems}
    />
  )
}
