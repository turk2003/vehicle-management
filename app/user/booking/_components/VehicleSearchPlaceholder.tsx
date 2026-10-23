import { Car } from "lucide-react"

export default function VehicleSearchPlaceholder() {
  return (
    <section className="rounded-xl bg-white px-6 py-12 text-center shadow-sm ring-1 ring-gray-200">
      <Car className="mx-auto h-10 w-10 text-gray-400" aria-hidden="true" />
      <h2 className="mt-4 text-lg font-semibold text-gray-950">
        ไม่พบรถที่ว่างในช่วงเวลาที่เลือก
      </h2>
      <p className="mt-2 text-sm text-gray-600">
        กรุณาเลือกช่วงเวลาอื่น หรือเปลี่ยนประเภทรถแล้วค้นหาอีกครั้ง
      </p>
    </section>
  )
}
