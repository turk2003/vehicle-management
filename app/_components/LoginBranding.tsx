import { ShieldCheck } from "lucide-react"
import Image from "next/image"

export default function LoginBranding() {
  return (
    <section className="mb-8 flex flex-col justify-center lg:mb-0">
      <div className="mb-8 inline-flex h-20 w-20 items-center justify-center rounded-xl bg-white shadow-md">
        <Image
          src="/pea_logo.png"
          alt="PEA logo"
          width={64}
          height={64}
          priority
        />
      </div>

      <div className="max-w-xl">
        <p className="mb-3 inline-flex items-center gap-2 rounded-full bg-white px-3 py-1 text-sm font-medium text-purple-900">
          <ShieldCheck className="h-4 w-4" aria-hidden="true" />
          ระบบภายในสำหรับงานยานพาหนะ
        </p>
        <h1 className="text-3xl font-bold leading-tight text-white sm:text-4xl">
          ระบบจัดการยานพาหนะ
        </h1>
        <p className="mt-4 max-w-lg text-base leading-7 text-white/90">
          เข้าสู่ระบบเพื่อจองรถ ตรวจคำขออนุมัติ
          และจัดการข้อมูลยานพาหนะขององค์กรอย่างเป็นระบบ
        </p>
      </div>
    </section>
  )
}
