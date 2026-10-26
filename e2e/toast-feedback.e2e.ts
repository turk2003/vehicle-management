import "dotenv/config"
import { randomUUID } from "node:crypto"
import bcrypt from "bcryptjs"
import { Pool } from "pg"
import { expect, test, type Page, type Route } from "@playwright/test"
import { bangkokDateKey, shiftCalendarMonth } from "../lib/calendar/dates"

const pool = new Pool({ connectionString: process.env.DATABASE_URL })
const suffix = randomUUID().slice(0, 8)
const password = "Toast-test-123"
const accounts = (["ADMIN", "APPROVER", "USER"] as const).map((role) => ({
  id: randomUUID(), role, email: `toast-${role}-${suffix}@example.com`,
}))
const addedPermissions: string[] = []
const permissions = {
  ADMIN: ["VEHICLE_VIEW", "VEHICLE_MANAGE", "USER_MANAGE", "BOOKING_VIEW", "BOOKING_MANAGE", "BOOKING_DELETE", "MAINTENANCE_VIEW", "MAINTENANCE_MANAGE", "PERMISSION_MANAGE"],
  APPROVER: ["BOOKING_APPROVE"],
  USER: ["BOOKING_CREATE", "BOOKING_VIEW", "VEHICLE_VIEW", "MAINTENANCE_VIEW", "MAINTENANCE_REPORT"],
}
const vehicleType = { id: "toast-type", name: "ประเภทรถทดสอบ" }
const vehicle = { id: "toast-vehicle", plateNumber: "TOAST-01", type: vehicleType, status: "AVAILABLE", currentMileage: 100, maintenanceCount: 0, recommended: true }
const user = { id: "toast-user", name: "ผู้ใช้ทดสอบ toast", email: "toast@example.com", role: "USER", isActive: true, canDelete: true, activeBookingCount: 2, createdAt: "2026-01-01T00:00:00Z" }
const booking = { id: "toast-booking", user, vehicle, status: "PENDING", startDate: "2099-01-01T02:00:00Z", endDate: "2099-01-01T03:00:00Z", purpose: "ทดสอบ toast", createdAt: "2026-01-01T00:00:00Z", mileageStart: 100 }
const maintenance = { id: "toast-maintenance", vehicle, reporter: user, description: "งานซ่อมทดสอบ toast", maintenanceType: "OTHER", status: "REPORTED", startDate: "2026-01-01T00:00:00Z", createdAt: "2026-01-01T00:00:00Z", affectedBookings: [] }

test.beforeAll(async () => {
  const hash = await bcrypt.hash(password, 4)
  for (const account of accounts) {
    await pool.query(`INSERT INTO "User" ("id", "name", "email", "password", "role", "createdAt") VALUES ($1,$2,$3,$4,$5::"UserRole",NOW())`,
      [account.id, `ผู้ทดสอบ toast ${account.role}`, account.email, hash, account.role])
    for (const permission of permissions[account.role]) {
      const id = randomUUID()
      const result = await pool.query(`INSERT INTO "RolePermission" ("id","role","permission") SELECT $1,$2::"UserRole",$3::"Permission" WHERE NOT EXISTS (SELECT 1 FROM "RolePermission" WHERE "role"=$2::"UserRole" AND "permission"=$3::"Permission") RETURNING "id"`, [id, account.role, permission])
      if (result.rowCount) addedPermissions.push(id)
    }
  }
})

test.afterAll(async () => {
  await pool.query(`DELETE FROM "Log" WHERE "userId" = ANY($1::text[])`, [accounts.map((account) => account.id)])
  await pool.query(`DELETE FROM "User" WHERE "id" = ANY($1::text[])`, [accounts.map((account) => account.id)])
  await pool.query(`DELETE FROM "RolePermission" WHERE "id" = ANY($1::text[])`, [addedPermissions])
  await pool.end()
})

type Options = {
  status?: string
  write?: (route: Route) => Promise<void>
  failReload?: boolean
}

// Only authentication and page authorization use the database. Action requests
// are mocked so feedback coverage cannot change bookings or send notifications.
async function openPage(page: Page, role: typeof accounts[number]["role"], path: string, options: Options = {}) {
  const account = accounts.find((item) => item.role === role)!
  const response = await page.request.post("/api/auth/login", { data: { email: account.email, password } })
  expect(response.ok()).toBe(true)
  let saved = false
  await page.route("**/api/**", async (route) => {
    const request = route.request()
    const url = new URL(request.url())
    const pathname = url.pathname
    if (request.method() !== "GET") {
      saved = true
      if (options.write) return options.write(route)
      const body = request.postDataJSON() ?? {}
      const json = pathname === "/api/verhicle"
        ? { ...vehicle, ...body, id: body.id ?? "new-vehicle", type: vehicleType, currentMileage: Number(body.currentMileage) }
        : pathname === "/api/verhicle-type"
          ? { ...body, id: body.id ?? "new-type" }
          : pathname === "/api/user"
            ? { ...user, ...body, id: body.id ?? "new-user", affectedBookingCount: 2 }
            : pathname.endsWith("change-vehicle")
              ? { previousVehiclePlate: vehicle.plateNumber, newVehiclePlate: "TOAST-02" }
              : {}
      return route.fulfill({ json })
    }
    if (saved && options.failReload && pathname === "/api/booking") {
      return route.fulfill({ status: 500, json: { message: "โหลดข้อมูลล่าสุดไม่ได้" } })
    }
    const fixtures: Record<string, unknown> = {
      "/api/auth/me": { user: { ...account, name: "ผู้ทดสอบ toast", isActive: true }, permissions: Object.values(permissions).flat() },
      "/api/notifications": { notifications: [], unreadCount: 0 },
      "/api/verhicle": [vehicle],
      "/api/verhicle-type": [vehicleType],
      "/api/vehicles/recommend": [vehicle],
      "/api/user": [user],
      "/api/booking": [{ ...booking, status: options.status ?? "PENDING" }],
      "/api/approver": [booking],
      "/api/admin/bookings": [{ ...booking, status: options.status ?? "PENDING" }],
      "/api/admin/bookings/change-vehicle": { candidates: [{ ...vehicle, id: "replacement", plateNumber: "TOAST-02" }] },
      "/api/user/maintenance": [maintenance],
      "/api/admin/maintenance": [maintenance],
      "/api/admin/permissions": { roles: ["USER", "APPROVER", "ADMIN"], permissions: { USER: { BOOKING_CREATE: true } }, lockedAdminPermissions: [] },
      "/api/calendar": { month: url.searchParams.get("start")?.slice(0, 7), range: { start: url.searchParams.get("start"), end: url.searchParams.get("end") }, asOf: new Date().toISOString(), bookings: [], vehicles: [] },
    }
    await route.fulfill({ json: fixtures[pathname] ?? {} })
  })
  await page.goto(path)
}

const toastRegion = (page: Page) => page.getByRole("region", { name: "การแจ้งเตือน" })

async function expectSuccess(page: Page, message: string) {
  const region = toastRegion(page)
  await expect(region.getByRole("status")).toContainText(message)
  await expect(region.locator("[data-toast]")).toHaveCount(1)
  await region.getByRole("button", { name: "ปิดการแจ้งเตือน" }).click()
  await expect(region).toHaveCount(0)
}

async function createUserForm(page: Page) {
  await page.getByRole("button", { name: "เพิ่มผู้ใช้", exact: true }).click()
  const dialog = page.getByRole("dialog")
  await dialog.getByLabel("ชื่อ", { exact: true }).fill("ผู้ใช้ใหม่ toast")
  await dialog.getByLabel("อีเมล", { exact: true }).fill("new-toast@example.com")
  await dialog.getByLabel("รหัสผ่าน", { exact: true }).fill(password)
  return dialog
}

test("confirms all six vehicle and vehicle-type actions once", async ({ page }) => {
  await openPage(page, "ADMIN", "/admin/vehicles")
  page.on("dialog", (dialog) => dialog.accept())
  await page.getByRole("button", { name: "เพิ่มรถ", exact: true }).click()
  let dialog = page.getByRole("dialog")
  await dialog.locator("#plateNumber").fill("TOAST-NEW")
  await dialog.locator("#typeId").selectOption(vehicleType.id)
  await dialog.getByRole("button", { name: "เพิ่มรถ", exact: true }).click()
  await expectSuccess(page, "เพิ่มรถเรียบร้อยแล้ว")
  let row = page.getByRole("row").filter({ hasText: "TOAST-NEW" })
  await row.getByRole("button", { name: "แก้ไข", exact: true }).click()
  dialog = page.getByRole("dialog")
  await dialog.locator("#plateNumber").fill("TOAST-EDIT")
  await dialog.getByRole("button", { name: "บันทึกการแก้ไข", exact: true }).click()
  await expectSuccess(page, "บันทึกการแก้ไขข้อมูลรถเรียบร้อยแล้ว")
  row = page.getByRole("row").filter({ hasText: "TOAST-EDIT" })
  await row.getByRole("button", { name: "ลบ", exact: true }).click()
  await expectSuccess(page, "ลบรถเรียบร้อยแล้ว")
  await page.getByRole("button", { name: "ประเภทรถ", exact: true }).click()
  await page.getByRole("button", { name: "เพิ่มประเภทรถ", exact: true }).click()
  dialog = page.getByRole("dialog")
  await dialog.getByLabel("ชื่อประเภทรถ").fill("ประเภทใหม่ toast")
  await dialog.getByRole("button", { name: "เพิ่มประเภท", exact: true }).click()
  await expectSuccess(page, "เพิ่มประเภทรถเรียบร้อยแล้ว")
  row = page.getByRole("row").filter({ hasText: "ประเภทใหม่ toast" })
  await row.getByRole("button", { name: "แก้ไข", exact: true }).click()
  dialog = page.getByRole("dialog")
  await dialog.getByLabel("ชื่อประเภทรถ").fill("ประเภทแก้ไข toast")
  await dialog.getByRole("button", { name: "บันทึกการแก้ไข", exact: true }).click()
  await expectSuccess(page, "บันทึกการแก้ไขประเภทรถเรียบร้อยแล้ว")
  await page.getByRole("row").filter({ hasText: "ประเภทแก้ไข toast" }).getByRole("button", { name: "ลบ", exact: true }).click()
  await expectSuccess(page, "ลบประเภทรถเรียบร้อยแล้ว")
})

test("confirms all five user actions and retains affected booking information", async ({ page }) => {
  await openPage(page, "ADMIN", "/admin/users")
  page.on("dialog", (dialog) => dialog.accept())
  let dialog = await createUserForm(page)
  await dialog.getByRole("button", { name: "สร้างผู้ใช้", exact: true }).click()
  await expectSuccess(page, "เพิ่มผู้ใช้เรียบร้อยแล้ว")
  let row = page.getByRole("row").filter({ hasText: "ผู้ใช้ใหม่ toast" })
  await row.getByRole("button", { name: "แก้ไข", exact: true }).click()
  dialog = page.getByRole("dialog")
  await dialog.getByLabel("ชื่อ", { exact: true }).fill("ผู้ใช้แก้ไข toast")
  await dialog.getByRole("button", { name: "บันทึกการแก้ไข", exact: true }).click()
  await expectSuccess(page, "บันทึกการแก้ไขผู้ใช้เรียบร้อยแล้ว")
  await page.getByRole("row").filter({ hasText: "ผู้ใช้แก้ไข toast" }).getByRole("button", { name: "ลบ", exact: true }).click()
  await expectSuccess(page, "ลบผู้ใช้เรียบร้อยแล้ว")
  row = page.getByRole("row").filter({ hasText: user.name })
  await row.getByRole("button", { name: "ปิดบัญชี", exact: true }).click()
  await expectSuccess(page, "ปิดใช้งานบัญชี")
  await expect(page.getByText("การจองที่ยังดำเนินการอยู่ 2 รายการยังคงอยู่")).toBeVisible()
  await row.getByRole("button", { name: "เปิดบัญชี", exact: true }).click()
  await expectSuccess(page, "เปิดใช้งานบัญชี")
})

for (const action of ["อนุมัติ", "ปฏิเสธ"]) {
  test(`confirms approver ${action}`, async ({ page }) => {
    await openPage(page, "APPROVER", "/approver/approve")
    await page.getByRole("button", { name: action, exact: true }).click()
    const dialog = page.getByRole("dialog")
    await dialog.locator("#approval-comment").fill("ผลพิจารณาทดสอบ")
    await dialog.getByRole("button", { name: `ยืนยันการ${action}`, exact: true }).click()
    await expectSuccess(page, `การจองได้รับการ${action}แล้ว`)
  })
}

test("confirms maintenance create, edit and delete", async ({ page }) => {
  await openPage(page, "ADMIN", "/admin/maintenance")
  page.on("dialog", (dialog) => dialog.accept())
  await page.getByRole("button", { name: "เพิ่มรายการบำรุงรักษา", exact: true }).click()
  let dialog = page.getByRole("dialog")
  await dialog.locator("#maintenance-vehicle").selectOption(vehicle.id)
  await dialog.locator("#maintenance-type").selectOption("OTHER")
  await dialog.locator("#maintenance-description").fill("งานซ่อมใหม่")
  await dialog.locator("#maintenance-start").fill("2026-01-01T09:00")
  await dialog.getByRole("button", { name: "เพิ่มรายการ", exact: true }).click()
  await expectSuccess(page, "เพิ่มรายการบำรุงรักษาเรียบร้อยแล้ว")
  const row = page.getByRole("row").filter({ hasText: maintenance.description })
  await row.getByRole("button", { name: `แก้ไขรายการ ${maintenance.description}`, exact: true }).click()
  dialog = page.getByRole("dialog")
  await dialog.getByRole("button", { name: "บันทึกการแก้ไข", exact: true }).click()
  await expectSuccess(page, "อัปเดตรายการบำรุงรักษาเรียบร้อยแล้ว")
  await row.getByRole("button", { name: `ลบรายการ ${maintenance.description}`, exact: true }).click()
  await expectSuccess(page, "ลบรายการบำรุงรักษาเรียบร้อยแล้ว")
})

test("confirms permission saves and never toasts unsaved toggles", async ({ page }) => {
  await openPage(page, "ADMIN", "/admin/permissions")
  await page.getByRole("switch").first().click()
  await expect(toastRegion(page)).toHaveCount(0)
  await page.getByRole("button", { name: "บันทึกการเปลี่ยนแปลง", exact: true }).click()
  await expectSuccess(page, "บันทึกสิทธิ์ของ User เรียบร้อยแล้ว")
})

test("confirms booking from the vehicle search page", async ({ page }, testInfo) => {
  await openPage(page, "USER", "/user/booking")
  await page.locator("#booking-start-date").fill("2099-01-01T09:00")
  await page.locator("#booking-end-date").fill("2099-01-01T10:00")
  await page.getByRole("button", { name: "ค้นหา", exact: true }).click()
  await page.getByRole("button", { name: "จองรถคันนี้ (แนะนำ)", exact: true }).click()
  const dialog = page.getByRole("dialog")
  await dialog.locator("#booking-purpose").fill("ทดสอบคำขอจอง")
  await dialog.getByRole("button", { name: "ยืนยันการจอง", exact: true }).click()
  await expect(toastRegion(page).getByRole("status")).toBeInViewport({ ratio: 1 })
  await page.screenshot({ path: testInfo.outputPath("toast-success-desktop.png"), fullPage: true })
  await expectSuccess(page, "ส่งคำขอจองรถสำเร็จ รอการอนุมัติจากผู้อนุมัติ")
})

for (const action of ["รับรถ", "คืนรถ", "ยกเลิก"]) {
  test(`confirms own booking ${action}`, async ({ page }) => {
    await openPage(page, "USER", "/user/my-bookings", { status: action === "รับรถ" ? "APPROVED" : action === "คืนรถ" ? "IN_PROGRESS" : "PENDING" })
    page.on("dialog", (dialog) => dialog.accept())
    await page.getByRole("button", { name: action, exact: true }).click()
    if (action !== "ยกเลิก") {
      const dialog = page.getByRole("dialog")
      await dialog.locator('input[type="number"]').fill("200")
      await dialog.getByRole("button", { name: `ยืนยันการ${action}`, exact: true }).click()
    }
    await expectSuccess(page, action === "ยกเลิก" ? "ยกเลิกการจองเรียบร้อยแล้ว" : `บันทึกการ${action}เรียบร้อยแล้ว`)
  })
}

for (const action of ["เปลี่ยนสถานะ", "ลบ"]) {
  test(`confirms admin booking ${action}`, async ({ page }) => {
    await openPage(page, "ADMIN", "/admin/bookings")
    page.on("dialog", (dialog) => dialog.accept())
    const row = page.getByRole("row").filter({ hasText: vehicle.plateNumber })
    await row.getByRole("button", { name: action === "ลบ" ? "ลบ" : "แก้ไข", exact: true }).click()
    if (action !== "ลบ") {
      const dialog = page.getByRole("dialog")
      await dialog.getByLabel("สถานะใหม่").selectOption("APPROVED")
      await dialog.getByRole("button", { name: "บันทึกสถานะ", exact: true }).click()
    }
    await expectSuccess(page, action === "ลบ" ? "ลบการจองเรียบร้อยแล้ว" : "อนุมัติแล้ว")
  })
}

test("keeps successful saves separate from reload failures", async ({ page }) => {
  await openPage(page, "USER", "/user/my-bookings", { failReload: true })
  page.on("dialog", (dialog) => dialog.accept())
  await page.getByRole("button", { name: "ยกเลิก", exact: true }).click()
  await expect(toastRegion(page).getByRole("status")).toContainText("ยกเลิกการจองเรียบร้อยแล้ว")
  await expect(toastRegion(page).getByRole("alert")).toHaveCount(0)
  await expect(page.getByRole("main").getByRole("alert")).toContainText("ไม่สามารถโหลดข้อมูลการจองได้")
})

test("does not toast canceled deletes or invalid forms", async ({ page }) => {
  let writes = 0
  await openPage(page, "ADMIN", "/admin/users", { write: async (route) => { writes += 1; await route.fulfill({ json: {} }) } })
  page.on("dialog", (dialog) => dialog.dismiss())
  await page.getByRole("row").filter({ hasText: user.name }).getByRole("button", { name: "ลบ", exact: true }).click()
  await expect(toastRegion(page)).toHaveCount(0)
  await page.getByRole("button", { name: "เพิ่มผู้ใช้", exact: true }).click()
  await page.getByRole("dialog").getByRole("button", { name: "สร้างผู้ใช้", exact: true }).click()
  await expect(toastRegion(page)).toHaveCount(0)
  expect(writes).toBe(0)
})

test("success lasts four seconds and errors last six seconds", async ({ page }) => {
  let fail = false
  await openPage(page, "ADMIN", "/admin/permissions", { write: async (route) => route.fulfill(fail ? { status: 500, json: { message: "บันทึกไม่ได้" } } : { json: {} }) })
  await page.clock.install()
  await page.clock.pauseAt(new Date())
  const save = page.getByRole("button", { name: "บันทึกการเปลี่ยนแปลง", exact: true })
  await save.click()
  await expect(toastRegion(page).getByRole("status")).toBeVisible()
  await page.clock.runFor(3999)
  await expect(toastRegion(page).getByRole("status")).toBeVisible()
  await page.clock.runFor(1)
  await expect(toastRegion(page)).toHaveCount(0)
  fail = true
  await save.click()
  await expect(toastRegion(page).getByRole("alert")).toContainText("บันทึกไม่ได้")
  await expect(toastRegion(page).getByRole("status")).toHaveCount(0)
  await page.clock.runFor(5999)
  await expect(toastRegion(page).getByRole("alert")).toBeVisible()
  await page.clock.runFor(1)
  await expect(toastRegion(page)).toHaveCount(0)
})

test("hover and keyboard focus pause independently and preserve remaining time", async ({ page }) => {
  await openPage(page, "ADMIN", "/admin/permissions")
  await page.clock.install()
  await page.clock.pauseAt(new Date())
  await page.getByRole("button", { name: "บันทึกการเปลี่ยนแปลง", exact: true }).click()
  const toast = toastRegion(page).getByRole("status")
  await expect(toast).toBeVisible()
  await page.clock.runFor(1000)
  await toast.hover()
  await toast.getByRole("button").focus()
  await page.clock.runFor(6000)
  await expect(toast).toBeVisible()
  await page.mouse.move(0, 0)
  await page.clock.runFor(6000)
  await expect(toast).toBeVisible()
  await page.getByRole("button", { name: "บันทึกการเปลี่ยนแปลง", exact: true }).focus()
  await page.clock.runFor(2999)
  await expect(toast).toBeVisible()
  await page.clock.runFor(1)
  await expect(toastRegion(page)).toHaveCount(0)
})

test("successive messages keep independent lifetimes", async ({ page }) => {
  await openPage(page, "ADMIN", "/admin/permissions")
  await page.clock.install()
  await page.clock.pauseAt(new Date())
  const save = page.getByRole("button", { name: "บันทึกการเปลี่ยนแปลง", exact: true })
  await save.click()
  await expect(toastRegion(page).getByRole("status")).toHaveCount(1)
  await page.clock.runFor(1000)
  await save.click()
  await expect(toastRegion(page).getByRole("status")).toHaveCount(2)
  await page.clock.runFor(3000)
  await expect(toastRegion(page).getByRole("status")).toHaveCount(1)
  await page.clock.runFor(1000)
  await expect(toastRegion(page)).toHaveCount(0)
})

test("native dialog errors stay accessible and keep their lifetime when the dialog closes", async ({ page }, testInfo) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await openPage(page, "USER", "/calendar", { write: async (route) => route.fulfill({ status: 500, json: { message: "จองรถไม่ได้ กรุณาลองใหม่" } }) })
  const day = `${shiftCalendarMonth(bangkokDateKey(new Date()).slice(0, 7), 1)}-15`
  await page.getByRole("button", { name: "เดือนถัดไป", exact: true }).click()
  await page.getByRole("region", { name: "ตารางการจองรถ" }).locator(`[data-date="${day}"]`).getByRole("link").first().click()
  const dialog = page.getByRole("dialog", { name: "จองรถ", exact: true })
  await dialog.getByLabel("เวลาเริ่มต้น", { exact: false }).fill("09:00")
  await dialog.getByLabel("เวลาสิ้นสุด", { exact: false }).fill("10:00")
  await dialog.getByRole("button", { name: "ค้นหารถว่าง", exact: true }).click()
  await dialog.getByLabel("รถที่ต้องการจอง").selectOption(vehicle.id)
  await dialog.getByLabel("วัตถุประสงค์").fill("ทดสอบข้อผิดพลาดใน dialog")
  await page.clock.install()
  await page.clock.pauseAt(new Date())
  await dialog.getByRole("button", { name: "ยืนยันการจอง", exact: true }).click()
  await page.mouse.move(0, 0)
  const toast = dialog.getByRole("region", { name: "การแจ้งเตือน" }).getByRole("alert")
  await expect(toast).toContainText("จองรถไม่ได้")
  await expect(toast).toBeInViewport({ ratio: 1 })
  const close = toast.getByRole("button", { name: "ปิดการแจ้งเตือน" })
  await close.focus()
  await expect(close).toBeFocused()
  await page.screenshot({ path: testInfo.outputPath("toast-native-dialog-mobile.png"), fullPage: true })
  await dialog.getByLabel("วัตถุประสงค์").focus()
  await page.clock.runFor(3000)
  await page.keyboard.press("Escape")
  await expect(dialog).toHaveCount(0)
  await expect(toastRegion(page).getByRole("alert")).toBeVisible()
  await page.clock.runFor(2999)
  await expect(toastRegion(page).getByRole("alert")).toBeVisible()
  await page.clock.runFor(1)
  await expect(toastRegion(page)).toHaveCount(0)
})

test("errors remain actionable above modals, fit mobile and respect reduced motion", async ({ page }, testInfo) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.emulateMedia({ reducedMotion: "reduce" })
  await openPage(page, "ADMIN", "/admin/users", { write: async (route) => route.fulfill({ status: 500, json: { message: "ไม่สามารถบันทึกผู้ใช้ได้ กรุณาลองใหม่อีกครั้ง" } }) })
  const dialog = await createUserForm(page)
  await dialog.getByRole("button", { name: "สร้างผู้ใช้", exact: true }).click()
  const toast = toastRegion(page).getByRole("alert")
  await expect(toast).toContainText("ไม่สามารถบันทึกผู้ใช้ได้")
  await expect(toast).toBeInViewport({ ratio: 1 })
  await expect(dialog.getByLabel("ชื่อ", { exact: true })).toHaveValue("ผู้ใช้ใหม่ toast")
  expect(await toast.evaluate((element) => getComputedStyle(element).animationName)).toBe("none")
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true)
  await page.screenshot({ path: testInfo.outputPath("toast-error-mobile.png"), fullPage: true })
  await toast.getByRole("button", { name: "ปิดการแจ้งเตือน" }).focus()
  await page.keyboard.press("Enter")
  await expect(toastRegion(page)).toHaveCount(0)
  await expect(dialog).toBeVisible()
})
