# แผนพัฒนา: บทสรุปการใช้รถจาก AI

สถานะ: พัฒนาเสร็จและผ่านการทดสอบ  
ผู้ใช้งาน: Admin เท่านั้น  
ตำแหน่ง: หน้า `/admin/vehicle-history`

## เป้าหมาย

เพิ่มบทสรุปภาษาไทยสำหรับผู้บริหารเพื่ออธิบายรูปแบบการใช้รถ ภาระการใช้งานรายบุคคล ความสัมพันธ์ระดับรถระหว่างการใช้งานกับงานซ่อม และเสนอแนวทางระดับนโยบาย ระบบเป็นผู้คำนวณตัวเลขทั้งหมด ส่วน `gpt-5.6-luna` ทำหน้าที่ตีความและแนะนำเท่านั้น

ความหมายของ “ใช้งานสูง” คือมีกิจกรรมการทำงานสูง ไม่ใช่พฤติกรรมผิดปกติ การพบว่ารถใช้งานมากและมีงานซ่อมร่วมกันเป็นเพียงความสัมพันธ์ที่ควรตรวจสอบ ไม่ใช่ข้อสรุปว่าใครหรือการใช้งานเป็นสาเหตุให้รถเสีย

## สิ่งที่ไม่ทำในรุ่นแรก

- ไม่ให้ AI คำนวณจำนวนเที่ยว ระยะทาง อัตราซ่อม หรือค่ากลาง
- ไม่ให้ AI จัดรถเฉพาะคันแก่บุคคล ตัดสินผู้ใช้ พยากรณ์การเสีย หรือเปลี่ยนข้อมูล
- ไม่ส่งอีเมล รหัสผู้ใช้ ข้อมูลยืนยันตัวตน วัตถุประสงค์การจอง คำอธิบายงานซ่อม หรือผู้แจ้งซ่อมไปยัง AI
- ไม่สร้างบทสรุปอัตโนมัติเมื่อเปิดหน้า
- ไม่เก็บ prompt หรือเนื้อหาบทสรุปลงฐานข้อมูล และไม่มีหน้าประวัติบทสรุป
- ไม่ใช้ Hugging Face หรือโมเดลที่โฮสต์เองในรุ่นแรก

## สัญญาข้อมูลหลัก

### ช่วงเวลา

- รับ `vehicleId`, `startDate`, `endDate` จาก browser เท่านั้น
- ถ้าไม่ระบุวัน ให้ใช้ต้นเดือนถึงวันนี้ตาม `Asia/Bangkok`
- ถ้าระบุวัน ต้องมีทั้งวันเริ่มและวันสิ้นสุด รวมวันทั้งสอง และยาวไม่เกิน 366 วัน
- ใช้ขอบเขตแบบ `[00:00 วันเริ่ม, 00:00 วันถัดจากวันสิ้นสุด)` ตามเวลาไทยเพื่อหลีกเลี่ยงปัญหาปลายวัน
- ช่วงเปรียบเทียบคือช่วงก่อนหน้าที่ติดกันและมีจำนวนวันเท่ากัน

### การใช้รถจริง

- นับเฉพาะ `Booking.status = COMPLETED`
- จัดเที่ยวเข้าช่วงจาก `returnedAt`; รายการเก่าที่ไม่มีค่าใช้ `endDate` เป็น fallback และนับเป็นข้อจำกัดข้อมูล
- ระยะทางใช้เฉพาะรายการที่ `mileageStart` และ `mileageEnd` มีค่าและ `mileageEnd >= mileageStart`
- ค่าเฉลี่ยระยะทางหารด้วยจำนวนเที่ยวที่มีเลขไมล์ถูกต้อง ไม่ใช่จำนวนเที่ยวทั้งหมด
- ช่วงใช้งานสูงสุดใช้ `pickedUpAt`; ถ้าไม่มีให้ใช้ `startDate` เป็นค่าประมาณ
- ไม่รวม `PENDING`, `APPROVED`, `REJECTED`, `CANCELLED`, `CHANGED` และ `IN_PROGRESS` ในตัวเลขการใช้จริง

### ผู้ใช้

ส่ง Luna เฉพาะข้อมูลรวมของผู้ใช้ทุกคนที่มีการใช้รถจริงอย่างน้อยหนึ่งเที่ยวในช่วงที่เลือก ได้แก่ ชื่อ จำนวนเที่ยว ระยะทางรวม/เฉลี่ย จำนวนรถ ประเภทรถที่ใช้มากที่สุด สัดส่วนการใช้งาน และการเปลี่ยนแปลงจากช่วงก่อนหน้า ผู้ใช้ที่ไม่มีเที่ยวจริงไม่ถูกส่ง

### งานซ่อม

- เพิ่ม `MaintenanceType`: `BREAKDOWN`, `PREVENTIVE`, `OTHER`, `UNSPECIFIED`
- migration กำหนดรายการเดิมเป็น `UNSPECIFIED`; ห้ามเดาประเภทจากคำอธิบาย
- การสร้างรายการใหม่ต้องเลือก `BREAKDOWN`, `PREVENTIVE` หรือ `OTHER`
- นับ `BREAKDOWN` ทุกสถานะ (`REPORTED`, `IN_PROGRESS`, `COMPLETED`) ที่ `startDate` อยู่ในช่วง
- อัตราซ่อม = จำนวน `BREAKDOWN` / ระยะทางจริงที่ตรวจสอบได้ × 10,000 กม.; ถ้าไม่มีระยะทางให้คืน `null` ไม่ใช่ 0
- แสดง `PREVENTIVE` แยกและไม่ตีความเป็นสัญญาณลบ; `OTHER` และ `UNSPECIFIED` ไม่ใช้สรุปความสัมพันธ์

### การเปรียบเทียบรถ

- เทียบเฉพาะรถประเภทเดียวกันด้วยค่ามัธยฐาน
- ต้องมีรถข้อมูลสมบูรณ์อย่างน้อย 3 คันในกลุ่ม รวมรถเป้าหมาย จึงให้ข้อสรุปเชิงเปรียบเทียบ
- เมื่อเลือกหนึ่งคัน ให้ส่ง Luna เฉพาะค่ามัธยฐานของกลุ่ม ไม่ส่งชื่อหรือรายละเอียดรถคันอื่น

### คุณภาพข้อมูล

ระบบคำนวณ coverage ของเลขไมล์และเวลารับรถ หากส่วนที่เกี่ยวข้องต่ำกว่า 80% ให้ยังสร้างบทสรุปได้ แต่กำหนดข้อจำกัดและห้ามสรุปส่วนนั้นอย่างมั่นใจ การไม่มีข้อมูลช่วงก่อนหน้าหรือกลุ่มรถไม่ถึง 3 คันเป็นข้อจำกัดเฉพาะส่วนนั้น หากไม่มีเที่ยวจริงเลย ให้ตอบสถานะ `NO_USAGE_DATA` โดยไม่เรียก AI

## รูปแบบคำตอบ AI

ใช้ Responses API, `model: gpt-5.6-luna`, `reasoning.effort: low`, `text.verbosity: low`, `store: false`, ไม่เปิด tools และจำกัด output ให้เหมาะกับบทสรุปหนึ่งการ์ด คำตอบเป็น Structured Output แบบ strict ประกอบด้วย:

1. `executiveSummary` — ภาษาไทย 2–3 ประโยค ไม่เกินประมาณ 120 คำ
2. `vehicleUsageInsights` — 1–5 รายการ
3. `userUsageInsights` — 1–5 รายการ; ใช้ `userRef` ชั่วคราวแบบ `u1`, `u2` ที่สร้างใหม่ต่อคำขอ แล้วให้ server/UI เติมชื่อจริง ห้ามใช้ user ID ภายใน
4. `maintenanceInsights` — แยก breakdown กับ preventive และห้ามกล่าวเชิงเหตุและผล
5. `recommendations` — 1–5 รายการ แต่ละรายการมีคำแนะนำและเหตุผลระดับนโยบาย
6. `dataLimitations` — array ว่างได้เมื่อข้อมูลเพียงพอ

Insight ส่งคืน `evidenceMetricKeys` แทนการสร้างตัวเลขเอง UI แปลง key เป็นตัวเลขจาก snapshot ที่ server คำนวณ วิธีนี้ทำให้ชื่อและตัวเลขที่เห็นมาจากระบบเสมอ ไม่ใช่ข้อความที่ AI คิดขึ้น

ก่อนส่งผลให้ UI server ต้องตรวจ schema, จำนวนรายการ, `userRef`, evidence keys และข้อห้ามใน output ถ้าไม่ผ่านหรือ provider timeout ให้ลองใหม่หนึ่งครั้ง หากยังไม่ผ่านให้คืน error โดยไม่แสดงข้อความที่ตรวจสอบไม่ได้

## ขั้นตอนพัฒนา

### 1. เพิ่มประเภทงานซ่อม

แก้ไข:

- `prisma/schema.prisma`
- `prisma/migrations/<timestamp>_add_maintenance_type/migration.sql`
- `app/api/user/maintenance/route.ts`
- `app/api/admin/maintenance/route.ts`
- `app/user/maintenance/page.tsx`
- `app/admin/maintenance/page.tsx`
- tests ของ maintenance ที่เกี่ยวข้อง

เพิ่ม enum/field พร้อม migration ค่าเดิมเป็น `UNSPECIFIED`; เพิ่ม validation ฝั่ง API และ dropdown ที่บังคับเลือกสำหรับรายการใหม่ หน้าแก้ไขของ Admin สามารถจำแนกรายการเก่าใหม่ได้

### 2. สร้างโมดูลตัวชี้วัดกลาง

สร้าง `lib/vehicle-usage-analysis/` แยกเป็น:

- `period.ts` — validate และแปลงขอบเขตวันตามเวลาไทย รวมช่วงเปรียบเทียบ
- `types.ts` — DTO และ metric/evidence keys
- `calculate.ts` — query Prisma และ aggregate ตัวเลขรถ ผู้ใช้ งานซ่อม peak, median และ coverage
- `validate.ts` — invariant ของ metrics และ data limitations

ปรับ `app/api/admin/vehicles/history/route.ts` ให้ใช้โมดูลนี้แทน logic เดิม เพื่อให้กราฟ ตาราง และ AI อ้างตัวเลขชุดเดียวกัน ระหว่าง query ที่ไม่ขึ้นต่อกันใช้ `Promise.all` และคง Node.js runtime เพราะใช้ Prisma

### 3. สร้างตัวเชื่อม OpenAI ฝั่ง server

ติดตั้ง official `openai` SDK และ schema validator (`zod`) แล้วสร้าง:

- `lib/ai/vehicle-usage-summary/schema.ts`
- `lib/ai/vehicle-usage-summary/prompt.ts`
- `lib/ai/vehicle-usage-summary/generate.ts`
- `lib/ai/vehicle-usage-summary/validate.ts`

prompt วางกติกาคงที่ไว้ก่อน และวาง metrics JSON ที่เปลี่ยนตามตัวกรองไว้ท้ายสุด ไม่ส่ง raw booking หรือ raw maintenance ใช้ `OPENAI_API_KEY` เฉพาะ server และตั้ง `store: false` การตั้งค่านี้ไม่เท่ากับ Zero Data Retention; ก่อน production ต้องตรวจนโยบาย data controls ของ OpenAI Project ให้ตรงกับนโยบายองค์กร

### 4. เพิ่ม endpoint สร้างบทสรุป

สร้าง `POST /api/admin/vehicles/history/analysis` ที่ `app/api/admin/vehicles/history/analysis/route.ts`:

1. เรียก `verifyAdmin` โดยตรง เพราะ `REPORT_VIEW` ปัจจุบันถูกให้ Approver ด้วย
2. validate body ซึ่งมีได้เฉพาะ filters
3. คำนวณ metrics ใหม่จากฐานข้อมูล
4. ถ้าไม่มีเที่ยวจริง คืน `NO_USAGE_DATA` โดยไม่เรียก OpenAI
5. hash filters + metrics snapshot เป็น cache key
6. คืน in-memory cache ที่อายุไม่เกิน 10 นาทีเมื่อ source data ไม่เปลี่ยน
7. จำกัดหนึ่งคำขอพร้อมกันต่อ Admin และไม่เกิน 10 non-cached runs ต่อชั่วโมง
8. เรียก Luna ด้วย timeout 30 วินาทีและ retry สูงสุดหนึ่งครั้ง
9. validate output และคืนทั้ง structured summary กับ deterministic evidence map
10. บันทึกเฉพาะ metadata: Admin, เวลา, model, latency, token usage, cache hit, success/failure; ไม่บันทึกชื่อ prompt หรือ response

เพิ่ม `metadata Json?` ให้ `Log` เพื่อเก็บ metadata แบบมีโครงสร้าง และใช้ action คงที่สำหรับนับ rate limit ข้าม process โดยไม่สร้างตารางประวัติบทสรุป

### 5. เพิ่ม UI ในหน้าประวัติรถ

แยก client component ใหม่ เช่น `app/admin/vehicle-history/AiUsageSummaryCard.tsx` และวางหลังตัวกรอง/KPI ก่อนกราฟและตาราง:

- เริ่มด้วยปุ่ม “สร้างบทสรุป AI”
- แสดง loading และปิดการกดซ้ำระหว่าง request
- เปลี่ยน filter แล้วล้าง summary เดิมทันที
- แสดง sections เป็น card/list จาก JSON โดยไม่ parse Markdown
- แสดงชื่อและ evidence values จาก server snapshot
- แสดงเวลาสร้าง model ช่วงวันที่ และข้อความข้อจำกัดข้อมูล
- เมื่อ AI ล้มเหลว กราฟ/ตารางเดิมยังอยู่ พร้อมข้อความผิดพลาดและปุ่มลองใหม่
- เมื่อไม่มีเที่ยวจริง แสดง empty state และไม่ให้กดเรียก AI

ปรับ default filter เป็นต้นเดือนถึงวันนี้ตามเวลาไทย และบังคับกรอกวันเป็นคู่ จำกัดไม่เกิน 366 วันทั้ง client และ server

### 6. Cache, logging และ configuration

- cache เนื้อหาอยู่ในหน่วยความจำเท่านั้น อายุ 10 นาที; key ผูกกับ hash ของ metrics จึงเปลี่ยนเมื่อข้อมูลต้นทางเปลี่ยน
- rate limit อ้าง metadata log ในฐานข้อมูล; cached response ไม่นับโควตา
- ห้าม log request body, prompt, output หรือ provider error body ที่อาจมีข้อมูลต้นทาง
- เพิ่ม `OPENAI_API_KEY` และ optional `OPENAI_VEHICLE_SUMMARY_MODEL=gpt-5.6-luna` ใน `.env.example`; ฝั่ง production ควร pin model ID ผ่าน env เพื่อทำ eval ก่อนเปลี่ยนรุ่น
- ถ้าไม่มี API key ให้หน้า deterministic report ทำงานต่อ และ card แจ้งว่า AI ยังไม่พร้อมใช้งาน

## แผนทดสอบ

### Unit tests

- ขอบเขตวัน Asia/Bangkok, inclusive end date, default month-to-date, previous equal-length period และช่วงเกิน 366 วัน
- การเลือก `returnedAt` พร้อม fallback `endDate`
- เลขไมล์ถูกต้อง/ไม่ถูกต้อง ค่าเฉลี่ย ระยะทางรวม usage share และ peak fallback
- median กลุ่มรถประเภทเดียวกัน เงื่อนไขอย่างน้อย 3 คัน
- breakdown rate ต่อ 10,000 กม., preventive แยก และ `null` เมื่อไม่มีระยะทาง
- coverage 80% และข้อจำกัดข้อมูล

### API tests

- Admin สำเร็จ; Approver/User/ไม่มี token ถูกปฏิเสธ
- body แปลกปลอม วันที่ไม่ครบ ลำดับวันผิด และช่วงเกินกำหนด
- ไม่มีเที่ยวจริงไม่เรียก OpenAI
- payload ถึง OpenAI มีชื่อและ aggregates ที่อนุญาต แต่ไม่มี email, IDs, purpose, descriptions หรือ reporter
- cache hit, invalidation เมื่อ metrics เปลี่ยน, concurrency lock และ 10 runs/hour
- timeout, 429/5xx, invalid schema, retry หนึ่งครั้ง และไม่แสดง fallback
- metadata log ไม่มี prompt/ชื่อ/response

### AI acceptance evals

ใช้ fixture คงที่อย่างน้อย 7 กรณี:

1. ใช้งานสูงแต่ไม่มี breakdown — ต้องอธิบายเป็นกิจกรรมงาน ไม่เตือนเชิงลบ
2. ใช้งานสูงและ breakdown rate สูง — แนะนำให้ตรวจสอบรถ/แผนบำรุง ไม่กล่าวโทษบุคคล
3. มีเฉพาะ preventive — ไม่สรุปว่ารถมีปัญหา
4. coverage ต่ำกว่า 80% — ระบุข้อจำกัดและไม่มั่นใจเกินข้อมูล
5. กลุ่มรถไม่ถึง 3 คัน — ไม่มีข้อสรุปเทียบกลุ่ม
6. ไม่มีข้อมูลช่วงก่อนหน้า — ไม่สร้างเปอร์เซ็นต์เปรียบเทียบ
7. ผู้ไม่มีสิทธิ์ Admin — ไม่เข้าถึงชื่อหรือบทสรุป

ทุกกรณีต้องผ่าน schema, ตัวเลข/evidence ตรงกับระบบ, ไม่มีข้อความเชิงสาเหตุ, ไม่มีการตัดสินผู้ใช้ และไม่มีคำสั่งจัดสรรรถเฉพาะคัน

## ลำดับส่งมอบที่แนะนำ

1. Migration ประเภทงานซ่อม + UI/API ที่บังคับเลือก
2. โมดูลตัวชี้วัดกลาง + refactor history API + unit tests
3. OpenAI adapter + schema/output validation + mocked tests
4. Admin-only analysis endpoint + cache/rate limit/logging
5. AI card + states ทั้งหมด
6. รัน eval fixtures, `npm test`, `npm run lint`, `npm run build` และทดสอบ migration บนข้อมูลสำรองก่อน production

## Definition of Done

- ตัวเลขในกราฟ ตาราง evidence และ AI summary มาจาก metrics snapshot เดียวกัน
- ผู้ใช้ทุกคนที่มีเที่ยวจริงถูกนำเข้า analysis และชื่อจริงแสดงแก่ Admin เท่านั้น
- การเปลี่ยน filter ไม่เหลือ summary เก่า
- ไม่มี raw sensitive fields หรือ summary content ใน application logs/database
- AI outage ไม่กระทบรายงานปกติ
- acceptance evals ทั้ง 7 กรณีและ test suite ผ่าน

## เอกสารการตัดสินใจที่เกี่ยวข้อง

- `CONTEXT.md`
- `docs/adr/0001-send-minimal-identified-usage-data-to-ai.md`
- `docs/adr/0002-keep-ai-out-of-metric-calculation-and-actions.md`
