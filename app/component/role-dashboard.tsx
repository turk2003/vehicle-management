"use client"

import type { LucideIcon } from "lucide-react"
import { Shield } from "lucide-react"
import { useRouter } from "next/navigation"

export interface DashboardMenuItem {
  title: string
  description: string
  href: string
  icon: LucideIcon
  permission: string
  tone: "blue" | "green" | "indigo" | "orange" | "teal" | "red"
  badge?: string
}

interface RoleDashboardProps {
  title: string
  description: string
  items: DashboardMenuItem[]
  emptyTitle?: string
  emptyDescription?: string
}

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
    <main className="min-h-screen bg-gray-50 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 h-20 max-w-lg animate-pulse rounded-lg bg-gray-200" />
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {[1, 2, 3].map((item) => (
            <div
              key={item}
              className="h-40 animate-pulse rounded-lg bg-white shadow-sm ring-1 ring-gray-200"
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
  emptyDescription = "คุณยังไม่ได้รับสิทธิ์ในการเข้าถึงเมนูใดๆ ในส่วนนี้",
}: RoleDashboardProps) {
  const router = useRouter()

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <header className="mb-8 rounded-xl bg-white p-6 shadow-sm ring-1 ring-gray-200">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="mb-2 text-sm font-medium text-blue-700">
                ศูนย์ควบคุม
              </p>
              <h2 className="text-2xl font-bold leading-tight text-gray-950">
                {title}
              </h2>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-600">
                {description}
              </p>
            </div>
            <div className="inline-flex w-fit items-center rounded-full bg-blue-50 px-3 py-1 text-sm font-medium text-blue-800 ring-1 ring-blue-100">
              {items.length} เมนูที่เข้าถึงได้
            </div>
          </div>
        </header>

        {items.length > 0 ? (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {items.map((item) => {
              const Icon = item.icon

              return (
                <button
                  key={item.href}
                  type="button"
                  onClick={() => router.push(item.href)}
                  className="group flex min-h-40 w-full flex-col rounded-lg bg-white p-6 text-left shadow-sm ring-1 ring-gray-200 transition duration-150 hover:-translate-y-0.5 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2"
                >
                  <div className="mb-5 flex items-start justify-between gap-4">
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
                  </div>
                  <h3 className="text-lg font-semibold text-gray-950">
                    {item.title}
                  </h3>
                  <p className="mt-2 flex-1 text-sm leading-6 text-gray-600">
                    {item.description}
                  </p>
                  <span className="mt-5 text-sm font-medium text-blue-700 group-hover:text-blue-800">
                    เปิดเมนู
                  </span>
                </button>
              )
            })}
          </div>
        ) : (
          <div className="rounded-xl bg-white px-6 py-12 text-center shadow-sm ring-1 ring-gray-200">
            <Shield className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-4 text-lg font-semibold text-gray-950">
              {emptyTitle}
            </h3>
            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-gray-600">
              {emptyDescription}
            </p>
          </div>
        )}
      </div>
    </main>
  )
}
