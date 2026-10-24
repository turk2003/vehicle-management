import "dotenv/config"
import { randomUUID } from "node:crypto"
import bcrypt from "bcryptjs"
import { Pool } from "pg"
import { test, expect, type Page } from "@playwright/test"
import { bangkokDateKey, formatCalendarDate, shiftCalendarMonth } from "../lib/calendar/dates"
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
const boundaryVehicleId = randomUUID()
const plate = `CAL-${suffix}`
const heldPlate = `HLD-${suffix}`
const boundaryPlate = `BND-${suffix}`
const bookingIds: string[] = []
const nextMonthStart = `${shiftCalendarMonth(month, 1)}-01`
const monthLastDay = bangkokDateKey(new Date(new Date(`${nextMonthStart}T00:00:00+07:00`).getTime() - 1))
let boundaryFirstBooking = ""
let boundarySecondBooking = ""
let outsideRangeTripId = ""

// The calendar must stay on Bangkok dates even when the viewer's computer is elsewhere.
test.use({ timezoneId: "America/Los_Angeles" })

function calendarRegion(page: Page) {
  return page.getByRole("region", { name: "ตารางการจองรถ" })
}

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
  for (const [id, number] of [[vehicleId, plate], [heldVehicleId, heldPlate], [boundaryVehicleId, boundaryPlate]]) {
    await pool.query(`INSERT INTO "Vehicle" ("id", "plateNumber", "status", "currentMileage", "typeId") VALUES ($1,$2,'AVAILABLE',0,$3)`, [id, number, typeId])
  }
  async function addBooking(status: string, start: Date, end: Date, held = false, targetVehicleId = vehicleId) {
    const id = randomUUID()
    bookingIds.push(id)
    await pool.query(`INSERT INTO "Booking" ("id", "userId", "vehicleId", "startDate", "endDate", "purpose", "destination", "status", "pickedUpAt", "returnedAt", "createdAt", "updatedAt") VALUES ($1,$2,$3,$4,$5,$6,$7,$8::"BookingStatus",$9,$10,NOW(),NOW())`,
      [id, accounts[0].id, held ? heldVehicleId : targetVehicleId, start.toISOString(), end.toISOString(), `ตรวจงาน ${status} ${suffix}`, `ปลายทาง ${suffix}`, status,
        held || status === "COMPLETED" ? start.toISOString() : null, status === "COMPLETED" ? end.toISOString() : null])
    return id
  }
  for (const status of ["PENDING", "APPROVED", "CHANGED", "COMPLETED", "CANCELLED", "REJECTED"]) {
    await addBooking(status, new Date(`${today}T08:00:00+07:00`), new Date(`${today}T10:00:00+07:00`))
  }
  // This trip ends exactly at the selected day's midnight and must not appear in that day's list.
  const midnight = new Date(`${today}T00:00:00+07:00`)
  await addBooking("APPROVED", new Date(midnight.getTime() - 3_600_000), midnight)
  await addBooking("IN_PROGRESS", new Date(`${shiftCalendarMonth(month, -1)}-01T08:00:00+07:00`), new Date(midnight.getTime() - 1000), true)
  outsideRangeTripId = await addBooking("APPROVED", new Date(`${shiftCalendarMonth(month, -1)}-01T08:00:00+07:00`), new Date(midnight.getTime() + 86_400_000), false, boundaryVehicleId)
  boundaryFirstBooking = await addBooking("APPROVED", new Date(`${monthLastDay}T08:00:00+07:00`), new Date(`${monthLastDay}T10:00:00+07:00`), false, boundaryVehicleId)
  boundarySecondBooking = await addBooking("APPROVED", new Date(`${nextMonthStart}T08:00:00+07:00`), new Date(`${nextMonthStart}T10:00:00+07:00`), false, boundaryVehicleId)
})

test.afterAll(async () => {
  await pool.query(`DELETE FROM "Booking" WHERE "id" = ANY($1::text[])`, [bookingIds])
  await pool.query(`DELETE FROM "Vehicle" WHERE "id" = ANY($1::text[])`, [[vehicleId, heldVehicleId, boundaryVehicleId]])
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
  await expect(calendarRegion(page).locator(`[data-date="${shiftCalendarMonth(month, 1)}-01"]`)).toHaveClass(/calendar-selected-day/)
  await expect(held).toContainText(`ผู้ทดสอบปฏิทิน USER ${suffix}`)
  await page.getByRole("button", { name: "วันนี้", exact: true }).click()
  await expect(calendarRegion(page).locator(`[data-date="${today}"]`)).toHaveClass(/calendar-selected-day/)
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
  const requests: string[] = []
  page.on("request", (request) => { if (request.url().includes("/api/calendar?")) requests.push(request.url()) })
  await page.goto("/calendar")
  await expect(page.getByRole("region", { name: "สถานะรถปัจจุบัน" })).toContainText(heldPlate)
  const initialUrl = requests.at(-1)!
  let release!: () => void
  const delayed = new Promise<void>((resolve) => { release = resolve })
  let delayNext = true
  await page.route("**/api/calendar?**", async (route) => {
    if (!delayNext) { await route.continue(); return }
    delayNext = false
    const response = await route.fetch()
    await delayed
    await route.fulfill({ response }).catch(() => {})
  })
  const pending = page.waitForRequest((request) => request.url().includes("/api/calendar?") && request.url() !== initialUrl)
  await page.getByRole("button", { name: "เดือนถัดไป", exact: true }).click()
  await pending
  const restored = page.waitForResponse((response) => response.url() === initialUrl && response.ok())
  await page.getByRole("button", { name: "เดือนก่อนหน้า", exact: true }).click()
  await restored
  release()
  await expect(calendarRegion(page).getByRole("heading", { name: formatCalendarDate(`${month}-01T00:00:00+07:00`, "month"), exact: true })).toBeVisible()
  await expect(page.getByRole("region", { name: "รายการจองรายวัน" })).not.toContainText("ยังไม่สามารถแสดง")
})

test("fits a mobile screen and supports keyboard selection", async ({ page }, testInfo) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await login(page)
  await page.goto("/calendar")
  await expect(page.getByRole("button", { name: "รีเฟรชข้อมูล", exact: true })).toBeEnabled()
  const day = calendarRegion(page).locator(`[data-date="${today}"]`).getByRole("link").first()
  await day.focus()
  await page.keyboard.press("Enter")
  await expect(calendarRegion(page).locator(`[data-date="${today}"]`)).toHaveClass(/calendar-selected-day/)
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
  await page.route("**/api/calendar?**", (route) => {
    const params = new URL(route.request().url()).searchParams
    return route.fulfill({ json: { month, range: { start: params.get("start"), end: params.get("end") }, asOf: new Date().toISOString(), bookings: [], vehicles: [] } })
  })
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

test("switches month, week and day views while keeping Bangkok time on a foreign computer", async ({ page }, testInfo) => {
  await login(page)
  await page.goto("/calendar")
  const calendar = calendarRegion(page)
  const controls = calendar.getByRole("group", { name: "มุมมองปฏิทิน" })
  await expect(page.getByRole("button", { name: "รีเฟรชข้อมูล", exact: true })).toBeEnabled()
  await controls.getByRole("button", { name: "สัปดาห์", exact: true }).click()
  await expect(controls.getByRole("button", { name: "สัปดาห์", exact: true })).toHaveAttribute("aria-pressed", "true")
  await expect(calendar.getByRole("button", { name: "สัปดาห์ถัดไป", exact: true })).toBeVisible()
  await page.screenshot({ path: testInfo.outputPath("calendar-week.png"), fullPage: true })
  await controls.getByRole("button", { name: "วัน", exact: true }).click()
  await expect(controls.getByRole("button", { name: "วัน", exact: true })).toHaveAttribute("aria-pressed", "true")
  const events = calendar.locator("[data-booking-event]").filter({ hasText: plate })
  await expect(events).toHaveCount(4)
  await expect(events.first()).toContainText(/\b0?8:00\b/)
  await expect(events.first()).toContainText("10:00")
  await page.screenshot({ path: testInfo.outputPath("calendar-day.png"), fullPage: true })
  await controls.getByRole("button", { name: "เดือน", exact: true }).click()
  await expect(controls.getByRole("button", { name: "เดือน", exact: true })).toHaveAttribute("aria-pressed", "true")
})

test("clicking a calendar event opens its travel details", async ({ page }) => {
  await login(page)
  await page.goto("/calendar")
  await calendarRegion(page).getByRole("group", { name: "มุมมองปฏิทิน" }).getByRole("button", { name: "วัน", exact: true }).click()
  const event = calendarRegion(page).locator("[data-booking-event]").filter({ hasText: plate }).first()
  await expect(event).toBeVisible()
  const id = await event.getAttribute("data-booking-event")
  await event.click()
  const selected = page.getByRole("region", { name: "รายการจองรายวัน" }).locator(`[data-booking-id="${id}"]`)
  await expect(selected).toHaveAttribute("data-selected", "true")
  await expect(selected.locator("details")).toHaveAttribute("open", "")
  await expect(selected).toContainText(`ปลายทาง ${suffix}`)
})

test("clicking a trip that started before the visible range keeps details on a visible date", async ({ page }) => {
  await login(page)
  await page.goto("/calendar")
  const calendar = calendarRegion(page)
  const event = calendar.locator(`[data-booking-event="${outsideRangeTripId}"]`).first()
  await expect(event).toBeVisible()
  const firstDay = await calendar.locator("[data-date]").first().getAttribute("data-date")
  await event.click()
  const daily = page.getByRole("region", { name: "รายการจองรายวัน" })
  await expect(daily).toContainText(formatCalendarDate(`${firstDay}T00:00:00+07:00`, "date"))
  await expect(daily.locator(`[data-booking-id="${outsideRangeTripId}"]`)).toHaveAttribute("data-selected", "true")
})

test("loads both sides of a month boundary in the week view", async ({ page }) => {
  await login(page)
  await page.goto("/calendar")
  const calendar = calendarRegion(page)
  await expect(page.getByRole("button", { name: "รีเฟรชข้อมูล", exact: true })).toBeEnabled()
  await calendar.locator(`[data-date="${monthLastDay}"]`).getByRole("link").first().click()
  const loaded = page.waitForResponse((response) => response.url().includes("/api/calendar?") && response.ok())
  await calendar.getByRole("group", { name: "มุมมองปฏิทิน" }).getByRole("button", { name: "สัปดาห์", exact: true }).click()
  const snapshot: CalendarSnapshot = await (await loaded).json()
  const start = snapshot.range!.start
  const end = snapshot.range!.end
  const overlapsNextMonth = start <= nextMonthStart && end > nextMonthStart
  // If the month ends on Sunday, the following Monday is the next week.
  if (!overlapsNextMonth) {
    const nextWeek = page.waitForResponse((response) => response.url().includes("/api/calendar?") && response.ok())
    await calendar.getByRole("button", { name: "สัปดาห์ถัดไป", exact: true }).click()
    expect((await (await nextWeek).json()).bookings.map((item: { id: string }) => item.id)).toContain(boundarySecondBooking)
  } else {
    expect(snapshot.bookings.map((item) => item.id)).toEqual(expect.arrayContaining([boundaryFirstBooking, boundarySecondBooking]))
    await expect(calendar.locator(`[data-booking-event="${boundaryFirstBooking}"]`)).toBeVisible()
  }
  await expect(calendar.locator(`[data-booking-event="${boundarySecondBooking}"]`)).toBeVisible()
})

test("week and day views fit mobile without making the whole page scroll sideways", async ({ page }, testInfo) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await login(page)
  await page.goto("/calendar")
  const controls = calendarRegion(page).getByRole("group", { name: "มุมมองปฏิทิน" })
  await controls.getByRole("button", { name: "สัปดาห์", exact: true }).click()
  await expect(page.getByRole("button", { name: "รีเฟรชข้อมูล", exact: true })).toBeEnabled()
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true)
  await page.screenshot({ path: testInfo.outputPath("calendar-week-mobile.png"), fullPage: true })
  await controls.getByRole("button", { name: "วัน", exact: true }).click()
  await expect(page.getByRole("button", { name: "รีเฟรชข้อมูล", exact: true })).toBeEnabled()
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true)
  await page.screenshot({ path: testInfo.outputPath("calendar-day-mobile.png"), fullPage: true })
})
