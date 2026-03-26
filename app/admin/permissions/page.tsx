"use client"

import { useEffect, useState } from "react"
import { Shield, Save, X, CheckCircle, Lock, LayoutDashboard } from "lucide-react"
import api from "@/lib/api"

type PermissionMatrix = Record<string, Record<string, boolean>>

// จัดกลุ่มสิทธิ์ตามเมนูของแต่ละ Dashboard เพื่อให้เข้าใจง่ายเวลาปรับแต่ง
// เพิ่ม forRoles เพื่อบอกว่ากลุ่มเมนูนี้ ควรไปโผล่ที่ Tab ของ Role ไหนบ้าง
const MENU_GROUPS = [
  {
    groupName: "เมนูผู้ดูแลระบบ (Admin Dashboard)",
    forRoles: ["ADMIN"],
    items: [
      { id: "USER_MANAGE", title: "จัดการผู้ใช้", description: "เพิ่ม แก้ไข ลบผู้ใช้ในระบบ" },
      { id: "VEHICLE_MANAGE", title: "จัดการรถ", description: "เพิ่ม แก้ไข ลบข้อมูลรถและประเภทรถ" },
      { id: "BOOKING_DELETE", title: "จัดการการจอง", description: "ดูและจัดการคำขอจองรถทั้งหมด (ลบ/ยกเลิกได้)" },
      { id: "MAINTENANCE_MANAGE", title: "จัดการการซ่อมบำรุง", description: "ติดตามและจัดการบำรุงรักษารถ" },
    ]
  },
  {
    groupName: "เมนูผู้อนุมัติ (Approver Dashboard)",
    forRoles: ["APPROVER",],
    items: [
      { id: "BOOKING_APPROVE", title: "อนุมัติการจอง", description: "พิจารณาคำขออนุมัติการจองรถ" },
      { id: "BOOKING_VIEW", title: "ประวัติการจอง / การอนุมัติ", description: "ดูประวัติการจองและการอนุมัติของตนเอง" },
    ]
  },
  {
    groupName: "เมนูผู้ใช้งานทั่วไป (User Dashboard)",
    forRoles: ["USER",], // ทุก Role ควรมองเห็นเมนูพื้นฐานได้ หรือจะแก้ให้เฉพาะ USER ก็ได้ตามต้องการ
    items: [
      { id: "BOOKING_CREATE", title: "จองรถ", description: "เลือกรถและวันเวลาที่ต้องการใช้" },
      { id: "BOOKING_VIEW", title: "ประวัติการจอง / การอนุมัติ", description: "ดูประวัติการจองและการอนุมัติของตนเอง" },
    ]
  }
]

const ROLE_LABELS: Record<string, { label: string; color: string; activeBg: string; border: string }> = {
  ADMIN:    { label: "Admin",    color: "text-red-700", activeBg: "bg-red-50", border: "border-red-500" },
  APPROVER: { label: "Approver", color: "text-blue-700", activeBg: "bg-blue-50", border: "border-blue-500" },
  USER:     { label: "User",     color: "text-green-700", activeBg: "bg-green-50", border: "border-green-500" },
}

export default function AdminPermissionsPage() {
  const [permissions, setPermissions] = useState<PermissionMatrix>({})
  const [roles, setRoles] = useState<string[]>([])
  const [lockedAdminPermissions, setLockedAdminPermissions] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState<string | null>(null)
  const [success, setSuccess] = useState("")
  const [error, setError] = useState("")
  const [activeTab, setActiveTab] = useState<string>("USER")

  const fetchPermissions = async () => {
    try {
      setLoading(true)
      const res = await api.get("/api/admin/permissions")
      setPermissions(res.data.permissions)
      // Defaults to USER if available, else first role
      const loadedRoles = res.data.roles || []
      setRoles(loadedRoles)
      if (loadedRoles.includes("USER")) setActiveTab("USER")
      else if (loadedRoles.length > 0) setActiveTab(loadedRoles[0])
      
      setLockedAdminPermissions(res.data.lockedAdminPermissions || [])
    } catch {
      setError("ไม่สามารถโหลดข้อมูลได้")
    } finally {
      setLoading(false)
    }
  }

  const togglePermission = (role: string, permission: string) => {
    if (role === "ADMIN" && lockedAdminPermissions.includes(permission)) return

    setPermissions((prev) => ({
      ...prev,
      [role]: {
        ...prev[role],
        [permission]: !prev[role][permission],
      },
    }))
  }

  const saveRole = async (role: string) => {
    try {
      setSaving(role)
      setError("")
      const enabledPermissions = Object.entries(permissions[role] || {})
        .filter(([, enabled]) => enabled)
        .map(([perm]) => perm)

      await api.put("/api/admin/permissions", {
        role,
        permissions: enabledPermissions,
      })

      setSuccess(`บันทึกสิทธิ์ของ ${ROLE_LABELS[role]?.label || role} เรียบร้อยแล้ว`)
      setTimeout(() => setSuccess(""), 3000)
    } catch (err: any) {
      setError(err.response?.data?.message || "เกิดข้อผิดพลาด")
    } finally {
      setSaving(null)
    }
  }

  const isLocked = (role: string, permission: string) =>
    role === "ADMIN" && lockedAdminPermissions.includes(permission)

  useEffect(() => {
    fetchPermissions()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-500">กำลังโหลด...</p>
      </div>
    )
  }

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <div className="max-w-5xl mx-auto">

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Shield className="w-8 h-8 text-indigo-600" />
            <h1 className="text-3xl font-bold text-gray-900">จัดการสิทธิ์การใช้งาน (Permissions)</h1>
          </div>
          <p className="text-gray-600 ml-11">
            กำหนดการเข้าถึงเมนูต่างๆ ให้กับแต่ละบทบาท โดยแยกตามเมนูที่แสดงจริงในระบบ
          </p>
        </div>

        {/* Alerts */}
        {success && (
          <div className="bg-green-50 border border-green-300 text-green-700 px-4 py-3 rounded-lg mb-6 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5" />
              <span>{success}</span>
            </div>
            <button onClick={() => setSuccess("")}><X className="w-5 h-5" /></button>
          </div>
        )}
        {error && (
          <div className="bg-red-50 border border-red-300 text-red-700 px-4 py-3 rounded-lg mb-6 flex items-center justify-between">
            <span>{error}</span>
            <button onClick={() => setError("")}><X className="w-5 h-5" /></button>
          </div>
        )}

        {/* Role Tabs */}
        <div className="flex gap-2 mb-6 border-b border-gray-200">
          {roles.map((role) => {
            const isActive = activeTab === role
            const labelData = ROLE_LABELS[role]
            return (
              <button
                key={role}
                onClick={() => setActiveTab(role)}
                className={`
                  px-6 py-3 font-medium text-sm rounded-t-lg transition-colors flex items-center gap-2
                  ${isActive 
                    ? `${labelData?.activeBg || 'bg-gray-100'} ${labelData?.color || 'text-gray-900'} ${labelData?.border || 'border-gray-500'} border-t-2 border-x-2 border-b-0`
                    : "bg-white text-gray-500 border border-transparent hover:text-gray-700 hover:bg-gray-100"
                  }
                `}
              >
                <LayoutDashboard className="w-4 h-4" />
                บทบาท: {labelData?.label || role}
              </button>
            )
          })}
        </div>

        {/* Tab Content */}
        {roles.map((role) => {
          if (role !== activeTab) return null

          // กรองข้อมูลกลุ่มเมนู ให้แสดงเฉพาะกลุ่มที่มี forRoles ตรงกับ Role นี้
          const visibleGroups = MENU_GROUPS.filter(g => g.forRoles.includes(role))

          return (
            <div key={role} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-6">
              
              <div className="p-6 bg-gray-50 border-b border-gray-200 flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">
                    กำหนดสิทธิ์เมนูสำหรับ <span className={ROLE_LABELS[role]?.color}>{ROLE_LABELS[role]?.label || role}</span>
                  </h3>
                  <p className="text-sm text-gray-500 mt-1">
                    เปิด/ปิด สิทธิ์เพื่อมอบการเข้าถึงเมนูต่างๆ ให้แผงควบคุมของบทบาทนี้
                  </p>
                </div>
                <button
                  onClick={() => saveRole(role)}
                  disabled={saving === role}
                  className={`
                    flex items-center gap-2 px-5 py-2.5 text-sm font-medium rounded-lg transition-colors
                    ${saving === role
                      ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                      : "bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm"
                    }
                  `}
                >
                  <Save className="w-4 h-4" />
                  {saving === role ? "กำลังบันทึก..." : "บันทึกการเปลี่ยนแปลง"}
                </button>
              </div>

              <div className="p-0">
                {visibleGroups.length === 0 ? (
                  <div className="p-8 text-center text-gray-500">
                    ไม่มีเมนูสำหรับบทบาทนี้
                  </div>
                ) : (
                  visibleGroups.map((group, gIdx) => (
                    <div key={gIdx} className="border-b border-gray-100 last:border-0">
                      {/* Group Header */}
                      <div className="bg-indigo-50/40 px-6 py-3 border-y border-gray-100 first:border-t-0">
                        <h4 className="text-sm font-bold text-indigo-800 uppercase tracking-wider">
                          {group.groupName}
                        </h4>
                      </div>
                      
                      {/* Menu Items */}
                      <div className="divide-y divide-gray-50">
                        {group.items.map((item) => {
                          const isEnabled = permissions[role]?.[item.id] ?? false
                          const locked = isLocked(role, item.id)

                          return (
                            <div 
                              key={item.id} 
                              className={`flex items-center justify-between px-6 py-4 transition-colors ${locked ? 'bg-gray-50/50' : 'hover:bg-gray-50'}`}
                            >
                              <div className="flex-1 pr-4">
                                <div className="flex items-center gap-2">
                                  <span className={`font-semibold ${isEnabled ? 'text-gray-900' : 'text-gray-500'}`}>
                                    {item.title}
                                  </span>
                                  {locked && (
                                    <span className="inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full bg-gray-200 text-gray-600">
                                      <Lock className="w-3 h-3" /> ล็อก
                                    </span>
                                  )}
                                </div>
                                <p className="text-sm text-gray-500 mt-0.5">{item.description}</p>
                              </div>
                              
                              <div className="flex items-center">
                                <button
                                  onClick={() => togglePermission(role, item.id)}
                                  disabled={locked}
                                  className={`
                                    relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent 
                                    transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2
                                    ${locked ? 'opacity-50 cursor-not-allowed' : ''}
                                    ${isEnabled ? 'bg-indigo-600' : 'bg-gray-200'}
                                  `}
                                  role="switch"
                                  aria-checked={isEnabled}
                                  title={locked ? "ไม่สามารถแก้ไขสิทธิ์นี้ได้" : `สลับสถานะ ${item.title}`}
                                >
                                  <span
                                    aria-hidden="true"
                                    className={`
                                      pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 
                                      transition duration-200 ease-in-out
                                      ${isEnabled ? 'translate-x-5' : 'translate-x-0'}
                                    `}
                                  />
                                </button>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  ))
                )}
              </div>

            </div>
          )
        })}

        

      </div>
    </div>
  )
}
