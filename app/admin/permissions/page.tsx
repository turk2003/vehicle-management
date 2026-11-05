"use client"

import { useEffect, useMemo, useState } from "react"
import { X } from "lucide-react"
import { useToast } from "@/app/component/toast-provider"
import api from "@/lib/api"
import type { PermissionMatrix, PermissionsResponse } from "./types"
import { menuGroups } from "./constants"
import { getApiErrorMessage, getRoleLabel } from "./utils"
import PermissionsLoading from "./_components/PermissionsLoading"
import RoleTabs from "./_components/RoleTabs"
import PermissionMatrixPanel from "./_components/PermissionMatrixPanel"
import PageHeader from "@/app/component/page-header"

export default function AdminPermissionsPage() {
  const toast = useToast()
  const [permissions, setPermissions] = useState<PermissionMatrix>({});
  const [roles, setRoles] = useState<string[]>([]);
  const [lockedAdminPermissions, setLockedAdminPermissions] = useState<
    string[]
  >([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState<string | null>(null);
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

      toast.success(`บันทึกสิทธิ์ของ ${getRoleLabel(role)} เรียบร้อยแล้ว`);
    } catch (err) {
      toast.error(getApiErrorMessage(err, "เกิดข้อผิดพลาดขณะบันทึกสิทธิ์"));
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
    <div className="min-h-screen bg-gray-50 px-4 py-8 text-gray-900 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl space-y-6">
        <PageHeader
          title="จัดการสิทธิ์การใช้งาน"
          description="กำหนดเมนูที่แต่ละบทบาทเข้าถึงได้ โดยยึดตามหน้าที่จริงของพนักงานจองรถ ผู้อนุมัติ และผู้ดูแลระบบ"
          actions={
            <p className="text-sm text-gray-600">
              บทบาทที่เลือก:{" "}
              <span className="font-semibold text-gray-950">
                {getRoleLabel(activeTab)}
              </span>
            </p>
          }
        />

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
