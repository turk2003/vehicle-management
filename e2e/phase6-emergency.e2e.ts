import "dotenv/config"
import { expect, test, type Page } from "@playwright/test"
import { randomUUID } from "node:crypto"
import { Pool } from "pg"
import bcrypt from "bcryptjs"

const pool = new Pool({ connectionString: process.env.DATABASE_URL })
const suffix = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
const adminEmail = `phase6-admin-${suffix}@example.com`
const userEmail = `phase6-user-${suffix}@example.com`
const password = "Phase6-test-123"
const oldPlate = `OLD-${suffix.slice(-6).toUpperCase()}`
const newPlate = `NEW-${suffix.slice(-6).toUpperCase()}`
const issueDescription = `E2E เบรกขัดข้อง ${suffix}`
const changeReason = "รถเดิมระบบเบรกขัดข้องและต้องเข้าซ่อมฉุกเฉิน"

let adminId = ""
let userId = ""
let vehicleTypeId = ""
let oldVehicleId = ""
let newVehicleId = ""
let bookingId = ""
let maintenanceId = ""
const createdPermissionIds: string[] = []

async function login(page: Page, email: string) {
  await page.goto("/")
  await page.locator("#email").fill(email)
  await page.locator("#password").fill(password)
  await page.locator("form").getByRole("button", { name: "เข้าสู่ระบบ" }).click()
  await expect(page).not.toHaveURL("/")
}

test.beforeAll(async () => {
  const hashedPassword = await bcrypt.hash(password, 4)
  adminId = randomUUID()
  userId = randomUUID()
  await Promise.all([
    pool.query(
      `INSERT INTO "User" ("id", "name", "email", "password", "role", "createdAt")
       VALUES ($1, $2, $3, $4, 'ADMIN', NOW())`,
      [adminId, "Phase 6 Admin", adminEmail, hashedPassword]
    ),
    pool.query(
      `INSERT INTO "User" ("id", "name", "email", "password", "role", "createdAt")
       VALUES ($1, $2, $3, $4, 'USER', NOW())`,
      [userId, "Phase 6 User", userEmail, hashedPassword]
    )
  ])

  for (const role of ["ADMIN", "USER"]) {
    const existing = await pool.query<{ id: string }>(
      `SELECT "id" FROM "RolePermission"
       WHERE "role" = $1::"UserRole" AND "permission" = 'VEHICLE_VIEW'`,
      [role]
    )
    if (existing.rowCount === 0) {
      const permissionId = randomUUID()
      await pool.query(
        `INSERT INTO "RolePermission" ("id", "role", "permission")
         VALUES ($1, $2::"UserRole", 'VEHICLE_VIEW')`,
        [permissionId, role]
      )
      createdPermissionIds.push(permissionId)
    }
  }

  const reportPermission = await pool.query<{ id: string }>(
    `SELECT "id" FROM "RolePermission"
     WHERE "role" = 'ADMIN' AND "permission" = 'REPORT_VIEW'`
  )
  if (reportPermission.rowCount === 0) {
    const permissionId = randomUUID()
    await pool.query(
      `INSERT INTO "RolePermission" ("id", "role", "permission")
       VALUES ($1, 'ADMIN', 'REPORT_VIEW')`,
      [permissionId]
    )
    createdPermissionIds.push(permissionId)
  }

  vehicleTypeId = randomUUID()
  oldVehicleId = randomUUID()
  newVehicleId = randomUUID()
  await pool.query(
    `INSERT INTO "VehicleType" ("id", "name") VALUES ($1, $2)`,
    [vehicleTypeId, `Phase 6 Van ${suffix}`]
  )
  await Promise.all([
    pool.query(
      `INSERT INTO "Vehicle" ("id", "plateNumber", "status", "currentMileage", "typeId")
       VALUES ($1, $2, 'BOOKED', 25000, $3)`,
      [oldVehicleId, oldPlate, vehicleTypeId]
    ),
    pool.query(
      `INSERT INTO "Vehicle" ("id", "plateNumber", "status", "currentMileage", "typeId")
       VALUES ($1, $2, 'AVAILABLE', 12000, $3)`,
      [newVehicleId, newPlate, vehicleTypeId]
    )
  ])

  const startDate = new Date(Date.now() + 60 * 60 * 1000)
  const endDate = new Date(startDate.getTime() + 4 * 60 * 60 * 1000)
  bookingId = randomUUID()
  await pool.query(
    `INSERT INTO "Booking"
      ("id", "userId", "vehicleId", "approverId", "startDate", "endDate",
       "purpose", "status", "createdAt", "updatedAt")
     VALUES ($1, $2, $3, $4, $5, $6, $7, 'APPROVED', NOW(), NOW())`,
    [
      bookingId,
      userId,
      oldVehicleId,
      adminId,
      startDate,
      endDate,
      "Phase 6 emergency E2E"
    ]
  )
})

test.afterAll(async () => {
  if (bookingId || maintenanceId) {
    await pool.query(
      `DELETE FROM "Notification"
       WHERE "bookingId" = $1 OR "maintenanceId" = $2`,
      [bookingId || null, maintenanceId || null]
    )
  }
  if (adminId || userId) {
    await pool.query(`DELETE FROM "Log" WHERE "userId" = ANY($1::text[])`, [
      [adminId, userId].filter(Boolean)
    ])
  }
  if (maintenanceId) {
    await pool.query(`DELETE FROM "Maintenance" WHERE "id" = $1`, [
      maintenanceId
    ])
  }
  if (bookingId) {
    await pool.query(`DELETE FROM "Booking" WHERE "id" = $1`, [bookingId])
  }
  if (oldVehicleId || newVehicleId) {
    await pool.query(`DELETE FROM "Vehicle" WHERE "id" = ANY($1::text[])`, [
      [oldVehicleId, newVehicleId].filter(Boolean)
    ])
  }
  if (adminId || userId) {
    await pool.query(`DELETE FROM "User" WHERE "id" = ANY($1::text[])`, [
      [adminId, userId].filter(Boolean)
    ])
  }
  if (vehicleTypeId) {
    await pool.query(`DELETE FROM "VehicleType" WHERE "id" = $1`, [
      vehicleTypeId
    ])
  }
  if (createdPermissionIds.length > 0) {
    await pool.query(
      `DELETE FROM "RolePermission" WHERE "id" = ANY($1::text[])`,
      [createdPermissionIds]
    )
  }
  await pool.end()
})

test("user reports an emergency and admin replaces the vehicle", async ({
  browser
}) => {
  const userContext = await browser.newContext()
  const adminContext = await browser.newContext()
  const userPage = await userContext.newPage()
  const adminPage = await adminContext.newPage()

  await login(userPage, userEmail)
  await userPage.goto("/user/maintenance")
  await userPage.getByRole("button", { name: "แจ้งซ่อม" }).click()
  await userPage.locator("#maintenance-vehicle").selectOption(oldVehicleId)
  await userPage.locator("#maintenance-type").selectOption("BREAKDOWN")
  await userPage.locator("#maintenance-description").fill(issueDescription)
  await userPage
    .getByRole("dialog")
    .getByRole("button", { name: "ยืนยันแจ้งซ่อม" })
    .click()
  await expect(userPage.getByRole("status")).toContainText(
    "แจ้งซ่อมเรียบร้อยแล้ว"
  )

  const maintenance = await pool.query<{ id: string }>(
    `SELECT "id" FROM "Maintenance"
     WHERE "reporterId" = $1 AND "description" = $2
     LIMIT 1`,
    [userId, issueDescription]
  )
  maintenanceId = maintenance.rows[0].id

  await login(adminPage, adminEmail)
  const notificationButton = adminPage.getByRole("button", {
    name: /การแจ้งเตือนที่ยังไม่อ่าน/
  })
  await expect(notificationButton).toBeVisible()
  await notificationButton.click()
  const emergencyNotification = adminPage.getByRole("button", {
    name: new RegExp(issueDescription)
  })
  await expect(emergencyNotification).toBeVisible()
  await emergencyNotification.click()
  await expect(adminPage).toHaveURL(/\/admin\/maintenance/)
  await expect(adminPage.getByText(oldPlate).first()).toBeVisible()

  await adminPage.goto("/admin/bookings")
  const bookingRow = adminPage.getByRole("row").filter({ hasText: oldPlate })
  await expect(bookingRow).toBeVisible()
  await bookingRow.getByRole("button", { name: "เปลี่ยนรถ" }).click()
  const changeDialog = adminPage.getByRole("dialog", {
    name: "เปลี่ยนรถกรณีฉุกเฉิน"
  })
  await expect(changeDialog).toBeVisible()
  await changeDialog.locator("#replacement-vehicle").selectOption(newVehicleId)
  await changeDialog.locator("#change-reason").fill(changeReason)
  await changeDialog
    .getByRole("button", { name: "ยืนยันเปลี่ยนรถ" })
    .click()
  await expect(adminPage.getByRole("status")).toContainText(newPlate)

  await userPage.goto("/user/my-bookings")
  const changedBooking = userPage.getByText(newPlate).first()
  await expect(changedBooking).toBeVisible()
  await expect(userPage.getByText("เปลี่ยนรถแล้ว").first()).toBeVisible()

  await adminPage.goto("/admin/vehicle-history")
  await expect(adminPage.getByText("Phase 6 emergency E2E").first()).toBeVisible()
  await adminPage.getByRole("tab", { name: "งานซ่อม" }).click()
  await expect(adminPage.getByText(issueDescription).first()).toBeVisible()

  await adminPage.goto("/admin/users")
  const userRow = adminPage.getByRole("row").filter({ hasText: userEmail })
  await expect(userRow).toContainText("การจองที่ยังดำเนินการ 1 รายการ")
  adminPage.once("dialog", (dialog) => dialog.accept())
  await userRow.getByRole("button", { name: "ปิดบัญชี" }).click()
  await expect(adminPage.getByRole("status")).toContainText("ปิดใช้งานบัญชี")

  const blockedResponse = await userPage.request.get("/api/booking?action=my-bookings")
  expect(blockedResponse.status()).toBe(401)

  adminPage.once("dialog", (dialog) => dialog.accept())
  await userRow.getByRole("button", { name: "เปิดบัญชี" }).click()
  await expect(adminPage.getByRole("status")).toContainText("เปิดใช้งานบัญชี")
  await login(userPage, userEmail)
  await expect(userPage).toHaveURL(/\/user/)

  await userContext.close()
  await adminContext.close()
})
