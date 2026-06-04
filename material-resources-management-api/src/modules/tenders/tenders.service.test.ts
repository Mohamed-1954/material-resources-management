import { describe, expect, test } from 'bun:test'

import { TENDER_STATUS } from '@frms/shared'

import { assertTenderTransition, isTenderActive } from './tenders.service.ts'

describe('Tender workflow', () => {
  test('DRAFT -> PUBLISHED', () => {
    expect(() => assertTenderTransition(TENDER_STATUS.DRAFT, TENDER_STATUS.PUBLISHED)).not.toThrow()
  })

  test('PUBLISHED -> CLOSED', () => {
    expect(() => assertTenderTransition(TENDER_STATUS.PUBLISHED, TENDER_STATUS.CLOSED)).not.toThrow()
  })

  test('CLOSED -> EVALUATION', () => {
    expect(() => assertTenderTransition(TENDER_STATUS.CLOSED, TENDER_STATUS.EVALUATION)).not.toThrow()
  })

  test('EVALUATION -> AWARDED', () => {
    expect(() => assertTenderTransition(TENDER_STATUS.EVALUATION, TENDER_STATUS.AWARDED)).not.toThrow()
  })

  test('AWARDED is terminal', () => {
    expect(() => assertTenderTransition(TENDER_STATUS.AWARDED, TENDER_STATUS.CANCELLED)).toThrow()
  })

  test('cannot skip from DRAFT to AWARDED', () => {
    expect(() => assertTenderTransition(TENDER_STATUS.DRAFT, TENDER_STATUS.AWARDED)).toThrow()
  })
})

describe('isTenderActive', () => {
  test('PUBLISHED tender within window is active', () => {
    const now = new Date('2026-04-25')
    expect(
      isTenderActive(
        { status: TENDER_STATUS.PUBLISHED, startDate: '2026-04-01', endDate: '2026-05-01' },
        now,
      ),
    ).toBe(true)
  })

  test('PUBLISHED tender after end date is not active', () => {
    const now = new Date('2026-05-10')
    expect(
      isTenderActive(
        { status: TENDER_STATUS.PUBLISHED, startDate: '2026-04-01', endDate: '2026-05-01' },
        now,
      ),
    ).toBe(false)
  })

  test('DRAFT tender is never active', () => {
    const now = new Date('2026-04-25')
    expect(
      isTenderActive(
        { status: TENDER_STATUS.DRAFT, startDate: '2026-04-01', endDate: '2026-05-01' },
        now,
      ),
    ).toBe(false)
  })
})
