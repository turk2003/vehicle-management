"use client";

import axios from "axios";
import { useEffect, useMemo, useState } from "react";
import {
  CheckCircle,
  LayoutDashboard,
  Lock,
  Save,
  Shield,
  X,
} from "lucide-react";
import api from "@/lib/api";

type PermissionMatrix = Record<string, Record<string, boolean>>;

type PermissionItem = {
  id: string;
  title: string;
  description: string;
};

type MenuGroup = {
  groupName: string;
  forRoles: string[];
  items: PermissionItem[];
};

type PermissionsResponse = {
  permissions: PermissionMatrix;
  roles: string[];
  lockedAdminPermissions?: string[];
};

type RoleMeta = {
  label: string;
  description: string;
  tone: string;
};

const menuGroups: MenuGroup[] = [
  {
    groupName: "เมนูผู้ดูแลระบบ",
    forRoles: ["ADMIN"],
    items: [
      {
        id: "USER_MANAGE",
        title: "จัดการผู้ใช้",
        description: "เพิ่ม แก้ไข และลบผู้ใช้ในระบบ",
      },
      {
        id: "VEHICLE_MANAGE",
        title: "จัดการรถ",
        description: "เพิ่ม แก้ไข และลบข้อมูลรถหรือประเภทรถ",
      },
      {
        id: "BOOKING_VIEW",
        title: "ดูการจองทั้งหมด",
        description: "เปิดหน้าจัดการและดูคำขอจองรถทั้งหมด",
      },
      {
        id: "BOOKING_MANAGE",
        title: "ดำเนินการการจอง",
        description: "เปลี่ยนสถานะ เปลี่ยนรถ และบันทึกรับหรือคืนรถแทนผู้ใช้",
      },
      {
        id: "BOOKING_DELETE",
        title: "ลบการจอง",
        description: "ลบรายการจองออกจากระบบอย่างถาวร",
      },
      {
        id: "MAINTENANCE_VIEW",
        title: "ดูงานซ่อมบำรุง",
        description: "เปิดหน้าและดูประวัติงานซ่อมทั้งหมด",
      },
      {
        id: "MAINTENANCE_MANAGE",
        title: "จัดการการซ่อมบำรุง",
        description: "เพิ่ม แก้ไข ปิด และลบงานซ่อมบำรุง",
      },
      {
        id: "REPORT_VIEW",
        title: "ดูรายงานและบทสรุป AI",
        description: "ดูประวัติการใช้รถ KPI และเรียกบทสรุปจาก AI",
      },
      {
        id: "PERMISSION_MANAGE",
        title: "จัดการสิทธิ์",
        description: "กำหนด Permission Matrix ของทุกบทบาท",
      },
    ],
  },
  {
    groupName: "เมนูผู้อนุมัติ",
    forRoles: ["APPROVER"],
    items: [
      {
        id: "BOOKING_APPROVE",
        title: "อนุมัติการจอง",
        description: "พิจารณาและอนุมัติคำขอจองรถ",
      },
      {
        id: "BOOKING_VIEW",
        title: "ประวัติการจอง / การอนุมัติ",
        description: "ดูประวัติการจองและการอนุมัติของตนเอง",
      },
      {
        id: "VEHICLE_VIEW",
        title: "ดูข้อมูลรถ",
        description: "ดูข้อมูลรถที่เกี่ยวข้องกับคำขออนุมัติ",
      },
    ],
  },
  {
    groupName: "เมนูผู้ใช้งานทั่วไป",
    forRoles: ["USER"],
    items: [
      {
        id: "BOOKING_CREATE",
        title: "จองรถ",
        description: "เลือกรถและช่วงเวลาที่ต้องการใช้งาน",
      },
      {
        id: "BOOKING_VIEW",
        title: "ประวัติการจอง / การอนุมัติ",
        description: "ดูประวัติการจองและสถานะคำขอของตนเอง",
      },
      {
        id: "VEHICLE_VIEW",
        title: "ดูข้อมูลรถ",
        description: "ดูรถและประเภทรถที่เปิดให้จอง",
      },
      {
        id: "MAINTENANCE_VIEW",
        title: "ดูรายการแจ้งซ่อม",
        description: "ดูประวัติการแจ้งซ่อมของตนเอง",
      },
      {
        id: "MAINTENANCE_REPORT",
        title: "แจ้งซ่อม",
        description: "สร้างรายการแจ้งปัญหารถและส่งให้ผู้ดูแลระบบ",
      },
    ],
  },
];

const roleMeta: Record<string, RoleMeta> = {
  ADMIN: {
    label: "Admin",
    description: "ดูแลข้อมูลหลัก รถ ผู้ใช้ การจอง และงานซ่อม",
    tone: "bg-rose-50 text-rose-700 ring-rose-200",
  },
  APPROVER: {
    label: "Approver",
    description: "ตรวจคำขอและอนุมัติการจองรถ",
    tone: "bg-blue-50 text-blue-700 ring-blue-200",
  },
  USER: {
    label: "User",
    description: "จองรถและติดตามประวัติของตนเอง",
    tone: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  },
};

const getApiErrorMessage = (error: unknown, fallback: string) => {
  if (axios.isAxiosError<{ message?: string }>(error)) {
    return error.response?.data?.message || fallback;
  }

  return fallback;
};

const getRoleLabel = (role: string) => roleMeta[role]?.label || role;

export default function AdminPermissionsPage() {
  const [permissions, setPermissions] = useState<PermissionMatrix>({});
  const [roles, setRoles] = useState<string[]>([]);
  const [lockedAdminPermissions, setLockedAdminPermissions] = useState<
    string[]
  >([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState<string | null>(null);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState<string>("USER");

  const activeGroups = useMemo(
    () => menuGroups.filter((group) => group.forRoles.includes(activeTab)),
    [activeTab],
  );

  const isLocked = (role: string, permission: string) => {
    return role === "ADMIN" && lockedAdminPermissions.includes(permission);
  };

  const fetchPermissions = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get<PermissionsResponse>(
        "/api/admin/permissions",
      );
      const loadedRoles = response.data.roles || [];

      setPermissions(response.data.permissions || {});
      setRoles(loadedRoles);
      setLockedAdminPermissions(response.data.lockedAdminPermissions || []);

      if (loadedRoles.includes("USER")) setActiveTab("USER");
      else if (loadedRoles.length > 0) setActiveTab(loadedRoles[0]);
    } catch (err) {
      setError(getApiErrorMessage(err, "ไม่สามารถโหลดข้อมูลสิทธิ์ได้"));
    } finally {
      setLoading(false);
    }
  };

  const togglePermission = (role: string, permission: string) => {
    if (isLocked(role, permission)) return;

    setPermissions((prev) => ({
      ...prev,
      [role]: {
        ...prev[role],
        [permission]: !(prev[role]?.[permission] ?? false),
      },
    }));
  };

  const saveRole = async (role: string) => {
    try {
      setSaving(role);
      setError("");

      const enabledPermissions = Object.entries(permissions[role] || {})
        .filter(([, enabled]) => enabled)
        .map(([permission]) => permission);

      await api.put("/api/admin/permissions", {
        role,
        permissions: enabledPermissions,
      });

      setSuccess(`บันทึกสิทธิ์ของ ${getRoleLabel(role)} เรียบร้อยแล้ว`);
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(getApiErrorMessage(err, "เกิดข้อผิดพลาดขณะบันทึกสิทธิ์"));
    } finally {
      setSaving(null);
    }
  };

  useEffect(() => {
    fetchPermissions();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 px-4 py-6 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl space-y-4">
          <div className="h-32 rounded-xl bg-white shadow-sm ring-1 ring-slate-200" />
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="h-20 rounded-xl bg-white shadow-sm ring-1 ring-slate-200" />
            <div className="h-20 rounded-xl bg-white shadow-sm ring-1 ring-slate-200" />
            <div className="h-20 rounded-xl bg-white shadow-sm ring-1 ring-slate-200" />
          </div>
          <div className="h-80 rounded-xl bg-white shadow-sm ring-1 ring-slate-200" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-6 text-slate-900 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl space-y-6">
        <section className="rounded-xl bg-white p-5 shadow-sm ring-1 ring-slate-200 sm:p-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 rounded-full bg-orange-50 px-3 py-1 text-xs font-semibold text-orange-700 ring-1 ring-orange-100">
                <Shield className="h-3.5 w-3.5" />
                ศูนย์ควบคุมสิทธิ์
              </div>
              <div>
                <h1 className="text-2xl font-semibold tracking-tight text-slate-950 sm:text-3xl">
                  จัดการสิทธิ์การใช้งาน
                </h1>
                <p className="mt-1 max-w-3xl text-sm text-slate-600">
                  กำหนดเมนูที่แต่ละบทบาทเข้าถึงได้
                  โดยยึดตามหน้าที่จริงของพนักงานจองรถ ผู้อนุมัติ และผู้ดูแลระบบ
                </p>
              </div>
            </div>
            <div className="rounded-lg bg-slate-50 px-4 py-3 text-sm text-slate-600 ring-1 ring-slate-200">
              <span className="font-medium text-slate-900">บทบาทที่เลือก:</span>{" "}
              {getRoleLabel(activeTab)}
            </div>
          </div>
        </section>

        {success && (
          <div className="flex items-start justify-between gap-3 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 flex-none" />
              <span>{success}</span>
            </div>
            <button
              type="button"
              onClick={() => setSuccess("")}
              className="rounded-md p-1 text-emerald-700 transition hover:bg-emerald-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              aria-label="ปิดข้อความสำเร็จ"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        {error && (
          <div className="flex items-start justify-between gap-3 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">
            <span>{error}</span>
            <button
              type="button"
              onClick={() => setError("")}
              className="rounded-md p-1 text-rose-700 transition hover:bg-rose-100 focus:outline-none focus:ring-2 focus:ring-rose-500"
              aria-label="ปิดข้อความผิดพลาด"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        <section className="grid grid-cols-1 gap-3 md:grid-cols-3">
          {roles.map((role) => {
            const meta = roleMeta[role];
            const isActive = activeTab === role;
            return (
              <button
                key={role}
                type="button"
                onClick={() => setActiveTab(role)}
                className={`rounded-xl bg-white p-4 text-left shadow-sm ring-1 transition hover:-translate-y-0.5 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-orange-500 ${
                  isActive ? "ring-2 ring-orange-300" : "ring-slate-200"
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-slate-950">
                      บทบาท: {getRoleLabel(role)}
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                      {meta?.description || "บทบาทในระบบ"}
                    </p>
                  </div>
                </div>
              </button>
            );
          })}
        </section>

        <section className="overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-slate-200">
          <div className="flex flex-col gap-4 border-b border-slate-200 px-5 py-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-start gap-3">
              <div className="rounded-lg bg-orange-50 p-2 text-orange-700">
                <LayoutDashboard className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-base font-semibold text-slate-950">
                  กำหนดสิทธิ์สำหรับ {getRoleLabel(activeTab)}
                </h2>
              </div>
            </div>
            <button
              type="button"
              onClick={() => saveRole(activeTab)}
              disabled={saving === activeTab || !activeTab}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-orange-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Save className="h-4 w-4" />
              {saving === activeTab ? "กำลังบันทึก..." : "บันทึกการเปลี่ยนแปลง"}
            </button>
          </div>

          {roles.length === 0 ? (
            <div className="px-5 py-12 text-center">
              <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-500">
                <Shield className="h-5 w-5" />
              </div>
              <p className="mt-3 text-sm font-semibold text-slate-900">
                ยังไม่มีบทบาทให้จัดการ
              </p>
              <p className="mt-1 text-sm text-slate-500">
                ตรวจสอบข้อมูลบทบาทในระบบก่อนกำหนดสิทธิ์
              </p>
            </div>
          ) : activeGroups.length === 0 ? (
            <div className="px-5 py-12 text-center text-sm text-slate-500">
              ไม่มีเมนูสำหรับบทบาทนี้
            </div>
          ) : (
            <div className="divide-y divide-slate-200">
              {activeGroups.map((group) => (
                <div key={group.groupName}>
                  <div className="bg-slate-50 px-5 py-3">
                    <h3 className="text-sm font-semibold text-slate-900">
                      {group.groupName}
                    </h3>
                  </div>
                  <div className="divide-y divide-slate-100">
                    {group.items.map((item) => {
                      const isEnabled =
                        permissions[activeTab]?.[item.id] ?? false;
                      const locked = isLocked(activeTab, item.id);

                      return (
                        <div
                          key={item.id}
                          className={`flex flex-col gap-3 px-5 py-4 transition sm:flex-row sm:items-center sm:justify-between ${
                            locked ? "bg-slate-50/70" : "hover:bg-slate-50"
                          }`}
                        >
                          <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <p
                                className={`text-sm font-semibold ${isEnabled ? "text-slate-950" : "text-slate-500"}`}
                              >
                                {item.title}
                              </p>
                              {locked && (
                                <span className="inline-flex items-center gap-1 rounded-full bg-slate-200 px-2 py-0.5 text-xs font-medium text-slate-700">
                                  <Lock className="h-3 w-3" />
                                  ล็อก
                                </span>
                              )}
                            </div>
                            <p className="mt-1 text-sm text-slate-500">
                              {item.description}
                            </p>
                          </div>

                          <button
                            type="button"
                            onClick={() => togglePermission(activeTab, item.id)}
                            disabled={locked}
                            className={`relative inline-flex h-7 w-12 flex-none items-center rounded-full transition focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-55 ${
                              isEnabled ? "bg-orange-600" : "bg-slate-300"
                            }`}
                            role="switch"
                            aria-checked={isEnabled}
                            aria-label={`${isEnabled ? "ปิด" : "เปิด"}สิทธิ์ ${item.title}`}
                            title={
                              locked
                                ? "ไม่สามารถแก้ไขสิทธิ์นี้ได้"
                                : `สลับสถานะ ${item.title}`
                            }
                          >
                            <span
                              aria-hidden="true"
                              className={`inline-block h-5 w-5 rounded-full bg-white shadow-sm transition ${
                                isEnabled ? "translate-x-6" : "translate-x-1"
                              }`}
                            />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
