import { Mail, Lock, LogIn, Eye, EyeOff } from "lucide-react"
import type * as React from "react"
import type { Dispatch, SetStateAction } from "react"

type LoginFormProps = {
  handleLogin: (e: React.FormEvent) => Promise<void>
  error: string
  email: string
  setEmail: Dispatch<SetStateAction<string>>
  showPassword: boolean
  password: string
  setPassword: Dispatch<SetStateAction<string>>
  setShowPassword: Dispatch<SetStateAction<boolean>>
  loading: boolean
}

export default function LoginForm({
  handleLogin,
  error,
  email,
  setEmail,
  showPassword,
  password,
  setPassword,
  setShowPassword,
  loading,
}: LoginFormProps) {
  return (
    <form onSubmit={handleLogin} className="space-y-5">
      {error && (
        <div
          role="alert"
          aria-live="polite"
          className="flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"
        >
          <span className="mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-red-600 text-xs font-bold text-white">
            !
          </span>
          <span>{error}</span>
        </div>
      )}

      <div>
        <label
          htmlFor="email"
          className="mb-1.5 block text-sm font-medium text-gray-700"
        >
          อีเมล
        </label>
        <div className="relative">
          <Mail
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500"
            aria-hidden="true"
          />
          <input
            id="email"
            type="email"
            autoComplete="email"
            placeholder="กรอกอีเมล"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="min-h-11 w-full rounded-lg border border-gray-300 bg-white py-2.5 pl-10 pr-4 text-gray-950 placeholder:text-gray-500 transition-colors duration-150 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600/25"
          />
        </div>
      </div>

      <div>
        <label
          htmlFor="password"
          className="mb-1.5 block text-sm font-medium text-gray-700"
        >
          รหัสผ่าน
        </label>
        <div className="relative">
          <Lock
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500"
            aria-hidden="true"
          />
          <input
            id="password"
            type={showPassword ? "text" : "password"}
            autoComplete="current-password"
            placeholder="กรอกรหัสผ่าน"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="min-h-11 w-full rounded-lg border border-gray-300 bg-white py-2.5 pl-10 pr-12 text-gray-950 placeholder:text-gray-500 transition-colors duration-150 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600/25"
          />
          <button
            type="button"
            onClick={() => setShowPassword((value) => !value)}
            aria-label={showPassword ? "ซ่อนรหัสผ่าน" : "แสดงรหัสผ่าน"}
            aria-pressed={showPassword}
            className="absolute right-2 top-1/2 inline-flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-md text-gray-500 transition-colors duration-150 hover:bg-gray-100 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-600/25"
          >
            {showPassword ? (
              <EyeOff className="h-4 w-4" aria-hidden="true" />
            ) : (
              <Eye className="h-4 w-4" aria-hidden="true" />
            )}
          </button>
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="flex min-h-11 w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition-colors duration-150 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loading ? (
          <span
            className="h-5 w-5 rounded-full border-2 border-white/40 border-t-white motion-safe:animate-spin motion-reduce:border-white"
            aria-hidden="true"
          />
        ) : (
          <LogIn className="h-4 w-4" aria-hidden="true" />
        )}
        {loading ? "กำลังเข้าสู่ระบบ..." : "เข้าสู่ระบบ"}
      </button>
    </form>
  )
}
