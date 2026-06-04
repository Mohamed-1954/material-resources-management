import { OFFER_STATUS, type OfferStatus } from '@frms/shared'

import { BusinessRuleError } from '../../shared/errors.ts'

const TRANSITIONS: Record<OfferStatus, OfferStatus[]> = {
  [OFFER_STATUS.DRAFT]: [OFFER_STATUS.SUBMITTED, OFFER_STATUS.WITHDRAWN],
  [OFFER_STATUS.SUBMITTED]: [
    OFFER_STATUS.UNDER_REVIEW,
    OFFER_STATUS.ELIMINATED,
    OFFER_STATUS.WITHDRAWN,
  ],
  [OFFER_STATUS.UNDER_REVIEW]: [
    OFFER_STATUS.ACCEPTED,
    OFFER_STATUS.REJECTED,
    OFFER_STATUS.ELIMINATED,
  ],
  [OFFER_STATUS.ELIMINATED]: [],
  [OFFER_STATUS.ACCEPTED]: [],
  [OFFER_STATUS.REJECTED]: [],
  [OFFER_STATUS.WITHDRAWN]: [],
}

export function assertOfferTransition(from: OfferStatus, to: OfferStatus): void {
  if (!TRANSITIONS[from].includes(to)) {
    throw BusinessRuleError(`Invalid offer transition: ${from} -> ${to}`)
  }
}

export interface OfferItemForTotal {
  unitPrice: number | string
  quantity: number
}

export function computeOfferTotal(items: OfferItemForTotal[]): number {
  return items.reduce((sum, it) => {
    const price = typeof it.unitPrice === 'string' ? Number.parseFloat(it.unitPrice) : it.unitPrice
    return sum + price * it.quantity
  }, 0)
}

export interface OfferForSelection {
  id: string
  totalPrice: number | string
  status: OfferStatus
  supplierStatus: string
}

export function selectLowestValidOffer(
  offers: readonly OfferForSelection[],
): OfferForSelection | null {
  const eligible = offers.filter(
    (o) =>
      (o.status === OFFER_STATUS.SUBMITTED || o.status === OFFER_STATUS.UNDER_REVIEW) &&
      o.supplierStatus === 'ACTIVE',
  )
  if (eligible.length === 0) return null
  return eligible.reduce((best, current) => {
    const bestTotal = typeof best.totalPrice === 'string' ? Number.parseFloat(best.totalPrice) : best.totalPrice
    const currentTotal =
      typeof current.totalPrice === 'string' ? Number.parseFloat(current.totalPrice) : current.totalPrice
    return currentTotal < bestTotal ? current : best
  })
}
