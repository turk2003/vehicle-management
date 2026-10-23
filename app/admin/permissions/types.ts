export type PermissionMatrix = Record<string, Record<string, boolean>>;

export type PermissionItem = {
  id: string;
  title: string;
  description: string;
};

export type MenuGroup = {
  groupName: string;
  forRoles: string[];
  items: PermissionItem[];
};

export type PermissionsResponse = {
  permissions: PermissionMatrix;
  roles: string[];
  lockedAdminPermissions?: string[];
};

export type RoleMeta = {
  label: string;
  description: string;
  tone: string;
};
