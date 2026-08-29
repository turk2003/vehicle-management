-- CreateEnum
CREATE TYPE "MaintenanceType" AS ENUM ('BREAKDOWN', 'PREVENTIVE', 'OTHER', 'UNSPECIFIED');

-- AlterTable
ALTER TABLE "Maintenance"
ADD COLUMN "maintenanceType" "MaintenanceType" NOT NULL DEFAULT 'UNSPECIFIED';

-- AlterTable
ALTER TABLE "Log"
ADD COLUMN "metadata" JSONB;
