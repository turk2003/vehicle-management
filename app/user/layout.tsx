import type { ReactNode } from "react"
import { requirePageAccess } from "@/lib/page-access"

export default async function UserLayout({ children }: { children: ReactNode }) {
  await requirePageAccess({ roles: ["USER"] })
  return children
}
