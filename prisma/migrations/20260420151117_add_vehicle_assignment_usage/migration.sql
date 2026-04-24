/*
  Warnings:

  - Added the required column `purpose` to the `Booking` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "Permission" AS ENUM ('BOOKING_VIEW', 'BOOKING_CREATE', 'BOOKING_APPROVE', 'BOOKING_DELETE', 'VEHICLE_VIEW', 'VEHICLE_MANAGE', 'MAINTENANCE_VIEW', 'MAINTENANCE_MANAGE', 'USER_MANAGE', 'REPORT_VIEW');

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "BookingStatus" ADD VALUE 'IN_PROGRESS';
ALTER TYPE "BookingStatus" ADD VALUE 'COMPLETED';

-- AlterEnum
ALTER TYPE "VehicleStatus" ADD VALUE 'IN_USE';

-- AlterTable
ALTER TABLE "Booking" ADD COLUMN     "mileageEnd" INTEGER,
ADD COLUMN     "mileageStart" INTEGER,
ADD COLUMN     "pickedUpAt" TIMESTAMP(3),
ADD COLUMN     "purpose" TEXT NOT NULL,
ADD COLUMN     "rejectionReason" TEXT,
ADD COLUMN     "returnedAt" TIMESTAMP(3),
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "Vehicle" ADD COLUMN     "currentMileage" INTEGER NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "RolePermission" (
    "id" TEXT NOT NULL,
    "role" "UserRole" NOT NULL,
    "permission" "Permission" NOT NULL,

    CONSTRAINT "RolePermission_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "RolePermission_role_permission_key" ON "RolePermission"("role", "permission");
