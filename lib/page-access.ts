import "server-only"

import { cache } from "react"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { verifyTokenValue } from "@/lib/auth"
import {
  assertAccess,
  isAuthenticationError,
  type AccessPolicy,
} from "@/lib/permissions"

const getPageActor = cache(verifyTokenValue)

export async function requirePageAccess(policy: AccessPolicy) {
  try {
    const token = (await cookies()).get("token")?.value
    const actor = await getPageActor(token)
    return await assertAccess(actor, policy)
  } catch (error) {
    if (isAuthenticationError(error)) redirect("/")
    redirect("/forbidden")
  }
}
