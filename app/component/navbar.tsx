"use client"

import { useState, useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"
import axios from "axios"

interface User {
  id: string
  name: string
  email: string
  role: string
}

export default function Navbar() {
  const router = useRouter()
  const pathname = usePathname()
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (pathname === "/") {
      setLoading(false)
      return
    }

    const fetchUser = async () => {
      try {
        const response = await axios.get("/api/auth/me", {
          withCredentials: true,
          headers: {
            'Content-Type': 'application/json',
          }
        })
        
        setUser(response.data.user)
      } catch (error) {
        console.error("Failed to fetch user:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchUser()
  }, [router, pathname])

  if (pathname === "/") {
    return null
  }

  const handleLogout = async () => {
    try {
      document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;"
      router.push("/")
    } catch (error) {
      console.error("Logout error:", error)
    }
  }

  const getRoleDisplayName = (role: string) => {
    switch (role) {
      case "ADMIN":
        return "ผู้ดูแลระบบ"
      case "APPROVER":
        return "ผู้อนุมัติ"
      case "USER":
        return "ผู้ใช้งาน"
      default:
        return role
    }
  }

  const getRoleColor = (role: string) => {
    switch (role) {
      case "ADMIN":
        return "bg-red-100 text-red-800"
      case "APPROVER":
        return "bg-blue-100 text-blue-800"
      case "USER":
        return "bg-green-100 text-green-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  if (loading) {
    return (
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="animate-pulse">
              <div className="h-6 bg-gray-300 rounded w-48 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-32"></div>
            </div>
          </div>
        </div>
      </header>
    )
  }

  if (!user) {
    return null
  }

  return (
    <header className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              ระบบจัดการยานพาหนะ
            </h1>
            <div className="flex items-center gap-3 mt-1">
              <p className="text-gray-600">
                ยินดีต้อนรับ, {user.name}
              </p>
              <span
                className={`px-2 py-1 rounded-full text-xs font-medium ${getRoleColor(user.role)}`}
              >
                {getRoleDisplayName(user.role)}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm font-medium text-gray-900">{user.name}</p>
              <p className="text-sm text-gray-500">{user.email}</p>
            </div>
            
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013 3v1" />
              </svg>
              ออกจากระบบ
            </button>
          </div>
        </div>
      </div>
    </header>
  )
}