"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { Bell, CheckCheck, LogOut, Wrench } from "lucide-react"
import { usePathname, useRouter } from "next/navigation"
import axios from "axios"
import { getRoleColor, getRoleDisplayName } from "@/lib/format"
import api from "@/lib/api"

interface User {
  id: string
  name: string
  email: string
  role: string
}

type NotificationItem = {
  id: string
  type: "BOOKING" | "MAINTENANCE" | "SYSTEM"
  message: string
  isRead: boolean
  bookingId?: string | null
  maintenanceId?: string | null
  createdAt: string
}

export default function Navbar() {
  const pathname = usePathname()
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [notifications, setNotifications] = useState<NotificationItem[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [notificationsOpen, setNotificationsOpen] = useState(false)
  const notificationRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (pathname === "/") {
      setLoading(false)
      return
    }

    let active = true

    const fetchUser = async () => {
      try {
        setLoading(true)
        const response = await api.get<{ user: User }>("/api/auth/me")

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

  const fetchNotifications = useCallback(async () => {
    if (!user) return

    try {
      const response = await api.get<{
        items: NotificationItem[]
        unreadCount: number
      }>("/api/notifications?limit=10")
      setNotifications(response.data.items)
      setUnreadCount(response.data.unreadCount)
    } catch (error) {
      console.error("Failed to load notifications", error)
    }
  }, [user])

  useEffect(() => {
    if (!user) return

    fetchNotifications()
    const interval = window.setInterval(fetchNotifications, 30_000)
    return () => window.clearInterval(interval)
  }, [fetchNotifications, user])

  useEffect(() => {
    if (!notificationsOpen) return

    const handlePointerDown = (event: PointerEvent) => {
      if (
        notificationRef.current &&
        !notificationRef.current.contains(event.target as Node)
      ) {
        setNotificationsOpen(false)
      }
    }
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setNotificationsOpen(false)
    }

    document.addEventListener("pointerdown", handlePointerDown)
    document.addEventListener("keydown", handleKeyDown)
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown)
      document.removeEventListener("keydown", handleKeyDown)
    }
  }, [notificationsOpen])

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

  const openNotification = async (notification: NotificationItem) => {
    if (!user) return

    if (!notification.isRead) {
      try {
        await api.patch("/api/notifications", { id: notification.id })
        setNotifications((items) =>
          items.map((item) =>
            item.id === notification.id ? { ...item, isRead: true } : item,
          ),
        )
        setUnreadCount((count) => Math.max(0, count - 1))
      } catch (error) {
        console.error("Failed to mark notification as read", error)
      }
    }

    setNotificationsOpen(false)
    if (notification.type === "MAINTENANCE" && user.role === "ADMIN") {
      router.push("/admin/maintenance")
    } else if (notification.type === "BOOKING") {
      router.push(user.role === "ADMIN" ? "/admin/bookings" : "/user/my-bookings")
    }
  }

  const markAllAsRead = async () => {
    try {
      await api.patch("/api/notifications", { markAll: true })
      setNotifications((items) =>
        items.map((item) => ({ ...item, isRead: true })),
      )
      setUnreadCount(0)
    } catch (error) {
      console.error("Failed to mark all notifications as read", error)
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
            <div className="relative self-end sm:self-auto" ref={notificationRef}>
              <button
                type="button"
                onClick={() => setNotificationsOpen((open) => !open)}
                className="relative inline-flex h-11 w-11 items-center justify-center rounded-lg bg-gray-50 text-gray-700 ring-1 ring-gray-200 transition-colors duration-150 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-600/25"
                aria-label={`การแจ้งเตือน${unreadCount > 0 ? `ที่ยังไม่อ่าน ${unreadCount} รายการ` : ""}`}
                aria-expanded={notificationsOpen}
                aria-haspopup="true"
              >
                <Bell className="h-5 w-5" aria-hidden="true" />
                {unreadCount > 0 && (
                  <span className="absolute -right-1 -top-1 inline-flex min-h-5 min-w-5 items-center justify-center rounded-full bg-red-600 px-1 text-xs font-semibold text-white">
                    {unreadCount > 99 ? "99+" : unreadCount}
                  </span>
                )}
              </button>

              {notificationsOpen && (
                <div className="absolute right-0 z-40 mt-2 w-[min(24rem,calc(100vw-2rem))] overflow-hidden rounded-xl bg-white shadow-lg ring-1 ring-gray-200">
                  <div className="flex items-center justify-between gap-3 border-b border-gray-200 px-4 py-3">
                    <div>
                      <h2 className="text-base font-semibold text-gray-950">
                        การแจ้งเตือน
                      </h2>
                      <p className="text-sm text-gray-600">
                        ยังไม่อ่าน {unreadCount} รายการ
                      </p>
                    </div>
                    {unreadCount > 0 && (
                      <button
                        type="button"
                        onClick={markAllAsRead}
                        className="inline-flex min-h-9 items-center gap-1.5 rounded-md px-2.5 py-1.5 text-sm font-medium text-blue-700 transition-colors duration-150 hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-600/25"
                      >
                        <CheckCheck className="h-4 w-4" aria-hidden="true" />
                        อ่านทั้งหมด
                      </button>
                    )}
                  </div>

                  <div className="max-h-96 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <div className="px-5 py-10 text-center">
                        <Bell
                          className="mx-auto h-8 w-8 text-gray-400"
                          aria-hidden="true"
                        />
                        <p className="mt-3 text-sm font-medium text-gray-700">
                          ยังไม่มีการแจ้งเตือน
                        </p>
                        <p className="mt-1 text-sm text-gray-500">
                          รายการใหม่จะปรากฏที่นี่
                        </p>
                      </div>
                    ) : (
                      notifications.map((notification) => (
                        <button
                          key={notification.id}
                          type="button"
                          onClick={() => openNotification(notification)}
                          className={`flex w-full gap-3 border-b border-gray-100 px-4 py-3 text-left transition-colors duration-150 last:border-0 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-600/25 ${
                            notification.isRead ? "bg-white" : "bg-blue-50/70"
                          }`}
                        >
                          <span
                            className={`mt-0.5 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
                              notification.type === "MAINTENANCE"
                                ? "bg-orange-100 text-orange-700"
                                : "bg-blue-100 text-blue-700"
                            }`}
                          >
                            {notification.type === "MAINTENANCE" ? (
                              <Wrench className="h-4 w-4" aria-hidden="true" />
                            ) : (
                              <Bell className="h-4 w-4" aria-hidden="true" />
                            )}
                          </span>
                          <span className="min-w-0 flex-1">
                            <span className="block text-sm leading-5 text-gray-900">
                              {notification.message}
                            </span>
                            <span className="mt-1 block text-xs text-gray-500">
                              {new Date(notification.createdAt).toLocaleString(
                                "th-TH",
                                {
                                  dateStyle: "medium",
                                  timeStyle: "short",
                                },
                              )}
                            </span>
                          </span>
                          {!notification.isRead && (
                            <span
                              className="mt-2 h-2 w-2 shrink-0 rounded-full bg-blue-600"
                              aria-label="ยังไม่อ่าน"
                            />
                          )}
                        </button>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

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
