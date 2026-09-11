import type { ReactNode } from "react"
import { requirePageAccess } from "@/lib/page-access"

export default async function ApproveLayout({ children }: { children: ReactNode }) {
  await requirePageAccess({ permission: "BOOKING_APPROVE" })
  return children
}
