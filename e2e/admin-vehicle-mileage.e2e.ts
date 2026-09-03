import "dotenv/config"
import { expect, test, type Page } from "@playwright/test"
import { randomUUID } from "node:crypto"
import { Pool } from "pg"
import bcrypt from "bcryptjs"

const pool = new Pool({ connectionString: process.env.DATABASE_URL })
const suffix = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
const email = `mileage-admin-${suffix}@example.com`
const password = "Mileage-test-123"
const plateNumber = `MIL-${suffix.slice(-6).toUpperCase()}`

let adminId = ""
let vehicleTypeId = ""
let vehicleId = ""
const createdPermissionIds: string[] = []

async function login(page: Page) {
  await page.goto("/")
  await page.locator("#email").fill(email)
  await page.locator("#password").fill(password)
  await page.locator("form").getByRole("button", { name: "เข้าสู่ระบบ" }).click()
  await expect(page).not.toHaveURL("/")
}

test.beforeAll(async () => {
  const hashedPassword = await bcrypt.hash(password, 4)
  adminId = randomUUID()
  vehicleTypeId = randomUUID()
  vehicleId = randomUUID()

  await pool.query(
    `INSERT INTO "User" ("id", "name", "email", "password", "role", "createdAt")
     VALUES ($1, $2, $3, $4, 'ADMIN', NOW())`,
    [adminId, "Mileage Test Admin", email, hashedPassword]
  )

  for (const permission of ["VEHICLE_VIEW", "VEHICLE_MANAGE"]) {
    const existing = await pool.query<{ id: string }>(
      `SELECT "id" FROM "RolePermission"
       WHERE "role" = 'ADMIN' AND "permission" = $1::"Permission"`,
      [permission]
    )
    if (existing.rowCount === 0) {
      const permissionId = randomUUID()
      await pool.query(
        `INSERT INTO "RolePermission" ("id", "role", "permission")
         VALUES ($1, 'ADMIN', $2::"Permission")`,
        [permissionId, permission]
      )
      createdPermissionIds.push(permissionId)
    }
  }

  await pool.query(
    `INSERT INTO "VehicleType" ("id", "name") VALUES ($1, $2)`,
    [vehicleTypeId, `Mileage Test Type ${suffix}`]
  )
  await pool.query(
    `INSERT INTO "Vehicle" ("id", "plateNumber", "status", "currentMileage", "typeId")
     VALUES ($1, $2, 'AVAILABLE', 12500, $3)`,
    [vehicleId, plateNumber, vehicleTypeId]
  )
})

test.afterAll(async () => {
  if (vehicleId) {
    await pool.query(`DELETE FROM "Vehicle" WHERE "id" = $1`, [vehicleId])
  }
  if (adminId) {
    await pool.query(`DELETE FROM "User" WHERE "id" = $1`, [adminId])
  }
  if (vehicleTypeId) {
    await pool.query(`DELETE FROM "VehicleType" WHERE "id" = $1`, [vehicleTypeId])
  }
  if (createdPermissionIds.length > 0) {
    await pool.query(
      `DELETE FROM "RolePermission" WHERE "id" = ANY($1::text[])`,
      [createdPermissionIds]
    )
  }
  await pool.end()
})

test("admin updates the current vehicle mileage", async ({ page }) => {
  await login(page)
  await page.goto("/admin/vehicles")

  const vehicleRow = page.getByRole("row").filter({ hasText: plateNumber })
  await expect(vehicleRow).toContainText("12,500 km")
  await vehicleRow.getByRole("button", { name: "แก้ไข" }).click()

  const dialog = page.getByRole("dialog", { name: "แก้ไขข้อมูลรถ" })
  const mileageInput = dialog.locator("#currentMileage")
  await expect(mileageInput).toHaveValue("12500")
  await mileageInput.fill("12850")
  await dialog.getByRole("button", { name: "บันทึกการแก้ไข" }).click()

  await expect(dialog).toBeHidden()
  await expect(vehicleRow).toContainText("12,850 km")

  const stored = await pool.query<{ currentMileage: number }>(
    `SELECT "currentMileage" FROM "Vehicle" WHERE "id" = $1`,
    [vehicleId]
  )
  expect(stored.rows[0].currentMileage).toBe(12850)
})
