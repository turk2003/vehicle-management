import { Pencil, Power, PowerOff, Trash2 } from "lucide-react"
import { formatDate, getRoleColor, getRoleDisplayName } from "@/lib/format"
import type { Dispatch, SetStateAction } from "react"
import type { User, CurrentUser, StatusFilter } from "../types"
import { getInitials } from "../utils"

type UsersTableProps = {
  filteredUsers: User[]
  users: User[]
  statusFilter: StatusFilter
  setStatusFilter: Dispatch<SetStateAction<StatusFilter>>
  loading: boolean
  currentUser: CurrentUser | null
  activeAdminCount: number
  openEditModal: (user: User) => void
  toggleUserStatus: (user: User) => Promise<void>
  deleteUser: (id: string, name: string) => Promise<void>
}

export default function UsersTable({
  filteredUsers,
  users,
  statusFilter,
  setStatusFilter,
  loading,
  currentUser,
  activeAdminCount,
  openEditModal,
  toggleUserStatus,
  deleteUser,
}: UsersTableProps) {
  return (
    <section
      className="overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-gray-200"
      aria-labelledby="users-table-title"
    >
      <div className="flex flex-col gap-4 border-b border-gray-200 px-6 py-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 id="users-table-title" className="text-lg font-semibold text-gray-950">
            รายชื่อผู้ใช้
          </h2>
          <p className="mt-1 text-sm text-gray-600">
            แสดง {filteredUsers.length} จากทั้งหมด {users.length} รายการ
          </p>
        </div>
        <div>
          <label htmlFor="user-status-filter" className="mb-1 block text-xs font-medium text-gray-600">
            สถานะบัญชี
          </label>
          <select
            id="user-status-filter"
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value as StatusFilter)}
            className="min-h-10 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600/25"
          >
            <option value="ALL">ทั้งหมด</option>
            <option value="ACTIVE">ใช้งานอยู่</option>
            <option value="INACTIVE">ปิดใช้งาน</option>
          </select>
        </div>
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
                สถานะ
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
                <td colSpan={5} className="px-6 py-10 text-center">
                  <div className="mx-auto h-5 w-48 animate-pulse rounded bg-gray-200" />
                </td>
              </tr>
            ) : filteredUsers.length === 0 ? (
              <tr>
                <td
                  colSpan={5}
                  className="px-6 py-12 text-center text-sm text-gray-600"
                >
                  ยังไม่มีข้อมูลผู้ใช้
                </td>
              </tr>
            ) : (
              filteredUsers.map((user) => {
                const isSelf = currentUser?.id === user.id
                const isLastActiveAdmin =
                  user.role === "ADMIN" && user.isActive && activeAdminCount <= 1
                const statusActionDisabled = loading || isSelf || isLastActiveAdmin

                return (
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
                  <td className="px-6 py-4">
                    <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${user.isActive ? "bg-emerald-100 text-emerald-800" : "bg-gray-100 text-gray-700"}`}>
                      {user.isActive ? "ใช้งานอยู่" : "ปิดใช้งาน"}
                    </span>
                    {user.activeBookingCount > 0 && (
                      <p className="mt-1 text-xs text-amber-700">
                        การจองที่ยังดำเนินการ {user.activeBookingCount} รายการ
                      </p>
                    )}
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
                        onClick={() => toggleUserStatus(user)}
                        disabled={statusActionDisabled}
                        title={isSelf ? "ไม่สามารถปิดบัญชีตนเอง" : isLastActiveAdmin ? "ต้องมีผู้ดูแลระบบที่ใช้งานอยู่อย่างน้อย 1 คน" : undefined}
                        className={`inline-flex min-h-9 items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors duration-150 focus:outline-none focus:ring-2 disabled:cursor-not-allowed disabled:opacity-50 ${user.isActive ? "bg-amber-50 text-amber-800 hover:bg-amber-100 focus:ring-amber-600/25" : "bg-emerald-50 text-emerald-800 hover:bg-emerald-100 focus:ring-emerald-600/25"}`}
                      >
                        {user.isActive ? <PowerOff className="h-4 w-4" aria-hidden="true" /> : <Power className="h-4 w-4" aria-hidden="true" />}
                        {user.isActive ? "ปิดบัญชี" : "เปิดบัญชี"}
                      </button>
                      {user.canDelete && !isSelf && (
                        <button
                          type="button"
                          onClick={() => deleteUser(user.id, user.name)}
                          disabled={loading || isLastActiveAdmin}
                          className="inline-flex min-h-9 items-center gap-1.5 rounded-md bg-red-50 px-3 py-1.5 text-sm font-medium text-red-700 transition-colors duration-150 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-red-600/25 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          <Trash2 className="h-4 w-4" aria-hidden="true" />
                          ลบ
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>
    </section>
  )
}
