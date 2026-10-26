"use client"

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react"
import { createPortal } from "react-dom"
import { CircleCheck, CircleAlert, X } from "lucide-react"

type Toast = { id: number; message: string; type: "success" | "error" }
type ToastApi = { success: (message: string) => void; error: (message: string) => void }
type PauseReason = "hover" | "focus"
type Timer = {
  remaining: number
  startedAt: number
  timeout?: ReturnType<typeof setTimeout>
  paused: Set<PauseReason>
}

const ToastContext = createContext<ToastApi | null>(null)
const ToastContainerContext = createContext<((element: HTMLDivElement | null) => void) | null>(null)

export function useToast() {
  const toast = useContext(ToastContext)
  if (!toast) throw new Error("useToast must be used within ToastProvider")
  return toast
}

// Native modal dialogs occupy the browser's top layer. Hosting the viewport here
// keeps errors visible and keyboard accessible while the rest of the page is inert.
export function ToastDialogTarget() {
  const register = useContext(ToastContainerContext)
  return <div ref={register} className="contents" />
}

function ToastMessage({
  toast,
  dismiss,
  pause,
  resume,
}: {
  toast: Toast
  dismiss: (id: number) => void
  pause: (id: number, reason: PauseReason) => void
  resume: (id: number, reason: PauseReason) => void
}) {
  useEffect(() => () => {
    // Portaling between the page and a dialog remounts this item. Keep its
    // remaining lifetime in the provider and release any old interaction state.
    resume(toast.id, "hover")
    resume(toast.id, "focus")
  }, [toast.id, resume])

  const success = toast.type === "success"
  const Icon = success ? CircleCheck : CircleAlert

  return (
    <div
      data-toast={toast.type}
      role={success ? "status" : "alert"}
      aria-atomic="true"
      onMouseEnter={() => pause(toast.id, "hover")}
      onMouseLeave={() => resume(toast.id, "hover")}
      onFocusCapture={() => pause(toast.id, "focus")}
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) resume(toast.id, "focus")
      }}
      className={`toast-message pointer-events-auto flex items-start gap-3 rounded-lg border p-4 text-sm leading-6 ${
        success
          ? "border-green-200 bg-green-50 text-green-800"
          : "border-red-200 bg-red-50 text-red-800"
      }`}
    >
      <Icon className="mt-0.5 size-5 shrink-0" aria-hidden="true" />
      <p className="min-w-0 flex-1 break-words">{toast.message}</p>
      <button
        type="button"
        onClick={() => dismiss(toast.id)}
        aria-label="ปิดการแจ้งเตือน"
        className="-m-2 inline-flex size-10 shrink-0 items-center justify-center rounded-md hover:bg-black/5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-current"
      >
        <X className="size-4" aria-hidden="true" />
      </button>
    </div>
  )
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])
  const [container, setContainer] = useState<HTMLDivElement | null>(null)
  const nextId = useRef(0)
  const timers = useRef(new Map<number, Timer>())

  const dismiss = useCallback((id: number) => {
    clearTimeout(timers.current.get(id)?.timeout)
    timers.current.delete(id)
    setToasts((current) => current.filter((toast) => toast.id !== id))
  }, [])

  const pause = useCallback((id: number, reason: PauseReason) => {
    const timer = timers.current.get(id)
    if (!timer || timer.paused.has(reason)) return
    if (timer.paused.size === 0) {
      clearTimeout(timer.timeout)
      timer.remaining = Math.max(0, timer.remaining - (Date.now() - timer.startedAt))
    }
    timer.paused.add(reason)
  }, [])

  const resume = useCallback((id: number, reason: PauseReason) => {
    const timer = timers.current.get(id)
    if (!timer || !timer.paused.delete(reason) || timer.paused.size > 0) return
    timer.startedAt = Date.now()
    timer.timeout = setTimeout(() => dismiss(id), timer.remaining)
  }, [dismiss])

  const addToast = useCallback((type: Toast["type"], message: string) => {
    const id = ++nextId.current
    const remaining = type === "success" ? 4000 : 6000
    const timer: Timer = { remaining, startedAt: Date.now(), paused: new Set() }
    timer.timeout = setTimeout(() => dismiss(id), remaining)
    timers.current.set(id, timer)
    setToasts((current) => [...current, { id, type, message }])
  }, [dismiss])

  const api = useMemo<ToastApi>(() => ({
    success: (message) => addToast("success", message),
    error: (message) => addToast("error", message),
  }), [addToast])

  useEffect(() => {
    const activeTimers = timers.current
    return () => {
      activeTimers.forEach((timer) => clearTimeout(timer.timeout))
      activeTimers.clear()
    }
  }, [])

  const viewport = toasts.length > 0 ? (
    <section aria-label="การแจ้งเตือน" className="toast-viewport pointer-events-none fixed flex flex-col gap-3 overflow-y-auto">
      {toasts.map((toast) => (
        <ToastMessage key={toast.id} toast={toast} dismiss={dismiss} pause={pause} resume={resume} />
      ))}
    </section>
  ) : null

  return (
    <ToastContext.Provider value={api}>
      <ToastContainerContext.Provider value={setContainer}>
        {children}
        {container ? createPortal(viewport, container) : viewport}
      </ToastContainerContext.Provider>
    </ToastContext.Provider>
  )
}
