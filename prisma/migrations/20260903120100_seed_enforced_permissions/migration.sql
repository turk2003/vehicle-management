-- Preserve the existing behavior for Admin and User accounts after the enum
-- additions have been committed by the previous migration.
INSERT INTO "RolePermission" ("id", "role", "permission") VALUES
  ('ad91d247-f91f-4e24-87e4-c222cab76488', 'ADMIN', 'BOOKING_MANAGE'),
  ('1846d844-5a55-430e-8da1-60d307516aef', 'ADMIN', 'MAINTENANCE_REPORT'),
  ('a1460877-fd7b-4f92-a0c8-ad825faab0dd', 'ADMIN', 'PERMISSION_MANAGE'),
  ('074993d2-72e5-4fb7-b532-cb0df9d7ba0c', 'USER', 'MAINTENANCE_REPORT')
ON CONFLICT ("role", "permission") DO NOTHING;

-- Vehicle history and AI analysis are scoped to Admin in the project requirements.
DELETE FROM "RolePermission"
WHERE "role" = 'APPROVER' AND "permission" = 'REPORT_VIEW';
