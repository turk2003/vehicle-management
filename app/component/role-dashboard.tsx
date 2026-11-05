import { Shield } from "lucide-react"
import Link from "next/link"
import PageHeader from "./page-header"
import type { RoleMenuItem } from "./role-menus"

export interface DashboardMenuItem extends RoleMenuItem {
  badge?: string
}

interface RoleDashboardProps {
  title: string
  description: string
  items: DashboardMenuItem[]
  emptyTitle?: string
  emptyDescription?: string
}

const pageClass = "min-h-screen bg-gray-50"
const containerClass = "mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8"
const gridClass = "grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3"

const toneClasses: Record<DashboardMenuItem["tone"], string> = {
  blue: "bg-blue-50 text-blue-700 ring-blue-100",
  green: "bg-green-50 text-green-700 ring-green-100",
  indigo: "bg-indigo-50 text-indigo-700 ring-indigo-100",
  orange: "bg-orange-50 text-orange-700 ring-orange-100",
  teal: "bg-teal-50 text-teal-700 ring-teal-100",
  red: "bg-red-50 text-red-700 ring-red-100",
}

export function DashboardLoading() {
  return (
    <main className={pageClass}>
      <div className={containerClass}>
        <div className="mb-6">
          <div className="h-7 w-56 animate-pulse rounded bg-gray-200" />
          <div className="mt-3 h-4 w-80 max-w-full animate-pulse rounded bg-gray-200" />
        </div>
        <div className={gridClass} aria-busy="true">
          {[1, 2, 3].map((item) => (
            <div
              key={item}
              className="h-48 animate-pulse rounded-lg bg-white shadow-sm ring-1 ring-gray-200"
            />
          ))}
        </div>
      </div>
    </main>
  )
}

export default function RoleDashboard({
  title,
  description,
  items,
  emptyTitle = "ไม่พบเมนูที่สามารถเข้าถึงได้",
  emptyDescription = "คุณยังไม่ได้รับสิทธิ์ในการเข้าถึงเมนูใดๆ ในส่วนนี้ ติดต่อผู้ดูแลระบบเพื่อขอสิทธิ์",
}: RoleDashboardProps) {
  return (
    <main className={pageClass}>
      <div className={containerClass}>
        <PageHeader title={title} description={description} />

        {items.length > 0 ? (
          <nav aria-label="เมนูที่เข้าถึงได้">
            <ul className={gridClass}>
              {items.map((item) => {
                const Icon = item.icon

                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className="group flex h-full min-h-48 flex-col rounded-lg bg-white p-6 shadow-sm ring-1 ring-gray-200 transition duration-150 hover:-translate-y-0.5 hover:shadow-md motion-reduce:hover:translate-y-0"
                    >
                      <span className="mb-5 flex items-start justify-between gap-4">
                        <span
                          className={`inline-flex h-12 w-12 items-center justify-center rounded-lg ring-1 ${toneClasses[item.tone]}`}
                        >
                          <Icon className="h-6 w-6" aria-hidden="true" />
                        </span>
                        {item.badge && (
                          <span className="rounded-full bg-red-50 px-2.5 py-1 text-xs font-semibold text-red-800 ring-1 ring-red-100">
                            {item.badge}
                          </span>
                        )}
                      </span>
                      <span className="text-lg font-semibold text-gray-950">
                        {item.title}
                      </span>
                      <span className="mt-2 flex-1 text-sm leading-6 text-gray-600">
                        {item.description}
                      </span>
                      <span className="mt-5 text-sm font-medium text-blue-700 group-hover:text-blue-800">
                        เปิดเมนู
                      </span>
                    </Link>
                  </li>
                )
              })}
            </ul>
          </nav>
        ) : (
          <div className="rounded-lg bg-white px-6 py-12 text-center shadow-sm ring-1 ring-gray-200">
            <Shield className="mx-auto h-10 w-10 text-gray-400" aria-hidden="true" />
            <h2 className="mt-4 text-lg font-semibold text-gray-950">
              {emptyTitle}
            </h2>
            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-gray-600">
              {emptyDescription}
            </p>
          </div>
        )}
      </div>
    </main>
  )
}
