import { FAILURE_TYPE, RESOURCE_TYPES, type FailureType, type ResourceType } from '@frms/shared'

import { BusinessRuleError } from '../../shared/errors.ts'

export function assertPrinterFailureIsHardware(
  resourceType: ResourceType,
  failureType: FailureType | null | undefined,
): void {
  if (resourceType === RESOURCE_TYPES.PRINTER && failureType && failureType !== FAILURE_TYPE.HARDWARE) {
    throw BusinessRuleError('Printer failures must be HARDWARE only')
  }
}

export function isWarrantyValid(warrantyEndDate: string | null, now = new Date()): boolean {
  if (!warrantyEndDate) return false
  return new Date(warrantyEndDate) >= now
}
