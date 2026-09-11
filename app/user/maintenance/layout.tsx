import type { ReactNode } from "react"
import { requirePageAccess } from "@/lib/page-access"

export default async function UserMaintenanceLayout({ children }: { children: ReactNode }) {
  await requirePageAccess({ permission: "MAINTENANCE_VIEW" })
  return children
}
