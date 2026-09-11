"use client"

import { useCallback, useEffect, useState } from "react"
import api from "@/lib/api"

export function usePermissions() {
  const [permissions, setPermissions] = useState<string[]>([])
  const [permissionsLoading, setPermissionsLoading] = useState(true)

  useEffect(() => {
    let active = true

    api.get<{ permissions: string[] }>("/api/auth/me")
      .then((response) => {
        if (active) setPermissions(response.data.permissions || [])
      })
      .catch(() => {
        if (active) setPermissions([])
      })
      .finally(() => {
        if (active) setPermissionsLoading(false)
      })

    return () => {
      active = false
    }
  }, [])

  const hasPermission = useCallback(
    (permission: string) => permissions.includes(permission),
    [permissions],
  )

  return { permissions, permissionsLoading, hasPermission }
}
