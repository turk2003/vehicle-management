export interface StatStripItem {
  label: string
  value: number
  /** Tailwind background class for the status dot; omit for totals. */
  dot?: string
}

interface StatStripProps {
  items: StatStripItem[]
  label: string
  className?: string
}

/** One surface of counts separated by hairlines, instead of a grid of tiles. */
export default function StatStrip({ items, label, className = "" }: StatStripProps) {
  return (
    <section
      aria-label={label}
      className={`mb-6 grid grid-cols-2 gap-px overflow-hidden rounded-lg bg-gray-200 shadow-sm ring-1 ring-gray-200 sm:grid-cols-4 ${className}`}
    >
      {items.map((item) => (
        <div key={item.label} className="bg-white px-4 py-3">
          <p className="flex items-center gap-2 text-sm text-gray-600">
            {item.dot && (
              <span
                className={`h-2 w-2 shrink-0 rounded-full ${item.dot}`}
                aria-hidden="true"
              />
            )}
            <span className="truncate">{item.label}</span>
          </p>
          <p className="mt-1 text-2xl font-semibold leading-tight text-gray-950 tabular-nums">
            {item.value}
          </p>
        </div>
      ))}
    </section>
  )
}
