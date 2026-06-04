import { TENDER_STATUS, type TenderStatus } from '@frms/shared'

import { BusinessRuleError } from '../../shared/errors.ts'

const TRANSITIONS: Record<TenderStatus, TenderStatus[]> = {
  [TENDER_STATUS.DRAFT]: [TENDER_STATUS.PUBLISHED, TENDER_STATUS.CANCELLED],
  [TENDER_STATUS.PUBLISHED]: [TENDER_STATUS.CLOSED, TENDER_STATUS.CANCELLED],
  [TENDER_STATUS.CLOSED]: [TENDER_STATUS.EVALUATION],
  [TENDER_STATUS.EVALUATION]: [TENDER_STATUS.AWARDED],
  [TENDER_STATUS.AWARDED]: [],
  [TENDER_STATUS.CANCELLED]: [],
}

export function assertTenderTransition(from: TenderStatus, to: TenderStatus): void {
  if (!TRANSITIONS[from].includes(to)) {
    throw BusinessRuleError(`Invalid tender transition: ${from} -> ${to}`)
  }
}

export function isTenderActive(
  tender: { status: TenderStatus | string; startDate: string; endDate: string },
  now = new Date(),
): boolean {
  if (tender.status !== TENDER_STATUS.PUBLISHED) return false
  const start = new Date(tender.startDate)
  const end = new Date(tender.endDate)
  return now >= start && now <= end
}
