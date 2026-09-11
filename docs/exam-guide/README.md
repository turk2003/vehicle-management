# คู่มือทำความเข้าใจ Vehicle Management สำหรับสอบโปรเจกต์

คู่มือนี้อธิบายโค้ดที่อยู่ใน working tree รวมส่วนที่ยังไม่ commit โดยอ่าน source เป็นหลักและเทียบ schema/migrations/เอกสารโดเมน จัดทำต่อเนื่องวันที่ 5–6 กันยายน 2026

เริ่มที่บท 1 แล้วเปิดโค้ดตามลิงก์ในแต่ละบท แยกเนื้อหาเป็นไฟล์เพื่อให้อ่านเป็นรอบและใช้ค้นก่อนสอบได้ ไม่ต้องอ่านทั้งหมดในครั้งเดียว

## สารบัญ

| บท | เนื้อหา |
|---|---|
| [1. ภาพรวม โครงสร้าง และ schema](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/docs/exam-guide/01-architecture-and-schema.md) | สถาปัตยกรรม stack โฟลเดอร์ ความหมาย Prisma ทั้ง 8 ตารางทุกฟิลด์ enum, ER diagram และ migrations |
| [2. Frontend ทีละหน้า](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/docs/exam-guide/02-frontend-walkthrough.md) | React hooks/state/props, ทุก page/layout, component, ฟังก์ชันปุ่ม และ API ที่เรียก |
| [3. Auth สิทธิ์ API และ workflow](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/docs/exam-guide/03-auth-api-and-workflows.md) | JWT/cookie, role+permission, route methods, กฎการจอง การอนุมัติ รับ–คืน เปลี่ยนรถ ซ่อม และ notification |
| [4. ตัวชี้วัด AI อีเมล และ tests](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/docs/exam-guide/04-metrics-ai-email-and-tests.md) | Prisma query, สูตรรายงาน timezone/coverage/peers, AI ทุกโมดูล, SMTP, tests และ config |
| [5. ซ้อมสอบและตัวอย่างคำตอบ](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/docs/exam-guide/05-defense-practice.md) | ตัวอย่างเล่าโครงการ flow หนึ่งรายการ คำถาม 50 ข้อ และข้อจำกัดที่ต้องตอบให้ตรงกับโค้ด |
| [6. ดัชนีไฟล์และจุดเรียกใช้](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/docs/exam-guide/06-source-index.md) | ทุก source file ที่เขียนใน app/lib, local imports, ผู้ import, URL ที่อ้าง, ฟังก์ชัน/ชนิดข้อมูล และรายการ tests |

## แผนที่อ่านแบบย่อ

```text
หน้า React
  → lib/api.ts ส่ง HTTP
  → proxy.ts ตรวจว่ามี cookie
  → app/api/.../route.ts
  → lib/auth.ts ยืนยันตัวตน + อ่านบัญชีล่าสุด
  → lib/permissions.ts ตรวจ role และ permission
  → กฎธุรกิจใน route/lib
  → lib/prisma.ts → PostgreSQL
  → JSON → setState → หน้าจออัปเดต
```

เมื่อเปิดหน้าเว็บที่ป้องกันยังมี layout + lib/page-access.ts ตรวจฝั่ง server ด้วย การมีเมนูหรือซ่อนปุ่มเป็นเรื่อง UI ไม่ได้แทนการตรวจ API

## 6 เรื่องหลักที่ต้องเล่าให้ได้

1. User, Approver, Admin ทำงานต่างกัน และใช้ RolePermission ร่วมกันตามบทบาท
2. Booking.status เป็นวงจรของรายการ ส่วน Vehicle.status เป็นสถานะรถ จึงแยกกัน
3. รถว่างหรือไม่ต้องพิจารณาช่วงการจองและซ่อม ไม่ใช่ดู AVAILABLE อย่างเดียว
4. เวลาที่จองกับเวลารับ–คืนจริงเป็นคนละฟิลด์ ระยะทางคำนวณจากเลขไมล์เที่ยวจริง
5. สูตรแนะนำรถเป็น heuristic ใน API ส่วน AI มีหน้าที่สรุปตัวชี้วัดที่ server คำนวณ
6. Schema คือโครงสร้างข้อมูล Migration คือการเปลี่ยนโครงสร้าง และ Seed คือข้อมูลเริ่มต้น

## ขอบเขตการตรวจ

คู่มือเน้นอธิบาย source ของโครงการครบตามโมดูล หน้าจอ route และข้อมูล รวมไฟล์ที่ generate ในระดับหน้าที่และความสัมพันธ์ ไม่อธิบาย implementation ภายใน dependencies ทุกบรรทัด และไม่ได้แก้ business logic เพื่อให้ตรงกับคำอธิบาย

ตรวจ `npm test`: ผ่าน 24 ไฟล์ รวม 99 tests ตรวจ `npm run lint`: พบ error เดิมจาก `any` ใน prisma/seed.ts และ warning unused import ใน lib/__mocks__/prisma.ts รายละเอียดอยู่บท 4 ไม่ได้รัน build/E2E/migrate/seed หรือเรียกบริการอีเมล/AI จริง

เลขบรรทัดในบท 6 เป็นตำแหน่งตอนสร้างดัชนี หากแก้โค้ดภายหลังให้ใช้ชื่อฟังก์ชันประกอบการค้นหา และแยกข้อความใน CONTEXT/แผนจาก behavior ใน source หากไม่ตรงกัน
