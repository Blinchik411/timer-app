import { describe, it, expect } from 'vitest'
import formatTime from './formatTime'

describe('formatTime', () => {
  it('formats 0 seconds as 00:00:00', () => {
    expect(formatTime(0)).toBe('00:00:00')
  })

  it('formats seconds under a minute', () => {
    expect(formatTime(45)).toBe('00:00:45')
  })

  it('formats minutes and seconds', () => {
    expect(formatTime(125)).toBe('00:02:05')
  })

  it('formats full hours, minutes, and seconds', () => {
    expect(formatTime(3665)).toBe('01:01:05')
  })

  it('formats multi-hour values correctly', () => {
    expect(formatTime(36000)).toBe('10:00:00')
  })
})
