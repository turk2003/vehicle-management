"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Mail, Lock, LogIn, Eye, EyeOff } from "lucide-react"
import api from "@/lib/api"
import Image from "next/image"

const TEST_ACCOUNTS = [
  { role: "Admin", email: "admin@system.com", password: "admin123", color: "bg-red-50 border-red-200 text-red-700", dot: "bg-red-500" },
  { role: "Approver", email: "ap1@gmain.com", password: "1234", color: "bg-blue-50 border-blue-200 text-blue-700", dot: "bg-blue-500" },
  { role: "User", email: "test01@gmail.con", password: "1234", color: "bg-green-50 border-green-200 text-green-700", dot: "bg-green-500" },
]

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")
    try {
      const response = await api.post("/api/auth/login", { email, password })
      const role = response.data.user.role
      if (role === "ADMIN") router.push("/admin")
      else if (role === "APPROVER") router.push("/approver")
      else router.push("/user")
    } catch (err: any) {
      setError(err.response?.data?.message || "อีเมลหรือรหัสผ่านไม่ถูกต้อง")
    } finally {
      setLoading(false)
    }
  }

  const fillAccount = (acc: typeof TEST_ACCOUNTS[0]) => {
    setEmail(acc.email)
    setPassword(acc.password)
    setError("")
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 flex items-center justify-center p-4">

      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-md">

        {/* Card */}
        <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl overflow-hidden">

          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-8 text-center">
            <div className="inline-flex items-center justify-center w-32 h-32  rounded-2xl mb-4">
              <Image src="/pea_logo.png" alt="Logo" width={128} height={128} />

            </div>
            <h1 className="text-2xl font-bold text-white">ระบบจัดการยานพาหนะ</h1>
            <p className="text-blue-100 text-sm mt-1">Vehicle Management System</p>
          </div>

          {/* Form */}
          <div className="px-8 py-8">
            <form onSubmit={handleLogin} className="space-y-5">

              {/* Error */}
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-lg flex items-center gap-2">
                  <span className="w-4 h-4 rounded-full bg-red-500 text-white text-xs flex items-center justify-center flex-shrink-0">!</span>
                  {error}
                </div>
              )}

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">อีเมล</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="email"
                    placeholder="กรอกอีเมล"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">รหัสผ่าน</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="กรอกรหัสผ่าน"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full pl-10 pr-10 py-2.5 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium py-2.5 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <LogIn className="w-4 h-4" />
                )}
                {loading ? "กำลังเข้าสู่ระบบ..." : "เข้าสู่ระบบ"}
              </button>
            </form>

            {/* Test accounts */}
            <div className="mt-6">
              <p className="text-xs font-medium text-gray-400 uppercase tracking-wider text-center mb-3">
                บัญชีทดสอบ — คลิกเพื่อกรอกอัตโนมัติ
              </p>
              <div className="space-y-2">
                {TEST_ACCOUNTS.map((acc) => (
                  <button
                    key={acc.role}
                    type="button"
                    onClick={() => fillAccount(acc)}
                    className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg border text-sm transition-all hover:shadow-sm ${acc.color}`}
                  >
                    <span className={`w-2 h-2 rounded-full flex-shrink-0 ${acc.dot}`} />
                    <span className="font-semibold w-16 text-left">{acc.role}</span>
                    <span className="text-xs opacity-75 truncate">{acc.email}</span>
                    <span className="ml-auto text-xs opacity-60 flex-shrink-0">รหัส: {acc.password}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        <p className="text-center text-white/30 text-xs mt-6">
          © 2026 Vehicle Management System
        </p>
      </div>
    </div>
  )
}

