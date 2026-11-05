"use client"

import { useEffect, useState } from "react"
import api from "@/lib/api"
import RoleDashboard, { DashboardLoading } from "@/app/component/role-dashboard"
import { getRoleMenu } from "@/app/component/role-menus"

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

  if (loading) {
     return <DashboardLoading />
  }

  return (
    <RoleDashboard
      title="หน้าหลัก"
      description="จองรถ ตรวจการจองของคุณ และแจ้งซ่อมบำรุงเมื่อพบปัญหา"
      items={getRoleMenu("USER", permissions)}
    />
  )
}
