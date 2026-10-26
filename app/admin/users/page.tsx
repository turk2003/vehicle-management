"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { UserPlus } from "lucide-react"
import { useToast } from "@/app/component/toast-provider"
import api from "@/lib/api"
import type * as React from "react"
import type { User, CurrentUser, StatusFilter, UserFormData } from "./types"
import { INITIAL_FORM_DATA } from "./constants"
import { getErrorMessage } from "./utils"
import UsersTable from "./_components/UsersTable"
import UserFormModal from "./_components/UserFormModal"

export default function AdminUsersPage() {
  const toast = useToast()
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [error, setError] = useState("")
  const [formData, setFormData] = useState<UserFormData>(INITIAL_FORM_DATA)
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null)
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("ALL")
  const [affectedBookingCount, setAffectedBookingCount] = useState(0)

  const fetchUsers = async () => {
    try {
      setLoading(true)
      setError("")
      const [usersResponse, meResponse] = await Promise.all([
        api.get<User[]>("/api/user"),
        api.get<{ user: CurrentUser }>("/api/auth/me"),
      ])
      setUsers(usersResponse.data)
      setCurrentUser(meResponse.data.user)
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
      toast.success("เพิ่มผู้ใช้เรียบร้อยแล้ว")
      closeModal()
    } catch (error) {
      toast.error(getErrorMessage(error, "ไม่สามารถสร้างผู้ใช้ได้"))
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
      toast.success("บันทึกการแก้ไขผู้ใช้เรียบร้อยแล้ว")
      closeModal()
    } catch (error) {
      toast.error(getErrorMessage(error, "ไม่สามารถแก้ไขผู้ใช้ได้"))
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
      toast.success("ลบผู้ใช้เรียบร้อยแล้ว")
    } catch (error) {
      toast.error(getErrorMessage(error, "ไม่สามารถลบผู้ใช้ได้"))
    } finally {
      setLoading(false)
    }
  }

  const toggleUserStatus = async (user: User) => {
    const nextActive = !user.isActive
    const bookingNotice = user.activeBookingCount > 0
      ? `\nผู้ใช้นี้มีการจองที่ยังดำเนินการอยู่ ${user.activeBookingCount} รายการ ซึ่งจะไม่ถูกยกเลิกอัตโนมัติ`
      : ""
    const confirmed = confirm(
      nextActive
        ? `ต้องการเปิดใช้งานบัญชี "${user.name}" ใช่หรือไม่?`
        : `ต้องการปิดใช้งานบัญชี "${user.name}" ใช่หรือไม่?${bookingNotice}`,
    )
    if (!confirmed) return

    try {
      setLoading(true)
      setError("")
      setAffectedBookingCount(0)
      const response = await api.patch<User & { affectedBookingCount: number }>(
        "/api/user",
        { id: user.id, isActive: nextActive },
      )
      setUsers((currentUsers) =>
        currentUsers.map((item) =>
          item.id === user.id
            ? { ...item, ...response.data, canDelete: item.canDelete }
            : item,
        ),
      )
      setAffectedBookingCount(nextActive ? 0 : response.data.affectedBookingCount)
      toast.success(
        nextActive
          ? `เปิดใช้งานบัญชี ${user.name} แล้ว`
          : `ปิดใช้งานบัญชี ${user.name} แล้ว`,
      )
    } catch (error) {
      toast.error(getErrorMessage(error, "ไม่สามารถเปลี่ยนสถานะบัญชีได้"))
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

  const activeAdminCount = users.filter(
    (user) => user.role === "ADMIN" && user.isActive,
  ).length
  const filteredUsers = users.filter((user) => {
    if (statusFilter === "ACTIVE") return user.isActive
    if (statusFilter === "INACTIVE") return !user.isActive
    return true
  })

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

        {affectedBookingCount > 0 && (
          <div
            className="mb-4 flex flex-col gap-2 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-900 sm:flex-row sm:items-center sm:justify-between"
          >
            <span>การจองที่ยังดำเนินการอยู่ {affectedBookingCount} รายการยังคงอยู่</span>
            <Link href="/admin/bookings" className="font-semibold text-blue-700 underline underline-offset-2">
              ไปจัดการการจอง
            </Link>
          </div>
        )}

        <UsersTable
          filteredUsers={filteredUsers}
          users={users}
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
          loading={loading}
          currentUser={currentUser}
          activeAdminCount={activeAdminCount}
          openEditModal={openEditModal}
          toggleUserStatus={toggleUserStatus}
          deleteUser={deleteUser}
        />

        {showModal && (
          <UserFormModal
            modalTitle={modalTitle}
            editingUser={editingUser}
            closeModal={closeModal}
            updateUser={updateUser}
            createUser={createUser}
            formData={formData}
            setFormData={setFormData}
            loading={loading}
            submitLabel={submitLabel}
          />
        )}
      </div>
    </main>
  )
}
