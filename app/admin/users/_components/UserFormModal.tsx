import { X } from "lucide-react"
import type * as React from "react"
import type { Dispatch, SetStateAction } from "react"
import type { User, UserFormData } from "../types"

type UserFormModalProps = {
  modalTitle: "แก้ไขผู้ใช้" | "เพิ่มผู้ใช้"
  editingUser: User | null
  closeModal: () => void
  updateUser: (e: React.FormEvent) => Promise<void>
  createUser: (e: React.FormEvent) => Promise<void>
  formData: UserFormData
  setFormData: Dispatch<SetStateAction<UserFormData>>
  loading: boolean
  submitLabel: "บันทึกการแก้ไข" | "สร้างผู้ใช้"
}

export default function UserFormModal({
  modalTitle,
  editingUser,
  closeModal,
  updateUser,
  createUser,
  formData,
  setFormData,
  loading,
  submitLabel,
}: UserFormModalProps) {
  return (
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
  )
}
