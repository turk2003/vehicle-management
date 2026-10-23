import "dotenv/config"
import { randomUUID } from "node:crypto"
import bcrypt from "bcryptjs"
import { Pool } from "pg"
import { test, expect, type Page } from "@playwright/test"
import { bangkokDateKey, shiftCalendarMonth } from "../lib/calendar/dates"
import type { CalendarSnapshot } from "../lib/calendar/types"

const pool = new Pool({ connectionString: process.env.DATABASE_URL })
const suffix = randomUUID().slice(0, 8)
const password = "Calendar-test-123"
const today = bangkokDateKey(new Date())
const month = today.slice(0, 7)
const roles = ["USER", "ADMIN", "APPROVER"] as const
const accounts = roles.map((role) => ({ id: randomUUID(), role, email: `calendar-${role}-${suffix}@example.com` }))
const typeId = randomUUID()
const vehicleId = randomUUID()
const heldVehicleId = randomUUID()
const plate = `CAL-${suffix}`
const heldPlate = `HLD-${suffix}`
const bookingIds: string[] = []

async function login(page: Page, role: typeof roles[number] = "USER") {
  const account = accounts.find((item) => item.role === role)!
  const response = await page.request.post("/api/auth/login", { data: { email: account.email, password } })
  expect(response.status()).toBe(200)
}

test.beforeAll(async () => {
  const hash = await bcrypt.hash(password, 4)
  for (const account of accounts) {
    await pool.query(`INSERT INTO "User" ("id", "name", "email", "password", "role", "createdAt") VALUES ($1,$2,$3,$4,$5::"UserRole",NOW())`,
      [account.id, `ผู้ทดสอบปฏิทิน ${account.role} ${suffix}`, account.email, hash, account.role])
  }
  await pool.query(`INSERT INTO "VehicleType" ("id", "name") VALUES ($1,$2)`, [typeId, `รถทดสอบปฏิทิน ${suffix}`])
  for (const [id, number] of [[vehicleId, plate], [heldVehicleId, heldPlate]]) {
    await pool.query(`INSERT INTO "Vehicle" ("id", "plateNumber", "status", "currentMileage", "typeId") VALUES ($1,$2,'AVAILABLE',0,$3)`, [id, number, typeId])
  }
  async function addBooking(status: string, start: Date, end: Date, held = false) {
    const id = randomUUID()
    bookingIds.push(id)
    await pool.query(`INSERT INTO "Booking" ("id", "userId", "vehicleId", "startDate", "endDate", "purpose", "destination", "status", "pickedUpAt", "returnedAt", "createdAt", "updatedAt") VALUES ($1,$2,$3,$4,$5,$6,$7,$8::"BookingStatus",$9,$10,NOW(),NOW())`,
      [id, accounts[0].id, held ? heldVehicleId : vehicleId, start.toISOString(), end.toISOString(), `ตรวจงาน ${status} ${suffix}`, `ปลายทาง ${suffix}`, status,
        held || status === "COMPLETED" ? start.toISOString() : null, status === "COMPLETED" ? end.toISOString() : null])
  }
  for (const status of ["PENDING", "APPROVED", "CHANGED", "COMPLETED", "CANCELLED", "REJECTED"]) {
    await addBooking(status, new Date(`${today}T08:00:00+07:00`), new Date(`${today}T10:00:00+07:00`))
  }
  // This trip ends exactly at the selected day's midnight and must not appear in that day's list.
  const midnight = new Date(`${today}T00:00:00+07:00`)
  await addBooking("APPROVED", new Date(midnight.getTime() - 3_600_000), midnight)
  await addBooking("IN_PROGRESS", new Date(`${shiftCalendarMonth(month, -1)}-01T08:00:00+07:00`), new Date(midnight.getTime() - 1000), true)
})

test.afterAll(async () => {
  await pool.query(`DELETE FROM "Booking" WHERE "id" = ANY($1::text[])`, [bookingIds])
  await pool.query(`DELETE FROM "Vehicle" WHERE "id" = ANY($1::text[])`, [[vehicleId, heldVehicleId]])
  await pool.query(`DELETE FROM "VehicleType" WHERE "id" = $1`, [typeId])
  await pool.query(`DELETE FROM "Log" WHERE "userId" = ANY($1::text[])`, [accounts.map((account) => account.id)])
  await pool.query(`DELETE FROM "User" WHERE "id" = ANY($1::text[])`, [accounts.map((account) => account.id)])
  await pool.end()
})

for (const role of roles) {
  test(`${role} opens the shared calendar even when dashboard permissions are empty`, async ({ page }) => {
    await login(page, role)
    await page.route("**/api/auth/me", async (route) => {
      const response = await route.fetch()
      await route.fulfill({ response, json: { ...(await response.json()), permissions: [] } })
    })
    await page.goto(`/${role.toLowerCase()}`)
    await page.getByRole("button", { name: /ปฏิทินการใช้รถ/ }).click()
    await expect(page).toHaveURL("/calendar")
    await expect(page.getByRole("heading", { name: "ปฏิทินการใช้รถ", exact: true })).toBeVisible()
    // Use the browser's cookie handling, including Secure cookies on loopback in production.
    const response = await page.evaluate(async (selectedMonth) => {
      const result = await fetch(`/api/calendar?month=${selectedMonth}`)
      return { status: result.status, snapshot: await result.json() as CalendarSnapshot }
    }, month)
    expect(response.status).toBe(200)
    const snapshot = response.snapshot
    const expected = today.endsWith("-01") ? ["APPROVED", "CHANGED", "COMPLETED", "PENDING"] : ["APPROVED", "APPROVED", "CHANGED", "COMPLETED", "PENDING"]
    expect(snapshot.bookings.filter((item) => item.vehicle.id === vehicleId).map((item) => item.status).sort()).toEqual(expected)
    expect(snapshot.vehicles.find((item) => item.id === heldVehicleId)).toMatchObject({ status: "IN_USE", holders: [{ name: `ผู้ทดสอบปฏิทิน USER ${suffix}`, overdue: true }] })
    expect(JSON.stringify(snapshot)).not.toContain(accounts[0].email)
    expect(JSON.stringify(snapshot)).not.toContain("mileageStart")
    const stored = await pool.query<{ status: string }>(`SELECT "status" FROM "Vehicle" WHERE "id" = $1`, [heldVehicleId])
    expect(stored.rows[0].status).toBe("AVAILABLE")
    await expect(page.getByRole("link", { name: "กลับ Dashboard" })).toHaveAttribute("href", `/${role.toLowerCase()}`)
  })
}

test("shows daily details, changes months and keeps the current holder independent of selection", async ({ page }) => {
  await login(page)
  await page.goto("/calendar")
  const daily = page.getByRole("region", { name: "รายการจองรายวัน" })
  const trip = daily.locator("li").filter({ has: page.getByRole("heading", { name: plate, exact: true }) })
  await expect(trip).toHaveCount(4)
  await trip.first().locator("summary").click()
  await expect(trip.first()).toContainText(`ปลายทาง ${suffix}`)
  await expect(daily).not.toContainText(`ตรวจงาน CANCELLED ${suffix}`)
  const fleet = page.getByRole("region", { name: "สถานะรถปัจจุบัน" })
  const held = fleet.locator("li").filter({ has: page.getByRole("heading", { name: heldPlate, exact: true }) })
  await expect(held).toContainText("เกินกำหนดคืน")
  await page.getByRole("button", { name: "เดือนถัดไป", exact: true }).click()
  await expect(page.locator(`[data-date="${shiftCalendarMonth(month, 1)}-01"]`)).toHaveAttribute("aria-pressed", "true")
  await expect(held).toContainText(`ผู้ทดสอบปฏิทิน USER ${suffix}`)
  await page.getByRole("button", { name: "วันนี้", exact: true }).click()
  await expect(page.locator(`[data-date="${today}"]`)).toHaveAttribute("aria-pressed", "true")
  await expect(trip).toHaveCount(4)
  await page.getByRole("button", { name: "รีเฟรชข้อมูล", exact: true }).click()
  await expect(page.getByRole("button", { name: "รีเฟรชข้อมูล", exact: true })).toBeEnabled()
})

test("keeps the last successful data when a refresh fails and allows retry", async ({ page }) => {
  await login(page)
  await page.goto("/calendar")
  await expect(page.getByRole("region", { name: "สถานะรถปัจจุบัน" })).toContainText(heldPlate)
  await page.route("**/api/calendar?**", (route) => route.fulfill({ status: 500, json: { message: "test failure" } }))
  await page.getByRole("button", { name: "รีเฟรชข้อมูล", exact: true }).click()
  await expect(page.getByRole("main").getByRole("alert")).toContainText("อัปเดตข้อมูลไม่สำเร็จ")
  await expect(page.getByRole("region", { name: "สถานะรถปัจจุบัน" })).toContainText(heldPlate)
  await page.unroute("**/api/calendar?**")
  await page.getByRole("button", { name: "ลองใหม่", exact: true }).click()
  await expect(page.getByRole("main").getByRole("alert")).toHaveCount(0)
})

test("does not let an older month's response overwrite the selected month", async ({ page }) => {
  await login(page)
  await page.goto("/calendar")
  await expect(page.getByRole("region", { name: "สถานะรถปัจจุบัน" })).toContainText(heldPlate)
  const next = shiftCalendarMonth(month, 1)!
  let release!: () => void
  const delayed = new Promise<void>((resolve) => { release = resolve })
  await page.route(`**/api/calendar?month=${next}`, async (route) => {
    const response = await route.fetch()
    await delayed
    await route.fulfill({ response }).catch(() => {})
  })
  const pending = page.waitForRequest((request) => request.url().includes(`/api/calendar?month=${next}`))
  await page.getByRole("button", { name: "เดือนถัดไป", exact: true }).click()
  await pending
  await page.getByRole("button", { name: "เดือนก่อนหน้า", exact: true }).click()
  release()
  await expect(page.locator(`[data-date="${month}-01"]`)).toHaveAttribute("aria-pressed", "true")
  await expect(page.getByRole("region", { name: "รายการจองรายวัน" })).not.toContainText("ยังไม่สามารถแสดง")
})

test("fits a mobile screen and supports keyboard selection", async ({ page }, testInfo) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await login(page)
  await page.goto("/calendar")
  await expect(page.getByRole("button", { name: "รีเฟรชข้อมูล", exact: true })).toBeEnabled()
  const day = page.locator(`[data-date="${today}"]`)
  await day.focus()
  await page.keyboard.press("Enter")
  await expect(day).toHaveAttribute("aria-pressed", "true")
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true)
  await page.screenshot({ path: testInfo.outputPath("calendar-mobile.png"), fullPage: true })
  await page.setViewportSize({ width: 1440, height: 1000 })
  await page.screenshot({ path: testInfo.outputPath("calendar-desktop.png"), fullPage: true })
})

test("redirects unauthenticated visitors to login", async ({ page }) => {
  await page.goto("/calendar")
  await expect(page).toHaveURL("/")
  expect((await page.request.get("/api/calendar")).status()).toBe(401)
})

test("recovers from an initial load error without claiming the fleet is empty", async ({ page }) => {
  await login(page)
  await page.route("**/api/calendar?**", (route) => route.fulfill({ status: 500, json: { message: "test failure" } }))
  await page.goto("/calendar")
  await expect(page.getByRole("main").getByRole("alert")).toContainText("ไม่สามารถโหลดข้อมูลปฏิทินได้")
  await expect(page.getByText("ยังไม่มีรถในระบบ", { exact: true })).toHaveCount(0)
  await page.unroute("**/api/calendar?**")
  await page.getByRole("button", { name: "ลองใหม่", exact: true }).click()
  await expect(page.getByRole("region", { name: "สถานะรถปัจจุบัน" })).toContainText(heldPlate)
})

test("shows clear empty states", async ({ page }) => {
  await login(page)
  await page.route("**/api/calendar?**", (route) => route.fulfill({ json: { month, asOf: new Date().toISOString(), bookings: [], vehicles: [] } }))
  await page.goto("/calendar")
  await expect(page.getByRole("region", { name: "รายการจองรายวัน" })).toContainText("ไม่มีการจองในวันนี้")
  await expect(page.getByRole("region", { name: "สถานะรถปัจจุบัน" })).toContainText("ยังไม่มีรถในระบบ")
})

test("displays every holder and a warning when custody data conflicts", async ({ page }) => {
  await login(page)
  await page.route("**/api/calendar?**", async (route) => {
    const response = await route.fetch()
    const snapshot: CalendarSnapshot = await response.json()
    const held = snapshot.vehicles.find((item) => item.id === heldVehicleId)!
    held.holders.push({ ...held.holders[0], bookingId: "duplicate-holder", name: "ผู้ถือรถคนที่สอง" })
    await route.fulfill({ response, json: snapshot })
  })
  await page.goto("/calendar")
  const fleet = page.getByRole("region", { name: "สถานะรถปัจจุบัน" })
  await expect(fleet).toContainText("พบผู้ถือรถหลายรายการ")
  await expect(fleet).toContainText(`ผู้ทดสอบปฏิทิน USER ${suffix}`)
  await expect(fleet).toContainText("ผู้ถือรถคนที่สอง")
})

test("refreshes automatically and when focus returns", async ({ page }) => {
  await login(page)
  await page.clock.install()
  await page.goto("/calendar")
  await expect(page.getByRole("button", { name: "รีเฟรชข้อมูล", exact: true })).toBeEnabled()
  const automatic = page.waitForResponse((response) => response.url().includes("/api/calendar?") && response.ok())
  await page.clock.fastForward(30_001)
  await automatic
  await expect(page.getByRole("button", { name: "รีเฟรชข้อมูล", exact: true })).toBeEnabled()
  const refocused = page.waitForResponse((response) => response.url().includes("/api/calendar?") && response.ok())
  await page.evaluate(() => window.dispatchEvent(new Event("focus")))
  await refocused
})
