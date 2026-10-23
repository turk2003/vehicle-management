export default function ModalActions({
  loading,
  loadingLabel,
  submitLabel,
  onCancel,
}: {
  loading: boolean
  loadingLabel: string
  submitLabel: string
  onCancel: () => void
}) {
  return (
    <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
      <button
        type="button"
        onClick={onCancel}
        className="inline-flex min-h-11 items-center justify-center rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 transition-colors duration-150 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-600/25"
      >
        ยกเลิก
      </button>
      <button
        type="submit"
        disabled={loading}
        className="inline-flex min-h-11 items-center justify-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors duration-150 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-600/25 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loading ? loadingLabel : submitLabel}
      </button>
    </div>
  )
}
