# สถานะการพัฒนา Project 2 (Vehicle Management System)

เอกสารนี้รวบรวมรายการสิ่งที่พัฒนาไปแล้ว และสิ่งที่ยังคงค้างอยู่จากแผนงานของ Project 2

## ✅ ส่วนที่ทำเสร็จไปแล้ว (Completed)

- [x] **อัปเดต Prisma Schema**: เพิ่ม fields `IN_USE`, แจ้งไมล์รถ (`mileageStart`, `mileageEnd`), วันที่รับ-คืนจริง, และฟิลด์เกี่ยวกับค่าใช้จ่ายและรายละเอียดใน Maintenance
- [x] **สร้าง Migration + อัปเดต Seed Data**
- [x] **API รับรถ + บันทึกไมล์ออก** (`/api/booking/pickup`)
- [x] **API คืนรถ + บันทึกไมล์คืน** (`/api/booking/return`)
- [x] **API ให้ USER แจ้งซ่อม** (`/api/user/maintenance`)
- [x] **เพิ่ม fields รายละเอียดซ่อมในระบบ Maintenance**
- [x] **API ประวัติรถ** (`/api/admin/vehicles/history`) และหน้า UI แสดงประวัติรถ

---

## ❌ ส่วนที่ยังไม่ได้ทำ (Pending)

### 📧 Phase 5: ระบบอีเมลแจ้งเตือน (Email Notification System)
- [ ] ตั้งค่า Email Service (เช่น การใช้งาน Nodemailer หรือ Resend)
- [ ] สร้างโฟลเดอร์และสร้าง Email Templates สำหรับการแจ้งเตือนรูปแบบต่างๆ
    - แจ้งเตือนเมื่อการจองได้รับการอนุมัติ / ถูกปฏิเสธ
    - แจ้งเตือนเมื่อมีการเปลี่ยนรถให้ใหม่
- [ ] ผูก Email trigger เข้ากับ API ในทุกจุดที่มีการเปลี่ยนสถานะ

### 🔄 Phase 6: ระบบรองรับกรณีฉุกเฉิน (Exception Handling)
- [ ] สร้าง API สำหรับเปลี่ยนรถ (`/api/admin/bookings/change-vehicle`) — ให้ Admin สามารถเปลี่ยนรถให้ผู้จองได้ในกรณีที่รถคันเดิมเสียระหว่างรอใช้งาน
- [ ] สร้าง Notification flow สำหรับแจ้งเตือน Admin ทันทีเมื่อมีรถถูกเปลี่ยนสถานะเป็นซ่อมบำรุง
- [ ] สร้าง UI สำหรับ Admin เพื่อทำรายการ "เปลี่ยนรถ" ในกรณีฉุกเฉิน

### 🧪 ขั้นตอนสุดท้าย
- [ ] เขียน Unit Tests เพิ่มเติมในส่วนของ Flow กรณีการเปลี่ยนรถ (Change Vehicle Flow)
- [ ] ทดสอบ Integration ทั้งระบบ (End-to-End Testing)
