import "dotenv/config"
import { expect, test, type Page } from "@playwright/test"
import { randomUUID } from "node:crypto"
import { Pool } from "pg"
import bcrypt from "bcryptjs"

const pool = new Pool({ connectionString: process.env.DATABASE_URL })
const suffix = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
const adminEmail = `booking-mileage-admin-${suffix}@example.com`
const password = "Booking-mileage-test-123"
const plateNumber = `BKM-${suffix.slice(-6).toUpperCase()}`
const purpose = `Admin pickup and return ${suffix}`

let adminId = ""
let userId = ""
let vehicleTypeId = ""
let vehicleId = ""
let bookingId = ""
const createdPermissionIds: string[] = []

async function login(page: Page) {
  await page.goto("/")
  await page.locator("#email").fill(adminEmail)
  await page.locator("#password").fill(password)
  await page.locator("form").getByRole("button", { name: "เข้าสู่ระบบ" }).click()
  await expect(page).not.toHaveURL("/")
}

test.beforeAll(async () => {
  const hashedPassword = await bcrypt.hash(password, 4)
  adminId = randomUUID()
  userId = randomUUID()
  vehicleTypeId = randomUUID()
  vehicleId = randomUUID()
  bookingId = randomUUID()

  await Promise.all([
    pool.query(
      `INSERT INTO "User" ("id", "name", "email", "password", "role", "createdAt")
       VALUES ($1, $2, $3, $4, 'ADMIN', NOW())`,
      [adminId, "Booking Mileage Admin", adminEmail, hashedPassword],
    ),
    pool.query(
      `INSERT INTO "User" ("id", "name", "email", "password", "role", "createdAt")
       VALUES ($1, $2, $3, $4, 'USER', NOW())`,
      [
        userId,
        "Booking Mileage User",
        `booking-mileage-user-${suffix}@example.com`,
        hashedPassword,
      ],
    ),
  ])

  for (const permission of [
    "BOOKING_VIEW",
    "BOOKING_MANAGE",
    "USER_MANAGE",
    "VEHICLE_VIEW",
  ]) {
    const existing = await pool.query<{ id: string }>(
      `SELECT "id" FROM "RolePermission"
       WHERE "role" = 'ADMIN' AND "permission" = $1::"Permission"`,
      [permission],
    )
    if (existing.rowCount === 0) {
      const permissionId = randomUUID()
      await pool.query(
        `INSERT INTO "RolePermission" ("id", "role", "permission")
         VALUES ($1, 'ADMIN', $2::"Permission")`,
        [permissionId, permission],
      )
      createdPermissionIds.push(permissionId)
    }
  }

  await pool.query(
    `INSERT INTO "VehicleType" ("id", "name") VALUES ($1, $2)`,
    [vehicleTypeId, `Booking Mileage Type ${suffix}`],
  )
  await pool.query(
    `INSERT INTO "Vehicle" ("id", "plateNumber", "status", "currentMileage", "typeId")
     VALUES ($1, $2, 'BOOKED', 42000, $3)`,
    [vehicleId, plateNumber, vehicleTypeId],
  )

  const startDate = new Date(Date.now() + 60 * 60 * 1000)
    .toISOString()
    .slice(0, -1)
  const endDate = new Date(Date.now() + 5 * 60 * 60 * 1000)
    .toISOString()
    .slice(0, -1)
  await pool.query(
    `INSERT INTO "Booking"
      ("id", "userId", "vehicleId", "approverId", "startDate", "endDate",
       "purpose", "status", "createdAt", "updatedAt")
     VALUES ($1, $2, $3, $4, $5, $6, $7, 'APPROVED', NOW(), NOW())`,
    [
      bookingId,
      userId,
      vehicleId,
      adminId,
      startDate,
      endDate,
      purpose,
    ],
  )
})

test.afterAll(async () => {
  if (bookingId || userId) {
    await pool.query(
      `DELETE FROM "Notification"
       WHERE "bookingId" = $1 OR "userId" = $2`,
      [bookingId || null, userId || null],
    )
  }
  if (adminId || userId) {
    await pool.query(`DELETE FROM "Log" WHERE "userId" = ANY($1::text[])`, [
      [adminId, userId].filter(Boolean),
    ])
  }
  if (bookingId) {
    await pool.query(`DELETE FROM "Booking" WHERE "id" = $1`, [bookingId])
  }
  if (vehicleId) {
    await pool.query(`DELETE FROM "Vehicle" WHERE "id" = $1`, [vehicleId])
  }
  if (adminId || userId) {
    await pool.query(`DELETE FROM "User" WHERE "id" = ANY($1::text[])`, [
      [adminId, userId].filter(Boolean),
    ])
  }
  if (vehicleTypeId) {
    await pool.query(`DELETE FROM "VehicleType" WHERE "id" = $1`, [
      vehicleTypeId,
    ])
  }
  if (createdPermissionIds.length > 0) {
    await pool.query(
      `DELETE FROM "RolePermission" WHERE "id" = ANY($1::text[])`,
      [createdPermissionIds],
    )
  }
  await pool.end()
})

test("admin records pickup and return mileage on behalf of a user", async ({
  page,
}) => {
  await login(page)
  await page.goto("/admin/bookings")

  const bookingRow = page.getByRole("row").filter({ hasText: plateNumber })
  await expect(bookingRow).toContainText("อนุมัติแล้ว")
  await bookingRow.getByRole("button", { name: "รับรถแทนผู้ใช้" }).click()

  const pickupDialog = page.getByRole("dialog", {
    name: "บันทึกรับรถแทนผู้ใช้",
  })
  await pickupDialog.locator("#admin-booking-mileage").fill("42010")
  await pickupDialog.getByRole("button", { name: "ยืนยันรับรถ" }).click()

  await expect(page.getByRole("status")).toContainText("บันทึกรับรถ")
  await expect(bookingRow).toContainText("กำลังใช้งาน")
  await expect(bookingRow.getByRole("button", { name: "แก้ไข" })).toHaveCount(0)
  await bookingRow.getByRole("button", { name: "คืนรถแทนผู้ใช้" }).click()

  const returnDialog = page.getByRole("dialog", {
    name: "บันทึกคืนรถแทนผู้ใช้",
  })
  await returnDialog.locator("#admin-booking-mileage").fill("42075")
  await returnDialog.getByRole("button", { name: "ยืนยันคืนรถ" }).click()

  await expect(page.getByRole("status")).toContainText("บันทึกคืนรถ")
  await expect(bookingRow).toContainText("เสร็จสิ้น")
  await expect(bookingRow).toContainText("ระยะทาง: 65 km")

  const storedBooking = await pool.query<{
    status: string
    mileageStart: number | null
    mileageEnd: number | null
  }>(
    `SELECT "status", "mileageStart", "mileageEnd"
     FROM "Booking" WHERE "id" = $1`,
    [bookingId],
  )
  expect(storedBooking.rows[0]).toMatchObject({
    status: "COMPLETED",
    mileageStart: 42010,
    mileageEnd: 42075,
  })

  const storedVehicle = await pool.query<{ currentMileage: number }>(
    `SELECT "currentMileage" FROM "Vehicle" WHERE "id" = $1`,
    [vehicleId],
  )
  expect(storedVehicle.rows[0].currentMileage).toBe(42075)
})
