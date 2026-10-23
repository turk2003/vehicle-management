# บทที่ 6 — ดัชนีไฟล์ ฟังก์ชัน และผู้เรียกใช้

สร้างใหม่จาก TypeScript syntax tree ของ working tree วันที่ 15 ตุลาคม 2026 รวมไฟล์หลัง refactor ที่ยังไม่ commit ใช้ประกอบบท 1–5 และ 7

มี source/config/script 176 ไฟล์ และไฟล์ทดสอบ 28 ไฟล์ (Vitest 24 และ Playwright 4) ไม่รวม implementation ที่ generate ของ Prisma, dependencies และ next-env.d.ts

“ผู้นำเข้า” คือ import/re-export โดยตรง รวม type-only imports ซึ่งไม่มี runtime call; ไม่ใช่ dynamic call graph ทั้งหมด Next.js เรียก page/layout/route ตาม convention แม้ไม่มีผู้ import และ handler ถูกเรียกผ่าน event/effect/props ตามบท 2

## แผนที่ API

| Endpoint | Methods | Source |
|---|---|---|
| `/api/admin/bookings/change-vehicle` | [GET](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/api/admin/bookings/change-vehicle/route.ts:83), [PUT](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/api/admin/bookings/change-vehicle/route.ts:154) | [app/api/admin/bookings/change-vehicle/route.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/api/admin/bookings/change-vehicle/route.ts) |
| `/api/admin/bookings/pickup` | [PUT](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/api/admin/bookings/pickup/route.ts:10) | [app/api/admin/bookings/pickup/route.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/api/admin/bookings/pickup/route.ts) |
| `/api/admin/bookings/return` | [PUT](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/api/admin/bookings/return/route.ts:10) | [app/api/admin/bookings/return/route.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/api/admin/bookings/return/route.ts) |
| `/api/admin/bookings` | [GET](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/api/admin/bookings/route.ts:9), [PUT](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/api/admin/bookings/route.ts:92), [DELETE](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/api/admin/bookings/route.ts:224) | [app/api/admin/bookings/route.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/api/admin/bookings/route.ts) |
| `/api/admin/maintenance` | [GET](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/api/admin/maintenance/route.ts:65), [POST](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/api/admin/maintenance/route.ts:152), [PUT](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/api/admin/maintenance/route.ts:275), [DELETE](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/api/admin/maintenance/route.ts:437) | [app/api/admin/maintenance/route.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/api/admin/maintenance/route.ts) |
| `/api/admin/permissions` | [GET](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/api/admin/permissions/route.ts:30), [PUT](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/api/admin/permissions/route.ts:68) | [app/api/admin/permissions/route.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/api/admin/permissions/route.ts) |
| `/api/admin/vehicles/history/analysis` | [POST](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/api/admin/vehicles/history/analysis/route.ts:79) | [app/api/admin/vehicles/history/analysis/route.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/api/admin/vehicles/history/analysis/route.ts) |
| `/api/admin/vehicles/history/details` | [GET](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/api/admin/vehicles/history/details/route.ts:21) | [app/api/admin/vehicles/history/details/route.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/api/admin/vehicles/history/details/route.ts) |
| `/api/admin/vehicles/history` | [GET](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/api/admin/vehicles/history/route.ts:8) | [app/api/admin/vehicles/history/route.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/api/admin/vehicles/history/route.ts) |
| `/api/approver` | [GET](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/api/approver/route.ts:30), [PUT](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/api/approver/route.ts:88) | [app/api/approver/route.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/api/approver/route.ts) |
| `/api/auth/login` | [POST](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/api/auth/login/route.ts:6) | [app/api/auth/login/route.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/api/auth/login/route.ts) |
| `/api/auth/logout` | [POST](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/api/auth/logout/route.ts:3) | [app/api/auth/logout/route.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/api/auth/logout/route.ts) |
| `/api/auth/me` | [GET](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/api/auth/me/route.ts:8) | [app/api/auth/me/route.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/api/auth/me/route.ts) |
| `/api/booking/pickup` | [PUT](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/api/booking/pickup/route.ts:10) | [app/api/booking/pickup/route.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/api/booking/pickup/route.ts) |
| `/api/booking/return` | [PUT](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/api/booking/return/route.ts:10) | [app/api/booking/return/route.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/api/booking/return/route.ts) |
| `/api/booking` | [GET](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/api/booking/route.ts:35), [POST](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/api/booking/route.ts:113), [PUT](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/api/booking/route.ts:220), [PATCH](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/api/booking/route.ts:277) | [app/api/booking/route.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/api/booking/route.ts) |
| `/api/notifications` | [GET](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/api/notifications/route.ts:7), [PATCH](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/api/notifications/route.ts:50) | [app/api/notifications/route.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/api/notifications/route.ts) |
| `/api/user/maintenance` | [GET](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/api/user/maintenance/route.ts:8), [POST](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/api/user/maintenance/route.ts:32) | [app/api/user/maintenance/route.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/api/user/maintenance/route.ts) |
| `/api/user` | [GET](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/api/user/route.ts:55), [POST](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/api/user/route.ts:87), [PUT](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/api/user/route.ts:114), [PATCH](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/api/user/route.ts:171), [DELETE](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/api/user/route.ts:247) | [app/api/user/route.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/api/user/route.ts) |
| `/api/vehicles/recommend` | [GET](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/api/vehicles/recommend/route.ts:10) | [app/api/vehicles/recommend/route.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/api/vehicles/recommend/route.ts) |
| `/api/verhicle-type` | [GET](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/api/verhicle-type/route.ts:6), [POST](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/api/verhicle-type/route.ts:18), [PUT](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/api/verhicle-type/route.ts:31), [DELETE](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/api/verhicle-type/route.ts:44) | [app/api/verhicle-type/route.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/api/verhicle-type/route.ts) |
| `/api/verhicle` | [GET](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/api/verhicle/route.ts:43), [POST](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/api/verhicle/route.ts:61), [PUT](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/api/verhicle/route.ts:93), [DELETE](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/api/verhicle/route.ts:128) | [app/api/verhicle/route.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/api/verhicle/route.ts) |

## Source และ config ทีละไฟล์

### app/_components/LoginBranding.tsx

[app/_components/LoginBranding.tsx](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/_components/LoginBranding.tsx)

ส่วนแสดงผลของ feature รับข้อมูลและ callback ผ่าน props; หน้าที่เฉพาะและ flow อยู่บท 2 ส่วน 9

นำเข้าไฟล์ในโครงการ: ไม่มี

นำเข้า package/module: `lucide-react`, `next/image`

ผู้นำเข้าโดยตรง: [app/page.tsx](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/page.tsx)

| ชื่อ | ประเภท | เปิดโค้ด |
|---|---|---|
| `LoginBranding` | ฟังก์ชัน / component | [บรรทัด 4](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/_components/LoginBranding.tsx:4) |

### app/_components/LoginForm.tsx

[app/_components/LoginForm.tsx](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/_components/LoginForm.tsx)

ส่วนแสดงผลของ feature รับข้อมูลและ callback ผ่าน props; หน้าที่เฉพาะและ flow อยู่บท 2 ส่วน 9

นำเข้าไฟล์ในโครงการ: ไม่มี

นำเข้า package/module: `lucide-react`, `react`

ผู้นำเข้าโดยตรง: [app/page.tsx](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/page.tsx)

Props ที่ประกาศ: `handleLogin`, `error`, `email`, `setEmail`, `showPassword`, `password`, `setPassword`, `setShowPassword`, `loading`

| ชื่อ | ประเภท | เปิดโค้ด |
|---|---|---|
| `LoginFormProps` | ชนิดข้อมูล | [บรรทัด 5](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/_components/LoginForm.tsx:5) |
| `LoginForm` | ฟังก์ชัน / component | [บรรทัด 17](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/_components/LoginForm.tsx:17) |

### app/_components/TestAccounts.tsx

[app/_components/TestAccounts.tsx](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/_components/TestAccounts.tsx)

ส่วนแสดงผลของ feature รับข้อมูลและ callback ผ่าน props; หน้าที่เฉพาะและ flow อยู่บท 2 ส่วน 9

นำเข้าไฟล์ในโครงการ: [app/constants.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/constants.ts)

ผู้นำเข้าโดยตรง: [app/page.tsx](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/page.tsx)

Props ที่ประกาศ: `fillAccount`, `loading`

| ชื่อ | ประเภท | เปิดโค้ด |
|---|---|---|
| `TestAccountsProps` | ชนิดข้อมูล | [บรรทัด 3](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/_components/TestAccounts.tsx:3) |
| `TestAccounts` | ฟังก์ชัน / component | [บรรทัด 8](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/_components/TestAccounts.tsx:8) |

### app/admin/bookings/_components/BookingFilters.tsx

[app/admin/bookings/_components/BookingFilters.tsx](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/admin/bookings/_components/BookingFilters.tsx)

ส่วนแสดงผลของ feature รับข้อมูลและ callback ผ่าน props; หน้าที่เฉพาะและ flow อยู่บท 2 ส่วน 9

นำเข้าไฟล์ในโครงการ: [app/admin/bookings/constants.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/admin/bookings/constants.ts), [app/admin/bookings/types.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/admin/bookings/types.ts) (type-only)

นำเข้า package/module: `lucide-react`

ผู้นำเข้าโดยตรง: [app/admin/bookings/page.tsx](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/admin/bookings/page.tsx)

Props ที่ประกาศ: `filters`, `users`, `vehicles`, `onChange`, `onReset`

| ชื่อ | ประเภท | เปิดโค้ด |
|---|---|---|
| `BookingFiltersProps` | ชนิดข้อมูล | [บรรทัด 5](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/admin/bookings/_components/BookingFilters.tsx:5) |
| `BookingFilters` | ฟังก์ชัน / component | [บรรทัด 13](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/admin/bookings/_components/BookingFilters.tsx:13) |

### app/admin/bookings/_components/BookingMileageModal.tsx

[app/admin/bookings/_components/BookingMileageModal.tsx](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/admin/bookings/_components/BookingMileageModal.tsx)

ส่วนแสดงผลของ feature รับข้อมูลและ callback ผ่าน props; หน้าที่เฉพาะและ flow อยู่บท 2 ส่วน 9

นำเข้าไฟล์ในโครงการ: [app/admin/bookings/types.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/admin/bookings/types.ts) (type-only)

นำเข้า package/module: `react`, `lucide-react`

ผู้นำเข้าโดยตรง: [app/admin/bookings/page.tsx](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/admin/bookings/page.tsx)

Props ที่ประกาศ: `booking`, `action`, `value`, `loading`, `error`, `onValueChange`, `onClose`, `onSubmit`

| ชื่อ | ประเภท | เปิดโค้ด |
|---|---|---|
| `BookingMileageModalProps` | ชนิดข้อมูล | [บรรทัด 5](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/admin/bookings/_components/BookingMileageModal.tsx:5) |
| `BookingMileageModal` | ฟังก์ชัน / component | [บรรทัด 16](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/admin/bookings/_components/BookingMileageModal.tsx:16) |

### app/admin/bookings/_components/BookingStats.tsx

[app/admin/bookings/_components/BookingStats.tsx](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/admin/bookings/_components/BookingStats.tsx)

ส่วนแสดงผลของ feature รับข้อมูลและ callback ผ่าน props; หน้าที่เฉพาะและ flow อยู่บท 2 ส่วน 9

นำเข้าไฟล์ในโครงการ: [app/admin/bookings/types.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/admin/bookings/types.ts) (type-only)

ผู้นำเข้าโดยตรง: [app/admin/bookings/page.tsx](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/admin/bookings/page.tsx)

Props ที่ประกาศ: `stats`

| ชื่อ | ประเภท | เปิดโค้ด |
|---|---|---|
| `BookingStatsProps` | ชนิดข้อมูล | [บรรทัด 3](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/admin/bookings/_components/BookingStats.tsx:3) |
| `BookingStats` | ฟังก์ชัน / component | [บรรทัด 7](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/admin/bookings/_components/BookingStats.tsx:7) |

### app/admin/bookings/_components/BookingStatusModal.tsx

[app/admin/bookings/_components/BookingStatusModal.tsx](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/admin/bookings/_components/BookingStatusModal.tsx)

ส่วนแสดงผลของ feature รับข้อมูลและ callback ผ่าน props; หน้าที่เฉพาะและ flow อยู่บท 2 ส่วน 9

นำเข้าไฟล์ในโครงการ: [lib/format.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/lib/format.ts), [app/admin/bookings/constants.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/admin/bookings/constants.ts), [app/admin/bookings/types.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/admin/bookings/types.ts) (type-only)

นำเข้า package/module: `react`, `lucide-react`

ผู้นำเข้าโดยตรง: [app/admin/bookings/page.tsx](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/admin/bookings/page.tsx)

Props ที่ประกาศ: `booking`, `status`, `loading`, `onStatusChange`, `onClose`, `onSubmit`

| ชื่อ | ประเภท | เปิดโค้ด |
|---|---|---|
| `BookingStatusModalProps` | ชนิดข้อมูล | [บรรทัด 7](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/admin/bookings/_components/BookingStatusModal.tsx:7) |
| `BookingStatusModal` | ฟังก์ชัน / component | [บรรทัด 16](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/admin/bookings/_components/BookingStatusModal.tsx:16) |

### app/admin/bookings/_components/BookingTable.tsx

[app/admin/bookings/_components/BookingTable.tsx](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/admin/bookings/_components/BookingTable.tsx)

ส่วนแสดงผลของ feature รับข้อมูลและ callback ผ่าน props; หน้าที่เฉพาะและ flow อยู่บท 2 ส่วน 9

นำเข้าไฟล์ในโครงการ: [lib/format.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/lib/format.ts), [app/admin/bookings/types.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/admin/bookings/types.ts) (type-only)

นำเข้า package/module: `lucide-react`

ผู้นำเข้าโดยตรง: [app/admin/bookings/page.tsx](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/admin/bookings/page.tsx)

Props ที่ประกาศ: `bookings`, `loading`, `canManageBookings`, `canDeleteBookings`, `onChangeVehicle`, `onMileageAction`, `onEditStatus`, `onDelete`

| ชื่อ | ประเภท | เปิดโค้ด |
|---|---|---|
| `BookingTableProps` | ชนิดข้อมูล | [บรรทัด 11](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/admin/bookings/_components/BookingTable.tsx:11) |
| `BookingTable` | ฟังก์ชัน / component | [บรรทัด 22](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/admin/bookings/_components/BookingTable.tsx:22) |

### app/admin/bookings/_components/ChangeVehicleModal.tsx

[app/admin/bookings/_components/ChangeVehicleModal.tsx](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/admin/bookings/_components/ChangeVehicleModal.tsx)

ส่วนแสดงผลของ feature รับข้อมูลและ callback ผ่าน props; หน้าที่เฉพาะและ flow อยู่บท 2 ส่วน 9

นำเข้าไฟล์ในโครงการ: [lib/format.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/lib/format.ts), [app/admin/bookings/types.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/admin/bookings/types.ts) (type-only)

นำเข้า package/module: `react`, `lucide-react`

ผู้นำเข้าโดยตรง: [app/admin/bookings/page.tsx](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/admin/bookings/page.tsx)

Props ที่ประกาศ: `booking`, `candidates`, `selectedVehicleId`, `reason`, `loading`, `error`, `onVehicleChange`, `onReasonChange`, `onClose`, `onSubmit`

| ชื่อ | ประเภท | เปิดโค้ด |
|---|---|---|
| `ChangeVehicleModalProps` | ชนิดข้อมูล | [บรรทัด 6](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/admin/bookings/_components/ChangeVehicleModal.tsx:6) |
| `ChangeVehicleModal` | ฟังก์ชัน / component | [บรรทัด 19](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/admin/bookings/_components/ChangeVehicleModal.tsx:19) |

### app/admin/bookings/constants.ts

[app/admin/bookings/constants.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/admin/bookings/constants.ts)

ค่าระดับ module เช่นค่าเริ่มต้น ตัวเลือก ป้าย และ metadata ที่ผู้นำเข้าใช้

นำเข้าไฟล์ในโครงการ: [app/admin/bookings/types.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/admin/bookings/types.ts) (type-only)

ผู้นำเข้าโดยตรง: [app/admin/bookings/_components/BookingFilters.tsx](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/admin/bookings/_components/BookingFilters.tsx), [app/admin/bookings/_components/BookingStatusModal.tsx](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/admin/bookings/_components/BookingStatusModal.tsx), [app/admin/bookings/page.tsx](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/admin/bookings/page.tsx)

| ชื่อ | ประเภท | เปิดโค้ด |
|---|---|---|
| `INITIAL_FILTERS` | ค่าระดับ module | [บรรทัด 3](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/admin/bookings/constants.ts:3) |
| `INITIAL_STATS` | ค่าระดับ module | [บรรทัด 11](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/admin/bookings/constants.ts:11) |
| `BOOKING_STATUS_OPTIONS` | ค่าระดับ module | [บรรทัด 22](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/admin/bookings/constants.ts:22) |
| `STATUS_UPDATE_OPTIONS` | ค่าระดับ module | [บรรทัด 32](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/admin/bookings/constants.ts:32) |

### app/admin/bookings/layout.tsx

[app/admin/bookings/layout.tsx](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/admin/bookings/layout.tsx)

Next.js layout ห่อหน้าลูก; layout ที่ป้องกันหน้าจะเรียก page-access

นำเข้าไฟล์ในโครงการ: [lib/page-access.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/lib/page-access.ts)

นำเข้า package/module: `react`

ผู้นำเข้าโดยตรง: ไม่พบในชุดที่ทำดัชนี; page/layout/route และ config/script อาจถูก framework หรือคำสั่งเรียก

| ชื่อ | ประเภท | เปิดโค้ด |
|---|---|---|
| `BookingsLayout` | ฟังก์ชัน / component | [บรรทัด 4](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/admin/bookings/layout.tsx:4) |

### app/admin/bookings/page.tsx

[app/admin/bookings/page.tsx](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/admin/bookings/page.tsx)

หน้า URL ตามโฟลเดอร์; ประกอบ state/effects/handlers และ UI

นำเข้าไฟล์ในโครงการ: [lib/api.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/lib/api.ts), [lib/use-permissions.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/lib/use-permissions.ts), [lib/format.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/lib/format.ts), [app/admin/bookings/_components/BookingStats.tsx](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/admin/bookings/_components/BookingStats.tsx), [app/admin/bookings/_components/BookingFilters.tsx](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/admin/bookings/_components/BookingFilters.tsx), [app/admin/bookings/_components/BookingTable.tsx](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/admin/bookings/_components/BookingTable.tsx), [app/admin/bookings/_components/BookingStatusModal.tsx](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/admin/bookings/_components/BookingStatusModal.tsx), [app/admin/bookings/_components/BookingMileageModal.tsx](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/admin/bookings/_components/BookingMileageModal.tsx), [app/admin/bookings/_components/ChangeVehicleModal.tsx](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/admin/bookings/_components/ChangeVehicleModal.tsx), [app/admin/bookings/constants.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/admin/bookings/constants.ts), [app/admin/bookings/types.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/admin/bookings/types.ts) (type-only)

นำเข้า package/module: `react`, `axios`

ผู้นำเข้าโดยตรง: ไม่พบในชุดที่ทำดัชนี; page/layout/route และ config/script อาจถูก framework หรือคำสั่งเรียก

API URL ที่อ้างเป็นข้อความ: `/api/admin/bookings?${params.toString()}`, `/api/user`, `/api/verhicle`, `/api/admin/bookings`, `/api/admin/bookings?id=${booking.id}`, `/api/admin/bookings/change-vehicle?bookingId=${encodeURIComponent(booking.id)}`, `/api/admin/bookings/pickup`, `/api/admin/bookings/return`, `/api/admin/bookings/change-vehicle`

| ชื่อ | ประเภท | เปิดโค้ด |
|---|---|---|
| `getErrorMessage` | ฟังก์ชัน / component | [บรรทัด 25](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/admin/bookings/page.tsx:25) |
| `buildStats` | ฟังก์ชัน / component | [บรรทัด 33](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/admin/bookings/page.tsx:33) |
| `AdminBookingsPage` | ฟังก์ชัน / component | [บรรทัด 46](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/admin/bookings/page.tsx:46) |
| `fetchData` | memo / callback | [บรรทัด 74](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/admin/bookings/page.tsx:74) |
| `updateBookingStatus` | ฟังก์ชัน / callback | [บรรทัด 100](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/admin/bookings/page.tsx:100) |
| `deleteBooking` | ฟังก์ชัน / callback | [บรรทัด 122](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/admin/bookings/page.tsx:122) |
| `handleFilterChange` | ฟังก์ชัน / callback | [บรรทัด 142](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/admin/bookings/page.tsx:142) |
| `openStatusModal` | ฟังก์ชัน / callback | [บรรทัด 146](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/admin/bookings/page.tsx:146) |
| `closeStatusModal` | ฟังก์ชัน / callback | [บรรทัด 156](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/admin/bookings/page.tsx:156) |
| `openChangeVehicleModal` | ฟังก์ชัน / callback | [บรรทัด 162](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/admin/bookings/page.tsx:162) |
| `closeChangeVehicleModal` | ฟังก์ชัน / callback | [บรรทัด 191](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/admin/bookings/page.tsx:191) |
| `openMileageModal` | ฟังก์ชัน / callback | [บรรทัด 200](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/admin/bookings/page.tsx:200) |
| `closeMileageModal` | ฟังก์ชัน / callback | [บรรทัด 212](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/admin/bookings/page.tsx:212) |
| `submitMileage` | ฟังก์ชัน / callback | [บรรทัด 219](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/admin/bookings/page.tsx:219) |
| `changeVehicle` | ฟังก์ชัน / callback | [บรรทัด 268](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/admin/bookings/page.tsx:268) |

### app/admin/bookings/types.ts

[app/admin/bookings/types.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/admin/bookings/types.ts)

ชนิดข้อมูลของ module: ช่วยตรวจโครงสร้างขณะพัฒนา ไม่ใช่ runtime validation หรือการสร้างตาราง

นำเข้าไฟล์ในโครงการ: ไม่มี

ผู้นำเข้าโดยตรง: [app/admin/bookings/_components/BookingFilters.tsx](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/admin/bookings/_components/BookingFilters.tsx), [app/admin/bookings/_components/BookingMileageModal.tsx](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/admin/bookings/_components/BookingMileageModal.tsx), [app/admin/bookings/_components/BookingStats.tsx](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/admin/bookings/_components/BookingStats.tsx), [app/admin/bookings/_components/BookingStatusModal.tsx](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/admin/bookings/_components/BookingStatusModal.tsx), [app/admin/bookings/_components/BookingTable.tsx](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/admin/bookings/_components/BookingTable.tsx), [app/admin/bookings/_components/ChangeVehicleModal.tsx](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/admin/bookings/_components/ChangeVehicleModal.tsx), [app/admin/bookings/constants.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/admin/bookings/constants.ts), [app/admin/bookings/page.tsx](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/admin/bookings/page.tsx)

| ชื่อ | ประเภท | เปิดโค้ด |
|---|---|---|
| `Booking` | ชนิดข้อมูล | [บรรทัด 1](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/admin/bookings/types.ts:1) |
| `User` | ชนิดข้อมูล | [บรรทัด 24](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/admin/bookings/types.ts:24) |
| `Vehicle` | ชนิดข้อมูล | [บรรทัด 25](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/admin/bookings/types.ts:25) |
| `ReplacementVehicle` | ชนิดข้อมูล | [บรรทัด 27](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/admin/bookings/types.ts:27) |
| `BookingFilters` | ชนิดข้อมูล | [บรรทัด 37](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/admin/bookings/types.ts:37) |
| `BookingStats` | ชนิดข้อมูล | [บรรทัด 45](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/admin/bookings/types.ts:45) |
| `MileageAction` | ชนิดข้อมูล | [บรรทัด 56](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/admin/bookings/types.ts:56) |

### app/admin/layout.tsx

[app/admin/layout.tsx](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/admin/layout.tsx)

Next.js layout ห่อหน้าลูก; layout ที่ป้องกันหน้าจะเรียก page-access

นำเข้าไฟล์ในโครงการ: [lib/page-access.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/lib/page-access.ts)

นำเข้า package/module: `react`

ผู้นำเข้าโดยตรง: ไม่พบในชุดที่ทำดัชนี; page/layout/route และ config/script อาจถูก framework หรือคำสั่งเรียก

| ชื่อ | ประเภท | เปิดโค้ด |
|---|---|---|
| `AdminLayout` | ฟังก์ชัน / component | [บรรทัด 4](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/admin/layout.tsx:4) |

### app/admin/maintenance/_components/MaintenanceFormModal.tsx

[app/admin/maintenance/_components/MaintenanceFormModal.tsx](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/admin/maintenance/_components/MaintenanceFormModal.tsx)

ส่วนแสดงผลของ feature รับข้อมูลและ callback ผ่าน props; หน้าที่เฉพาะและ flow อยู่บท 2 ส่วน 9

นำเข้าไฟล์ในโครงการ: [app/admin/maintenance/types.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/admin/maintenance/types.ts) (type-only), [app/admin/maintenance/constants.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/admin/maintenance/constants.ts)

นำเข้า package/module: `react`, `lucide-react`

ผู้นำเข้าโดยตรง: [app/admin/maintenance/page.tsx](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/admin/maintenance/page.tsx)

Props ที่ประกาศ: `editingItem`, `closeModal`, `handleSubmit`, `error`, `formData`, `setFormData`, `vehicles`, `loading`

| ชื่อ | ประเภท | เปิดโค้ด |
|---|---|---|
| `MaintenanceFormModalProps` | ชนิดข้อมูล | [บรรทัด 7](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/admin/maintenance/_components/MaintenanceFormModal.tsx:7) |
| `MaintenanceFormModal` | ฟังก์ชัน / component | [บรรทัด 18](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/admin/maintenance/_components/MaintenanceFormModal.tsx:18) |

### app/admin/maintenance/_components/MaintenanceStatusFilters.tsx

[app/admin/maintenance/_components/MaintenanceStatusFilters.tsx](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/admin/maintenance/_components/MaintenanceStatusFilters.tsx)

ส่วนแสดงผลของ feature รับข้อมูลและ callback ผ่าน props; หน้าที่เฉพาะและ flow อยู่บท 2 ส่วน 9

นำเข้าไฟล์ในโครงการ: [app/admin/maintenance/types.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/admin/maintenance/types.ts) (type-only), [app/admin/maintenance/constants.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/admin/maintenance/constants.ts)

นำเข้า package/module: `react`

ผู้นำเข้าโดยตรง: [app/admin/maintenance/page.tsx](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/admin/maintenance/page.tsx)

Props ที่ประกาศ: `stats`, `filterStatus`, `setFilterStatus`

| ชื่อ | ประเภท | เปิดโค้ด |
|---|---|---|
| `MaintenanceStatusFiltersProps` | ชนิดข้อมูล | [บรรทัด 5](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/admin/maintenance/_components/MaintenanceStatusFilters.tsx:5) |
| `MaintenanceStatusFilters` | ฟังก์ชัน / component | [บรรทัด 11](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/admin/maintenance/_components/MaintenanceStatusFilters.tsx:11) |

### app/admin/maintenance/_components/MaintenanceTable.tsx

[app/admin/maintenance/_components/MaintenanceTable.tsx](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/admin/maintenance/_components/MaintenanceTable.tsx)

ส่วนแสดงผลของ feature รับข้อมูลและ callback ผ่าน props; หน้าที่เฉพาะและ flow อยู่บท 2 ส่วน 9

นำเข้าไฟล์ในโครงการ: [lib/format.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/lib/format.ts), [app/admin/maintenance/types.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/admin/maintenance/types.ts) (type-only), [app/admin/maintenance/constants.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/admin/maintenance/constants.ts), [app/admin/maintenance/utils.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/admin/maintenance/utils.ts)

นำเข้า package/module: `lucide-react`, `react`

ผู้นำเข้าโดยตรง: [app/admin/maintenance/page.tsx](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/admin/maintenance/page.tsx)

Props ที่ประกาศ: `filteredMaintenances`, `maintenances`, `filterStatus`, `setFilterStatus`, `loading`, `canManageMaintenance`, `openEditModal`, `handleDelete`

| ชื่อ | ประเภท | เปิดโค้ด |
|---|---|---|
| `MaintenanceTableProps` | ชนิดข้อมูล | [บรรทัด 8](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/admin/maintenance/_components/MaintenanceTable.tsx:8) |
| `MaintenanceTable` | ฟังก์ชัน / component | [บรรทัด 19](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/admin/maintenance/_components/MaintenanceTable.tsx:19) |

### app/admin/maintenance/constants.ts

[app/admin/maintenance/constants.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/admin/maintenance/constants.ts)

ค่าระดับ module เช่นค่าเริ่มต้น ตัวเลือก ป้าย และ metadata ที่ผู้นำเข้าใช้

นำเข้าไฟล์ในโครงการ: [app/admin/maintenance/types.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/admin/maintenance/types.ts) (type-only)

ผู้นำเข้าโดยตรง: [app/admin/maintenance/_components/MaintenanceFormModal.tsx](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/admin/maintenance/_components/MaintenanceFormModal.tsx), [app/admin/maintenance/_components/MaintenanceStatusFilters.tsx](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/admin/maintenance/_components/MaintenanceStatusFilters.tsx), [app/admin/maintenance/_components/MaintenanceTable.tsx](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/admin/maintenance/_components/MaintenanceTable.tsx), [app/admin/maintenance/page.tsx](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/admin/maintenance/page.tsx)

| ชื่อ | ประเภท | เปิดโค้ด |
|---|---|---|
| `defaultForm` | ค่าระดับ module | [บรรทัด 3](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/admin/maintenance/constants.ts:3) |
| `statusFilters` | ค่าระดับ module | [บรรทัด 15](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/admin/maintenance/constants.ts:15) |
| `fieldClass` | ค่าระดับ module | [บรรทัด 26](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/admin/maintenance/constants.ts:26) |
| `maintenanceTypeLabels` | ค่าระดับ module | [บรรทัด 29](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/admin/maintenance/constants.ts:29) |

### app/admin/maintenance/layout.tsx

[app/admin/maintenance/layout.tsx](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/admin/maintenance/layout.tsx)

Next.js layout ห่อหน้าลูก; layout ที่ป้องกันหน้าจะเรียก page-access

นำเข้าไฟล์ในโครงการ: [lib/page-access.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/lib/page-access.ts)

นำเข้า package/module: `react`

ผู้นำเข้าโดยตรง: ไม่พบในชุดที่ทำดัชนี; page/layout/route และ config/script อาจถูก framework หรือคำสั่งเรียก

| ชื่อ | ประเภท | เปิดโค้ด |
|---|---|---|
| `MaintenanceLayout` | ฟังก์ชัน / component | [บรรทัด 4](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/admin/maintenance/layout.tsx:4) |

### app/admin/maintenance/page.tsx

[app/admin/maintenance/page.tsx](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/admin/maintenance/page.tsx)

หน้า URL ตามโฟลเดอร์; ประกอบ state/effects/handlers และ UI

นำเข้าไฟล์ในโครงการ: [lib/api.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/lib/api.ts), [lib/format.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/lib/format.ts), [lib/use-permissions.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/lib/use-permissions.ts), [app/admin/maintenance/types.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/admin/maintenance/types.ts) (type-only), [app/admin/maintenance/constants.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/admin/maintenance/constants.ts), [app/admin/maintenance/utils.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/admin/maintenance/utils.ts), [app/admin/maintenance/_components/MaintenanceStatusFilters.tsx](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/admin/maintenance/_components/MaintenanceStatusFilters.tsx), [app/admin/maintenance/_components/MaintenanceTable.tsx](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/admin/maintenance/_components/MaintenanceTable.tsx), [app/admin/maintenance/_components/MaintenanceFormModal.tsx](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/admin/maintenance/_components/MaintenanceFormModal.tsx)

นำเข้า package/module: `axios`, `react`, `lucide-react`

ผู้นำเข้าโดยตรง: ไม่พบในชุดที่ทำดัชนี; page/layout/route และ config/script อาจถูก framework หรือคำสั่งเรียก

API URL ที่อ้างเป็นข้อความ: `/api/admin/maintenance`, `/api/verhicle`, `/api/admin/maintenance?id=${item.id}`

| ชื่อ | ประเภท | เปิดโค้ด |
|---|---|---|
| `AdminMaintenancePage` | ฟังก์ชัน / component | [บรรทัด 16](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/admin/maintenance/page.tsx:16) |
| `fetchData` | ฟังก์ชัน / callback | [บรรทัด 40](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/admin/maintenance/page.tsx:40) |
| `openCreateModal` | ฟังก์ชัน / callback | [บรรทัด 59](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/admin/maintenance/page.tsx:59) |
| `openEditModal` | ฟังก์ชัน / callback | [บรรทัด 66](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/admin/maintenance/page.tsx:66) |
| `closeModal` | ฟังก์ชัน / callback | [บรรทัด 83](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/admin/maintenance/page.tsx:83) |
| `validateForm` | ฟังก์ชัน / callback | [บรรทัด 90](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/admin/maintenance/page.tsx:90) |
| `handleSubmit` | ฟังก์ชัน / callback | [บรรทัด 112](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/admin/maintenance/page.tsx:112) |
| `saveMaintenance` | ฟังก์ชัน / callback | [บรรทัด 125](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/admin/maintenance/page.tsx:125) |
| `handleDelete` | ฟังก์ชัน / callback | [บรรทัด 177](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/admin/maintenance/page.tsx:177) |

### app/admin/maintenance/types.ts

[app/admin/maintenance/types.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/admin/maintenance/types.ts)

ชนิดข้อมูลของ module: ช่วยตรวจโครงสร้างขณะพัฒนา ไม่ใช่ runtime validation หรือการสร้างตาราง

นำเข้าไฟล์ในโครงการ: ไม่มี

ผู้นำเข้าโดยตรง: [app/admin/maintenance/_components/MaintenanceFormModal.tsx](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/admin/maintenance/_components/MaintenanceFormModal.tsx), [app/admin/maintenance/_components/MaintenanceStatusFilters.tsx](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/admin/maintenance/_components/MaintenanceStatusFilters.tsx), [app/admin/maintenance/_components/MaintenanceTable.tsx](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/admin/maintenance/_components/MaintenanceTable.tsx), [app/admin/maintenance/constants.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/admin/maintenance/constants.ts), [app/admin/maintenance/page.tsx](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/admin/maintenance/page.tsx), [app/admin/maintenance/utils.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/admin/maintenance/utils.ts)

| ชื่อ | ประเภท | เปิดโค้ด |
|---|---|---|
| `MaintenanceStatus` | ชนิดข้อมูล | [บรรทัด 1](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/admin/maintenance/types.ts:1) |
| `MaintenanceType` | ชนิดข้อมูล | [บรรทัด 3](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/admin/maintenance/types.ts:3) |
| `AffectedBooking` | ชนิดข้อมูล | [บรรทัด 5](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/admin/maintenance/types.ts:5) |
| `Maintenance` | ชนิดข้อมูล | [บรรทัด 15](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/admin/maintenance/types.ts:15) |
| `Vehicle` | ชนิดข้อมูล | [บรรทัด 40](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/admin/maintenance/types.ts:40) |
| `FormData` | ชนิดข้อมูล | [บรรทัด 47](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/admin/maintenance/types.ts:47) |

### app/admin/maintenance/utils.ts

[app/admin/maintenance/utils.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/admin/maintenance/utils.ts)

ฟังก์ชันช่วยของ feature; ดูผู้นำเข้าเพื่อแยกว่า page หรือ component เรียก

นำเข้าไฟล์ในโครงการ: [app/admin/maintenance/types.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/admin/maintenance/types.ts) (type-only)

นำเข้า package/module: `axios`

ผู้นำเข้าโดยตรง: [app/admin/maintenance/_components/MaintenanceTable.tsx](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/admin/maintenance/_components/MaintenanceTable.tsx), [app/admin/maintenance/page.tsx](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/admin/maintenance/page.tsx)

| ชื่อ | ประเภท | เปิดโค้ด |
|---|---|---|
| `getApiErrorMessage` | ฟังก์ชัน / callback | [บรรทัด 4](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/admin/maintenance/utils.ts:4) |
| `isAffectedBookingsConflict` | ฟังก์ชัน / callback | [บรรทัด 11](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/admin/maintenance/utils.ts:11) |
| `getVehicleStatusText` | ฟังก์ชัน / callback | [บรรทัด 16](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/admin/maintenance/utils.ts:16) |
| `getVehicleStatusClass` | ฟังก์ชัน / callback | [บรรทัด 22](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/admin/maintenance/utils.ts:22) |
| `getMaintenanceTypeClass` | ฟังก์ชัน / callback | [บรรทัด 28](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/admin/maintenance/utils.ts:28) |

### app/admin/page.tsx

[app/admin/page.tsx](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/admin/page.tsx)

หน้า URL ตามโฟลเดอร์; ประกอบ state/effects/handlers และ UI

นำเข้าไฟล์ในโครงการ: [lib/api.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/lib/api.ts), [app/component/role-dashboard.tsx](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/component/role-dashboard.tsx)

นำเข้า package/module: `lucide-react`, `react`

ผู้นำเข้าโดยตรง: ไม่พบในชุดที่ทำดัชนี; page/layout/route และ config/script อาจถูก framework หรือคำสั่งเรียก

API URL ที่อ้างเป็นข้อความ: `/api/auth/me`

| ชื่อ | ประเภท | เปิดโค้ด |
|---|---|---|
| `AdminPage` | ฟังก์ชัน / component | [บรรทัด 11](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/admin/page.tsx:11) |
| `fetchMe` | ฟังก์ชัน / callback | [บรรทัด 16](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/admin/page.tsx:16) |

### app/admin/permissions/_components/PermissionMatrixPanel.tsx

[app/admin/permissions/_components/PermissionMatrixPanel.tsx](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/admin/permissions/_components/PermissionMatrixPanel.tsx)

ส่วนแสดงผลของ feature รับข้อมูลและ callback ผ่าน props; หน้าที่เฉพาะและ flow อยู่บท 2 ส่วน 9

นำเข้าไฟล์ในโครงการ: [app/admin/permissions/types.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/admin/permissions/types.ts) (type-only), [app/admin/permissions/utils.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/admin/permissions/utils.ts)

นำเข้า package/module: `lucide-react`

ผู้นำเข้าโดยตรง: [app/admin/permissions/page.tsx](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/admin/permissions/page.tsx)

Props ที่ประกาศ: `activeTab`, `saveRole`, `saving`, `roles`, `activeGroups`, `permissions`, `isLocked`, `togglePermission`

| ชื่อ | ประเภท | เปิดโค้ด |
|---|---|---|
| `PermissionMatrixPanelProps` | ชนิดข้อมูล | [บรรทัด 5](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/admin/permissions/_components/PermissionMatrixPanel.tsx:5) |
| `PermissionMatrixPanel` | ฟังก์ชัน / component | [บรรทัด 16](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/admin/permissions/_components/PermissionMatrixPanel.tsx:16) |

### app/admin/permissions/_components/PermissionsLoading.tsx

[app/admin/permissions/_components/PermissionsLoading.tsx](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/admin/permissions/_components/PermissionsLoading.tsx)

ส่วนแสดงผลของ feature รับข้อมูลและ callback ผ่าน props; หน้าที่เฉพาะและ flow อยู่บท 2 ส่วน 9

นำเข้าไฟล์ในโครงการ: ไม่มี

ผู้นำเข้าโดยตรง: [app/admin/permissions/page.tsx](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/admin/permissions/page.tsx)

| ชื่อ | ประเภท | เปิดโค้ด |
|---|---|---|
| `PermissionsLoading` | ฟังก์ชัน / component | [บรรทัด 1](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/admin/permissions/_components/PermissionsLoading.tsx:1) |

### app/admin/permissions/_components/RoleTabs.tsx

[app/admin/permissions/_components/RoleTabs.tsx](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/admin/permissions/_components/RoleTabs.tsx)

ส่วนแสดงผลของ feature รับข้อมูลและ callback ผ่าน props; หน้าที่เฉพาะและ flow อยู่บท 2 ส่วน 9

นำเข้าไฟล์ในโครงการ: [app/admin/permissions/constants.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/admin/permissions/constants.ts), [app/admin/permissions/utils.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/admin/permissions/utils.ts)

นำเข้า package/module: `react`

ผู้นำเข้าโดยตรง: [app/admin/permissions/page.tsx](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/admin/permissions/page.tsx)

Props ที่ประกาศ: `roles`, `activeTab`, `setActiveTab`

| ชื่อ | ประเภท | เปิดโค้ด |
|---|---|---|
| `RoleTabsProps` | ชนิดข้อมูล | [บรรทัด 5](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/admin/permissions/_components/RoleTabs.tsx:5) |
| `RoleTabs` | ฟังก์ชัน / component | [บรรทัด 11](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/admin/permissions/_components/RoleTabs.tsx:11) |

### app/admin/permissions/constants.ts

[app/admin/permissions/constants.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/admin/permissions/constants.ts)

ค่าระดับ module เช่นค่าเริ่มต้น ตัวเลือก ป้าย และ metadata ที่ผู้นำเข้าใช้

นำเข้าไฟล์ในโครงการ: [app/admin/permissions/types.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/admin/permissions/types.ts) (type-only)

ผู้นำเข้าโดยตรง: [app/admin/permissions/_components/RoleTabs.tsx](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/admin/permissions/_components/RoleTabs.tsx), [app/admin/permissions/page.tsx](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/admin/permissions/page.tsx), [app/admin/permissions/utils.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/admin/permissions/utils.ts)

| ชื่อ | ประเภท | เปิดโค้ด |
|---|---|---|
| `menuGroups` | ค่าระดับ module | [บรรทัด 3](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/admin/permissions/constants.ts:3) |
| `roleMeta` | ค่าระดับ module | [บรรทัด 109](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/admin/permissions/constants.ts:109) |

### app/admin/permissions/layout.tsx

[app/admin/permissions/layout.tsx](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/admin/permissions/layout.tsx)

Next.js layout ห่อหน้าลูก; layout ที่ป้องกันหน้าจะเรียก page-access

นำเข้าไฟล์ในโครงการ: [lib/page-access.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/lib/page-access.ts)

นำเข้า package/module: `react`

ผู้นำเข้าโดยตรง: ไม่พบในชุดที่ทำดัชนี; page/layout/route และ config/script อาจถูก framework หรือคำสั่งเรียก

| ชื่อ | ประเภท | เปิดโค้ด |
|---|---|---|
| `PermissionsLayout` | ฟังก์ชัน / component | [บรรทัด 4](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/admin/permissions/layout.tsx:4) |

### app/admin/permissions/page.tsx

[app/admin/permissions/page.tsx](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/admin/permissions/page.tsx)

หน้า URL ตามโฟลเดอร์; ประกอบ state/effects/handlers และ UI

นำเข้าไฟล์ในโครงการ: [lib/api.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/lib/api.ts), [app/admin/permissions/types.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/admin/permissions/types.ts) (type-only), [app/admin/permissions/constants.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/admin/permissions/constants.ts), [app/admin/permissions/utils.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/admin/permissions/utils.ts), [app/admin/permissions/_components/PermissionsLoading.tsx](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/admin/permissions/_components/PermissionsLoading.tsx), [app/admin/permissions/_components/RoleTabs.tsx](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/admin/permissions/_components/RoleTabs.tsx), [app/admin/permissions/_components/PermissionMatrixPanel.tsx](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/admin/permissions/_components/PermissionMatrixPanel.tsx)

นำเข้า package/module: `react`, `lucide-react`

ผู้นำเข้าโดยตรง: ไม่พบในชุดที่ทำดัชนี; page/layout/route และ config/script อาจถูก framework หรือคำสั่งเรียก

API URL ที่อ้างเป็นข้อความ: `/api/admin/permissions`

| ชื่อ | ประเภท | เปิดโค้ด |
|---|---|---|
| `AdminPermissionsPage` | ฟังก์ชัน / component | [บรรทัด 13](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/admin/permissions/page.tsx:13) |
| `activeGroups` | memo / callback | [บรรทัด 25](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/admin/permissions/page.tsx:25) |
| `isLocked` | ฟังก์ชัน / callback | [บรรทัด 30](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/admin/permissions/page.tsx:30) |
| `fetchPermissions` | ฟังก์ชัน / callback | [บรรทัด 34](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/admin/permissions/page.tsx:34) |
| `togglePermission` | ฟังก์ชัน / callback | [บรรทัด 57](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/admin/permissions/page.tsx:57) |
| `saveRole` | ฟังก์ชัน / callback | [บรรทัด 69](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/admin/permissions/page.tsx:69) |

### app/admin/permissions/types.ts

[app/admin/permissions/types.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/admin/permissions/types.ts)

ชนิดข้อมูลของ module: ช่วยตรวจโครงสร้างขณะพัฒนา ไม่ใช่ runtime validation หรือการสร้างตาราง

นำเข้าไฟล์ในโครงการ: ไม่มี

ผู้นำเข้าโดยตรง: [app/admin/permissions/_components/PermissionMatrixPanel.tsx](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/admin/permissions/_components/PermissionMatrixPanel.tsx), [app/admin/permissions/constants.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/admin/permissions/constants.ts), [app/admin/permissions/page.tsx](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/admin/permissions/page.tsx)

| ชื่อ | ประเภท | เปิดโค้ด |
|---|---|---|
| `PermissionMatrix` | ชนิดข้อมูล | [บรรทัด 1](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/admin/permissions/types.ts:1) |
| `PermissionItem` | ชนิดข้อมูล | [บรรทัด 3](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/admin/permissions/types.ts:3) |
| `MenuGroup` | ชนิดข้อมูล | [บรรทัด 9](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/admin/permissions/types.ts:9) |
| `PermissionsResponse` | ชนิดข้อมูล | [บรรทัด 15](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/admin/permissions/types.ts:15) |
| `RoleMeta` | ชนิดข้อมูล | [บรรทัด 21](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/admin/permissions/types.ts:21) |

### app/admin/permissions/utils.ts

[app/admin/permissions/utils.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/admin/permissions/utils.ts)

ฟังก์ชันช่วยของ feature; ดูผู้นำเข้าเพื่อแยกว่า page หรือ component เรียก

นำเข้าไฟล์ในโครงการ: [app/admin/permissions/constants.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/admin/permissions/constants.ts)

นำเข้า package/module: `axios`

ผู้นำเข้าโดยตรง: [app/admin/permissions/_components/PermissionMatrixPanel.tsx](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/admin/permissions/_components/PermissionMatrixPanel.tsx), [app/admin/permissions/_components/RoleTabs.tsx](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/admin/permissions/_components/RoleTabs.tsx), [app/admin/permissions/page.tsx](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/admin/permissions/page.tsx)

| ชื่อ | ประเภท | เปิดโค้ด |
|---|---|---|
| `getApiErrorMessage` | ฟังก์ชัน / callback | [บรรทัด 4](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/admin/permissions/utils.ts:4) |
| `getRoleLabel` | ฟังก์ชัน / callback | [บรรทัด 12](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/admin/permissions/utils.ts:12) |

### app/admin/users/_components/UserFormModal.tsx

[app/admin/users/_components/UserFormModal.tsx](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/admin/users/_components/UserFormModal.tsx)

ส่วนแสดงผลของ feature รับข้อมูลและ callback ผ่าน props; หน้าที่เฉพาะและ flow อยู่บท 2 ส่วน 9

นำเข้าไฟล์ในโครงการ: [app/admin/users/types.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/admin/users/types.ts) (type-only)

นำเข้า package/module: `lucide-react`, `react`

ผู้นำเข้าโดยตรง: [app/admin/users/page.tsx](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/admin/users/page.tsx)

Props ที่ประกาศ: `modalTitle`, `editingUser`, `closeModal`, `updateUser`, `createUser`, `formData`, `setFormData`, `loading`, `submitLabel`

| ชื่อ | ประเภท | เปิดโค้ด |
|---|---|---|
| `UserFormModalProps` | ชนิดข้อมูล | [บรรทัด 6](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/admin/users/_components/UserFormModal.tsx:6) |
| `UserFormModal` | ฟังก์ชัน / component | [บรรทัด 18](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/admin/users/_components/UserFormModal.tsx:18) |

### app/admin/users/_components/UsersTable.tsx

[app/admin/users/_components/UsersTable.tsx](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/admin/users/_components/UsersTable.tsx)

ส่วนแสดงผลของ feature รับข้อมูลและ callback ผ่าน props; หน้าที่เฉพาะและ flow อยู่บท 2 ส่วน 9

นำเข้าไฟล์ในโครงการ: [lib/format.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/lib/format.ts), [app/admin/users/types.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/admin/users/types.ts) (type-only), [app/admin/users/utils.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/admin/users/utils.ts)

นำเข้า package/module: `lucide-react`, `react`

ผู้นำเข้าโดยตรง: [app/admin/users/page.tsx](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/admin/users/page.tsx)

Props ที่ประกาศ: `filteredUsers`, `users`, `statusFilter`, `setStatusFilter`, `loading`, `currentUser`, `activeAdminCount`, `openEditModal`, `toggleUserStatus`, `deleteUser`

| ชื่อ | ประเภท | เปิดโค้ด |
|---|---|---|
| `UsersTableProps` | ชนิดข้อมูล | [บรรทัด 7](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/admin/users/_components/UsersTable.tsx:7) |
| `UsersTable` | ฟังก์ชัน / component | [บรรทัด 20](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/admin/users/_components/UsersTable.tsx:20) |

### app/admin/users/constants.ts

[app/admin/users/constants.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/admin/users/constants.ts)

ค่าระดับ module เช่นค่าเริ่มต้น ตัวเลือก ป้าย และ metadata ที่ผู้นำเข้าใช้

นำเข้าไฟล์ในโครงการ: [app/admin/users/types.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/admin/users/types.ts) (type-only)

ผู้นำเข้าโดยตรง: [app/admin/users/page.tsx](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/admin/users/page.tsx)

| ชื่อ | ประเภท | เปิดโค้ด |
|---|---|---|
| `INITIAL_FORM_DATA` | ค่าระดับ module | [บรรทัด 3](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/admin/users/constants.ts:3) |

### app/admin/users/layout.tsx

[app/admin/users/layout.tsx](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/admin/users/layout.tsx)

Next.js layout ห่อหน้าลูก; layout ที่ป้องกันหน้าจะเรียก page-access

นำเข้าไฟล์ในโครงการ: [lib/page-access.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/lib/page-access.ts)

นำเข้า package/module: `react`

ผู้นำเข้าโดยตรง: ไม่พบในชุดที่ทำดัชนี; page/layout/route และ config/script อาจถูก framework หรือคำสั่งเรียก

| ชื่อ | ประเภท | เปิดโค้ด |
|---|---|---|
| `UsersLayout` | ฟังก์ชัน / component | [บรรทัด 4](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/admin/users/layout.tsx:4) |

### app/admin/users/page.tsx

[app/admin/users/page.tsx](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/admin/users/page.tsx)

หน้า URL ตามโฟลเดอร์; ประกอบ state/effects/handlers และ UI

นำเข้าไฟล์ในโครงการ: [lib/api.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/lib/api.ts), [app/admin/users/types.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/admin/users/types.ts) (type-only), [app/admin/users/constants.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/admin/users/constants.ts), [app/admin/users/utils.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/admin/users/utils.ts), [app/admin/users/_components/UsersTable.tsx](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/admin/users/_components/UsersTable.tsx), [app/admin/users/_components/UserFormModal.tsx](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/admin/users/_components/UserFormModal.tsx)

นำเข้า package/module: `react`, `next/link`, `lucide-react`

ผู้นำเข้าโดยตรง: ไม่พบในชุดที่ทำดัชนี; page/layout/route และ config/script อาจถูก framework หรือคำสั่งเรียก

API URL ที่อ้างเป็นข้อความ: `/api/user`, `/api/auth/me`, `/api/user?id=${id}`

| ชื่อ | ประเภท | เปิดโค้ด |
|---|---|---|
| `AdminUsersPage` | ฟังก์ชัน / component | [บรรทัด 14](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/admin/users/page.tsx:14) |
| `fetchUsers` | ฟังก์ชัน / callback | [บรรทัด 25](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/admin/users/page.tsx:25) |
| `resetForm` | ฟังก์ชัน / callback | [บรรทัด 42](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/admin/users/page.tsx:42) |
| `closeModal` | ฟังก์ชัน / callback | [บรรทัด 48](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/admin/users/page.tsx:48) |
| `createUser` | ฟังก์ชัน / callback | [บรรทัด 53](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/admin/users/page.tsx:53) |
| `updateUser` | ฟังก์ชัน / callback | [บรรทัด 69](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/admin/users/page.tsx:69) |
| `deleteUser` | ฟังก์ชัน / callback | [บรรทัด 95](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/admin/users/page.tsx:95) |
| `toggleUserStatus` | ฟังก์ชัน / callback | [บรรทัด 111](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/admin/users/page.tsx:111) |
| `openEditModal` | ฟังก์ชัน / callback | [บรรทัด 150](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/admin/users/page.tsx:150) |
| `openCreateModal` | ฟังก์ชัน / callback | [บรรทัด 162](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/admin/users/page.tsx:162) |

### app/admin/users/types.ts

[app/admin/users/types.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/admin/users/types.ts)

ชนิดข้อมูลของ module: ช่วยตรวจโครงสร้างขณะพัฒนา ไม่ใช่ runtime validation หรือการสร้างตาราง

นำเข้าไฟล์ในโครงการ: ไม่มี

ผู้นำเข้าโดยตรง: [app/admin/users/_components/UserFormModal.tsx](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/admin/users/_components/UserFormModal.tsx), [app/admin/users/_components/UsersTable.tsx](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/admin/users/_components/UsersTable.tsx), [app/admin/users/constants.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/admin/users/constants.ts), [app/admin/users/page.tsx](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/admin/users/page.tsx)

| ชื่อ | ประเภท | เปิดโค้ด |
|---|---|---|
| `User` | ชนิดข้อมูล | [บรรทัด 1](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/admin/users/types.ts:1) |
| `CurrentUser` | ชนิดข้อมูล | [บรรทัด 13](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/admin/users/types.ts:13) |
| `StatusFilter` | ชนิดข้อมูล | [บรรทัด 15](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/admin/users/types.ts:15) |
| `UserFormData` | ชนิดข้อมูล | [บรรทัด 17](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/admin/users/types.ts:17) |

### app/admin/users/utils.ts

[app/admin/users/utils.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/admin/users/utils.ts)

ฟังก์ชันช่วยของ feature; ดูผู้นำเข้าเพื่อแยกว่า page หรือ component เรียก

นำเข้าไฟล์ในโครงการ: ไม่มี

นำเข้า package/module: `axios`

ผู้นำเข้าโดยตรง: [app/admin/users/_components/UsersTable.tsx](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/admin/users/_components/UsersTable.tsx), [app/admin/users/page.tsx](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/admin/users/page.tsx)

| ชื่อ | ประเภท | เปิดโค้ด |
|---|---|---|
| `getErrorMessage` | ฟังก์ชัน / component | [บรรทัด 3](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/admin/users/utils.ts:3) |
| `getInitials` | ฟังก์ชัน / component | [บรรทัด 11](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/admin/users/utils.ts:11) |

### app/admin/vehicle-history/AiUsageSummaryCard.tsx

[app/admin/vehicle-history/AiUsageSummaryCard.tsx](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/admin/vehicle-history/AiUsageSummaryCard.tsx)

เปิดชื่อฟังก์ชันและแผนที่ import ด้านล่างประกอบคำอธิบายโมดูลในบท 1–4

นำเข้าไฟล์ในโครงการ: [lib/api.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/lib/api.ts), [lib/format.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/lib/format.ts), [lib/ai/vehicle-usage-summary/schema.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/lib/ai/vehicle-usage-summary/schema.ts) (type-only)

นำเข้า package/module: `axios`, `react`, `lucide-react`

ผู้นำเข้าโดยตรง: [app/admin/vehicle-history/page.tsx](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/admin/vehicle-history/page.tsx)

Props ที่ประกาศ: `filters`, `historyLoading`, `hasUsageData`

API URL ที่อ้างเป็นข้อความ: `/api/admin/vehicles/history/analysis`

| ชื่อ | ประเภท | เปิดโค้ด |
|---|---|---|
| `Filters` | ชนิดข้อมูล | [บรรทัด 24](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/admin/vehicle-history/AiUsageSummaryCard.tsx:24) |
| `NoUsageDataResponse` | ชนิดข้อมูล | [บรรทัด 30](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/admin/vehicle-history/AiUsageSummaryCard.tsx:30) |
| `AnalysisResponse` | ชนิดข้อมูล | [บรรทัด 35](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/admin/vehicle-history/AiUsageSummaryCard.tsx:35) |
| `AiUsageSummaryCardProps` | ชนิดข้อมูล | [บรรทัด 37](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/admin/vehicle-history/AiUsageSummaryCard.tsx:37) |
| `getApiErrorMessage` | ฟังก์ชัน / component | [บรรทัด 43](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/admin/vehicle-history/AiUsageSummaryCard.tsx:43) |
| `formatEvidenceValue` | ฟังก์ชัน / component | [บรรทัด 50](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/admin/vehicle-history/AiUsageSummaryCard.tsx:50) |
| `EvidenceList` | ฟังก์ชัน / component | [บรรทัด 59](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/admin/vehicle-history/AiUsageSummaryCard.tsx:59) |
| `LoadingSummary` | ฟังก์ชัน / component | [บรรทัด 85](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/admin/vehicle-history/AiUsageSummaryCard.tsx:85) |
| `AiUsageSummaryCard` | ฟังก์ชัน / component | [บรรทัด 99](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/admin/vehicle-history/AiUsageSummaryCard.tsx:99) |
| `generateSummary` | ฟังก์ชัน / callback | [บรรทัด 113](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/admin/vehicle-history/AiUsageSummaryCard.tsx:113) |

### app/admin/vehicle-history/VehicleHistoryDetails.tsx

[app/admin/vehicle-history/VehicleHistoryDetails.tsx](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/admin/vehicle-history/VehicleHistoryDetails.tsx)

เปิดชื่อฟังก์ชันและแผนที่ import ด้านล่างประกอบคำอธิบายโมดูลในบท 1–4

นำเข้าไฟล์ในโครงการ: [lib/api.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/lib/api.ts), [lib/format.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/lib/format.ts)

นำเข้า package/module: `axios`, `react`, `lucide-react`

ผู้นำเข้าโดยตรง: [app/admin/vehicle-history/page.tsx](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/admin/vehicle-history/page.tsx)

API URL ที่อ้างเป็นข้อความ: `/api/admin/vehicles/history/details?${params.toString()}`

| ชื่อ | ประเภท | เปิดโค้ด |
|---|---|---|
| `Tab` | ชนิดข้อมูล | [บรรทัด 15](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/admin/vehicle-history/VehicleHistoryDetails.tsx:15) |
| `DetailsFilters` | ชนิดข้อมูล | [บรรทัด 17](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/admin/vehicle-history/VehicleHistoryDetails.tsx:17) |
| `BookingItem` | ชนิดข้อมูล | [บรรทัด 23](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/admin/vehicle-history/VehicleHistoryDetails.tsx:23) |
| `MaintenanceItem` | ชนิดข้อมูล | [บรรทัด 40](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/admin/vehicle-history/VehicleHistoryDetails.tsx:40) |
| `DetailsResponse` | ชนิดข้อมูล | [บรรทัด 54](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/admin/vehicle-history/VehicleHistoryDetails.tsx:54) |
| `tabs` | ค่าระดับ module | [บรรทัด 60](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/admin/vehicle-history/VehicleHistoryDetails.tsx:60) |
| `maintenanceTypeText` | ค่าระดับ module | [บรรทัด 66](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/admin/vehicle-history/VehicleHistoryDetails.tsx:66) |
| `getErrorMessage` | ฟังก์ชัน / component | [บรรทัด 73](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/admin/vehicle-history/VehicleHistoryDetails.tsx:73) |
| `displayDate` | ฟังก์ชัน / component | [บรรทัด 80](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/admin/vehicle-history/VehicleHistoryDetails.tsx:80) |
| `displayMileage` | ฟังก์ชัน / component | [บรรทัด 84](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/admin/vehicle-history/VehicleHistoryDetails.tsx:84) |
| `TripsTable` | ฟังก์ชัน / component | [บรรทัด 88](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/admin/vehicle-history/VehicleHistoryDetails.tsx:88) |
| `MileageTable` | ฟังก์ชัน / component | [บรรทัด 135](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/admin/vehicle-history/VehicleHistoryDetails.tsx:135) |
| `MaintenanceTable` | ฟังก์ชัน / component | [บรรทัด 166](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/admin/vehicle-history/VehicleHistoryDetails.tsx:166) |
| `VehicleHistoryDetails` | ฟังก์ชัน / component | [บรรทัด 209](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/admin/vehicle-history/VehicleHistoryDetails.tsx:209) |
| `load` | ฟังก์ชัน / callback | [บรรทัด 235](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/admin/vehicle-history/VehicleHistoryDetails.tsx:235) |

### app/admin/vehicle-history/_components/ChartCard.tsx

[app/admin/vehicle-history/_components/ChartCard.tsx](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/admin/vehicle-history/_components/ChartCard.tsx)

ส่วนแสดงผลของ feature รับข้อมูลและ callback ผ่าน props; หน้าที่เฉพาะและ flow อยู่บท 2 ส่วน 9

นำเข้าไฟล์ในโครงการ: [app/admin/vehicle-history/types.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/admin/vehicle-history/types.ts) (type-only)

นำเข้า package/module: `recharts`

ผู้นำเข้าโดยตรง: [app/admin/vehicle-history/_components/HistoryCharts.tsx](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/admin/vehicle-history/_components/HistoryCharts.tsx)

Props ที่ประกาศ: `metric`, `items`

| ชื่อ | ประเภท | เปิดโค้ด |
|---|---|---|
| `ChartCard` | ฟังก์ชัน / component | [บรรทัด 4](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/admin/vehicle-history/_components/ChartCard.tsx:4) |

### app/admin/vehicle-history/_components/HistoryCharts.tsx

[app/admin/vehicle-history/_components/HistoryCharts.tsx](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/admin/vehicle-history/_components/HistoryCharts.tsx)

ส่วนแสดงผลของ feature รับข้อมูลและ callback ผ่าน props; หน้าที่เฉพาะและ flow อยู่บท 2 ส่วน 9

นำเข้าไฟล์ในโครงการ: [app/admin/vehicle-history/types.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/admin/vehicle-history/types.ts) (type-only), [app/admin/vehicle-history/constants.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/admin/vehicle-history/constants.ts), [app/admin/vehicle-history/_components/ChartCard.tsx](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/admin/vehicle-history/_components/ChartCard.tsx)

ผู้นำเข้าโดยตรง: [app/admin/vehicle-history/page.tsx](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/admin/vehicle-history/page.tsx)

Props ที่ประกาศ: `items`

| ชื่อ | ประเภท | เปิดโค้ด |
|---|---|---|
| `HistoryChartsProps` | ชนิดข้อมูล | [บรรทัด 5](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/admin/vehicle-history/_components/HistoryCharts.tsx:5) |
| `HistoryCharts` | ฟังก์ชัน / component | [บรรทัด 9](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/admin/vehicle-history/_components/HistoryCharts.tsx:9) |

### app/admin/vehicle-history/_components/HistoryFilters.tsx

[app/admin/vehicle-history/_components/HistoryFilters.tsx](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/admin/vehicle-history/_components/HistoryFilters.tsx)

ส่วนแสดงผลของ feature รับข้อมูลและ callback ผ่าน props; หน้าที่เฉพาะและ flow อยู่บท 2 ส่วน 9

นำเข้าไฟล์ในโครงการ: [app/admin/vehicle-history/types.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/admin/vehicle-history/types.ts) (type-only), [app/admin/vehicle-history/constants.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/admin/vehicle-history/constants.ts)

นำเข้า package/module: `lucide-react`, `react`

ผู้นำเข้าโดยตรง: [app/admin/vehicle-history/page.tsx](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/admin/vehicle-history/page.tsx)

Props ที่ประกาศ: `hasFilters`, `setFilters`, `filters`, `vehicleOptions`

| ชื่อ | ประเภท | เปิดโค้ด |
|---|---|---|
| `HistoryFiltersProps` | ชนิดข้อมูล | [บรรทัด 6](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/admin/vehicle-history/_components/HistoryFilters.tsx:6) |
| `HistoryFilters` | ฟังก์ชัน / component | [บรรทัด 13](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/admin/vehicle-history/_components/HistoryFilters.tsx:13) |

### app/admin/vehicle-history/_components/HistoryStats.tsx

[app/admin/vehicle-history/_components/HistoryStats.tsx](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/admin/vehicle-history/_components/HistoryStats.tsx)

ส่วนแสดงผลของ feature รับข้อมูลและ callback ผ่าน props; หน้าที่เฉพาะและ flow อยู่บท 2 ส่วน 9

นำเข้าไฟล์ในโครงการ: ไม่มี

นำเข้า package/module: `lucide-react`

ผู้นำเข้าโดยตรง: [app/admin/vehicle-history/page.tsx](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/admin/vehicle-history/page.tsx)

Props ที่ประกาศ: `summary`

| ชื่อ | ประเภท | เปิดโค้ด |
|---|---|---|
| `HistoryStatsProps` | ชนิดข้อมูล | [บรรทัด 3](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/admin/vehicle-history/_components/HistoryStats.tsx:3) |
| `HistoryStats` | ฟังก์ชัน / component | [บรรทัด 7](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/admin/vehicle-history/_components/HistoryStats.tsx:7) |

### app/admin/vehicle-history/_components/HistoryTable.tsx

[app/admin/vehicle-history/_components/HistoryTable.tsx](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/admin/vehicle-history/_components/HistoryTable.tsx)

ส่วนแสดงผลของ feature รับข้อมูลและ callback ผ่าน props; หน้าที่เฉพาะและ flow อยู่บท 2 ส่วน 9

นำเข้าไฟล์ในโครงการ: [lib/format.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/lib/format.ts), [app/admin/vehicle-history/types.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/admin/vehicle-history/types.ts) (type-only)

นำเข้า package/module: `lucide-react`

ผู้นำเข้าโดยตรง: [app/admin/vehicle-history/page.tsx](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/admin/vehicle-history/page.tsx)

Props ที่ประกาศ: `hasFilters`, `items`, `loading`

| ชื่อ | ประเภท | เปิดโค้ด |
|---|---|---|
| `HistoryTableProps` | ชนิดข้อมูล | [บรรทัด 5](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/admin/vehicle-history/_components/HistoryTable.tsx:5) |
| `HistoryTable` | ฟังก์ชัน / component | [บรรทัด 11](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/admin/vehicle-history/_components/HistoryTable.tsx:11) |

### app/admin/vehicle-history/constants.ts

[app/admin/vehicle-history/constants.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/admin/vehicle-history/constants.ts)

ค่าระดับ module เช่นค่าเริ่มต้น ตัวเลือก ป้าย และ metadata ที่ผู้นำเข้าใช้

นำเข้าไฟล์ในโครงการ: [app/admin/vehicle-history/types.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/admin/vehicle-history/types.ts) (type-only), [app/admin/vehicle-history/utils.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/admin/vehicle-history/utils.ts)

ผู้นำเข้าโดยตรง: [app/admin/vehicle-history/_components/HistoryCharts.tsx](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/admin/vehicle-history/_components/HistoryCharts.tsx), [app/admin/vehicle-history/_components/HistoryFilters.tsx](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/admin/vehicle-history/_components/HistoryFilters.tsx), [app/admin/vehicle-history/page.tsx](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/admin/vehicle-history/page.tsx)

| ชื่อ | ประเภท | เปิดโค้ด |
|---|---|---|
| `bangkokToday` | ค่าระดับ module | [บรรทัด 4](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/admin/vehicle-history/constants.ts:4) |
| `defaultFilters` | ค่าระดับ module | [บรรทัด 6](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/admin/vehicle-history/constants.ts:6) |
| `fieldClass` | ค่าระดับ module | [บรรทัด 12](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/admin/vehicle-history/constants.ts:12) |
| `chartMetrics` | ค่าระดับ module | [บรรทัด 15](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/admin/vehicle-history/constants.ts:15) |

### app/admin/vehicle-history/layout.tsx

[app/admin/vehicle-history/layout.tsx](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/admin/vehicle-history/layout.tsx)

Next.js layout ห่อหน้าลูก; layout ที่ป้องกันหน้าจะเรียก page-access

นำเข้าไฟล์ในโครงการ: [lib/page-access.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/lib/page-access.ts)

นำเข้า package/module: `react`

ผู้นำเข้าโดยตรง: ไม่พบในชุดที่ทำดัชนี; page/layout/route และ config/script อาจถูก framework หรือคำสั่งเรียก

| ชื่อ | ประเภท | เปิดโค้ด |
|---|---|---|
| `VehicleHistoryLayout` | ฟังก์ชัน / component | [บรรทัด 4](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/admin/vehicle-history/layout.tsx:4) |

### app/admin/vehicle-history/page.tsx

[app/admin/vehicle-history/page.tsx](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/admin/vehicle-history/page.tsx)

หน้า URL ตามโฟลเดอร์; ประกอบ state/effects/handlers และ UI

นำเข้าไฟล์ในโครงการ: [lib/api.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/lib/api.ts), [app/admin/vehicle-history/AiUsageSummaryCard.tsx](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/admin/vehicle-history/AiUsageSummaryCard.tsx), [app/admin/vehicle-history/VehicleHistoryDetails.tsx](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/admin/vehicle-history/VehicleHistoryDetails.tsx), [app/admin/vehicle-history/types.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/admin/vehicle-history/types.ts) (type-only), [app/admin/vehicle-history/constants.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/admin/vehicle-history/constants.ts), [app/admin/vehicle-history/utils.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/admin/vehicle-history/utils.ts), [app/admin/vehicle-history/_components/HistoryStats.tsx](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/admin/vehicle-history/_components/HistoryStats.tsx), [app/admin/vehicle-history/_components/HistoryFilters.tsx](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/admin/vehicle-history/_components/HistoryFilters.tsx), [app/admin/vehicle-history/_components/HistoryCharts.tsx](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/admin/vehicle-history/_components/HistoryCharts.tsx), [app/admin/vehicle-history/_components/HistoryTable.tsx](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/admin/vehicle-history/_components/HistoryTable.tsx)

นำเข้า package/module: `react`, `lucide-react`

ผู้นำเข้าโดยตรง: ไม่พบในชุดที่ทำดัชนี; page/layout/route และ config/script อาจถูก framework หรือคำสั่งเรียก

API URL ที่อ้างเป็นข้อความ: `/api/verhicle`, `/api/admin/vehicles/history?${params.toString()}`

| ชื่อ | ประเภท | เปิดโค้ด |
|---|---|---|
| `AdminVehicleHistoryPage` | ฟังก์ชัน / component | [บรรทัด 16](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/admin/vehicle-history/page.tsx:16) |
| `summary` | memo / callback | [บรรทัด 23](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/admin/vehicle-history/page.tsx:23) |
| `fetchVehicles` | ฟังก์ชัน / callback | [บรรทัด 48](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/admin/vehicle-history/page.tsx:48) |
| `fetchHistory` | ฟังก์ชัน / callback | [บรรทัด 66](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/admin/vehicle-history/page.tsx:66) |

### app/admin/vehicle-history/types.ts

[app/admin/vehicle-history/types.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/admin/vehicle-history/types.ts)

ชนิดข้อมูลของ module: ช่วยตรวจโครงสร้างขณะพัฒนา ไม่ใช่ runtime validation หรือการสร้างตาราง

นำเข้าไฟล์ในโครงการ: ไม่มี

ผู้นำเข้าโดยตรง: [app/admin/vehicle-history/_components/ChartCard.tsx](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/admin/vehicle-history/_components/ChartCard.tsx), [app/admin/vehicle-history/_components/HistoryCharts.tsx](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/admin/vehicle-history/_components/HistoryCharts.tsx), [app/admin/vehicle-history/_components/HistoryFilters.tsx](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/admin/vehicle-history/_components/HistoryFilters.tsx), [app/admin/vehicle-history/_components/HistoryTable.tsx](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/admin/vehicle-history/_components/HistoryTable.tsx), [app/admin/vehicle-history/constants.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/admin/vehicle-history/constants.ts), [app/admin/vehicle-history/page.tsx](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/admin/vehicle-history/page.tsx)

| ชื่อ | ประเภท | เปิดโค้ด |
|---|---|---|
| `VehicleOption` | ชนิดข้อมูล | [บรรทัด 1](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/admin/vehicle-history/types.ts:1) |
| `VehicleHistoryItem` | ชนิดข้อมูล | [บรรทัด 6](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/admin/vehicle-history/types.ts:6) |
| `VehicleHistoryResponse` | ชนิดข้อมูล | [บรรทัด 20](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/admin/vehicle-history/types.ts:20) |
| `Filters` | ชนิดข้อมูล | [บรรทัด 24](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/admin/vehicle-history/types.ts:24) |
| `ChartMetric` | ชนิดข้อมูล | [บรรทัด 30](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/admin/vehicle-history/types.ts:30) |

### app/admin/vehicle-history/utils.ts

[app/admin/vehicle-history/utils.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/admin/vehicle-history/utils.ts)

ฟังก์ชันช่วยของ feature; ดูผู้นำเข้าเพื่อแยกว่า page หรือ component เรียก

นำเข้าไฟล์ในโครงการ: ไม่มี

นำเข้า package/module: `axios`

ผู้นำเข้าโดยตรง: [app/admin/vehicle-history/constants.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/admin/vehicle-history/constants.ts), [app/admin/vehicle-history/page.tsx](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/admin/vehicle-history/page.tsx)

| ชื่อ | ประเภท | เปิดโค้ด |
|---|---|---|
| `getBangkokToday` | ฟังก์ชัน / callback | [บรรทัด 3](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/admin/vehicle-history/utils.ts:3) |
| `getApiErrorMessage` | ฟังก์ชัน / callback | [บรรทัด 11](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/admin/vehicle-history/utils.ts:11) |

### app/admin/vehicles/_components/VehicleFormModal.tsx

[app/admin/vehicles/_components/VehicleFormModal.tsx](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/admin/vehicles/_components/VehicleFormModal.tsx)

ส่วนแสดงผลของ feature รับข้อมูลและ callback ผ่าน props; หน้าที่เฉพาะและ flow อยู่บท 2 ส่วน 9

นำเข้าไฟล์ในโครงการ: [app/admin/vehicles/types.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/admin/vehicles/types.ts) (type-only), [app/admin/vehicles/constants.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/admin/vehicles/constants.ts)

นำเข้า package/module: `lucide-react`, `react`

ผู้นำเข้าโดยตรง: [app/admin/vehicles/page.tsx](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/admin/vehicles/page.tsx)

Props ที่ประกาศ: `vehicleModalTitle`, `closeVehicleModal`, `editingVehicle`, `updateVehicle`, `createVehicle`, `formData`, `setFormData`, `vehicleTypes`, `loading`, `vehicleSubmitLabel`

| ชื่อ | ประเภท | เปิดโค้ด |
|---|---|---|
| `VehicleFormModalProps` | ชนิดข้อมูล | [บรรทัด 7](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/admin/vehicles/_components/VehicleFormModal.tsx:7) |
| `VehicleFormModal` | ฟังก์ชัน / component | [บรรทัด 20](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/admin/vehicles/_components/VehicleFormModal.tsx:20) |

### app/admin/vehicles/_components/VehicleTable.tsx

[app/admin/vehicles/_components/VehicleTable.tsx](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/admin/vehicles/_components/VehicleTable.tsx)

ส่วนแสดงผลของ feature รับข้อมูลและ callback ผ่าน props; หน้าที่เฉพาะและ flow อยู่บท 2 ส่วน 9

นำเข้าไฟล์ในโครงการ: [lib/format.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/lib/format.ts), [app/admin/vehicles/types.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/admin/vehicles/types.ts) (type-only)

นำเข้า package/module: `lucide-react`

ผู้นำเข้าโดยตรง: [app/admin/vehicles/page.tsx](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/admin/vehicles/page.tsx)

Props ที่ประกาศ: `vehicles`, `loading`, `canManageVehicles`, `openEditModal`, `deleteVehicle`

| ชื่อ | ประเภท | เปิดโค้ด |
|---|---|---|
| `VehicleTableProps` | ชนิดข้อมูล | [บรรทัด 5](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/admin/vehicles/_components/VehicleTable.tsx:5) |
| `VehicleTable` | ฟังก์ชัน / component | [บรรทัด 13](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/admin/vehicles/_components/VehicleTable.tsx:13) |

### app/admin/vehicles/_components/VehicleTypeFormModal.tsx

[app/admin/vehicles/_components/VehicleTypeFormModal.tsx](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/admin/vehicles/_components/VehicleTypeFormModal.tsx)

ส่วนแสดงผลของ feature รับข้อมูลและ callback ผ่าน props; หน้าที่เฉพาะและ flow อยู่บท 2 ส่วน 9

นำเข้าไฟล์ในโครงการ: [app/admin/vehicles/types.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/admin/vehicles/types.ts) (type-only)

นำเข้า package/module: `lucide-react`, `react`

ผู้นำเข้าโดยตรง: [app/admin/vehicles/page.tsx](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/admin/vehicles/page.tsx)

Props ที่ประกาศ: `typeModalTitle`, `closeTypeModal`, `editingType`, `updateVehicleType`, `createVehicleType`, `typeFormData`, `setTypeFormData`, `loading`, `typeSubmitLabel`

| ชื่อ | ประเภท | เปิดโค้ด |
|---|---|---|
| `VehicleTypeFormModalProps` | ชนิดข้อมูล | [บรรทัด 6](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/admin/vehicles/_components/VehicleTypeFormModal.tsx:6) |
| `VehicleTypeFormModal` | ฟังก์ชัน / component | [บรรทัด 18](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/admin/vehicles/_components/VehicleTypeFormModal.tsx:18) |

### app/admin/vehicles/_components/VehicleTypesTable.tsx

[app/admin/vehicles/_components/VehicleTypesTable.tsx](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/admin/vehicles/_components/VehicleTypesTable.tsx)

ส่วนแสดงผลของ feature รับข้อมูลและ callback ผ่าน props; หน้าที่เฉพาะและ flow อยู่บท 2 ส่วน 9

นำเข้าไฟล์ในโครงการ: [app/admin/vehicles/types.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/admin/vehicles/types.ts) (type-only)

นำเข้า package/module: `lucide-react`

ผู้นำเข้าโดยตรง: [app/admin/vehicles/page.tsx](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/admin/vehicles/page.tsx)

Props ที่ประกาศ: `vehicleTypes`, `vehicles`, `canManageVehicles`, `openEditTypeModal`, `deleteVehicleType`, `loading`

| ชื่อ | ประเภท | เปิดโค้ด |
|---|---|---|
| `VehicleTypesTableProps` | ชนิดข้อมูล | [บรรทัด 4](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/admin/vehicles/_components/VehicleTypesTable.tsx:4) |
| `VehicleTypesTable` | ฟังก์ชัน / component | [บรรทัด 13](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/admin/vehicles/_components/VehicleTypesTable.tsx:13) |

### app/admin/vehicles/_components/VehiclesHeader.tsx

[app/admin/vehicles/_components/VehiclesHeader.tsx](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/admin/vehicles/_components/VehiclesHeader.tsx)

ส่วนแสดงผลของ feature รับข้อมูลและ callback ผ่าน props; หน้าที่เฉพาะและ flow อยู่บท 2 ส่วน 9

นำเข้าไฟล์ในโครงการ: ไม่มี

นำเข้า package/module: `lucide-react`, `react`

ผู้นำเข้าโดยตรง: [app/admin/vehicles/page.tsx](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/admin/vehicles/page.tsx)

Props ที่ประกาศ: `setActiveTab`, `activeTab`, `canManageVehicles`, `openCreateModal`, `openCreateTypeModal`

| ชื่อ | ประเภท | เปิดโค้ด |
|---|---|---|
| `VehiclesHeaderProps` | ชนิดข้อมูล | [บรรทัด 4](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/admin/vehicles/_components/VehiclesHeader.tsx:4) |
| `VehiclesHeader` | ฟังก์ชัน / component | [บรรทัด 12](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/admin/vehicles/_components/VehiclesHeader.tsx:12) |

### app/admin/vehicles/constants.ts

[app/admin/vehicles/constants.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/admin/vehicles/constants.ts)

ค่าระดับ module เช่นค่าเริ่มต้น ตัวเลือก ป้าย และ metadata ที่ผู้นำเข้าใช้

นำเข้าไฟล์ในโครงการ: [app/admin/vehicles/types.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/admin/vehicles/types.ts) (type-only)

ผู้นำเข้าโดยตรง: [app/admin/vehicles/_components/VehicleFormModal.tsx](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/admin/vehicles/_components/VehicleFormModal.tsx), [app/admin/vehicles/page.tsx](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/admin/vehicles/page.tsx)

| ชื่อ | ประเภท | เปิดโค้ด |
|---|---|---|
| `INITIAL_VEHICLE_FORM` | ค่าระดับ module | [บรรทัด 3](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/admin/vehicles/constants.ts:3) |
| `INITIAL_TYPE_FORM` | ค่าระดับ module | [บรรทัด 10](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/admin/vehicles/constants.ts:10) |
| `VEHICLE_STATUSES` | ค่าระดับ module | [บรรทัด 14](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/admin/vehicles/constants.ts:14) |

### app/admin/vehicles/layout.tsx

[app/admin/vehicles/layout.tsx](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/admin/vehicles/layout.tsx)

Next.js layout ห่อหน้าลูก; layout ที่ป้องกันหน้าจะเรียก page-access

นำเข้าไฟล์ในโครงการ: [lib/page-access.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/lib/page-access.ts)

นำเข้า package/module: `react`

ผู้นำเข้าโดยตรง: ไม่พบในชุดที่ทำดัชนี; page/layout/route และ config/script อาจถูก framework หรือคำสั่งเรียก

| ชื่อ | ประเภท | เปิดโค้ด |
|---|---|---|
| `VehiclesLayout` | ฟังก์ชัน / component | [บรรทัด 4](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/admin/vehicles/layout.tsx:4) |

### app/admin/vehicles/page.tsx

[app/admin/vehicles/page.tsx](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/admin/vehicles/page.tsx)

หน้า URL ตามโฟลเดอร์; ประกอบ state/effects/handlers และ UI

นำเข้าไฟล์ในโครงการ: [lib/api.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/lib/api.ts), [lib/use-permissions.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/lib/use-permissions.ts), [app/admin/vehicles/types.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/admin/vehicles/types.ts) (type-only), [app/admin/vehicles/constants.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/admin/vehicles/constants.ts), [app/admin/vehicles/utils.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/admin/vehicles/utils.ts), [app/admin/vehicles/_components/VehiclesHeader.tsx](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/admin/vehicles/_components/VehiclesHeader.tsx), [app/admin/vehicles/_components/VehicleTable.tsx](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/admin/vehicles/_components/VehicleTable.tsx), [app/admin/vehicles/_components/VehicleTypesTable.tsx](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/admin/vehicles/_components/VehicleTypesTable.tsx), [app/admin/vehicles/_components/VehicleFormModal.tsx](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/admin/vehicles/_components/VehicleFormModal.tsx), [app/admin/vehicles/_components/VehicleTypeFormModal.tsx](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/admin/vehicles/_components/VehicleTypeFormModal.tsx)

นำเข้า package/module: `react`

ผู้นำเข้าโดยตรง: ไม่พบในชุดที่ทำดัชนี; page/layout/route และ config/script อาจถูก framework หรือคำสั่งเรียก

API URL ที่อ้างเป็นข้อความ: `/api/verhicle`, `/api/verhicle-type`, `/api/verhicle?id=${id}`, `/api/verhicle-type?id=${id}`

| ชื่อ | ประเภท | เปิดโค้ด |
|---|---|---|
| `AdminVehiclesPage` | ฟังก์ชัน / component | [บรรทัด 16](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/admin/vehicles/page.tsx:16) |
| `fetchVehicles` | ฟังก์ชัน / callback | [บรรทัด 34](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/admin/vehicles/page.tsx:34) |
| `fetchVehicleTypes` | ฟังก์ชัน / callback | [บรรทัด 47](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/admin/vehicles/page.tsx:47) |
| `resetForm` | ฟังก์ชัน / callback | [บรรทัด 56](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/admin/vehicles/page.tsx:56) |
| `resetTypeForm` | ฟังก์ชัน / callback | [บรรทัด 62](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/admin/vehicles/page.tsx:62) |
| `closeVehicleModal` | ฟังก์ชัน / callback | [บรรทัด 68](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/admin/vehicles/page.tsx:68) |
| `closeTypeModal` | ฟังก์ชัน / callback | [บรรทัด 73](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/admin/vehicles/page.tsx:73) |
| `createVehicle` | ฟังก์ชัน / callback | [บรรทัด 78](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/admin/vehicles/page.tsx:78) |
| `updateVehicle` | ฟังก์ชัน / callback | [บรรทัด 94](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/admin/vehicles/page.tsx:94) |
| `deleteVehicle` | ฟังก์ชัน / callback | [บรรทัด 119](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/admin/vehicles/page.tsx:119) |
| `createVehicleType` | ฟังก์ชัน / callback | [บรรทัด 137](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/admin/vehicles/page.tsx:137) |
| `updateVehicleType` | ฟังก์ชัน / callback | [บรรทัด 156](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/admin/vehicles/page.tsx:156) |
| `deleteVehicleType` | ฟังก์ชัน / callback | [บรรทัด 181](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/admin/vehicles/page.tsx:181) |
| `openEditModal` | ฟังก์ชัน / callback | [บรรทัด 199](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/admin/vehicles/page.tsx:199) |
| `openCreateModal` | ฟังก์ชัน / callback | [บรรทัด 211](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/admin/vehicles/page.tsx:211) |
| `openEditTypeModal` | ฟังก์ชัน / callback | [บรรทัด 216](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/admin/vehicles/page.tsx:216) |
| `openCreateTypeModal` | ฟังก์ชัน / callback | [บรรทัด 223](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/admin/vehicles/page.tsx:223) |

### app/admin/vehicles/types.ts

[app/admin/vehicles/types.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/admin/vehicles/types.ts)

ชนิดข้อมูลของ module: ช่วยตรวจโครงสร้างขณะพัฒนา ไม่ใช่ runtime validation หรือการสร้างตาราง

นำเข้าไฟล์ในโครงการ: ไม่มี

ผู้นำเข้าโดยตรง: [app/admin/vehicles/_components/VehicleFormModal.tsx](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/admin/vehicles/_components/VehicleFormModal.tsx), [app/admin/vehicles/_components/VehicleTable.tsx](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/admin/vehicles/_components/VehicleTable.tsx), [app/admin/vehicles/_components/VehicleTypeFormModal.tsx](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/admin/vehicles/_components/VehicleTypeFormModal.tsx), [app/admin/vehicles/_components/VehicleTypesTable.tsx](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/admin/vehicles/_components/VehicleTypesTable.tsx), [app/admin/vehicles/constants.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/admin/vehicles/constants.ts), [app/admin/vehicles/page.tsx](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/admin/vehicles/page.tsx)

| ชื่อ | ประเภท | เปิดโค้ด |
|---|---|---|
| `Vehicle` | ชนิดข้อมูล | [บรรทัด 1](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/admin/vehicles/types.ts:1) |
| `VehicleType` | ชนิดข้อมูล | [บรรทัด 12](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/admin/vehicles/types.ts:12) |
| `VehicleFormData` | ชนิดข้อมูล | [บรรทัด 17](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/admin/vehicles/types.ts:17) |
| `VehicleTypeFormData` | ชนิดข้อมูล | [บรรทัด 24](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/admin/vehicles/types.ts:24) |

### app/admin/vehicles/utils.ts

[app/admin/vehicles/utils.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/admin/vehicles/utils.ts)

ฟังก์ชันช่วยของ feature; ดูผู้นำเข้าเพื่อแยกว่า page หรือ component เรียก

นำเข้าไฟล์ในโครงการ: ไม่มี

นำเข้า package/module: `axios`

ผู้นำเข้าโดยตรง: [app/admin/vehicles/page.tsx](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/admin/vehicles/page.tsx)

| ชื่อ | ประเภท | เปิดโค้ด |
|---|---|---|
| `getErrorMessage` | ฟังก์ชัน / component | [บรรทัด 3](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/admin/vehicles/utils.ts:3) |

### app/api/admin/bookings/change-vehicle/route.ts

[app/api/admin/bookings/change-vehicle/route.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/api/admin/bookings/change-vehicle/route.ts)

HTTP route handler: ตรวจ request/สิทธิ์ ประมวลผล และคืน response; รายละเอียดบท 3–4

นำเข้าไฟล์ในโครงการ: [app/generated/prisma/client.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/generated/prisma/client.ts), [lib/email/bookingNotifications.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/lib/email/bookingNotifications.ts), [lib/permissions.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/lib/permissions.ts), [lib/prisma.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/lib/prisma.ts)

นำเข้า package/module: `next/server`

ผู้นำเข้าโดยตรง: [app/api/admin/bookings/change-vehicle/__tests__/route.test.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/api/admin/bookings/change-vehicle/__tests__/route.test.ts)

| ชื่อ | ประเภท | เปิดโค้ด |
|---|---|---|
| `ACTIVE_BOOKING_STATUSES` | ค่าระดับ module | [บรรทัด 7](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/api/admin/bookings/change-vehicle/route.ts:7) |
| `ACTIVE_MAINTENANCE_STATUSES` | ค่าระดับ module | [บรรทัด 8](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/api/admin/bookings/change-vehicle/route.ts:8) |
| `ChangeVehicleError` | class | [บรรทัด 10](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/api/admin/bookings/change-vehicle/route.ts:10) |
| `assertReplaceableBooking` | ฟังก์ชัน / component | [บรรทัด 20](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/api/admin/bookings/change-vehicle/route.ts:20) |
| `errorResponse` | ฟังก์ชัน / component | [บรรทัด 56](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/api/admin/bookings/change-vehicle/route.ts:56) |
| `GET` | ฟังก์ชัน / component | [บรรทัด 83](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/api/admin/bookings/change-vehicle/route.ts:83) |
| `PUT` | ฟังก์ชัน / component | [บรรทัด 154](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/api/admin/bookings/change-vehicle/route.ts:154) |

### app/api/admin/bookings/pickup/route.ts

[app/api/admin/bookings/pickup/route.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/api/admin/bookings/pickup/route.ts)

HTTP route handler: ตรวจ request/สิทธิ์ ประมวลผล และคืน response; รายละเอียดบท 3–4

นำเข้าไฟล์ในโครงการ: [lib/prisma.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/lib/prisma.ts), [lib/permissions.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/lib/permissions.ts), [lib/email/bookingNotifications.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/lib/email/bookingNotifications.ts)

นำเข้า package/module: `next/server`

ผู้นำเข้าโดยตรง: ไม่พบในชุดที่ทำดัชนี; page/layout/route และ config/script อาจถูก framework หรือคำสั่งเรียก

| ชื่อ | ประเภท | เปิดโค้ด |
|---|---|---|
| `PUT` | ฟังก์ชัน / component | [บรรทัด 10](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/api/admin/bookings/pickup/route.ts:10) |

### app/api/admin/bookings/return/route.ts

[app/api/admin/bookings/return/route.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/api/admin/bookings/return/route.ts)

HTTP route handler: ตรวจ request/สิทธิ์ ประมวลผล และคืน response; รายละเอียดบท 3–4

นำเข้าไฟล์ในโครงการ: [lib/prisma.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/lib/prisma.ts), [lib/permissions.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/lib/permissions.ts), [lib/email/bookingNotifications.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/lib/email/bookingNotifications.ts)

นำเข้า package/module: `next/server`

ผู้นำเข้าโดยตรง: ไม่พบในชุดที่ทำดัชนี; page/layout/route และ config/script อาจถูก framework หรือคำสั่งเรียก

| ชื่อ | ประเภท | เปิดโค้ด |
|---|---|---|
| `PUT` | ฟังก์ชัน / component | [บรรทัด 10](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/api/admin/bookings/return/route.ts:10) |

### app/api/admin/bookings/route.ts

[app/api/admin/bookings/route.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/api/admin/bookings/route.ts)

HTTP route handler: ตรวจ request/สิทธิ์ ประมวลผล และคืน response; รายละเอียดบท 3–4

นำเข้าไฟล์ในโครงการ: [lib/prisma.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/lib/prisma.ts), [lib/permissions.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/lib/permissions.ts), [lib/email/bookingNotifications.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/lib/email/bookingNotifications.ts), [lib/email/templates.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/lib/email/templates.ts) (type-only), [app/generated/prisma/client.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/generated/prisma/client.ts)

นำเข้า package/module: `next/server`

ผู้นำเข้าโดยตรง: [app/api/admin/bookings/__tests__/route.test.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/api/admin/bookings/__tests__/route.test.ts)

| ชื่อ | ประเภท | เปิดโค้ด |
|---|---|---|
| `GET` | ฟังก์ชัน / component | [บรรทัด 9](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/api/admin/bookings/route.ts:9) |
| `PUT` | ฟังก์ชัน / component | [บรรทัด 92](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/api/admin/bookings/route.ts:92) |
| `DELETE` | ฟังก์ชัน / component | [บรรทัด 224](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/api/admin/bookings/route.ts:224) |

### app/api/admin/maintenance/route.ts

[app/api/admin/maintenance/route.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/api/admin/maintenance/route.ts)

HTTP route handler: ตรวจ request/สิทธิ์ ประมวลผล และคืน response; รายละเอียดบท 3–4

นำเข้าไฟล์ในโครงการ: [lib/prisma.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/lib/prisma.ts), [lib/permissions.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/lib/permissions.ts), [app/generated/prisma/client.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/generated/prisma/client.ts), [lib/syncStatuses.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/lib/syncStatuses.ts)

นำเข้า package/module: `next/server`

ผู้นำเข้าโดยตรง: [app/api/admin/maintenance/__tests__/route.test.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/api/admin/maintenance/__tests__/route.test.ts)

| ชื่อ | ประเภท | เปิดโค้ด |
|---|---|---|
| `MaintenanceInputError` | class | [บรรทัด 7](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/api/admin/maintenance/route.ts:7) |
| `ACTIVE_BOOKING_STATUSES` | ค่าระดับ module | [บรรทัด 9](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/api/admin/maintenance/route.ts:9) |
| `parseRequiredDate` | ฟังก์ชัน / component | [บรรทัด 16](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/api/admin/maintenance/route.ts:16) |
| `parseOptionalDate` | ฟังก์ชัน / component | [บรรทัด 27](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/api/admin/maintenance/route.ts:27) |
| `parseOptionalText` | ฟังก์ชัน / component | [บรรทัด 33](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/api/admin/maintenance/route.ts:33) |
| `parseOptionalCost` | ฟังก์ชัน / component | [บรรทัด 42](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/api/admin/maintenance/route.ts:42) |
| `inputErrorResponse` | ฟังก์ชัน / component | [บรรทัด 57](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/api/admin/maintenance/route.ts:57) |
| `GET` | ฟังก์ชัน / component | [บรรทัด 65](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/api/admin/maintenance/route.ts:65) |
| `POST` | ฟังก์ชัน / component | [บรรทัด 152](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/api/admin/maintenance/route.ts:152) |
| `PUT` | ฟังก์ชัน / component | [บรรทัด 275](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/api/admin/maintenance/route.ts:275) |
| `DELETE` | ฟังก์ชัน / component | [บรรทัด 437](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/api/admin/maintenance/route.ts:437) |

### app/api/admin/permissions/route.ts

[app/api/admin/permissions/route.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/api/admin/permissions/route.ts)

HTTP route handler: ตรวจ request/สิทธิ์ ประมวลผล และคืน response; รายละเอียดบท 3–4

นำเข้าไฟล์ในโครงการ: [lib/prisma.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/lib/prisma.ts), [lib/permissions.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/lib/permissions.ts)

นำเข้า package/module: `next/server`

ผู้นำเข้าโดยตรง: [app/api/admin/permissions/__tests__/route.test.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/api/admin/permissions/__tests__/route.test.ts)

| ชื่อ | ประเภท | เปิดโค้ด |
|---|---|---|
| `ALL_PERMISSIONS` | ค่าระดับ module | [บรรทัด 10](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/api/admin/permissions/route.ts:10) |
| `ROLES` | ค่าระดับ module | [บรรทัด 19](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/api/admin/permissions/route.ts:19) |
| `LOCKED_ADMIN_PERMISSIONS` | ค่าระดับ module | [บรรทัด 22](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/api/admin/permissions/route.ts:22) |
| `GET` | ฟังก์ชัน / component | [บรรทัด 30](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/api/admin/permissions/route.ts:30) |
| `PUT` | ฟังก์ชัน / component | [บรรทัด 68](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/api/admin/permissions/route.ts:68) |

### app/api/admin/vehicles/history/analysis/route.ts

[app/api/admin/vehicles/history/analysis/route.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/api/admin/vehicles/history/analysis/route.ts)

HTTP route handler: ตรวจ request/สิทธิ์ ประมวลผล และคืน response; รายละเอียดบท 3–4

นำเข้าไฟล์ในโครงการ: [lib/prisma.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/lib/prisma.ts), [lib/permissions.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/lib/permissions.ts), [lib/ai/vehicle-usage-summary/index.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/lib/ai/vehicle-usage-summary/index.ts), [lib/vehicle-usage-analysis/index.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/lib/vehicle-usage-analysis/index.ts)

นำเข้า package/module: `next/server`, `zod`

ผู้นำเข้าโดยตรง: [app/api/admin/vehicles/history/analysis/__tests__/route.test.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/api/admin/vehicles/history/analysis/__tests__/route.test.ts)

| ชื่อ | ประเภท | เปิดโค้ด |
|---|---|---|
| `requestSchema` | ค่าระดับ module | [บรรทัด 16](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/api/admin/vehicles/history/analysis/route.ts:16) |
| `CACHE_TTL_MS` | ค่าระดับ module | [บรรทัด 22](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/api/admin/vehicles/history/analysis/route.ts:22) |
| `RATE_LIMIT_WINDOW_MS` | ค่าระดับ module | [บรรทัด 23](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/api/admin/vehicles/history/analysis/route.ts:23) |
| `RATE_LIMIT_RUNS` | ค่าระดับ module | [บรรทัด 24](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/api/admin/vehicles/history/analysis/route.ts:24) |
| `LOG_ACTION` | ค่าระดับ module | [บรรทัด 25](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/api/admin/vehicles/history/analysis/route.ts:25) |
| `CachedSummary` | ชนิดข้อมูล | [บรรทัด 27](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/api/admin/vehicles/history/analysis/route.ts:27) |
| `summaryCache` | ค่าระดับ module | [บรรทัด 32](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/api/admin/vehicles/history/analysis/route.ts:32) |
| `activeAdmins` | ค่าระดับ module | [บรรทัด 33](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/api/admin/vehicles/history/analysis/route.ts:33) |
| `getCachedSummary` | ฟังก์ชัน / component | [บรรทัด 35](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/api/admin/vehicles/history/analysis/route.ts:35) |
| `setCachedSummary` | ฟังก์ชัน / component | [บรรทัด 45](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/api/admin/vehicles/history/analysis/route.ts:45) |
| `recordRun` | ฟังก์ชัน / component | [บรรทัด 62](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/api/admin/vehicles/history/analysis/route.ts:62) |
| `POST` | ฟังก์ชัน / component | [บรรทัด 79](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/api/admin/vehicles/history/analysis/route.ts:79) |

### app/api/admin/vehicles/history/details/route.ts

[app/api/admin/vehicles/history/details/route.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/api/admin/vehicles/history/details/route.ts)

HTTP route handler: ตรวจ request/สิทธิ์ ประมวลผล และคืน response; รายละเอียดบท 3–4

นำเข้าไฟล์ในโครงการ: [lib/permissions.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/lib/permissions.ts), [lib/vehicle-history-details/index.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/lib/vehicle-history-details/index.ts), [lib/vehicle-usage-analysis/index.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/lib/vehicle-usage-analysis/index.ts)

นำเข้า package/module: `next/server`

ผู้นำเข้าโดยตรง: [app/api/admin/vehicles/history/details/__tests__/route.test.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/api/admin/vehicles/history/details/__tests__/route.test.ts)

| ชื่อ | ประเภท | เปิดโค้ด |
|---|---|---|
| `TABS` | ค่าระดับ module | [บรรทัด 10](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/api/admin/vehicles/history/details/route.ts:10) |
| `UUID_PATTERN` | ค่าระดับ module | [บรรทัด 11](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/api/admin/vehicles/history/details/route.ts:11) |
| `parsePositiveInteger` | ฟังก์ชัน / component | [บรรทัด 13](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/api/admin/vehicles/history/details/route.ts:13) |
| `GET` | ฟังก์ชัน / component | [บรรทัด 21](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/api/admin/vehicles/history/details/route.ts:21) |

### app/api/admin/vehicles/history/route.ts

[app/api/admin/vehicles/history/route.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/api/admin/vehicles/history/route.ts)

HTTP route handler: ตรวจ request/สิทธิ์ ประมวลผล และคืน response; รายละเอียดบท 3–4

นำเข้าไฟล์ในโครงการ: [lib/permissions.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/lib/permissions.ts), [lib/vehicle-usage-analysis/index.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/lib/vehicle-usage-analysis/index.ts)

นำเข้า package/module: `next/server`

ผู้นำเข้าโดยตรง: ไม่พบในชุดที่ทำดัชนี; page/layout/route และ config/script อาจถูก framework หรือคำสั่งเรียก

| ชื่อ | ประเภท | เปิดโค้ด |
|---|---|---|
| `GET` | ฟังก์ชัน / component | [บรรทัด 8](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/api/admin/vehicles/history/route.ts:8) |

### app/api/approver/route.ts

[app/api/approver/route.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/api/approver/route.ts)

HTTP route handler: ตรวจ request/สิทธิ์ ประมวลผล และคืน response; รายละเอียดบท 3–4

นำเข้าไฟล์ในโครงการ: [lib/prisma.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/lib/prisma.ts), [lib/permissions.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/lib/permissions.ts), [lib/email/bookingNotifications.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/lib/email/bookingNotifications.ts), [app/generated/prisma/client.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/generated/prisma/client.ts)

นำเข้า package/module: `next/server`

ผู้นำเข้าโดยตรง: [app/api/approver/__tests__/route.test.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/api/approver/__tests__/route.test.ts)

| ชื่อ | ประเภท | เปิดโค้ด |
|---|---|---|
| `bookingInclude` | ค่าระดับ module | [บรรทัด 7](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/api/approver/route.ts:7) |
| `GET` | ฟังก์ชัน / component | [บรรทัด 30](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/api/approver/route.ts:30) |
| `PUT` | ฟังก์ชัน / component | [บรรทัด 88](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/api/approver/route.ts:88) |

### app/api/auth/login/route.ts

[app/api/auth/login/route.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/api/auth/login/route.ts)

HTTP route handler: ตรวจ request/สิทธิ์ ประมวลผล และคืน response; รายละเอียดบท 3–4

นำเข้าไฟล์ในโครงการ: [lib/prisma.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/lib/prisma.ts)

นำเข้า package/module: `next/server`, `bcryptjs`, `jsonwebtoken`

ผู้นำเข้าโดยตรง: [app/api/auth/login/__tests__/route.test.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/api/auth/login/__tests__/route.test.ts)

| ชื่อ | ประเภท | เปิดโค้ด |
|---|---|---|
| `POST` | ฟังก์ชัน / component | [บรรทัด 6](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/api/auth/login/route.ts:6) |

### app/api/auth/logout/route.ts

[app/api/auth/logout/route.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/api/auth/logout/route.ts)

HTTP route handler: ตรวจ request/สิทธิ์ ประมวลผล และคืน response; รายละเอียดบท 3–4

นำเข้าไฟล์ในโครงการ: ไม่มี

นำเข้า package/module: `next/server`

ผู้นำเข้าโดยตรง: ไม่พบในชุดที่ทำดัชนี; page/layout/route และ config/script อาจถูก framework หรือคำสั่งเรียก

| ชื่อ | ประเภท | เปิดโค้ด |
|---|---|---|
| `POST` | ฟังก์ชัน / component | [บรรทัด 3](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/api/auth/logout/route.ts:3) |

### app/api/auth/me/route.ts

[app/api/auth/me/route.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/api/auth/me/route.ts)

HTTP route handler: ตรวจ request/สิทธิ์ ประมวลผล และคืน response; รายละเอียดบท 3–4

นำเข้าไฟล์ในโครงการ: [lib/prisma.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/lib/prisma.ts), [lib/auth.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/lib/auth.ts)

นำเข้า package/module: `next/server`

ผู้นำเข้าโดยตรง: ไม่พบในชุดที่ทำดัชนี; page/layout/route และ config/script อาจถูก framework หรือคำสั่งเรียก

| ชื่อ | ประเภท | เปิดโค้ด |
|---|---|---|
| `dynamic` | ค่าระดับ module | [บรรทัด 5](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/api/auth/me/route.ts:5) |
| `GET` | ฟังก์ชัน / component | [บรรทัด 8](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/api/auth/me/route.ts:8) |

### app/api/booking/pickup/route.ts

[app/api/booking/pickup/route.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/api/booking/pickup/route.ts)

HTTP route handler: ตรวจ request/สิทธิ์ ประมวลผล และคืน response; รายละเอียดบท 3–4

นำเข้าไฟล์ในโครงการ: [lib/prisma.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/lib/prisma.ts), [lib/permissions.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/lib/permissions.ts), [lib/email/bookingNotifications.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/lib/email/bookingNotifications.ts)

นำเข้า package/module: `next/server`

ผู้นำเข้าโดยตรง: ไม่พบในชุดที่ทำดัชนี; page/layout/route และ config/script อาจถูก framework หรือคำสั่งเรียก

| ชื่อ | ประเภท | เปิดโค้ด |
|---|---|---|
| `PUT` | ฟังก์ชัน / component | [บรรทัด 10](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/api/booking/pickup/route.ts:10) |

### app/api/booking/return/route.ts

[app/api/booking/return/route.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/api/booking/return/route.ts)

HTTP route handler: ตรวจ request/สิทธิ์ ประมวลผล และคืน response; รายละเอียดบท 3–4

นำเข้าไฟล์ในโครงการ: [lib/prisma.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/lib/prisma.ts), [lib/permissions.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/lib/permissions.ts), [lib/email/bookingNotifications.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/lib/email/bookingNotifications.ts)

นำเข้า package/module: `next/server`

ผู้นำเข้าโดยตรง: ไม่พบในชุดที่ทำดัชนี; page/layout/route และ config/script อาจถูก framework หรือคำสั่งเรียก

| ชื่อ | ประเภท | เปิดโค้ด |
|---|---|---|
| `PUT` | ฟังก์ชัน / component | [บรรทัด 10](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/api/booking/return/route.ts:10) |

### app/api/booking/route.ts

[app/api/booking/route.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/api/booking/route.ts)

HTTP route handler: ตรวจ request/สิทธิ์ ประมวลผล และคืน response; รายละเอียดบท 3–4

นำเข้าไฟล์ในโครงการ: [lib/prisma.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/lib/prisma.ts), [lib/permissions.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/lib/permissions.ts), [lib/syncStatuses.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/lib/syncStatuses.ts), [lib/email/bookingNotifications.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/lib/email/bookingNotifications.ts)

นำเข้า package/module: `next/server`

ผู้นำเข้าโดยตรง: [app/api/booking/__tests__/route.test.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/api/booking/__tests__/route.test.ts)

| ชื่อ | ประเภท | เปิดโค้ด |
|---|---|---|
| `MAX_DESTINATION_LENGTH` | ค่าระดับ module | [บรรทัด 7](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/api/booking/route.ts:7) |
| `BookingInputError` | class | [บรรทัด 9](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/api/booking/route.ts:9) |
| `normalizeDestination` | ฟังก์ชัน / component | [บรรทัด 11](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/api/booking/route.ts:11) |
| `bookingInputErrorResponse` | ฟังก์ชัน / component | [บรรทัด 27](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/api/booking/route.ts:27) |
| `GET` | ฟังก์ชัน / component | [บรรทัด 35](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/api/booking/route.ts:35) |
| `POST` | ฟังก์ชัน / component | [บรรทัด 113](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/api/booking/route.ts:113) |
| `PUT` | ฟังก์ชัน / component | [บรรทัด 220](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/api/booking/route.ts:220) |
| `PATCH` | ฟังก์ชัน / component | [บรรทัด 277](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/api/booking/route.ts:277) |

### app/api/notifications/route.ts

[app/api/notifications/route.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/api/notifications/route.ts)

HTTP route handler: ตรวจ request/สิทธิ์ ประมวลผล และคืน response; รายละเอียดบท 3–4

นำเข้าไฟล์ในโครงการ: [lib/prisma.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/lib/prisma.ts), [lib/auth.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/lib/auth.ts)

นำเข้า package/module: `next/server`

ผู้นำเข้าโดยตรง: [app/api/notifications/__tests__/route.test.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/api/notifications/__tests__/route.test.ts)

| ชื่อ | ประเภท | เปิดโค้ด |
|---|---|---|
| `dynamic` | ค่าระดับ module | [บรรทัด 5](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/api/notifications/route.ts:5) |
| `GET` | ฟังก์ชัน / component | [บรรทัด 7](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/api/notifications/route.ts:7) |
| `PATCH` | ฟังก์ชัน / component | [บรรทัด 50](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/api/notifications/route.ts:50) |

### app/api/user/maintenance/route.ts

[app/api/user/maintenance/route.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/api/user/maintenance/route.ts)

HTTP route handler: ตรวจ request/สิทธิ์ ประมวลผล และคืน response; รายละเอียดบท 3–4

นำเข้าไฟล์ในโครงการ: [lib/prisma.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/lib/prisma.ts), [lib/permissions.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/lib/permissions.ts), [app/generated/prisma/client.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/generated/prisma/client.ts), [lib/email/maintenanceNotifications.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/lib/email/maintenanceNotifications.ts)

นำเข้า package/module: `next/server`

ผู้นำเข้าโดยตรง: [app/api/user/maintenance/__tests__/route.test.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/api/user/maintenance/__tests__/route.test.ts)

| ชื่อ | ประเภท | เปิดโค้ด |
|---|---|---|
| `GET` | ฟังก์ชัน / component | [บรรทัด 8](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/api/user/maintenance/route.ts:8) |
| `POST` | ฟังก์ชัน / component | [บรรทัด 32](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/api/user/maintenance/route.ts:32) |

### app/api/user/route.ts

[app/api/user/route.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/api/user/route.ts)

HTTP route handler: ตรวจ request/สิทธิ์ ประมวลผล และคืน response; รายละเอียดบท 3–4

นำเข้าไฟล์ในโครงการ: [lib/prisma.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/lib/prisma.ts), [lib/permissions.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/lib/permissions.ts)

นำเข้า package/module: `next/server`, `bcrypt`

ผู้นำเข้าโดยตรง: [app/api/user/__tests__/route.test.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/api/user/__tests__/route.test.ts)

| ชื่อ | ประเภท | เปิดโค้ด |
|---|---|---|
| `ACTIVE_BOOKING_STATUSES` | ค่าระดับ module | [บรรทัด 6](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/api/user/route.ts:6) |
| `USER_SELECT` | ค่าระดับ module | [บรรทัด 13](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/api/user/route.ts:13) |
| `USER_WITH_HISTORY_SELECT` | ค่าระดับ module | [บรรทัด 23](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/api/user/route.ts:23) |
| `hasHistory` | ฟังก์ชัน / component | [บรรทัด 36](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/api/user/route.ts:36) |
| `isPrismaNotFound` | ฟังก์ชัน / component | [บรรทัด 46](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/api/user/route.ts:46) |
| `GET` | ฟังก์ชัน / component | [บรรทัด 55](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/api/user/route.ts:55) |
| `POST` | ฟังก์ชัน / component | [บรรทัด 87](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/api/user/route.ts:87) |
| `PUT` | ฟังก์ชัน / component | [บรรทัด 114](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/api/user/route.ts:114) |
| `PATCH` | ฟังก์ชัน / component | [บรรทัด 171](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/api/user/route.ts:171) |
| `DELETE` | ฟังก์ชัน / component | [บรรทัด 247](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/api/user/route.ts:247) |

### app/api/vehicles/recommend/route.ts

[app/api/vehicles/recommend/route.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/api/vehicles/recommend/route.ts)

HTTP route handler: ตรวจ request/สิทธิ์ ประมวลผล และคืน response; รายละเอียดบท 3–4

นำเข้าไฟล์ในโครงการ: [lib/prisma.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/lib/prisma.ts), [lib/permissions.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/lib/permissions.ts)

นำเข้า package/module: `next/server`

ผู้นำเข้าโดยตรง: ไม่พบในชุดที่ทำดัชนี; page/layout/route และ config/script อาจถูก framework หรือคำสั่งเรียก

| ชื่อ | ประเภท | เปิดโค้ด |
|---|---|---|
| `GET` | ฟังก์ชัน / component | [บรรทัด 10](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/api/vehicles/recommend/route.ts:10) |

### app/api/verhicle-type/route.ts

[app/api/verhicle-type/route.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/api/verhicle-type/route.ts)

HTTP route handler: ตรวจ request/สิทธิ์ ประมวลผล และคืน response; รายละเอียดบท 3–4

นำเข้าไฟล์ในโครงการ: [lib/prisma.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/lib/prisma.ts), [lib/permissions.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/lib/permissions.ts)

นำเข้า package/module: `next/server`

ผู้นำเข้าโดยตรง: [app/api/verhicle-type/__tests__/route.test.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/api/verhicle-type/__tests__/route.test.ts)

| ชื่อ | ประเภท | เปิดโค้ด |
|---|---|---|
| `GET` | ฟังก์ชัน / component | [บรรทัด 6](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/api/verhicle-type/route.ts:6) |
| `POST` | ฟังก์ชัน / component | [บรรทัด 18](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/api/verhicle-type/route.ts:18) |
| `PUT` | ฟังก์ชัน / component | [บรรทัด 31](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/api/verhicle-type/route.ts:31) |
| `DELETE` | ฟังก์ชัน / component | [บรรทัด 44](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/api/verhicle-type/route.ts:44) |

### app/api/verhicle/route.ts

[app/api/verhicle/route.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/api/verhicle/route.ts)

HTTP route handler: ตรวจ request/สิทธิ์ ประมวลผล และคืน response; รายละเอียดบท 3–4

นำเข้าไฟล์ในโครงการ: [lib/prisma.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/lib/prisma.ts), [lib/permissions.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/lib/permissions.ts), [lib/syncStatuses.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/lib/syncStatuses.ts)

นำเข้า package/module: `next/server`

ผู้นำเข้าโดยตรง: [app/api/verhicle/__tests__/route.test.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/api/verhicle/__tests__/route.test.ts)

| ชื่อ | ประเภท | เปิดโค้ด |
|---|---|---|
| `MAX_MILEAGE` | ค่าระดับ module | [บรรทัด 6](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/api/verhicle/route.ts:6) |
| `VehicleInputError` | class | [บรรทัด 8](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/api/verhicle/route.ts:8) |
| `parseCurrentMileage` | ฟังก์ชัน / component | [บรรทัด 10](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/api/verhicle/route.ts:10) |
| `inputErrorResponse` | ฟังก์ชัน / component | [บรรทัด 35](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/api/verhicle/route.ts:35) |
| `GET` | ฟังก์ชัน / component | [บรรทัด 43](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/api/verhicle/route.ts:43) |
| `POST` | ฟังก์ชัน / component | [บรรทัด 61](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/api/verhicle/route.ts:61) |
| `PUT` | ฟังก์ชัน / component | [บรรทัด 93](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/api/verhicle/route.ts:93) |
| `DELETE` | ฟังก์ชัน / component | [บรรทัด 128](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/api/verhicle/route.ts:128) |

### app/approver/approve/_components/ApprovalHeader.tsx

[app/approver/approve/_components/ApprovalHeader.tsx](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/approver/approve/_components/ApprovalHeader.tsx)

ส่วนแสดงผลของ feature รับข้อมูลและ callback ผ่าน props; หน้าที่เฉพาะและ flow อยู่บท 2 ส่วน 9

นำเข้าไฟล์ในโครงการ: [app/approver/approve/constants.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/approver/approve/constants.ts)

นำเข้า package/module: `react`

ผู้นำเข้าโดยตรง: [app/approver/approve/page.tsx](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/approver/approve/page.tsx)

Props ที่ประกาศ: `selectedStatus`, `setSelectedStatus`

| ชื่อ | ประเภท | เปิดโค้ด |
|---|---|---|
| `ApprovalHeaderProps` | ชนิดข้อมูล | [บรรทัด 4](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/approver/approve/_components/ApprovalHeader.tsx:4) |
| `ApprovalHeader` | ฟังก์ชัน / component | [บรรทัด 9](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/approver/approve/_components/ApprovalHeader.tsx:9) |

### app/approver/approve/_components/ApprovalModal.tsx

[app/approver/approve/_components/ApprovalModal.tsx](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/approver/approve/_components/ApprovalModal.tsx)

ส่วนแสดงผลของ feature รับข้อมูลและ callback ผ่าน props; หน้าที่เฉพาะและ flow อยู่บท 2 ส่วน 9

นำเข้าไฟล์ในโครงการ: [lib/format.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/lib/format.ts), [app/approver/approve/types.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/approver/approve/types.ts) (type-only)

นำเข้า package/module: `lucide-react`, `react`

ผู้นำเข้าโดยตรง: [app/approver/approve/page.tsx](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/approver/approve/page.tsx)

Props ที่ประกาศ: `actionType`, `closeApprovalModal`, `submitApproval`, `selectedBooking`, `comment`, `setComment`, `loading`

| ชื่อ | ประเภท | เปิดโค้ด |
|---|---|---|
| `ApprovalModalProps` | ชนิดข้อมูล | [บรรทัด 7](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/approver/approve/_components/ApprovalModal.tsx:7) |
| `ApprovalModal` | ฟังก์ชัน / component | [บรรทัด 17](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/approver/approve/_components/ApprovalModal.tsx:17) |

### app/approver/approve/_components/ApprovalTable.tsx

[app/approver/approve/_components/ApprovalTable.tsx](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/approver/approve/_components/ApprovalTable.tsx)

ส่วนแสดงผลของ feature รับข้อมูลและ callback ผ่าน props; หน้าที่เฉพาะและ flow อยู่บท 2 ส่วน 9

นำเข้าไฟล์ในโครงการ: [lib/format.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/lib/format.ts), [app/approver/approve/types.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/approver/approve/types.ts) (type-only)

นำเข้า package/module: `lucide-react`

ผู้นำเข้าโดยตรง: [app/approver/approve/page.tsx](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/approver/approve/page.tsx)

Props ที่ประกาศ: `selectedStatus`, `bookings`, `loading`, `openApprovalModal`

| ชื่อ | ประเภท | เปิดโค้ด |
|---|---|---|
| `ApprovalTableProps` | ชนิดข้อมูล | [บรรทัด 5](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/approver/approve/_components/ApprovalTable.tsx:5) |
| `ApprovalTable` | ฟังก์ชัน / component | [บรรทัด 12](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/approver/approve/_components/ApprovalTable.tsx:12) |

### app/approver/approve/constants.ts

[app/approver/approve/constants.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/approver/approve/constants.ts)

ค่าระดับ module เช่นค่าเริ่มต้น ตัวเลือก ป้าย และ metadata ที่ผู้นำเข้าใช้

นำเข้าไฟล์ในโครงการ: ไม่มี

นำเข้า package/module: `lucide-react`

ผู้นำเข้าโดยตรง: [app/approver/approve/_components/ApprovalHeader.tsx](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/approver/approve/_components/ApprovalHeader.tsx)

| ชื่อ | ประเภท | เปิดโค้ด |
|---|---|---|
| `STATUS_FILTERS` | ค่าระดับ module | [บรรทัด 3](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/approver/approve/constants.ts:3) |

### app/approver/approve/layout.tsx

[app/approver/approve/layout.tsx](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/approver/approve/layout.tsx)

Next.js layout ห่อหน้าลูก; layout ที่ป้องกันหน้าจะเรียก page-access

นำเข้าไฟล์ในโครงการ: [lib/page-access.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/lib/page-access.ts)

นำเข้า package/module: `react`

ผู้นำเข้าโดยตรง: ไม่พบในชุดที่ทำดัชนี; page/layout/route และ config/script อาจถูก framework หรือคำสั่งเรียก

| ชื่อ | ประเภท | เปิดโค้ด |
|---|---|---|
| `ApproveLayout` | ฟังก์ชัน / component | [บรรทัด 4](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/approver/approve/layout.tsx:4) |

### app/approver/approve/page.tsx

[app/approver/approve/page.tsx](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/approver/approve/page.tsx)

หน้า URL ตามโฟลเดอร์; ประกอบ state/effects/handlers และ UI

นำเข้าไฟล์ในโครงการ: [lib/api.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/lib/api.ts), [app/approver/approve/types.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/approver/approve/types.ts) (type-only), [app/approver/approve/_components/ApprovalHeader.tsx](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/approver/approve/_components/ApprovalHeader.tsx), [app/approver/approve/_components/ApprovalTable.tsx](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/approver/approve/_components/ApprovalTable.tsx), [app/approver/approve/_components/ApprovalModal.tsx](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/approver/approve/_components/ApprovalModal.tsx)

นำเข้า package/module: `react`, `axios`

ผู้นำเข้าโดยตรง: ไม่พบในชุดที่ทำดัชนี; page/layout/route และ config/script อาจถูก framework หรือคำสั่งเรียก

API URL ที่อ้างเป็นข้อความ: `/api/approver?status=${selectedStatus}`, `/api/approver`

| ชื่อ | ประเภท | เปิดโค้ด |
|---|---|---|
| `ApproverBookingsPage` | ฟังก์ชัน / component | [บรรทัด 12](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/approver/approve/page.tsx:12) |
| `fetchBookings` | memo / callback | [บรรทัด 26](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/approver/approve/page.tsx:26) |
| `openApprovalModal` | ฟังก์ชัน / callback | [บรรทัด 39](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/approver/approve/page.tsx:39) |
| `closeApprovalModal` | ฟังก์ชัน / callback | [บรรทัด 51](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/approver/approve/page.tsx:51) |
| `submitApproval` | ฟังก์ชัน / callback | [บรรทัด 57](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/approver/approve/page.tsx:57) |
| `handleKeyDown` | ฟังก์ชัน / callback | [บรรทัด 93](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/approver/approve/page.tsx:93) |

### app/approver/approve/types.ts

[app/approver/approve/types.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/approver/approve/types.ts)

ชนิดข้อมูลของ module: ช่วยตรวจโครงสร้างขณะพัฒนา ไม่ใช่ runtime validation หรือการสร้างตาราง

นำเข้าไฟล์ในโครงการ: ไม่มี

ผู้นำเข้าโดยตรง: [app/approver/approve/_components/ApprovalModal.tsx](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/approver/approve/_components/ApprovalModal.tsx), [app/approver/approve/_components/ApprovalTable.tsx](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/approver/approve/_components/ApprovalTable.tsx), [app/approver/approve/page.tsx](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/approver/approve/page.tsx)

| ชื่อ | ประเภท | เปิดโค้ด |
|---|---|---|
| `Booking` | ชนิดข้อมูล | [บรรทัด 1](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/approver/approve/types.ts:1) |

### app/approver/history/_components/BookingDetailModal.tsx

[app/approver/history/_components/BookingDetailModal.tsx](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/approver/history/_components/BookingDetailModal.tsx)

ส่วนแสดงผลของ feature รับข้อมูลและ callback ผ่าน props; หน้าที่เฉพาะและ flow อยู่บท 2 ส่วน 9

นำเข้าไฟล์ในโครงการ: [lib/format.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/lib/format.ts), [app/approver/history/types.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/approver/history/types.ts) (type-only)

นำเข้า package/module: `lucide-react`

ผู้นำเข้าโดยตรง: [app/approver/history/page.tsx](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/approver/history/page.tsx)

Props ที่ประกาศ: `closeDetailModal`, `selectedBooking`

| ชื่อ | ประเภท | เปิดโค้ด |
|---|---|---|
| `BookingDetailModalProps` | ชนิดข้อมูล | [บรรทัด 5](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/approver/history/_components/BookingDetailModal.tsx:5) |
| `BookingDetailModal` | ฟังก์ชัน / component | [บรรทัด 10](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/approver/history/_components/BookingDetailModal.tsx:10) |

### app/approver/history/_components/HistoryFilters.tsx

[app/approver/history/_components/HistoryFilters.tsx](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/approver/history/_components/HistoryFilters.tsx)

ส่วนแสดงผลของ feature รับข้อมูลและ callback ผ่าน props; หน้าที่เฉพาะและ flow อยู่บท 2 ส่วน 9

นำเข้าไฟล์ในโครงการ: [app/approver/history/types.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/approver/history/types.ts) (type-only), [app/approver/history/constants.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/approver/history/constants.ts)

นำเข้า package/module: `lucide-react`, `react`

ผู้นำเข้าโดยตรง: [app/approver/history/page.tsx](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/approver/history/page.tsx)

Props ที่ประกาศ: `dateFilter`, `setDateFilter`

| ชื่อ | ประเภท | เปิดโค้ด |
|---|---|---|
| `HistoryFiltersProps` | ชนิดข้อมูล | [บรรทัด 6](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/approver/history/_components/HistoryFilters.tsx:6) |
| `HistoryFilters` | ฟังก์ชัน / component | [บรรทัด 11](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/approver/history/_components/HistoryFilters.tsx:11) |

### app/approver/history/_components/HistoryHeader.tsx

[app/approver/history/_components/HistoryHeader.tsx](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/approver/history/_components/HistoryHeader.tsx)

ส่วนแสดงผลของ feature รับข้อมูลและ callback ผ่าน props; หน้าที่เฉพาะและ flow อยู่บท 2 ส่วน 9

นำเข้าไฟล์ในโครงการ: [app/approver/history/constants.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/approver/history/constants.ts)

นำเข้า package/module: `react`

ผู้นำเข้าโดยตรง: [app/approver/history/page.tsx](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/approver/history/page.tsx)

Props ที่ประกาศ: `selectedStatus`, `setSelectedStatus`

| ชื่อ | ประเภท | เปิดโค้ด |
|---|---|---|
| `HistoryHeaderProps` | ชนิดข้อมูล | [บรรทัด 4](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/approver/history/_components/HistoryHeader.tsx:4) |
| `HistoryHeader` | ฟังก์ชัน / component | [บรรทัด 9](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/approver/history/_components/HistoryHeader.tsx:9) |

### app/approver/history/_components/HistoryStats.tsx

[app/approver/history/_components/HistoryStats.tsx](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/approver/history/_components/HistoryStats.tsx)

ส่วนแสดงผลของ feature รับข้อมูลและ callback ผ่าน props; หน้าที่เฉพาะและ flow อยู่บท 2 ส่วน 9

นำเข้าไฟล์ในโครงการ: [app/approver/history/types.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/approver/history/types.ts) (type-only)

นำเข้า package/module: `lucide-react`, `react`

ผู้นำเข้าโดยตรง: [app/approver/history/page.tsx](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/approver/history/page.tsx)

Props ที่ประกาศ: `stats`, `selectedStatus`, `setSelectedStatus`

| ชื่อ | ประเภท | เปิดโค้ด |
|---|---|---|
| `HistoryStatsProps` | ชนิดข้อมูล | [บรรทัด 5](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/approver/history/_components/HistoryStats.tsx:5) |
| `HistoryStats` | ฟังก์ชัน / component | [บรรทัด 11](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/approver/history/_components/HistoryStats.tsx:11) |

### app/approver/history/_components/HistoryTable.tsx

[app/approver/history/_components/HistoryTable.tsx](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/approver/history/_components/HistoryTable.tsx)

ส่วนแสดงผลของ feature รับข้อมูลและ callback ผ่าน props; หน้าที่เฉพาะและ flow อยู่บท 2 ส่วน 9

นำเข้าไฟล์ในโครงการ: [lib/format.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/lib/format.ts), [app/approver/history/types.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/approver/history/types.ts) (type-only)

นำเข้า package/module: `lucide-react`

ผู้นำเข้าโดยตรง: [app/approver/history/page.tsx](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/approver/history/page.tsx)

Props ที่ประกาศ: `bookings`, `loading`, `viewDetails`

| ชื่อ | ประเภท | เปิดโค้ด |
|---|---|---|
| `HistoryTableProps` | ชนิดข้อมูล | [บรรทัด 5](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/approver/history/_components/HistoryTable.tsx:5) |
| `HistoryTable` | ฟังก์ชัน / component | [บรรทัด 11](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/approver/history/_components/HistoryTable.tsx:11) |

### app/approver/history/constants.ts

[app/approver/history/constants.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/approver/history/constants.ts)

ค่าระดับ module เช่นค่าเริ่มต้น ตัวเลือก ป้าย และ metadata ที่ผู้นำเข้าใช้

นำเข้าไฟล์ในโครงการ: [app/approver/history/types.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/approver/history/types.ts) (type-only)

นำเข้า package/module: `lucide-react`

ผู้นำเข้าโดยตรง: [app/approver/history/_components/HistoryFilters.tsx](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/approver/history/_components/HistoryFilters.tsx), [app/approver/history/_components/HistoryHeader.tsx](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/approver/history/_components/HistoryHeader.tsx), [app/approver/history/page.tsx](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/approver/history/page.tsx), [app/approver/history/utils.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/approver/history/utils.ts)

| ชื่อ | ประเภท | เปิดโค้ด |
|---|---|---|
| `INITIAL_DATE_FILTER` | ค่าระดับ module | [บรรทัด 4](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/approver/history/constants.ts:4) |
| `INITIAL_STATS` | ค่าระดับ module | [บรรทัด 9](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/approver/history/constants.ts:9) |
| `STATUS_FILTERS` | ค่าระดับ module | [บรรทัด 15](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/approver/history/constants.ts:15) |

### app/approver/history/layout.tsx

[app/approver/history/layout.tsx](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/approver/history/layout.tsx)

Next.js layout ห่อหน้าลูก; layout ที่ป้องกันหน้าจะเรียก page-access

นำเข้าไฟล์ในโครงการ: [lib/page-access.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/lib/page-access.ts)

นำเข้า package/module: `react`

ผู้นำเข้าโดยตรง: ไม่พบในชุดที่ทำดัชนี; page/layout/route และ config/script อาจถูก framework หรือคำสั่งเรียก

| ชื่อ | ประเภท | เปิดโค้ด |
|---|---|---|
| `ApproverHistoryLayout` | ฟังก์ชัน / component | [บรรทัด 4](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/approver/history/layout.tsx:4) |

### app/approver/history/page.tsx

[app/approver/history/page.tsx](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/approver/history/page.tsx)

หน้า URL ตามโฟลเดอร์; ประกอบ state/effects/handlers และ UI

นำเข้าไฟล์ในโครงการ: [lib/api.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/lib/api.ts), [app/approver/history/types.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/approver/history/types.ts) (type-only), [app/approver/history/constants.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/approver/history/constants.ts), [app/approver/history/utils.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/approver/history/utils.ts), [app/approver/history/_components/HistoryHeader.tsx](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/approver/history/_components/HistoryHeader.tsx), [app/approver/history/_components/HistoryStats.tsx](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/approver/history/_components/HistoryStats.tsx), [app/approver/history/_components/HistoryFilters.tsx](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/approver/history/_components/HistoryFilters.tsx), [app/approver/history/_components/HistoryTable.tsx](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/approver/history/_components/HistoryTable.tsx), [app/approver/history/_components/BookingDetailModal.tsx](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/approver/history/_components/BookingDetailModal.tsx)

นำเข้า package/module: `react`

ผู้นำเข้าโดยตรง: ไม่พบในชุดที่ทำดัชนี; page/layout/route และ config/script อาจถูก framework หรือคำสั่งเรียก

API URL ที่อ้างเป็นข้อความ: `/api/approver?status=ALL`

| ชื่อ | ประเภท | เปิดโค้ด |
|---|---|---|
| `ApprovalHistoryPage` | ฟังก์ชัน / component | [บรรทัด 14](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/approver/history/page.tsx:14) |
| `fetchHistory` | memo / callback | [บรรทัด 25](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/approver/history/page.tsx:25) |
| `viewDetails` | ฟังก์ชัน / callback | [บรรทัด 54](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/approver/history/page.tsx:54) |
| `closeDetailModal` | ฟังก์ชัน / callback | [บรรทัด 59](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/approver/history/page.tsx:59) |
| `handleKeyDown` | ฟังก์ชัน / callback | [บรรทัด 71](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/approver/history/page.tsx:71) |

### app/approver/history/types.ts

[app/approver/history/types.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/approver/history/types.ts)

ชนิดข้อมูลของ module: ช่วยตรวจโครงสร้างขณะพัฒนา ไม่ใช่ runtime validation หรือการสร้างตาราง

นำเข้าไฟล์ในโครงการ: ไม่มี

ผู้นำเข้าโดยตรง: [app/approver/history/_components/BookingDetailModal.tsx](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/approver/history/_components/BookingDetailModal.tsx), [app/approver/history/_components/HistoryFilters.tsx](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/approver/history/_components/HistoryFilters.tsx), [app/approver/history/_components/HistoryStats.tsx](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/approver/history/_components/HistoryStats.tsx), [app/approver/history/_components/HistoryTable.tsx](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/approver/history/_components/HistoryTable.tsx), [app/approver/history/constants.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/approver/history/constants.ts), [app/approver/history/page.tsx](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/approver/history/page.tsx), [app/approver/history/utils.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/approver/history/utils.ts)

| ชื่อ | ประเภท | เปิดโค้ด |
|---|---|---|
| `Booking` | ชนิดข้อมูล | [บรรทัด 1](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/approver/history/types.ts:1) |
| `BookingStats` | ชนิดข้อมูล | [บรรทัด 31](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/approver/history/types.ts:31) |
| `DateFilter` | ชนิดข้อมูล | [บรรทัด 37](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/approver/history/types.ts:37) |

### app/approver/history/utils.ts

[app/approver/history/utils.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/approver/history/utils.ts)

ฟังก์ชันช่วยของ feature; ดูผู้นำเข้าเพื่อแยกว่า page หรือ component เรียก

นำเข้าไฟล์ในโครงการ: [app/approver/history/types.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/approver/history/types.ts) (type-only), [app/approver/history/constants.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/approver/history/constants.ts)

ผู้นำเข้าโดยตรง: [app/approver/history/page.tsx](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/approver/history/page.tsx)

| ชื่อ | ประเภท | เปิดโค้ด |
|---|---|---|
| `buildStats` | ฟังก์ชัน / component | [บรรทัด 4](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/approver/history/utils.ts:4) |
| `filterByDate` | ฟังก์ชัน / component | [บรรทัด 13](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/approver/history/utils.ts:13) |

### app/approver/layout.tsx

[app/approver/layout.tsx](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/approver/layout.tsx)

Next.js layout ห่อหน้าลูก; layout ที่ป้องกันหน้าจะเรียก page-access

นำเข้าไฟล์ในโครงการ: [lib/page-access.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/lib/page-access.ts)

นำเข้า package/module: `react`

ผู้นำเข้าโดยตรง: ไม่พบในชุดที่ทำดัชนี; page/layout/route และ config/script อาจถูก framework หรือคำสั่งเรียก

| ชื่อ | ประเภท | เปิดโค้ด |
|---|---|---|
| `ApproverLayout` | ฟังก์ชัน / component | [บรรทัด 4](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/approver/layout.tsx:4) |

### app/approver/page.tsx

[app/approver/page.tsx](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/approver/page.tsx)

หน้า URL ตามโฟลเดอร์; ประกอบ state/effects/handlers และ UI

นำเข้าไฟล์ในโครงการ: [lib/api.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/lib/api.ts), [app/component/role-dashboard.tsx](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/component/role-dashboard.tsx)

นำเข้า package/module: `lucide-react`, `react`

ผู้นำเข้าโดยตรง: ไม่พบในชุดที่ทำดัชนี; page/layout/route และ config/script อาจถูก framework หรือคำสั่งเรียก

API URL ที่อ้างเป็นข้อความ: `/api/auth/me`, `/api/approver?status=PENDING`

| ชื่อ | ประเภท | เปิดโค้ด |
|---|---|---|
| `ApproverPage` | ฟังก์ชัน / component | [บรรทัด 11](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/approver/page.tsx:11) |
| `fetchData` | ฟังก์ชัน / callback | [บรรทัด 17](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/approver/page.tsx:17) |

### app/component/navbar.tsx

[app/component/navbar.tsx](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/component/navbar.tsx)

เปิดชื่อฟังก์ชันและแผนที่ import ด้านล่างประกอบคำอธิบายโมดูลในบท 1–4

นำเข้าไฟล์ในโครงการ: [lib/format.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/lib/format.ts), [lib/api.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/lib/api.ts)

นำเข้า package/module: `react`, `lucide-react`, `next/navigation`, `axios`

ผู้นำเข้าโดยตรง: [app/layout.tsx](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/layout.tsx)

API URL ที่อ้างเป็นข้อความ: `/api/auth/me`, `/api/notifications?limit=10`, `/api/auth/logout`, `/api/notifications`

| ชื่อ | ประเภท | เปิดโค้ด |
|---|---|---|
| `User` | ชนิดข้อมูล | [บรรทัด 10](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/component/navbar.tsx:10) |
| `NotificationItem` | ชนิดข้อมูล | [บรรทัด 17](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/component/navbar.tsx:17) |
| `Navbar` | ฟังก์ชัน / component | [บรรทัด 27](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/component/navbar.tsx:27) |
| `fetchUser` | ฟังก์ชัน / callback | [บรรทัด 45](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/component/navbar.tsx:45) |
| `fetchNotifications` | memo / callback | [บรรทัด 65](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/component/navbar.tsx:65) |
| `handlePointerDown` | ฟังก์ชัน / callback | [บรรทัด 91](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/component/navbar.tsx:91) |
| `handleKeyDown` | ฟังก์ชัน / callback | [บรรทัด 99](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/component/navbar.tsx:99) |
| `handleLogout` | ฟังก์ชัน / callback | [บรรทัด 115](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/component/navbar.tsx:115) |
| `openNotification` | ฟังก์ชัน / callback | [บรรทัด 123](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/component/navbar.tsx:123) |
| `markAllAsRead` | ฟังก์ชัน / callback | [บรรทัด 148](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/component/navbar.tsx:148) |

### app/component/role-dashboard.tsx

[app/component/role-dashboard.tsx](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/component/role-dashboard.tsx)

เปิดชื่อฟังก์ชันและแผนที่ import ด้านล่างประกอบคำอธิบายโมดูลในบท 1–4

นำเข้าไฟล์ในโครงการ: ไม่มี

นำเข้า package/module: `lucide-react`, `next/navigation`

ผู้นำเข้าโดยตรง: [app/admin/page.tsx](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/admin/page.tsx), [app/approver/page.tsx](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/approver/page.tsx), [app/user/page.tsx](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/user/page.tsx)

Props ที่ประกาศ: `title`, `description`, `items`, `emptyTitle`, `emptyDescription`

| ชื่อ | ประเภท | เปิดโค้ด |
|---|---|---|
| `DashboardMenuItem` | ชนิดข้อมูล | [บรรทัด 7](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/component/role-dashboard.tsx:7) |
| `RoleDashboardProps` | ชนิดข้อมูล | [บรรทัด 17](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/component/role-dashboard.tsx:17) |
| `toneClasses` | ค่าระดับ module | [บรรทัด 25](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/component/role-dashboard.tsx:25) |
| `DashboardLoading` | ฟังก์ชัน / component | [บรรทัด 34](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/component/role-dashboard.tsx:34) |
| `RoleDashboard` | ฟังก์ชัน / component | [บรรทัด 52](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/component/role-dashboard.tsx:52) |

### app/constants.ts

[app/constants.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/constants.ts)

ค่าระดับ module เช่นค่าเริ่มต้น ตัวเลือก ป้าย และ metadata ที่ผู้นำเข้าใช้

นำเข้าไฟล์ในโครงการ: ไม่มี

ผู้นำเข้าโดยตรง: [app/_components/TestAccounts.tsx](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/_components/TestAccounts.tsx), [app/page.tsx](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/page.tsx)

| ชื่อ | ประเภท | เปิดโค้ด |
|---|---|---|
| `TEST_ACCOUNTS` | ค่าระดับ module | [บรรทัด 1](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/constants.ts:1) |

### app/forbidden/page.tsx

[app/forbidden/page.tsx](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/forbidden/page.tsx)

หน้า URL ตามโฟลเดอร์; ประกอบ state/effects/handlers และ UI

นำเข้าไฟล์ในโครงการ: ไม่มี

นำเข้า package/module: `next/link`, `lucide-react`

ผู้นำเข้าโดยตรง: ไม่พบในชุดที่ทำดัชนี; page/layout/route และ config/script อาจถูก framework หรือคำสั่งเรียก

| ชื่อ | ประเภท | เปิดโค้ด |
|---|---|---|
| `ForbiddenPage` | ฟังก์ชัน / component | [บรรทัด 4](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/forbidden/page.tsx:4) |

### app/layout.tsx

[app/layout.tsx](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/layout.tsx)

Next.js layout ห่อหน้าลูก; layout ที่ป้องกันหน้าจะเรียก page-access

นำเข้าไฟล์ในโครงการ: [app/globals.css](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/globals.css), [app/component/navbar.tsx](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/component/navbar.tsx)

นำเข้า package/module: `next`

ผู้นำเข้าโดยตรง: ไม่พบในชุดที่ทำดัชนี; page/layout/route และ config/script อาจถูก framework หรือคำสั่งเรียก

| ชื่อ | ประเภท | เปิดโค้ด |
|---|---|---|
| `metadata` | ค่าระดับ module | [บรรทัด 5](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/layout.tsx:5) |
| `RootLayout` | ฟังก์ชัน / component | [บรรทัด 10](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/layout.tsx:10) |

### app/page.tsx

[app/page.tsx](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/page.tsx)

หน้า URL ตามโฟลเดอร์; ประกอบ state/effects/handlers และ UI

นำเข้าไฟล์ในโครงการ: [lib/api.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/lib/api.ts), [app/constants.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/constants.ts), [app/utils.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/utils.ts), [app/_components/LoginBranding.tsx](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/_components/LoginBranding.tsx), [app/_components/LoginForm.tsx](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/_components/LoginForm.tsx), [app/_components/TestAccounts.tsx](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/_components/TestAccounts.tsx)

นำเข้า package/module: `react`, `next/navigation`, `next/image`

ผู้นำเข้าโดยตรง: ไม่พบในชุดที่ทำดัชนี; page/layout/route และ config/script อาจถูก framework หรือคำสั่งเรียก

API URL ที่อ้างเป็นข้อความ: `/api/auth/login`

| ชื่อ | ประเภท | เปิดโค้ด |
|---|---|---|
| `LoginPage` | ฟังก์ชัน / component | [บรรทัด 14](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/page.tsx:14) |
| `handleLogin` | ฟังก์ชัน / callback | [บรรทัด 22](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/page.tsx:22) |
| `fillAccount` | ฟังก์ชัน / callback | [บรรทัด 41](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/page.tsx:41) |

### app/user/booking/_components/BookingFormModal.tsx

[app/user/booking/_components/BookingFormModal.tsx](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/user/booking/_components/BookingFormModal.tsx)

ส่วนแสดงผลของ feature รับข้อมูลและ callback ผ่าน props; หน้าที่เฉพาะและ flow อยู่บท 2 ส่วน 9

นำเข้าไฟล์ในโครงการ: [lib/format.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/lib/format.ts), [app/user/booking/types.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/user/booking/types.ts) (type-only)

นำเข้า package/module: `lucide-react`, `react`

ผู้นำเข้าโดยตรง: [app/user/booking/page.tsx](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/user/booking/page.tsx)

Props ที่ประกาศ: `closeBookingForm`, `submitBooking`, `selectedVehicle`, `searchDate`, `bookingData`, `setBookingData`, `loading`

| ชื่อ | ประเภท | เปิดโค้ด |
|---|---|---|
| `BookingFormModalProps` | ชนิดข้อมูล | [บรรทัด 7](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/user/booking/_components/BookingFormModal.tsx:7) |
| `BookingFormModal` | ฟังก์ชัน / component | [บรรทัด 17](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/user/booking/_components/BookingFormModal.tsx:17) |

### app/user/booking/_components/VehicleSearchFilters.tsx

[app/user/booking/_components/VehicleSearchFilters.tsx](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/user/booking/_components/VehicleSearchFilters.tsx)

ส่วนแสดงผลของ feature รับข้อมูลและ callback ผ่าน props; หน้าที่เฉพาะและ flow อยู่บท 2 ส่วน 9

นำเข้าไฟล์ในโครงการ: [app/user/booking/types.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/user/booking/types.ts) (type-only), [app/user/booking/utils.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/user/booking/utils.ts)

นำเข้า package/module: `lucide-react`, `react`

ผู้นำเข้าโดยตรง: [app/user/booking/page.tsx](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/user/booking/page.tsx)

Props ที่ประกาศ: `selectedType`, `setSelectedType`, `vehicleTypes`, `searchDate`, `setSearchDate`, `minEndDateTime`, `searchVehicles`, `loading`, `canSearch`

| ชื่อ | ประเภท | เปิดโค้ด |
|---|---|---|
| `VehicleSearchFiltersProps` | ชนิดข้อมูล | [บรรทัด 6](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/user/booking/_components/VehicleSearchFilters.tsx:6) |
| `VehicleSearchFilters` | ฟังก์ชัน / component | [บรรทัด 18](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/user/booking/_components/VehicleSearchFilters.tsx:18) |

### app/user/booking/_components/VehicleSearchPlaceholder.tsx

[app/user/booking/_components/VehicleSearchPlaceholder.tsx](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/user/booking/_components/VehicleSearchPlaceholder.tsx)

ส่วนแสดงผลของ feature รับข้อมูลและ callback ผ่าน props; หน้าที่เฉพาะและ flow อยู่บท 2 ส่วน 9

นำเข้าไฟล์ในโครงการ: ไม่มี

นำเข้า package/module: `lucide-react`

ผู้นำเข้าโดยตรง: [app/user/booking/page.tsx](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/user/booking/page.tsx)

| ชื่อ | ประเภท | เปิดโค้ด |
|---|---|---|
| `VehicleSearchPlaceholder` | ฟังก์ชัน / component | [บรรทัด 3](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/user/booking/_components/VehicleSearchPlaceholder.tsx:3) |

### app/user/booking/_components/VehicleSearchResults.tsx

[app/user/booking/_components/VehicleSearchResults.tsx](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/user/booking/_components/VehicleSearchResults.tsx)

ส่วนแสดงผลของ feature รับข้อมูลและ callback ผ่าน props; หน้าที่เฉพาะและ flow อยู่บท 2 ส่วน 9

นำเข้าไฟล์ในโครงการ: [app/user/booking/types.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/user/booking/types.ts) (type-only)

นำเข้า package/module: `lucide-react`

ผู้นำเข้าโดยตรง: [app/user/booking/page.tsx](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/user/booking/page.tsx)

Props ที่ประกาศ: `vehicles`, `openBookingForm`

| ชื่อ | ประเภท | เปิดโค้ด |
|---|---|---|
| `VehicleSearchResultsProps` | ชนิดข้อมูล | [บรรทัด 4](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/user/booking/_components/VehicleSearchResults.tsx:4) |
| `VehicleSearchResults` | ฟังก์ชัน / component | [บรรทัด 9](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/user/booking/_components/VehicleSearchResults.tsx:9) |

### app/user/booking/constants.ts

[app/user/booking/constants.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/user/booking/constants.ts)

ค่าระดับ module เช่นค่าเริ่มต้น ตัวเลือก ป้าย และ metadata ที่ผู้นำเข้าใช้

นำเข้าไฟล์ในโครงการ: [app/user/booking/types.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/user/booking/types.ts) (type-only)

ผู้นำเข้าโดยตรง: [app/user/booking/page.tsx](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/user/booking/page.tsx)

| ชื่อ | ประเภท | เปิดโค้ด |
|---|---|---|
| `INITIAL_BOOKING_DATA` | ค่าระดับ module | [บรรทัด 3](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/user/booking/constants.ts:3) |
| `INITIAL_SEARCH_DATE` | ค่าระดับ module | [บรรทัด 11](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/user/booking/constants.ts:11) |

### app/user/booking/layout.tsx

[app/user/booking/layout.tsx](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/user/booking/layout.tsx)

Next.js layout ห่อหน้าลูก; layout ที่ป้องกันหน้าจะเรียก page-access

นำเข้าไฟล์ในโครงการ: [lib/page-access.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/lib/page-access.ts)

นำเข้า package/module: `react`

ผู้นำเข้าโดยตรง: ไม่พบในชุดที่ทำดัชนี; page/layout/route และ config/script อาจถูก framework หรือคำสั่งเรียก

| ชื่อ | ประเภท | เปิดโค้ด |
|---|---|---|
| `BookingLayout` | ฟังก์ชัน / component | [บรรทัด 4](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/user/booking/layout.tsx:4) |

### app/user/booking/page.tsx

[app/user/booking/page.tsx](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/user/booking/page.tsx)

หน้า URL ตามโฟลเดอร์; ประกอบ state/effects/handlers และ UI

นำเข้าไฟล์ในโครงการ: [lib/api.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/lib/api.ts), [app/user/booking/types.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/user/booking/types.ts) (type-only), [app/user/booking/constants.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/user/booking/constants.ts), [app/user/booking/utils.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/user/booking/utils.ts), [app/user/booking/_components/VehicleSearchFilters.tsx](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/user/booking/_components/VehicleSearchFilters.tsx), [app/user/booking/_components/VehicleSearchResults.tsx](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/user/booking/_components/VehicleSearchResults.tsx), [app/user/booking/_components/VehicleSearchPlaceholder.tsx](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/user/booking/_components/VehicleSearchPlaceholder.tsx), [app/user/booking/_components/BookingFormModal.tsx](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/user/booking/_components/BookingFormModal.tsx)

นำเข้า package/module: `react`, `lucide-react`

ผู้นำเข้าโดยตรง: ไม่พบในชุดที่ทำดัชนี; page/layout/route และ config/script อาจถูก framework หรือคำสั่งเรียก

API URL ที่อ้างเป็นข้อความ: `/api/verhicle-type`, `/api/vehicles/recommend?${params.toString()}`, `/api/booking`

| ชื่อ | ประเภท | เปิดโค้ด |
|---|---|---|
| `BookingPage` | ฟังก์ชัน / component | [บรรทัด 15](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/user/booking/page.tsx:15) |
| `fetchVehicleTypes` | memo / callback | [บรรทัด 28](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/user/booking/page.tsx:28) |
| `searchVehicles` | memo / callback | [บรรทัด 37](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/user/booking/page.tsx:37) |
| `openBookingForm` | ฟังก์ชัน / callback | [บรรทัด 60](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/user/booking/page.tsx:60) |
| `closeBookingForm` | ฟังก์ชัน / callback | [บรรทัด 74](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/user/booking/page.tsx:74) |
| `submitBooking` | ฟังก์ชัน / callback | [บรรทัด 80](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/user/booking/page.tsx:80) |
| `handleKeyDown` | ฟังก์ชัน / callback | [บรรทัด 115](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/user/booking/page.tsx:115) |

### app/user/booking/types.ts

[app/user/booking/types.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/user/booking/types.ts)

ชนิดข้อมูลของ module: ช่วยตรวจโครงสร้างขณะพัฒนา ไม่ใช่ runtime validation หรือการสร้างตาราง

นำเข้าไฟล์ในโครงการ: ไม่มี

ผู้นำเข้าโดยตรง: [app/user/booking/_components/BookingFormModal.tsx](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/user/booking/_components/BookingFormModal.tsx), [app/user/booking/_components/VehicleSearchFilters.tsx](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/user/booking/_components/VehicleSearchFilters.tsx), [app/user/booking/_components/VehicleSearchResults.tsx](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/user/booking/_components/VehicleSearchResults.tsx), [app/user/booking/constants.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/user/booking/constants.ts), [app/user/booking/page.tsx](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/user/booking/page.tsx)

| ชื่อ | ประเภท | เปิดโค้ด |
|---|---|---|
| `Vehicle` | ชนิดข้อมูล | [บรรทัด 1](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/user/booking/types.ts:1) |
| `VehicleType` | ชนิดข้อมูล | [บรรทัด 12](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/user/booking/types.ts:12) |
| `BookingData` | ชนิดข้อมูล | [บรรทัด 14](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/user/booking/types.ts:14) |
| `SearchDate` | ชนิดข้อมูล | [บรรทัด 22](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/user/booking/types.ts:22) |

### app/user/booking/utils.ts

[app/user/booking/utils.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/user/booking/utils.ts)

ฟังก์ชันช่วยของ feature; ดูผู้นำเข้าเพื่อแยกว่า page หรือ component เรียก

นำเข้าไฟล์ในโครงการ: ไม่มี

นำเข้า package/module: `axios`

ผู้นำเข้าโดยตรง: [app/user/booking/_components/VehicleSearchFilters.tsx](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/user/booking/_components/VehicleSearchFilters.tsx), [app/user/booking/page.tsx](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/user/booking/page.tsx)

| ชื่อ | ประเภท | เปิดโค้ด |
|---|---|---|
| `getErrorMessage` | ฟังก์ชัน / component | [บรรทัด 3](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/user/booking/utils.ts:3) |
| `getLocalDateTimeInputValue` | ฟังก์ชัน / component | [บรรทัด 8](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/user/booking/utils.ts:8) |

### app/user/layout.tsx

[app/user/layout.tsx](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/user/layout.tsx)

Next.js layout ห่อหน้าลูก; layout ที่ป้องกันหน้าจะเรียก page-access

นำเข้าไฟล์ในโครงการ: [lib/page-access.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/lib/page-access.ts)

นำเข้า package/module: `react`

ผู้นำเข้าโดยตรง: ไม่พบในชุดที่ทำดัชนี; page/layout/route และ config/script อาจถูก framework หรือคำสั่งเรียก

| ชื่อ | ประเภท | เปิดโค้ด |
|---|---|---|
| `UserLayout` | ฟังก์ชัน / component | [บรรทัด 4](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/user/layout.tsx:4) |

### app/user/maintenance/_components/MaintenanceStatsPanel.tsx

[app/user/maintenance/_components/MaintenanceStatsPanel.tsx](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/user/maintenance/_components/MaintenanceStatsPanel.tsx)

ส่วนแสดงผลของ feature รับข้อมูลและ callback ผ่าน props; หน้าที่เฉพาะและ flow อยู่บท 2 ส่วน 9

นำเข้าไฟล์ในโครงการ: [app/user/maintenance/types.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/user/maintenance/types.ts) (type-only)

นำเข้า package/module: `lucide-react`

ผู้นำเข้าโดยตรง: [app/user/maintenance/page.tsx](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/user/maintenance/page.tsx)

Props ที่ประกาศ: `stats`

| ชื่อ | ประเภท | เปิดโค้ด |
|---|---|---|
| `MaintenanceStatsPanelProps` | ชนิดข้อมูล | [บรรทัด 4](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/user/maintenance/_components/MaintenanceStatsPanel.tsx:4) |
| `MaintenanceStatsPanel` | ฟังก์ชัน / component | [บรรทัด 8](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/user/maintenance/_components/MaintenanceStatsPanel.tsx:8) |

### app/user/maintenance/_components/MaintenanceTable.tsx

[app/user/maintenance/_components/MaintenanceTable.tsx](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/user/maintenance/_components/MaintenanceTable.tsx)

ส่วนแสดงผลของ feature รับข้อมูลและ callback ผ่าน props; หน้าที่เฉพาะและ flow อยู่บท 2 ส่วน 9

นำเข้าไฟล์ในโครงการ: [lib/format.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/lib/format.ts), [app/user/maintenance/types.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/user/maintenance/types.ts) (type-only), [app/user/maintenance/constants.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/user/maintenance/constants.ts)

นำเข้า package/module: `lucide-react`

ผู้นำเข้าโดยตรง: [app/user/maintenance/page.tsx](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/user/maintenance/page.tsx)

Props ที่ประกาศ: `maintenances`, `loading`

| ชื่อ | ประเภท | เปิดโค้ด |
|---|---|---|
| `MaintenanceTableProps` | ชนิดข้อมูล | [บรรทัด 6](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/user/maintenance/_components/MaintenanceTable.tsx:6) |
| `MaintenanceTable` | ฟังก์ชัน / component | [บรรทัด 11](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/user/maintenance/_components/MaintenanceTable.tsx:11) |

### app/user/maintenance/_components/ReportMaintenanceModal.tsx

[app/user/maintenance/_components/ReportMaintenanceModal.tsx](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/user/maintenance/_components/ReportMaintenanceModal.tsx)

ส่วนแสดงผลของ feature รับข้อมูลและ callback ผ่าน props; หน้าที่เฉพาะและ flow อยู่บท 2 ส่วน 9

นำเข้าไฟล์ในโครงการ: [app/user/maintenance/types.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/user/maintenance/types.ts) (type-only), [app/user/maintenance/utils.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/user/maintenance/utils.ts)

นำเข้า package/module: `lucide-react`, `react`

ผู้นำเข้าโดยตรง: [app/user/maintenance/page.tsx](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/user/maintenance/page.tsx)

Props ที่ประกาศ: `closeReportModal`, `handleSubmit`, `error`, `formData`, `setFormData`, `vehicles`, `loading`

| ชื่อ | ประเภท | เปิดโค้ด |
|---|---|---|
| `ReportMaintenanceModalProps` | ชนิดข้อมูล | [บรรทัด 7](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/user/maintenance/_components/ReportMaintenanceModal.tsx:7) |
| `ReportMaintenanceModal` | ฟังก์ชัน / component | [บรรทัด 17](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/user/maintenance/_components/ReportMaintenanceModal.tsx:17) |

### app/user/maintenance/constants.ts

[app/user/maintenance/constants.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/user/maintenance/constants.ts)

ค่าระดับ module เช่นค่าเริ่มต้น ตัวเลือก ป้าย และ metadata ที่ผู้นำเข้าใช้

นำเข้าไฟล์ในโครงการ: [app/user/maintenance/types.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/user/maintenance/types.ts) (type-only)

ผู้นำเข้าโดยตรง: [app/user/maintenance/_components/MaintenanceTable.tsx](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/user/maintenance/_components/MaintenanceTable.tsx), [app/user/maintenance/utils.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/user/maintenance/utils.ts)

| ชื่อ | ประเภท | เปิดโค้ด |
|---|---|---|
| `INITIAL_STATS` | ค่าระดับ module | [บรรทัด 3](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/user/maintenance/constants.ts:3) |
| `maintenanceTypeLabels` | ค่าระดับ module | [บรรทัด 10](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/user/maintenance/constants.ts:10) |

### app/user/maintenance/layout.tsx

[app/user/maintenance/layout.tsx](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/user/maintenance/layout.tsx)

Next.js layout ห่อหน้าลูก; layout ที่ป้องกันหน้าจะเรียก page-access

นำเข้าไฟล์ในโครงการ: [lib/page-access.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/lib/page-access.ts)

นำเข้า package/module: `react`

ผู้นำเข้าโดยตรง: ไม่พบในชุดที่ทำดัชนี; page/layout/route และ config/script อาจถูก framework หรือคำสั่งเรียก

| ชื่อ | ประเภท | เปิดโค้ด |
|---|---|---|
| `UserMaintenanceLayout` | ฟังก์ชัน / component | [บรรทัด 4](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/user/maintenance/layout.tsx:4) |

### app/user/maintenance/page.tsx

[app/user/maintenance/page.tsx](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/user/maintenance/page.tsx)

หน้า URL ตามโฟลเดอร์; ประกอบ state/effects/handlers และ UI

นำเข้าไฟล์ในโครงการ: [lib/api.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/lib/api.ts), [lib/use-permissions.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/lib/use-permissions.ts), [app/user/maintenance/types.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/user/maintenance/types.ts) (type-only), [app/user/maintenance/utils.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/user/maintenance/utils.ts), [app/user/maintenance/_components/MaintenanceStatsPanel.tsx](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/user/maintenance/_components/MaintenanceStatsPanel.tsx), [app/user/maintenance/_components/MaintenanceTable.tsx](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/user/maintenance/_components/MaintenanceTable.tsx), [app/user/maintenance/_components/ReportMaintenanceModal.tsx](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/user/maintenance/_components/ReportMaintenanceModal.tsx)

นำเข้า package/module: `react`, `lucide-react`

ผู้นำเข้าโดยตรง: ไม่พบในชุดที่ทำดัชนี; page/layout/route และ config/script อาจถูก framework หรือคำสั่งเรียก

API URL ที่อ้างเป็นข้อความ: `/api/user/maintenance`, `/api/verhicle`

| ชื่อ | ประเภท | เปิดโค้ด |
|---|---|---|
| `UserMaintenancePage` | ฟังก์ชัน / component | [บรรทัด 14](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/user/maintenance/page.tsx:14) |
| `stats` | memo / callback | [บรรทัด 26](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/user/maintenance/page.tsx:26) |
| `fetchData` | memo / callback | [บรรทัด 28](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/user/maintenance/page.tsx:28) |
| `openReportModal` | ฟังก์ชัน / callback | [บรรทัด 45](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/user/maintenance/page.tsx:45) |
| `closeReportModal` | memo / callback | [บรรทัด 52](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/user/maintenance/page.tsx:52) |
| `handleSubmit` | ฟังก์ชัน / callback | [บรรทัด 57](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/user/maintenance/page.tsx:57) |
| `handleKeyDown` | ฟังก์ชัน / callback | [บรรทัด 82](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/user/maintenance/page.tsx:82) |

### app/user/maintenance/types.ts

[app/user/maintenance/types.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/user/maintenance/types.ts)

ชนิดข้อมูลของ module: ช่วยตรวจโครงสร้างขณะพัฒนา ไม่ใช่ runtime validation หรือการสร้างตาราง

นำเข้าไฟล์ในโครงการ: ไม่มี

ผู้นำเข้าโดยตรง: [app/user/maintenance/_components/MaintenanceStatsPanel.tsx](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/user/maintenance/_components/MaintenanceStatsPanel.tsx), [app/user/maintenance/_components/MaintenanceTable.tsx](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/user/maintenance/_components/MaintenanceTable.tsx), [app/user/maintenance/_components/ReportMaintenanceModal.tsx](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/user/maintenance/_components/ReportMaintenanceModal.tsx), [app/user/maintenance/constants.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/user/maintenance/constants.ts), [app/user/maintenance/page.tsx](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/user/maintenance/page.tsx), [app/user/maintenance/utils.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/user/maintenance/utils.ts)

| ชื่อ | ประเภท | เปิดโค้ด |
|---|---|---|
| `MaintenanceType` | ชนิดข้อมูล | [บรรทัด 1](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/user/maintenance/types.ts:1) |
| `Maintenance` | ชนิดข้อมูล | [บรรทัด 3](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/user/maintenance/types.ts:3) |
| `Vehicle` | ชนิดข้อมูล | [บรรทัด 18](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/user/maintenance/types.ts:18) |
| `MaintenanceForm` | ชนิดข้อมูล | [บรรทัด 25](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/user/maintenance/types.ts:25) |
| `MaintenanceStats` | ชนิดข้อมูล | [บรรทัด 32](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/user/maintenance/types.ts:32) |

### app/user/maintenance/utils.ts

[app/user/maintenance/utils.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/user/maintenance/utils.ts)

ฟังก์ชันช่วยของ feature; ดูผู้นำเข้าเพื่อแยกว่า page หรือ component เรียก

นำเข้าไฟล์ในโครงการ: [app/user/maintenance/types.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/user/maintenance/types.ts) (type-only), [app/user/maintenance/constants.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/user/maintenance/constants.ts)

นำเข้า package/module: `axios`

ผู้นำเข้าโดยตรง: [app/user/maintenance/_components/ReportMaintenanceModal.tsx](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/user/maintenance/_components/ReportMaintenanceModal.tsx), [app/user/maintenance/page.tsx](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/user/maintenance/page.tsx)

| ชื่อ | ประเภท | เปิดโค้ด |
|---|---|---|
| `getLocalDateTimeInputValue` | ฟังก์ชัน / component | [บรรทัด 5](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/user/maintenance/utils.ts:5) |
| `getInitialFormData` | ฟังก์ชัน / component | [บรรทัด 11](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/user/maintenance/utils.ts:11) |
| `getErrorMessage` | ฟังก์ชัน / component | [บรรทัด 20](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/user/maintenance/utils.ts:20) |
| `buildStats` | ฟังก์ชัน / component | [บรรทัด 25](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/user/maintenance/utils.ts:25) |

### app/user/my-bookings/_components/BookingDetailModal.tsx

[app/user/my-bookings/_components/BookingDetailModal.tsx](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/user/my-bookings/_components/BookingDetailModal.tsx)

ส่วนแสดงผลของ feature รับข้อมูลและ callback ผ่าน props; หน้าที่เฉพาะและ flow อยู่บท 2 ส่วน 9

นำเข้าไฟล์ในโครงการ: [app/user/my-bookings/types.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/user/my-bookings/types.ts) (type-only), [app/user/my-bookings/_components/ModalHeader.tsx](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/user/my-bookings/_components/ModalHeader.tsx), [app/user/my-bookings/_components/BookingDetailPanel.tsx](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/user/my-bookings/_components/BookingDetailPanel.tsx), [app/user/my-bookings/_components/PrimaryButton.tsx](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/user/my-bookings/_components/PrimaryButton.tsx)

ผู้นำเข้าโดยตรง: [app/user/my-bookings/page.tsx](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/user/my-bookings/page.tsx)

Props ที่ประกาศ: `closeModal`, `selectedBooking`

| ชื่อ | ประเภท | เปิดโค้ด |
|---|---|---|
| `BookingDetailModalProps` | ชนิดข้อมูล | [บรรทัด 6](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/user/my-bookings/_components/BookingDetailModal.tsx:6) |
| `BookingDetailModal` | ฟังก์ชัน / component | [บรรทัด 11](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/user/my-bookings/_components/BookingDetailModal.tsx:11) |

### app/user/my-bookings/_components/BookingDetailPanel.tsx

[app/user/my-bookings/_components/BookingDetailPanel.tsx](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/user/my-bookings/_components/BookingDetailPanel.tsx)

ส่วนแสดงผลของ feature รับข้อมูลและ callback ผ่าน props; หน้าที่เฉพาะและ flow อยู่บท 2 ส่วน 9

นำเข้าไฟล์ในโครงการ: [lib/format.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/lib/format.ts), [app/user/my-bookings/types.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/user/my-bookings/types.ts) (type-only), [app/user/my-bookings/utils.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/user/my-bookings/utils.ts)

ผู้นำเข้าโดยตรง: [app/user/my-bookings/_components/BookingDetailModal.tsx](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/user/my-bookings/_components/BookingDetailModal.tsx)

Props ที่ประกาศ: `booking`

| ชื่อ | ประเภท | เปิดโค้ด |
|---|---|---|
| `BookingDetailPanel` | ฟังก์ชัน / component | [บรรทัด 5](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/user/my-bookings/_components/BookingDetailPanel.tsx:5) |

### app/user/my-bookings/_components/BookingEditModal.tsx

[app/user/my-bookings/_components/BookingEditModal.tsx](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/user/my-bookings/_components/BookingEditModal.tsx)

ส่วนแสดงผลของ feature รับข้อมูลและ callback ผ่าน props; หน้าที่เฉพาะและ flow อยู่บท 2 ส่วน 9

นำเข้าไฟล์ในโครงการ: [app/user/my-bookings/types.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/user/my-bookings/types.ts) (type-only), [app/user/my-bookings/utils.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/user/my-bookings/utils.ts), [app/user/my-bookings/_components/ModalHeader.tsx](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/user/my-bookings/_components/ModalHeader.tsx), [app/user/my-bookings/_components/ModalActions.tsx](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/user/my-bookings/_components/ModalActions.tsx)

นำเข้า package/module: `react`

ผู้นำเข้าโดยตรง: [app/user/my-bookings/page.tsx](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/user/my-bookings/page.tsx)

Props ที่ประกาศ: `closeModal`, `handleEditSubmit`, `editForm`, `setEditForm`, `minEditEndDateTime`, `loading`

| ชื่อ | ประเภท | เปิดโค้ด |
|---|---|---|
| `BookingEditModalProps` | ชนิดข้อมูล | [บรรทัด 8](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/user/my-bookings/_components/BookingEditModal.tsx:8) |
| `BookingEditModal` | ฟังก์ชัน / component | [บรรทัด 17](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/user/my-bookings/_components/BookingEditModal.tsx:17) |

### app/user/my-bookings/_components/BookingList.tsx

[app/user/my-bookings/_components/BookingList.tsx](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/user/my-bookings/_components/BookingList.tsx)

ส่วนแสดงผลของ feature รับข้อมูลและ callback ผ่าน props; หน้าที่เฉพาะและ flow อยู่บท 2 ส่วน 9

นำเข้าไฟล์ในโครงการ: [lib/format.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/lib/format.ts), [app/user/my-bookings/types.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/user/my-bookings/types.ts) (type-only), [app/user/my-bookings/utils.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/user/my-bookings/utils.ts)

นำเข้า package/module: `lucide-react`

ผู้นำเข้าโดยตรง: [app/user/my-bookings/page.tsx](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/user/my-bookings/page.tsx)

Props ที่ประกาศ: `filteredBookings`, `loading`, `bookings`, `openDetailModal`, `canManageOwnBookings`, `openEditModal`, `cancelBooking`, `openMileageModal`

| ชื่อ | ประเภท | เปิดโค้ด |
|---|---|---|
| `BookingListProps` | ชนิดข้อมูล | [บรรทัด 6](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/user/my-bookings/_components/BookingList.tsx:6) |
| `BookingList` | ฟังก์ชัน / component | [บรรทัด 17](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/user/my-bookings/_components/BookingList.tsx:17) |

### app/user/my-bookings/_components/BookingStatusFilters.tsx

[app/user/my-bookings/_components/BookingStatusFilters.tsx](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/user/my-bookings/_components/BookingStatusFilters.tsx)

ส่วนแสดงผลของ feature รับข้อมูลและ callback ผ่าน props; หน้าที่เฉพาะและ flow อยู่บท 2 ส่วน 9

นำเข้าไฟล์ในโครงการ: [app/user/my-bookings/types.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/user/my-bookings/types.ts) (type-only), [app/user/my-bookings/constants.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/user/my-bookings/constants.ts)

นำเข้า package/module: `react`

ผู้นำเข้าโดยตรง: [app/user/my-bookings/page.tsx](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/user/my-bookings/page.tsx)

Props ที่ประกาศ: `stats`, `selectedStatus`, `setSelectedStatus`

| ชื่อ | ประเภท | เปิดโค้ด |
|---|---|---|
| `BookingStatusFiltersProps` | ชนิดข้อมูล | [บรรทัด 5](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/user/my-bookings/_components/BookingStatusFilters.tsx:5) |
| `BookingStatusFilters` | ฟังก์ชัน / component | [บรรทัด 11](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/user/my-bookings/_components/BookingStatusFilters.tsx:11) |

### app/user/my-bookings/_components/MileageModal.tsx

[app/user/my-bookings/_components/MileageModal.tsx](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/user/my-bookings/_components/MileageModal.tsx)

ส่วนแสดงผลของ feature รับข้อมูลและ callback ผ่าน props; หน้าที่เฉพาะและ flow อยู่บท 2 ส่วน 9

นำเข้าไฟล์ในโครงการ: [app/user/my-bookings/_components/ModalHeader.tsx](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/user/my-bookings/_components/ModalHeader.tsx)

นำเข้า package/module: `react`

ผู้นำเข้าโดยตรง: [app/user/my-bookings/page.tsx](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/user/my-bookings/page.tsx)

Props ที่ประกาศ: `id`, `title`, `description`, `label`, `value`, `min`, `loading`, `loadingLabel`, `submitLabel`, `tone`, `onChange`, `onClose`, `onSubmit`

| ชื่อ | ประเภท | เปิดโค้ด |
|---|---|---|
| `MileageModal` | ฟังก์ชัน / component | [บรรทัด 4](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/user/my-bookings/_components/MileageModal.tsx:4) |

### app/user/my-bookings/_components/ModalActions.tsx

[app/user/my-bookings/_components/ModalActions.tsx](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/user/my-bookings/_components/ModalActions.tsx)

ส่วนแสดงผลของ feature รับข้อมูลและ callback ผ่าน props; หน้าที่เฉพาะและ flow อยู่บท 2 ส่วน 9

นำเข้าไฟล์ในโครงการ: ไม่มี

ผู้นำเข้าโดยตรง: [app/user/my-bookings/_components/BookingEditModal.tsx](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/user/my-bookings/_components/BookingEditModal.tsx)

Props ที่ประกาศ: `loading`, `loadingLabel`, `submitLabel`, `onCancel`

| ชื่อ | ประเภท | เปิดโค้ด |
|---|---|---|
| `ModalActions` | ฟังก์ชัน / component | [บรรทัด 1](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/user/my-bookings/_components/ModalActions.tsx:1) |

### app/user/my-bookings/_components/ModalHeader.tsx

[app/user/my-bookings/_components/ModalHeader.tsx](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/user/my-bookings/_components/ModalHeader.tsx)

ส่วนแสดงผลของ feature รับข้อมูลและ callback ผ่าน props; หน้าที่เฉพาะและ flow อยู่บท 2 ส่วน 9

นำเข้าไฟล์ในโครงการ: ไม่มี

นำเข้า package/module: `lucide-react`

ผู้นำเข้าโดยตรง: [app/user/my-bookings/_components/BookingDetailModal.tsx](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/user/my-bookings/_components/BookingDetailModal.tsx), [app/user/my-bookings/_components/BookingEditModal.tsx](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/user/my-bookings/_components/BookingEditModal.tsx), [app/user/my-bookings/_components/MileageModal.tsx](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/user/my-bookings/_components/MileageModal.tsx)

Props ที่ประกาศ: `id`, `title`, `description`, `onClose`

| ชื่อ | ประเภท | เปิดโค้ด |
|---|---|---|
| `ModalHeader` | ฟังก์ชัน / component | [บรรทัด 3](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/user/my-bookings/_components/ModalHeader.tsx:3) |

### app/user/my-bookings/_components/PrimaryButton.tsx

[app/user/my-bookings/_components/PrimaryButton.tsx](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/user/my-bookings/_components/PrimaryButton.tsx)

ส่วนแสดงผลของ feature รับข้อมูลและ callback ผ่าน props; หน้าที่เฉพาะและ flow อยู่บท 2 ส่วน 9

นำเข้าไฟล์ในโครงการ: ไม่มี

นำเข้า package/module: `react`

ผู้นำเข้าโดยตรง: [app/user/my-bookings/_components/BookingDetailModal.tsx](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/user/my-bookings/_components/BookingDetailModal.tsx)

Props ที่ประกาศ: `children`, `onClick`

| ชื่อ | ประเภท | เปิดโค้ด |
|---|---|---|
| `PrimaryButton` | ฟังก์ชัน / component | [บรรทัด 3](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/user/my-bookings/_components/PrimaryButton.tsx:3) |

### app/user/my-bookings/constants.ts

[app/user/my-bookings/constants.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/user/my-bookings/constants.ts)

ค่าระดับ module เช่นค่าเริ่มต้น ตัวเลือก ป้าย และ metadata ที่ผู้นำเข้าใช้

นำเข้าไฟล์ในโครงการ: [app/user/my-bookings/types.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/user/my-bookings/types.ts) (type-only)

นำเข้า package/module: `lucide-react`

ผู้นำเข้าโดยตรง: [app/user/my-bookings/_components/BookingStatusFilters.tsx](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/user/my-bookings/_components/BookingStatusFilters.tsx), [app/user/my-bookings/page.tsx](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/user/my-bookings/page.tsx), [app/user/my-bookings/utils.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/user/my-bookings/utils.ts)

| ชื่อ | ประเภท | เปิดโค้ด |
|---|---|---|
| `INITIAL_STATS` | ค่าระดับ module | [บรรทัด 4](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/user/my-bookings/constants.ts:4) |
| `INITIAL_EDIT_FORM` | ค่าระดับ module | [บรรทัด 14](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/user/my-bookings/constants.ts:14) |
| `STATUS_FILTERS` | ค่าระดับ module | [บรรทัด 22](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/user/my-bookings/constants.ts:22) |

### app/user/my-bookings/layout.tsx

[app/user/my-bookings/layout.tsx](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/user/my-bookings/layout.tsx)

Next.js layout ห่อหน้าลูก; layout ที่ป้องกันหน้าจะเรียก page-access

นำเข้าไฟล์ในโครงการ: [lib/page-access.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/lib/page-access.ts)

นำเข้า package/module: `react`

ผู้นำเข้าโดยตรง: ไม่พบในชุดที่ทำดัชนี; page/layout/route และ config/script อาจถูก framework หรือคำสั่งเรียก

| ชื่อ | ประเภท | เปิดโค้ด |
|---|---|---|
| `MyBookingsLayout` | ฟังก์ชัน / component | [บรรทัด 4](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/user/my-bookings/layout.tsx:4) |

### app/user/my-bookings/page.tsx

[app/user/my-bookings/page.tsx](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/user/my-bookings/page.tsx)

หน้า URL ตามโฟลเดอร์; ประกอบ state/effects/handlers และ UI

นำเข้าไฟล์ในโครงการ: [lib/api.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/lib/api.ts), [lib/use-permissions.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/lib/use-permissions.ts), [app/user/my-bookings/types.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/user/my-bookings/types.ts) (type-only), [app/user/my-bookings/constants.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/user/my-bookings/constants.ts), [app/user/my-bookings/utils.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/user/my-bookings/utils.ts), [app/user/my-bookings/_components/MileageModal.tsx](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/user/my-bookings/_components/MileageModal.tsx), [app/user/my-bookings/_components/BookingStatusFilters.tsx](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/user/my-bookings/_components/BookingStatusFilters.tsx), [app/user/my-bookings/_components/BookingList.tsx](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/user/my-bookings/_components/BookingList.tsx), [app/user/my-bookings/_components/BookingDetailModal.tsx](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/user/my-bookings/_components/BookingDetailModal.tsx), [app/user/my-bookings/_components/BookingEditModal.tsx](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/user/my-bookings/_components/BookingEditModal.tsx)

นำเข้า package/module: `react`, `lucide-react`

ผู้นำเข้าโดยตรง: ไม่พบในชุดที่ทำดัชนี; page/layout/route และ config/script อาจถูก framework หรือคำสั่งเรียก

API URL ที่อ้างเป็นข้อความ: `/api/booking?action=my-bookings`, `/api/booking`, `/api/booking/pickup`, `/api/booking/return`

| ชื่อ | ประเภท | เปิดโค้ด |
|---|---|---|
| `MyBookingsPage` | ฟังก์ชัน / component | [บรรทัด 17](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/user/my-bookings/page.tsx:17) |
| `closeModal` | memo / callback | [บรรทัด 31](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/user/my-bookings/page.tsx:31) |
| `fetchBookings` | memo / callback | [บรรทัด 38](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/user/my-bookings/page.tsx:38) |
| `cancelBooking` | ฟังก์ชัน / callback | [บรรทัด 52](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/user/my-bookings/page.tsx:52) |
| `openDetailModal` | ฟังก์ชัน / callback | [บรรทัด 72](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/user/my-bookings/page.tsx:72) |
| `openEditModal` | ฟังก์ชัน / callback | [บรรทัด 77](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/user/my-bookings/page.tsx:77) |
| `openMileageModal` | ฟังก์ชัน / callback | [บรรทัด 91](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/user/my-bookings/page.tsx:91) |
| `handleEditSubmit` | ฟังก์ชัน / callback | [บรรทัด 99](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/user/my-bookings/page.tsx:99) |
| `handlePickup` | ฟังก์ชัน / callback | [บรรทัด 117](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/user/my-bookings/page.tsx:117) |
| `handleReturn` | ฟังก์ชัน / callback | [บรรทัด 139](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/user/my-bookings/page.tsx:139) |
| `filteredBookings` | memo / callback | [บรรทัด 161](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/user/my-bookings/page.tsx:161) |
| `minEditEndDateTime` | memo / callback | [บรรทัด 166](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/user/my-bookings/page.tsx:166) |
| `handleKeyDown` | ฟังก์ชัน / callback | [บรรทัด 180](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/user/my-bookings/page.tsx:180) |

### app/user/my-bookings/types.ts

[app/user/my-bookings/types.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/user/my-bookings/types.ts)

ชนิดข้อมูลของ module: ช่วยตรวจโครงสร้างขณะพัฒนา ไม่ใช่ runtime validation หรือการสร้างตาราง

นำเข้าไฟล์ในโครงการ: ไม่มี

ผู้นำเข้าโดยตรง: [app/user/my-bookings/_components/BookingDetailModal.tsx](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/user/my-bookings/_components/BookingDetailModal.tsx), [app/user/my-bookings/_components/BookingDetailPanel.tsx](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/user/my-bookings/_components/BookingDetailPanel.tsx), [app/user/my-bookings/_components/BookingEditModal.tsx](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/user/my-bookings/_components/BookingEditModal.tsx), [app/user/my-bookings/_components/BookingList.tsx](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/user/my-bookings/_components/BookingList.tsx), [app/user/my-bookings/_components/BookingStatusFilters.tsx](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/user/my-bookings/_components/BookingStatusFilters.tsx), [app/user/my-bookings/constants.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/user/my-bookings/constants.ts), [app/user/my-bookings/page.tsx](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/user/my-bookings/page.tsx), [app/user/my-bookings/utils.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/user/my-bookings/utils.ts)

| ชื่อ | ประเภท | เปิดโค้ด |
|---|---|---|
| `Booking` | ชนิดข้อมูล | [บรรทัด 1](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/user/my-bookings/types.ts:1) |
| `BookingStats` | ชนิดข้อมูล | [บรรทัด 22](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/user/my-bookings/types.ts:22) |
| `EditForm` | ชนิดข้อมูล | [บรรทัด 32](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/user/my-bookings/types.ts:32) |
| `ModalType` | ชนิดข้อมูล | [บรรทัด 40](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/user/my-bookings/types.ts:40) |

### app/user/my-bookings/utils.ts

[app/user/my-bookings/utils.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/user/my-bookings/utils.ts)

ฟังก์ชันช่วยของ feature; ดูผู้นำเข้าเพื่อแยกว่า page หรือ component เรียก

นำเข้าไฟล์ในโครงการ: [app/user/my-bookings/types.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/user/my-bookings/types.ts) (type-only), [app/user/my-bookings/constants.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/user/my-bookings/constants.ts)

นำเข้า package/module: `axios`

ผู้นำเข้าโดยตรง: [app/user/my-bookings/_components/BookingDetailPanel.tsx](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/user/my-bookings/_components/BookingDetailPanel.tsx), [app/user/my-bookings/_components/BookingEditModal.tsx](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/user/my-bookings/_components/BookingEditModal.tsx), [app/user/my-bookings/_components/BookingList.tsx](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/user/my-bookings/_components/BookingList.tsx), [app/user/my-bookings/page.tsx](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/user/my-bookings/page.tsx)

| ชื่อ | ประเภท | เปิดโค้ด |
|---|---|---|
| `getErrorMessage` | ฟังก์ชัน / component | [บรรทัด 5](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/user/my-bookings/utils.ts:5) |
| `toLocalDateTimeInputValue` | ฟังก์ชัน / component | [บรรทัด 10](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/user/my-bookings/utils.ts:10) |
| `getLocalDateTimeInputValue` | ฟังก์ชัน / component | [บรรทัด 16](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/user/my-bookings/utils.ts:16) |
| `buildStats` | ฟังก์ชัน / component | [บรรทัด 22](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/user/my-bookings/utils.ts:22) |
| `getDistance` | ฟังก์ชัน / component | [บรรทัด 35](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/user/my-bookings/utils.ts:35) |

### app/user/page.tsx

[app/user/page.tsx](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/user/page.tsx)

หน้า URL ตามโฟลเดอร์; ประกอบ state/effects/handlers และ UI

นำเข้าไฟล์ในโครงการ: [lib/api.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/lib/api.ts), [app/component/role-dashboard.tsx](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/component/role-dashboard.tsx)

นำเข้า package/module: `lucide-react`, `react`

ผู้นำเข้าโดยตรง: ไม่พบในชุดที่ทำดัชนี; page/layout/route และ config/script อาจถูก framework หรือคำสั่งเรียก

API URL ที่อ้างเป็นข้อความ: `/api/auth/me`

| ชื่อ | ประเภท | เปิดโค้ด |
|---|---|---|
| `UserPage` | ฟังก์ชัน / component | [บรรทัด 11](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/user/page.tsx:11) |
| `fetchMe` | ฟังก์ชัน / callback | [บรรทัด 16](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/user/page.tsx:16) |

### app/utils.ts

[app/utils.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/utils.ts)

ฟังก์ชันช่วยของ feature; ดูผู้นำเข้าเพื่อแยกว่า page หรือ component เรียก

นำเข้าไฟล์ในโครงการ: ไม่มี

นำเข้า package/module: `axios`

ผู้นำเข้าโดยตรง: [app/page.tsx](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/page.tsx)

| ชื่อ | ประเภท | เปิดโค้ด |
|---|---|---|
| `getLoginErrorMessage` | ฟังก์ชัน / component | [บรรทัด 3](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/utils.ts:3) |

### eslint.config.mjs

[eslint.config.mjs](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/eslint.config.mjs)

เปิดชื่อฟังก์ชันและแผนที่ import ด้านล่างประกอบคำอธิบายโมดูลในบท 1–4

นำเข้าไฟล์ในโครงการ: ไม่มี

นำเข้า package/module: `eslint/config`, `eslint-config-next/core-web-vitals`, `eslint-config-next/typescript`

ผู้นำเข้าโดยตรง: ไม่พบในชุดที่ทำดัชนี; page/layout/route และ config/script อาจถูก framework หรือคำสั่งเรียก

| ชื่อ | ประเภท | เปิดโค้ด |
|---|---|---|
| `eslintConfig` | ค่าระดับ module | [บรรทัด 5](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/eslint.config.mjs:5) |

### global.d.ts

[global.d.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/global.d.ts)

ประกาศ module *.css ให้ TypeScript รู้จัก side-effect imports

นำเข้าไฟล์ในโครงการ: ไม่มี

ผู้นำเข้าโดยตรง: ไม่พบในชุดที่ทำดัชนี; page/layout/route และ config/script อาจถูก framework หรือคำสั่งเรียก


### lib/__mocks__/prisma.ts

[lib/__mocks__/prisma.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/lib/__mocks__/prisma.ts)

เปิดชื่อฟังก์ชันและแผนที่ import ด้านล่างประกอบคำอธิบายโมดูลในบท 1–4

นำเข้าไฟล์ในโครงการ: [app/generated/prisma/client.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/generated/prisma/client.ts)

นำเข้า package/module: `vitest-mock-extended`, `vitest`

ผู้นำเข้าโดยตรง: ไม่พบในชุดที่ทำดัชนี; page/layout/route และ config/script อาจถูก framework หรือคำสั่งเรียก

| ชื่อ | ประเภท | เปิดโค้ด |
|---|---|---|
| `prismaMock` | ค่าระดับ module | [บรรทัด 5](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/lib/__mocks__/prisma.ts:5) |

### lib/ai/vehicle-usage-summary/generate.ts

[lib/ai/vehicle-usage-summary/generate.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/lib/ai/vehicle-usage-summary/generate.ts)

กระบวนการสรุป AI: ดูรายละเอียด payload/provider/schema/cache ในบท 4

นำเข้าไฟล์ในโครงการ: [lib/vehicle-usage-analysis/index.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/lib/vehicle-usage-analysis/index.ts) (type-only), [lib/ai/vehicle-usage-summary/payload.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/lib/ai/vehicle-usage-summary/payload.ts), [lib/ai/vehicle-usage-summary/prompt.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/lib/ai/vehicle-usage-summary/prompt.ts), [lib/ai/vehicle-usage-summary/schema.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/lib/ai/vehicle-usage-summary/schema.ts), [lib/ai/vehicle-usage-summary/validate.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/lib/ai/vehicle-usage-summary/validate.ts)

นำเข้า package/module: `openai`, `openai/helpers/zod`

ผู้นำเข้าโดยตรง: [lib/ai/vehicle-usage-summary/index.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/lib/ai/vehicle-usage-summary/index.ts)

| ชื่อ | ประเภท | เปิดโค้ด |
|---|---|---|
| `AiSummaryUnavailableError` | class | [บรรทัด 12](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/lib/ai/vehicle-usage-summary/generate.ts:12) |
| `AiGenerationMetadata` | ชนิดข้อมูล | [บรรทัด 22](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/lib/ai/vehicle-usage-summary/generate.ts:22) |
| `client` | ค่าระดับ module | [บรรทัด 30](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/lib/ai/vehicle-usage-summary/generate.ts:30) |
| `getOpenAiClient` | ฟังก์ชัน / component | [บรรทัด 32](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/lib/ai/vehicle-usage-summary/generate.ts:32) |
| `getStatus` | ฟังก์ชัน / component | [บรรทัด 43](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/lib/ai/vehicle-usage-summary/generate.ts:43) |
| `generateVehicleUsageSummary` | ฟังก์ชัน / component | [บรรทัด 47](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/lib/ai/vehicle-usage-summary/generate.ts:47) |

### lib/ai/vehicle-usage-summary/index.ts

[lib/ai/vehicle-usage-summary/index.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/lib/ai/vehicle-usage-summary/index.ts)

กระบวนการสรุป AI: ดูรายละเอียด payload/provider/schema/cache ในบท 4

นำเข้าไฟล์ในโครงการ: [lib/ai/vehicle-usage-summary/generate.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/lib/ai/vehicle-usage-summary/generate.ts), [lib/ai/vehicle-usage-summary/payload.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/lib/ai/vehicle-usage-summary/payload.ts), [lib/ai/vehicle-usage-summary/schema.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/lib/ai/vehicle-usage-summary/schema.ts)

ผู้นำเข้าโดยตรง: [app/api/admin/vehicles/history/analysis/__tests__/route.test.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/api/admin/vehicles/history/analysis/__tests__/route.test.ts), [app/api/admin/vehicles/history/analysis/route.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/api/admin/vehicles/history/analysis/route.ts)


### lib/ai/vehicle-usage-summary/payload.ts

[lib/ai/vehicle-usage-summary/payload.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/lib/ai/vehicle-usage-summary/payload.ts)

กระบวนการสรุป AI: ดูรายละเอียด payload/provider/schema/cache ในบท 4

นำเข้าไฟล์ในโครงการ: [lib/vehicle-usage-analysis/index.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/lib/vehicle-usage-analysis/index.ts) (type-only), [lib/ai/vehicle-usage-summary/schema.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/lib/ai/vehicle-usage-summary/schema.ts) (type-only)

นำเข้า package/module: `node:crypto`

ผู้นำเข้าโดยตรง: [lib/ai/vehicle-usage-summary/__tests__/payload.test.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/lib/ai/vehicle-usage-summary/__tests__/payload.test.ts), [lib/ai/vehicle-usage-summary/generate.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/lib/ai/vehicle-usage-summary/generate.ts), [lib/ai/vehicle-usage-summary/index.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/lib/ai/vehicle-usage-summary/index.ts)

| ชื่อ | ประเภท | เปิดโค้ด |
|---|---|---|
| `WEEKDAY_LABELS` | ค่าระดับ module | [บรรทัด 5](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/lib/ai/vehicle-usage-summary/payload.ts:5) |
| `addEvidence` | ฟังก์ชัน / component | [บรรทัด 15](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/lib/ai/vehicle-usage-summary/payload.ts:15) |
| `buildVehicleUsageAiPayload` | ฟังก์ชัน / component | [บรรทัด 26](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/lib/ai/vehicle-usage-summary/payload.ts:26) |

### lib/ai/vehicle-usage-summary/prompt.ts

[lib/ai/vehicle-usage-summary/prompt.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/lib/ai/vehicle-usage-summary/prompt.ts)

กระบวนการสรุป AI: ดูรายละเอียด payload/provider/schema/cache ในบท 4

นำเข้าไฟล์ในโครงการ: ไม่มี

ผู้นำเข้าโดยตรง: [lib/ai/vehicle-usage-summary/generate.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/lib/ai/vehicle-usage-summary/generate.ts)

| ชื่อ | ประเภท | เปิดโค้ด |
|---|---|---|
| `VEHICLE_USAGE_SUMMARY_INSTRUCTIONS` | ค่าระดับ module | [บรรทัด 1](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/lib/ai/vehicle-usage-summary/prompt.ts:1) |

### lib/ai/vehicle-usage-summary/schema.ts

[lib/ai/vehicle-usage-summary/schema.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/lib/ai/vehicle-usage-summary/schema.ts)

กระบวนการสรุป AI: ดูรายละเอียด payload/provider/schema/cache ในบท 4

นำเข้าไฟล์ในโครงการ: ไม่มี

นำเข้า package/module: `zod`

ผู้นำเข้าโดยตรง: [app/admin/vehicle-history/AiUsageSummaryCard.tsx](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/admin/vehicle-history/AiUsageSummaryCard.tsx), [lib/ai/vehicle-usage-summary/__tests__/validate.test.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/lib/ai/vehicle-usage-summary/__tests__/validate.test.ts), [lib/ai/vehicle-usage-summary/generate.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/lib/ai/vehicle-usage-summary/generate.ts), [lib/ai/vehicle-usage-summary/index.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/lib/ai/vehicle-usage-summary/index.ts), [lib/ai/vehicle-usage-summary/payload.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/lib/ai/vehicle-usage-summary/payload.ts), [lib/ai/vehicle-usage-summary/validate.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/lib/ai/vehicle-usage-summary/validate.ts)

| ชื่อ | ประเภท | เปิดโค้ด |
|---|---|---|
| `EvidenceInsightSchema` | ค่าระดับ module | [บรรทัด 3](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/lib/ai/vehicle-usage-summary/schema.ts:3) |
| `UserUsageInsightSchema` | ค่าระดับ module | [บรรทัด 8](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/lib/ai/vehicle-usage-summary/schema.ts:8) |
| `RecommendationSchema` | ค่าระดับ module | [บรรทัด 14](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/lib/ai/vehicle-usage-summary/schema.ts:14) |
| `VehicleUsageSummarySchema` | ค่าระดับ module | [บรรทัด 20](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/lib/ai/vehicle-usage-summary/schema.ts:20) |
| `VehicleUsageSummary` | ชนิดข้อมูล | [บรรทัด 29](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/lib/ai/vehicle-usage-summary/schema.ts:29) |
| `EvidenceValue` | ชนิดข้อมูล | [บรรทัด 31](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/lib/ai/vehicle-usage-summary/schema.ts:31) |
| `VehicleUsageSummaryResponse` | ชนิดข้อมูล | [บรรทัด 38](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/lib/ai/vehicle-usage-summary/schema.ts:38) |

### lib/ai/vehicle-usage-summary/validate.ts

[lib/ai/vehicle-usage-summary/validate.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/lib/ai/vehicle-usage-summary/validate.ts)

กระบวนการสรุป AI: ดูรายละเอียด payload/provider/schema/cache ในบท 4

นำเข้าไฟล์ในโครงการ: [lib/ai/vehicle-usage-summary/schema.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/lib/ai/vehicle-usage-summary/schema.ts) (type-only)

ผู้นำเข้าโดยตรง: [lib/ai/vehicle-usage-summary/__tests__/validate.test.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/lib/ai/vehicle-usage-summary/__tests__/validate.test.ts), [lib/ai/vehicle-usage-summary/generate.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/lib/ai/vehicle-usage-summary/generate.ts)

| ชื่อ | ประเภท | เปิดโค้ด |
|---|---|---|
| `unsafePatterns` | ค่าระดับ module | [บรรทัด 3](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/lib/ai/vehicle-usage-summary/validate.ts:3) |
| `InvalidAiSummaryError` | class | [บรรทัด 9](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/lib/ai/vehicle-usage-summary/validate.ts:9) |
| `validateAiSummary` | ฟังก์ชัน / component | [บรรทัด 11](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/lib/ai/vehicle-usage-summary/validate.ts:11) |

### lib/api.ts

[lib/api.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/lib/api.ts)

เปิดชื่อฟังก์ชันและแผนที่ import ด้านล่างประกอบคำอธิบายโมดูลในบท 1–4

นำเข้าไฟล์ในโครงการ: ไม่มี

นำเข้า package/module: `axios`

ผู้นำเข้าโดยตรง: [app/admin/bookings/page.tsx](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/admin/bookings/page.tsx), [app/admin/maintenance/page.tsx](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/admin/maintenance/page.tsx), [app/admin/page.tsx](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/admin/page.tsx), [app/admin/permissions/page.tsx](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/admin/permissions/page.tsx), [app/admin/users/page.tsx](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/admin/users/page.tsx), [app/admin/vehicle-history/AiUsageSummaryCard.tsx](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/admin/vehicle-history/AiUsageSummaryCard.tsx), [app/admin/vehicle-history/VehicleHistoryDetails.tsx](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/admin/vehicle-history/VehicleHistoryDetails.tsx), [app/admin/vehicle-history/page.tsx](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/admin/vehicle-history/page.tsx), [app/admin/vehicles/page.tsx](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/admin/vehicles/page.tsx), [app/approver/approve/page.tsx](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/approver/approve/page.tsx), [app/approver/history/page.tsx](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/approver/history/page.tsx), [app/approver/page.tsx](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/approver/page.tsx), [app/component/navbar.tsx](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/component/navbar.tsx), [app/page.tsx](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/page.tsx), [app/user/booking/page.tsx](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/user/booking/page.tsx), [app/user/maintenance/page.tsx](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/user/maintenance/page.tsx), [app/user/my-bookings/page.tsx](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/user/my-bookings/page.tsx), [app/user/page.tsx](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/user/page.tsx), [lib/use-permissions.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/lib/use-permissions.ts)

| ชื่อ | ประเภท | เปิดโค้ด |
|---|---|---|
| `api` | ค่าระดับ module | [บรรทัด 3](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/lib/api.ts:3) |

### lib/auth.ts

[lib/auth.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/lib/auth.ts)

เปิดชื่อฟังก์ชันและแผนที่ import ด้านล่างประกอบคำอธิบายโมดูลในบท 1–4

นำเข้าไฟล์ในโครงการ: [lib/prisma.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/lib/prisma.ts)

นำเข้า package/module: `next/server`, `jsonwebtoken`

ผู้นำเข้าโดยตรง: [app/api/auth/me/route.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/api/auth/me/route.ts), [app/api/notifications/__tests__/route.test.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/api/notifications/__tests__/route.test.ts), [app/api/notifications/route.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/api/notifications/route.ts), [lib/__tests__/auth.test.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/lib/__tests__/auth.test.ts), [lib/__tests__/permissions.test.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/lib/__tests__/permissions.test.ts), [lib/page-access.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/lib/page-access.ts), [lib/permissions.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/lib/permissions.ts)

| ชื่อ | ประเภท | เปิดโค้ด |
|---|---|---|
| `JwtPayload` | ชนิดข้อมูล | [บรรทัด 5](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/lib/auth.ts:5) |
| `AuthenticatedUser` | ชนิดข้อมูล | [บรรทัด 10](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/lib/auth.ts:10) |
| `getToken` | ฟังก์ชัน / component | [บรรทัด 15](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/lib/auth.ts:15) |
| `decodeToken` | ฟังก์ชัน / component | [บรรทัด 27](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/lib/auth.ts:27) |
| `decodeTokenValue` | ฟังก์ชัน / component | [บรรทัด 32](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/lib/auth.ts:32) |
| `verifyTokenValue` | ฟังก์ชัน / component | [บรรทัด 38](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/lib/auth.ts:38) |
| `verifyToken` | ฟังก์ชัน / component | [บรรทัด 56](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/lib/auth.ts:56) |
| `verifyAdmin` | ฟังก์ชัน / component | [บรรทัด 61](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/lib/auth.ts:61) |
| `verifyApprover` | ฟังก์ชัน / component | [บรรทัด 68](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/lib/auth.ts:68) |
| `verifyUser` | ฟังก์ชัน / component | [บรรทัด 77](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/lib/auth.ts:77) |
| `isAuthError` | ฟังก์ชัน / component | [บรรทัด 82](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/lib/auth.ts:82) |

### lib/email/bookingNotifications.ts

[lib/email/bookingNotifications.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/lib/email/bookingNotifications.ts)

โมดูลเตรียมและส่งอีเมล; ดูบท 4

นำเข้าไฟล์ในโครงการ: [lib/prisma.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/lib/prisma.ts), [lib/email/service.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/lib/email/service.ts), [lib/email/templates.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/lib/email/templates.ts)

ผู้นำเข้าโดยตรง: [app/api/admin/bookings/change-vehicle/__tests__/route.test.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/api/admin/bookings/change-vehicle/__tests__/route.test.ts), [app/api/admin/bookings/change-vehicle/route.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/api/admin/bookings/change-vehicle/route.ts), [app/api/admin/bookings/pickup/route.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/api/admin/bookings/pickup/route.ts), [app/api/admin/bookings/return/route.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/api/admin/bookings/return/route.ts), [app/api/admin/bookings/route.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/api/admin/bookings/route.ts), [app/api/approver/__tests__/route.test.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/api/approver/__tests__/route.test.ts), [app/api/approver/route.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/api/approver/route.ts), [app/api/booking/__tests__/route.test.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/api/booking/__tests__/route.test.ts), [app/api/booking/pickup/route.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/api/booking/pickup/route.ts), [app/api/booking/return/route.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/api/booking/return/route.ts), [app/api/booking/route.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/api/booking/route.ts)

| ชื่อ | ประเภท | เปิดโค้ด |
|---|---|---|
| `NotifyBookingEventInput` | ชนิดข้อมูล | [บรรทัด 10](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/lib/email/bookingNotifications.ts:10) |
| `getBookingEventMessage` | ฟังก์ชัน / component | [บรรทัด 17](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/lib/email/bookingNotifications.ts:17) |
| `notifyBookingEvent` | ฟังก์ชัน / component | [บรรทัด 42](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/lib/email/bookingNotifications.ts:42) |
| `sendBookingEventEmail` | ฟังก์ชัน / component | [บรรทัด 60](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/lib/email/bookingNotifications.ts:60) |

### lib/email/maintenanceNotifications.ts

[lib/email/maintenanceNotifications.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/lib/email/maintenanceNotifications.ts)

โมดูลเตรียมและส่งอีเมล; ดูบท 4

นำเข้าไฟล์ในโครงการ: [lib/email/service.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/lib/email/service.ts)

ผู้นำเข้าโดยตรง: [app/api/user/maintenance/__tests__/route.test.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/api/user/maintenance/__tests__/route.test.ts), [app/api/user/maintenance/route.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/api/user/maintenance/route.ts), [lib/email/__tests__/maintenanceNotifications.test.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/lib/email/__tests__/maintenanceNotifications.test.ts)

| ชื่อ | ประเภท | เปิดโค้ด |
|---|---|---|
| `MaintenanceReportEmailData` | ชนิดข้อมูล | [บรรทัด 3](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/lib/email/maintenanceNotifications.ts:3) |
| `AdminEmailRecipient` | ชนิดข้อมูล | [บรรทัด 19](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/lib/email/maintenanceNotifications.ts:19) |
| `escapeHtml` | ฟังก์ชัน / component | [บรรทัด 24](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/lib/email/maintenanceNotifications.ts:24) |
| `formatDateTime` | ฟังก์ชัน / component | [บรรทัด 33](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/lib/email/maintenanceNotifications.ts:33) |
| `buildMaintenanceReportEmail` | ฟังก์ชัน / component | [บรรทัด 43](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/lib/email/maintenanceNotifications.ts:43) |
| `emailAdminsAboutMaintenanceReport` | ฟังก์ชัน / component | [บรรทัด 94](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/lib/email/maintenanceNotifications.ts:94) |

### lib/email/service.ts

[lib/email/service.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/lib/email/service.ts)

โมดูลเตรียมและส่งอีเมล; ดูบท 4

นำเข้าไฟล์ในโครงการ: ไม่มี

นำเข้า package/module: `nodemailer`

ผู้นำเข้าโดยตรง: [lib/email/__tests__/maintenanceNotifications.test.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/lib/email/__tests__/maintenanceNotifications.test.ts), [lib/email/__tests__/service.test.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/lib/email/__tests__/service.test.ts), [lib/email/bookingNotifications.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/lib/email/bookingNotifications.ts), [lib/email/maintenanceNotifications.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/lib/email/maintenanceNotifications.ts)

| ชื่อ | ประเภท | เปิดโค้ด |
|---|---|---|
| `EmailPayload` | ชนิดข้อมูล | [บรรทัด 3](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/lib/email/service.ts:3) |
| `SmtpConfig` | ชนิดข้อมูล | [บรรทัด 10](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/lib/email/service.ts:10) |
| `transporter` | ค่าระดับ module | [บรรทัด 21](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/lib/email/service.ts:21) |
| `isEmailEnabled` | ฟังก์ชัน / component | [บรรทัด 23](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/lib/email/service.ts:23) |
| `getSmtpConfig` | ฟังก์ชัน / component | [บรรทัด 27](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/lib/email/service.ts:27) |
| `getTransporter` | ฟังก์ชัน / component | [บรรทัด 47](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/lib/email/service.ts:47) |
| `sendEmail` | ฟังก์ชัน / component | [บรรทัด 60](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/lib/email/service.ts:60) |

### lib/email/templates.ts

[lib/email/templates.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/lib/email/templates.ts)

โมดูลเตรียมและส่งอีเมล; ดูบท 4

นำเข้าไฟล์ในโครงการ: ไม่มี

ผู้นำเข้าโดยตรง: [app/api/admin/bookings/route.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/api/admin/bookings/route.ts), [lib/email/__tests__/templates.test.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/lib/email/__tests__/templates.test.ts), [lib/email/bookingNotifications.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/lib/email/bookingNotifications.ts)

| ชื่อ | ประเภท | เปิดโค้ด |
|---|---|---|
| `BookingEmailEvent` | ชนิดข้อมูล | [บรรทัด 1](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/lib/email/templates.ts:1) |
| `BookingEmailData` | ชนิดข้อมูล | [บรรทัด 9](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/lib/email/templates.ts:9) |
| `BookingEmailOptions` | ชนิดข้อมูล | [บรรทัด 33](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/lib/email/templates.ts:33) |
| `BookingEmailTemplate` | ชนิดข้อมูล | [บรรทัด 40](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/lib/email/templates.ts:40) |
| `eventTitles` | ค่าระดับ module | [บรรทัด 46](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/lib/email/templates.ts:46) |
| `escapeHtml` | ฟังก์ชัน / component | [บรรทัด 55](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/lib/email/templates.ts:55) |
| `formatDateTime` | ฟังก์ชัน / component | [บรรทัด 64](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/lib/email/templates.ts:64) |
| `getVehicleName` | ฟังก์ชัน / component | [บรรทัด 76](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/lib/email/templates.ts:76) |
| `getActionDetail` | ฟังก์ชัน / component | [บรรทัด 83](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/lib/email/templates.ts:83) |
| `buildBookingEmail` | ฟังก์ชัน / component | [บรรทัด 108](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/lib/email/templates.ts:108) |

### lib/format.ts

[lib/format.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/lib/format.ts)

เปิดชื่อฟังก์ชันและแผนที่ import ด้านล่างประกอบคำอธิบายโมดูลในบท 1–4

นำเข้าไฟล์ในโครงการ: ไม่มี

ผู้นำเข้าโดยตรง: [app/admin/bookings/_components/BookingStatusModal.tsx](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/admin/bookings/_components/BookingStatusModal.tsx), [app/admin/bookings/_components/BookingTable.tsx](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/admin/bookings/_components/BookingTable.tsx), [app/admin/bookings/_components/ChangeVehicleModal.tsx](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/admin/bookings/_components/ChangeVehicleModal.tsx), [app/admin/bookings/page.tsx](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/admin/bookings/page.tsx), [app/admin/maintenance/_components/MaintenanceTable.tsx](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/admin/maintenance/_components/MaintenanceTable.tsx), [app/admin/maintenance/page.tsx](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/admin/maintenance/page.tsx), [app/admin/users/_components/UsersTable.tsx](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/admin/users/_components/UsersTable.tsx), [app/admin/vehicle-history/AiUsageSummaryCard.tsx](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/admin/vehicle-history/AiUsageSummaryCard.tsx), [app/admin/vehicle-history/VehicleHistoryDetails.tsx](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/admin/vehicle-history/VehicleHistoryDetails.tsx), [app/admin/vehicle-history/_components/HistoryTable.tsx](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/admin/vehicle-history/_components/HistoryTable.tsx), [app/admin/vehicles/_components/VehicleTable.tsx](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/admin/vehicles/_components/VehicleTable.tsx), [app/approver/approve/_components/ApprovalModal.tsx](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/approver/approve/_components/ApprovalModal.tsx), [app/approver/approve/_components/ApprovalTable.tsx](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/approver/approve/_components/ApprovalTable.tsx), [app/approver/history/_components/BookingDetailModal.tsx](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/approver/history/_components/BookingDetailModal.tsx), [app/approver/history/_components/HistoryTable.tsx](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/approver/history/_components/HistoryTable.tsx), [app/component/navbar.tsx](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/component/navbar.tsx), [app/user/booking/_components/BookingFormModal.tsx](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/user/booking/_components/BookingFormModal.tsx), [app/user/maintenance/_components/MaintenanceTable.tsx](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/user/maintenance/_components/MaintenanceTable.tsx), [app/user/my-bookings/_components/BookingDetailPanel.tsx](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/user/my-bookings/_components/BookingDetailPanel.tsx), [app/user/my-bookings/_components/BookingList.tsx](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/user/my-bookings/_components/BookingList.tsx)

| ชื่อ | ประเภท | เปิดโค้ด |
|---|---|---|
| `getBookingStatusColor` | ฟังก์ชัน / component | [บรรทัด 4](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/lib/format.ts:4) |
| `getBookingStatusText` | ฟังก์ชัน / component | [บรรทัด 18](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/lib/format.ts:18) |
| `getVehicleStatusColor` | ฟังก์ชัน / component | [บรรทัด 34](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/lib/format.ts:34) |
| `getVehicleStatusText` | ฟังก์ชัน / component | [บรรทัด 45](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/lib/format.ts:45) |
| `getMaintenanceStatusColor` | ฟังก์ชัน / component | [บรรทัด 58](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/lib/format.ts:58) |
| `getMaintenanceStatusText` | ฟังก์ชัน / component | [บรรทัด 68](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/lib/format.ts:68) |
| `formatDateTime` | ฟังก์ชัน / component | [บรรทัด 80](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/lib/format.ts:80) |
| `formatDate` | ฟังก์ชัน / component | [บรรทัด 91](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/lib/format.ts:91) |
| `formatDateTimeLong` | ฟังก์ชัน / component | [บรรทัด 100](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/lib/format.ts:100) |
| `getRoleColor` | ฟังก์ชัน / component | [บรรทัด 113](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/lib/format.ts:113) |
| `getRoleDisplayName` | ฟังก์ชัน / component | [บรรทัด 127](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/lib/format.ts:127) |

### lib/page-access.ts

[lib/page-access.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/lib/page-access.ts)

เปิดชื่อฟังก์ชันและแผนที่ import ด้านล่างประกอบคำอธิบายโมดูลในบท 1–4

นำเข้าไฟล์ในโครงการ: [lib/auth.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/lib/auth.ts), [lib/permissions.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/lib/permissions.ts)

นำเข้า package/module: `server-only`, `react`, `next/headers`, `next/navigation`

ผู้นำเข้าโดยตรง: [app/admin/bookings/layout.tsx](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/admin/bookings/layout.tsx), [app/admin/layout.tsx](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/admin/layout.tsx), [app/admin/maintenance/layout.tsx](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/admin/maintenance/layout.tsx), [app/admin/permissions/layout.tsx](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/admin/permissions/layout.tsx), [app/admin/users/layout.tsx](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/admin/users/layout.tsx), [app/admin/vehicle-history/layout.tsx](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/admin/vehicle-history/layout.tsx), [app/admin/vehicles/layout.tsx](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/admin/vehicles/layout.tsx), [app/approver/approve/layout.tsx](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/approver/approve/layout.tsx), [app/approver/history/layout.tsx](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/approver/history/layout.tsx), [app/approver/layout.tsx](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/approver/layout.tsx), [app/user/booking/layout.tsx](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/user/booking/layout.tsx), [app/user/layout.tsx](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/user/layout.tsx), [app/user/maintenance/layout.tsx](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/user/maintenance/layout.tsx), [app/user/my-bookings/layout.tsx](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/user/my-bookings/layout.tsx)

| ชื่อ | ประเภท | เปิดโค้ด |
|---|---|---|
| `getPageActor` | ค่าระดับ module | [บรรทัด 13](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/lib/page-access.ts:13) |
| `requirePageAccess` | ฟังก์ชัน / component | [บรรทัด 15](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/lib/page-access.ts:15) |

### lib/permissions.ts

[lib/permissions.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/lib/permissions.ts)

เปิดชื่อฟังก์ชันและแผนที่ import ด้านล่างประกอบคำอธิบายโมดูลในบท 1–4

นำเข้าไฟล์ในโครงการ: [lib/prisma.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/lib/prisma.ts), [lib/auth.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/lib/auth.ts)

นำเข้า package/module: `next/server`

ผู้นำเข้าโดยตรง: [app/api/admin/bookings/__tests__/route.test.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/api/admin/bookings/__tests__/route.test.ts), [app/api/admin/bookings/change-vehicle/__tests__/route.test.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/api/admin/bookings/change-vehicle/__tests__/route.test.ts), [app/api/admin/bookings/change-vehicle/route.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/api/admin/bookings/change-vehicle/route.ts), [app/api/admin/bookings/pickup/route.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/api/admin/bookings/pickup/route.ts), [app/api/admin/bookings/return/route.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/api/admin/bookings/return/route.ts), [app/api/admin/bookings/route.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/api/admin/bookings/route.ts), [app/api/admin/maintenance/__tests__/route.test.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/api/admin/maintenance/__tests__/route.test.ts), [app/api/admin/maintenance/route.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/api/admin/maintenance/route.ts), [app/api/admin/permissions/__tests__/route.test.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/api/admin/permissions/__tests__/route.test.ts), [app/api/admin/permissions/route.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/api/admin/permissions/route.ts), [app/api/admin/vehicles/history/analysis/__tests__/route.test.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/api/admin/vehicles/history/analysis/__tests__/route.test.ts), [app/api/admin/vehicles/history/analysis/route.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/api/admin/vehicles/history/analysis/route.ts), [app/api/admin/vehicles/history/details/__tests__/route.test.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/api/admin/vehicles/history/details/__tests__/route.test.ts), [app/api/admin/vehicles/history/details/route.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/api/admin/vehicles/history/details/route.ts), [app/api/admin/vehicles/history/route.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/api/admin/vehicles/history/route.ts), [app/api/approver/__tests__/route.test.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/api/approver/__tests__/route.test.ts), [app/api/approver/route.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/api/approver/route.ts), [app/api/booking/__tests__/route.test.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/api/booking/__tests__/route.test.ts), [app/api/booking/pickup/route.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/api/booking/pickup/route.ts), [app/api/booking/return/route.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/api/booking/return/route.ts), [app/api/booking/route.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/api/booking/route.ts), [app/api/user/__tests__/route.test.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/api/user/__tests__/route.test.ts), [app/api/user/maintenance/__tests__/route.test.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/api/user/maintenance/__tests__/route.test.ts), [app/api/user/maintenance/route.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/api/user/maintenance/route.ts), [app/api/user/route.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/api/user/route.ts), [app/api/vehicles/recommend/route.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/api/vehicles/recommend/route.ts), [app/api/verhicle-type/__tests__/route.test.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/api/verhicle-type/__tests__/route.test.ts), [app/api/verhicle-type/route.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/api/verhicle-type/route.ts), [app/api/verhicle/__tests__/route.test.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/api/verhicle/__tests__/route.test.ts), [app/api/verhicle/route.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/api/verhicle/route.ts), [lib/__tests__/permissions.test.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/lib/__tests__/permissions.test.ts), [lib/page-access.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/lib/page-access.ts)

| ชื่อ | ประเภท | เปิดโค้ด |
|---|---|---|
| `Permission` | ชนิดข้อมูล | [บรรทัด 6](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/lib/permissions.ts:6) |
| `AccessPolicy` | ชนิดข้อมูล | [บรรทัด 14](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/lib/permissions.ts:14) |
| `getPermissionsForRole` | ฟังก์ชัน / component | [บรรทัด 23](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/lib/permissions.ts:23) |
| `clearPermissionCache` | ฟังก์ชัน / component | [บรรทัด 35](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/lib/permissions.ts:35) |
| `verifyPermission` | ฟังก์ชัน / component | [บรรทัด 41](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/lib/permissions.ts:41) |
| `assertAccess` | ฟังก์ชัน / component | [บรรทัด 49](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/lib/permissions.ts:49) |
| `requireAccess` | ฟังก์ชัน / component | [บรรทัด 68](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/lib/permissions.ts:68) |
| `hasPermission` | ฟังก์ชัน / component | [บรรทัด 77](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/lib/permissions.ts:77) |
| `isPermissionError` | ฟังก์ชัน / component | [บรรทัด 89](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/lib/permissions.ts:89) |
| `isAuthenticationError` | ฟังก์ชัน / component | [บรรทัด 99](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/lib/permissions.ts:99) |
| `accessErrorResponse` | ฟังก์ชัน / component | [บรรทัด 109](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/lib/permissions.ts:109) |

### lib/prisma.ts

[lib/prisma.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/lib/prisma.ts)

เปิดชื่อฟังก์ชันและแผนที่ import ด้านล่างประกอบคำอธิบายโมดูลในบท 1–4

นำเข้าไฟล์ในโครงการ: [app/generated/prisma/client.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/generated/prisma/client.ts)

นำเข้า package/module: `dotenv/config`, `@prisma/adapter-pg`

ผู้นำเข้าโดยตรง: [app/api/admin/bookings/change-vehicle/route.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/api/admin/bookings/change-vehicle/route.ts), [app/api/admin/bookings/pickup/route.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/api/admin/bookings/pickup/route.ts), [app/api/admin/bookings/return/route.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/api/admin/bookings/return/route.ts), [app/api/admin/bookings/route.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/api/admin/bookings/route.ts), [app/api/admin/maintenance/route.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/api/admin/maintenance/route.ts), [app/api/admin/permissions/route.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/api/admin/permissions/route.ts), [app/api/admin/vehicles/history/analysis/route.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/api/admin/vehicles/history/analysis/route.ts), [app/api/approver/route.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/api/approver/route.ts), [app/api/auth/login/route.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/api/auth/login/route.ts), [app/api/auth/me/route.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/api/auth/me/route.ts), [app/api/booking/pickup/route.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/api/booking/pickup/route.ts), [app/api/booking/return/route.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/api/booking/return/route.ts), [app/api/booking/route.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/api/booking/route.ts), [app/api/notifications/route.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/api/notifications/route.ts), [app/api/user/maintenance/route.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/api/user/maintenance/route.ts), [app/api/user/route.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/api/user/route.ts), [app/api/vehicles/recommend/route.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/api/vehicles/recommend/route.ts), [app/api/verhicle-type/route.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/api/verhicle-type/route.ts), [app/api/verhicle/route.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/api/verhicle/route.ts), [lib/__tests__/permissions.test.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/lib/__tests__/permissions.test.ts), [lib/auth.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/lib/auth.ts), [lib/email/bookingNotifications.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/lib/email/bookingNotifications.ts), [lib/permissions.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/lib/permissions.ts), [lib/syncStatuses.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/lib/syncStatuses.ts), [lib/vehicle-history-details/index.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/lib/vehicle-history-details/index.ts), [lib/vehicle-usage-analysis/calculate.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/lib/vehicle-usage-analysis/calculate.ts)

| ชื่อ | ประเภท | เปิดโค้ด |
|---|---|---|
| `connectionString` | ค่าระดับ module | [บรรทัด 5](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/lib/prisma.ts:5) |
| `globalForPrisma` | ค่าระดับ module | [บรรทัด 7](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/lib/prisma.ts:7) |
| `adapter` | ค่าระดับ module | [บรรทัด 11](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/lib/prisma.ts:11) |
| `prisma` | ค่าระดับ module | [บรรทัด 13](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/lib/prisma.ts:13) |

### lib/syncStatuses.ts

[lib/syncStatuses.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/lib/syncStatuses.ts)

เปิดชื่อฟังก์ชันและแผนที่ import ด้านล่างประกอบคำอธิบายโมดูลในบท 1–4

นำเข้าไฟล์ในโครงการ: [lib/prisma.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/lib/prisma.ts)

ผู้นำเข้าโดยตรง: [app/api/admin/maintenance/route.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/api/admin/maintenance/route.ts), [app/api/booking/__tests__/route.test.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/api/booking/__tests__/route.test.ts), [app/api/booking/route.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/api/booking/route.ts), [app/api/verhicle/route.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/api/verhicle/route.ts)

| ชื่อ | ประเภท | เปิดโค้ด |
|---|---|---|
| `syncAllVehicleStatuses` | ฟังก์ชัน / component | [บรรทัด 11](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/lib/syncStatuses.ts:11) |

### lib/use-permissions.ts

[lib/use-permissions.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/lib/use-permissions.ts)

เปิดชื่อฟังก์ชันและแผนที่ import ด้านล่างประกอบคำอธิบายโมดูลในบท 1–4

นำเข้าไฟล์ในโครงการ: [lib/api.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/lib/api.ts)

นำเข้า package/module: `react`

ผู้นำเข้าโดยตรง: [app/admin/bookings/page.tsx](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/admin/bookings/page.tsx), [app/admin/maintenance/page.tsx](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/admin/maintenance/page.tsx), [app/admin/vehicles/page.tsx](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/admin/vehicles/page.tsx), [app/user/maintenance/page.tsx](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/user/maintenance/page.tsx), [app/user/my-bookings/page.tsx](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/user/my-bookings/page.tsx)

API URL ที่อ้างเป็นข้อความ: `/api/auth/me`

| ชื่อ | ประเภท | เปิดโค้ด |
|---|---|---|
| `usePermissions` | ฟังก์ชัน / component | [บรรทัด 6](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/lib/use-permissions.ts:6) |
| `hasPermission` | memo / callback | [บรรทัด 29](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/lib/use-permissions.ts:29) |

### lib/vehicle-history-details/index.ts

[lib/vehicle-history-details/index.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/lib/vehicle-history-details/index.ts)

เตรียมรายละเอียดประวัติสำหรับ tabs และ pagination; ดูบท 4

นำเข้าไฟล์ในโครงการ: [lib/prisma.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/lib/prisma.ts), [lib/vehicle-usage-analysis/index.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/lib/vehicle-usage-analysis/index.ts)

ผู้นำเข้าโดยตรง: [app/api/admin/vehicles/history/details/__tests__/route.test.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/api/admin/vehicles/history/details/__tests__/route.test.ts), [app/api/admin/vehicles/history/details/route.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/api/admin/vehicles/history/details/route.ts), [lib/vehicle-history-details/__tests__/index.test.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/lib/vehicle-history-details/__tests__/index.test.ts)

| ชื่อ | ประเภท | เปิดโค้ด |
|---|---|---|
| `HistoryDetailsTab` | ชนิดข้อมูล | [บรรทัด 7](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/lib/vehicle-history-details/index.ts:7) |
| `HistoryDetailsFilters` | ชนิดข้อมูล | [บรรทัด 9](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/lib/vehicle-history-details/index.ts:9) |
| `HistoryDetailsInputError` | class | [บรรทัด 18](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/lib/vehicle-history-details/index.ts:18) |
| `BOOKING_SELECT` | ค่าระดับ module | [บรรทัด 20](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/lib/vehicle-history-details/index.ts:20) |
| `getPagination` | ฟังก์ชัน / component | [บรรทัด 41](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/lib/vehicle-history-details/index.ts:41) |
| `serializePeriod` | ฟังก์ชัน / component | [บรรทัด 51](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/lib/vehicle-history-details/index.ts:51) |
| `paginate` | ฟังก์ชัน / component | [บรรทัด 59](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/lib/vehicle-history-details/index.ts:59) |
| `bookingEffectiveDate` | ฟังก์ชัน / component | [บรรทัด 69](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/lib/vehicle-history-details/index.ts:69) |
| `getVehicleHistoryDetails` | ฟังก์ชัน / component | [บรรทัด 80](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/lib/vehicle-history-details/index.ts:80) |

### lib/vehicle-usage-analysis/calculate.ts

[lib/vehicle-usage-analysis/calculate.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/lib/vehicle-usage-analysis/calculate.ts)

คำนวณตัวชี้วัดการใช้รถและช่วงเวลา; ดูสูตรและผู้เรียกในบท 4

นำเข้าไฟล์ในโครงการ: [lib/prisma.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/lib/prisma.ts), [lib/vehicle-usage-analysis/period.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/lib/vehicle-usage-analysis/period.ts), [lib/vehicle-usage-analysis/types.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/lib/vehicle-usage-analysis/types.ts) (type-only)

ผู้นำเข้าโดยตรง: [lib/vehicle-usage-analysis/__tests__/calculate.test.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/lib/vehicle-usage-analysis/__tests__/calculate.test.ts), [lib/vehicle-usage-analysis/index.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/lib/vehicle-usage-analysis/index.ts)

| ชื่อ | ประเภท | เปิดโค้ด |
|---|---|---|
| `DATA_COMPLETENESS_THRESHOLD` | ค่าระดับ module | [บรรทัด 15](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/lib/vehicle-usage-analysis/calculate.ts:15) |
| `BookingRow` | ชนิดข้อมูล | [บรรทัด 17](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/lib/vehicle-usage-analysis/calculate.ts:17) |
| `MaintenanceRow` | ชนิดข้อมูล | [บรรทัด 29](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/lib/vehicle-usage-analysis/calculate.ts:29) |
| `VehicleRow` | ชนิดข้อมูล | [บรรทัด 34](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/lib/vehicle-usage-analysis/calculate.ts:34) |
| `VehicleAggregate` | ชนิดข้อมูล | [บรรทัด 43](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/lib/vehicle-usage-analysis/calculate.ts:43) |
| `round` | ฟังก์ชัน / component | [บรรทัด 54](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/lib/vehicle-usage-analysis/calculate.ts:54) |
| `coverage` | ฟังก์ชัน / component | [บรรทัด 59](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/lib/vehicle-usage-analysis/calculate.ts:59) |
| `percentChange` | ฟังก์ชัน / component | [บรรทัด 63](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/lib/vehicle-usage-analysis/calculate.ts:63) |
| `median` | ฟังก์ชัน / component | [บรรทัด 68](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/lib/vehicle-usage-analysis/calculate.ts:68) |
| `getDistance` | ฟังก์ชัน / component | [บรรทัด 77](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/lib/vehicle-usage-analysis/calculate.ts:77) |
| `aggregateVehicle` | ฟังก์ชัน / component | [บรรทัด 88](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/lib/vehicle-usage-analysis/calculate.ts:88) |
| `breakdownRate` | ฟังก์ชัน / component | [บรรทัด 125](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/lib/vehicle-usage-analysis/calculate.ts:125) |
| `buildPeakUsage` | ฟังก์ชัน / component | [บรรทัด 130](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/lib/vehicle-usage-analysis/calculate.ts:130) |
| `peakEntry` | ฟังก์ชัน / callback | [บรรทัด 143](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/lib/vehicle-usage-analysis/calculate.ts:143) |
| `buildUserMetrics` | ฟังก์ชัน / component | [บรรทัด 158](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/lib/vehicle-usage-analysis/calculate.ts:158) |
| `calculateVehicleUsageAnalysis` | ฟังก์ชัน / component | [บรรทัด 241](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/lib/vehicle-usage-analysis/calculate.ts:241) |

### lib/vehicle-usage-analysis/index.ts

[lib/vehicle-usage-analysis/index.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/lib/vehicle-usage-analysis/index.ts)

คำนวณตัวชี้วัดการใช้รถและช่วงเวลา; ดูสูตรและผู้เรียกในบท 4

นำเข้าไฟล์ในโครงการ: [lib/vehicle-usage-analysis/calculate.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/lib/vehicle-usage-analysis/calculate.ts), [lib/vehicle-usage-analysis/period.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/lib/vehicle-usage-analysis/period.ts), [lib/vehicle-usage-analysis/types.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/lib/vehicle-usage-analysis/types.ts)

ผู้นำเข้าโดยตรง: [app/api/admin/vehicles/history/analysis/__tests__/route.test.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/api/admin/vehicles/history/analysis/__tests__/route.test.ts), [app/api/admin/vehicles/history/analysis/route.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/api/admin/vehicles/history/analysis/route.ts), [app/api/admin/vehicles/history/details/route.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/api/admin/vehicles/history/details/route.ts), [app/api/admin/vehicles/history/route.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/api/admin/vehicles/history/route.ts), [lib/ai/vehicle-usage-summary/__tests__/payload.test.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/lib/ai/vehicle-usage-summary/__tests__/payload.test.ts), [lib/ai/vehicle-usage-summary/generate.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/lib/ai/vehicle-usage-summary/generate.ts), [lib/ai/vehicle-usage-summary/payload.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/lib/ai/vehicle-usage-summary/payload.ts), [lib/vehicle-history-details/index.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/lib/vehicle-history-details/index.ts)


### lib/vehicle-usage-analysis/period.ts

[lib/vehicle-usage-analysis/period.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/lib/vehicle-usage-analysis/period.ts)

คำนวณตัวชี้วัดการใช้รถและช่วงเวลา; ดูสูตรและผู้เรียกในบท 4

นำเข้าไฟล์ในโครงการ: [lib/vehicle-usage-analysis/types.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/lib/vehicle-usage-analysis/types.ts) (type-only)

ผู้นำเข้าโดยตรง: [lib/vehicle-usage-analysis/__tests__/period.test.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/lib/vehicle-usage-analysis/__tests__/period.test.ts), [lib/vehicle-usage-analysis/calculate.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/lib/vehicle-usage-analysis/calculate.ts), [lib/vehicle-usage-analysis/index.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/lib/vehicle-usage-analysis/index.ts)

| ชื่อ | ประเภท | เปิดโค้ด |
|---|---|---|
| `BANGKOK_OFFSET` | ค่าระดับ module | [บรรทัด 3](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/lib/vehicle-usage-analysis/period.ts:3) |
| `DAY_MS` | ค่าระดับ module | [บรรทัด 4](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/lib/vehicle-usage-analysis/period.ts:4) |
| `DATE_PATTERN` | ค่าระดับ module | [บรรทัด 5](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/lib/vehicle-usage-analysis/period.ts:5) |
| `AnalysisInputError` | class | [บรรทัด 7](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/lib/vehicle-usage-analysis/period.ts:7) |
| `formatBangkokDate` | ฟังก์ชัน / component | [บรรทัด 9](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/lib/vehicle-usage-analysis/period.ts:9) |
| `parseBangkokDate` | ฟังก์ชัน / component | [บรรทัด 18](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/lib/vehicle-usage-analysis/period.ts:18) |
| `addDays` | ฟังก์ชัน / component | [บรรทัด 31](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/lib/vehicle-usage-analysis/period.ts:31) |
| `resolveAnalysisPeriod` | ฟังก์ชัน / component | [บรรทัด 35](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/lib/vehicle-usage-analysis/period.ts:35) |
| `isDateInPeriod` | ฟังก์ชัน / component | [บรรทัด 79](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/lib/vehicle-usage-analysis/period.ts:79) |
| `getBangkokWeekdayAndHour` | ฟังก์ชัน / component | [บรรทัด 83](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/lib/vehicle-usage-analysis/period.ts:83) |

### lib/vehicle-usage-analysis/types.ts

[lib/vehicle-usage-analysis/types.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/lib/vehicle-usage-analysis/types.ts)

ชนิดข้อมูลของ module: ช่วยตรวจโครงสร้างขณะพัฒนา ไม่ใช่ runtime validation หรือการสร้างตาราง

นำเข้าไฟล์ในโครงการ: ไม่มี

ผู้นำเข้าโดยตรง: [lib/vehicle-usage-analysis/calculate.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/lib/vehicle-usage-analysis/calculate.ts), [lib/vehicle-usage-analysis/index.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/lib/vehicle-usage-analysis/index.ts), [lib/vehicle-usage-analysis/period.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/lib/vehicle-usage-analysis/period.ts)

| ชื่อ | ประเภท | เปิดโค้ด |
|---|---|---|
| `AnalysisFilters` | ชนิดข้อมูล | [บรรทัด 1](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/lib/vehicle-usage-analysis/types.ts:1) |
| `ResolvedAnalysisPeriod` | ชนิดข้อมูล | [บรรทัด 7](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/lib/vehicle-usage-analysis/types.ts:7) |
| `VehicleHistoryItem` | ชนิดข้อมูล | [บรรทัด 19](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/lib/vehicle-usage-analysis/types.ts:19) |
| `UserUsageMetric` | ชนิดข้อมูล | [บรรทัด 43](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/lib/vehicle-usage-analysis/types.ts:43) |
| `PeakUsageMetric` | ชนิดข้อมูล | [บรรทัด 57](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/lib/vehicle-usage-analysis/types.ts:57) |
| `DataCompleteness` | ชนิดข้อมูล | [บรรทัด 65](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/lib/vehicle-usage-analysis/types.ts:65) |
| `VehicleUsageAnalysis` | ชนิดข้อมูล | [บรรทัด 74](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/lib/vehicle-usage-analysis/types.ts:74) |

### next.config.ts

[next.config.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/next.config.ts)

เปิดชื่อฟังก์ชันและแผนที่ import ด้านล่างประกอบคำอธิบายโมดูลในบท 1–4

นำเข้าไฟล์ในโครงการ: ไม่มี

นำเข้า package/module: `next`

ผู้นำเข้าโดยตรง: ไม่พบในชุดที่ทำดัชนี; page/layout/route และ config/script อาจถูก framework หรือคำสั่งเรียก

| ชื่อ | ประเภท | เปิดโค้ด |
|---|---|---|
| `nextConfig` | ค่าระดับ module | [บรรทัด 3](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/next.config.ts:3) |

### playwright.config.ts

[playwright.config.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/playwright.config.ts)

เปิดชื่อฟังก์ชันและแผนที่ import ด้านล่างประกอบคำอธิบายโมดูลในบท 1–4

นำเข้าไฟล์ในโครงการ: ไม่มี

นำเข้า package/module: `@playwright/test`

ผู้นำเข้าโดยตรง: ไม่พบในชุดที่ทำดัชนี; page/layout/route และ config/script อาจถูก framework หรือคำสั่งเรียก

| ชื่อ | ประเภท | เปิดโค้ด |
|---|---|---|
| `externalBaseURL` | ค่าระดับ module | [บรรทัด 3](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/playwright.config.ts:3) |
| `baseURL` | ค่าระดับ module | [บรรทัด 4](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/playwright.config.ts:4) |

### postcss.config.mjs

[postcss.config.mjs](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/postcss.config.mjs)

เปิดชื่อฟังก์ชันและแผนที่ import ด้านล่างประกอบคำอธิบายโมดูลในบท 1–4

นำเข้าไฟล์ในโครงการ: ไม่มี

ผู้นำเข้าโดยตรง: ไม่พบในชุดที่ทำดัชนี; page/layout/route และ config/script อาจถูก framework หรือคำสั่งเรียก

| ชื่อ | ประเภท | เปิดโค้ด |
|---|---|---|
| `config` | ค่าระดับ module | [บรรทัด 1](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/postcss.config.mjs:1) |

### prisma.config.ts

[prisma.config.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/prisma.config.ts)

เปิดชื่อฟังก์ชันและแผนที่ import ด้านล่างประกอบคำอธิบายโมดูลในบท 1–4

นำเข้าไฟล์ในโครงการ: ไม่มี

นำเข้า package/module: `dotenv/config`, `prisma/config`

ผู้นำเข้าโดยตรง: ไม่พบในชุดที่ทำดัชนี; page/layout/route และ config/script อาจถูก framework หรือคำสั่งเรียก


### prisma/seed.ts

[prisma/seed.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/prisma/seed.ts)

ข้อมูลและสิทธิ์ตั้งต้นที่รันผ่าน seed command; รายละเอียดบท 1 และ 7

นำเข้าไฟล์ในโครงการ: [app/generated/prisma/client.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/generated/prisma/client.ts)

นำเข้า package/module: `dotenv/config`, `@prisma/adapter-pg`, `bcryptjs`

ผู้นำเข้าโดยตรง: ไม่พบในชุดที่ทำดัชนี; page/layout/route และ config/script อาจถูก framework หรือคำสั่งเรียก

| ชื่อ | ประเภท | เปิดโค้ด |
|---|---|---|
| `connectionString` | ค่าระดับ module | [บรรทัด 6](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/prisma/seed.ts:6) |
| `databaseHost` | ค่าระดับ module | [บรรทัด 11](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/prisma/seed.ts:11) |
| `isLocalDatabase` | ค่าระดับ module | [บรรทัด 12](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/prisma/seed.ts:12) |
| `getAdminPassword` | ฟังก์ชัน / component | [บรรทัด 13](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/prisma/seed.ts:13) |
| `adminPassword` | ค่าระดับ module | [บรรทัด 20](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/prisma/seed.ts:20) |
| `adapter` | ค่าระดับ module | [บรรทัด 22](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/prisma/seed.ts:22) |
| `prisma` | ค่าระดับ module | [บรรทัด 23](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/prisma/seed.ts:23) |
| `main` | ฟังก์ชัน / component | [บรรทัด 25](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/prisma/seed.ts:25) |

### prisma/seedPermissions.ts

[prisma/seedPermissions.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/prisma/seedPermissions.ts)

ข้อมูลและสิทธิ์ตั้งต้นที่รันผ่าน seed command; รายละเอียดบท 1 และ 7

นำเข้าไฟล์ในโครงการ: [app/generated/prisma/client.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/generated/prisma/client.ts)

นำเข้า package/module: `dotenv/config`, `@prisma/adapter-pg`

ผู้นำเข้าโดยตรง: ไม่พบในชุดที่ทำดัชนี; page/layout/route และ config/script อาจถูก framework หรือคำสั่งเรียก

| ชื่อ | ประเภท | เปิดโค้ด |
|---|---|---|
| `connectionString` | ค่าระดับ module | [บรรทัด 9](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/prisma/seedPermissions.ts:9) |
| `adapter` | ค่าระดับ module | [บรรทัด 10](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/prisma/seedPermissions.ts:10) |
| `prisma` | ค่าระดับ module | [บรรทัด 11](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/prisma/seedPermissions.ts:11) |
| `DEFAULT_PERMISSIONS` | ค่าระดับ module | [บรรทัด 14](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/prisma/seedPermissions.ts:14) |
| `main` | ฟังก์ชัน / component | [บรรทัด 35](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/prisma/seedPermissions.ts:35) |

### proxy.ts

[proxy.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/proxy.ts)

เปิดชื่อฟังก์ชันและแผนที่ import ด้านล่างประกอบคำอธิบายโมดูลในบท 1–4

นำเข้าไฟล์ในโครงการ: ไม่มี

นำเข้า package/module: `next/server`

ผู้นำเข้าโดยตรง: ไม่พบในชุดที่ทำดัชนี; page/layout/route และ config/script อาจถูก framework หรือคำสั่งเรียก

API URL ที่อ้างเป็นข้อความ: `/api/auth/login`, `/api/auth/logout`, `/api/`, `/api/:path*`

| ชื่อ | ประเภท | เปิดโค้ด |
|---|---|---|
| `proxy` | ฟังก์ชัน / component | [บรรทัด 4](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/proxy.ts:4) |
| `config` | ค่าระดับ module | [บรรทัด 24](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/proxy.ts:24) |

### scripts/deploy-migrations.mjs

[scripts/deploy-migrations.mjs](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/scripts/deploy-migrations.mjs)

เรียก prisma migrate deploy เฉพาะ Vercel production ผ่าน direct Prisma Postgres URL; อธิบายทุกขั้นในบท 7

นำเข้าไฟล์ในโครงการ: ไม่มี

นำเข้า package/module: `node:child_process`

ผู้นำเข้าโดยตรง: ไม่พบในชุดที่ทำดัชนี; page/layout/route และ config/script อาจถูก framework หรือคำสั่งเรียก

| ชื่อ | ประเภท | เปิดโค้ด |
|---|---|---|
| `pooledUrl` | ค่าระดับ module | [บรรทัด 7](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/scripts/deploy-migrations.mjs:7) |
| `directUrl` | ค่าระดับ module | [บรรทัด 12](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/scripts/deploy-migrations.mjs:12) |
| `prisma` | ค่าระดับ module | [บรรทัด 21](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/scripts/deploy-migrations.mjs:21) |
| `result` | ค่าระดับ module | [บรรทัด 24](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/scripts/deploy-migrations.mjs:24) |

### vitest.config.ts

[vitest.config.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/vitest.config.ts)

เปิดชื่อฟังก์ชันและแผนที่ import ด้านล่างประกอบคำอธิบายโมดูลในบท 1–4

นำเข้าไฟล์ในโครงการ: ไม่มี

นำเข้า package/module: `vitest/config`, `path`

ผู้นำเข้าโดยตรง: ไม่พบในชุดที่ทำดัชนี; page/layout/route และ config/script อาจถูก framework หรือคำสั่งเรียก


## ไฟล์ทดสอบ

หัวข้อด้านล่างอ่านจาก describe/it/test ใน source ไม่ได้แปลว่ารัน E2E แล้ว ผลที่รันจริงอยู่บท 4

### app/api/admin/bookings/__tests__/route.test.ts

[app/api/admin/bookings/__tests__/route.test.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/api/admin/bookings/__tests__/route.test.ts)

- PUT /api/admin/bookings

### app/api/admin/bookings/change-vehicle/__tests__/route.test.ts

[app/api/admin/bookings/change-vehicle/__tests__/route.test.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/api/admin/bookings/change-vehicle/__tests__/route.test.ts)

- PUT /api/admin/bookings/change-vehicle
- changes the vehicle atomically and emails the booking owner
- rejects a booking whose original vehicle is not in maintenance
- returns a conflict when the replacement became unavailable

### app/api/admin/maintenance/__tests__/route.test.ts

[app/api/admin/maintenance/__tests__/route.test.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/api/admin/maintenance/__tests__/route.test.ts)

- GET /api/admin/maintenance
- adds overlapping active bookings to each maintenance item
- PUT /api/admin/maintenance
- persists closing details, service center and cost
- rejects a negative closing cost before updating the database
- requires an end date when closing maintenance
- POST /api/admin/maintenance
- persists optional service details when an admin creates maintenance

### app/api/admin/permissions/__tests__/route.test.ts

[app/api/admin/permissions/__tests__/route.test.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/api/admin/permissions/__tests__/route.test.ts)

- PUT /api/admin/permissions
- replaces a role matrix atomically and records its diff
- rejects unknown permissions before changing the database
- prevents removing the permission-management bootstrap from Admin
- returns 403 when an authenticated actor lacks permission

### app/api/admin/vehicles/history/analysis/__tests__/route.test.ts

[app/api/admin/vehicles/history/analysis/__tests__/route.test.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/api/admin/vehicles/history/analysis/__tests__/route.test.ts)

- POST /api/admin/vehicles/history/analysis
- allows Admin and records only operational metadata
- rejects non-Admin users before reading analysis data
- does not call AI when there is no actual usage
- rejects unknown request fields
- enforces the non-cached hourly run limit

### app/api/admin/vehicles/history/details/__tests__/route.test.ts

[app/api/admin/vehicles/history/details/__tests__/route.test.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/api/admin/vehicles/history/details/__tests__/route.test.ts)

- GET /api/admin/vehicles/history/details
- requires REPORT_VIEW and forwards validated pagination and filters
- rejects requests without REPORT_VIEW
- rejects an unsupported tab before querying history

### app/api/approver/__tests__/route.test.ts

[app/api/approver/__tests__/route.test.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/api/approver/__tests__/route.test.ts)

- Approver API
- PUT /api/approver
- rejects a rejection without a reason before reading the booking
- approves a pending booking and sends a notification
- returns the booking for a duplicate action from the same approver
- returns a conflict when a booking was already handled by someone else

### app/api/auth/login/__tests__/route.test.ts

[app/api/auth/login/__tests__/route.test.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/api/auth/login/__tests__/route.test.ts)

- POST /api/auth/login
- should return 401 if user not found
- should return 401 if password does not match
- should return 200 and set cookie on successful login
- returns ACCOUNT_INACTIVE when the password is valid but the account is disabled

### app/api/booking/__tests__/route.test.ts

[app/api/booking/__tests__/route.test.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/api/booking/__tests__/route.test.ts)

- Booking API
- GET /api/booking
- should return my bookings if action=my-bookings
- should filter out vehicles that conflict with bookings
- POST /api/booking
- should prevent booking if startDate >= endDate
- should prevent booking a vehicle under MAINTENANCE
- should prevent booking if conflicting with another booking
- should create booking successfully
- should reject destinations longer than 255 characters
- PUT /api/booking
- should fail if user tries to cancel someone else booking
- should cancel booking successfully
- PATCH /api/booking
- should update and normalize the destination of a pending booking
- should clear a destination when the submitted value is blank

### app/api/notifications/__tests__/route.test.ts

[app/api/notifications/__tests__/route.test.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/api/notifications/__tests__/route.test.ts)

- /api/notifications
- returns only the signed-in user's notifications and unread count
- marks one owned notification as read
- does not expose whether another user's notification exists

### app/api/user/__tests__/route.test.ts

[app/api/user/__tests__/route.test.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/api/user/__tests__/route.test.ts)

- user lifecycle API
- lists lifecycle state, active booking counts and deletion eligibility
- deactivates an account, reports affected bookings and writes an audit log
- does not allow an admin to deactivate their own account
- does not allow deactivating the last active admin
- rejects permanent deletion when the account has history
- permanently deletes a new account without history

### app/api/user/maintenance/__tests__/route.test.ts

[app/api/user/maintenance/__tests__/route.test.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/api/user/maintenance/__tests__/route.test.ts)

- POST /api/user/maintenance
- creates in-app notifications and emails every admin
- does not fail when no administrators exist
- rejects a new report without a maintenance type

### app/api/verhicle-type/__tests__/route.test.ts

[app/api/verhicle-type/__tests__/route.test.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/api/verhicle-type/__tests__/route.test.ts)

- Vehicle Type API
- GET /api/verhicle-type
- should return list of vehicle types
- POST /api/verhicle-type
- should return 403 if user lacks permission
- should create vehicle type successfully
- PUT /api/verhicle-type
- should update vehicle type successfully
- DELETE /api/verhicle-type
- should delete vehicle type successfully if no vehicles are linked
- should return 400 if trying to delete a type still used by vehicles

### app/api/verhicle/__tests__/route.test.ts

[app/api/verhicle/__tests__/route.test.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/api/verhicle/__tests__/route.test.ts)

- vehicle deletion
- returns a conflict instead of deleting a vehicle with maintenance history
- vehicle mileage management
- stores the initial mileage when an admin creates a vehicle
- updates the current mileage as a non-negative integer

### e2e/admin-booking-mileage.e2e.ts

[e2e/admin-booking-mileage.e2e.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/e2e/admin-booking-mileage.e2e.ts)

- admin records pickup and return mileage on behalf of a user

### e2e/admin-vehicle-mileage.e2e.ts

[e2e/admin-vehicle-mileage.e2e.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/e2e/admin-vehicle-mileage.e2e.ts)

- admin updates the current vehicle mileage

### e2e/booking-destination.e2e.ts

[e2e/booking-destination.e2e.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/e2e/booking-destination.e2e.ts)

- stores, displays, edits and clears a booking destination

### e2e/phase6-emergency.e2e.ts

[e2e/phase6-emergency.e2e.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/e2e/phase6-emergency.e2e.ts)

- user reports an emergency and admin replaces the vehicle

### lib/__tests__/auth.test.ts

[lib/__tests__/auth.test.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/lib/__tests__/auth.test.ts)

- database-backed authentication
- uses the latest role from the database instead of the token role
- rejects a token issued before the account was deactivated

### lib/__tests__/permissions.test.ts

[lib/__tests__/permissions.test.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/lib/__tests__/permissions.test.ts)

- permission enforcement
- allows an active actor with the required role and permission
- rejects a role mismatch before reading permissions
- rejects an authenticated actor without the permission
- returns 401 only for authentication failures and 403 for denied access

### lib/ai/vehicle-usage-summary/__tests__/payload.test.ts

[lib/ai/vehicle-usage-summary/__tests__/payload.test.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/lib/ai/vehicle-usage-summary/__tests__/payload.test.ts)

- buildVehicleUsageAiPayload
- sends names and aggregates without internal identifiers or raw fields
- produces a stable cache key for an unchanged metrics snapshot

### lib/ai/vehicle-usage-summary/__tests__/validate.test.ts

[lib/ai/vehicle-usage-summary/__tests__/validate.test.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/lib/ai/vehicle-usage-summary/__tests__/validate.test.ts)

- validateAiSummary
- accepts references that match server-computed evidence
- rejects invented evidence keys
- rejects numbers and direct names in AI-authored prose
- uses only deterministic data limitations

### lib/email/__tests__/maintenanceNotifications.test.ts

[lib/email/__tests__/maintenanceNotifications.test.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/lib/email/__tests__/maintenanceNotifications.test.ts)

- maintenance report emails
- builds an admin email and escapes report content
- sends a separate email to every admin

### lib/email/__tests__/service.test.ts

[lib/email/__tests__/service.test.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/lib/email/__tests__/service.test.ts)

- sendEmail
- skips sending when email is disabled
- does not throw when SMTP config is incomplete
- sends with SMTP config when enabled
- returns false when transport fails

### lib/email/__tests__/templates.test.ts

[lib/email/__tests__/templates.test.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/lib/email/__tests__/templates.test.ts)

- booking email templates
- builds an approved booking email
- includes rejection comments
- builds a vehicle changed email

### lib/vehicle-history-details/__tests__/index.test.ts

[lib/vehicle-history-details/__tests__/index.test.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/lib/vehicle-history-details/__tests__/index.test.ts)

- vehicle history details
- sorts every trip status by its effective date and paginates
- keeps completed mileage rows with missing mileage as distanceKm null
- returns all maintenance types and statuses within the Bangkok date range
- rejects page sizes over 100

### lib/vehicle-usage-analysis/__tests__/calculate.test.ts

[lib/vehicle-usage-analysis/__tests__/calculate.test.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/lib/vehicle-usage-analysis/__tests__/calculate.test.ts)

- calculateVehicleUsageAnalysis
- computes deterministic vehicle, user, peer, and maintenance metrics
- focuses user totals on one vehicle but keeps same-type peer medians
- returns null rates and a mileage limitation when distance is unusable
- does not publish a peer breakdown median from fewer than three usable rates

### lib/vehicle-usage-analysis/__tests__/period.test.ts

[lib/vehicle-usage-analysis/__tests__/period.test.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/lib/vehicle-usage-analysis/__tests__/period.test.ts)

- vehicle usage analysis period
- defaults to month-to-date in Bangkok
- creates an immediately preceding comparison period of equal length
- uses an exclusive end boundary
- rejects partial and oversized ranges
- extracts weekday and hour in Bangkok

## ไฟล์ข้อมูลและโครงสร้างอื่น

Schema และ migrations ทุกชุดอธิบายในบท 1 และ data migration ใหม่ในบท 7; package.json/package-lock.json, tsconfig.json, docker-compose.yml, .env.example, CSS และ assets อธิบายหน้าที่ในบท 1/2/4 จึงไม่ทำดัชนีฟังก์ชัน TypeScript ให้ไฟล์เหล่านั้น
