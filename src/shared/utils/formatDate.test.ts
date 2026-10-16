import { describe, it, expect } from 'vitest'
import { formatDate } from './formatDate'

describe('formatDate', () => {
  it('returns empty string if dateStr is empty', () => {
    expect(formatDate('')).toBe('')
  })

  it('formats ISO date (YYYY-MM-DD) into DD.MM.YYYY', () => {
    expect(formatDate('2026-10-15')).toBe('15.10.2026')
    expect(formatDate('2025-01-01')).toBe('01.01.2025')
  })

  it('returns empty string for invalid date input', () => {
    expect(formatDate('invalid-date')).toBe('')
  })
})

