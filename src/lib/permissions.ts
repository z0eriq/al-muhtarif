import type { Role } from "@prisma/client";

export const PERMISSIONS = {
  "dashboard:view": ["SUPER_ADMIN", "ADMIN", "MANAGER", "STAFF"],

  "products:view": ["SUPER_ADMIN", "ADMIN", "MANAGER", "STAFF"],
  "products:create": ["SUPER_ADMIN", "ADMIN", "MANAGER"],
  "products:update": ["SUPER_ADMIN", "ADMIN", "MANAGER"],
  "products:delete": ["SUPER_ADMIN", "ADMIN"],

  "categories:view": ["SUPER_ADMIN", "ADMIN", "MANAGER", "STAFF"],
  "categories:manage": ["SUPER_ADMIN", "ADMIN", "MANAGER"],

  "orders:view": ["SUPER_ADMIN", "ADMIN", "MANAGER", "STAFF"],
  "orders:update": ["SUPER_ADMIN", "ADMIN", "MANAGER", "STAFF"],
  "orders:delete": ["SUPER_ADMIN", "ADMIN"],

  "customers:view": ["SUPER_ADMIN", "ADMIN", "MANAGER", "STAFF"],
  "customers:manage": ["SUPER_ADMIN", "ADMIN", "MANAGER"],

  "coupons:view": ["SUPER_ADMIN", "ADMIN", "MANAGER"],
  "coupons:manage": ["SUPER_ADMIN", "ADMIN", "MANAGER"],

  "inventory:view": ["SUPER_ADMIN", "ADMIN", "MANAGER", "STAFF"],
  "inventory:manage": ["SUPER_ADMIN", "ADMIN", "MANAGER"],

  "users:view": ["SUPER_ADMIN", "ADMIN"],
  "users:manage": ["SUPER_ADMIN", "ADMIN"],

  "settings:view": ["SUPER_ADMIN", "ADMIN"],
  "settings:manage": ["SUPER_ADMIN", "ADMIN"],

  "content:view": ["SUPER_ADMIN", "ADMIN", "MANAGER"],
  "content:manage": ["SUPER_ADMIN", "ADMIN", "MANAGER"],

  "reports:view": ["SUPER_ADMIN", "ADMIN", "MANAGER"],
} as const satisfies Record<string, readonly Role[]>;

export type Permission = keyof typeof PERMISSIONS;

export function hasPermission(
  role: Role | null | undefined,
  permission: Permission,
): boolean {
  if (!role) return false;
  return (PERMISSIONS[permission] as readonly Role[]).includes(role);
}

export function hasAnyPermission(
  role: Role | null | undefined,
  permissions: Permission[],
): boolean {
  return permissions.some((permission) => hasPermission(role, permission));
}

export function hasAllPermissions(
  role: Role | null | undefined,
  permissions: Permission[],
): boolean {
  return permissions.every((permission) => hasPermission(role, permission));
}

export function getRolePermissions(role: Role): Permission[] {
  return (Object.keys(PERMISSIONS) as Permission[]).filter((permission) =>
    hasPermission(role, permission),
  );
}

export function canManageRole(actor: Role, target: Role): boolean {
  const rank: Record<Role, number> = {
    STAFF: 1,
    MANAGER: 2,
    ADMIN: 3,
    SUPER_ADMIN: 4,
  };

  if (actor === "SUPER_ADMIN") return true;
  if (actor === "ADMIN") return rank[target] < rank.ADMIN;
  return false;
}
