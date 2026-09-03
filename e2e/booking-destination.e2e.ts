import "dotenv/config"
import { expect, test, type Page } from "@playwright/test"
import { randomUUID } from "node:crypto"
import { Pool } from "pg"
import bcrypt from "bcryptjs"

const pool = new Pool({ connectionString: process.env.DATABASE_URL })
const suffix = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
const email = `destination-${suffix}@example.com`
const password = "Destination-test-123"
const initialDestination = `สำนักงานเขต ${suffix}`
const updatedDestination = `ศูนย์ราชการ ${suffix}`
const purpose = `ทดสอบปลายทาง ${suffix}`

let userId = ""
let vehicleTypeId = ""
let vehicleId = ""
let bookingId = ""

async function login(page: Page) {
  await page.goto("/")
  await page.locator("#email").fill(email)
  await page.locator("#password").fill(password)
  await page.locator("form").getByRole("button", { name: "เข้าสู่ระบบ" }).click()
  await expect(page).not.toHaveURL("/")
}

test.beforeAll(async () => {
  const hashedPassword = await bcrypt.hash(password, 4)
  userId = randomUUID()
  vehicleTypeId = randomUUID()
  vehicleId = randomUUID()

  await pool.query(
    `INSERT INTO "User" ("id", "name", "email", "password", "role", "createdAt")
     VALUES ($1, $2, $3, $4, 'USER', NOW())`,
    [userId, "Destination Test User", email, hashedPassword]
  )
  await pool.query(
    `INSERT INTO "VehicleType" ("id", "name") VALUES ($1, $2)`,
    [vehicleTypeId, `Destination Test Type ${suffix}`]
  )
  await pool.query(
    `INSERT INTO "Vehicle" ("id", "plateNumber", "status", "currentMileage", "typeId")
     VALUES ($1, $2, 'AVAILABLE', 1000, $3)`,
    [vehicleId, `DST-${suffix.slice(-6).toUpperCase()}`, vehicleTypeId]
  )
})

test.afterAll(async () => {
  if (userId) {
    await pool.query(`DELETE FROM "Log" WHERE "userId" = $1`, [userId])
  }
  if (bookingId) {
    await pool.query(`DELETE FROM "Booking" WHERE "id" = $1`, [bookingId])
  }
  if (vehicleId) {
    await pool.query(`DELETE FROM "Vehicle" WHERE "id" = $1`, [vehicleId])
  }
  if (userId) {
    await pool.query(`DELETE FROM "User" WHERE "id" = $1`, [userId])
  }
  if (vehicleTypeId) {
    await pool.query(`DELETE FROM "VehicleType" WHERE "id" = $1`, [vehicleTypeId])
  }
  await pool.end()
})

test("stores, displays, edits and clears a booking destination", async ({ page }) => {
  await login(page)

  const startDate = new Date(Date.now() + 2 * 60 * 60 * 1000)
  const endDate = new Date(startDate.getTime() + 2 * 60 * 60 * 1000)
  const createResponse = await page.request.post("/api/booking", {
    data: {
      vehicleId,
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
      purpose,
      destination: `  ${initialDestination}  `,
    },
  })

  expect(createResponse.status()).toBe(200)
  const createdBooking = await createResponse.json()
  bookingId = createdBooking.id
  expect(createdBooking.destination).toBe(initialDestination)

  const stored = await pool.query<{ destination: string | null }>(
    `SELECT "destination" FROM "Booking" WHERE "id" = $1`,
    [bookingId]
  )
  expect(stored.rows[0].destination).toBe(initialDestination)

  await page.goto("/user/my-bookings")
  const bookingCard = page.locator("article").filter({ hasText: purpose })
  await expect(bookingCard).toContainText(initialDestination)
  await bookingCard.getByRole("button", { name: "แก้ไข" }).click()

  const editDialog = page.getByRole("dialog", { name: "แก้ไขการจอง" })
  await editDialog.locator("#edit-destination").fill(`  ${updatedDestination}  `)
  await editDialog.getByRole("button", { name: "บันทึกการแก้ไข" }).click()
  await expect(page.getByRole("status")).toContainText("บันทึกการแก้ไขการจอง")

  const updated = await pool.query<{ destination: string | null }>(
    `SELECT "destination" FROM "Booking" WHERE "id" = $1`,
    [bookingId]
  )
  expect(updated.rows[0].destination).toBe(updatedDestination)

  const updatedCard = page.locator("article").filter({ hasText: purpose })
  await updatedCard.getByRole("button", { name: "แก้ไข" }).click()
  const clearDialog = page.getByRole("dialog", { name: "แก้ไขการจอง" })
  await clearDialog.locator("#edit-destination").fill("")
  await clearDialog.getByRole("button", { name: "บันทึกการแก้ไข" }).click()
  await expect(page.getByRole("status")).toContainText("บันทึกการแก้ไขการจอง")

  const cleared = await pool.query<{ destination: string | null }>(
    `SELECT "destination" FROM "Booking" WHERE "id" = $1`,
    [bookingId]
  )
  expect(cleared.rows[0].destination).toBeNull()
})
