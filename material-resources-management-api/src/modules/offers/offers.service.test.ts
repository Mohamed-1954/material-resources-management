import { describe, expect, test } from 'bun:test'

import { OFFER_STATUS, SUPPLIER_STATUS } from '@frms/shared'

import {
  assertOfferTransition,
  computeOfferTotal,
  selectLowestValidOffer,
} from './offers.service.ts'

describe('Offer transitions', () => {
  test('DRAFT -> SUBMITTED allowed', () => {
    expect(() => assertOfferTransition(OFFER_STATUS.DRAFT, OFFER_STATUS.SUBMITTED)).not.toThrow()
  })

  test('SUBMITTED -> ACCEPTED requires UNDER_REVIEW first OR direct path? — must go through review', () => {
    expect(() => assertOfferTransition(OFFER_STATUS.SUBMITTED, OFFER_STATUS.ACCEPTED)).toThrow()
  })

  test('UNDER_REVIEW -> ACCEPTED allowed', () => {
    expect(() => assertOfferTransition(OFFER_STATUS.UNDER_REVIEW, OFFER_STATUS.ACCEPTED)).not.toThrow()
  })

  test('ACCEPTED is terminal', () => {
    expect(() => assertOfferTransition(OFFER_STATUS.ACCEPTED, OFFER_STATUS.REJECTED)).toThrow()
  })

  test('SUBMITTED -> ELIMINATED allowed (blacklisted/invalid)', () => {
    expect(() => assertOfferTransition(OFFER_STATUS.SUBMITTED, OFFER_STATUS.ELIMINATED)).not.toThrow()
  })
})

describe('computeOfferTotal', () => {
  test('sums numeric prices and quantities', () => {
    expect(computeOfferTotal([{ unitPrice: 100, quantity: 2 }, { unitPrice: 50, quantity: 3 }])).toBe(350)
  })

  test('handles string prices (Drizzle numeric returns)', () => {
    expect(computeOfferTotal([{ unitPrice: '100.50', quantity: 2 }, { unitPrice: '50', quantity: 1 }])).toBe(251)
  })

  test('empty list yields zero', () => {
    expect(computeOfferTotal([])).toBe(0)
  })
})

describe('selectLowestValidOffer', () => {
  test('returns lowest among submitted offers from active suppliers', () => {
    const offers = [
      {
        id: 'A',
        totalPrice: '1000',
        status: OFFER_STATUS.SUBMITTED,
        supplierStatus: SUPPLIER_STATUS.ACTIVE,
      },
      {
        id: 'B',
        totalPrice: '900',
        status: OFFER_STATUS.UNDER_REVIEW,
        supplierStatus: SUPPLIER_STATUS.ACTIVE,
      },
      {
        id: 'C',
        totalPrice: '800',
        status: OFFER_STATUS.SUBMITTED,
        supplierStatus: SUPPLIER_STATUS.BLACKLISTED,
      },
    ]
    expect(selectLowestValidOffer(offers)?.id).toBe('B')
  })

  test('ignores eliminated/withdrawn offers', () => {
    const offers = [
      {
        id: 'A',
        totalPrice: '500',
        status: OFFER_STATUS.ELIMINATED,
        supplierStatus: SUPPLIER_STATUS.ACTIVE,
      },
      {
        id: 'B',
        totalPrice: '700',
        status: OFFER_STATUS.SUBMITTED,
        supplierStatus: SUPPLIER_STATUS.ACTIVE,
      },
    ]
    expect(selectLowestValidOffer(offers)?.id).toBe('B')
  })

  test('returns null when no eligible offers', () => {
    const offers = [
      {
        id: 'A',
        totalPrice: '500',
        status: OFFER_STATUS.SUBMITTED,
        supplierStatus: SUPPLIER_STATUS.BLACKLISTED,
      },
    ]
    expect(selectLowestValidOffer(offers)).toBeNull()
  })
})
