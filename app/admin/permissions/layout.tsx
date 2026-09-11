import type { ReactNode } from "react"
import { requirePageAccess } from "@/lib/page-access"

export default async function PermissionsLayout({ children }: { children: ReactNode }) {
  await requirePageAccess({ permission: "PERMISSION_MANAGE" })
  return children
}
