import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import {
  getLocalDateString,
  calculateNewStreak,
  checkAndResetExpiredStreak,
  recalculateStreakFromSessions,
  type StreakState,
} from './calculateStreakTime'

describe('calculateStreakTime', () => {
  describe('getLocalDateString', () => {
    it('formats given Date into YYYY-MM-DD', () => {
      const date = new Date(2026, 4, 9) // May 9, 2026
      expect(getLocalDateString(date)).toBe('2026-05-09')
    })

    it('handles date strings properly', () => {
      expect(getLocalDateString('2026-10-15T12:00:00Z')).toBe('2026-10-15')
    })
  })

  describe('calculateNewStreak', () => {
    beforeEach(() => {
      vi.useFakeTimers()
      vi.setSystemTime(new Date(2026, 9, 15, 14, 0, 0)) // 2026-10-15
    })

    afterEach(() => {
      vi.useRealTimers()
    })

    it('initializes streak to 1 if there was no previous activity', () => {
      const current: StreakState = { currentStreak: 0, biggestStreak: 0, lastActivity: '' }
      const result = calculateNewStreak(current)

      expect(result).toEqual({
        currentStreak: 1,
        biggestStreak: 1,
        lastActivity: '2026-10-15',
      })
    })

    it('does not increment streak if user was already active today', () => {
      const current: StreakState = {
        currentStreak: 5,
        biggestStreak: 10,
        lastActivity: '2026-10-15',
      }
      const result = calculateNewStreak(current)

      expect(result.currentStreak).toBe(5)
      expect(result.biggestStreak).toBe(10)
      expect(result.lastActivity).toBe('2026-10-15')
    })

    it('increments streak if last activity was yesterday', () => {
      const current: StreakState = {
        currentStreak: 4,
        biggestStreak: 6,
        lastActivity: '2026-10-14',
      }
      const result = calculateNewStreak(current)

      expect(result.currentStreak).toBe(5)
      expect(result.biggestStreak).toBe(6)
      expect(result.lastActivity).toBe('2026-10-15')
    })

    it('updates biggestStreak when current exceeds it', () => {
      const current: StreakState = {
        currentStreak: 6,
        biggestStreak: 6,
        lastActivity: '2026-10-14',
      }
      const result = calculateNewStreak(current)

      expect(result.currentStreak).toBe(7)
      expect(result.biggestStreak).toBe(7)
    })

    it('resets streak to 1 if last activity was more than 1 day ago', () => {
      const current: StreakState = {
        currentStreak: 10,
        biggestStreak: 20,
        lastActivity: '2026-10-10',
      }
      const result = calculateNewStreak(current)

      expect(result.currentStreak).toBe(1)
      expect(result.biggestStreak).toBe(20)
      expect(result.lastActivity).toBe('2026-10-15')
    })
  })

  describe('checkAndResetExpiredStreak', () => {
    beforeEach(() => {
      vi.useFakeTimers()
      vi.setSystemTime(new Date(2026, 9, 15, 10, 0, 0)) // 2026-10-15
    })

    afterEach(() => {
      vi.useRealTimers()
    })

    it('keeps streak intact if last activity was today', () => {
      const state: StreakState = { currentStreak: 5, biggestStreak: 10, lastActivity: '2026-10-15' }
      expect(checkAndResetExpiredStreak(state)).toEqual(state)
    })

    it('keeps streak intact if last activity was yesterday', () => {
      const state: StreakState = { currentStreak: 5, biggestStreak: 10, lastActivity: '2026-10-14' }
      expect(checkAndResetExpiredStreak(state)).toEqual(state)
    })

    it('resets currentStreak to 0 if gap is > 1 day but preserves biggestStreak', () => {
      const state: StreakState = { currentStreak: 5, biggestStreak: 12, lastActivity: '2026-10-13' }
      const result = checkAndResetExpiredStreak(state)

      expect(result.currentStreak).toBe(0)
      expect(result.biggestStreak).toBe(12)
      expect(result.lastActivity).toBe('2026-10-13')
    })
  })

  describe('recalculateStreakFromSessions', () => {
    beforeEach(() => {
      vi.useFakeTimers()
      vi.setSystemTime(new Date(2026, 9, 15, 12, 0, 0)) // 2026-10-15
    })

    afterEach(() => {
      vi.useRealTimers()
    })

    it('returns zero streaks for empty session list', () => {
      expect(recalculateStreakFromSessions([])).toEqual({
        currentStreak: 0,
        biggestStreak: 0,
        lastActivity: '',
      })
    })

    it('calculates continuous streak across consecutive days', () => {
      const sessions = [
        { startTime: '2026-10-13T10:00:00Z', duration: 1800 },
        { startTime: '2026-10-14T11:00:00Z', duration: 3600 },
        { startTime: '2026-10-15T09:00:00Z', duration: 2400 },
      ]

      const result = recalculateStreakFromSessions(sessions)
      expect(result.currentStreak).toBe(3)
      expect(result.biggestStreak).toBe(3)
      expect(result.lastActivity).toBe('2026-10-15')
    })

    it('calculates historical biggest streak with a gap before current streak', () => {
      const sessions = [
        // 4-day streak in the past
        { startTime: '2026-09-01T10:00:00Z', duration: 3600 },
        { startTime: '2026-09-02T10:00:00Z', duration: 3600 },
        { startTime: '2026-09-03T10:00:00Z', duration: 3600 },
        { startTime: '2026-09-04T10:00:00Z', duration: 3600 },
        // gap...
        // 2-day current streak (yesterday and today)
        { startTime: '2026-10-14T10:00:00Z', duration: 3600 },
        { startTime: '2026-10-15T10:00:00Z', duration: 3600 },
      ]

      const result = recalculateStreakFromSessions(sessions)
      expect(result.currentStreak).toBe(2)
      expect(result.biggestStreak).toBe(4)
      expect(result.lastActivity).toBe('2026-10-15')
    })

    it('ignores sessions with zero or negative duration', () => {
      const sessions = [
        { startTime: '2026-10-15T10:00:00Z', duration: 0 },
        { startTime: '2026-10-15T11:00:00Z', duration: -100 },
      ]

      expect(recalculateStreakFromSessions(sessions)).toEqual({
        currentStreak: 0,
        biggestStreak: 0,
        lastActivity: '',
      })
    })
  })
})
