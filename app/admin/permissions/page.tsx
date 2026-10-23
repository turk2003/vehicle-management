"use client"

import { useEffect, useMemo, useState } from "react"
import { CheckCircle, Shield, X } from "lucide-react"
import api from "@/lib/api"
import type { PermissionMatrix, PermissionsResponse } from "./types"
import { menuGroups } from "./constants"
import { getApiErrorMessage, getRoleLabel } from "./utils"
import PermissionsLoading from "./_components/PermissionsLoading"
import RoleTabs from "./_components/RoleTabs"
import PermissionMatrixPanel from "./_components/PermissionMatrixPanel"

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
      <PermissionsLoading />
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

        <RoleTabs
          roles={roles}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
        />

        <PermissionMatrixPanel
          activeTab={activeTab}
          saveRole={saveRole}
          saving={saving}
          roles={roles}
          activeGroups={activeGroups}
          permissions={permissions}
          isLocked={isLocked}
          togglePermission={togglePermission}
        />
      </div>
    </div>
  );
}
