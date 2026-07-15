"use client"

import { useEffect, useState } from "react"
import axios from "axios"
import { Pencil, Trash2, UserPlus, X } from "lucide-react"
import api from "@/lib/api"
import { formatDate, getRoleColor, getRoleDisplayName } from "@/lib/format"

type User = {
  id: string
  name: string
  email: string
  role: string
  createdAt: string
}

type UserFormData = {
  name: string
  email: string
  password: string
  role: string
}

const INITIAL_FORM_DATA: UserFormData = {
  name: "",
  email: "",
  password: "",
  role: "USER",
}

function getErrorMessage(error: unknown, fallback: string) {
  if (axios.isAxiosError<{ message?: string }>(error)) {
    return error.response?.data?.message || fallback
  }

  return fallback
}

function getInitials(name: string) {
  return name.trim().charAt(0).toUpperCase() || "?"
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [error, setError] = useState("")
  const [formData, setFormData] = useState<UserFormData>(INITIAL_FORM_DATA)

  const fetchUsers = async () => {
    try {
      setLoading(true)
      setError("")
      const response = await api.get<User[]>("/api/user")
      setUsers(response.data)
    } catch (error) {
      setError(getErrorMessage(error, "ไม่สามารถโหลดข้อมูลผู้ใช้ได้"))
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setFormData(INITIAL_FORM_DATA)
    setEditingUser(null)
    setError("")
  }

  const closeModal = () => {
    setShowModal(false)
    resetForm()
  }

  const createUser = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      setLoading(true)
      setError("")
      const response = await api.post<User>("/api/user", formData)
      setUsers((currentUsers) => [response.data, ...currentUsers])
      closeModal()
    } catch (error) {
      setError(getErrorMessage(error, "ไม่สามารถสร้างผู้ใช้ได้"))
    } finally {
      setLoading(false)
    }
  }

  const updateUser = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingUser) return

    try {
      setLoading(true)
      setError("")
      const response = await api.put<User>("/api/user", {
        id: editingUser.id,
        name: formData.name,
        role: formData.role,
      })

      setUsers((currentUsers) =>
        currentUsers.map((user) =>
          user.id === editingUser.id ? response.data : user,
        ),
      )
      closeModal()
    } catch (error) {
      setError(getErrorMessage(error, "ไม่สามารถแก้ไขผู้ใช้ได้"))
    } finally {
      setLoading(false)
    }
  }

  const deleteUser = async (id: string, name: string) => {
    const confirmed = confirm(`ต้องการลบผู้ใช้ "${name}" ใช่หรือไม่?`)
    if (!confirmed) return

    try {
      setLoading(true)
      setError("")
      await api.delete(`/api/user?id=${id}`)
      setUsers((currentUsers) => currentUsers.filter((user) => user.id !== id))
    } catch (error) {
      setError(getErrorMessage(error, "ไม่สามารถลบผู้ใช้ได้"))
    } finally {
      setLoading(false)
    }
  }

  const openEditModal = (user: User) => {
    setEditingUser(user)
    setFormData({
      name: user.name,
      email: user.email,
      password: "",
      role: user.role,
    })
    setError("")
    setShowModal(true)
  }

  const openCreateModal = () => {
    resetForm()
    setShowModal(true)
  }

  useEffect(() => {
    fetchUsers()
  }, [])

  const modalTitle = editingUser ? "แก้ไขผู้ใช้" : "เพิ่มผู้ใช้"
  const submitLabel = editingUser ? "บันทึกการแก้ไข" : "สร้างผู้ใช้"

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <header className="mb-6 rounded-xl bg-white p-6 shadow-sm ring-1 ring-gray-200">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="mb-2 text-sm font-medium text-blue-700">
                ผู้ดูแลระบบ
              </p>
              <h1 className="text-2xl font-bold leading-tight text-gray-950">
                จัดการผู้ใช้
              </h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-600">
                เพิ่ม แก้ไข และกำหนดบทบาทผู้ใช้ที่สามารถเข้าถึงระบบจัดการยานพาหนะ
              </p>
            </div>
            <button
              type="button"
              onClick={openCreateModal}
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition-colors duration-150 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2"
            >
              <UserPlus className="h-4 w-4" aria-hidden="true" />
              เพิ่มผู้ใช้
            </button>
          </div>
        </header>

        {error && (
          <div
            role="alert"
            aria-live="polite"
            className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"
          >
            {error}
          </div>
        )}

        <section
          className="overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-gray-200"
          aria-labelledby="users-table-title"
        >
          <div className="border-b border-gray-200 px-6 py-4">
            <h2
              id="users-table-title"
              className="text-lg font-semibold text-gray-950"
            >
              รายชื่อผู้ใช้
            </h2>
            <p className="mt-1 text-sm text-gray-600">
              ทั้งหมด {users.length} รายการ
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px]">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-600">
                    ผู้ใช้
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-600">
                    บทบาท
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-600">
                    วันที่สร้าง
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-600">
                    การดำเนินการ
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {loading && users.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-10 text-center">
                      <div className="mx-auto h-5 w-48 animate-pulse rounded bg-gray-200" />
                    </td>
                  </tr>
                ) : users.length === 0 ? (
                  <tr>
                    <td
                      colSpan={4}
                      className="px-6 py-12 text-center text-sm text-gray-600"
                    >
                      ยังไม่มีข้อมูลผู้ใช้
                    </td>
                  </tr>
                ) : (
                  users.map((user) => (
                    <tr
                      key={user.id}
                      className="transition-colors duration-150 hover:bg-gray-50"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-blue-50 text-sm font-semibold text-blue-700 ring-1 ring-blue-100">
                            {getInitials(user.name)}
                          </div>
                          <div className="min-w-0">
                            <div className="truncate text-sm font-medium text-gray-950">
                              {user.name}
                            </div>
                            <div className="truncate text-sm text-gray-600">
                              {user.email}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${getRoleColor(user.role)}`}
                        >
                          {getRoleDisplayName(user.role)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {formatDate(user.createdAt)}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => openEditModal(user)}
                            className="inline-flex min-h-9 items-center gap-1.5 rounded-md bg-blue-50 px-3 py-1.5 text-sm font-medium text-blue-700 transition-colors duration-150 hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-600/25"
                          >
                            <Pencil className="h-4 w-4" aria-hidden="true" />
                            แก้ไข
                          </button>
                          <button
                            type="button"
                            onClick={() => deleteUser(user.id, user.name)}
                            disabled={loading}
                            className="inline-flex min-h-9 items-center gap-1.5 rounded-md bg-red-50 px-3 py-1.5 text-sm font-medium text-red-700 transition-colors duration-150 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-red-600/25 disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            <Trash2 className="h-4 w-4" aria-hidden="true" />
                            ลบ
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>

        {showModal && (
          <div
            className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-gray-900/50 px-4 py-8"
            role="dialog"
            aria-modal="true"
            aria-labelledby="user-modal-title"
          >
            <div className="w-full max-w-lg rounded-xl bg-white shadow-lg ring-1 ring-gray-200">
              <div className="flex items-start justify-between gap-4 border-b border-gray-200 px-6 py-5">
                <div>
                  <h3
                    id="user-modal-title"
                    className="text-lg font-semibold text-gray-950"
                  >
                    {modalTitle}
                  </h3>
                  <p className="mt-1 text-sm text-gray-600">
                    {editingUser
                      ? "ปรับชื่อและบทบาทของผู้ใช้"
                      : "สร้างบัญชีใหม่สำหรับการเข้าใช้งานระบบ"}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={closeModal}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-md text-gray-500 transition-colors duration-150 hover:bg-gray-100 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-600/25"
                  aria-label="ปิดหน้าต่าง"
                >
                  <X className="h-5 w-5" aria-hidden="true" />
                </button>
              </div>

              <form
                onSubmit={editingUser ? updateUser : createUser}
                className="space-y-5 px-6 py-6"
              >
                <div>
                  <label
                    htmlFor="name"
                    className="mb-1.5 block text-sm font-medium text-gray-700"
                  >
                    ชื่อ
                  </label>
                  <input
                    id="name"
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    className="min-h-11 w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-gray-950 placeholder:text-gray-500 transition-colors duration-150 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600/25"
                  />
                </div>

                {!editingUser && (
                  <>
                    <div>
                      <label
                        htmlFor="email"
                        className="mb-1.5 block text-sm font-medium text-gray-700"
                      >
                        อีเมล
                      </label>
                      <input
                        id="email"
                        type="email"
                        autoComplete="email"
                        required
                        value={formData.email}
                        onChange={(e) =>
                          setFormData({ ...formData, email: e.target.value })
                        }
                        className="min-h-11 w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-gray-950 placeholder:text-gray-500 transition-colors duration-150 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600/25"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="password"
                        className="mb-1.5 block text-sm font-medium text-gray-700"
                      >
                        รหัสผ่าน
                      </label>
                      <input
                        id="password"
                        type="password"
                        autoComplete="new-password"
                        required
                        value={formData.password}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            password: e.target.value,
                          })
                        }
                        className="min-h-11 w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-gray-950 placeholder:text-gray-500 transition-colors duration-150 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600/25"
                      />
                    </div>
                  </>
                )}

                <div>
                  <label
                    htmlFor="role"
                    className="mb-1.5 block text-sm font-medium text-gray-700"
                  >
                    บทบาท
                  </label>
                  <select
                    id="role"
                    value={formData.role}
                    onChange={(e) =>
                      setFormData({ ...formData, role: e.target.value })
                    }
                    className="min-h-11 w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-gray-950 transition-colors duration-150 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600/25"
                  >
                    <option value="USER">ผู้ใช้งาน</option>
                    <option value="APPROVER">ผู้อนุมัติ</option>
                    <option value="ADMIN">ผู้ดูแลระบบ</option>
                  </select>
                </div>

                <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="inline-flex min-h-11 items-center justify-center rounded-lg bg-gray-100 px-4 py-2.5 text-sm font-medium text-gray-700 transition-colors duration-150 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-600/25"
                  >
                    ยกเลิก
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="inline-flex min-h-11 items-center justify-center rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition-colors duration-150 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {loading ? "กำลังบันทึก..." : submitLabel}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </main>
  )
}
