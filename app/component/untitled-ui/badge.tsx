// Adapted from Untitled UI's MIT-licensed Badge/BadgeWithDot. See LICENSE and README.md.
import type { ReactNode } from "react"
import { twMerge } from "tailwind-merge"

export const badgeColors = {
  gray: "bg-gray-50 text-gray-700 ring-gray-200",
  blue: "bg-blue-50 text-blue-800 ring-blue-200",
  success: "bg-green-50 text-green-800 ring-green-200",
  warning: "bg-yellow-50 text-yellow-900 ring-yellow-200",
  error: "bg-red-50 text-red-800 ring-red-200",
  indigo: "bg-indigo-50 text-indigo-800 ring-indigo-200",
  purple: "bg-purple-50 text-purple-800 ring-purple-200",
  orange: "bg-orange-50 text-orange-800 ring-orange-200",
  teal: "bg-teal-50 text-teal-800 ring-teal-200",
} as const

export type BadgeColor = keyof typeof badgeColors

export function Badge({ children, color = "gray", dot = false, className }: {
  children: ReactNode
  color?: BadgeColor
  dot?: boolean
  className?: string
}) {
  return (
    <span className={twMerge("inline-flex w-fit shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-0.5 text-sm font-medium ring-1 ring-inset", badgeColors[color], className)}>
      {dot && <svg width="8" height="8" viewBox="0 0 8 8" fill="none" aria-hidden="true"><circle cx="4" cy="4" r="2.5" fill="currentColor" /></svg>}
      {children}
    </span>
  )
}
