import { describe, expect, test } from 'bun:test'

import * as v from 'valibot'

import {
  NeedCreateSchema,
  OfferCreateSchema,
  ResourceDeliverySchema,
  SupplierRegisterSchema,
} from '@frms/shared'

describe('Validation schemas', () => {
  test('SupplierRegisterSchema rejects short password and bad email', () => {
    const r = v.safeParse(SupplierRegisterSchema, {
      email: 'not-an-email',
      password: 'short',
      name: 'A',
      companyName: '',
    })
    expect(r.success).toBe(false)
  })

  test('SupplierRegisterSchema accepts valid input', () => {
    const r = v.safeParse(SupplierRegisterSchema, {
      email: 'sales@acme.com',
      password: 'changeme123',
      name: 'Acme Sales',
      companyName: 'Acme Hardware',
    })
    expect(r.success).toBe(true)
  })

  test('NeedCreateSchema accepts a computer item', () => {
    const r = v.safeParse(NeedCreateSchema, {
      items: [
        {
          resourceType: 'COMPUTER',
          cpu: 'i7',
          ram: '16GB',
          quantity: 5,
          justification: 'Lab upgrade',
        },
      ],
    })
    expect(r.success).toBe(true)
  })

  test('NeedCreateSchema rejects empty items', () => {
    const r = v.safeParse(NeedCreateSchema, { items: [] })
    expect(r.success).toBe(false)
  })

  test('OfferCreateSchema requires warranty and delivery date', () => {
    const r = v.safeParse(OfferCreateSchema, {
      items: [
        {
          resourceType: 'COMPUTER',
          brand: 'Dell',
          unitPrice: 1000,
          quantity: 5,
          warrantyDurationMonths: 12,
          futureDeliveryDate: '2026-06-01',
        },
      ],
    })
    expect(r.success).toBe(true)
  })

  test('ResourceDeliverySchema validates ISO dates', () => {
    const r = v.safeParse(ResourceDeliverySchema, {
      offerId: 'abc',
      deliveryDate: 'not-a-date',
      resources: [{ resourceType: 'COMPUTER', warrantyEndDate: '2027-01-01' }],
    })
    expect(r.success).toBe(false)
  })
})
