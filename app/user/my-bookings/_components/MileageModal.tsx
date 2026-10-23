import type * as React from "react"
import ModalHeader from "./ModalHeader"

export default function MileageModal({
  id,
  title,
  description,
  label,
  value,
  min,
  loading,
  loadingLabel,
  submitLabel,
  tone,
  onChange,
  onClose,
  onSubmit,
}: {
  id: string
  title: string
  description: string
  label: string
  value: string
  min: number
  loading: boolean
  loadingLabel: string
  submitLabel: string
  tone: "indigo" | "teal"
  onChange: (value: string) => void
  onClose: () => void
  onSubmit: (e: React.FormEvent) => void
}) {
  const toneClasses =
    tone === "indigo"
      ? "bg-indigo-600 hover:bg-indigo-700 focus:ring-indigo-600/25"
      : "bg-teal-600 hover:bg-teal-700 focus:ring-teal-600/25"

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-gray-900/50 px-4 py-8"
      role="dialog"
      aria-modal="true"
      aria-labelledby={id}
    >
      <div className="w-full max-w-md rounded-xl bg-white shadow-lg ring-1 ring-gray-200">
        <ModalHeader
          id={id}
          title={title}
          description={description}
          onClose={onClose}
        />

        <form onSubmit={onSubmit} className="space-y-5 px-6 py-6">
          <div>
            <label
              htmlFor={`${id}-mileage`}
              className="mb-1.5 block text-sm font-medium text-gray-700"
            >
              {label} <span className="text-red-700">*</span>
            </label>
            <input
              id={`${id}-mileage`}
              type="number"
              required
              min={min}
              value={value}
              onChange={(e) => onChange(e.target.value)}
              className="min-h-11 w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-gray-950 transition-colors duration-150 placeholder:text-gray-500 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600/25"
              placeholder="เช่น 15000"
            />
          </div>

          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={onClose}
              className="inline-flex min-h-11 items-center justify-center rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 transition-colors duration-150 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-600/25"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              disabled={loading || !value}
              className={`inline-flex min-h-11 items-center justify-center rounded-lg px-4 py-2 text-sm font-medium text-white transition-colors duration-150 focus:outline-none focus:ring-2 disabled:cursor-not-allowed disabled:opacity-60 ${toneClasses}`}
            >
              {loading ? loadingLabel : submitLabel}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
