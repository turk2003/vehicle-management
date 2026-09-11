import type { ReactNode } from "react"
import { requirePageAccess } from "@/lib/page-access"

export default async function ApproverLayout({ children }: { children: ReactNode }) {
  await requirePageAccess({ roles: ["APPROVER", "ADMIN"] })
  return children
}
