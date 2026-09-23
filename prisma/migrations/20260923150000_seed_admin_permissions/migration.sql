-- The initial cloud database only received the permissions inserted by
-- 20260903120100_seed_enforced_permissions. Restore the documented Admin
-- baseline without removing existing role-permission assignments.
INSERT INTO "RolePermission" ("id", "role", "permission") VALUES
  (gen_random_uuid()::text, 'ADMIN', 'BOOKING_VIEW'),
  (gen_random_uuid()::text, 'ADMIN', 'BOOKING_CREATE'),
  (gen_random_uuid()::text, 'ADMIN', 'BOOKING_APPROVE'),
  (gen_random_uuid()::text, 'ADMIN', 'BOOKING_MANAGE'),
  (gen_random_uuid()::text, 'ADMIN', 'BOOKING_DELETE'),
  (gen_random_uuid()::text, 'ADMIN', 'VEHICLE_VIEW'),
  (gen_random_uuid()::text, 'ADMIN', 'VEHICLE_MANAGE'),
  (gen_random_uuid()::text, 'ADMIN', 'MAINTENANCE_VIEW'),
  (gen_random_uuid()::text, 'ADMIN', 'MAINTENANCE_REPORT'),
  (gen_random_uuid()::text, 'ADMIN', 'MAINTENANCE_MANAGE'),
  (gen_random_uuid()::text, 'ADMIN', 'USER_MANAGE'),
  (gen_random_uuid()::text, 'ADMIN', 'REPORT_VIEW'),
  (gen_random_uuid()::text, 'ADMIN', 'PERMISSION_MANAGE')
ON CONFLICT ("role", "permission") DO NOTHING;
