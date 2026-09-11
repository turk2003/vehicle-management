import type { ReactNode } from "react"
import { requirePageAccess } from "@/lib/page-access"

export default async function VehicleHistoryLayout({ children }: { children: ReactNode }) {
  await requirePageAccess({ permission: "REPORT_VIEW" })
  return children
}
