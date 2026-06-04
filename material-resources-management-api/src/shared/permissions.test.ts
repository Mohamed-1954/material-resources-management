import { describe, expect, test } from 'bun:test'

import { hasPermission, PERMISSIONS, ROLES } from '@frms/shared'

describe('RBAC permission matrix', () => {
  test('ADMIN has every permission', () => {
    for (const perm of Object.values(PERMISSIONS)) {
      expect(hasPermission(ROLES.ADMIN, perm)).toBe(true)
    }
  })

  test('TEACHER cannot manage tenders', () => {
    expect(hasPermission(ROLES.TEACHER, PERMISSIONS.TENDER_MANAGE)).toBe(false)
  })

  test('SUPPLIER cannot evaluate offers', () => {
    expect(hasPermission(ROLES.SUPPLIER, PERMISSIONS.OFFER_EVALUATE)).toBe(false)
  })

  test('SUPPLIER can submit own offer and view active tenders', () => {
    expect(hasPermission(ROLES.SUPPLIER, PERMISSIONS.OFFER_CREATE_OWN)).toBe(true)
    expect(hasPermission(ROLES.SUPPLIER, PERMISSIONS.TENDER_VIEW_ACTIVE)).toBe(true)
  })

  test('DEPARTMENT_HEAD can review department needs but not include them in a tender', () => {
    expect(hasPermission(ROLES.DEPARTMENT_HEAD, PERMISSIONS.NEED_REVIEW_DEPARTMENT)).toBe(true)
    expect(hasPermission(ROLES.DEPARTMENT_HEAD, PERMISSIONS.NEED_INCLUDE_IN_TENDER)).toBe(false)
  })

  test('RESOURCE_MANAGER can blacklist suppliers and decide on warranty', () => {
    expect(hasPermission(ROLES.RESOURCE_MANAGER, PERMISSIONS.SUPPLIER_BLACKLIST)).toBe(true)
    expect(hasPermission(ROLES.RESOURCE_MANAGER, PERMISSIONS.FAILURE_WARRANTY_DECISION)).toBe(true)
  })

  test('MAINTENANCE_TECHNICIAN can intervene and write technical reports', () => {
    expect(hasPermission(ROLES.MAINTENANCE_TECHNICIAN, PERMISSIONS.FAILURE_INTERVENE)).toBe(true)
    expect(hasPermission(ROLES.MAINTENANCE_TECHNICIAN, PERMISSIONS.FAILURE_TECHNICAL_REPORT)).toBe(true)
  })

  test('TEACHER cannot assign roles', () => {
    expect(hasPermission(ROLES.TEACHER, PERMISSIONS.ROLE_ASSIGN)).toBe(false)
  })
})
