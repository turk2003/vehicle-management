# บทที่ 5 — ตัวอย่างเล่าระบบ คำถามซ้อมสอบ และขอบเขตที่ต้องตอบตรง

## 1. ตัวอย่างอธิบายโครงการภายในประมาณ 2 นาที

“โครงการนี้เป็นระบบจัดการยานพาหนะภายในองค์กร ครอบคลุมตั้งแต่การขอใช้รถ การอนุมัติ การรับและคืนรถ ไปจนถึงงานซ่อมบำรุงและรายงานการใช้งาน โดยแบ่งผู้ใช้เป็นผู้ขอใช้ ผู้อนุมัติ และผู้ดูแลระบบ

ตัวเว็บพัฒนาด้วย Next.js และ React ใช้ TypeScript ช่วยตรวจชนิดข้อมูล หน้าเว็บเรียก backend ผ่าน API Route Handler ที่อยู่ในโครงการเดียวกัน ส่วนข้อมูลเก็บใน PostgreSQL และเข้าถึงผ่าน Prisma

เมื่อผู้ใช้จองรถ ระบบตรวจช่วงเวลาของการจองและงานซ่อมที่ทับกันก่อนสร้างคำขอสถานะรออนุมัติ หลังพิจารณาแล้ว ผู้ใช้หรือ Admin บันทึกเลขไมล์ตอนรับและคืน ทำให้แยกกำหนดการจองออกจากหลักฐานการใช้จริงได้ หากรถเดิมต้องซ่อมก่อนรับรถ Admin สามารถเลือกรถทดแทนตามเงื่อนไขและบันทึกเหตุผล

ด้านสิทธิ์ ระบบใช้ JWT ใน HttpOnly cookie และอ่านบทบาทกับสถานะบัญชีล่าสุดจากฐานข้อมูล พร้อมตรวจ permission ของบทบาทในแต่ละ API และตรวจเจ้าของรายการในงานของผู้ใช้

รายงานคำนวณตัวเลขจากการใช้รถที่เสร็จสิ้น เช่นเที่ยวและระยะทาง โดยมีการเปิดเผยข้อมูลที่ไม่ครบ จากนั้น Admin สามารถสั่งให้ AI สรุปข้อมูลรวมเป็นภาษาไทย ตัวเลขและการตัดสินใจจัดสรรรถยังอยู่ในระบบและอยู่กับผู้รับผิดชอบ ไม่ได้ให้ AI แก้การจองโดยอัตโนมัติ”

## 2. ตัวอย่างการไหลของข้อมูลหนึ่งรายการ

ใช้ข้อมูลสมมติเพื่อซ้อม ไม่ใช่ข้อมูลผู้ใช้จริงในฐานข้อมูล:

| ขั้น | Booking | Vehicle | จุดที่เกิดในโค้ด |
|---|---|---|---|
| ผู้ใช้ส่งคำขอรถ A พรุ่งนี้ 09:00–12:00 | สร้าง PENDING, purpose, destination | ยังไม่เปลี่ยนตอน POST | booking POST |
| ผู้พิจารณาอนุมัติ | APPROVED และ approverId | route ตั้ง BOOKED | approver PUT |
| มี GET ที่เรียก sync ก่อนถึงช่วงจอง | ยัง APPROVED | อาจกลับ AVAILABLE หากไม่มี active งานอื่นในตอนนั้น | syncAllVehicleStatuses |
| ถึงช่วงจองและมี sync | ยัง APPROVED | BOOKED | syncAllVehicleStatuses |
| ผู้ใช้รับรถเลขไมล์ 10,000 | IN_PROGRESS, mileageStart=10000, pickedUpAt | IN_USE | booking/pickup PUT |
| คืนเลขไมล์ 10,120 | COMPLETED, mileageEnd=10120, returnedAt | currentMileage=10120; status ตามงานอื่น | booking/return PUT |
| ดูรายงานครอบคลุมวันคืน | นับเที่ยวนี้ | ได้ระยะทางเที่ยว 120 กม. | calculateVehicleUsageAnalysis |
| Admin กด AI | ไม่มีการเปลี่ยน booking จากคำตอบ AI | ไม่มีการเปลี่ยนรถจากคำตอบ AI | analysis POST / generate |

ประเด็นอธิบาย: AVAILABLE เป็นสถานะปัจจุบัน ไม่ใช่คำยืนยันว่าทุกช่วงเวลาในอนาคตว่าง ดังนั้นต้องตรวจ overlap อีกเสมอ

## 3. คำถามเกี่ยวกับสถาปัตยกรรม

**1) Frontend กับ backend อยู่ตรงไหน?**

Frontend คือ page/component ใน app ที่ render React ส่วน backend คือ app/api/**/route.ts และ utility ฝั่ง server ใน lib ทั้งคู่ใช้ Next.js โครงการเดียวกัน

**2) ทำไมมีทั้ง page.tsx และ route.ts?**

page.tsx เป็น UI ของ URL หน้าเว็บ ส่วน route.ts ตอบ HTTP สำหรับข้อมูลหรือการทำรายการ เช่น `/user/booking` เป็นหน้าจอง และ `/api/booking` เป็น API ที่หน้าจองเรียก

**3) ทำไมต้องมี layout.tsx?**

ใช้ห่อหน้าลูกด้วยสิ่งที่ใช้ร่วมกัน เช่น Navbar และการตรวจสิทธิ์ โดย role layout ตรวจบทบาท ส่วน layout ของแต่ละ feature ตรวจ permission

**4) “use client” คืออะไร?**

เป็นขอบเขต component ฝั่ง client สำหรับงานที่ใช้ state/effect/event และ browser API ไม่ได้แปลว่าทั้งโปรเจกต์รันเฉพาะ browser เพราะ route กับ layout ที่ป้องกันยังทำงานบน server

**5) ทำไมไม่ให้หน้าเว็บติดต่อ PostgreSQL โดยตรง?**

การอ่านเขียนต้องผ่าน server เพื่อใช้ credentials ฝั่ง server และบังคับ auth/permission/กฎธุรกิจ ก่อนให้ Prisma ติดต่อฐานข้อมูล

**6) @/ ใน import หมายถึงอะไร?**

alias ใน tsconfig.json ให้ `@/*` ชี้โฟลเดอร์ root เช่น `@/lib/api` คือ lib/api.ts ทำให้ไม่ต้องเขียน ../ หลายชั้น

**7) ตอนกรอก purpose ข้อมูลเข้า DB ทันทีไหม?**

ยังไม่เข้า onChange เปลี่ยน React state เท่านั้น ต้อง submit เรียก API และ server create/update ก่อนจึงถูกเก็บ

**8) ทำไมบางหน้าต้อง fetch ใหม่ แต่บางหน้าใช้ map แก้ array?**

หน้าที่ server อาจเปลี่ยนข้อมูลเกี่ยวข้องหลายชุด เช่นการจอง จะโหลดใหม่เพื่อได้สถานะล่าสุด ส่วน CRUD รถ/ผู้ใช้หลายฟังก์ชันใช้ response ที่ server ยืนยันมาแทนแถวใน state ได้เลย

## 4. คำถามฐานข้อมูล

**9) มีทั้งหมดกี่ตาราง และตารางหลักคืออะไร?**

มี 8 models: User, VehicleType, Vehicle, Booking, Maintenance, Notification, Log และ RolePermission จุดศูนย์กลางวงจรใช้รถคือ Booking ซึ่งเชื่อมผู้ขอ รถ และผู้อนุมัติ

**10) User กับ Vehicle เป็น many-to-many หรือไม่?**

ในเชิงประวัติ ผู้ใช้หลายคนใช้รถหลายคันได้ โดยเชื่อมผ่าน Booking แต่ละ Booking มี user หนึ่งคนและรถหนึ่งคัน พร้อมข้อมูลเหตุการณ์อย่างวันเวลาและเลขไมล์ จึงเป็นความสัมพันธ์ผ่าน entity ที่มีข้อมูลธุรกิจ ไม่ใช่แค่ join table ว่าง ๆ

**11) ทำไม approverId เป็น null ได้?**

ตอนคำขออยู่ PENDING ยังไม่มีผู้พิจารณา จึงให้ null แล้วใส่หลังอนุมัติหรือปฏิเสธ

**12) ทำไมมี User relation สองตัวใน Booking?**

user เป็นเจ้าของคำขอ ส่วน approver เป็นผู้พิจารณา จึงตั้งชื่อ relation ฝั่ง approver ว่า Approver เพื่อแยกความหมาย

**13) ทำไมเก็บ mileageStart และ mileageEnd เป็น nullable?**

ตอนจองยังไม่มีเลขไมล์จริง และข้อมูลเก่าอาจไม่ครบ การเก็บ null สะท้อนว่าไม่ทราบ ต่างจาก 0 ซึ่งเป็นค่าตัวเลขจริง

**14) ใช้ currentMileage คำนวณระยะทางรายเดือนได้เลยไหม?**

ไม่ได้ เพราะเป็นค่าหน้าปัดล่าสุด ต้องรวม mileageEnd−mileageStart ของแต่ละเที่ยวในช่วงที่รายงานเลือก

**15) มี approvedAt หรือ Maintenance.createdAt ไหม?**

ไม่มีใน schema ปัจจุบัน Booking มี updatedAt แต่เปลี่ยนได้ทุกการแก้ผ่าน Prisma จึงไม่ใช่เวลาอนุมัติโดยเฉพาะ

**16) index กันจองซ้ำหรือไม่?**

index ช่วยค้นหาข้อมูล แต่การตรวจช่วงซ้ำอยู่ใน application query ไม่ได้ประกาศ constraint กันช่วงเวลาทับซ้อนใน schema

**17) ลบผู้ใช้ที่มีประวัติได้ไหม?**

API กันการลบถาวรเมื่อมี booking/approval/maintenance/notification/log และมีการปิด isActive เพื่อรักษาประวัติแทน

**18) migration กับ generate ต่างกันอย่างไร?**

migration เปลี่ยนโครงสร้างฐานข้อมูลด้วย SQL ส่วน generate สร้าง Prisma Client/types ตาม schema และไม่ได้เท่ากับปรับ DB จริง

## 5. คำถาม authentication และ permission

**19) JWT เก็บไว้ที่ไหน?**

ใน cookie ชื่อ token โดย login route ตั้ง HttpOnly และอายุ 1 วัน ไม่พบการเก็บ token ใน localStorage ใน flow ปัจจุบัน

**20) ถอด JWT ได้เท่ากับล็อกอินผ่านหรือไม่?**

ต้องตรวจลายเซ็น/อายุด้วย jwt.verify และตรวจ user ที่ยังมีอยู่กับ isActive จาก DB ไม่ใช่แค่อ่าน payload แล้วเชื่อ

**21) ทำไม token มี role แล้วต้องอ่าน role จาก DB อีก?**

เพื่อใช้สิทธิ์ล่าสุดหลังเปลี่ยนบทบาท และตัดการใช้ของบัญชีที่ถูกปิดก่อน token หมดอายุ

**22) ซ่อนปุ่มแล้วปลอดภัยพอไหม?**

ไม่พอ ผู้เรียกอาจส่ง request เองได้ จึงใช้ requireAccess ใน API และเช็ก userId ของรายการสำหรับงานของ USER

**23) ADMIN ได้ทุกสิทธิ์โดยอัตโนมัติหรือไม่?**

seed ตั้งสิทธิ์ให้ครบ แต่ runtime ยังอ่าน RolePermission และตรวจ permission จริง พร้อมขอบเขต role ของ endpoint ดังนั้นเป็นผลของข้อมูลและ policy ไม่ใช่ bypass อัตโนมัติ

**24) ผู้ใช้หนึ่งคนปรับ permission ต่างจากคนอื่น role เดียวกันได้ไหม?**

schema ปัจจุบันกำหนดสิทธิ์ระดับ role ไม่มี user-permission override

**25) 401 กับ 403 ต่างกันอย่างไร?**

401 คือยืนยันตัวตนไม่ได้ เช่น token หมดอายุ ส่วน 403 คือยืนยันตัวตนผ่านแต่ไม่มีสิทธิ์หรือไม่ใช่เจ้าของรายการ ใน login มี 403 แบบ ACCOUNT_INACTIVE สำหรับบัญชีที่ถูกปิดด้วย

**26) Proxy ตรวจทุกอย่างแล้วหรือยัง?**

ยัง ตรวจแค่มี cookie; auth, role และ permission ตรวจจริงใน server layout/route

**27) ใช้ Bearer token ผ่าน proxy ได้เสมอไหม?**

auth helper รองรับ Bearer แต่ proxy ในรุ่นนี้ต้องมี cookie จึงไม่ควรบอกว่าการเรียกด้วย Bearer อย่างเดียวใช้ได้ครบเส้นทาง

**28) Logout ยกเลิก JWT ทุกสำเนาหรือไม่?**

โค้ดลบ cookie ของ browser ไม่มี blacklist ของ token ทุกสำเนา ส่วนการปิดบัญชีมีผลจากการตรวจ DB ตอน request ถัดไป

## 6. คำถามกฎการจองและซ่อม

**29) ทำไม PENDING ก็กันช่วงเวลา?**

query ระบุ PENDING เป็นสถานะที่ conflict จึงถือว่าคำขอที่กำลังพิจารณายึดช่วงไว้แล้ว เป็น policy ปัจจุบันของระบบ

**30) จองต่อพอดีเมื่ออีกคนจบเวลาเดียวกันได้ไหม?**

โค้ดใช้ <= และ >= จึงถือว่าชนที่ขอบเวลา เช่นเดิมจบ 12:00 ใหม่เริ่ม 12:00 ยัง conflict

**31) BOOKED ต่างจาก IN_USE อย่างไร?**

BOOKED คือรถอยู่ในสถานะจอง ส่วน IN_USE เกิดจากรับรถไปใช้งานแล้ว และ Booking จะเป็น IN_PROGRESS พร้อม pickedUpAt/mileageStart

**32) คืนรถครบกำหนดอัตโนมัติหรือไม่?**

กำหนดจบการจองไม่ใช่หลักฐานคืนรถ Booking IN_PROGRESS ต้องผ่าน return เพื่อบันทึก returnedAt และ mileageEnd

**33) รับ–คืนแทนผู้ใช้ที่ถูกปิดบัญชีได้อย่างไร?**

Admin มี pickup/return endpoint ของตนโดยใช้ BOOKING_MANAGE ไม่ต้องให้เจ้าของรายการเข้าใช้งานเพื่อทำรายการ

**34) ทำไมเปลี่ยนรถต้อง transaction?**

Booking ต้องชี้รถใหม่ รถใหม่ต้องเปลี่ยนสถานะ และ notification/log ต้องสัมพันธ์กัน หาก DB ขั้นใดผิดพลาดจะ rollback เป็นชุด ไม่ค้างบางส่วน การส่งอีเมลทำหลัง commit

**35) เลือกรถทดแทนเหมือนสูตรแนะนำรถไหม?**

ไม่เหมือน หน้า user ใช้คะแนนเลขไมล์ + จำนวนซ่อม×10,000 ส่วนรถทดแทนให้ประเภทเดียวกันก่อนแล้วใช้เลขไมล์/ทะเบียนในการเรียงตามโค้ด

**36) รถเสียกลางเที่ยวเปลี่ยนคันแล้วใช้ Booking เดิมต่อได้หรือไม่?**

change-vehicle ปัจจุบันกันรายการที่รับรถแล้วและต้องเป็น APPROVED/CHANGED จึงรองรับก่อนรับรถ ไม่ควรนำเสนอว่ามี workflow สลับรถกลางเที่ยวพร้อมต่อเลขไมล์ครบแล้ว

**37) แจ้งซ่อมแล้วรถเปลี่ยนสถานะทันทีทุกทางไหม?**

User POST สร้าง REPORTED กับการแจ้งเตือนก่อน การ sync เกิดเมื่อ GET บาง endpoint ถูกเรียก ขณะที่ Admin POST/PUT มี branch เปลี่ยนรถเอง จึงต้องอธิบายตามเส้นทาง

**38) งานซ่อมไม่กำหนดวันจบมีผลกับการค้นหารถอย่างไร?**

ถ้าเป็นงาน active ที่เริ่มก่อนหรือในช่วงขอใช้ และ endDate=null query ถือว่าอาจครอบคลุมต่อไป จึง block รถจากช่วงที่ทับกัน

## 7. คำถาม AI และรายงาน

**39) AI คำนวณระยะทางหรือไม่?**

ระบบคำนวณเองใน calculate.ts แล้วส่งข้อมูลรวมให้ AI ตีความและเลือก evidence keys ตัวเลขที่ UI แสดงมาจาก server

**40) ทำไมไม่รวมคำขออนุมัติแล้วเป็นจำนวนเที่ยวใช้จริง?**

APPROVED เป็นความตั้งใจหรือการอนุญาต ยังไม่ยืนยันว่าเดินทางและคืนรถแล้ว KPI ใช้ COMPLETED และมี fallback สำหรับข้อมูลเก่าที่ไม่มีเวลาคืน

**41) ไม่ใส่เลขไมล์หมายถึงวิ่ง 0 กม. หรือไม่?**

ไม่ใช่ getDistance คืน null และไม่นับเป็น validMileageTrips ผลรวม/ค่าเฉลี่ยจึงต้องอ่านคู่กับ coverage และข้อจำกัด

**42) ถ้าช่วงก่อนหน้าไม่มีเที่ยว ทำไม % เปลี่ยนแปลงเป็น null?**

เพราะสูตรหารด้วย previous=0 คำนวณไม่ได้ตามนิยาม จึงไม่แต่งให้เป็น 100% หรือ 0%

**43) ทำไมใช้ BREAKDOWN ต่อ 10,000 กม.?**

เพื่อเทียบงานขัดข้องกับปริมาณการวิ่ง ไม่ใช้จำนวนซ่อมดิบเพียงอย่างเดียว ส่วน PREVENTIVE เป็นงานตามแผนจึงไม่ใช่เหตุเสีย

**44) อัตราซ่อมบอกว่าใครทำรถเสียได้หรือไม่?**

ไม่ได้ เป็นข้อมูลที่เกิดร่วมกันระดับรถ ไม่ได้พิสูจน์เหตุ–ผลและไม่ใช่คะแนนความผิดของผู้ใช้

**45) AI เห็นข้อมูลส่วนบุคคลไหม?**

เห็นชื่อพร้อมข้อมูลรวมและทะเบียนรถ แต่ไม่ส่ง email/internal ID/password/raw purpose/destination/รายละเอียดซ่อมตาม payload ปัจจุบัน จึงต้องอธิบายว่าเลือกส่งเท่าที่กำหนด ไม่ใช่ไม่มีข้อมูลส่วนบุคคลเลย

**46) ทำไมใช้ Zod แล้วยังมี validateAiSummary?**

Zod ตรวจรูปทรง จำนวนและความยาว ส่วน validate ตรวจว่าชื่ออ้างอิงมีจริงและข้อความไม่ละเมิดกฎที่ตรวจไว้ เป็นการตรวจคนละระดับ

**47) เรียก AI เมื่อไม่มีข้อมูลไหม?**

ไม่เรียก เมื่อ tripCount=0 endpoint คืน NO_USAGE_DATA ก่อน generate

**48) เก็บคำตอบ AI ถาวรไหม?**

ไม่มีตาราง summary เก็บ cache ใน memory 10 นาทีและแสดงใน page state ส่วน Log เก็บ metadata การเรียก ไม่เก็บเนื้อหา prompt/response

**49) กด “สร้างใหม่” ต้องเรียก provider ใหม่เสมอไหม?**

ไม่เสมอ ถ้าข้อมูลเหมือนเดิมและ cache ยังไม่หมดอายุ endpoint คืน cached=true ได้ ปุ่มไม่ได้ส่ง flag บังคับข้าม cache

**50) Unit test ผ่านเท่ากับ AI จริงผ่านหรือไม่?**

ไม่เท่ากัน tests หลายชุด mock AI และ DB จึงยืนยันตรรกะส่วนที่ทดสอบ ไม่ยืนยันการเชื่อมต่อ provider หรือคุณภาพข้อความจริงทุกกรณี

## 8. ขอบเขตที่ควรตอบให้ตรงกับรุ่นปัจจุบัน

หัวข้อนี้เป็นข้อสังเกตจากการอ่านโค้ด เพื่อไม่กล่าวอ้างเกินสิ่งที่ทำไว้ ไม่ใช่ผลการทดสอบเจาะระบบหรือการแก้บั๊ก

| เรื่อง | สิ่งที่โค้ดมีจริง | สิ่งที่ยังไม่ควรกล่าวอ้าง |
|---|---|---|
| concurrency | change-vehicle ใช้ Serializable transaction | ทุกการจอง/อนุมัติ/รับ–คืนป้องกัน race ได้สมบูรณ์ |
| audit | มี Log สำหรับหลายกิจกรรม | ทุกการแก้ข้อมูลมี audit ครบทุกฟิลด์ |
| status sync | ทำเมื่อ GET ที่กำหนดถูกเรียก | มี background scheduler อัปเดตทุกวินาที |
| booking history | Booking row ปัจจุบันและ Log บางเหตุการณ์ | มีตาราง version history ของการอนุมัติ/รถเดิมทุกครั้ง |
| permissions UI | โหลดตอน mount และ server อ่าน DB ล่าสุด | ปุ่มทุกแท็บใน browser ปรับทันทีโดยไม่ reload |
| AI validation | schema, key checking และ regex บางส่วน | ตรวจความหมายทุกประโยคได้ 100% |
| AI user summary | input ทุกคน แต่ output insights สูงสุด 5 | มีข้อความสรุปครบทุกคนเสมอ |
| AI infrastructure | cache/activeAdmins ใน memory | มี distributed lock/cache สำหรับหลาย instance |
| email | catch SMTP failure และส่งใน request | มี queue/retry/ประวัติส่งที่เชื่อถือได้ทุกกรณี |
| date/time | analytics ใช้ Bangkok ชัดเจน | ทุก input/formatter/route ใช้ timezone แบบเดียวกันทั้งหมด |
| pagination | details โหลดแล้ว slice ในแอป | ทุกตารางแบ่งหน้าด้วย database pagination |
| tests | Vitest 99 tests ผ่านในการตรวจครั้งนี้ | ผ่านทุก UI/E2E/production/provider scenario |

หนึ่งตัวอย่างข้อจำกัดเวลาที่เห็นได้ชัด: Axios กลางตั้ง timeout 10 วินาที แต่ AI generator ตั้ง timeout ต่อ provider call 30 วินาทีและพยายามได้ 2 ครั้ง ปุ่มสร้าง AI ไม่ได้ override Axios timeout จึงไม่ควรรับรองว่าผู้ใช้จะรอจน server ทำจบได้เสมอ

อีกตัวอย่างคือ Admin status override จำกัดสถานะปลายทาง แต่ไม่ได้มี state-transition table บังคับต้นทางครบทุกแบบใน route การซ่อนปุ่มในหน้าเว็บกับการตรวจ API ต้องพิจารณาแยกกัน

## 9. ถ้ากรรมการถามว่าพัฒนาต่ออะไร

ตอบเป็นสิ่งที่ยังไม่ได้ทำ ไม่ใช่บอกว่ามีแล้ว: “ถ้าขยายใช้งานจริง จะทำกฎการเปลี่ยนสถานะร่วมกันและ transaction ให้ครอบคลุมเส้นทางหลักเพิ่ม ทำการทดสอบ request พร้อมกัน เพิ่มระบบงานเบื้องหลังสำหรับสถานะและอีเมล และปรับการแบ่งหน้ากับ cache ให้รองรับข้อมูลและจำนวน server ที่เพิ่มขึ้น”

เลือกตอบเพียงหัวข้อที่เกี่ยวกับคำถาม พร้อมยกไฟล์จริง เช่นการจัดการ state ใน syncStatuses และการส่งอีเมลใน lib/email เพื่อให้เห็นว่ารู้ตำแหน่งพัฒนาต่อ

## 10. วิธีเตรียมตัวอ่านโค้ด

รอบแรกอ่านบท 1 ให้จำ entity กับ relation และเล่า flow จอง→อนุมัติ→รับ→คืนได้ รอบสองเปิดบท 2 คู่กับหน้าจอเพื่อจำชื่อ handler/API รอบสามอ่านบท 3–4 เพื่ออธิบายเงื่อนไขฝั่ง server และสูตรรายงาน

ซ้อมโดยสุ่มปุ่มหนึ่งปุ่ม แล้วตอบ: ไฟล์ไหน → ฟังก์ชันไหน → endpoint/method → permission → ตาราง/ฟิลด์ → error ที่อาจคืน → UI เปลี่ยนอย่างไร จากนั้นใช้ดัชนีบท 6 เปิด source ตามตำแหน่ง

ไม่จำเป็นต้องท่อง Tailwind ทุก class หรือไฟล์ Prisma generated ทุกบรรทัด ควรอธิบายได้ว่าแต่ละส่วนถูกสร้าง/เรียกเมื่อใด และกฎธุรกิจที่ทำให้ผลลัพธ์นั้นถูกต้องอยู่ตรงไหน

## 11. คำถามเพิ่มหลัง refactor และ deploy ฐานข้อมูล — ข้อ 51–65

### 51. Refactor รอบนี้เปลี่ยนอะไร และทำไปทำไม

“ผมแยกหน้าที่ซับซ้อน 12 หน้าออกเป็น component ย่อย 51 ไฟล์ พร้อมแยก types/constants/utils ตาม feature ทำให้เปิดอ่านและแก้ UI ทีละส่วนได้ง่ายขึ้น page ยังถือ state และ handler ที่ใช้ร่วมกัน ส่วนกฎธุรกิจและการตรวจสิทธิ์ยังอยู่ API/server เหมือนเดิม”

ยกตัวอย่างหน้า user/booking: page โหลดรถและสร้างคำขอ ส่วน VehicleSearchFilters แสดงตัวกรอง, VehicleSearchResults แสดงรถ และ BookingFormModal รับข้อมูลการจอง ดูแผนที่ครบในบท 2 ส่วน 9

### 52. กดปุ่มใน component ลูก แต่ฟังก์ชันอยู่ page ได้อย่างไร

“page ส่ง function ผ่าน props เช่น submitBooking ให้ BookingFormModal เมื่อ form submit ลูกเรียกฟังก์ชันที่ได้รับ page จึงส่ง POST ไป API และอัปเดต state หลังได้ response กลับมา”

props ส่งข้อมูลลงมาและ callback ส่งการกระทำกลับไปยังเจ้าของ state ไม่จำเป็นต้องสร้าง state ซ้ำในลูกทุกตัว

### 53. ทำไมเก็บ state ไว้ใน page ไม่เก็บในทุก component

“ข้อมูลบางชุดใช้ร่วมกัน เช่นรายการ booking, แถวที่เลือก และ modal ถ้ารวม state ที่ parent ก็ส่งข้อมูลชุดเดียวให้ตารางกับฟอร์มได้ การเปิด modal จากแถวในตารางจึงสัมพันธ์กับข้อมูลเดียวกัน”

ไม่ใช่กฎว่าลูกห้ามมี state เสมอ เช่น AiUsageSummaryCard และ VehicleHistoryDetails ยังจัดการการโหลดของตนเอง แต่ component แสดงผลที่แยกใหม่ส่วนใหญ่รับค่าจาก parent

### 54. types.ts กับ schema.prisma ต่างกันอย่างไร

“types.ts อธิบายรูปร่างข้อมูลที่ TypeScript ตรวจให้ตอนพัฒนา เช่นฟอร์มกับ response ของหน้านั้น schema.prisma อธิบาย model/relation ของฐานข้อมูลที่ Prisma ใช้สร้าง client และจัดการ migration การเปลี่ยน type ของ frontend อย่างเดียวไม่เปลี่ยนตารางใน DB และไม่ validate JSON ขณะ runtime”

ตัวอย่าง Vehicle ในหน้าจออาจมีข้อมูล relation หรือคะแนนที่ API คำนวณเพิ่ม จึงไม่ใช่ทุก field ต้องเป็นคอลัมน์ของ Vehicle ใน DB

### 55. _components มี URL ของตัวเองหรือไม่ และทำไมไม่มี use client ทุกไฟล์

“_components เป็น private folder ที่ใช้จัด module ภายใน feature ไม่ได้เพิ่มหน้า URL เอง ลูกที่ page ฝั่ง client import อยู่ภายใต้ client boundary เดียวกัน จึงไม่ต้องประกาศ use client ซ้ำทุกตัว การไม่มี directive ในไฟล์ไม่ได้แปลว่าไฟล์นั้นเป็น Server Component เสมอ”

layout ที่ตรวจสิทธิ์ก่อนเปิดหน้ากับ component ลูกของ client page มีหน้าที่และ boundary ต่างกัน

### 56. constants กับ utils แยกหน้าที่อย่างไร

“constants เก็บค่าเริ่มต้น ตัวเลือกและป้าย เช่น INITIAL_FILTERS ส่วน utils เป็นฟังก์ชันแปลงหรือคำนวณ เช่น buildStats และ getErrorMessage ทั้งสองเป็น module ที่ page/component import ไม่ได้เป็น API ของตัวเอง”

ข้อควรยกให้ตรงโค้ด: admin/bookings และ approver/approve ยังไม่มี utils.ts; helper บางตัวจึงยังอยู่ page และ bangkokToday ใน constants ของรายงานเป็นค่าที่คำนวณตอน module โหลด ไม่ได้อัปเดตข้ามวันเองทุกวินาที

### 57. หลังแยกไฟล์ เว็บเร็วขึ้นแน่นอนหรือไม่

“การเปลี่ยนครั้งนี้ช่วยแยกหน้าที่และลดความยาว page แต่ยังสรุปไม่ได้ว่า runtime หรือ bundle ดีขึ้นจากจำนวนไฟล์เพียงอย่างเดียว ต้องวัดเพิ่มเติม ส่วน useMemo/useCallback ที่มีใช้ตามจุดคำนวณและ dependency ของ React ไม่ใช่ database cache”

หลายลูกยังรับ props/setter จำนวนมาก จึงยังมีความสัมพันธ์กับ feature เดิม ไม่ได้กลายเป็น component กลางที่นำไปใช้ได้ทุกที่ทันที

### 58. Deploy เว็บกับ deploy PostgreSQL เป็นอย่างเดียวกันหรือไม่

“คนละส่วนครับ โค้ดเตรียม Next.js บน Vercel และฐานข้อมูล Prisma Postgres บน cloud แอปเชื่อม DB ผ่าน DATABASE_URL ส่วน docker-compose ใช้เปิด PostgreSQL สำหรับพัฒนาในเครื่อง การ deploy source เว็บไม่ได้อัปโหลด Docker DB local ไปด้วย”

หากถามโดเมนหรือสถานะ live ให้ยืนยันจาก environment จริงเพิ่มเติม เพราะคู่มือรอบนี้ตรวจ source/config ไม่ได้ตรวจ dashboard หรือข้อมูล cloud

### 59. npm run build ในฉบับใหม่ทำอะไรบ้าง

“รัน prisma generate เพื่อสร้าง client ก่อน จากนั้นเรียก deploy-migrations.mjs แล้วจึง next build โดยใช้ && ให้ขั้นถัดไปทำเมื่อขั้นก่อนหน้าสำเร็จ ใน script migration จะทำงานเฉพาะ VERCEL_ENV เท่ากับ production”

ดังนั้น local/preview ข้าม automatic migration ใน script นี้ และไม่ควรสรุปว่า build มีแค่ compile frontend แล้ว

### 60. ทำไมต้องแยก DATABASE_URL กับ DIRECT_URL

“runtime และ seed scripts อ่าน DATABASE_URL ส่วน Prisma CLI อ่าน DIRECT_URL ก่อนแล้วค่อย fallback DATABASE_URL เมื่อไม่มีค่า ตอน production build script ตรวจ URL แล้วใช้ direct host db.prisma.io ส่งเป็น DIRECT_URL ให้ child process ที่รัน migrate deploy”

ชื่อ pooledUrl ใน script ไม่ได้บังคับว่ารับได้แต่ pooled: โค้ดปัจจุบันรับทั้ง pooled.db.prisma.io และ db.prisma.io แล้วกำหนด host ให้เป็น direct

### 61. generate, migrate และ seed ต่างกันอย่างไร

“generate สร้าง client/types จาก schema, migrate deploy apply SQL migration ที่เตรียมไว้, seed เติมข้อมูลเริ่มต้นผ่านสคริปต์ของโครงการ ทั้งสามคำสั่งไม่ใช่สิ่งเดียวกันและไม่ได้เรียกตามกันอัตโนมัติทุกกรณี”

โปรเจกต์นี้ build เรียก generate และ migration script ส่วน explicit seed command เรียก seed.ts แล้ว seedPermissions.ts ไม่ได้เรียก explicit seed จาก build script

### 62. ถ้า build ไม่ได้เรียก seed แล้วข้อมูลเดโมเข้า DB ได้อย่างไร

“มี data migration ชื่อ 20260923140000_seed_demo_data ที่ใช้ SQL INSERT ข้อมูล Admin ประเภทรถและรถเดโม เมื่อ migrate deploy apply ชุดนี้จึงมีข้อมูลได้โดยไม่ได้เรียก seed.ts และมีอีก migration เติม baseline 13 สิทธิ์ของ ADMIN”

ทั้งสองชุดเพิ่มข้อมูล ไม่เพิ่มตาราง Schema จึงยังมี 8 models เดิม และการเติมสิทธิ์ ADMIN ไม่ใช่หลักฐานว่ามี defaults ของ USER/APPROVER ครบแล้วทุก environment

### 63. เปลี่ยน SEED_ADMIN_PASSWORD แล้ว seed จะเปลี่ยนรหัส Admin เดิมหรือไม่

“ไม่ครับ seed.ts ตรวจรหัสสำหรับ remote ก่อน แต่ถ้าพบ email เดิมจะข้ามการสร้าง ไม่เรียก update password รหัสจาก environment ถูก hash ด้วย cost 10 เฉพาะเมื่อสร้างบัญชีใหม่ ส่วน SQL data migration มีค่า hash ในไฟล์ของตน ไม่ได้อ่าน SEED_ADMIN_PASSWORD”

ปุ่มบัญชีทดสอบหน้า login เป็นเพียงการเติมฟอร์มอีกชุดหนึ่ง จึงไม่ได้รับประกันว่าตรงบัญชี cloud หรือมี USER/APPROVER เหล่านั้นใน DB แล้ว

### 64. ถ้า migration fail หรือ build fail ผลต่างกันอย่างไร

“ถ้า migration fail, script ส่ง exit code ที่ทำให้ && ไม่ไปต่อถึง next build แต่ถ้า migrate สำเร็จแล้ว compile Next.js fail ไม่มี transaction ที่ครอบทั้ง deployment ให้ rollback DB อัตโนมัติ ต้องอ่าน log ว่าล้มเหลวที่ขั้นใด”

script ยังตรวจ protocol/host หากใช้ URL provider อื่นจะถูกปฏิเสธตามเงื่อนไข ไม่ควรอธิบายว่ารองรับทุก PostgreSQL cloud โดยไม่แก้ script

### 65. มีหลักฐานอะไรว่า refactor และ deploy ทำงานถูกต้อง

“ในการตรวจ working tree รอบนี้ Vitest ผ่าน 99 tests จาก 24 ไฟล์, TypeScript ผ่าน และ lint ไม่มี error มี warning ใน test mock 1 จุด สิ่งนี้รองรับโค้ดและชุดทดสอบที่ตรวจ แต่ยังไม่ได้รัน browser E2E หรือ build/migration/smoke test บน deployment จริงในรอบจัดทำคู่มือ จึงต้องแยกผลเหล่านั้นออกจากกัน”

เมื่อตอบสอบให้บอกผลที่ทำจริง พร้อมเปิดไฟล์/รายงานผลประกอบได้ อย่าใช้จำนวน unit tests ไปยืนยันการเชื่อมต่อ DB, email หรือ AI provider จริงทุกกรณี

## 12. ตัวอย่างเล่าฉบับปรับปรุงใน 90 วินาที

“ระบบนี้ช่วยจัดการการขอใช้รถตั้งแต่ค้นหารถ จอง อนุมัติ รับรถ คืนรถ ไปจนถึงงานซ่อมและรายงาน แบ่งผู้ใช้เป็น User, Approver และ Admin และตรวจทั้ง role กับ permission ที่ฝั่ง server

Frontend ใช้ Next.js กับ React รอบนี้ผมแยกหน้าใหญ่เป็น component ตาราง ฟอร์ม และตัวกรอง โดย page ยังถือ state และเรียก API ลูกได้รับข้อมูลและ callback ผ่าน props ทำให้ตามเส้นทางจากปุ่มไป handler ได้ชัดขึ้น ส่วน backend ใช้ route handlers ตรวจสิทธิ์และกฎธุรกิจ แล้วใช้ Prisma เชื่อม PostgreSQL ที่มี 8 models หลัก

ด้าน deployment โค้ดเตรียมเว็บบน Vercel และ DB เป็น Prisma Postgres แยกกัน build จะ generate client และเรียก migration script เฉพาะ production โดยใช้ direct URL สำหรับ Prisma CLI ขณะที่ runtime อ่าน DATABASE_URL มี migration เติมข้อมูลเดโมและสิทธิ์ Admin ซึ่งแยกจาก explicit seed command

รายงานคำนวณตัวเลขจากข้อมูลการใช้รถจริง ส่วน AI รับตัวเลขที่คำนวณแล้วไปสรุป และยังต้องตอบข้อจำกัดตามโค้ด เช่น cache ใน memory กับการทดสอบ deployment จริงที่ต้องมีหลักฐานแยกจาก unit tests”
