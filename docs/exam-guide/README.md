# คู่มือทำความเข้าใจ Vehicle Management สำหรับสอบโปรเจกต์

คู่มือนี้อธิบายโค้ดที่อยู่ใน working tree รวมส่วนที่ยังไม่ commit โดยอ่าน source เป็นหลักและเทียบ schema/migrations/เอกสารโดเมน ปรับปรุงวันที่ 15–16 ตุลาคม 2026 หลัง refactor frontend และเพิ่มขั้นตอน deploy ฐานข้อมูล Prisma Postgres

เริ่มที่บท 1 แล้วเปิดโค้ดตามลิงก์ในแต่ละบท แยกเนื้อหาเป็นไฟล์เพื่อให้อ่านเป็นรอบและใช้ค้นก่อนสอบได้ ไม่ต้องอ่านทั้งหมดในครั้งเดียว

## สารบัญ

| บท | เนื้อหา |
|---|---|
| [1. ภาพรวม โครงสร้าง และ schema](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/docs/exam-guide/01-architecture-and-schema.md) | สถาปัตยกรรม stack โฟลเดอร์ ความหมาย Prisma ทั้ง 8 ตารางทุกฟิลด์ enum, ER diagram และ migrations |
| [2. Frontend ทีละหน้า](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/docs/exam-guide/02-frontend-walkthrough.md) | React hooks/state/props, ทุก page/layout, component, ฟังก์ชันปุ่ม และ API ที่เรียก |
| [3. Auth สิทธิ์ API และ workflow](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/docs/exam-guide/03-auth-api-and-workflows.md) | JWT/cookie, role+permission, route methods, กฎการจอง การอนุมัติ รับ–คืน เปลี่ยนรถ ซ่อม และ notification |
| [4. ตัวชี้วัด AI อีเมล และ tests](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/docs/exam-guide/04-metrics-ai-email-and-tests.md) | Prisma query, สูตรรายงาน timezone/coverage/peers, AI ทุกโมดูล, SMTP, tests และ config |
| [5. ซ้อมสอบและตัวอย่างคำตอบ](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/docs/exam-guide/05-defense-practice.md) | ตัวอย่างเล่าโครงการ flow หนึ่งรายการ คำถาม 65 ข้อ และข้อจำกัดที่ต้องตอบให้ตรงกับโค้ด |
| [6. ดัชนีไฟล์และจุดเรียกใช้](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/docs/exam-guide/06-source-index.md) | ทุก source file ที่เขียนใน app/lib, local imports, ผู้ import, URL ที่อ้าง, ฟังก์ชัน/ชนิดข้อมูล และรายการ tests |
| [7. Deployment และ PostgreSQL บน cloud](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/docs/exam-guide/07-deployment-and-postgres.md) | build pipeline, pooled/direct URL, migrations, seed, environment และเส้นทาง request หลัง deploy |

## สิ่งที่ปรับปรุงในฉบับนี้

- บท 2 อธิบายการแยกหน้า 12 หน้าเป็น `_components`, `types.ts`, `constants.ts`, `utils.ts` พร้อมหน้าที่และ props ของไฟล์ใหม่ทุกตัว รวมตัวอย่างไล่ event จากปุ่มจนถึง API
- บท 1 ยังอธิบาย schema ทั้ง 8 ตารางครบทุกฟิลด์ และเพิ่ม data migrations 2 ชุดของเดือนกันยายน
- บท 7 แยกการเชื่อม DB ตอนรันเว็บออกจากการเชื่อมตอน migrate และอธิบาย build script ตามโค้ดจริง
- บท 6 สร้างดัชนี import/ผู้เรียกใช้/ฟังก์ชันใหม่ให้ตรงไฟล์ที่ย้ายแล้ว ส่วนบท 5 เพิ่มคำถาม refactor และ deployment

เทียบกับ commit `169c293` ซึ่งมีคู่มือเดิม: `app/api`, `lib`, `proxy.ts` และ `prisma/schema.prisma` ไม่มี diff ในการตรวจครั้งนี้ จึงคงคำอธิบายกฎธุรกิจเดิมไว้และปรับตำแหน่ง frontend/config ที่เปลี่ยน โค้ด refactor บางส่วนยังอยู่ใน working tree; คู่มือครอบคลุมส่วนนี้ด้วย การอ่าน config ยืนยันเส้นทาง deployment ที่เตรียมไว้ แต่ไม่ได้ยืนยันสถานะเว็บหรือข้อมูลในฐานข้อมูล cloud ขณะนี้

ถ้าอ่านฉบับเก่าจบแล้ว ให้เริ่มบท 2 ส่วน 9–11 → บท 7 → บท 5 ส่วน 11 แล้วใช้บท 6 เปิดไฟล์ที่ย้าย

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
6. Schema คือโครงสร้างข้อมูล Migration คือขั้นตอนเปลี่ยนโครงสร้างหรือข้อมูลที่มีประวัติเวอร์ชัน และ Seed คือกระบวนการเติมข้อมูลเริ่มต้น

## ขอบเขตการตรวจ

คู่มือเน้นอธิบาย source ของโครงการครบตามโมดูล หน้าจอ route และข้อมูล รวมไฟล์ที่ generate ในระดับหน้าที่และความสัมพันธ์ ไม่อธิบาย implementation ภายใน dependencies ทุกบรรทัด และไม่ได้แก้ business logic เพื่อให้ตรงกับคำอธิบาย

ตรวจวันที่ 15 ตุลาคม 2026: `npm test` ผ่าน 24 ไฟล์ รวม 99 tests; `npx tsc --noEmit --incremental false` ผ่าน; `npm run lint` ผ่านโดยมี warning unused import 1 จุดใน lib/__mocks__/prisma.ts ไม่มี lint error แล้ว รายละเอียดอยู่บท 4 ไม่ได้รัน build/E2E/migrate/seed หรือเรียกบริการอีเมล/AI จริง

เลขบรรทัดในบท 6 เป็นตำแหน่งตอนสร้างดัชนี หากแก้โค้ดภายหลังให้ใช้ชื่อฟังก์ชันประกอบการค้นหา และแยกข้อความใน CONTEXT/แผนจาก behavior ใน source หากไม่ตรงกัน
