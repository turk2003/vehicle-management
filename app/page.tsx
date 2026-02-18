"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import api from "@/lib/api"
export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      const response = await api.post("/api/auth/login", {
        email,
        password
      })

      const role = response.data.user.role

      if (role === "ADMIN") {
        router.push("/admin")
      } else if (role === "APPROVER") {
        router.push("/approver")
      } else {
        router.push("/user")
      }

    } catch (err: any) {
      // Axios error handling
      const errorMessage = err.response?.data?.message || "เกิดข้อผิดพลาด"
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-purple-300">
      <form
        onSubmit={handleLogin}
        className="bg-white p-6 rounded shadow-md w-96"
      >
        <h1 className="text-2xl text-black font-bold mb-4 text-center">
          Vehicle Management Login
        </h1>

        {error && (
          <p className="text-red-500 text-sm mb-2">{error}</p>
        )}

        <input
          type="email"
          placeholder="Email"
          className="w-full border p-2 mb-3 rounded text-black"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <input
          type="password"
          placeholder="Password"
          className="w-full border p-2 mb-4 rounded text-black"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700"
        >
          {loading ? "Logging in..." : "Login"}
        </button>
        <div>
        <p className="mt-4 text-black text-center">
          admin test:<br/>
          Email: admin@system.com<br/>
          Password: admin123
        </p>
        <p className="mt-4 text-black text-center">
          user test:<br/>
          Email: test01@gmail.con<br/>
          Password: 1234
        </p>
        <p className="mt-4 text-black text-center">
          approver test:<br/>
          Email: ap1@gmain.com<br/>
          Password: 1234
        </p>
      </div>
      </form>
      
    </div>
  )
}
