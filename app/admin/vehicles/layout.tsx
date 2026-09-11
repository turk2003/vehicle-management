import type { ReactNode } from "react"
import { requirePageAccess } from "@/lib/page-access"

export default async function VehiclesLayout({ children }: { children: ReactNode }) {
  await requirePageAccess({ permission: "VEHICLE_VIEW" })
  return children
}
