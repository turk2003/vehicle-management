"use client";

import { Users, Car, Calendar, Wrench, BarChart3, Shield } from "lucide-react";
import { useEffect, useState } from "react";
import api from "@/lib/api";
import RoleDashboard, {
  DashboardLoading,
  type DashboardMenuItem,
} from "@/app/component/role-dashboard";

export default function AdminPage() {
  const [permissions, setPermissions] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMe = async () => {
      try {
        const res = await api.get("/api/auth/me");
        setPermissions(res.data.permissions || []);
      } catch (error) {
        console.error("Failed to load permissions", error);
      } finally {
        setLoading(false);
      }
    };
    fetchMe();
  }, []);

  const allMenuItems: DashboardMenuItem[] = [
    {
      title: "จัดการผู้ใช้",
      description: "เพิ่ม แก้ไข ลบผู้ใช้ในระบบ",
      icon: Users,
      href: "/admin/users",
      tone: "blue",
      permission: "USER_MANAGE",
    },
    {
      title: "จัดการรถ",
      description: "เพิ่ม แก้ไข ลบข้อมูลรถและประเภทรถ",
      icon: Car,
      href: "/admin/vehicles",
      tone: "green",
      permission: "VEHICLE_VIEW",
    },
    {
      title: "จัดการการจอง",
      description: "ดูและจัดการคำขอจองรถทั้งหมด",
      icon: Calendar,
      href: "/admin/bookings",
      tone: "indigo",
      permission: "BOOKING_VIEW",
    },
    {
      title: "จัดการการซ่อมบำรุง",
      description: "ติดตามและจัดการการซ่อมบำรุงรถ",
      icon: Wrench,
      href: "/admin/maintenance",
      tone: "orange",
      permission: "MAINTENANCE_VIEW",
    },
    {
      title: "ประวัติการใช้งานรถ",
      description: "ดูประวัติการใช้งาน ไมล์ และการซ่อมรายคัน",
      icon: BarChart3,
      href: "/admin/vehicle-history",
      tone: "teal",
      permission: "REPORT_VIEW",
    },
    {
      title: "จัดการสิทธิ์",
      description: "กำหนดสิทธิ์การใช้งานของแต่ละบทบาท",
      icon: Shield,
      href: "/admin/permissions",
      tone: "indigo",
      permission: "PERMISSION_MANAGE",
    },
  ];

  const menuItems = allMenuItems.filter((item) =>
    permissions.includes(item.permission),
  );

  if (loading) {
    return <DashboardLoading />;
  }

  return (
    <RoleDashboard
      title="ผู้ดูแลระบบ Dashboard"
      description="จัดการผู้ใช้ รถ การจอง การซ่อมบำรุง รายงาน และสิทธิ์การใช้งานจากศูนย์ควบคุมเดียว"
      items={menuItems}
    />
  );
}
