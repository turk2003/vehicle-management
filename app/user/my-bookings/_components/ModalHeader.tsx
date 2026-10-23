import { X } from "lucide-react"

export default function ModalHeader({
  id,
  title,
  description,
  onClose,
}: {
  id: string
  title: string
  description: string
  onClose: () => void
}) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-gray-200 px-6 py-5">
      <div>
        <h3 id={id} className="text-lg font-semibold text-gray-950">
          {title}
        </h3>
        <p className="mt-1 text-sm text-gray-600">{description}</p>
      </div>
      <button
        type="button"
        onClick={onClose}
        className="inline-flex h-9 w-9 items-center justify-center rounded-md text-gray-500 transition-colors duration-150 hover:bg-gray-100 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-600/25"
        aria-label="ปิดหน้าต่าง"
      >
        <X className="h-5 w-5" aria-hidden="true" />
      </button>
    </div>
  )
}
