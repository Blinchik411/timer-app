import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { prepareWeeklyChartData, prepareYearlyChartData } from './analyticsTransformer'
import type { Session } from '@/entities/activity'

describe('analyticsTransformer', () => {
  describe('prepareWeeklyChartData', () => {
    beforeEach(() => {
      vi.useFakeTimers()
      // Thursday Oct 15, 2026
      vi.setSystemTime(new Date(2026, 9, 15, 12, 0, 0))
    })

    afterEach(() => {
      vi.useRealTimers()
    })

    it('returns 7 days of the current week', () => {
      const data = prepareWeeklyChartData([])
      expect(data).toHaveLength(7)
      expect(data[0]?.label).toBe('Пн') // Monday
      expect(data[6]?.label).toBe('Вс') // Sunday
    })

    it('sums up sessions minutes for corresponding days', () => {
      const sessions: Session[] = [
        {
          id: '1',
          startTime: '2026-10-15T10:00:00.000Z',
          endTime: '2026-10-15T10:30:00.000Z',
          duration: 1800, // 30 mins
          mode: 'timer',
        },
        {
          id: '2',
          startTime: '2026-10-15T14:00:00.000Z',
          endTime: '2026-10-15T14:15:00.000Z',
          duration: 900, // 15 mins
          mode: 'stopwatch',
        },
      ]

      const data = prepareWeeklyChartData(sessions)
      const todayPoint = data.find((d) => d.dateStr === '2026-10-15')

      expect(todayPoint).toBeDefined()
      expect(todayPoint?.minutes).toBe(45)
    })
  })

  describe('prepareYearlyChartData', () => {
    beforeEach(() => {
      vi.useFakeTimers()
      vi.setSystemTime(new Date(2026, 9, 15, 12, 0, 0))
    })

    afterEach(() => {
      vi.useRealTimers()
    })

    it('generates contribution days for the full current year', () => {
      const data = prepareYearlyChartData([])
      expect(data.length).toBeGreaterThanOrEqual(365)
      expect(data[0]?.dateStr).toBe('2026-01-01')
      expect(data[data.length - 1]?.dateStr).toBe('2026-12-31')
    })

    it('maps minutes to appropriate heatmap intensity levels', () => {
      const sessions: Session[] = [
        // 30 mins -> intensity 1 (<= 60)
        { id: '1', startTime: '2026-02-01T10:00:00Z', endTime: '', duration: 1800, mode: 'timer' },
        // 80 mins -> intensity 2 (61..90)
        { id: '2', startTime: '2026-02-02T10:00:00Z', endTime: '', duration: 4800, mode: 'timer' },
        // 150 mins -> intensity 3 (91..180)
        { id: '3', startTime: '2026-02-03T10:00:00Z', endTime: '', duration: 9000, mode: 'timer' },
        // 240 mins -> intensity 4 (> 180)
        { id: '4', startTime: '2026-02-04T10:00:00Z', endTime: '', duration: 14400, mode: 'timer' },
      ]

      const data = prepareYearlyChartData(sessions)

      const day1 = data.find((d) => d.dateStr === '2026-02-01')
      const day2 = data.find((d) => d.dateStr === '2026-02-02')
      const day3 = data.find((d) => d.dateStr === '2026-02-03')
      const day4 = data.find((d) => d.dateStr === '2026-02-04')
      const emptyDay = data.find((d) => d.dateStr === '2026-02-05')

      expect(day1?.intensity).toBe(1)
      expect(day2?.intensity).toBe(2)
      expect(day3?.intensity).toBe(3)
      expect(day4?.intensity).toBe(4)
      expect(emptyDay?.intensity).toBe(0)
    })
  })
})
