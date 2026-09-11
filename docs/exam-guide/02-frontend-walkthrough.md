# บทที่ 2 — อ่าน frontend ทีละหน้าและเข้าใจ React ที่ใช้

## 1. รูปแบบของไฟล์หน้าเว็บ

หน้าใช้งานส่วนใหญ่ประกาศ `"use client"` เพราะต้องรับ event ใช้ state เปิด modal และเรียก API หลังแสดงหน้า ส่วน layout ที่ตรวจสิทธิ์เป็น Server Component ไม่มี directive นี้

โครงสร้างที่พบซ้ำคือ imports → type/interface → ค่าเริ่มต้น/ฟังก์ชันช่วย → component → state → ฟังก์ชันเรียก API → effects → JSX

```tsx
const [bookings, setBookings] = useState<Booking[]>([])

const fetchBookings = useCallback(async () => {
  const response = await api.get<Booking[]>("/api/booking?action=my-bookings")
  setBookings(response.data)
}, [])

useEffect(() => {
  fetchBookings()
}, [fetchBookings])
```

อ่านว่า: เริ่มจากรายการว่าง → หลัง component mount เรียก API → รอ response → เก็บข้อมูลใน state → React render รายการใหม่ `setBookings()` ไม่ได้เขียนฐานข้อมูล ส่วนการเขียนฐานข้อมูลเกิดจาก route ฝั่ง server

| แนวคิด | หน้าที่ | ตัวอย่างในโปรเจกต์ |
|---|---|---|
| `useState` | เก็บค่าที่มีผลต่อหน้าจอ | รายการรถ ค่า input สถานะ loading และ modal |
| `useEffect` | ประสานกับระบบภายนอกหลัง render พร้อม cleanup | โหลดข้อมูล ตั้ง polling ฟัง Escape |
| dependency array | กำหนดว่า effect/callback สัมพันธ์กับค่าใด | เปลี่ยน filters แล้วโหลดข้อมูลใหม่ |
| `useCallback` | รักษา reference ของฟังก์ชันจน dependency เปลี่ยน | fetchBookings, searchVehicles |
| `useMemo` | เก็บผลคำนวณไว้จน dependency เปลี่ยน | กรองรายการและรวมสถิติ |
| `useRef` | เก็บค่าข้าม render โดยแก้แล้วไม่ทำให้ render | กัน submit ซ้ำ, อ้าง DOM, จำตัวกรองก่อนหน้า |
| props | ค่าที่ parent ส่งให้ child | filters ของ VehicleHistoryDetails |
| `children` | เนื้อหาภายใน component/layout | layout ห่อ page |
| controlled input | input อ่านค่าจาก state และอัปเดตผ่าน onChange | email, purpose, mileageInput |
| conditional rendering | เลือกส่วนแสดงตามเงื่อนไข | loading / error / empty / list |
| `.map()` | แปลงรายการเป็น JSX หรือข้อมูลใหม่ | รถหนึ่งคันเป็นหนึ่งแถว |
| `.filter()` | เลือกเฉพาะรายการที่ตรงเงื่อนไข | เฉพาะ PENDING |
| `.reduce()` | ยุบหลายรายการเป็นผลรวม | สถิติจำนวนการจอง |

`useCallback` และ `useMemo` ไม่ได้ทำให้ข้อมูลอัปเดตจาก server เอง และไม่ใช่ cache ฐานข้อมูล

`e.preventDefault()` กัน form submit แบบ browser ที่เปลี่ยนหน้า แล้วให้โค้ดส่ง request เอง `try/catch/finally` แยกเส้นทางสำเร็จ ผิดพลาด และงานที่ต้องทำเสมอ เช่นปิด loading

## 2. กรอบเว็บและเมนูร่วม

### app/layout.tsx

[RootLayout](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/layout.tsx) ใส่ `<html lang="th">`, `<body>`, Navbar และ children พร้อม metadata ชื่อเว็บ การ import `globals.css` ที่นี่ทำให้ CSS ใช้ทั้งเว็บ

### app/globals.css และ class ใน JSX

[globals.css](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/globals.css) import Tailwind, ประกาศสี background/foreground, ฟอนต์ และค่าตาม dark preference งานตกแต่งส่วนใหญ่เกิดใน JSX ผ่าน class เช่น:

```tsx
className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3"
```

หมายถึงใช้ grid ช่องเดียวบนจอเล็ก แล้วเพิ่มคอลัมน์ตาม breakpoint `bg-*` คือพื้นหลัง, `text-*` คือสี/ขนาดตัวอักษร, `px/py` คือ padding, `rounded-*` คือมุมโค้ง, `hover:*` คือเมื่อชี้, `disabled:*` คือปุ่มที่ใช้ไม่ได้ และ `focus:*` ช่วยบอกตำแหน่ง keyboard focus

ตารางมักอยู่ใน `overflow-x-auto` เพื่อเลื่อนแนวนอนบนจอเล็ก ส่วน modal ใช้ `fixed inset-0` คลุมหน้าจอและ `z-50` อยู่เหนือเนื้อหา

### app/component/navbar.tsx

[Navbar](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/component/navbar.tsx) ถูกเรียกจาก RootLayout จึงใช้ร่วมทุกหน้า แต่คืน `null` เมื่อ pathname เป็น `/`

| ส่วน | การทำงาน |
|---|---|
| effect ตาม `pathname` | เรียก `/api/auth/me` เมื่อเปลี่ยนหน้า เก็บ user |
| ตัวแปร `active` | กัน response ที่กลับมาหลัง cleanup ไปเปลี่ยน state ของ effect เก่า |
| `fetchNotifications()` | GET `/api/notifications?limit=10` และเก็บ unreadCount |
| interval | โหลด notification ทุก 30 วินาที; cleanup ล้าง interval |
| `notificationRef` | ตรวจว่าคลิกอยู่นอกกล่อง notification หรือไม่ |
| effect เมื่อเปิดกล่อง | ปิดเมื่อคลิกด้านนอกหรือกด Escape และถอด event listener ตอน cleanup |
| `openNotification()` | PATCH ให้รายการอ่านแล้ว ปรับ state แล้วนำไปหน้าจอง/ซ่อมตามประเภท |
| `markAllAsRead()` | PATCH `{markAll: true}` แล้วทำรายการใน state เป็นอ่านแล้ว |
| `handleLogout()` | POST `/api/auth/logout` แล้วกลับ `/` ใน finally |

นี่เป็น polling ไม่ใช่ WebSocket และการกด notification พาไปหน้ารวม ไม่ได้เปิดรายละเอียด bookingId โดยตรง

### app/component/role-dashboard.tsx

[RoleDashboard](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/component/role-dashboard.tsx) รับ `title`, `description`, `items` แล้วแสดงการ์ดเมนู ใช้ `router.push(item.href)` เมื่อกด มี `toneClasses` จับคู่ชื่อโทนกับชุดสี และแสดง empty state หากไม่มีเมนู

`DashboardLoading()` เป็น skeleton ระหว่างโหลด หน้านี้ไม่ได้ตรวจสิทธิ์เอง ผู้เรียกกรอง `items` ก่อนส่งมา จึงต้องมีการป้องกันใน layout/API ด้วย

## 3. หน้า login และ dashboard

### app/page.tsx — /

[LoginPage](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/page.tsx) เก็บ email, password, error, loading และ showPassword

`handleLogin()` รับ submit → ป้องกัน reload → POST `/api/auth/login` → อ่าน `response.data.user.role` → นำไป `/admin`, `/approver` หรือ `/user` ตาม role การเก็บ token ทำโดย browser จาก cookie ใน response ไม่ได้เก็บใน localStorage

`getLoginErrorMessage()` อ่าน message จาก Axios error, `fillAccount()` เติมข้อมูลบัญชีสาธิตลงฟอร์ม และปุ่ม Eye เปลี่ยนชนิด input ระหว่าง password/text

ภาพพื้นหลังใช้ `/wall4.avif` และโลโก้ `/pea_logo.png` ผ่าน `next/image` ภาพอื่นใน public ที่ไม่ได้อ้างใน JSX ไม่ได้ถูกแสดงทุกภาพโดยอัตโนมัติ

### app/user/page.tsx — /user

[UserPage](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/user/page.tsx) GET `/api/auth/me`, กรอง allMenuItems ด้วย permissions แล้วส่งให้ RoleDashboard มีเมนูจองรถ การจองของฉัน และแจ้งซ่อม

### app/admin/page.tsx — /admin

[AdminPage](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/admin/page.tsx) ใช้รูปแบบเดียวกัน มีผู้ใช้ รถ การจอง ซ่อม รายงาน และสิทธิ์ การเข้าหน้าอ่านข้อมูลอาจใช้ VIEW ขณะที่ปุ่มเปลี่ยนข้อมูลใช้ MANAGE

### app/approver/page.tsx — /approver

[ApproverPage](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/approver/page.tsx) โหลด permissions ก่อน ถ้ามี BOOKING_APPROVE จึง GET `/api/approver?status=PENDING` เพื่อแสดงจำนวนงานค้าง มีเมนูอนุมัติและประวัติ

## 4. หน้าผู้ใช้

### app/user/booking/page.tsx — ค้นหาและจองรถ

[BookingPage](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/user/booking/page.tsx) ใช้ API แนะนำรถเป็นเส้นทางค้นหาหลัก ไม่ได้ใช้ GET `/api/booking` เพื่อแสดงรถในหน้านี้

| ฟังก์ชัน/ค่า | ทำอะไร | ข้อมูล/API |
|---|---|---|
| `fetchVehicleTypes()` | โหลดประเภทลง select | GET `/api/verhicle-type` |
| `searchVehicles()` | สร้าง query จากวันเริ่ม–สิ้นสุดและประเภท เก็บรถที่จัดอันดับแล้ว | GET `/api/vehicles/recommend` |
| `openBookingForm(vehicle)` | จำรถที่เลือก นำช่วงค้นหามาใส่ฟอร์ม และเปิด modal | selectedVehicle, bookingData |
| `closeBookingForm()` | ปิดและล้างฟอร์ม | INITIAL_BOOKING_DATA |
| `submitBooking()` | ส่ง purpose/destination/ช่วงเวลา/รถ ปิด modal และโหลดรถใหม่ | POST `/api/booking` |
| `getLocalDateTimeInputValue()` | เตรียมรูปแบบ YYYY-MM-DDTHH:mm สำหรับ input ตาม local time | ชดเชย timezone offset ก่อน slice |
| `minEndDateTime` | ตั้ง min ของเวลาสิ้นสุดในช่องค้นหาเป็นเริ่ม + 1 ชั่วโมง | กฎระดับ UI |
| `canSearch` | เปิดปุ่มค้นหาเมื่อเลือกทั้งสองวัน | state ของช่วงเวลา |
| effect ของ modal | ปิดด้วย Escape | event listener |

ลำดับ state: เลือกเวลา → กดค้นหา → vehicles ถูกเติม → เลือกรถ → showBookingForm = true → กรอกวัตถุประสงค์/ปลายทาง → ส่งคำขอ → server สร้าง PENDING

ป้าย recommended มาจาก server ค่าคะแนนไม่ได้คำนวณใน component และกฎเริ่ม + 1 ชั่วโมงใน UI ไม่เท่ากับกฎของ POST ซึ่งตรวจเพียงว่า end ต้องหลัง start

### app/user/my-bookings/page.tsx — การจองของฉัน

[MyBookingsPage](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/user/my-bookings/page.tsx) รวมการติดตามและดำเนินงานของเจ้าของการจอง มี modal 4 แบบ: detail, edit, pickup, return

| ฟังก์ชัน | การทำงาน |
|---|---|
| `fetchBookings()` | GET `/api/booking?action=my-bookings` เก็บรายการและสถิติ |
| `buildStats()` | reduce นับ status ที่มี key อยู่ใน INITIAL_STATS |
| `filteredBookings` | useMemo กรองตามสถานะที่เลือก |
| `openDetailModal()` | เลือกรายการเพื่อแสดงข้อมูล |
| `openEditModal()` | เติมวัน purpose และ destination ลง editForm |
| `handleEditSubmit()` | PATCH `/api/booking` แล้วโหลดรายการใหม่ |
| `cancelBooking()` | confirm แล้ว PUT `/api/booking` ด้วย CANCELLED |
| `openMileageModal()` | เลือก action รับหรือคืน และล้าง input |
| `handlePickup()` | แปลง mileageInput เป็น Number แล้ว PUT `/api/booking/pickup` |
| `handleReturn()` | PUT `/api/booking/return` ด้วย mileageEnd |
| `closeModal()` | ล้าง selectedBooking, mileageInput และ editForm |
| `getDistance()` | คืนผลต่างเลขไมล์ หรือ null เมื่อยังขาดค่า |

ปุ่มแก้ไข/ยกเลิกแสดงเฉพาะ PENDING ปุ่มรับรถแสดงสำหรับ APPROVED/CHANGED และปุ่มคืนสำหรับ IN_PROGRESS โดยต้องมี BOOKING_CREATE ด้วย การดูรายการใช้ BOOKING_VIEW จึงมีกรณีดูได้แต่กดเปลี่ยนไม่ได้

Component ย่อยท้ายไฟล์:

| Component | เหตุผลที่แยก |
|---|---|
| `ModalHeader` | ส่วนหัว คำอธิบาย และปุ่มปิดใช้ซ้ำ |
| `BookingDetailPanel` | ข้อมูลรถ เวลา purpose/destination ผู้อนุมัติและเลขไมล์ |
| `PrimaryButton` | ปุ่มหลักรูปแบบร่วม |
| `ModalActions` | ปุ่มยกเลิก/บันทึกและข้อความ loading |
| `MileageModal` | ใช้ฟอร์มเดียวกับรับและคืน โดยเปลี่ยน props เช่น label, min, tone, onSubmit |

มีข้อสังเกตของ UI ปัจจุบัน: INITIAL_STATS ไม่มี `changed` และ filter ไม่มี CHANGED แยก แม้รายการ CHANGED ยังแสดงใน “ทั้งหมด” และรับรถได้ อย่าใช้จำนวนในกล่อง “อนุมัติแล้ว” เป็นจำนวนรวม APPROVED + CHANGED โดยไม่ดู buildStats

### app/user/maintenance/page.tsx — แจ้งซ่อมและติดตาม

[UserMaintenancePage](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/user/maintenance/page.tsx) ใช้ `fetchData()` โหลดงานซ่อมของตนและรายการรถด้วย Promise.all จาก `/api/user/maintenance` และ `/api/verhicle`

`getInitialFormData()` ตั้งเวลาเริ่มเป็นเวลาปัจจุบันใน local input, `openReportModal()` ล้างข้อมูลเดิม, `handleSubmit()` POST งานซ่อมแล้วโหลดข้อมูลใหม่, `buildStats()` นับความคืบหน้า และ `maintenanceTypeLabels` แปลประเภทเป็นภาษาไทย

สิทธิ์ MAINTENANCE_VIEW ใช้ดูหน้า ส่วน MAINTENANCE_REPORT ใช้แสดงปุ่มแจ้ง ประเภทที่สร้างใหม่เลือก BREAKDOWN/PREVENTIVE/OTHER; UNSPECIFIED มีไว้รองรับข้อมูลเดิม ไม่ใช่ตัวเลือกปกติของรายงานใหม่

## 5. หน้าผู้อนุมัติ

### app/approver/approve/page.tsx

[ApproverBookingsPage](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/approver/approve/page.tsx) มีแท็บ PENDING, APPROVED และ REJECTED

`fetchBookings()` โหลดตาม selectedStatus → `openApprovalModal()` เก็บรายการและ action → `submitApproval()` PUT `/api/approver` ด้วย `{id, action, comment}` → ปิด modal และ refresh

`submittingRef.current` กันกด submit ซ้ำก่อน state loading render รอบใหม่ แต่ไม่ได้แทนการจัดการ concurrency ในฐานข้อมูล API ยังมีการตรวจสถานะอีกชั้น เมื่อปฏิเสธต้องมีเหตุผล

### app/approver/history/page.tsx

[ApprovalHistoryPage](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/approver/history/page.tsx) GET `/api/approver?status=ALL` ซึ่ง server จำกัดประวัติ APPROVER ด้วย approverId แล้วหน้าเว็บคัดเฉพาะ APPROVED/CHANGED/REJECTED

`filterByDate()` กรองด้วย `updatedAt`; `buildStats()` นับ APPROVED และ CHANGED ในจำนวนอนุมัติ; `approvalRate` = approved / total × 100 ปัดเป็นจำนวนเต็ม; `viewDetails()` เปิดรายละเอียด

ต้องอธิบายให้ตรง: นี่ไม่ใช่ประวัติการตัดสินทั้งหมดตลอดอายุรายการ เพราะหน้าเว็บตัด IN_PROGRESS และ COMPLETED ออก และ updatedAt เปลี่ยนได้จากการดำเนินงานอื่นด้วย ไม่มี approvedAt แยกใน schema

## 6. หน้าผู้ดูแล

### app/admin/users/page.tsx

[AdminUsersPage](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/admin/users/page.tsx) โหลด `/api/user` คู่กับ `/api/auth/me` เพื่อรู้ทั้งรายการและบัญชีตนเอง

`createUser()` ส่งชื่อ/email/password/role ด้วย POST; `updateUser()` ส่งเฉพาะ id/name/role ด้วย PUT; `deleteUser()` ใช้ DELETE; `toggleUserStatus()` ใช้ PATCH เปลี่ยน isActive หลังแสดงจำนวนการจองที่ยังค้าง

UI แยก ALL/ACTIVE/INACTIVE ป้องกันกดปิดบัญชีตนและแสดงปุ่มลบเมื่อ `canDelete` จาก API อนุญาต มีการอัปเดต array ผ่าน map/filter หลัง response สำเร็จ ไม่จำเป็นต้องโหลดตารางใหม่ทุกครั้ง

`getInitials()` นำอักษรตัวแรกมาใช้แทนรูปโปรไฟล์ ส่วนการเปลี่ยนอีเมล/รหัสผ่านของบัญชีเดิมไม่ได้ถูกส่งใน updateUser แม้ form state จะมีช่องเหล่านี้ร่วมกับแบบสร้าง

### app/admin/vehicles/page.tsx

[AdminVehiclesPage](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/admin/vehicles/page.tsx) มีสองแท็บ: รถและประเภทรถ

| กลุ่มฟังก์ชัน | endpoint | การเปลี่ยน state |
|---|---|---|
| fetchVehicles / fetchVehicleTypes | GET `/api/verhicle`, `/api/verhicle-type` | set รายการ |
| createVehicle / createVehicleType | POST endpoint ที่เกี่ยวข้อง | เพิ่ม response เข้า array |
| updateVehicle / updateVehicleType | PUT | map แทนเฉพาะแถว id เดิม |
| deleteVehicle / deleteVehicleType | DELETE `?id=...` | filter แถวออก |
| openCreate*/openEdit* | ไม่เรียก API | เติมฟอร์มและเปิด modal |
| reset*/close* | ไม่เรียก API | ล้างและปิด |

เลขไมล์ใน input เก็บเป็น string เพราะช่องกรอกส่งข้อความ แล้ว API เป็นผู้ parse/validate ค่า การแก้ทะเบียน ประเภท สถานะและเลขไมล์ใช้ VEHICLE_MANAGE

การสะกด URL `verhicle` และ `verhicle-type` เป็นชื่อจริงในโปรเจกต์ ต้องใช้ตามนี้ ไม่ใช่แก้เป็น vehicle เฉพาะตอนเรียกจากหน้าเว็บ

### app/admin/bookings/page.tsx

[AdminBookingsPage](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/admin/bookings/page.tsx) รวมตัวกรอง สถิติ เปลี่ยนสถานะ ลบ รับ–คืนแทนผู้ใช้ และเปลี่ยนรถฉุกเฉิน

`fetchData()` สร้าง URLSearchParams จาก filters แล้วเรียกสาม API พร้อมกัน: `/api/admin/bookings`, `/api/user`, `/api/verhicle` จึงมีข้อมูลชื่อผู้ใช้และรถลง dropdown ตัวกรองเปลี่ยนทำให้ callback/effect โหลดใหม่ สถิติในหน้านับชุดรายการที่ server กรองกลับมา

| ฟังก์ชัน | สิ่งที่ส่ง |
|---|---|
| `updateBookingStatus()` | PUT `/api/admin/bookings` ด้วย id/status |
| `deleteBooking()` | DELETE `/api/admin/bookings?id=...` |
| `openChangeVehicleModal()` | GET `/api/admin/bookings/change-vehicle?bookingId=...`; เลือกรถ recommended เริ่มต้น |
| `changeVehicle()` | PUT endpoint เปลี่ยนรถ ด้วย bookingId/newVehicleId/reason |
| `openMileageModal()` | ตั้งเลขไมล์เริ่มฟอร์มจาก currentMileage หรือ mileageStart |
| `submitMileage()` | ตรวจจำนวนเต็ม แล้วเลือก endpoint pickup/return และชื่อฟิลด์ตาม action |
| `buildStats()` | นับสถานะ รวม CHANGED |

`STATUS_UPDATE_OPTIONS` อนุญาตเพียง PENDING/APPROVED/REJECTED/CANCELLED ไม่ใส่ IN_PROGRESS/COMPLETED เพื่อให้ใช้ฟอร์มเลขไมล์ และไม่ใส่ CHANGED เพราะต้องผ่านขั้นตอนเลือกรถทดแทน

สิทธิ์ดู = BOOKING_VIEW, เปลี่ยน/รับคืน = BOOKING_MANAGE, ลบ = BOOKING_DELETE ส่วนแสดงปุ่มเปลี่ยนรถยังพิจารณารถเดิมซ่อม สถานะอนุมัติ และยังไม่รับรถด้วย

### app/admin/maintenance/page.tsx

[AdminMaintenancePage](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/admin/maintenance/page.tsx) โหลดงานพร้อม affectedBookings และรถทั้งหมด มีตัวกรองสถานะใน browser

`openEditModal()` เติมรายละเอียดซ่อม ศูนย์บริการ ค่าใช้จ่าย ช่วงเวลา และสถานะ; `validateForm()` ตรวจประเภท วันเสร็จและกรณีปิดงาน; `handleSubmit()` เลือก POST หรือ PUT ตาม editingItem

กรณี server ตอบ 409 และ code AFFECTED_BOOKINGS หน้าจอสร้างข้อความแสดงผู้จอง ช่วงเวลา วัตถุประสงค์และปลายทางให้ Admin ยืนยัน จากนั้นส่งซ้ำพร้อม `allowBookingConflicts: true` การยืนยันนี้บันทึกงานซ่อม แต่ยังไม่ได้จัดรถใหม่อัตโนมัติ ต้องไปขั้นตอนเปลี่ยนรถ

`handleDelete()` ลบงานหลัง confirm; effect ล้างข้อความสำเร็จหลัง 3 วินาที; ปุ่มเปลี่ยนข้อมูลตรวจ MAINTENANCE_MANAGE

### app/admin/permissions/page.tsx

[AdminPermissionsPage](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/admin/permissions/page.tsx) เก็บเมทริกซ์ `Record<role, Record<permission, boolean>>`

`fetchPermissions()` อ่านเมทริกซ์และ lockedAdminPermissions; `activeGroups` กรองหมวดตามแท็บ role; `isLocked()` กันถอดสิทธิ์สำคัญ Admin; `togglePermission()` เปลี่ยนค่าใน state เท่านั้น; `saveRole()` เลือกค่าที่เป็น true เป็น array แล้ว PUT `/api/admin/permissions`

กด toggle ยังไม่บันทึกจนกด Save ชุดสิทธิ์ฝั่ง API มี 13 ค่า แต่ UI แสดงเฉพาะรายการที่กำหนดใน menuGroups ของแต่ละ role

### app/admin/vehicle-history/page.tsx

[AdminVehicleHistoryPage](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/admin/vehicle-history/page.tsx) โหลดรายชื่อรถจาก `/api/verhicle` และตัวชี้วัดจาก `/api/admin/vehicles/history` ตาม filters ค่าเริ่มต้นเป็นต้นเดือนถึงวันนี้เวลาไทย

`summary` ใช้ useMemo รวมตัวเลขที่ API คำนวณมาแล้วเพื่อทำการ์ด 4 ช่อง: จำนวนรถ เที่ยว ระยะทาง งานซ่อม `ChartCard` รับ metric เดียวกันแต่สลับ dataKey เพื่อสร้างกราฟแท่ง 3 แบบด้วย Recharts

`ResponsiveContainer` ปรับกราฟตามกล่อง, `XAxis` ใช้ plateNumber, `YAxis` เป็นค่าตัวเลข, `Bar` อ่าน dataKey และ Tooltip แสดงข้อมูลเมื่อชี้

parent ส่ง filters เดียวกันให้ `AiUsageSummaryCard` และ `VehicleHistoryDetails` เพื่อให้รายงานทั้งสามส่วนอยู่ในขอบเขตเดียวกัน

### app/admin/vehicle-history/VehicleHistoryDetails.tsx

[VehicleHistoryDetails](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/admin/vehicle-history/VehicleHistoryDetails.tsx) แสดงแท็บ trips/mileage/maintenance โดยใช้ TripsTable, MileageTable และ MaintenanceTable แยก JSX ของแต่ละรูปแบบ

effect สร้าง query พร้อม `pageSize=20` ไป `/api/admin/vehicles/history/details` ใช้ AbortController ยกเลิก request เดิมเมื่อ filter/tab/page เปลี่ยน เพื่อไม่ให้ response เก่าแสดงทับหน้าใหม่ `previousFilterKey` ช่วย reset page เป็น 1 เมื่อเปลี่ยนตัวกรอง

`displayDate()` และ `displayMileage()` แสดงขีดเมื่อไม่มีข้อมูล ส่วน distanceKm = null แสดง “ข้อมูลไม่ครบ” จึงต่างจากระยะทาง 0 จริง

แท็บ trips แสดงหลายสถานะ แต่ตัวชี้วัดรายงานและแท็บ mileage ใช้ COMPLETED ตามเงื่อนไขฝั่ง server จึงไม่จำเป็นต้องมีจำนวนแถวเท่ากัน

### app/admin/vehicle-history/AiUsageSummaryCard.tsx

[AiUsageSummaryCard](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/admin/vehicle-history/AiUsageSummaryCard.tsx) รอ Admin กดสร้าง ไม่เรียก AI อัตโนมัติทุกครั้งที่เปิดรายงาน

`canGenerate` ตรวจว่า report โหลดแล้ว ไม่มี request ค้าง มีเที่ยวใช้งาน และมีช่วงวัน; `generateSummary()` POST filters ไป `/api/admin/vehicles/history/analysis`; effect ล้างผลเดิมเมื่อ filter เปลี่ยน

เมื่อได้ READY จะแสดง executiveSummary, vehicleUsageInsights, userUsageInsights, maintenanceInsights, recommendations และ dataLimitations โดย `EvidenceList` ดึงตัวเลขจาก evidence keys ที่ server ส่งมา `formatEvidenceValue()` แสดง null เป็น “ข้อมูลไม่เพียงพอ” และชื่อผู้ใช้ถูกเติมจาก `result.users[userRef]`

มีหน้ารอ `LoadingSummary`, สถานะไม่มีข้อมูล, ข้อผิดพลาด และปุ่มลองใหม่ พร้อมเวลา โมเดล และป้าย cached ของผลลัพธ์

## 7. Layout ที่ป้องกันทุกหน้า

ทุกไฟล์ในตารางนี้ใช้ `requirePageAccess()` แล้ว `return children`:

| Layout | เงื่อนไข |
|---|---|
| app/user/layout.tsx | role USER |
| app/approver/layout.tsx | role APPROVER หรือ ADMIN |
| app/admin/layout.tsx | role ADMIN |
| user/booking/layout.tsx | BOOKING_CREATE |
| user/my-bookings/layout.tsx | BOOKING_VIEW |
| user/maintenance/layout.tsx | MAINTENANCE_VIEW |
| approver/approve/layout.tsx | BOOKING_APPROVE |
| approver/history/layout.tsx | BOOKING_VIEW |
| admin/users/layout.tsx | USER_MANAGE |
| admin/vehicles/layout.tsx | VEHICLE_VIEW |
| admin/bookings/layout.tsx | BOOKING_VIEW |
| admin/maintenance/layout.tsx | MAINTENANCE_VIEW |
| admin/vehicle-history/layout.tsx | REPORT_VIEW |
| admin/permissions/layout.tsx | PERMISSION_MANAGE |

[ForbiddenPage](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/forbidden/page.tsx) เป็นหน้าอธิบายว่าเข้าสู่ระบบแล้วแต่ไม่มีสิทธิ์ ใช้ Link กลับหน้าแรก

## 8. วิธีตอบเมื่อถูกชี้ JSX ถามสด

หากถูกถามปุ่มใด ให้ตาม `onClick` หรือ `onSubmit` ไปชื่อฟังก์ชัน แล้วอธิบายสี่ข้อ: อ่านค่าอะไรจาก state → เรียก API อะไร → route เปลี่ยนตารางไหน → response ทำให้ UI เปลี่ยนอย่างไร

หากถูกถาม input ให้ชี้ `value` และ `onChange` เช่น `setFormData(prev => ({...prev, purpose: value}))` คือ copy object เดิมและแทน purpose เพื่อรักษาฟิลด์อื่น ไม่ใช่แก้ object เดิมตรง ๆ

หากถูกถาม type `Booking` บนหน้าเว็บ ให้บอกว่าเป็นสัญญาชนิดข้อมูลที่ component คาดหวัง ไม่ใช่ schema ฐานข้อมูล และไม่ใช่ตัวตรวจข้อมูลจริงตอน runtime
