"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import RoleDashboard, { DashboardLoading } from "@/app/component/role-dashboard";
import { getRoleMenu } from "@/app/component/role-menus";

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

  if (loading) {
    return <DashboardLoading />;
  }

  return (
    <RoleDashboard
      title="หน้าหลักผู้ดูแลระบบ"
      description="จัดการการจอง รถ การซ่อมบำรุง ผู้ใช้ และสิทธิ์การใช้งาน"
      items={getRoleMenu("ADMIN", permissions)}
    />
  );
}
