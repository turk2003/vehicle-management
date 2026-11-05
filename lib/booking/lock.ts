import type { Prisma } from "@/app/generated/prisma/client"

/**
 * ล็อกตารางเวลาของรถหนึ่งคันไว้จนจบ transaction (PostgreSQL advisory lock)
 *
 * ใช้กัน race condition แบบ "check-then-insert": ถ้ามีสอง request จองรถคันเดียวกันพร้อมกัน
 * request ที่สองจะรอจน request แรก commit แล้วจึงเช็ค conflict ต่อ จึงเห็น booking ที่เพิ่งสร้าง
 * lock จะถูกปล่อยอัตโนมัติเมื่อ transaction commit หรือ rollback
 *
 * ทุกโค้ดที่สร้าง/แก้ช่วงเวลาการจองของรถต้องเรียกฟังก์ชันนี้ก่อนเช็ค conflict เสมอ
 */
export async function lockVehicleSchedule(
  tx: Prisma.TransactionClient,
  vehicleId: string,
) {
  // ใช้ $executeRaw เพราะ pg_advisory_xact_lock คืนค่า void ซึ่ง $queryRaw แปลงผลไม่ได้
  await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtext(${vehicleId}))`
}
