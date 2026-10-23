import { LayoutDashboard, Lock, Save, Shield } from "lucide-react"
import type { PermissionMatrix, MenuGroup } from "../types"
import { getRoleLabel } from "../utils"

type PermissionMatrixPanelProps = {
  activeTab: string
  saveRole: (role: string) => Promise<void>
  saving: string | null
  roles: string[]
  activeGroups: MenuGroup[]
  permissions: PermissionMatrix
  isLocked: (role: string, permission: string) => boolean
  togglePermission: (role: string, permission: string) => void
}

export default function PermissionMatrixPanel({
  activeTab,
  saveRole,
  saving,
  roles,
  activeGroups,
  permissions,
  isLocked,
  togglePermission,
}: PermissionMatrixPanelProps) {
  return (
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
  )
}
