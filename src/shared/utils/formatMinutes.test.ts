import { describe, it, expect } from 'vitest'
import { formatMinutes } from './formatMinutes'

describe('formatMinutes', () => {
  it('returns "0 мин" for zero or negative values', () => {
    expect(formatMinutes(0)).toBe('0 мин')
    expect(formatMinutes(-10)).toBe('0 мин')
  })

  it('formats values under one hour as minutes only', () => {
    expect(formatMinutes(15)).toBe('15 мин')
    expect(formatMinutes(59)).toBe('59 мин')
  })

  it('formats exact hours without minutes', () => {
    expect(formatMinutes(60)).toBe('1 ч')
    expect(formatMinutes(180)).toBe('3 ч')
  })

  it('formats hours and remaining minutes', () => {
    expect(formatMinutes(75)).toBe('1 ч 15 мин')
    expect(formatMinutes(130)).toBe('2 ч 10 мин')
  })
})
