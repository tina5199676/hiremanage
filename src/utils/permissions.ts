import type {
  Permission,
  PermissionGrant,
  Role,
} from '../types/auth'

export const ROLE_LABELS: Record<Role, string> = {
  admin: 'System Admin',
  hr: 'HR / Recruiter',
  manager: 'Hiring Manager',
}

export function hasPermission(
  grants: readonly PermissionGrant[],
  permission: Permission,
): boolean {
  if (grants.includes('*')) {
    return true
  }

  return grants.includes(permission)
}

export function hasAnyPermission(
  grants: readonly PermissionGrant[],
  permissions: readonly Permission[],
): boolean {
  return permissions.some((permission) =>
    hasPermission(grants, permission),
  )
}

export function hasAllPermissions(
  grants: readonly PermissionGrant[],
  permissions: readonly Permission[],
): boolean {
  return permissions.every((permission) =>
    hasPermission(grants, permission),
  )
}
