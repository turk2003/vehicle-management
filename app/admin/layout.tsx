import type { ReactNode } from "react"
import { requirePageAccess } from "@/lib/page-access"

export default async function AdminLayout({ children }: { children: ReactNode }) {
  await requirePageAccess({ roles: ["ADMIN"] })
  return children
}
