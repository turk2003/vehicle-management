import type { ReactNode } from "react"
import { requirePageAccess } from "@/lib/page-access"

export default async function BookingLayout({ children }: { children: ReactNode }) {
  await requirePageAccess({ permission: "BOOKING_CREATE" })
  return children
}
