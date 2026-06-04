import { describe, expect, test } from 'bun:test'

import { NEED_STATUS } from '@frms/shared'

import { assertCanTransition } from './needs.service.ts'

describe('Need workflow state machine', () => {
  test('DRAFT -> SUBMITTED is allowed', () => {
    expect(() => assertCanTransition(NEED_STATUS.DRAFT, NEED_STATUS.SUBMITTED)).not.toThrow()
  })

  test('SUBMITTED -> APPROVED_BY_DEPARTMENT is allowed', () => {
    expect(() =>
      assertCanTransition(NEED_STATUS.SUBMITTED, NEED_STATUS.APPROVED_BY_DEPARTMENT),
    ).not.toThrow()
  })

  test('APPROVED -> SENT_TO_RESOURCE_MANAGER is allowed', () => {
    expect(() =>
      assertCanTransition(NEED_STATUS.APPROVED_BY_DEPARTMENT, NEED_STATUS.SENT_TO_RESOURCE_MANAGER),
    ).not.toThrow()
  })

  test('SENT_TO_RESOURCE_MANAGER -> INCLUDED_IN_TENDER is allowed', () => {
    expect(() =>
      assertCanTransition(NEED_STATUS.SENT_TO_RESOURCE_MANAGER, NEED_STATUS.INCLUDED_IN_TENDER),
    ).not.toThrow()
  })

  test('DRAFT -> APPROVED_BY_DEPARTMENT is NOT allowed (must submit first)', () => {
    expect(() =>
      assertCanTransition(NEED_STATUS.DRAFT, NEED_STATUS.APPROVED_BY_DEPARTMENT),
    ).toThrow(/Invalid need status transition/)
  })

  test('REJECTED is terminal', () => {
    expect(() => assertCanTransition(NEED_STATUS.REJECTED, NEED_STATUS.SUBMITTED)).toThrow()
  })

  test('INCLUDED_IN_TENDER is terminal', () => {
    expect(() =>
      assertCanTransition(NEED_STATUS.INCLUDED_IN_TENDER, NEED_STATUS.APPROVED_BY_DEPARTMENT),
    ).toThrow()
  })

  test('CHANGES_REQUESTED can return to SUBMITTED', () => {
    expect(() =>
      assertCanTransition(NEED_STATUS.CHANGES_REQUESTED, NEED_STATUS.SUBMITTED),
    ).not.toThrow()
  })
})
