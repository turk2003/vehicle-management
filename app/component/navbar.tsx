"use client"

import { useEffect, useState } from "react"
import { LogOut } from "lucide-react"
import { usePathname } from "next/navigation"
import axios from "axios"
import { getRoleColor, getRoleDisplayName } from "@/lib/format"

interface User {
  id: string
  name: string
  email: string
  role: string
}

export default function Navbar() {
  const pathname = usePathname()
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (pathname === "/") {
      setLoading(false)
      return
    }

    let active = true

    const fetchUser = async () => {
      try {
        setLoading(true)
        const response = await axios.get<{ user: User }>("/api/auth/me", {
          withCredentials: true,
          headers: {
            "Content-Type": "application/json",
          },
        })

        if (active) setUser(response.data.user)
      } catch {
        if (active) setUser(null)
      } finally {
        if (active) setLoading(false)
      }
    }

    fetchUser()

    return () => {
      active = false
    }
  }, [pathname])

  if (pathname === "/") {
    return null
  }

  const handleLogout = async () => {
    try {
      await axios.post("/api/auth/logout")
    } finally {
      window.location.href = "/"
    }
  }

  if (loading) {
    return (
      <header className="bg-white shadow-sm ring-1 ring-gray-200">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex min-h-20 items-center justify-between gap-4 py-4">
            <div className="min-w-0 flex-1">
              <div className="h-6 w-48 animate-pulse rounded bg-gray-200" />
              <div className="mt-2 h-4 w-64 max-w-full animate-pulse rounded bg-gray-100" />
            </div>
            <div className="hidden h-10 w-28 animate-pulse rounded-lg bg-gray-100 sm:block" />
          </div>
        </div>
      </header>
    )
  }

  if (!user) {
    return null
  }

  return (
    <header className="bg-white shadow-sm ring-1 ring-gray-200">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-4 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <h1 className="truncate text-xl font-bold leading-tight text-gray-950 sm:text-2xl">
              ระบบจัดการยานพาหนะ
            </h1>
            <div className="mt-2 flex flex-wrap items-center gap-2 text-sm">
              <span className="max-w-full truncate text-gray-600">
                ยินดีต้อนรับ, {user.name}
              </span>
              <span
                className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${getRoleColor(user.role)}`}
              >
                {getRoleDisplayName(user.role)}
              </span>
            </div>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="min-w-0 rounded-lg bg-gray-50 px-3 py-2 ring-1 ring-gray-200 sm:max-w-64 sm:text-right">
              <p className="truncate text-sm font-medium text-gray-950">
                {user.name}
              </p>
              <p className="truncate text-sm text-gray-600">{user.email}</p>
            </div>

            <button
              type="button"
              onClick={handleLogout}
              className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg bg-red-50 px-4 py-2 text-sm font-medium text-red-700 transition-colors duration-150 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-red-600/25"
            >
              <LogOut className="h-4 w-4" aria-hidden="true" />
              ออกจากระบบ
            </button>
          </div>
        </div>
      </div>
    </header>
  )
}
