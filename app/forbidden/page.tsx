import Link from "next/link"
import { ShieldX } from "lucide-react"

export default function ForbiddenPage() {
  return (
    <main className="flex min-h-[70vh] items-center justify-center bg-slate-50 px-4 py-12">
      <section className="w-full max-w-lg rounded-2xl bg-white p-8 text-center shadow-sm ring-1 ring-slate-200">
        <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-rose-50 text-rose-700">
          <ShieldX className="h-7 w-7" aria-hidden="true" />
        </span>
        <h1 className="mt-5 text-2xl font-semibold text-slate-950">
          ไม่มีสิทธิ์เข้าถึงหน้านี้
        </h1>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          บัญชีของคุณยังเข้าสู่ระบบอยู่ แต่ไม่ได้รับสิทธิ์สำหรับเมนูหรือการทำรายการนี้
        </p>
        <Link
          href="/"
          className="mt-6 inline-flex min-h-11 items-center justify-center rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-500/30"
        >
          กลับหน้าหลัก
        </Link>
      </section>
    </main>
  )
}
