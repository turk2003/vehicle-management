import type { LucideIcon } from "lucide-react"
import {
  BarChart3,
  Calendar,
  CalendarDays,
  Car,
  CheckCircle,
  FileText,
  Shield,
  Users,
  Wrench,
} from "lucide-react"

export interface RoleMenuItem {
  title: string
  /** Short label for the top navigation bar. */
  navLabel: string
  description: string
  href: string
  icon: LucideIcon
  tone: "blue" | "green" | "indigo" | "orange" | "teal" | "red"
  permission?: string
}

const CALENDAR_ITEM: RoleMenuItem = {
  title: "ปฏิทินการใช้รถ",
  navLabel: "ปฏิทิน",
  description: "ดูตารางจองรายวันและผู้ถือรถปัจจุบัน",
  icon: CalendarDays,
  href: "/calendar",
  tone: "blue",
}

const ROLE_MENUS: Record<string, RoleMenuItem[]> = {
  ADMIN: [
    CALENDAR_ITEM,
    {
      title: "จัดการการจอง",
      navLabel: "การจอง",
      description: "ดูและจัดการคำขอจองรถทั้งหมด",
      icon: Calendar,
      href: "/admin/bookings",
      tone: "indigo",
      permission: "BOOKING_VIEW",
    },
    {
      title: "จัดการรถ",
      navLabel: "รถ",
      description: "เพิ่ม แก้ไข ลบข้อมูลรถและประเภทรถ",
      icon: Car,
      href: "/admin/vehicles",
      tone: "green",
      permission: "VEHICLE_VIEW",
    },
    {
      title: "จัดการการซ่อมบำรุง",
      navLabel: "ซ่อมบำรุง",
      description: "ติดตามและจัดการการซ่อมบำรุง",
      icon: Wrench,
      href: "/admin/maintenance",
      tone: "orange",
      permission: "MAINTENANCE_VIEW",
    },
    {
      title: "ประวัติการใช้งานรถ",
      navLabel: "ประวัติรถ",
      description: "ดูประวัติการใช้งาน ไมล์ และการซ่อมของรถแต่ละคัน",
      icon: BarChart3,
      href: "/admin/vehicle-history",
      tone: "teal",
      permission: "REPORT_VIEW",
    },
    {
      title: "จัดการผู้ใช้",
      navLabel: "ผู้ใช้",
      description: "เพิ่ม แก้ไข ลบผู้ใช้ในระบบ",
      icon: Users,
      href: "/admin/users",
      tone: "blue",
      permission: "USER_MANAGE",
    },
    {
      title: "จัดการสิทธิ์",
      navLabel: "สิทธิ์",
      description: "กำหนดสิทธิ์การเข้าถึงของแต่ละบทบาท",
      icon: Shield,
      href: "/admin/permissions",
      tone: "indigo",
      permission: "PERMISSION_MANAGE",
    },
  ],
  APPROVER: [
    {
      title: "อนุมัติการจอง",
      navLabel: "อนุมัติการจอง",
      description: "พิจารณาคำขออนุมัติการจองรถ",
      icon: CheckCircle,
      href: "/approver/approve",
      tone: "blue",
      permission: "BOOKING_APPROVE",
    },
    {
      title: "ประวัติการอนุมัติ",
      navLabel: "ประวัติการอนุมัติ",
      description: "ดูประวัติการอนุมัติทั้งหมด",
      icon: FileText,
      href: "/approver/history",
      tone: "green",
      permission: "BOOKING_VIEW",
    },
    CALENDAR_ITEM,
  ],
  USER: [
    {
      title: "จองรถ",
      navLabel: "จองรถ",
      description: "เลือกรถและวันเวลาที่ต้องการใช้",
      icon: Car,
      href: "/user/booking",
      tone: "blue",
      permission: "BOOKING_CREATE",
    },
    {
      title: "การจองของฉัน",
      navLabel: "การจองของฉัน",
      description: "ดูสถานะ แก้ไข และบันทึกรับหรือคืนรถ",
      icon: FileText,
      href: "/user/my-bookings",
      tone: "green",
      permission: "BOOKING_VIEW",
    },
    {
      title: "แจ้งซ่อมบำรุง",
      navLabel: "แจ้งซ่อม",
      description: "แจ้งปัญหารถเสียและติดตามสถานะ",
      icon: Wrench,
      href: "/user/maintenance",
      tone: "orange",
      permission: "MAINTENANCE_VIEW",
    },
    CALENDAR_ITEM,
  ],
}

export function getRoleHome(role: string): string {
  if (role === "ADMIN") return "/admin"
  if (role === "APPROVER") return "/approver"
  return "/user"
}

export function getRoleMenu(role: string, permissions: string[]): RoleMenuItem[] {
  return (ROLE_MENUS[role] ?? ROLE_MENUS.USER).filter(
    (item) => !item.permission || permissions.includes(item.permission),
  )
}
