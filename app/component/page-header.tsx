import type { ReactNode } from "react"

interface PageHeaderProps {
  title: string
  description?: ReactNode
  /** Primary actions, tabs, or filters aligned to the right on wide screens. */
  actions?: ReactNode
}

export default function PageHeader({ title, description, actions }: PageHeaderProps) {
  return (
    <header className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
      <div className="min-w-0">
        <h1 className="text-2xl font-semibold leading-tight text-gray-950">
          {title}
        </h1>
        {description && (
          <p className="mt-1.5 max-w-2xl text-sm leading-6 text-gray-600">
            {description}
          </p>
        )}
      </div>

      {actions && (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          {actions}
        </div>
      )}
    </header>
  )
}
