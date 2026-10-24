"use client"

// Adapted from Untitled UI's MIT-licensed base Button. See LICENSE and README.md.
import type { ReactNode } from "react"
import { Button as AriaButton, type ButtonProps as AriaButtonProps } from "react-aria-components"
import { twMerge } from "tailwind-merge"

interface ButtonProps extends Omit<AriaButtonProps, "children" | "className"> {
  children?: ReactNode
  className?: string
  color?: "primary" | "secondary" | "tertiary"
  size?: "sm" | "md"
  iconLeading?: ReactNode
  isLoading?: boolean
}

const colors = {
  primary: "bg-blue-600 text-white ring-transparent hover:bg-blue-700",
  secondary: "bg-white text-gray-700 ring-gray-300 hover:bg-gray-50",
  tertiary: "bg-transparent text-gray-600 ring-transparent hover:bg-gray-100 hover:text-gray-950",
}

export function Button({ children, className, color = "secondary", size = "md", iconLeading, isLoading, isDisabled, ...props }: ButtonProps) {
  return (
    <AriaButton
      {...props}
      type={props.type ?? "button"}
      isDisabled={isDisabled || isLoading}
      isPending={isLoading}
      className={twMerge(
        "group relative inline-flex min-h-11 shrink-0 cursor-pointer items-center justify-center gap-2 whitespace-nowrap rounded-lg font-semibold ring-1 ring-inset outline-none transition-colors duration-150 focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 motion-reduce:transition-none",
        size === "md" ? "px-3.5 py-2.5 text-sm" : "px-3 py-2 text-sm",
        colors[color],
        className,
      )}
    >
      {isLoading ? (
        <svg className="size-4 shrink-0 motion-safe:animate-spin" aria-hidden="true" viewBox="0 0 20 20" fill="none">
          <circle cx="10" cy="10" r="8" stroke="currentColor" strokeWidth="2" opacity="0.3" />
          <circle cx="10" cy="10" r="8" stroke="currentColor" strokeWidth="2" strokeDasharray="12.5 50" strokeLinecap="round" />
        </svg>
      ) : iconLeading}
      {children}
    </AriaButton>
  )
}
