import { ROLES, type Role } from '../constants/index.ts'

export const PERMISSIONS = {
  USER_MANAGE: 'user:manage',
  ROLE_ASSIGN: 'role:assign',
  DEPARTMENT_MANAGE: 'department:manage',
  AUDIT_VIEW: 'audit:view',

  NEED_CREATE_OWN: 'need:create:own',
  NEED_VIEW_OWN: 'need:view:own',
  NEED_VIEW_DEPARTMENT: 'need:view:department',
  NEED_VIEW_ALL: 'need:view:all',
  NEED_REVIEW_DEPARTMENT: 'need:review:department',
  NEED_FINALIZE_DEPARTMENT: 'need:finalize:department',
  NEED_INCLUDE_IN_TENDER: 'need:include:tender',

  TENDER_MANAGE: 'tender:manage',
  TENDER_VIEW_ACTIVE: 'tender:view:active',
  TENDER_VIEW_ALL: 'tender:view:all',

  OFFER_CREATE_OWN: 'offer:create:own',
  OFFER_VIEW_OWN: 'offer:view:own',
  OFFER_VIEW_ALL: 'offer:view:all',
  OFFER_EVALUATE: 'offer:evaluate',

  SUPPLIER_MANAGE: 'supplier:manage',
  SUPPLIER_BLACKLIST: 'supplier:blacklist',
  SUPPLIER_REGISTER_SELF: 'supplier:register:self',
  SUPPLIER_UPDATE_OWN_PROFILE: 'supplier:profile:update:own',

  RESOURCE_MANAGE: 'resource:manage',
  RESOURCE_ASSIGN: 'resource:assign',
  RESOURCE_VIEW_OWN: 'resource:view:own',
  RESOURCE_VIEW_DEPARTMENT: 'resource:view:department',
  RESOURCE_VIEW_ALL: 'resource:view:all',

  FAILURE_REPORT_OWN: 'failure:report:own',
  FAILURE_VIEW_OWN: 'failure:view:own',
  FAILURE_VIEW_DEPARTMENT: 'failure:view:department',
  FAILURE_VIEW_ALL: 'failure:view:all',
  FAILURE_INTERVENE: 'failure:intervene',
  FAILURE_TECHNICAL_REPORT: 'failure:technical-report',
  FAILURE_WARRANTY_DECISION: 'failure:warranty-decision',
} as const

export type Permission = (typeof PERMISSIONS)[keyof typeof PERMISSIONS]

const adminAll = Object.values(PERMISSIONS) as Permission[]

export const ROLE_PERMISSIONS: Record<Role, readonly Permission[]> = {
  [ROLES.ADMIN]: adminAll,
  [ROLES.RESOURCE_MANAGER]: [
    PERMISSIONS.NEED_VIEW_ALL,
    PERMISSIONS.NEED_INCLUDE_IN_TENDER,
    PERMISSIONS.TENDER_MANAGE,
    PERMISSIONS.TENDER_VIEW_ALL,
    PERMISSIONS.OFFER_VIEW_ALL,
    PERMISSIONS.OFFER_EVALUATE,
    PERMISSIONS.SUPPLIER_MANAGE,
    PERMISSIONS.SUPPLIER_BLACKLIST,
    PERMISSIONS.RESOURCE_MANAGE,
    PERMISSIONS.RESOURCE_ASSIGN,
    PERMISSIONS.RESOURCE_VIEW_ALL,
    PERMISSIONS.FAILURE_VIEW_ALL,
    PERMISSIONS.FAILURE_WARRANTY_DECISION,
    PERMISSIONS.AUDIT_VIEW,
  ],
  [ROLES.DEPARTMENT_HEAD]: [
    PERMISSIONS.NEED_VIEW_DEPARTMENT,
    PERMISSIONS.NEED_REVIEW_DEPARTMENT,
    PERMISSIONS.NEED_FINALIZE_DEPARTMENT,
    PERMISSIONS.RESOURCE_VIEW_DEPARTMENT,
    PERMISSIONS.FAILURE_VIEW_DEPARTMENT,
  ],
  [ROLES.TEACHER]: [
    PERMISSIONS.NEED_CREATE_OWN,
    PERMISSIONS.NEED_VIEW_OWN,
    PERMISSIONS.RESOURCE_VIEW_OWN,
    PERMISSIONS.FAILURE_REPORT_OWN,
    PERMISSIONS.FAILURE_VIEW_OWN,
  ],
  [ROLES.SUPPLIER]: [
    PERMISSIONS.TENDER_VIEW_ACTIVE,
    PERMISSIONS.OFFER_CREATE_OWN,
    PERMISSIONS.OFFER_VIEW_OWN,
    PERMISSIONS.SUPPLIER_UPDATE_OWN_PROFILE,
  ],
  [ROLES.MAINTENANCE_TECHNICIAN]: [
    PERMISSIONS.FAILURE_VIEW_ALL,
    PERMISSIONS.FAILURE_INTERVENE,
    PERMISSIONS.FAILURE_TECHNICAL_REPORT,
  ],
}

export function hasPermission(role: Role, permission: Permission): boolean {
  return ROLE_PERMISSIONS[role].includes(permission)
}

export function hasAnyPermission(role: Role, permissions: readonly Permission[]): boolean {
  return permissions.some((p) => hasPermission(role, p))
}

export function hasAnyRole(role: Role, allowed: readonly Role[]): boolean {
  return allowed.includes(role)
}
