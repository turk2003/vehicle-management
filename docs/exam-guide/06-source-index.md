# บทที่ 6 — ดัชนีไฟล์ ฟังก์ชัน และผู้เรียกใช้

ดัชนีนี้สร้างจาก TypeScript syntax tree ของ source ปัจจุบันเพื่อให้เปิดตามตำแหน่งได้ ใช้ประกอบคำอธิบายในบท 1–5

“ผู้นำเข้า” หมายถึง import/re-export โดยตรง ไม่เท่ากับทุก runtime call; page/layout/route ถูก Next.js เรียกจาก convention แม้ไม่มีไฟล์ import โดยตรง ส่วน callback ถูกผูกกับ event/effect ตามบท 2 ไม่มีการคาดเดา dynamic call graph ทั้งหมด

มี source/config/script ที่ทำดัชนี 90 ไฟล์ และไฟล์ทดสอบ 28 ไฟล์ ไม่รวมโค้ด generated ของ Prisma ภายใน dependencies และไฟล์ declaration ที่ framework สร้าง

## แผนที่ API ที่มีจริง

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

## Source ทีละไฟล์

### app/admin/bookings/layout.tsx

[app/admin/bookings/layout.tsx](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/admin/bookings/layout.tsx)

Layout ที่ Next.js ใช้ห่อหน้าลูก

นำเข้าไฟล์ในโครงการ: [lib/page-access.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/lib/page-access.ts)

นำเข้า package/module ภายนอก: `react`

ผู้นำเข้าโดยตรง: ไม่พบในชุด source ที่ทำดัชนี; หากเป็น page/layout/route ให้ดู convention ของ Next.js หรือเป็น script/config ที่เครื่องมือเรียก

| ชื่อ | ประเภท | เปิดโค้ด |
|---|---|---|
| `BookingsLayout` | ฟังก์ชัน / component | [บรรทัด 4](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/admin/bookings/layout.tsx:4) |

### app/admin/bookings/page.tsx

[app/admin/bookings/page.tsx](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/admin/bookings/page.tsx)

หน้า React ของ URL ตามโฟลเดอร์

นำเข้าไฟล์ในโครงการ: [lib/api.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/lib/api.ts), [lib/use-permissions.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/lib/use-permissions.ts), [lib/format.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/lib/format.ts)

นำเข้า package/module ภายนอก: `react`, `axios`, `lucide-react`

ผู้นำเข้าโดยตรง: ไม่พบในชุด source ที่ทำดัชนี; หากเป็น page/layout/route ให้ดู convention ของ Next.js หรือเป็น script/config ที่เครื่องมือเรียก

API URL ที่อ้างเป็นข้อความในไฟล์: `/api/admin/bookings`, `/api/admin/bookings/change-vehicle`, `/api/admin/bookings/pickup`, `/api/admin/bookings/return`, `/api/user`, `/api/verhicle`

| ชื่อ | ประเภท | เปิดโค้ด |
|---|---|---|
| `Booking` | ชนิดข้อมูล | [บรรทัด 23](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/admin/bookings/page.tsx:23) |
| `User` | ชนิดข้อมูล | [บรรทัด 46](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/admin/bookings/page.tsx:46) |
| `Vehicle` | ชนิดข้อมูล | [บรรทัด 47](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/admin/bookings/page.tsx:47) |
| `ReplacementVehicle` | ชนิดข้อมูล | [บรรทัด 49](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/admin/bookings/page.tsx:49) |
| `BookingFilters` | ชนิดข้อมูล | [บรรทัด 59](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/admin/bookings/page.tsx:59) |
| `BookingStats` | ชนิดข้อมูล | [บรรทัด 67](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/admin/bookings/page.tsx:67) |
| `MileageAction` | ชนิดข้อมูล | [บรรทัด 112](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/admin/bookings/page.tsx:112) |
| `getErrorMessage` | ฟังก์ชัน / component | [บรรทัด 114](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/admin/bookings/page.tsx:114) |
| `buildStats` | ฟังก์ชัน / component | [บรรทัด 122](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/admin/bookings/page.tsx:122) |
| `AdminBookingsPage` | ฟังก์ชัน / component | [บรรทัด 135](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/admin/bookings/page.tsx:135) |
| `fetchData` | ฟังก์ชัน / callback | [บรรทัด 163](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/admin/bookings/page.tsx:163) |
| `updateBookingStatus` | ฟังก์ชัน / callback | [บรรทัด 189](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/admin/bookings/page.tsx:189) |
| `deleteBooking` | ฟังก์ชัน / callback | [บรรทัด 211](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/admin/bookings/page.tsx:211) |
| `handleFilterChange` | ฟังก์ชัน / callback | [บรรทัด 231](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/admin/bookings/page.tsx:231) |
| `openStatusModal` | ฟังก์ชัน / callback | [บรรทัด 235](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/admin/bookings/page.tsx:235) |
| `closeStatusModal` | ฟังก์ชัน / callback | [บรรทัด 245](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/admin/bookings/page.tsx:245) |
| `openChangeVehicleModal` | ฟังก์ชัน / callback | [บรรทัด 251](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/admin/bookings/page.tsx:251) |
| `closeChangeVehicleModal` | ฟังก์ชัน / callback | [บรรทัด 280](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/admin/bookings/page.tsx:280) |
| `openMileageModal` | ฟังก์ชัน / callback | [บรรทัด 289](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/admin/bookings/page.tsx:289) |
| `closeMileageModal` | ฟังก์ชัน / callback | [บรรทัด 301](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/admin/bookings/page.tsx:301) |
| `submitMileage` | ฟังก์ชัน / callback | [บรรทัด 308](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/admin/bookings/page.tsx:308) |
| `changeVehicle` | ฟังก์ชัน / callback | [บรรทัด 357](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/admin/bookings/page.tsx:357) |

### app/admin/layout.tsx

[app/admin/layout.tsx](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/admin/layout.tsx)

Layout ที่ Next.js ใช้ห่อหน้าลูก

นำเข้าไฟล์ในโครงการ: [lib/page-access.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/lib/page-access.ts)

นำเข้า package/module ภายนอก: `react`

ผู้นำเข้าโดยตรง: ไม่พบในชุด source ที่ทำดัชนี; หากเป็น page/layout/route ให้ดู convention ของ Next.js หรือเป็น script/config ที่เครื่องมือเรียก

| ชื่อ | ประเภท | เปิดโค้ด |
|---|---|---|
| `AdminLayout` | ฟังก์ชัน / component | [บรรทัด 4](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/admin/layout.tsx:4) |

### app/admin/maintenance/layout.tsx

[app/admin/maintenance/layout.tsx](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/admin/maintenance/layout.tsx)

Layout ที่ Next.js ใช้ห่อหน้าลูก

นำเข้าไฟล์ในโครงการ: [lib/page-access.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/lib/page-access.ts)

นำเข้า package/module ภายนอก: `react`

ผู้นำเข้าโดยตรง: ไม่พบในชุด source ที่ทำดัชนี; หากเป็น page/layout/route ให้ดู convention ของ Next.js หรือเป็น script/config ที่เครื่องมือเรียก

| ชื่อ | ประเภท | เปิดโค้ด |
|---|---|---|
| `MaintenanceLayout` | ฟังก์ชัน / component | [บรรทัด 4](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/admin/maintenance/layout.tsx:4) |

### app/admin/maintenance/page.tsx

[app/admin/maintenance/page.tsx](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/admin/maintenance/page.tsx)

หน้า React ของ URL ตามโฟลเดอร์

นำเข้าไฟล์ในโครงการ: [lib/api.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/lib/api.ts), [lib/format.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/lib/format.ts), [lib/use-permissions.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/lib/use-permissions.ts)

นำเข้า package/module ภายนอก: `axios`, `react`, `lucide-react`

ผู้นำเข้าโดยตรง: ไม่พบในชุด source ที่ทำดัชนี; หากเป็น page/layout/route ให้ดู convention ของ Next.js หรือเป็น script/config ที่เครื่องมือเรียก

API URL ที่อ้างเป็นข้อความในไฟล์: `/api/admin/maintenance`, `/api/verhicle`

| ชื่อ | ประเภท | เปิดโค้ด |
|---|---|---|
| `MaintenanceStatus` | ชนิดข้อมูล | [บรรทัด 15](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/admin/maintenance/page.tsx:15) |
| `MaintenanceType` | ชนิดข้อมูล | [บรรทัด 16](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/admin/maintenance/page.tsx:16) |
| `AffectedBooking` | ชนิดข้อมูล | [บรรทัด 18](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/admin/maintenance/page.tsx:18) |
| `Maintenance` | ชนิดข้อมูล | [บรรทัด 28](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/admin/maintenance/page.tsx:28) |
| `Vehicle` | ชนิดข้อมูล | [บรรทัด 53](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/admin/maintenance/page.tsx:53) |
| `FormData` | ชนิดข้อมูล | [บรรทัด 60](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/admin/maintenance/page.tsx:60) |
| `getApiErrorMessage` | ฟังก์ชัน / callback | [บรรทัด 98](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/admin/maintenance/page.tsx:98) |
| `isAffectedBookingsConflict` | ฟังก์ชัน / callback | [บรรทัด 105](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/admin/maintenance/page.tsx:105) |
| `getVehicleStatusText` | ฟังก์ชัน / callback | [บรรทัด 110](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/admin/maintenance/page.tsx:110) |
| `getVehicleStatusClass` | ฟังก์ชัน / callback | [บรรทัด 116](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/admin/maintenance/page.tsx:116) |
| `getMaintenanceTypeClass` | ฟังก์ชัน / callback | [บรรทัด 129](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/admin/maintenance/page.tsx:129) |
| `AdminMaintenancePage` | ฟังก์ชัน / component | [บรรทัด 136](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/admin/maintenance/page.tsx:136) |
| `fetchData` | ฟังก์ชัน / callback | [บรรทัด 160](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/admin/maintenance/page.tsx:160) |
| `openCreateModal` | ฟังก์ชัน / callback | [บรรทัด 179](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/admin/maintenance/page.tsx:179) |
| `openEditModal` | ฟังก์ชัน / callback | [บรรทัด 186](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/admin/maintenance/page.tsx:186) |
| `closeModal` | ฟังก์ชัน / callback | [บรรทัด 203](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/admin/maintenance/page.tsx:203) |
| `validateForm` | ฟังก์ชัน / callback | [บรรทัด 210](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/admin/maintenance/page.tsx:210) |
| `handleSubmit` | ฟังก์ชัน / callback | [บรรทัด 232](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/admin/maintenance/page.tsx:232) |
| `saveMaintenance` | ฟังก์ชัน / callback | [บรรทัด 245](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/admin/maintenance/page.tsx:245) |
| `handleDelete` | ฟังก์ชัน / callback | [บรรทัด 297](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/admin/maintenance/page.tsx:297) |

### app/admin/page.tsx

[app/admin/page.tsx](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/admin/page.tsx)

หน้า React ของ URL ตามโฟลเดอร์

นำเข้าไฟล์ในโครงการ: [lib/api.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/lib/api.ts), [app/component/role-dashboard.tsx](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/component/role-dashboard.tsx)

นำเข้า package/module ภายนอก: `lucide-react`, `react`

ผู้นำเข้าโดยตรง: ไม่พบในชุด source ที่ทำดัชนี; หากเป็น page/layout/route ให้ดู convention ของ Next.js หรือเป็น script/config ที่เครื่องมือเรียก

API URL ที่อ้างเป็นข้อความในไฟล์: `/api/auth/me`

| ชื่อ | ประเภท | เปิดโค้ด |
|---|---|---|
| `AdminPage` | ฟังก์ชัน / component | [บรรทัด 11](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/admin/page.tsx:11) |
| `fetchMe` | ฟังก์ชัน / callback | [บรรทัด 16](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/admin/page.tsx:16) |

### app/admin/permissions/layout.tsx

[app/admin/permissions/layout.tsx](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/admin/permissions/layout.tsx)

Layout ที่ Next.js ใช้ห่อหน้าลูก

นำเข้าไฟล์ในโครงการ: [lib/page-access.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/lib/page-access.ts)

นำเข้า package/module ภายนอก: `react`

ผู้นำเข้าโดยตรง: ไม่พบในชุด source ที่ทำดัชนี; หากเป็น page/layout/route ให้ดู convention ของ Next.js หรือเป็น script/config ที่เครื่องมือเรียก

| ชื่อ | ประเภท | เปิดโค้ด |
|---|---|---|
| `PermissionsLayout` | ฟังก์ชัน / component | [บรรทัด 4](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/admin/permissions/layout.tsx:4) |

### app/admin/permissions/page.tsx

[app/admin/permissions/page.tsx](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/admin/permissions/page.tsx)

หน้า React ของ URL ตามโฟลเดอร์

นำเข้าไฟล์ในโครงการ: [lib/api.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/lib/api.ts)

นำเข้า package/module ภายนอก: `axios`, `react`, `lucide-react`

ผู้นำเข้าโดยตรง: ไม่พบในชุด source ที่ทำดัชนี; หากเป็น page/layout/route ให้ดู convention ของ Next.js หรือเป็น script/config ที่เครื่องมือเรียก

API URL ที่อ้างเป็นข้อความในไฟล์: `/api/admin/permissions`

| ชื่อ | ประเภท | เปิดโค้ด |
|---|---|---|
| `PermissionMatrix` | ชนิดข้อมูล | [บรรทัด 15](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/admin/permissions/page.tsx:15) |
| `PermissionItem` | ชนิดข้อมูล | [บรรทัด 17](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/admin/permissions/page.tsx:17) |
| `MenuGroup` | ชนิดข้อมูล | [บรรทัด 23](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/admin/permissions/page.tsx:23) |
| `PermissionsResponse` | ชนิดข้อมูล | [บรรทัด 29](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/admin/permissions/page.tsx:29) |
| `RoleMeta` | ชนิดข้อมูล | [บรรทัด 35](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/admin/permissions/page.tsx:35) |
| `getApiErrorMessage` | ฟังก์ชัน / callback | [บรรทัด 165](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/admin/permissions/page.tsx:165) |
| `getRoleLabel` | ฟังก์ชัน / callback | [บรรทัด 173](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/admin/permissions/page.tsx:173) |
| `AdminPermissionsPage` | ฟังก์ชัน / component | [บรรทัด 175](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/admin/permissions/page.tsx:175) |
| `activeGroups` | ค่าคำนวณ useMemo | [บรรทัด 187](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/admin/permissions/page.tsx:187) |
| `isLocked` | ฟังก์ชัน / callback | [บรรทัด 192](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/admin/permissions/page.tsx:192) |
| `fetchPermissions` | ฟังก์ชัน / callback | [บรรทัด 196](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/admin/permissions/page.tsx:196) |
| `togglePermission` | ฟังก์ชัน / callback | [บรรทัด 219](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/admin/permissions/page.tsx:219) |
| `saveRole` | ฟังก์ชัน / callback | [บรรทัด 231](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/admin/permissions/page.tsx:231) |

### app/admin/users/layout.tsx

[app/admin/users/layout.tsx](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/admin/users/layout.tsx)

Layout ที่ Next.js ใช้ห่อหน้าลูก

นำเข้าไฟล์ในโครงการ: [lib/page-access.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/lib/page-access.ts)

นำเข้า package/module ภายนอก: `react`

ผู้นำเข้าโดยตรง: ไม่พบในชุด source ที่ทำดัชนี; หากเป็น page/layout/route ให้ดู convention ของ Next.js หรือเป็น script/config ที่เครื่องมือเรียก

| ชื่อ | ประเภท | เปิดโค้ด |
|---|---|---|
| `UsersLayout` | ฟังก์ชัน / component | [บรรทัด 4](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/admin/users/layout.tsx:4) |

### app/admin/users/page.tsx

[app/admin/users/page.tsx](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/admin/users/page.tsx)

หน้า React ของ URL ตามโฟลเดอร์

นำเข้าไฟล์ในโครงการ: [lib/api.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/lib/api.ts), [lib/format.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/lib/format.ts)

นำเข้า package/module ภายนอก: `react`, `axios`, `next/link`, `lucide-react`

ผู้นำเข้าโดยตรง: ไม่พบในชุด source ที่ทำดัชนี; หากเป็น page/layout/route ให้ดู convention ของ Next.js หรือเป็น script/config ที่เครื่องมือเรียก

API URL ที่อ้างเป็นข้อความในไฟล์: `/api/auth/me`, `/api/user`

| ชื่อ | ประเภท | เปิดโค้ด |
|---|---|---|
| `User` | ชนิดข้อมูล | [บรรทัด 10](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/admin/users/page.tsx:10) |
| `CurrentUser` | ชนิดข้อมูล | [บรรทัด 22](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/admin/users/page.tsx:22) |
| `StatusFilter` | ชนิดข้อมูล | [บรรทัด 23](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/admin/users/page.tsx:23) |
| `UserFormData` | ชนิดข้อมูล | [บรรทัด 25](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/admin/users/page.tsx:25) |
| `getErrorMessage` | ฟังก์ชัน / component | [บรรทัด 39](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/admin/users/page.tsx:39) |
| `getInitials` | ฟังก์ชัน / component | [บรรทัด 47](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/admin/users/page.tsx:47) |
| `AdminUsersPage` | ฟังก์ชัน / component | [บรรทัด 51](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/admin/users/page.tsx:51) |
| `fetchUsers` | ฟังก์ชัน / callback | [บรรทัด 62](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/admin/users/page.tsx:62) |
| `resetForm` | ฟังก์ชัน / callback | [บรรทัด 79](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/admin/users/page.tsx:79) |
| `closeModal` | ฟังก์ชัน / callback | [บรรทัด 85](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/admin/users/page.tsx:85) |
| `createUser` | ฟังก์ชัน / callback | [บรรทัด 90](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/admin/users/page.tsx:90) |
| `updateUser` | ฟังก์ชัน / callback | [บรรทัด 106](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/admin/users/page.tsx:106) |
| `deleteUser` | ฟังก์ชัน / callback | [บรรทัด 132](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/admin/users/page.tsx:132) |
| `toggleUserStatus` | ฟังก์ชัน / callback | [บรรทัด 148](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/admin/users/page.tsx:148) |
| `openEditModal` | ฟังก์ชัน / callback | [บรรทัด 187](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/admin/users/page.tsx:187) |
| `openCreateModal` | ฟังก์ชัน / callback | [บรรทัด 199](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/admin/users/page.tsx:199) |

### app/admin/vehicle-history/AiUsageSummaryCard.tsx

[app/admin/vehicle-history/AiUsageSummaryCard.tsx](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/admin/vehicle-history/AiUsageSummaryCard.tsx)

UI สั่งสร้าง AI summary และแสดง evidence

นำเข้าไฟล์ในโครงการ: [lib/api.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/lib/api.ts), [lib/format.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/lib/format.ts), [lib/ai/vehicle-usage-summary/schema.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/lib/ai/vehicle-usage-summary/schema.ts)

นำเข้า package/module ภายนอก: `axios`, `react`, `lucide-react`

ผู้นำเข้าโดยตรง: [app/admin/vehicle-history/page.tsx](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/admin/vehicle-history/page.tsx:9)

API URL ที่อ้างเป็นข้อความในไฟล์: `/api/admin/vehicles/history/analysis`

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

UI รายละเอียดประวัติสามแท็บ พร้อม pagination และ abort request

นำเข้าไฟล์ในโครงการ: [lib/api.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/lib/api.ts), [lib/format.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/lib/format.ts)

นำเข้า package/module ภายนอก: `axios`, `react`, `lucide-react`

ผู้นำเข้าโดยตรง: [app/admin/vehicle-history/page.tsx](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/admin/vehicle-history/page.tsx:10)

API URL ที่อ้างเป็นข้อความในไฟล์: `/api/admin/vehicles/history/details`

| ชื่อ | ประเภท | เปิดโค้ด |
|---|---|---|
| `Tab` | ชนิดข้อมูล | [บรรทัด 15](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/admin/vehicle-history/VehicleHistoryDetails.tsx:15) |
| `DetailsFilters` | ชนิดข้อมูล | [บรรทัด 17](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/admin/vehicle-history/VehicleHistoryDetails.tsx:17) |
| `BookingItem` | ชนิดข้อมูล | [บรรทัด 23](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/admin/vehicle-history/VehicleHistoryDetails.tsx:23) |
| `MaintenanceItem` | ชนิดข้อมูล | [บรรทัด 40](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/admin/vehicle-history/VehicleHistoryDetails.tsx:40) |
| `DetailsResponse` | ชนิดข้อมูล | [บรรทัด 54](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/admin/vehicle-history/VehicleHistoryDetails.tsx:54) |
| `getErrorMessage` | ฟังก์ชัน / component | [บรรทัด 73](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/admin/vehicle-history/VehicleHistoryDetails.tsx:73) |
| `displayDate` | ฟังก์ชัน / component | [บรรทัด 80](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/admin/vehicle-history/VehicleHistoryDetails.tsx:80) |
| `displayMileage` | ฟังก์ชัน / component | [บรรทัด 84](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/admin/vehicle-history/VehicleHistoryDetails.tsx:84) |
| `TripsTable` | ฟังก์ชัน / component | [บรรทัด 88](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/admin/vehicle-history/VehicleHistoryDetails.tsx:88) |
| `MileageTable` | ฟังก์ชัน / component | [บรรทัด 135](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/admin/vehicle-history/VehicleHistoryDetails.tsx:135) |
| `MaintenanceTable` | ฟังก์ชัน / component | [บรรทัด 166](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/admin/vehicle-history/VehicleHistoryDetails.tsx:166) |
| `VehicleHistoryDetails` | ฟังก์ชัน / component | [บรรทัด 209](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/admin/vehicle-history/VehicleHistoryDetails.tsx:209) |
| `load` | ฟังก์ชัน / callback | [บรรทัด 235](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/admin/vehicle-history/VehicleHistoryDetails.tsx:235) |

### app/admin/vehicle-history/layout.tsx

[app/admin/vehicle-history/layout.tsx](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/admin/vehicle-history/layout.tsx)

Layout ที่ Next.js ใช้ห่อหน้าลูก

นำเข้าไฟล์ในโครงการ: [lib/page-access.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/lib/page-access.ts)

นำเข้า package/module ภายนอก: `react`

ผู้นำเข้าโดยตรง: ไม่พบในชุด source ที่ทำดัชนี; หากเป็น page/layout/route ให้ดู convention ของ Next.js หรือเป็น script/config ที่เครื่องมือเรียก

| ชื่อ | ประเภท | เปิดโค้ด |
|---|---|---|
| `VehicleHistoryLayout` | ฟังก์ชัน / component | [บรรทัด 4](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/admin/vehicle-history/layout.tsx:4) |

### app/admin/vehicle-history/page.tsx

[app/admin/vehicle-history/page.tsx](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/admin/vehicle-history/page.tsx)

หน้า React ของ URL ตามโฟลเดอร์

นำเข้าไฟล์ในโครงการ: [lib/api.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/lib/api.ts), [lib/format.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/lib/format.ts), [app/admin/vehicle-history/AiUsageSummaryCard.tsx](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/admin/vehicle-history/AiUsageSummaryCard.tsx), [app/admin/vehicle-history/VehicleHistoryDetails.tsx](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/admin/vehicle-history/VehicleHistoryDetails.tsx)

นำเข้า package/module ภายนอก: `axios`, `react`, `recharts`, `lucide-react`

ผู้นำเข้าโดยตรง: ไม่พบในชุด source ที่ทำดัชนี; หากเป็น page/layout/route ให้ดู convention ของ Next.js หรือเป็น script/config ที่เครื่องมือเรียก

API URL ที่อ้างเป็นข้อความในไฟล์: `/api/admin/vehicles/history`, `/api/verhicle`

| ชื่อ | ประเภท | เปิดโค้ด |
|---|---|---|
| `VehicleOption` | ชนิดข้อมูล | [บรรทัด 12](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/admin/vehicle-history/page.tsx:12) |
| `VehicleHistoryItem` | ชนิดข้อมูล | [บรรทัด 17](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/admin/vehicle-history/page.tsx:17) |
| `VehicleHistoryResponse` | ชนิดข้อมูล | [บรรทัด 31](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/admin/vehicle-history/page.tsx:31) |
| `Filters` | ชนิดข้อมูล | [บรรทัด 35](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/admin/vehicle-history/page.tsx:35) |
| `ChartMetric` | ชนิดข้อมูล | [บรรทัด 41](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/admin/vehicle-history/page.tsx:41) |
| `getBangkokToday` | ฟังก์ชัน / callback | [บรรทัด 49](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/admin/vehicle-history/page.tsx:49) |
| `getApiErrorMessage` | ฟังก์ชัน / callback | [บรรทัด 92](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/admin/vehicle-history/page.tsx:92) |
| `ChartCard` | ฟังก์ชัน / component | [บรรทัด 100](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/admin/vehicle-history/page.tsx:100) |
| `AdminVehicleHistoryPage` | ฟังก์ชัน / component | [บรรทัด 139](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/admin/vehicle-history/page.tsx:139) |
| `summary` | ค่าคำนวณ useMemo | [บรรทัด 146](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/admin/vehicle-history/page.tsx:146) |
| `fetchVehicles` | ฟังก์ชัน / callback | [บรรทัด 171](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/admin/vehicle-history/page.tsx:171) |
| `fetchHistory` | ฟังก์ชัน / callback | [บรรทัด 189](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/admin/vehicle-history/page.tsx:189) |

### app/admin/vehicles/layout.tsx

[app/admin/vehicles/layout.tsx](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/admin/vehicles/layout.tsx)

Layout ที่ Next.js ใช้ห่อหน้าลูก

นำเข้าไฟล์ในโครงการ: [lib/page-access.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/lib/page-access.ts)

นำเข้า package/module ภายนอก: `react`

ผู้นำเข้าโดยตรง: ไม่พบในชุด source ที่ทำดัชนี; หากเป็น page/layout/route ให้ดู convention ของ Next.js หรือเป็น script/config ที่เครื่องมือเรียก

| ชื่อ | ประเภท | เปิดโค้ด |
|---|---|---|
| `VehiclesLayout` | ฟังก์ชัน / component | [บรรทัด 4](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/admin/vehicles/layout.tsx:4) |

### app/admin/vehicles/page.tsx

[app/admin/vehicles/page.tsx](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/admin/vehicles/page.tsx)

หน้า React ของ URL ตามโฟลเดอร์

นำเข้าไฟล์ในโครงการ: [lib/api.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/lib/api.ts), [lib/format.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/lib/format.ts), [lib/use-permissions.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/lib/use-permissions.ts)

นำเข้า package/module ภายนอก: `react`, `axios`, `lucide-react`

ผู้นำเข้าโดยตรง: ไม่พบในชุด source ที่ทำดัชนี; หากเป็น page/layout/route ให้ดู convention ของ Next.js หรือเป็น script/config ที่เครื่องมือเรียก

API URL ที่อ้างเป็นข้อความในไฟล์: `/api/verhicle`, `/api/verhicle-type`

| ชื่อ | ประเภท | เปิดโค้ด |
|---|---|---|
| `Vehicle` | ชนิดข้อมูล | [บรรทัด 10](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/admin/vehicles/page.tsx:10) |
| `VehicleType` | ชนิดข้อมูล | [บรรทัด 21](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/admin/vehicles/page.tsx:21) |
| `VehicleFormData` | ชนิดข้อมูล | [บรรทัด 26](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/admin/vehicles/page.tsx:26) |
| `VehicleTypeFormData` | ชนิดข้อมูล | [บรรทัด 33](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/admin/vehicles/page.tsx:33) |
| `getErrorMessage` | ฟังก์ชัน / component | [บรรทัด 55](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/admin/vehicles/page.tsx:55) |
| `AdminVehiclesPage` | ฟังก์ชัน / component | [บรรทัด 63](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/admin/vehicles/page.tsx:63) |
| `fetchVehicles` | ฟังก์ชัน / callback | [บรรทัด 81](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/admin/vehicles/page.tsx:81) |
| `fetchVehicleTypes` | ฟังก์ชัน / callback | [บรรทัด 94](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/admin/vehicles/page.tsx:94) |
| `resetForm` | ฟังก์ชัน / callback | [บรรทัด 103](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/admin/vehicles/page.tsx:103) |
| `resetTypeForm` | ฟังก์ชัน / callback | [บรรทัด 109](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/admin/vehicles/page.tsx:109) |
| `closeVehicleModal` | ฟังก์ชัน / callback | [บรรทัด 115](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/admin/vehicles/page.tsx:115) |
| `closeTypeModal` | ฟังก์ชัน / callback | [บรรทัด 120](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/admin/vehicles/page.tsx:120) |
| `createVehicle` | ฟังก์ชัน / callback | [บรรทัด 125](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/admin/vehicles/page.tsx:125) |
| `updateVehicle` | ฟังก์ชัน / callback | [บรรทัด 141](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/admin/vehicles/page.tsx:141) |
| `deleteVehicle` | ฟังก์ชัน / callback | [บรรทัด 166](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/admin/vehicles/page.tsx:166) |
| `createVehicleType` | ฟังก์ชัน / callback | [บรรทัด 184](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/admin/vehicles/page.tsx:184) |
| `updateVehicleType` | ฟังก์ชัน / callback | [บรรทัด 203](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/admin/vehicles/page.tsx:203) |
| `deleteVehicleType` | ฟังก์ชัน / callback | [บรรทัด 228](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/admin/vehicles/page.tsx:228) |
| `openEditModal` | ฟังก์ชัน / callback | [บรรทัด 246](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/admin/vehicles/page.tsx:246) |
| `openCreateModal` | ฟังก์ชัน / callback | [บรรทัด 258](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/admin/vehicles/page.tsx:258) |
| `openEditTypeModal` | ฟังก์ชัน / callback | [บรรทัด 263](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/admin/vehicles/page.tsx:263) |
| `openCreateTypeModal` | ฟังก์ชัน / callback | [บรรทัด 270](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/admin/vehicles/page.tsx:270) |

### app/api/admin/bookings/change-vehicle/route.ts

[app/api/admin/bookings/change-vehicle/route.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/api/admin/bookings/change-vehicle/route.ts)

Route Handler ที่ Next.js เรียกตาม URL และ HTTP method

นำเข้าไฟล์ในโครงการ: [app/generated/prisma/client.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/generated/prisma/client.ts), [lib/email/bookingNotifications.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/lib/email/bookingNotifications.ts), [lib/permissions.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/lib/permissions.ts), [lib/prisma.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/lib/prisma.ts)

นำเข้า package/module ภายนอก: `next/server`

ผู้นำเข้าโดยตรง: [app/api/admin/bookings/change-vehicle/__tests__/route.test.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/api/admin/bookings/change-vehicle/__tests__/route.test.ts:2)

| ชื่อ | ประเภท | เปิดโค้ด |
|---|---|---|
| `ChangeVehicleError` | class | [บรรทัด 10](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/api/admin/bookings/change-vehicle/route.ts:10) |
| `assertReplaceableBooking` | ฟังก์ชัน / component | [บรรทัด 20](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/api/admin/bookings/change-vehicle/route.ts:20) |
| `errorResponse` | ฟังก์ชัน / component | [บรรทัด 56](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/api/admin/bookings/change-vehicle/route.ts:56) |
| `GET` | ฟังก์ชัน / component | [บรรทัด 83](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/api/admin/bookings/change-vehicle/route.ts:83) |
| `PUT` | ฟังก์ชัน / component | [บรรทัด 154](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/api/admin/bookings/change-vehicle/route.ts:154) |

### app/api/admin/bookings/pickup/route.ts

[app/api/admin/bookings/pickup/route.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/api/admin/bookings/pickup/route.ts)

Route Handler ที่ Next.js เรียกตาม URL และ HTTP method

นำเข้าไฟล์ในโครงการ: [lib/prisma.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/lib/prisma.ts), [lib/permissions.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/lib/permissions.ts), [lib/email/bookingNotifications.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/lib/email/bookingNotifications.ts)

นำเข้า package/module ภายนอก: `next/server`

ผู้นำเข้าโดยตรง: ไม่พบในชุด source ที่ทำดัชนี; หากเป็น page/layout/route ให้ดู convention ของ Next.js หรือเป็น script/config ที่เครื่องมือเรียก

| ชื่อ | ประเภท | เปิดโค้ด |
|---|---|---|
| `PUT` | ฟังก์ชัน / component | [บรรทัด 10](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/api/admin/bookings/pickup/route.ts:10) |

### app/api/admin/bookings/return/route.ts

[app/api/admin/bookings/return/route.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/api/admin/bookings/return/route.ts)

Route Handler ที่ Next.js เรียกตาม URL และ HTTP method

นำเข้าไฟล์ในโครงการ: [lib/prisma.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/lib/prisma.ts), [lib/permissions.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/lib/permissions.ts), [lib/email/bookingNotifications.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/lib/email/bookingNotifications.ts)

นำเข้า package/module ภายนอก: `next/server`

ผู้นำเข้าโดยตรง: ไม่พบในชุด source ที่ทำดัชนี; หากเป็น page/layout/route ให้ดู convention ของ Next.js หรือเป็น script/config ที่เครื่องมือเรียก

| ชื่อ | ประเภท | เปิดโค้ด |
|---|---|---|
| `PUT` | ฟังก์ชัน / component | [บรรทัด 10](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/api/admin/bookings/return/route.ts:10) |

### app/api/admin/bookings/route.ts

[app/api/admin/bookings/route.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/api/admin/bookings/route.ts)

Route Handler ที่ Next.js เรียกตาม URL และ HTTP method

นำเข้าไฟล์ในโครงการ: [lib/prisma.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/lib/prisma.ts), [lib/permissions.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/lib/permissions.ts), [lib/email/bookingNotifications.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/lib/email/bookingNotifications.ts), [lib/email/templates.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/lib/email/templates.ts), [app/generated/prisma/client.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/generated/prisma/client.ts)

นำเข้า package/module ภายนอก: `next/server`

ผู้นำเข้าโดยตรง: [app/api/admin/bookings/__tests__/route.test.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/api/admin/bookings/__tests__/route.test.ts:2)

| ชื่อ | ประเภท | เปิดโค้ด |
|---|---|---|
| `GET` | ฟังก์ชัน / component | [บรรทัด 9](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/api/admin/bookings/route.ts:9) |
| `PUT` | ฟังก์ชัน / component | [บรรทัด 92](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/api/admin/bookings/route.ts:92) |
| `DELETE` | ฟังก์ชัน / component | [บรรทัด 224](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/api/admin/bookings/route.ts:224) |

### app/api/admin/maintenance/route.ts

[app/api/admin/maintenance/route.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/api/admin/maintenance/route.ts)

Route Handler ที่ Next.js เรียกตาม URL และ HTTP method

นำเข้าไฟล์ในโครงการ: [lib/prisma.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/lib/prisma.ts), [lib/permissions.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/lib/permissions.ts), [app/generated/prisma/client.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/generated/prisma/client.ts), [lib/syncStatuses.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/lib/syncStatuses.ts)

นำเข้า package/module ภายนอก: `next/server`

ผู้นำเข้าโดยตรง: [app/api/admin/maintenance/__tests__/route.test.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/api/admin/maintenance/__tests__/route.test.ts:2)

| ชื่อ | ประเภท | เปิดโค้ด |
|---|---|---|
| `MaintenanceInputError` | class | [บรรทัด 7](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/api/admin/maintenance/route.ts:7) |
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

Route Handler ที่ Next.js เรียกตาม URL และ HTTP method

นำเข้าไฟล์ในโครงการ: [lib/prisma.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/lib/prisma.ts), [lib/permissions.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/lib/permissions.ts)

นำเข้า package/module ภายนอก: `next/server`

ผู้นำเข้าโดยตรง: [app/api/admin/permissions/__tests__/route.test.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/api/admin/permissions/__tests__/route.test.ts:3)

| ชื่อ | ประเภท | เปิดโค้ด |
|---|---|---|
| `GET` | ฟังก์ชัน / component | [บรรทัด 30](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/api/admin/permissions/route.ts:30) |
| `PUT` | ฟังก์ชัน / component | [บรรทัด 68](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/api/admin/permissions/route.ts:68) |

### app/api/admin/vehicles/history/analysis/route.ts

[app/api/admin/vehicles/history/analysis/route.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/api/admin/vehicles/history/analysis/route.ts)

Route Handler ที่ Next.js เรียกตาม URL และ HTTP method

นำเข้าไฟล์ในโครงการ: [lib/prisma.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/lib/prisma.ts), [lib/permissions.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/lib/permissions.ts), [lib/ai/vehicle-usage-summary/index.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/lib/ai/vehicle-usage-summary/index.ts), [lib/vehicle-usage-analysis/index.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/lib/vehicle-usage-analysis/index.ts)

นำเข้า package/module ภายนอก: `next/server`, `zod`

ผู้นำเข้าโดยตรง: [app/api/admin/vehicles/history/analysis/__tests__/route.test.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/api/admin/vehicles/history/analysis/__tests__/route.test.ts:2)

| ชื่อ | ประเภท | เปิดโค้ด |
|---|---|---|
| `CachedSummary` | ชนิดข้อมูล | [บรรทัด 27](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/api/admin/vehicles/history/analysis/route.ts:27) |
| `getCachedSummary` | ฟังก์ชัน / component | [บรรทัด 35](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/api/admin/vehicles/history/analysis/route.ts:35) |
| `setCachedSummary` | ฟังก์ชัน / component | [บรรทัด 45](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/api/admin/vehicles/history/analysis/route.ts:45) |
| `recordRun` | ฟังก์ชัน / component | [บรรทัด 62](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/api/admin/vehicles/history/analysis/route.ts:62) |
| `POST` | ฟังก์ชัน / component | [บรรทัด 79](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/api/admin/vehicles/history/analysis/route.ts:79) |

### app/api/admin/vehicles/history/details/route.ts

[app/api/admin/vehicles/history/details/route.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/api/admin/vehicles/history/details/route.ts)

Route Handler ที่ Next.js เรียกตาม URL และ HTTP method

นำเข้าไฟล์ในโครงการ: [lib/permissions.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/lib/permissions.ts), [lib/vehicle-history-details/index.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/lib/vehicle-history-details/index.ts), [lib/vehicle-usage-analysis/index.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/lib/vehicle-usage-analysis/index.ts)

นำเข้า package/module ภายนอก: `next/server`

ผู้นำเข้าโดยตรง: [app/api/admin/vehicles/history/details/__tests__/route.test.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/api/admin/vehicles/history/details/__tests__/route.test.ts:3)

| ชื่อ | ประเภท | เปิดโค้ด |
|---|---|---|
| `parsePositiveInteger` | ฟังก์ชัน / component | [บรรทัด 13](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/api/admin/vehicles/history/details/route.ts:13) |
| `GET` | ฟังก์ชัน / component | [บรรทัด 21](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/api/admin/vehicles/history/details/route.ts:21) |

### app/api/admin/vehicles/history/route.ts

[app/api/admin/vehicles/history/route.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/api/admin/vehicles/history/route.ts)

Route Handler ที่ Next.js เรียกตาม URL และ HTTP method

นำเข้าไฟล์ในโครงการ: [lib/permissions.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/lib/permissions.ts), [lib/vehicle-usage-analysis/index.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/lib/vehicle-usage-analysis/index.ts)

นำเข้า package/module ภายนอก: `next/server`

ผู้นำเข้าโดยตรง: ไม่พบในชุด source ที่ทำดัชนี; หากเป็น page/layout/route ให้ดู convention ของ Next.js หรือเป็น script/config ที่เครื่องมือเรียก

| ชื่อ | ประเภท | เปิดโค้ด |
|---|---|---|
| `GET` | ฟังก์ชัน / component | [บรรทัด 8](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/api/admin/vehicles/history/route.ts:8) |

### app/api/approver/route.ts

[app/api/approver/route.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/api/approver/route.ts)

Route Handler ที่ Next.js เรียกตาม URL และ HTTP method

นำเข้าไฟล์ในโครงการ: [lib/prisma.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/lib/prisma.ts), [lib/permissions.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/lib/permissions.ts), [lib/email/bookingNotifications.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/lib/email/bookingNotifications.ts), [app/generated/prisma/client.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/generated/prisma/client.ts)

นำเข้า package/module ภายนอก: `next/server`

ผู้นำเข้าโดยตรง: [app/api/approver/__tests__/route.test.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/api/approver/__tests__/route.test.ts:2)

| ชื่อ | ประเภท | เปิดโค้ด |
|---|---|---|
| `GET` | ฟังก์ชัน / component | [บรรทัด 30](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/api/approver/route.ts:30) |
| `PUT` | ฟังก์ชัน / component | [บรรทัด 88](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/api/approver/route.ts:88) |

### app/api/auth/login/route.ts

[app/api/auth/login/route.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/api/auth/login/route.ts)

Route Handler ที่ Next.js เรียกตาม URL และ HTTP method

นำเข้าไฟล์ในโครงการ: [lib/prisma.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/lib/prisma.ts)

นำเข้า package/module ภายนอก: `next/server`, `bcryptjs`, `jsonwebtoken`

ผู้นำเข้าโดยตรง: [app/api/auth/login/__tests__/route.test.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/api/auth/login/__tests__/route.test.ts:2)

| ชื่อ | ประเภท | เปิดโค้ด |
|---|---|---|
| `POST` | ฟังก์ชัน / component | [บรรทัด 6](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/api/auth/login/route.ts:6) |

### app/api/auth/logout/route.ts

[app/api/auth/logout/route.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/api/auth/logout/route.ts)

Route Handler ที่ Next.js เรียกตาม URL และ HTTP method

นำเข้า package/module ภายนอก: `next/server`

ผู้นำเข้าโดยตรง: ไม่พบในชุด source ที่ทำดัชนี; หากเป็น page/layout/route ให้ดู convention ของ Next.js หรือเป็น script/config ที่เครื่องมือเรียก

| ชื่อ | ประเภท | เปิดโค้ด |
|---|---|---|
| `POST` | ฟังก์ชัน / component | [บรรทัด 3](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/api/auth/logout/route.ts:3) |

### app/api/auth/me/route.ts

[app/api/auth/me/route.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/api/auth/me/route.ts)

Route Handler ที่ Next.js เรียกตาม URL และ HTTP method

นำเข้าไฟล์ในโครงการ: [lib/prisma.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/lib/prisma.ts), [lib/auth.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/lib/auth.ts), [lib/permissions.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/lib/permissions.ts)

นำเข้า package/module ภายนอก: `next/server`

ผู้นำเข้าโดยตรง: ไม่พบในชุด source ที่ทำดัชนี; หากเป็น page/layout/route ให้ดู convention ของ Next.js หรือเป็น script/config ที่เครื่องมือเรียก

| ชื่อ | ประเภท | เปิดโค้ด |
|---|---|---|
| `GET` | ฟังก์ชัน / component | [บรรทัด 8](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/api/auth/me/route.ts:8) |

### app/api/booking/pickup/route.ts

[app/api/booking/pickup/route.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/api/booking/pickup/route.ts)

Route Handler ที่ Next.js เรียกตาม URL และ HTTP method

นำเข้าไฟล์ในโครงการ: [lib/prisma.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/lib/prisma.ts), [lib/permissions.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/lib/permissions.ts), [lib/email/bookingNotifications.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/lib/email/bookingNotifications.ts)

นำเข้า package/module ภายนอก: `next/server`

ผู้นำเข้าโดยตรง: ไม่พบในชุด source ที่ทำดัชนี; หากเป็น page/layout/route ให้ดู convention ของ Next.js หรือเป็น script/config ที่เครื่องมือเรียก

| ชื่อ | ประเภท | เปิดโค้ด |
|---|---|---|
| `PUT` | ฟังก์ชัน / component | [บรรทัด 10](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/api/booking/pickup/route.ts:10) |

### app/api/booking/return/route.ts

[app/api/booking/return/route.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/api/booking/return/route.ts)

Route Handler ที่ Next.js เรียกตาม URL และ HTTP method

นำเข้าไฟล์ในโครงการ: [lib/prisma.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/lib/prisma.ts), [lib/permissions.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/lib/permissions.ts), [lib/email/bookingNotifications.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/lib/email/bookingNotifications.ts)

นำเข้า package/module ภายนอก: `next/server`

ผู้นำเข้าโดยตรง: ไม่พบในชุด source ที่ทำดัชนี; หากเป็น page/layout/route ให้ดู convention ของ Next.js หรือเป็น script/config ที่เครื่องมือเรียก

| ชื่อ | ประเภท | เปิดโค้ด |
|---|---|---|
| `PUT` | ฟังก์ชัน / component | [บรรทัด 10](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/api/booking/return/route.ts:10) |

### app/api/booking/route.ts

[app/api/booking/route.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/api/booking/route.ts)

Route Handler ที่ Next.js เรียกตาม URL และ HTTP method

นำเข้าไฟล์ในโครงการ: [lib/prisma.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/lib/prisma.ts), [lib/permissions.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/lib/permissions.ts), [lib/syncStatuses.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/lib/syncStatuses.ts), [lib/email/bookingNotifications.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/lib/email/bookingNotifications.ts)

นำเข้า package/module ภายนอก: `next/server`

ผู้นำเข้าโดยตรง: [app/api/booking/__tests__/route.test.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/api/booking/__tests__/route.test.ts:2)

| ชื่อ | ประเภท | เปิดโค้ด |
|---|---|---|
| `BookingInputError` | class | [บรรทัด 9](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/api/booking/route.ts:9) |
| `normalizeDestination` | ฟังก์ชัน / component | [บรรทัด 11](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/api/booking/route.ts:11) |
| `bookingInputErrorResponse` | ฟังก์ชัน / component | [บรรทัด 27](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/api/booking/route.ts:27) |
| `GET` | ฟังก์ชัน / component | [บรรทัด 35](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/api/booking/route.ts:35) |
| `POST` | ฟังก์ชัน / component | [บรรทัด 113](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/api/booking/route.ts:113) |
| `PUT` | ฟังก์ชัน / component | [บรรทัด 220](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/api/booking/route.ts:220) |
| `PATCH` | ฟังก์ชัน / component | [บรรทัด 277](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/api/booking/route.ts:277) |

### app/api/notifications/route.ts

[app/api/notifications/route.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/api/notifications/route.ts)

Route Handler ที่ Next.js เรียกตาม URL และ HTTP method

นำเข้าไฟล์ในโครงการ: [lib/prisma.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/lib/prisma.ts), [lib/auth.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/lib/auth.ts)

นำเข้า package/module ภายนอก: `next/server`

ผู้นำเข้าโดยตรง: [app/api/notifications/__tests__/route.test.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/api/notifications/__tests__/route.test.ts:2)

| ชื่อ | ประเภท | เปิดโค้ด |
|---|---|---|
| `GET` | ฟังก์ชัน / component | [บรรทัด 7](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/api/notifications/route.ts:7) |
| `PATCH` | ฟังก์ชัน / component | [บรรทัด 50](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/api/notifications/route.ts:50) |

### app/api/user/maintenance/route.ts

[app/api/user/maintenance/route.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/api/user/maintenance/route.ts)

Route Handler ที่ Next.js เรียกตาม URL และ HTTP method

นำเข้าไฟล์ในโครงการ: [lib/prisma.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/lib/prisma.ts), [lib/permissions.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/lib/permissions.ts), [app/generated/prisma/client.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/generated/prisma/client.ts), [lib/email/maintenanceNotifications.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/lib/email/maintenanceNotifications.ts)

นำเข้า package/module ภายนอก: `next/server`

ผู้นำเข้าโดยตรง: [app/api/user/maintenance/__tests__/route.test.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/api/user/maintenance/__tests__/route.test.ts:2)

| ชื่อ | ประเภท | เปิดโค้ด |
|---|---|---|
| `GET` | ฟังก์ชัน / component | [บรรทัด 8](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/api/user/maintenance/route.ts:8) |
| `POST` | ฟังก์ชัน / component | [บรรทัด 32](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/api/user/maintenance/route.ts:32) |

### app/api/user/route.ts

[app/api/user/route.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/api/user/route.ts)

Route Handler ที่ Next.js เรียกตาม URL และ HTTP method

นำเข้าไฟล์ในโครงการ: [lib/prisma.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/lib/prisma.ts), [lib/permissions.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/lib/permissions.ts)

นำเข้า package/module ภายนอก: `next/server`, `bcrypt`

ผู้นำเข้าโดยตรง: [app/api/user/__tests__/route.test.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/api/user/__tests__/route.test.ts:3)

| ชื่อ | ประเภท | เปิดโค้ด |
|---|---|---|
| `hasHistory` | ฟังก์ชัน / component | [บรรทัด 36](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/api/user/route.ts:36) |
| `isPrismaNotFound` | ฟังก์ชัน / component | [บรรทัด 46](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/api/user/route.ts:46) |
| `GET` | ฟังก์ชัน / component | [บรรทัด 55](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/api/user/route.ts:55) |
| `POST` | ฟังก์ชัน / component | [บรรทัด 87](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/api/user/route.ts:87) |
| `PUT` | ฟังก์ชัน / component | [บรรทัด 114](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/api/user/route.ts:114) |
| `PATCH` | ฟังก์ชัน / component | [บรรทัด 171](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/api/user/route.ts:171) |
| `DELETE` | ฟังก์ชัน / component | [บรรทัด 247](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/api/user/route.ts:247) |

### app/api/vehicles/recommend/route.ts

[app/api/vehicles/recommend/route.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/api/vehicles/recommend/route.ts)

Route Handler ที่ Next.js เรียกตาม URL และ HTTP method

นำเข้าไฟล์ในโครงการ: [lib/prisma.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/lib/prisma.ts), [lib/permissions.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/lib/permissions.ts)

นำเข้า package/module ภายนอก: `next/server`

ผู้นำเข้าโดยตรง: ไม่พบในชุด source ที่ทำดัชนี; หากเป็น page/layout/route ให้ดู convention ของ Next.js หรือเป็น script/config ที่เครื่องมือเรียก

| ชื่อ | ประเภท | เปิดโค้ด |
|---|---|---|
| `GET` | ฟังก์ชัน / component | [บรรทัด 10](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/api/vehicles/recommend/route.ts:10) |

### app/api/verhicle-type/route.ts

[app/api/verhicle-type/route.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/api/verhicle-type/route.ts)

Route Handler ที่ Next.js เรียกตาม URL และ HTTP method

นำเข้าไฟล์ในโครงการ: [lib/prisma.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/lib/prisma.ts), [lib/permissions.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/lib/permissions.ts)

นำเข้า package/module ภายนอก: `next/server`

ผู้นำเข้าโดยตรง: [app/api/verhicle-type/__tests__/route.test.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/api/verhicle-type/__tests__/route.test.ts:2)

| ชื่อ | ประเภท | เปิดโค้ด |
|---|---|---|
| `GET` | ฟังก์ชัน / component | [บรรทัด 6](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/api/verhicle-type/route.ts:6) |
| `POST` | ฟังก์ชัน / component | [บรรทัด 18](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/api/verhicle-type/route.ts:18) |
| `PUT` | ฟังก์ชัน / component | [บรรทัด 31](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/api/verhicle-type/route.ts:31) |
| `DELETE` | ฟังก์ชัน / component | [บรรทัด 44](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/api/verhicle-type/route.ts:44) |

### app/api/verhicle/route.ts

[app/api/verhicle/route.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/api/verhicle/route.ts)

Route Handler ที่ Next.js เรียกตาม URL และ HTTP method

นำเข้าไฟล์ในโครงการ: [lib/prisma.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/lib/prisma.ts), [lib/permissions.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/lib/permissions.ts), [lib/syncStatuses.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/lib/syncStatuses.ts)

นำเข้า package/module ภายนอก: `next/server`

ผู้นำเข้าโดยตรง: [app/api/verhicle/__tests__/route.test.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/api/verhicle/__tests__/route.test.ts:2)

| ชื่อ | ประเภท | เปิดโค้ด |
|---|---|---|
| `VehicleInputError` | class | [บรรทัด 8](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/api/verhicle/route.ts:8) |
| `parseCurrentMileage` | ฟังก์ชัน / component | [บรรทัด 10](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/api/verhicle/route.ts:10) |
| `inputErrorResponse` | ฟังก์ชัน / component | [บรรทัด 35](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/api/verhicle/route.ts:35) |
| `GET` | ฟังก์ชัน / component | [บรรทัด 43](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/api/verhicle/route.ts:43) |
| `POST` | ฟังก์ชัน / component | [บรรทัด 61](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/api/verhicle/route.ts:61) |
| `PUT` | ฟังก์ชัน / component | [บรรทัด 93](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/api/verhicle/route.ts:93) |
| `DELETE` | ฟังก์ชัน / component | [บรรทัด 128](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/api/verhicle/route.ts:128) |

### app/approver/approve/layout.tsx

[app/approver/approve/layout.tsx](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/approver/approve/layout.tsx)

Layout ที่ Next.js ใช้ห่อหน้าลูก

นำเข้าไฟล์ในโครงการ: [lib/page-access.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/lib/page-access.ts)

นำเข้า package/module ภายนอก: `react`

ผู้นำเข้าโดยตรง: ไม่พบในชุด source ที่ทำดัชนี; หากเป็น page/layout/route ให้ดู convention ของ Next.js หรือเป็น script/config ที่เครื่องมือเรียก

| ชื่อ | ประเภท | เปิดโค้ด |
|---|---|---|
| `ApproveLayout` | ฟังก์ชัน / component | [บรรทัด 4](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/approver/approve/layout.tsx:4) |

### app/approver/approve/page.tsx

[app/approver/approve/page.tsx](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/approver/approve/page.tsx)

หน้า React ของ URL ตามโฟลเดอร์

นำเข้าไฟล์ในโครงการ: [lib/api.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/lib/api.ts), [lib/format.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/lib/format.ts)

นำเข้า package/module ภายนอก: `react`, `axios`, `lucide-react`

ผู้นำเข้าโดยตรง: ไม่พบในชุด source ที่ทำดัชนี; หากเป็น page/layout/route ให้ดู convention ของ Next.js หรือเป็น script/config ที่เครื่องมือเรียก

API URL ที่อ้างเป็นข้อความในไฟล์: `/api/approver`

| ชื่อ | ประเภท | เปิดโค้ด |
|---|---|---|
| `Booking` | ชนิดข้อมูล | [บรรทัด 13](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/approver/approve/page.tsx:13) |
| `ApproverBookingsPage` | ฟังก์ชัน / component | [บรรทัด 48](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/approver/approve/page.tsx:48) |
| `fetchBookings` | ฟังก์ชัน / callback | [บรรทัด 62](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/approver/approve/page.tsx:62) |
| `openApprovalModal` | ฟังก์ชัน / callback | [บรรทัด 75](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/approver/approve/page.tsx:75) |
| `closeApprovalModal` | ฟังก์ชัน / callback | [บรรทัด 87](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/approver/approve/page.tsx:87) |
| `submitApproval` | ฟังก์ชัน / callback | [บรรทัด 93](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/approver/approve/page.tsx:93) |
| `handleKeyDown` | ฟังก์ชัน / callback | [บรรทัด 129](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/approver/approve/page.tsx:129) |

### app/approver/history/layout.tsx

[app/approver/history/layout.tsx](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/approver/history/layout.tsx)

Layout ที่ Next.js ใช้ห่อหน้าลูก

นำเข้าไฟล์ในโครงการ: [lib/page-access.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/lib/page-access.ts)

นำเข้า package/module ภายนอก: `react`

ผู้นำเข้าโดยตรง: ไม่พบในชุด source ที่ทำดัชนี; หากเป็น page/layout/route ให้ดู convention ของ Next.js หรือเป็น script/config ที่เครื่องมือเรียก

| ชื่อ | ประเภท | เปิดโค้ด |
|---|---|---|
| `ApproverHistoryLayout` | ฟังก์ชัน / component | [บรรทัด 4](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/approver/history/layout.tsx:4) |

### app/approver/history/page.tsx

[app/approver/history/page.tsx](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/approver/history/page.tsx)

หน้า React ของ URL ตามโฟลเดอร์

นำเข้าไฟล์ในโครงการ: [lib/api.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/lib/api.ts), [lib/format.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/lib/format.ts)

นำเข้า package/module ภายนอก: `react`, `lucide-react`

ผู้นำเข้าโดยตรง: ไม่พบในชุด source ที่ทำดัชนี; หากเป็น page/layout/route ให้ดู convention ของ Next.js หรือเป็น script/config ที่เครื่องมือเรียก

API URL ที่อ้างเป็นข้อความในไฟล์: `/api/approver`

| ชื่อ | ประเภท | เปิดโค้ด |
|---|---|---|
| `Booking` | ชนิดข้อมูล | [บรรทัด 12](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/approver/history/page.tsx:12) |
| `BookingStats` | ชนิดข้อมูล | [บรรทัด 42](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/approver/history/page.tsx:42) |
| `DateFilter` | ชนิดข้อมูล | [บรรทัด 48](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/approver/history/page.tsx:48) |
| `buildStats` | ฟังก์ชัน / component | [บรรทัด 70](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/approver/history/page.tsx:70) |
| `filterByDate` | ฟังก์ชัน / component | [บรรทัด 79](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/approver/history/page.tsx:79) |
| `ApprovalHistoryPage` | ฟังก์ชัน / component | [บรรทัด 97](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/approver/history/page.tsx:97) |
| `fetchHistory` | ฟังก์ชัน / callback | [บรรทัด 108](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/approver/history/page.tsx:108) |
| `viewDetails` | ฟังก์ชัน / callback | [บรรทัด 137](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/approver/history/page.tsx:137) |
| `closeDetailModal` | ฟังก์ชัน / callback | [บรรทัด 142](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/approver/history/page.tsx:142) |
| `handleKeyDown` | ฟังก์ชัน / callback | [บรรทัด 188](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/approver/history/page.tsx:188) |

### app/approver/layout.tsx

[app/approver/layout.tsx](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/approver/layout.tsx)

Layout ที่ Next.js ใช้ห่อหน้าลูก

นำเข้าไฟล์ในโครงการ: [lib/page-access.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/lib/page-access.ts)

นำเข้า package/module ภายนอก: `react`

ผู้นำเข้าโดยตรง: ไม่พบในชุด source ที่ทำดัชนี; หากเป็น page/layout/route ให้ดู convention ของ Next.js หรือเป็น script/config ที่เครื่องมือเรียก

| ชื่อ | ประเภท | เปิดโค้ด |
|---|---|---|
| `ApproverLayout` | ฟังก์ชัน / component | [บรรทัด 4](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/approver/layout.tsx:4) |

### app/approver/page.tsx

[app/approver/page.tsx](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/approver/page.tsx)

หน้า React ของ URL ตามโฟลเดอร์

นำเข้าไฟล์ในโครงการ: [lib/api.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/lib/api.ts), [app/component/role-dashboard.tsx](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/component/role-dashboard.tsx)

นำเข้า package/module ภายนอก: `lucide-react`, `react`

ผู้นำเข้าโดยตรง: ไม่พบในชุด source ที่ทำดัชนี; หากเป็น page/layout/route ให้ดู convention ของ Next.js หรือเป็น script/config ที่เครื่องมือเรียก

API URL ที่อ้างเป็นข้อความในไฟล์: `/api/approver`, `/api/auth/me`

| ชื่อ | ประเภท | เปิดโค้ด |
|---|---|---|
| `ApproverPage` | ฟังก์ชัน / component | [บรรทัด 11](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/approver/page.tsx:11) |
| `fetchData` | ฟังก์ชัน / callback | [บรรทัด 17](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/approver/page.tsx:17) |

### app/component/navbar.tsx

[app/component/navbar.tsx](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/component/navbar.tsx)

ข้อมูลผู้ใช้ logout และ polling notification

นำเข้าไฟล์ในโครงการ: [lib/format.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/lib/format.ts), [lib/api.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/lib/api.ts)

นำเข้า package/module ภายนอก: `react`, `lucide-react`, `next/navigation`, `axios`

ผู้นำเข้าโดยตรง: [app/layout.tsx](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/layout.tsx:3)

API URL ที่อ้างเป็นข้อความในไฟล์: `/api/auth/logout`, `/api/auth/me`, `/api/notifications`

| ชื่อ | ประเภท | เปิดโค้ด |
|---|---|---|
| `User` | ชนิดข้อมูล | [บรรทัด 10](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/component/navbar.tsx:10) |
| `NotificationItem` | ชนิดข้อมูล | [บรรทัด 17](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/component/navbar.tsx:17) |
| `Navbar` | ฟังก์ชัน / component | [บรรทัด 27](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/component/navbar.tsx:27) |
| `fetchUser` | ฟังก์ชัน / callback | [บรรทัด 45](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/component/navbar.tsx:45) |
| `fetchNotifications` | ฟังก์ชัน / callback | [บรรทัด 65](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/component/navbar.tsx:65) |
| `handlePointerDown` | ฟังก์ชัน / callback | [บรรทัด 91](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/component/navbar.tsx:91) |
| `handleKeyDown` | ฟังก์ชัน / callback | [บรรทัด 99](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/component/navbar.tsx:99) |
| `handleLogout` | ฟังก์ชัน / callback | [บรรทัด 115](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/component/navbar.tsx:115) |
| `openNotification` | ฟังก์ชัน / callback | [บรรทัด 123](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/component/navbar.tsx:123) |
| `markAllAsRead` | ฟังก์ชัน / callback | [บรรทัด 148](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/component/navbar.tsx:148) |

### app/component/role-dashboard.tsx

[app/component/role-dashboard.tsx](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/component/role-dashboard.tsx)

การ์ดเมนูร่วมของ dashboard สามบทบาท

นำเข้า package/module ภายนอก: `lucide-react`, `next/navigation`

ผู้นำเข้าโดยตรง: [app/admin/page.tsx](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/admin/page.tsx:6), [app/approver/page.tsx](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/approver/page.tsx:6), [app/user/page.tsx](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/user/page.tsx:6)

| ชื่อ | ประเภท | เปิดโค้ด |
|---|---|---|
| `DashboardMenuItem` | ชนิดข้อมูล | [บรรทัด 7](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/component/role-dashboard.tsx:7) |
| `RoleDashboardProps` | ชนิดข้อมูล | [บรรทัด 17](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/component/role-dashboard.tsx:17) |
| `DashboardLoading` | ฟังก์ชัน / component | [บรรทัด 34](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/component/role-dashboard.tsx:34) |
| `RoleDashboard` | ฟังก์ชัน / component | [บรรทัด 52](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/component/role-dashboard.tsx:52) |

### app/forbidden/page.tsx

[app/forbidden/page.tsx](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/forbidden/page.tsx)

หน้า React ของ URL ตามโฟลเดอร์

นำเข้า package/module ภายนอก: `next/link`, `lucide-react`

ผู้นำเข้าโดยตรง: ไม่พบในชุด source ที่ทำดัชนี; หากเป็น page/layout/route ให้ดู convention ของ Next.js หรือเป็น script/config ที่เครื่องมือเรียก

| ชื่อ | ประเภท | เปิดโค้ด |
|---|---|---|
| `ForbiddenPage` | ฟังก์ชัน / component | [บรรทัด 4](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/forbidden/page.tsx:4) |

### app/layout.tsx

[app/layout.tsx](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/layout.tsx)

Layout ที่ Next.js ใช้ห่อหน้าลูก

นำเข้าไฟล์ในโครงการ: [app/globals.css](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/globals.css), [app/component/navbar.tsx](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/component/navbar.tsx)

นำเข้า package/module ภายนอก: `next`

ผู้นำเข้าโดยตรง: ไม่พบในชุด source ที่ทำดัชนี; หากเป็น page/layout/route ให้ดู convention ของ Next.js หรือเป็น script/config ที่เครื่องมือเรียก

| ชื่อ | ประเภท | เปิดโค้ด |
|---|---|---|
| `RootLayout` | ฟังก์ชัน / component | [บรรทัด 10](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/layout.tsx:10) |

### app/page.tsx

[app/page.tsx](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/page.tsx)

หน้า React ของ URL ตามโฟลเดอร์

นำเข้าไฟล์ในโครงการ: [lib/api.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/lib/api.ts)

นำเข้า package/module ภายนอก: `react`, `next/navigation`, `lucide-react`, `axios`, `next/image`

ผู้นำเข้าโดยตรง: ไม่พบในชุด source ที่ทำดัชนี; หากเป็น page/layout/route ให้ดู convention ของ Next.js หรือเป็น script/config ที่เครื่องมือเรียก

API URL ที่อ้างเป็นข้อความในไฟล์: `/api/auth/login`

| ชื่อ | ประเภท | เปิดโค้ด |
|---|---|---|
| `getLoginErrorMessage` | ฟังก์ชัน / component | [บรรทัด 34](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/page.tsx:34) |
| `LoginPage` | ฟังก์ชัน / component | [บรรทัด 42](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/page.tsx:42) |
| `handleLogin` | ฟังก์ชัน / callback | [บรรทัด 50](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/page.tsx:50) |
| `fillAccount` | ฟังก์ชัน / callback | [บรรทัด 69](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/page.tsx:69) |

### app/user/booking/layout.tsx

[app/user/booking/layout.tsx](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/user/booking/layout.tsx)

Layout ที่ Next.js ใช้ห่อหน้าลูก

นำเข้าไฟล์ในโครงการ: [lib/page-access.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/lib/page-access.ts)

นำเข้า package/module ภายนอก: `react`

ผู้นำเข้าโดยตรง: ไม่พบในชุด source ที่ทำดัชนี; หากเป็น page/layout/route ให้ดู convention ของ Next.js หรือเป็น script/config ที่เครื่องมือเรียก

| ชื่อ | ประเภท | เปิดโค้ด |
|---|---|---|
| `BookingLayout` | ฟังก์ชัน / component | [บรรทัด 4](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/user/booking/layout.tsx:4) |

### app/user/booking/page.tsx

[app/user/booking/page.tsx](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/user/booking/page.tsx)

หน้า React ของ URL ตามโฟลเดอร์

นำเข้าไฟล์ในโครงการ: [lib/api.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/lib/api.ts), [lib/format.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/lib/format.ts)

นำเข้า package/module ภายนอก: `react`, `axios`, `lucide-react`

ผู้นำเข้าโดยตรง: ไม่พบในชุด source ที่ทำดัชนี; หากเป็น page/layout/route ให้ดู convention ของ Next.js หรือเป็น script/config ที่เครื่องมือเรียก

API URL ที่อ้างเป็นข้อความในไฟล์: `/api/booking`, `/api/vehicles/recommend`, `/api/verhicle-type`

| ชื่อ | ประเภท | เปิดโค้ด |
|---|---|---|
| `Vehicle` | ชนิดข้อมูล | [บรรทัด 17](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/user/booking/page.tsx:17) |
| `VehicleType` | ชนิดข้อมูล | [บรรทัด 28](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/user/booking/page.tsx:28) |
| `BookingData` | ชนิดข้อมูล | [บรรทัด 30](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/user/booking/page.tsx:30) |
| `SearchDate` | ชนิดข้อมูล | [บรรทัด 38](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/user/booking/page.tsx:38) |
| `getErrorMessage` | ฟังก์ชัน / component | [บรรทัด 56](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/user/booking/page.tsx:56) |
| `getLocalDateTimeInputValue` | ฟังก์ชัน / component | [บรรทัด 61](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/user/booking/page.tsx:61) |
| `BookingPage` | ฟังก์ชัน / component | [บรรทัด 67](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/user/booking/page.tsx:67) |
| `fetchVehicleTypes` | ฟังก์ชัน / callback | [บรรทัด 80](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/user/booking/page.tsx:80) |
| `searchVehicles` | ฟังก์ชัน / callback | [บรรทัด 89](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/user/booking/page.tsx:89) |
| `openBookingForm` | ฟังก์ชัน / callback | [บรรทัด 112](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/user/booking/page.tsx:112) |
| `closeBookingForm` | ฟังก์ชัน / callback | [บรรทัด 126](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/user/booking/page.tsx:126) |
| `submitBooking` | ฟังก์ชัน / callback | [บรรทัด 132](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/user/booking/page.tsx:132) |
| `handleKeyDown` | ฟังก์ชัน / callback | [บรรทัด 167](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/user/booking/page.tsx:167) |

### app/user/layout.tsx

[app/user/layout.tsx](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/user/layout.tsx)

Layout ที่ Next.js ใช้ห่อหน้าลูก

นำเข้าไฟล์ในโครงการ: [lib/page-access.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/lib/page-access.ts)

นำเข้า package/module ภายนอก: `react`

ผู้นำเข้าโดยตรง: ไม่พบในชุด source ที่ทำดัชนี; หากเป็น page/layout/route ให้ดู convention ของ Next.js หรือเป็น script/config ที่เครื่องมือเรียก

| ชื่อ | ประเภท | เปิดโค้ด |
|---|---|---|
| `UserLayout` | ฟังก์ชัน / component | [บรรทัด 4](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/user/layout.tsx:4) |

### app/user/maintenance/layout.tsx

[app/user/maintenance/layout.tsx](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/user/maintenance/layout.tsx)

Layout ที่ Next.js ใช้ห่อหน้าลูก

นำเข้าไฟล์ในโครงการ: [lib/page-access.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/lib/page-access.ts)

นำเข้า package/module ภายนอก: `react`

ผู้นำเข้าโดยตรง: ไม่พบในชุด source ที่ทำดัชนี; หากเป็น page/layout/route ให้ดู convention ของ Next.js หรือเป็น script/config ที่เครื่องมือเรียก

| ชื่อ | ประเภท | เปิดโค้ด |
|---|---|---|
| `UserMaintenanceLayout` | ฟังก์ชัน / component | [บรรทัด 4](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/user/maintenance/layout.tsx:4) |

### app/user/maintenance/page.tsx

[app/user/maintenance/page.tsx](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/user/maintenance/page.tsx)

หน้า React ของ URL ตามโฟลเดอร์

นำเข้าไฟล์ในโครงการ: [lib/api.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/lib/api.ts), [lib/use-permissions.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/lib/use-permissions.ts), [lib/format.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/lib/format.ts)

นำเข้า package/module ภายนอก: `react`, `axios`, `lucide-react`

ผู้นำเข้าโดยตรง: ไม่พบในชุด source ที่ทำดัชนี; หากเป็น page/layout/route ให้ดู convention ของ Next.js หรือเป็น script/config ที่เครื่องมือเรียก

API URL ที่อ้างเป็นข้อความในไฟล์: `/api/user/maintenance`, `/api/verhicle`

| ชื่อ | ประเภท | เปิดโค้ด |
|---|---|---|
| `MaintenanceType` | ชนิดข้อมูล | [บรรทัด 14](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/user/maintenance/page.tsx:14) |
| `Maintenance` | ชนิดข้อมูล | [บรรทัด 16](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/user/maintenance/page.tsx:16) |
| `Vehicle` | ชนิดข้อมูล | [บรรทัด 31](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/user/maintenance/page.tsx:31) |
| `MaintenanceForm` | ชนิดข้อมูล | [บรรทัด 38](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/user/maintenance/page.tsx:38) |
| `MaintenanceStats` | ชนิดข้อมูล | [บรรทัด 45](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/user/maintenance/page.tsx:45) |
| `getLocalDateTimeInputValue` | ฟังก์ชัน / component | [บรรทัด 59](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/user/maintenance/page.tsx:59) |
| `getInitialFormData` | ฟังก์ชัน / component | [บรรทัด 65](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/user/maintenance/page.tsx:65) |
| `getErrorMessage` | ฟังก์ชัน / component | [บรรทัด 74](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/user/maintenance/page.tsx:74) |
| `buildStats` | ฟังก์ชัน / component | [บรรทัด 79](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/user/maintenance/page.tsx:79) |
| `UserMaintenancePage` | ฟังก์ชัน / component | [บรรทัด 99](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/user/maintenance/page.tsx:99) |
| `stats` | ค่าคำนวณ useMemo | [บรรทัด 111](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/user/maintenance/page.tsx:111) |
| `fetchData` | ฟังก์ชัน / callback | [บรรทัด 113](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/user/maintenance/page.tsx:113) |
| `openReportModal` | ฟังก์ชัน / callback | [บรรทัด 130](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/user/maintenance/page.tsx:130) |
| `closeReportModal` | ฟังก์ชัน / callback | [บรรทัด 137](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/user/maintenance/page.tsx:137) |
| `handleSubmit` | ฟังก์ชัน / callback | [บรรทัด 142](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/user/maintenance/page.tsx:142) |
| `handleKeyDown` | ฟังก์ชัน / callback | [บรรทัด 167](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/user/maintenance/page.tsx:167) |

### app/user/my-bookings/layout.tsx

[app/user/my-bookings/layout.tsx](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/user/my-bookings/layout.tsx)

Layout ที่ Next.js ใช้ห่อหน้าลูก

นำเข้าไฟล์ในโครงการ: [lib/page-access.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/lib/page-access.ts)

นำเข้า package/module ภายนอก: `react`

ผู้นำเข้าโดยตรง: ไม่พบในชุด source ที่ทำดัชนี; หากเป็น page/layout/route ให้ดู convention ของ Next.js หรือเป็น script/config ที่เครื่องมือเรียก

| ชื่อ | ประเภท | เปิดโค้ด |
|---|---|---|
| `MyBookingsLayout` | ฟังก์ชัน / component | [บรรทัด 4](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/user/my-bookings/layout.tsx:4) |

### app/user/my-bookings/page.tsx

[app/user/my-bookings/page.tsx](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/user/my-bookings/page.tsx)

หน้า React ของ URL ตามโฟลเดอร์

นำเข้าไฟล์ในโครงการ: [lib/api.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/lib/api.ts), [lib/use-permissions.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/lib/use-permissions.ts), [lib/format.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/lib/format.ts)

นำเข้า package/module ภายนอก: `react`, `axios`, `lucide-react`

ผู้นำเข้าโดยตรง: ไม่พบในชุด source ที่ทำดัชนี; หากเป็น page/layout/route ให้ดู convention ของ Next.js หรือเป็น script/config ที่เครื่องมือเรียก

API URL ที่อ้างเป็นข้อความในไฟล์: `/api/booking`, `/api/booking/pickup`, `/api/booking/return`

| ชื่อ | ประเภท | เปิดโค้ด |
|---|---|---|
| `Booking` | ชนิดข้อมูล | [บรรทัด 27](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/user/my-bookings/page.tsx:27) |
| `BookingStats` | ชนิดข้อมูล | [บรรทัด 48](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/user/my-bookings/page.tsx:48) |
| `EditForm` | ชนิดข้อมูล | [บรรทัด 58](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/user/my-bookings/page.tsx:58) |
| `ModalType` | ชนิดข้อมูล | [บรรทัด 66](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/user/my-bookings/page.tsx:66) |
| `getErrorMessage` | ฟังก์ชัน / component | [บรรทัด 138](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/user/my-bookings/page.tsx:138) |
| `toLocalDateTimeInputValue` | ฟังก์ชัน / component | [บรรทัด 143](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/user/my-bookings/page.tsx:143) |
| `getLocalDateTimeInputValue` | ฟังก์ชัน / component | [บรรทัด 149](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/user/my-bookings/page.tsx:149) |
| `buildStats` | ฟังก์ชัน / component | [บรรทัด 155](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/user/my-bookings/page.tsx:155) |
| `getDistance` | ฟังก์ชัน / component | [บรรทัด 168](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/user/my-bookings/page.tsx:168) |
| `MyBookingsPage` | ฟังก์ชัน / component | [บรรทัด 173](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/user/my-bookings/page.tsx:173) |
| `closeModal` | ฟังก์ชัน / callback | [บรรทัด 187](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/user/my-bookings/page.tsx:187) |
| `fetchBookings` | ฟังก์ชัน / callback | [บรรทัด 194](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/user/my-bookings/page.tsx:194) |
| `cancelBooking` | ฟังก์ชัน / callback | [บรรทัด 208](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/user/my-bookings/page.tsx:208) |
| `openDetailModal` | ฟังก์ชัน / callback | [บรรทัด 228](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/user/my-bookings/page.tsx:228) |
| `openEditModal` | ฟังก์ชัน / callback | [บรรทัด 233](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/user/my-bookings/page.tsx:233) |
| `openMileageModal` | ฟังก์ชัน / callback | [บรรทัด 247](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/user/my-bookings/page.tsx:247) |
| `handleEditSubmit` | ฟังก์ชัน / callback | [บรรทัด 255](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/user/my-bookings/page.tsx:255) |
| `handlePickup` | ฟังก์ชัน / callback | [บรรทัด 273](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/user/my-bookings/page.tsx:273) |
| `handleReturn` | ฟังก์ชัน / callback | [บรรทัด 295](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/user/my-bookings/page.tsx:295) |
| `filteredBookings` | ค่าคำนวณ useMemo | [บรรทัด 317](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/user/my-bookings/page.tsx:317) |
| `minEditEndDateTime` | ค่าคำนวณ useMemo | [บรรทัด 322](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/user/my-bookings/page.tsx:322) |
| `handleKeyDown` | ฟังก์ชัน / callback | [บรรทัด 336](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/user/my-bookings/page.tsx:336) |
| `ModalHeader` | ฟังก์ชัน / component | [บรรทัด 858](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/user/my-bookings/page.tsx:858) |
| `BookingDetailPanel` | ฟังก์ชัน / component | [บรรทัด 889](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/user/my-bookings/page.tsx:889) |
| `PrimaryButton` | ฟังก์ชัน / component | [บรรทัด 999](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/user/my-bookings/page.tsx:999) |
| `ModalActions` | ฟังก์ชัน / component | [บรรทัด 1017](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/user/my-bookings/page.tsx:1017) |
| `MileageModal` | ฟังก์ชัน / component | [บรรทัด 1048](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/user/my-bookings/page.tsx:1048) |

### app/user/page.tsx

[app/user/page.tsx](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/user/page.tsx)

หน้า React ของ URL ตามโฟลเดอร์

นำเข้าไฟล์ในโครงการ: [lib/api.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/lib/api.ts), [app/component/role-dashboard.tsx](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/component/role-dashboard.tsx)

นำเข้า package/module ภายนอก: `lucide-react`, `react`

ผู้นำเข้าโดยตรง: ไม่พบในชุด source ที่ทำดัชนี; หากเป็น page/layout/route ให้ดู convention ของ Next.js หรือเป็น script/config ที่เครื่องมือเรียก

API URL ที่อ้างเป็นข้อความในไฟล์: `/api/auth/me`

| ชื่อ | ประเภท | เปิดโค้ด |
|---|---|---|
| `UserPage` | ฟังก์ชัน / component | [บรรทัด 11](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/user/page.tsx:11) |
| `fetchMe` | ฟังก์ชัน / callback | [บรรทัด 16](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/user/page.tsx:16) |

### eslint.config.mjs

[eslint.config.mjs](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/eslint.config.mjs)

การตั้งค่าเครื่องมือพัฒนาหรือ runtime ตามบท 4

นำเข้า package/module ภายนอก: `eslint/config`, `eslint-config-next/core-web-vitals`, `eslint-config-next/typescript`

ผู้นำเข้าโดยตรง: ไม่พบในชุด source ที่ทำดัชนี; หากเป็น page/layout/route ให้ดู convention ของ Next.js หรือเป็น script/config ที่เครื่องมือเรียก

### lib/__mocks__/prisma.ts

[lib/__mocks__/prisma.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/lib/__mocks__/prisma.ts)

utility mockDeep Prisma; ไม่ใช่ DB runtime

นำเข้าไฟล์ในโครงการ: [app/generated/prisma/client.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/generated/prisma/client.ts)

นำเข้า package/module ภายนอก: `vitest-mock-extended`, `vitest`

ผู้นำเข้าโดยตรง: ไม่พบในชุด source ที่ทำดัชนี; หากเป็น page/layout/route ให้ดู convention ของ Next.js หรือเป็น script/config ที่เครื่องมือเรียก

### lib/ai/vehicle-usage-summary/generate.ts

[lib/ai/vehicle-usage-summary/generate.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/lib/ai/vehicle-usage-summary/generate.ts)

เรียก provider parse response และ validate

นำเข้าไฟล์ในโครงการ: [lib/vehicle-usage-analysis/index.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/lib/vehicle-usage-analysis/index.ts), [lib/ai/vehicle-usage-summary/payload.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/lib/ai/vehicle-usage-summary/payload.ts), [lib/ai/vehicle-usage-summary/prompt.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/lib/ai/vehicle-usage-summary/prompt.ts), [lib/ai/vehicle-usage-summary/schema.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/lib/ai/vehicle-usage-summary/schema.ts), [lib/ai/vehicle-usage-summary/validate.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/lib/ai/vehicle-usage-summary/validate.ts)

นำเข้า package/module ภายนอก: `openai`, `openai/helpers/zod`

ผู้นำเข้าโดยตรง: [lib/ai/vehicle-usage-summary/index.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/lib/ai/vehicle-usage-summary/index.ts:1)

| ชื่อ | ประเภท | เปิดโค้ด |
|---|---|---|
| `AiSummaryUnavailableError` | class | [บรรทัด 12](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/lib/ai/vehicle-usage-summary/generate.ts:12) |
| `AiGenerationMetadata` | ชนิดข้อมูล | [บรรทัด 22](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/lib/ai/vehicle-usage-summary/generate.ts:22) |
| `getOpenAiClient` | ฟังก์ชัน / component | [บรรทัด 32](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/lib/ai/vehicle-usage-summary/generate.ts:32) |
| `getStatus` | ฟังก์ชัน / component | [บรรทัด 43](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/lib/ai/vehicle-usage-summary/generate.ts:43) |
| `generateVehicleUsageSummary` | ฟังก์ชัน / component | [บรรทัด 47](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/lib/ai/vehicle-usage-summary/generate.ts:47) |

### lib/ai/vehicle-usage-summary/index.ts

[lib/ai/vehicle-usage-summary/index.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/lib/ai/vehicle-usage-summary/index.ts)

Barrel file รวม exports ให้ caller ใช้โมดูลผ่านชื่อโฟลเดอร์

นำเข้าไฟล์ในโครงการ: [lib/ai/vehicle-usage-summary/generate.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/lib/ai/vehicle-usage-summary/generate.ts), [lib/ai/vehicle-usage-summary/payload.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/lib/ai/vehicle-usage-summary/payload.ts), [lib/ai/vehicle-usage-summary/schema.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/lib/ai/vehicle-usage-summary/schema.ts)

ผู้นำเข้าโดยตรง: [app/api/admin/vehicles/history/analysis/__tests__/route.test.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/api/admin/vehicles/history/analysis/__tests__/route.test.ts:5), [app/api/admin/vehicles/history/analysis/route.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/api/admin/vehicles/history/analysis/route.ts:5)

### lib/ai/vehicle-usage-summary/payload.ts

[lib/ai/vehicle-usage-summary/payload.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/lib/ai/vehicle-usage-summary/payload.ts)

แปลง metrics เป็น payload, evidence, user refs และ cache hash

นำเข้าไฟล์ในโครงการ: [lib/vehicle-usage-analysis/index.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/lib/vehicle-usage-analysis/index.ts), [lib/ai/vehicle-usage-summary/schema.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/lib/ai/vehicle-usage-summary/schema.ts)

นำเข้า package/module ภายนอก: `node:crypto`

ผู้นำเข้าโดยตรง: [lib/ai/vehicle-usage-summary/__tests__/payload.test.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/lib/ai/vehicle-usage-summary/__tests__/payload.test.ts:3), [lib/ai/vehicle-usage-summary/generate.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/lib/ai/vehicle-usage-summary/generate.ts:4), [lib/ai/vehicle-usage-summary/index.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/lib/ai/vehicle-usage-summary/index.ts:2)

| ชื่อ | ประเภท | เปิดโค้ด |
|---|---|---|
| `addEvidence` | ฟังก์ชัน / component | [บรรทัด 15](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/lib/ai/vehicle-usage-summary/payload.ts:15) |
| `buildVehicleUsageAiPayload` | ฟังก์ชัน / component | [บรรทัด 26](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/lib/ai/vehicle-usage-summary/payload.ts:26) |

### lib/ai/vehicle-usage-summary/prompt.ts

[lib/ai/vehicle-usage-summary/prompt.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/lib/ai/vehicle-usage-summary/prompt.ts)

ข้อความกติกาที่ส่งให้โมเดล

ผู้นำเข้าโดยตรง: [lib/ai/vehicle-usage-summary/generate.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/lib/ai/vehicle-usage-summary/generate.ts:5)

### lib/ai/vehicle-usage-summary/schema.ts

[lib/ai/vehicle-usage-summary/schema.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/lib/ai/vehicle-usage-summary/schema.ts)

Zod schema และชนิดผลลัพธ์ AI

นำเข้า package/module ภายนอก: `zod`

ผู้นำเข้าโดยตรง: [app/admin/vehicle-history/AiUsageSummaryCard.tsx](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/admin/vehicle-history/AiUsageSummaryCard.tsx:19), [lib/ai/vehicle-usage-summary/__tests__/validate.test.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/lib/ai/vehicle-usage-summary/__tests__/validate.test.ts:2), [lib/ai/vehicle-usage-summary/generate.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/lib/ai/vehicle-usage-summary/generate.ts:6), [lib/ai/vehicle-usage-summary/index.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/lib/ai/vehicle-usage-summary/index.ts:3), [lib/ai/vehicle-usage-summary/payload.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/lib/ai/vehicle-usage-summary/payload.ts:3), [lib/ai/vehicle-usage-summary/validate.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/lib/ai/vehicle-usage-summary/validate.ts:1)

| ชื่อ | ประเภท | เปิดโค้ด |
|---|---|---|
| `VehicleUsageSummary` | ชนิดข้อมูล | [บรรทัด 29](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/lib/ai/vehicle-usage-summary/schema.ts:29) |
| `EvidenceValue` | ชนิดข้อมูล | [บรรทัด 31](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/lib/ai/vehicle-usage-summary/schema.ts:31) |
| `VehicleUsageSummaryResponse` | ชนิดข้อมูล | [บรรทัด 38](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/lib/ai/vehicle-usage-summary/schema.ts:38) |

### lib/ai/vehicle-usage-summary/validate.ts

[lib/ai/vehicle-usage-summary/validate.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/lib/ai/vehicle-usage-summary/validate.ts)

ตรวจ evidence, refs และ prose ตามกฎ

นำเข้าไฟล์ในโครงการ: [lib/ai/vehicle-usage-summary/schema.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/lib/ai/vehicle-usage-summary/schema.ts)

ผู้นำเข้าโดยตรง: [lib/ai/vehicle-usage-summary/__tests__/validate.test.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/lib/ai/vehicle-usage-summary/__tests__/validate.test.ts:3), [lib/ai/vehicle-usage-summary/generate.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/lib/ai/vehicle-usage-summary/generate.ts:10)

| ชื่อ | ประเภท | เปิดโค้ด |
|---|---|---|
| `InvalidAiSummaryError` | class | [บรรทัด 9](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/lib/ai/vehicle-usage-summary/validate.ts:9) |
| `validateAiSummary` | ฟังก์ชัน / component | [บรรทัด 11](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/lib/ai/vehicle-usage-summary/validate.ts:11) |

### lib/api.ts

[lib/api.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/lib/api.ts)

Axios กลางและการจัดการ 401

นำเข้า package/module ภายนอก: `axios`

ผู้นำเข้าโดยตรง: [app/admin/bookings/page.tsx](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/admin/bookings/page.tsx:13), [app/admin/maintenance/page.tsx](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/admin/maintenance/page.tsx:6), [app/admin/page.tsx](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/admin/page.tsx:5), [app/admin/permissions/page.tsx](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/admin/permissions/page.tsx:13), [app/admin/users/page.tsx](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/admin/users/page.tsx:7), [app/admin/vehicle-history/AiUsageSummaryCard.tsx](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/admin/vehicle-history/AiUsageSummaryCard.tsx:17), [app/admin/vehicle-history/VehicleHistoryDetails.tsx](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/admin/vehicle-history/VehicleHistoryDetails.tsx:6), [app/admin/vehicle-history/page.tsx](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/admin/vehicle-history/page.tsx:7), [app/admin/vehicles/page.tsx](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/admin/vehicles/page.tsx:6), [app/approver/approve/page.tsx](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/approver/approve/page.tsx:6), [app/approver/history/page.tsx](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/approver/history/page.tsx:5), [app/approver/page.tsx](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/approver/page.tsx:5), [app/component/navbar.tsx](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/component/navbar.tsx:8), [app/page.tsx](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/page.tsx:8), [app/user/booking/page.tsx](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/user/booking/page.tsx:14), [app/user/maintenance/page.tsx](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/user/maintenance/page.tsx:6), [app/user/my-bookings/page.tsx](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/user/my-bookings/page.tsx:19), [app/user/page.tsx](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/user/page.tsx:5), [lib/use-permissions.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/lib/use-permissions.ts:4)

### lib/auth.ts

[lib/auth.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/lib/auth.ts)

ตรวจ JWT และสถานะบัญชีล่าสุดจากฐานข้อมูล

นำเข้าไฟล์ในโครงการ: [lib/prisma.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/lib/prisma.ts)

นำเข้า package/module ภายนอก: `next/server`, `jsonwebtoken`

ผู้นำเข้าโดยตรง: [app/api/auth/me/route.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/api/auth/me/route.ts:3), [app/api/notifications/__tests__/route.test.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/api/notifications/__tests__/route.test.ts:3), [app/api/notifications/route.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/api/notifications/route.ts:3), [lib/__tests__/auth.test.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/lib/__tests__/auth.test.ts:4), [lib/__tests__/permissions.test.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/lib/__tests__/permissions.test.ts:3), [lib/page-access.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/lib/page-access.ts:6), [lib/permissions.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/lib/permissions.ts:4)

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

ประสาน notification ใน DB และอีเมลของ booking

นำเข้าไฟล์ในโครงการ: [lib/prisma.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/lib/prisma.ts), [lib/email/service.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/lib/email/service.ts), [lib/email/templates.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/lib/email/templates.ts)

ผู้นำเข้าโดยตรง: [app/api/admin/bookings/change-vehicle/__tests__/route.test.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/api/admin/bookings/change-vehicle/__tests__/route.test.ts:4), [app/api/admin/bookings/change-vehicle/route.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/api/admin/bookings/change-vehicle/route.ts:3), [app/api/admin/bookings/pickup/route.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/api/admin/bookings/pickup/route.ts:4), [app/api/admin/bookings/return/route.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/api/admin/bookings/return/route.ts:4), [app/api/admin/bookings/route.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/api/admin/bookings/route.ts:4), [app/api/approver/__tests__/route.test.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/api/approver/__tests__/route.test.ts:4), [app/api/approver/route.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/api/approver/route.ts:4), [app/api/booking/__tests__/route.test.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/api/booking/__tests__/route.test.ts:5), [app/api/booking/pickup/route.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/api/booking/pickup/route.ts:4), [app/api/booking/return/route.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/api/booking/return/route.ts:4), [app/api/booking/route.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/api/booking/route.ts:5)

| ชื่อ | ประเภท | เปิดโค้ด |
|---|---|---|
| `NotifyBookingEventInput` | ชนิดข้อมูล | [บรรทัด 10](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/lib/email/bookingNotifications.ts:10) |
| `getBookingEventMessage` | ฟังก์ชัน / component | [บรรทัด 17](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/lib/email/bookingNotifications.ts:17) |
| `notifyBookingEvent` | ฟังก์ชัน / component | [บรรทัด 42](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/lib/email/bookingNotifications.ts:42) |
| `sendBookingEventEmail` | ฟังก์ชัน / component | [บรรทัด 60](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/lib/email/bookingNotifications.ts:60) |

### lib/email/maintenanceNotifications.ts

[lib/email/maintenanceNotifications.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/lib/email/maintenanceNotifications.ts)

template และการส่งอีเมลแจ้งซ่อมให้ Admin

นำเข้าไฟล์ในโครงการ: [lib/email/service.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/lib/email/service.ts)

ผู้นำเข้าโดยตรง: [app/api/user/maintenance/__tests__/route.test.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/api/user/maintenance/__tests__/route.test.ts:4), [app/api/user/maintenance/route.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/api/user/maintenance/route.ts:5), [lib/email/__tests__/maintenanceNotifications.test.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/lib/email/__tests__/maintenanceNotifications.test.ts:2)

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

SMTP transport และ sendEmail

นำเข้า package/module ภายนอก: `nodemailer`

ผู้นำเข้าโดยตรง: [lib/email/__tests__/maintenanceNotifications.test.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/lib/email/__tests__/maintenanceNotifications.test.ts:6), [lib/email/__tests__/service.test.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/lib/email/__tests__/service.test.ts:2), [lib/email/bookingNotifications.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/lib/email/bookingNotifications.ts:2), [lib/email/maintenanceNotifications.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/lib/email/maintenanceNotifications.ts:1)

| ชื่อ | ประเภท | เปิดโค้ด |
|---|---|---|
| `EmailPayload` | ชนิดข้อมูล | [บรรทัด 3](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/lib/email/service.ts:3) |
| `SmtpConfig` | ชนิดข้อมูล | [บรรทัด 10](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/lib/email/service.ts:10) |
| `isEmailEnabled` | ฟังก์ชัน / component | [บรรทัด 23](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/lib/email/service.ts:23) |
| `getSmtpConfig` | ฟังก์ชัน / component | [บรรทัด 27](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/lib/email/service.ts:27) |
| `getTransporter` | ฟังก์ชัน / component | [บรรทัด 47](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/lib/email/service.ts:47) |
| `sendEmail` | ฟังก์ชัน / component | [บรรทัด 60](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/lib/email/service.ts:60) |

### lib/email/templates.ts

[lib/email/templates.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/lib/email/templates.ts)

ข้อความ/HTML อีเมลการจอง

ผู้นำเข้าโดยตรง: [app/api/admin/bookings/route.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/api/admin/bookings/route.ts:5), [lib/email/__tests__/templates.test.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/lib/email/__tests__/templates.test.ts:2), [lib/email/bookingNotifications.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/lib/email/bookingNotifications.ts:3)

| ชื่อ | ประเภท | เปิดโค้ด |
|---|---|---|
| `BookingEmailEvent` | ชนิดข้อมูล | [บรรทัด 1](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/lib/email/templates.ts:1) |
| `BookingEmailData` | ชนิดข้อมูล | [บรรทัด 9](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/lib/email/templates.ts:9) |
| `BookingEmailOptions` | ชนิดข้อมูล | [บรรทัด 33](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/lib/email/templates.ts:33) |
| `BookingEmailTemplate` | ชนิดข้อมูล | [บรรทัด 40](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/lib/email/templates.ts:40) |
| `escapeHtml` | ฟังก์ชัน / component | [บรรทัด 55](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/lib/email/templates.ts:55) |
| `formatDateTime` | ฟังก์ชัน / component | [บรรทัด 64](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/lib/email/templates.ts:64) |
| `getVehicleName` | ฟังก์ชัน / component | [บรรทัด 76](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/lib/email/templates.ts:76) |
| `getActionDetail` | ฟังก์ชัน / component | [บรรทัด 83](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/lib/email/templates.ts:83) |
| `buildBookingEmail` | ฟังก์ชัน / component | [บรรทัด 108](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/lib/email/templates.ts:108) |

### lib/format.ts

[lib/format.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/lib/format.ts)

แปล enum เป็นข้อความไทย สี และ format วัน

ผู้นำเข้าโดยตรง: [app/admin/bookings/page.tsx](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/admin/bookings/page.tsx:15), [app/admin/maintenance/page.tsx](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/admin/maintenance/page.tsx:7), [app/admin/users/page.tsx](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/admin/users/page.tsx:8), [app/admin/vehicle-history/AiUsageSummaryCard.tsx](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/admin/vehicle-history/AiUsageSummaryCard.tsx:18), [app/admin/vehicle-history/VehicleHistoryDetails.tsx](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/admin/vehicle-history/VehicleHistoryDetails.tsx:7), [app/admin/vehicle-history/page.tsx](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/admin/vehicle-history/page.tsx:8), [app/admin/vehicles/page.tsx](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/admin/vehicles/page.tsx:7), [app/approver/approve/page.tsx](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/approver/approve/page.tsx:7), [app/approver/history/page.tsx](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/approver/history/page.tsx:6), [app/component/navbar.tsx](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/component/navbar.tsx:7), [app/user/booking/page.tsx](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/user/booking/page.tsx:15), [app/user/maintenance/page.tsx](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/user/maintenance/page.tsx:8), [app/user/my-bookings/page.tsx](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/user/my-bookings/page.tsx:21)

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

ตรวจสิทธิ์ Server Component ก่อนแสดงหน้าลูก

นำเข้าไฟล์ในโครงการ: [lib/auth.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/lib/auth.ts), [lib/permissions.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/lib/permissions.ts)

นำเข้า package/module ภายนอก: `server-only`, `react`, `next/headers`, `next/navigation`

ผู้นำเข้าโดยตรง: [app/admin/bookings/layout.tsx](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/admin/bookings/layout.tsx:2), [app/admin/layout.tsx](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/admin/layout.tsx:2), [app/admin/maintenance/layout.tsx](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/admin/maintenance/layout.tsx:2), [app/admin/permissions/layout.tsx](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/admin/permissions/layout.tsx:2), [app/admin/users/layout.tsx](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/admin/users/layout.tsx:2), [app/admin/vehicle-history/layout.tsx](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/admin/vehicle-history/layout.tsx:2), [app/admin/vehicles/layout.tsx](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/admin/vehicles/layout.tsx:2), [app/approver/approve/layout.tsx](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/approver/approve/layout.tsx:2), [app/approver/history/layout.tsx](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/approver/history/layout.tsx:2), [app/approver/layout.tsx](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/approver/layout.tsx:2), [app/user/booking/layout.tsx](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/user/booking/layout.tsx:2), [app/user/layout.tsx](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/user/layout.tsx:2), [app/user/maintenance/layout.tsx](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/user/maintenance/layout.tsx:2), [app/user/my-bookings/layout.tsx](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/user/my-bookings/layout.tsx:2)

| ชื่อ | ประเภท | เปิดโค้ด |
|---|---|---|
| `requirePageAccess` | ฟังก์ชัน / component | [บรรทัด 15](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/lib/page-access.ts:15) |

### lib/permissions.ts

[lib/permissions.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/lib/permissions.ts)

บังคับ role/permission และแปลง error ของสิทธิ์

นำเข้าไฟล์ในโครงการ: [lib/prisma.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/lib/prisma.ts), [lib/auth.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/lib/auth.ts)

นำเข้า package/module ภายนอก: `next/server`

ผู้นำเข้าโดยตรง: [app/api/admin/bookings/__tests__/route.test.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/api/admin/bookings/__tests__/route.test.ts:3), [app/api/admin/bookings/change-vehicle/__tests__/route.test.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/api/admin/bookings/change-vehicle/__tests__/route.test.ts:3), [app/api/admin/bookings/change-vehicle/route.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/api/admin/bookings/change-vehicle/route.ts:4), [app/api/admin/bookings/pickup/route.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/api/admin/bookings/pickup/route.ts:3), [app/api/admin/bookings/return/route.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/api/admin/bookings/return/route.ts:3), [app/api/admin/bookings/route.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/api/admin/bookings/route.ts:3), [app/api/admin/maintenance/__tests__/route.test.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/api/admin/maintenance/__tests__/route.test.ts:3), [app/api/admin/maintenance/route.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/api/admin/maintenance/route.ts:3), [app/api/admin/permissions/__tests__/route.test.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/api/admin/permissions/__tests__/route.test.ts:4), [app/api/admin/permissions/route.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/api/admin/permissions/route.ts:3), [app/api/admin/vehicles/history/analysis/__tests__/route.test.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/api/admin/vehicles/history/analysis/__tests__/route.test.ts:3), [app/api/admin/vehicles/history/analysis/route.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/api/admin/vehicles/history/analysis/route.ts:4), [app/api/admin/vehicles/history/details/__tests__/route.test.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/api/admin/vehicles/history/details/__tests__/route.test.ts:4), [app/api/admin/vehicles/history/details/route.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/api/admin/vehicles/history/details/route.ts:2), [app/api/admin/vehicles/history/route.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/api/admin/vehicles/history/route.ts:2), [app/api/approver/__tests__/route.test.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/api/approver/__tests__/route.test.ts:3), [app/api/approver/route.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/api/approver/route.ts:3), [app/api/auth/me/route.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/api/auth/me/route.ts:20), [app/api/booking/__tests__/route.test.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/api/booking/__tests__/route.test.ts:3), [app/api/booking/pickup/route.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/api/booking/pickup/route.ts:3), [app/api/booking/return/route.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/api/booking/return/route.ts:3), [app/api/booking/route.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/api/booking/route.ts:3), [app/api/user/__tests__/route.test.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/api/user/__tests__/route.test.ts:4), [app/api/user/maintenance/__tests__/route.test.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/api/user/maintenance/__tests__/route.test.ts:3), [app/api/user/maintenance/route.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/api/user/maintenance/route.ts:3), [app/api/user/route.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/api/user/route.ts:4), [app/api/vehicles/recommend/route.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/api/vehicles/recommend/route.ts:3), [app/api/verhicle-type/__tests__/route.test.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/api/verhicle-type/__tests__/route.test.ts:3), [app/api/verhicle-type/route.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/api/verhicle-type/route.ts:3), [app/api/verhicle/__tests__/route.test.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/api/verhicle/__tests__/route.test.ts:3), [app/api/verhicle/route.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/api/verhicle/route.ts:3), [lib/__tests__/permissions.test.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/lib/__tests__/permissions.test.ts:5), [lib/page-access.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/lib/page-access.ts:7)

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

เชื่อม PostgreSQL และ reuse Prisma Client

นำเข้าไฟล์ในโครงการ: [app/generated/prisma/client.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/generated/prisma/client.ts)

นำเข้า package/module ภายนอก: `dotenv/config`, `@prisma/adapter-pg`

ผู้นำเข้าโดยตรง: [app/api/admin/bookings/change-vehicle/route.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/api/admin/bookings/change-vehicle/route.ts:5), [app/api/admin/bookings/pickup/route.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/api/admin/bookings/pickup/route.ts:2), [app/api/admin/bookings/return/route.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/api/admin/bookings/return/route.ts:2), [app/api/admin/bookings/route.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/api/admin/bookings/route.ts:2), [app/api/admin/maintenance/route.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/api/admin/maintenance/route.ts:2), [app/api/admin/permissions/route.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/api/admin/permissions/route.ts:2), [app/api/admin/vehicles/history/analysis/route.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/api/admin/vehicles/history/analysis/route.ts:3), [app/api/approver/route.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/api/approver/route.ts:2), [app/api/auth/login/route.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/api/auth/login/route.ts:3), [app/api/auth/me/route.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/api/auth/me/route.ts:2), [app/api/booking/pickup/route.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/api/booking/pickup/route.ts:2), [app/api/booking/return/route.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/api/booking/return/route.ts:2), [app/api/booking/route.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/api/booking/route.ts:2), [app/api/notifications/route.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/api/notifications/route.ts:2), [app/api/user/maintenance/route.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/api/user/maintenance/route.ts:2), [app/api/user/route.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/api/user/route.ts:3), [app/api/vehicles/recommend/route.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/api/vehicles/recommend/route.ts:2), [app/api/verhicle-type/route.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/api/verhicle-type/route.ts:2), [app/api/verhicle/route.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/api/verhicle/route.ts:2), [lib/__tests__/permissions.test.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/lib/__tests__/permissions.test.ts:4), [lib/auth.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/lib/auth.ts:3), [lib/email/bookingNotifications.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/lib/email/bookingNotifications.ts:1), [lib/permissions.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/lib/permissions.ts:3), [lib/syncStatuses.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/lib/syncStatuses.ts:1), [lib/vehicle-history-details/index.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/lib/vehicle-history-details/index.ts:1), [lib/vehicle-usage-analysis/calculate.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/lib/vehicle-usage-analysis/calculate.ts:1)

### lib/syncStatuses.ts

[lib/syncStatuses.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/lib/syncStatuses.ts)

ปรับสถานะรถและงานซ่อมเมื่อ API caller เรียก

นำเข้าไฟล์ในโครงการ: [lib/prisma.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/lib/prisma.ts)

ผู้นำเข้าโดยตรง: [app/api/admin/maintenance/route.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/api/admin/maintenance/route.ts:5), [app/api/booking/__tests__/route.test.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/api/booking/__tests__/route.test.ts:4), [app/api/booking/route.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/api/booking/route.ts:4), [app/api/verhicle/route.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/api/verhicle/route.ts:4)

| ชื่อ | ประเภท | เปิดโค้ด |
|---|---|---|
| `syncAllVehicleStatuses` | ฟังก์ชัน / component | [บรรทัด 11](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/lib/syncStatuses.ts:11) |

### lib/use-permissions.ts

[lib/use-permissions.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/lib/use-permissions.ts)

โหลดสิทธิ์ให้ client ใช้แสดงหรือซ่อนปุ่ม

นำเข้าไฟล์ในโครงการ: [lib/api.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/lib/api.ts)

นำเข้า package/module ภายนอก: `react`

ผู้นำเข้าโดยตรง: [app/admin/bookings/page.tsx](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/admin/bookings/page.tsx:14), [app/admin/maintenance/page.tsx](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/admin/maintenance/page.tsx:13), [app/admin/vehicles/page.tsx](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/admin/vehicles/page.tsx:8), [app/user/maintenance/page.tsx](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/user/maintenance/page.tsx:7), [app/user/my-bookings/page.tsx](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/user/my-bookings/page.tsx:20)

API URL ที่อ้างเป็นข้อความในไฟล์: `/api/auth/me`

| ชื่อ | ประเภท | เปิดโค้ด |
|---|---|---|
| `usePermissions` | ฟังก์ชัน / component | [บรรทัด 6](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/lib/use-permissions.ts:6) |
| `hasPermission` | ฟังก์ชัน / callback | [บรรทัด 29](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/lib/use-permissions.ts:29) |

### lib/vehicle-history-details/index.ts

[lib/vehicle-history-details/index.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/lib/vehicle-history-details/index.ts)

อ่านรายละเอียดสามแท็บ เรียงและแบ่งหน้า

นำเข้าไฟล์ในโครงการ: [lib/prisma.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/lib/prisma.ts), [lib/vehicle-usage-analysis/index.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/lib/vehicle-usage-analysis/index.ts)

ผู้นำเข้าโดยตรง: [app/api/admin/vehicles/history/details/__tests__/route.test.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/api/admin/vehicles/history/details/__tests__/route.test.ts:5), [app/api/admin/vehicles/history/details/route.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/api/admin/vehicles/history/details/route.ts:3), [lib/vehicle-history-details/__tests__/index.test.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/lib/vehicle-history-details/__tests__/index.test.ts:2)

| ชื่อ | ประเภท | เปิดโค้ด |
|---|---|---|
| `HistoryDetailsTab` | ชนิดข้อมูล | [บรรทัด 7](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/lib/vehicle-history-details/index.ts:7) |
| `HistoryDetailsFilters` | ชนิดข้อมูล | [บรรทัด 9](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/lib/vehicle-history-details/index.ts:9) |
| `HistoryDetailsInputError` | class | [บรรทัด 18](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/lib/vehicle-history-details/index.ts:18) |
| `getPagination` | ฟังก์ชัน / component | [บรรทัด 41](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/lib/vehicle-history-details/index.ts:41) |
| `serializePeriod` | ฟังก์ชัน / component | [บรรทัด 51](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/lib/vehicle-history-details/index.ts:51) |
| `paginate` | ฟังก์ชัน / component | [บรรทัด 59](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/lib/vehicle-history-details/index.ts:59) |
| `bookingEffectiveDate` | ฟังก์ชัน / component | [บรรทัด 69](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/lib/vehicle-history-details/index.ts:69) |
| `getVehicleHistoryDetails` | ฟังก์ชัน / component | [บรรทัด 80](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/lib/vehicle-history-details/index.ts:80) |

### lib/vehicle-usage-analysis/calculate.ts

[lib/vehicle-usage-analysis/calculate.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/lib/vehicle-usage-analysis/calculate.ts)

คำนวณ metrics ของรถ ผู้ใช้ งานซ่อม และกลุ่มเทียบเคียง

นำเข้าไฟล์ในโครงการ: [lib/prisma.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/lib/prisma.ts), [lib/vehicle-usage-analysis/period.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/lib/vehicle-usage-analysis/period.ts), [lib/vehicle-usage-analysis/types.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/lib/vehicle-usage-analysis/types.ts)

ผู้นำเข้าโดยตรง: [lib/vehicle-usage-analysis/__tests__/calculate.test.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/lib/vehicle-usage-analysis/__tests__/calculate.test.ts:2), [lib/vehicle-usage-analysis/index.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/lib/vehicle-usage-analysis/index.ts:1)

| ชื่อ | ประเภท | เปิดโค้ด |
|---|---|---|
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

Barrel file รวม exports ให้ caller ใช้โมดูลผ่านชื่อโฟลเดอร์

นำเข้าไฟล์ในโครงการ: [lib/vehicle-usage-analysis/calculate.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/lib/vehicle-usage-analysis/calculate.ts), [lib/vehicle-usage-analysis/period.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/lib/vehicle-usage-analysis/period.ts), [lib/vehicle-usage-analysis/types.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/lib/vehicle-usage-analysis/types.ts)

ผู้นำเข้าโดยตรง: [app/api/admin/vehicles/history/analysis/__tests__/route.test.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/api/admin/vehicles/history/analysis/__tests__/route.test.ts:4), [app/api/admin/vehicles/history/analysis/route.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/api/admin/vehicles/history/analysis/route.ts:11), [app/api/admin/vehicles/history/details/route.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/api/admin/vehicles/history/details/route.ts:8), [app/api/admin/vehicles/history/route.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/api/admin/vehicles/history/route.ts:3), [lib/ai/vehicle-usage-summary/__tests__/payload.test.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/lib/ai/vehicle-usage-summary/__tests__/payload.test.ts:2), [lib/ai/vehicle-usage-summary/generate.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/lib/ai/vehicle-usage-summary/generate.ts:3), [lib/ai/vehicle-usage-summary/payload.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/lib/ai/vehicle-usage-summary/payload.ts:2), [lib/vehicle-history-details/index.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/lib/vehicle-history-details/index.ts:2)

### lib/vehicle-usage-analysis/period.ts

[lib/vehicle-usage-analysis/period.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/lib/vehicle-usage-analysis/period.ts)

ตรวจช่วงวันไทยและช่วงเปรียบเทียบ

นำเข้าไฟล์ในโครงการ: [lib/vehicle-usage-analysis/types.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/lib/vehicle-usage-analysis/types.ts)

ผู้นำเข้าโดยตรง: [lib/vehicle-usage-analysis/__tests__/period.test.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/lib/vehicle-usage-analysis/__tests__/period.test.ts:2), [lib/vehicle-usage-analysis/calculate.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/lib/vehicle-usage-analysis/calculate.ts:2), [lib/vehicle-usage-analysis/index.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/lib/vehicle-usage-analysis/index.ts:2)

| ชื่อ | ประเภท | เปิดโค้ด |
|---|---|---|
| `AnalysisInputError` | class | [บรรทัด 7](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/lib/vehicle-usage-analysis/period.ts:7) |
| `formatBangkokDate` | ฟังก์ชัน / component | [บรรทัด 9](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/lib/vehicle-usage-analysis/period.ts:9) |
| `parseBangkokDate` | ฟังก์ชัน / component | [บรรทัด 18](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/lib/vehicle-usage-analysis/period.ts:18) |
| `addDays` | ฟังก์ชัน / component | [บรรทัด 31](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/lib/vehicle-usage-analysis/period.ts:31) |
| `resolveAnalysisPeriod` | ฟังก์ชัน / component | [บรรทัด 35](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/lib/vehicle-usage-analysis/period.ts:35) |
| `isDateInPeriod` | ฟังก์ชัน / component | [บรรทัด 79](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/lib/vehicle-usage-analysis/period.ts:79) |
| `getBangkokWeekdayAndHour` | ฟังก์ชัน / component | [บรรทัด 83](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/lib/vehicle-usage-analysis/period.ts:83) |

### lib/vehicle-usage-analysis/types.ts

[lib/vehicle-usage-analysis/types.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/lib/vehicle-usage-analysis/types.ts)

ชนิด input/output ของ metrics

ผู้นำเข้าโดยตรง: [lib/vehicle-usage-analysis/calculate.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/lib/vehicle-usage-analysis/calculate.ts:7), [lib/vehicle-usage-analysis/index.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/lib/vehicle-usage-analysis/index.ts:8), [lib/vehicle-usage-analysis/period.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/lib/vehicle-usage-analysis/period.ts:1)

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

การตั้งค่าเครื่องมือพัฒนาหรือ runtime ตามบท 4

นำเข้า package/module ภายนอก: `next`

ผู้นำเข้าโดยตรง: ไม่พบในชุด source ที่ทำดัชนี; หากเป็น page/layout/route ให้ดู convention ของ Next.js หรือเป็น script/config ที่เครื่องมือเรียก

### playwright.config.ts

[playwright.config.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/playwright.config.ts)

การตั้งค่าเครื่องมือพัฒนาหรือ runtime ตามบท 4

นำเข้า package/module ภายนอก: `@playwright/test`

ผู้นำเข้าโดยตรง: ไม่พบในชุด source ที่ทำดัชนี; หากเป็น page/layout/route ให้ดู convention ของ Next.js หรือเป็น script/config ที่เครื่องมือเรียก

### postcss.config.mjs

[postcss.config.mjs](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/postcss.config.mjs)

การตั้งค่าเครื่องมือพัฒนาหรือ runtime ตามบท 4

ผู้นำเข้าโดยตรง: ไม่พบในชุด source ที่ทำดัชนี; หากเป็น page/layout/route ให้ดู convention ของ Next.js หรือเป็น script/config ที่เครื่องมือเรียก

### prisma.config.ts

[prisma.config.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/prisma.config.ts)

การตั้งค่าเครื่องมือพัฒนาหรือ runtime ตามบท 4

นำเข้า package/module ภายนอก: `dotenv/config`, `prisma/config`

ผู้นำเข้าโดยตรง: ไม่พบในชุด source ที่ทำดัชนี; หากเป็น page/layout/route ให้ดู convention ของ Next.js หรือเป็น script/config ที่เครื่องมือเรียก

### prisma/seed.ts

[prisma/seed.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/prisma/seed.ts)

เติม Admin ประเภทรถและรถตัวอย่าง

นำเข้าไฟล์ในโครงการ: [app/generated/prisma/client.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/generated/prisma/client.ts)

นำเข้า package/module ภายนอก: `dotenv/config`, `@prisma/adapter-pg`, `bcryptjs`

ผู้นำเข้าโดยตรง: ไม่พบในชุด source ที่ทำดัชนี; หากเป็น page/layout/route ให้ดู convention ของ Next.js หรือเป็น script/config ที่เครื่องมือเรียก

| ชื่อ | ประเภท | เปิดโค้ด |
|---|---|---|
| `main` | ฟังก์ชัน / component | [บรรทัด 10](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/prisma/seed.ts:10) |

### prisma/seedPermissions.ts

[prisma/seedPermissions.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/prisma/seedPermissions.ts)

upsert สิทธิ์เริ่มต้นของทุก role

นำเข้าไฟล์ในโครงการ: [app/generated/prisma/client.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/generated/prisma/client.ts)

นำเข้า package/module ภายนอก: `dotenv/config`, `@prisma/adapter-pg`

ผู้นำเข้าโดยตรง: ไม่พบในชุด source ที่ทำดัชนี; หากเป็น page/layout/route ให้ดู convention ของ Next.js หรือเป็น script/config ที่เครื่องมือเรียก

| ชื่อ | ประเภท | เปิดโค้ด |
|---|---|---|
| `main` | ฟังก์ชัน / component | [บรรทัด 35](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/prisma/seedPermissions.ts:35) |

### proxy.ts

[proxy.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/proxy.ts)

ตรวจการมี cookie ก่อนปล่อย request ตาม matcher

นำเข้า package/module ภายนอก: `next/server`

ผู้นำเข้าโดยตรง: ไม่พบในชุด source ที่ทำดัชนี; หากเป็น page/layout/route ให้ดู convention ของ Next.js หรือเป็น script/config ที่เครื่องมือเรียก

API URL ที่อ้างเป็นข้อความในไฟล์: `/api/`, `/api/:path*`, `/api/auth/login`, `/api/auth/logout`

| ชื่อ | ประเภท | เปิดโค้ด |
|---|---|---|
| `proxy` | ฟังก์ชัน / component | [บรรทัด 4](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/proxy.ts:4) |

### vitest.config.ts

[vitest.config.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/vitest.config.ts)

การตั้งค่าเครื่องมือพัฒนาหรือ runtime ตามบท 4

นำเข้า package/module ภายนอก: `vitest/config`, `path`

ผู้นำเข้าโดยตรง: ไม่พบในชุด source ที่ทำดัชนี; หากเป็น page/layout/route ให้ดู convention ของ Next.js หรือเป็น script/config ที่เครื่องมือเรียก

## ไฟล์ทดสอบและสถานการณ์

### app/api/admin/bookings/__tests__/route.test.ts

[app/api/admin/bookings/__tests__/route.test.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/api/admin/bookings/__tests__/route.test.ts)

Source ที่นำเข้าทดสอบ: [app/api/admin/bookings/route.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/api/admin/bookings/route.ts), [lib/permissions.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/lib/permissions.ts)

- [PUT /api/admin/bookings](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/api/admin/bookings/__tests__/route.test.ts:18)
- [rejects direct transition to %s because mileage is required](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/api/admin/bookings/__tests__/route.test.ts:28)

### app/api/admin/bookings/change-vehicle/__tests__/route.test.ts

[app/api/admin/bookings/change-vehicle/__tests__/route.test.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/api/admin/bookings/change-vehicle/__tests__/route.test.ts)

Source ที่นำเข้าทดสอบ: [app/api/admin/bookings/change-vehicle/route.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/api/admin/bookings/change-vehicle/route.ts), [lib/permissions.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/lib/permissions.ts), [lib/email/bookingNotifications.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/lib/email/bookingNotifications.ts)

- [PUT /api/admin/bookings/change-vehicle](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/api/admin/bookings/change-vehicle/__tests__/route.test.ts:65)
- [changes the vehicle atomically and emails the booking owner](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/api/admin/bookings/change-vehicle/__tests__/route.test.ts:79)
- [rejects a booking whose original vehicle is not in maintenance](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/api/admin/bookings/change-vehicle/__tests__/route.test.ts:144)
- [returns a conflict when the replacement became unavailable](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/api/admin/bookings/change-vehicle/__tests__/route.test.ts:174)

### app/api/admin/maintenance/__tests__/route.test.ts

[app/api/admin/maintenance/__tests__/route.test.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/api/admin/maintenance/__tests__/route.test.ts)

Source ที่นำเข้าทดสอบ: [app/api/admin/maintenance/route.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/api/admin/maintenance/route.ts), [lib/permissions.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/lib/permissions.ts)

- [GET /api/admin/maintenance](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/api/admin/maintenance/__tests__/route.test.ts:31)
- [adds overlapping active bookings to each maintenance item](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/api/admin/maintenance/__tests__/route.test.ts:41)
- [PUT /api/admin/maintenance](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/api/admin/maintenance/__tests__/route.test.ts:88)
- [persists closing details, service center and cost](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/api/admin/maintenance/__tests__/route.test.ts:112)
- [rejects a negative closing cost before updating the database](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/api/admin/maintenance/__tests__/route.test.ts:144)
- [requires an end date when closing maintenance](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/api/admin/maintenance/__tests__/route.test.ts:161)
- [POST /api/admin/maintenance](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/api/admin/maintenance/__tests__/route.test.ts:181)
- [persists optional service details when an admin creates maintenance](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/api/admin/maintenance/__tests__/route.test.ts:193)

### app/api/admin/permissions/__tests__/route.test.ts

[app/api/admin/permissions/__tests__/route.test.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/api/admin/permissions/__tests__/route.test.ts)

Source ที่นำเข้าทดสอบ: [app/api/admin/permissions/route.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/api/admin/permissions/route.ts), [lib/permissions.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/lib/permissions.ts)

- [PUT /api/admin/permissions](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/api/admin/permissions/__tests__/route.test.ts:29)
- [replaces a role matrix atomically and records its diff](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/api/admin/permissions/__tests__/route.test.ts:46)
- [rejects unknown permissions before changing the database](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/api/admin/permissions/__tests__/route.test.ts:79)
- [prevents removing the permission-management bootstrap from Admin](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/api/admin/permissions/__tests__/route.test.ts:89)
- [returns 403 when an authenticated actor lacks permission](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/api/admin/permissions/__tests__/route.test.ts:99)

### app/api/admin/vehicles/history/analysis/__tests__/route.test.ts

[app/api/admin/vehicles/history/analysis/__tests__/route.test.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/api/admin/vehicles/history/analysis/__tests__/route.test.ts)

Source ที่นำเข้าทดสอบ: [app/api/admin/vehicles/history/analysis/route.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/api/admin/vehicles/history/analysis/route.ts), [lib/permissions.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/lib/permissions.ts), [lib/vehicle-usage-analysis/index.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/lib/vehicle-usage-analysis/index.ts), [lib/ai/vehicle-usage-summary/index.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/lib/ai/vehicle-usage-summary/index.ts)

- [POST /api/admin/vehicles/history/analysis](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/api/admin/vehicles/history/analysis/__tests__/route.test.ts:70)
- [allows Admin and records only operational metadata](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/api/admin/vehicles/history/analysis/__tests__/route.test.ts:90)
- [rejects non-Admin users before reading analysis data](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/api/admin/vehicles/history/analysis/__tests__/route.test.ts:114)
- [does not call AI when there is no actual usage](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/api/admin/vehicles/history/analysis/__tests__/route.test.ts:126)
- [rejects unknown request fields](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/api/admin/vehicles/history/analysis/__tests__/route.test.ts:142)
- [enforces the non-cached hourly run limit](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/api/admin/vehicles/history/analysis/__tests__/route.test.ts:153)

### app/api/admin/vehicles/history/details/__tests__/route.test.ts

[app/api/admin/vehicles/history/details/__tests__/route.test.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/api/admin/vehicles/history/details/__tests__/route.test.ts)

Source ที่นำเข้าทดสอบ: [app/api/admin/vehicles/history/details/route.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/api/admin/vehicles/history/details/route.ts), [lib/permissions.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/lib/permissions.ts), [lib/vehicle-history-details/index.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/lib/vehicle-history-details/index.ts)

- [GET /api/admin/vehicles/history/details](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/api/admin/vehicles/history/details/__tests__/route.test.ts:16)
- [requires REPORT_VIEW and forwards validated pagination and filters](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/api/admin/vehicles/history/details/__tests__/route.test.ts:27)
- [rejects requests without REPORT_VIEW](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/api/admin/vehicles/history/details/__tests__/route.test.ts:47)
- [rejects an unsupported tab before querying history](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/api/admin/vehicles/history/details/__tests__/route.test.ts:55)

### app/api/approver/__tests__/route.test.ts

[app/api/approver/__tests__/route.test.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/api/approver/__tests__/route.test.ts)

Source ที่นำเข้าทดสอบ: [app/api/approver/route.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/api/approver/route.ts), [lib/permissions.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/lib/permissions.ts), [lib/email/bookingNotifications.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/lib/email/bookingNotifications.ts)

- [Approver API](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/api/approver/__tests__/route.test.ts:21)
- [PUT /api/approver](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/api/approver/__tests__/route.test.ts:27)
- [rejects a rejection without a reason before reading the booking](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/api/approver/__tests__/route.test.ts:28)
- [approves a pending booking and sends a notification](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/api/approver/__tests__/route.test.ts:47)
- [returns the booking for a duplicate action from the same approver](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/api/approver/__tests__/route.test.ts:110)
- [returns a conflict when a booking was already handled by someone else](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/api/approver/__tests__/route.test.ts:137)

### app/api/auth/login/__tests__/route.test.ts

[app/api/auth/login/__tests__/route.test.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/api/auth/login/__tests__/route.test.ts)

Source ที่นำเข้าทดสอบ: [app/api/auth/login/route.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/api/auth/login/route.ts)

- [POST /api/auth/login](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/api/auth/login/__tests__/route.test.ts:23)
- [should return 401 if user not found](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/api/auth/login/__tests__/route.test.ts:32)
- [should return 401 if password does not match](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/api/auth/login/__tests__/route.test.ts:47)
- [should return 200 and set cookie on successful login](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/api/auth/login/__tests__/route.test.ts:67)
- [returns ACCOUNT_INACTIVE when the password is valid but the account is disabled](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/api/auth/login/__tests__/route.test.ts:101)

### app/api/booking/__tests__/route.test.ts

[app/api/booking/__tests__/route.test.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/api/booking/__tests__/route.test.ts)

Source ที่นำเข้าทดสอบ: [app/api/booking/route.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/api/booking/route.ts), [lib/permissions.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/lib/permissions.ts), [lib/syncStatuses.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/lib/syncStatuses.ts), [lib/email/bookingNotifications.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/lib/email/bookingNotifications.ts)

- [Booking API](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/api/booking/__tests__/route.test.ts:27)
- [GET /api/booking](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/api/booking/__tests__/route.test.ts:33)
- [should return my bookings if action=my-bookings](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/api/booking/__tests__/route.test.ts:34)
- [should filter out vehicles that conflict with bookings](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/api/booking/__tests__/route.test.ts:50)
- [POST /api/booking](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/api/booking/__tests__/route.test.ts:71)
- [should prevent booking if startDate >= endDate](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/api/booking/__tests__/route.test.ts:72)
- [should prevent booking a vehicle under MAINTENANCE](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/api/booking/__tests__/route.test.ts:87)
- [should prevent booking if conflicting with another booking](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/api/booking/__tests__/route.test.ts:107)
- [should create booking successfully](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/api/booking/__tests__/route.test.ts:128)
- [should reject destinations longer than 255 characters](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/api/booking/__tests__/route.test.ts:158)
- [PUT /api/booking](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/api/booking/__tests__/route.test.ts:180)
- [should fail if user tries to cancel someone else booking](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/api/booking/__tests__/route.test.ts:181)
- [should cancel booking successfully](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/api/booking/__tests__/route.test.ts:195)
- [PATCH /api/booking](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/api/booking/__tests__/route.test.ts:221)
- [should update and normalize the destination of a pending booking](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/api/booking/__tests__/route.test.ts:222)
- [should clear a destination when the submitted value is blank](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/api/booking/__tests__/route.test.ts:255)

### app/api/notifications/__tests__/route.test.ts

[app/api/notifications/__tests__/route.test.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/api/notifications/__tests__/route.test.ts)

Source ที่นำเข้าทดสอบ: [app/api/notifications/route.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/api/notifications/route.ts), [lib/auth.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/lib/auth.ts)

- [/api/notifications](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/api/notifications/__tests__/route.test.ts:20)
- [returns only the signed-in user's notifications and unread count](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/api/notifications/__tests__/route.test.ts:26)
- [marks one owned notification as read](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/api/notifications/__tests__/route.test.ts:59)
- [does not expose whether another user's notification exists](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/api/notifications/__tests__/route.test.ts:80)

### app/api/user/__tests__/route.test.ts

[app/api/user/__tests__/route.test.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/api/user/__tests__/route.test.ts)

Source ที่นำเข้าทดสอบ: [app/api/user/route.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/api/user/route.ts), [lib/permissions.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/lib/permissions.ts)

- [user lifecycle API](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/api/user/__tests__/route.test.ts:42)
- [lists lifecycle state, active booking counts and deletion eligibility](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/api/user/__tests__/route.test.ts:53)
- [deactivates an account, reports affected bookings and writes an audit log](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/api/user/__tests__/route.test.ts:71)
- [does not allow an admin to deactivate their own account](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/api/user/__tests__/route.test.ts:97)
- [does not allow deactivating the last active admin](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/api/user/__tests__/route.test.ts:107)
- [rejects permanent deletion when the account has history](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/api/user/__tests__/route.test.ts:116)
- [permanently deletes a new account without history](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/api/user/__tests__/route.test.ts:128)

### app/api/user/maintenance/__tests__/route.test.ts

[app/api/user/maintenance/__tests__/route.test.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/api/user/maintenance/__tests__/route.test.ts)

Source ที่นำเข้าทดสอบ: [app/api/user/maintenance/route.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/api/user/maintenance/route.ts), [lib/permissions.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/lib/permissions.ts), [lib/email/maintenanceNotifications.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/lib/email/maintenanceNotifications.ts)

- [POST /api/user/maintenance](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/api/user/maintenance/__tests__/route.test.ts:28)
- [creates in-app notifications and emails every admin](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/api/user/maintenance/__tests__/route.test.ts:38)
- [does not fail when no administrators exist](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/api/user/maintenance/__tests__/route.test.ts:115)
- [rejects a new report without a maintenance type](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/api/user/maintenance/__tests__/route.test.ts:156)

### app/api/verhicle-type/__tests__/route.test.ts

[app/api/verhicle-type/__tests__/route.test.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/api/verhicle-type/__tests__/route.test.ts)

Source ที่นำเข้าทดสอบ: [app/api/verhicle-type/route.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/api/verhicle-type/route.ts), [lib/permissions.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/lib/permissions.ts)

- [Vehicle Type API](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/api/verhicle-type/__tests__/route.test.ts:17)
- [GET /api/verhicle-type](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/api/verhicle-type/__tests__/route.test.ts:24)
- [should return list of vehicle types](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/api/verhicle-type/__tests__/route.test.ts:25)
- [POST /api/verhicle-type](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/api/verhicle-type/__tests__/route.test.ts:42)
- [should return 403 if user lacks permission](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/api/verhicle-type/__tests__/route.test.ts:43)
- [should create vehicle type successfully](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/api/verhicle-type/__tests__/route.test.ts:55)
- [PUT /api/verhicle-type](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/api/verhicle-type/__tests__/route.test.ts:73)
- [should update vehicle type successfully](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/api/verhicle-type/__tests__/route.test.ts:74)
- [DELETE /api/verhicle-type](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/api/verhicle-type/__tests__/route.test.ts:95)
- [should delete vehicle type successfully if no vehicles are linked](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/api/verhicle-type/__tests__/route.test.ts:96)
- [should return 400 if trying to delete a type still used by vehicles](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/api/verhicle-type/__tests__/route.test.ts:106)

### app/api/verhicle/__tests__/route.test.ts

[app/api/verhicle/__tests__/route.test.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/api/verhicle/__tests__/route.test.ts)

Source ที่นำเข้าทดสอบ: [app/api/verhicle/route.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/api/verhicle/route.ts), [lib/permissions.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/lib/permissions.ts)

- [vehicle deletion](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/api/verhicle/__tests__/route.test.ts:23)
- [returns a conflict instead of deleting a vehicle with maintenance history](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/api/verhicle/__tests__/route.test.ts:34)
- [vehicle mileage management](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/api/verhicle/__tests__/route.test.ts:54)
- [stores the initial mileage when an admin creates a vehicle](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/api/verhicle/__tests__/route.test.ts:68)
- [updates the current mileage as a non-negative integer](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/api/verhicle/__tests__/route.test.ts:89)
- [rejects invalid mileage $value](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/api/verhicle/__tests__/route.test.ts:111)

### e2e/admin-booking-mileage.e2e.ts

[e2e/admin-booking-mileage.e2e.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/e2e/admin-booking-mileage.e2e.ts)

- [admin records pickup and return mileage on behalf of a user](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/e2e/admin-booking-mileage.e2e.ts:148)

### e2e/admin-vehicle-mileage.e2e.ts

[e2e/admin-vehicle-mileage.e2e.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/e2e/admin-vehicle-mileage.e2e.ts)

- [admin updates the current vehicle mileage](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/e2e/admin-vehicle-mileage.e2e.ts:85)

### e2e/booking-destination.e2e.ts

[e2e/booking-destination.e2e.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/e2e/booking-destination.e2e.ts)

- [stores, displays, edits and clears a booking destination](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/e2e/booking-destination.e2e.ts:69)

### e2e/phase6-emergency.e2e.ts

[e2e/phase6-emergency.e2e.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/e2e/phase6-emergency.e2e.ts)

- [user reports an emergency and admin replaces the vehicle](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/e2e/phase6-emergency.e2e.ts:180)

### lib/__tests__/auth.test.ts

[lib/__tests__/auth.test.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/lib/__tests__/auth.test.ts)

Source ที่นำเข้าทดสอบ: [lib/auth.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/lib/auth.ts)

- [database-backed authentication](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/lib/__tests__/auth.test.ts:21)
- [uses the latest role from the database instead of the token role](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/lib/__tests__/auth.test.ts:28)
- [rejects a token issued before the account was deactivated](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/lib/__tests__/auth.test.ts:41)

### lib/__tests__/permissions.test.ts

[lib/__tests__/permissions.test.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/lib/__tests__/permissions.test.ts)

Source ที่นำเข้าทดสอบ: [lib/auth.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/lib/auth.ts), [lib/prisma.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/lib/prisma.ts), [lib/permissions.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/lib/permissions.ts)

- [permission enforcement](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/lib/__tests__/permissions.test.ts:23)
- [allows an active actor with the required role and permission](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/lib/__tests__/permissions.test.ts:33)
- [rejects a role mismatch before reading permissions](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/lib/__tests__/permissions.test.ts:44)
- [rejects an authenticated actor without the permission](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/lib/__tests__/permissions.test.ts:58)
- [returns 401 only for authentication failures and 403 for denied access](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/lib/__tests__/permissions.test.ts:67)

### lib/ai/vehicle-usage-summary/__tests__/payload.test.ts

[lib/ai/vehicle-usage-summary/__tests__/payload.test.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/lib/ai/vehicle-usage-summary/__tests__/payload.test.ts)

Source ที่นำเข้าทดสอบ: [lib/vehicle-usage-analysis/index.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/lib/vehicle-usage-analysis/index.ts), [lib/ai/vehicle-usage-summary/payload.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/lib/ai/vehicle-usage-summary/payload.ts)

- [buildVehicleUsageAiPayload](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/lib/ai/vehicle-usage-summary/__tests__/payload.test.ts:80)
- [sends names and aggregates without internal identifiers or raw fields](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/lib/ai/vehicle-usage-summary/__tests__/payload.test.ts:81)
- [produces a stable cache key for an unchanged metrics snapshot](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/lib/ai/vehicle-usage-summary/__tests__/payload.test.ts:97)

### lib/ai/vehicle-usage-summary/__tests__/validate.test.ts

[lib/ai/vehicle-usage-summary/__tests__/validate.test.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/lib/ai/vehicle-usage-summary/__tests__/validate.test.ts)

Source ที่นำเข้าทดสอบ: [lib/ai/vehicle-usage-summary/schema.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/lib/ai/vehicle-usage-summary/schema.ts), [lib/ai/vehicle-usage-summary/validate.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/lib/ai/vehicle-usage-summary/validate.ts)

- [validateAiSummary](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/lib/ai/vehicle-usage-summary/__tests__/validate.test.ts:35)
- [accepts references that match server-computed evidence](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/lib/ai/vehicle-usage-summary/__tests__/validate.test.ts:36)
- [rejects invented evidence keys](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/lib/ai/vehicle-usage-summary/__tests__/validate.test.ts:40)
- [rejects numbers and direct names in AI-authored prose](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/lib/ai/vehicle-usage-summary/__tests__/validate.test.ts:50)
- [uses only deterministic data limitations](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/lib/ai/vehicle-usage-summary/__tests__/validate.test.ts:66)

### lib/email/__tests__/maintenanceNotifications.test.ts

[lib/email/__tests__/maintenanceNotifications.test.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/lib/email/__tests__/maintenanceNotifications.test.ts)

Source ที่นำเข้าทดสอบ: [lib/email/maintenanceNotifications.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/lib/email/maintenanceNotifications.ts), [lib/email/service.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/lib/email/service.ts)

- [maintenance report emails](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/lib/email/__tests__/maintenanceNotifications.test.ts:26)
- [builds an admin email and escapes report content](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/lib/email/__tests__/maintenanceNotifications.test.ts:33)
- [sends a separate email to every admin](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/lib/email/__tests__/maintenanceNotifications.test.ts:48)

### lib/email/__tests__/service.test.ts

[lib/email/__tests__/service.test.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/lib/email/__tests__/service.test.ts)

Source ที่นำเข้าทดสอบ: [lib/email/service.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/lib/email/service.ts)

- [sendEmail](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/lib/email/__tests__/service.test.ts:20)
- [skips sending when email is disabled](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/lib/email/__tests__/service.test.ts:31)
- [does not throw when SMTP config is incomplete](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/lib/email/__tests__/service.test.ts:38)
- [sends with SMTP config when enabled](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/lib/email/__tests__/service.test.ts:47)
- [returns false when transport fails](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/lib/email/__tests__/service.test.ts:72)

### lib/email/__tests__/templates.test.ts

[lib/email/__tests__/templates.test.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/lib/email/__tests__/templates.test.ts)

Source ที่นำเข้าทดสอบ: [lib/email/templates.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/lib/email/templates.ts)

- [booking email templates](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/lib/email/__tests__/templates.test.ts:26)
- [builds an approved booking email](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/lib/email/__tests__/templates.test.ts:27)
- [includes rejection comments](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/lib/email/__tests__/templates.test.ts:38)
- [builds a vehicle changed email](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/lib/email/__tests__/templates.test.ts:45)

### lib/vehicle-history-details/__tests__/index.test.ts

[lib/vehicle-history-details/__tests__/index.test.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/lib/vehicle-history-details/__tests__/index.test.ts)

Source ที่นำเข้าทดสอบ: [lib/vehicle-history-details/index.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/lib/vehicle-history-details/index.ts)

- [vehicle history details](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/lib/vehicle-history-details/__tests__/index.test.ts:14)
- [sorts every trip status by its effective date and paginates](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/lib/vehicle-history-details/__tests__/index.test.ts:17)
- [keeps completed mileage rows with missing mileage as distanceKm null](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/lib/vehicle-history-details/__tests__/index.test.ts:68)
- [returns all maintenance types and statuses within the Bangkok date range](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/lib/vehicle-history-details/__tests__/index.test.ts:94)
- [rejects page sizes over 100](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/lib/vehicle-history-details/__tests__/index.test.ts:129)

### lib/vehicle-usage-analysis/__tests__/calculate.test.ts

[lib/vehicle-usage-analysis/__tests__/calculate.test.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/lib/vehicle-usage-analysis/__tests__/calculate.test.ts)

Source ที่นำเข้าทดสอบ: [lib/vehicle-usage-analysis/calculate.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/lib/vehicle-usage-analysis/calculate.ts)

- [calculateVehicleUsageAnalysis](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/lib/vehicle-usage-analysis/__tests__/calculate.test.ts:69)
- [computes deterministic vehicle, user, peer, and maintenance metrics](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/lib/vehicle-usage-analysis/__tests__/calculate.test.ts:111)
- [focuses user totals on one vehicle but keeps same-type peer medians](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/lib/vehicle-usage-analysis/__tests__/calculate.test.ts:149)
- [returns null rates and a mileage limitation when distance is unusable](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/lib/vehicle-usage-analysis/__tests__/calculate.test.ts:162)
- [does not publish a peer breakdown median from fewer than three usable rates](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/lib/vehicle-usage-analysis/__tests__/calculate.test.ts:181)

### lib/vehicle-usage-analysis/__tests__/period.test.ts

[lib/vehicle-usage-analysis/__tests__/period.test.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/lib/vehicle-usage-analysis/__tests__/period.test.ts)

Source ที่นำเข้าทดสอบ: [lib/vehicle-usage-analysis/period.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/lib/vehicle-usage-analysis/period.ts)

- [vehicle usage analysis period](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/lib/vehicle-usage-analysis/__tests__/period.test.ts:9)
- [defaults to month-to-date in Bangkok](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/lib/vehicle-usage-analysis/__tests__/period.test.ts:10)
- [creates an immediately preceding comparison period of equal length](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/lib/vehicle-usage-analysis/__tests__/period.test.ts:23)
- [uses an exclusive end boundary](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/lib/vehicle-usage-analysis/__tests__/period.test.ts:34)
- [rejects partial and oversized ranges](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/lib/vehicle-usage-analysis/__tests__/period.test.ts:45)
- [extracts weekday and hour in Bangkok](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/lib/vehicle-usage-analysis/__tests__/period.test.ts:53)

## โค้ด Prisma ที่ generate

อ่าน schema เป็นหลักแล้วเข้าใจหน้าที่ของไฟล์ต่อไปนี้ ไม่ต้องจำ implementation ของ runtime ที่ generate ใหม่ได้:

- [app/generated/prisma/client.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/generated/prisma/client.ts) — entry point Prisma ฝั่ง server
- [app/generated/prisma/browser.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/generated/prisma/browser.ts) — exports สำหรับ browser ตามที่ generator จัดให้
- [app/generated/prisma/enums.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/generated/prisma/enums.ts) — ค่าคงที่ enum ตาม schema
- [app/generated/prisma/models.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/generated/prisma/models.ts) — ส่วนรวมชนิดหรือ runtime ที่ generator สร้าง
- [app/generated/prisma/commonInputTypes.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/generated/prisma/commonInputTypes.ts) — ส่วนรวมชนิดหรือ runtime ที่ generator สร้าง
- [app/generated/prisma/internal/class.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/generated/prisma/internal/class.ts) — ส่วนรวมชนิดหรือ runtime ที่ generator สร้าง
- [app/generated/prisma/internal/prismaNamespace.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/generated/prisma/internal/prismaNamespace.ts) — ส่วนรวมชนิดหรือ runtime ที่ generator สร้าง
- [app/generated/prisma/internal/prismaNamespaceBrowser.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/generated/prisma/internal/prismaNamespaceBrowser.ts) — ส่วนรวมชนิดหรือ runtime ที่ generator สร้าง
- [app/generated/prisma/models/User.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/generated/prisma/models/User.ts) — ชนิดและ argument ของ model/query
- [app/generated/prisma/models/VehicleType.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/generated/prisma/models/VehicleType.ts) — ชนิดและ argument ของ model/query
- [app/generated/prisma/models/Vehicle.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/generated/prisma/models/Vehicle.ts) — ชนิดและ argument ของ model/query
- [app/generated/prisma/models/Booking.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/generated/prisma/models/Booking.ts) — ชนิดและ argument ของ model/query
- [app/generated/prisma/models/Maintenance.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/generated/prisma/models/Maintenance.ts) — ชนิดและ argument ของ model/query
- [app/generated/prisma/models/Notification.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/generated/prisma/models/Notification.ts) — ชนิดและ argument ของ model/query
- [app/generated/prisma/models/Log.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/generated/prisma/models/Log.ts) — ชนิดและ argument ของ model/query
- [app/generated/prisma/models/RolePermission.ts](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/generated/prisma/models/RolePermission.ts) — ชนิดและ argument ของ model/query
- [app/generated/prisma/wasm-worker-loader.mjs](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/generated/prisma/wasm-worker-loader.mjs) — loader ที่ generator จัดให้ตาม runtime
- [app/generated/prisma/wasm-edge-light-loader.mjs](/Users/chatchaponchuwongwut/Desktop/mut/project_1/vehicle-management/app/generated/prisma/wasm-edge-light-loader.mjs) — loader ที่ generator จัดให้ตาม runtime
