import { describe, expect, test } from 'bun:test'

import { FAILURE_TYPE, RESOURCE_TYPES } from '@frms/shared'

import { assertPrinterFailureIsHardware, isWarrantyValid } from './maintenance.service.ts'

describe('Printer failure rule', () => {
  test('PRINTER + HARDWARE is allowed', () => {
    expect(() =>
      assertPrinterFailureIsHardware(RESOURCE_TYPES.PRINTER, FAILURE_TYPE.HARDWARE),
    ).not.toThrow()
  })

  test('PRINTER + SOFTWARE_SYSTEM is rejected', () => {
    expect(() =>
      assertPrinterFailureIsHardware(RESOURCE_TYPES.PRINTER, FAILURE_TYPE.SOFTWARE_SYSTEM),
    ).toThrow(/HARDWARE/)
  })

  test('PRINTER + SOFTWARE_UTILITY is rejected', () => {
    expect(() =>
      assertPrinterFailureIsHardware(RESOURCE_TYPES.PRINTER, FAILURE_TYPE.SOFTWARE_UTILITY),
    ).toThrow()
  })

  test('COMPUTER + SOFTWARE_SYSTEM is allowed', () => {
    expect(() =>
      assertPrinterFailureIsHardware(RESOURCE_TYPES.COMPUTER, FAILURE_TYPE.SOFTWARE_SYSTEM),
    ).not.toThrow()
  })

  test('PRINTER + null type is allowed (no type given yet)', () => {
    expect(() => assertPrinterFailureIsHardware(RESOURCE_TYPES.PRINTER, null)).not.toThrow()
  })
})

describe('Warranty validity', () => {
  test('future end date is valid', () => {
    expect(isWarrantyValid('2030-01-01', new Date('2026-04-25'))).toBe(true)
  })

  test('past end date is invalid', () => {
    expect(isWarrantyValid('2020-01-01', new Date('2026-04-25'))).toBe(false)
  })

  test('null is invalid', () => {
    expect(isWarrantyValid(null, new Date())).toBe(false)
  })
})
