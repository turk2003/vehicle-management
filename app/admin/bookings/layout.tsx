import type { ReactNode } from "react"
import { requirePageAccess } from "@/lib/page-access"

export default async function BookingsLayout({ children }: { children: ReactNode }) {
  await requirePageAccess({ permission: "BOOKING_VIEW" })
  return children
}
