-- Extend the permission vocabulary for actions that were previously represented
-- by unrelated menu permissions.
ALTER TYPE "Permission" ADD VALUE 'BOOKING_MANAGE';
ALTER TYPE "Permission" ADD VALUE 'MAINTENANCE_REPORT';
ALTER TYPE "Permission" ADD VALUE 'PERMISSION_MANAGE';
