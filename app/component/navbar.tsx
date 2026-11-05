"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { Bell, CheckCheck, ChevronDown, LogOut, Wrench } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import axios from "axios"
import { getRoleDisplayName } from "@/lib/format"
import api from "@/lib/api"
import { getRoleHome, getRoleMenu } from "./role-menus"

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

type OpenMenu = "notifications" | "account" | null

const navLinkClass = (active: boolean) =>
  `inline-flex h-9 shrink-0 items-center rounded-md px-3 text-sm font-medium whitespace-nowrap transition-colors duration-150 ${
    active
      ? "bg-blue-50 text-blue-700"
      : "text-gray-600 hover:bg-gray-100 hover:text-gray-950"
  }`

export default function Navbar() {
  const pathname = usePathname()
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [permissions, setPermissions] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [notifications, setNotifications] = useState<NotificationItem[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [openMenu, setOpenMenu] = useState<OpenMenu>(null)
  const menusRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setOpenMenu(null)

    if (pathname === "/") {
      setLoading(false)
      return
    }

    let active = true

    const fetchUser = async () => {
      try {
        const response = await api.get<{ user: User; permissions?: string[] }>(
          "/api/auth/me",
        )

        if (active) {
          setUser(response.data.user)
          setPermissions(response.data.permissions ?? [])
        }
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
    if (!openMenu) return

    const handlePointerDown = (event: PointerEvent) => {
      if (
        menusRef.current &&
        !menusRef.current.contains(event.target as Node)
      ) {
        setOpenMenu(null)
      }
    }
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpenMenu(null)
    }

    document.addEventListener("pointerdown", handlePointerDown)
    document.addEventListener("keydown", handleKeyDown)
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown)
      document.removeEventListener("keydown", handleKeyDown)
    }
  }, [openMenu])

  if (pathname === "/") {
    return null
  }

  const toggleMenu = (menu: Exclude<OpenMenu, null>) =>
    setOpenMenu((current) => (current === menu ? null : menu))

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

    setOpenMenu(null)
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
      <header className="app-header sticky top-0 border-b border-gray-200 bg-white">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 animate-pulse rounded-md bg-gray-200" />
            <div className="h-4 w-36 animate-pulse rounded bg-gray-200" />
          </div>
          <div className="h-9 w-9 animate-pulse rounded-full bg-gray-100" />
        </div>
      </header>
    )
  }

  if (!user) {
    return null
  }

  const home = getRoleHome(user.role)
  const navItems = [
    { href: home, label: "หน้าหลัก" },
    ...getRoleMenu(user.role, permissions).map((item) => ({
      href: item.href,
      label: item.navLabel,
    })),
  ]
  const isActive = (href: string) =>
    href === home
      ? pathname === home
      : pathname === href || pathname.startsWith(`${href}/`)

  const navLinks = navItems.map((item) => {
    const active = isActive(item.href)

    return (
      <Link
        key={item.href}
        href={item.href}
        aria-current={active ? "page" : undefined}
        className={navLinkClass(active)}
      >
        {item.label}
      </Link>
    )
  })

  return (
    <header className="app-header sticky top-0 border-b border-gray-200 bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center gap-6">
          <Link
            href={home}
            className="flex shrink-0 items-center gap-2.5 rounded-md"
          >
            <Image
              src="/pea_logo.png"
              alt=""
              width={32}
              height={32}
              className="h-8 w-8"
            />
            <span className="text-base font-semibold leading-tight text-gray-950">
              <span className="hidden sm:inline">ระบบจัดการยานพาหนะ</span>
              <span className="sm:hidden">ยานพาหนะ</span>
            </span>
          </Link>

          <nav
            aria-label="เมนูหลัก"
            className="hidden min-w-0 flex-1 items-center gap-1 lg:flex"
          >
            {navLinks}
          </nav>

          <div
            ref={menusRef}
            className="ml-auto flex shrink-0 items-center gap-1.5"
          >
            <div className="relative">
              <button
                type="button"
                onClick={() => toggleMenu("notifications")}
                className="relative inline-flex h-10 w-10 items-center justify-center rounded-full text-gray-600 transition-colors duration-150 hover:bg-gray-100 hover:text-gray-950"
                aria-label={`การแจ้งเตือน${unreadCount > 0 ? `ที่ยังไม่อ่าน ${unreadCount} รายการ` : ""}`}
                aria-expanded={openMenu === "notifications"}
                aria-haspopup="true"
              >
                <Bell className="h-5 w-5" aria-hidden="true" />
                {unreadCount > 0 && (
                  <span className="absolute right-0.5 top-0.5 inline-flex min-h-[18px] min-w-[18px] items-center justify-center rounded-full bg-red-600 px-1 text-[11px] font-semibold leading-none text-white ring-2 ring-white tabular-nums">
                    {unreadCount > 99 ? "99+" : unreadCount}
                  </span>
                )}
              </button>

              {openMenu === "notifications" && (
                <div className="app-dropdown fixed inset-x-4 top-16 overflow-hidden rounded-xl bg-white shadow-lg ring-1 ring-gray-200 sm:absolute sm:inset-x-auto sm:right-0 sm:top-full sm:mt-2 sm:w-96">
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
                        className="inline-flex min-h-9 items-center gap-1.5 rounded-md px-2.5 py-1.5 text-sm font-medium text-blue-700 transition-colors duration-150 hover:bg-blue-50"
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
                        <p className="mt-1 text-sm text-gray-600">
                          การอนุมัติ การเปลี่ยนสถานะ และงานซ่อมจะแจ้งที่นี่
                        </p>
                      </div>
                    ) : (
                      notifications.map((notification) => (
                        <button
                          key={notification.id}
                          type="button"
                          onClick={() => openNotification(notification)}
                          className={`flex w-full gap-3 border-b border-gray-100 px-4 py-3 text-left transition-colors duration-150 last:border-0 hover:bg-gray-50 focus-visible:outline-offset-[-2px] ${
                            notification.isRead ? "bg-white" : "bg-blue-50/60"
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
                            <span className="mt-1 block text-xs text-gray-600">
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

            <div className="relative">
              <button
                type="button"
                onClick={() => toggleMenu("account")}
                className="flex h-10 items-center gap-2.5 rounded-full py-1 pl-1 pr-2 transition-colors duration-150 hover:bg-gray-100 md:pr-3"
                aria-label="เมนูบัญชีผู้ใช้"
                aria-expanded={openMenu === "account"}
                aria-haspopup="true"
              >
                <span
                  className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-gray-900 text-sm font-semibold text-white"
                  aria-hidden="true"
                >
                  {user.name.trim().charAt(0).toUpperCase()}
                </span>
                <span className="hidden max-w-40 text-left md:block">
                  <span className="block truncate text-sm font-medium leading-tight text-gray-950">
                    {user.name}
                  </span>
                  <span className="block truncate text-xs leading-tight text-gray-600">
                    {getRoleDisplayName(user.role)}
                  </span>
                </span>
                <ChevronDown
                  className="hidden h-4 w-4 text-gray-500 md:block"
                  aria-hidden="true"
                />
              </button>

              {openMenu === "account" && (
                <div className="app-dropdown absolute right-0 top-full mt-2 w-72 overflow-hidden rounded-xl bg-white shadow-lg ring-1 ring-gray-200">
                  <div className="border-b border-gray-200 px-4 py-3">
                    <p className="truncate text-sm font-semibold text-gray-950">
                      {user.name}
                    </p>
                    <p className="truncate text-sm text-gray-600">
                      {user.email}
                    </p>
                    <p className="mt-2 text-xs font-medium text-gray-700">
                      บทบาท: {getRoleDisplayName(user.role)}
                    </p>
                  </div>
                  <div className="p-1.5">
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm font-medium text-red-700 transition-colors duration-150 hover:bg-red-50"
                    >
                      <LogOut className="h-4 w-4" aria-hidden="true" />
                      ออกจากระบบ
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <nav
        aria-label="เมนูหลัก"
        className="no-scrollbar flex gap-1 overflow-x-auto border-t border-gray-100 px-4 py-2 sm:px-6 lg:hidden"
      >
        {navLinks}
      </nav>
    </header>
  )
}
