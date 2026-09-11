import type { ReactNode } from "react"
import { requirePageAccess } from "@/lib/page-access"

export default async function UsersLayout({ children }: { children: ReactNode }) {
  await requirePageAccess({ permission: "USER_MANAGE" })
  return children
}
