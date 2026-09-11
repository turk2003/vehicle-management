import type { ReactNode } from "react"
import { requirePageAccess } from "@/lib/page-access"

export default async function MaintenanceLayout({ children }: { children: ReactNode }) {
  await requirePageAccess({ permission: "MAINTENANCE_VIEW" })
  return children
}
