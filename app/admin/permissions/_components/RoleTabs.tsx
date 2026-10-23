import type { Dispatch, SetStateAction } from "react"
import { roleMeta } from "../constants"
import { getRoleLabel } from "../utils"

type RoleTabsProps = {
  roles: string[]
  activeTab: string
  setActiveTab: Dispatch<SetStateAction<string>>
}

export default function RoleTabs({
  roles,
  activeTab,
  setActiveTab,
}: RoleTabsProps) {
  return (
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
  )
}
