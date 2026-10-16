import {
  eachDayOfInterval,
  startOfWeek,
  endOfWeek,
  startOfYear,
  endOfYear,
  format,
  parseISO,
} from 'date-fns'
import type { Session } from '@/entities/activity'
import { formatMinutes } from '@/shared/utils/formatMinutes'

export interface ChartDataPoint {
  dateStr: string
  label: string
  minutes: number
}

export interface ContributionDay {
  dateStr: string
  minutes: number
  formattedTime: string
  intensity: 0 | 1 | 2 | 3 | 4
}

const DAYS_OF_WEEK = ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб']

export const prepareWeeklyChartData = (sessions: Session[]): ChartDataPoint[] => {
  const now = new Date()
  const weekDays = eachDayOfInterval({
    start: startOfWeek(now, { weekStartsOn: 1 }),
    end: endOfWeek(now, { weekStartsOn: 1 }),
  })

  const chartData: ChartDataPoint[] = weekDays.map((d) => ({
    dateStr: format(d, 'yyyy-MM-dd'),
    label: DAYS_OF_WEEK[d.getDay()] ?? '',
    minutes: 0,
  }))

  sessions.forEach((session) => {
    if (!session.startTime) return
    const sessionDateStr = format(parseISO(session.startTime), 'yyyy-MM-dd')
    const dayMatch = chartData.find((point) => point.dateStr === sessionDateStr)

    if (dayMatch) {
      dayMatch.minutes += Math.round(session.duration / 60)
    }
  })

  return chartData
}

export const prepareYearlyChartData = (sessions: Session[]): ContributionDay[] => {
  const now = new Date()
  const allDays = eachDayOfInterval({
    start: startOfYear(now),
    end: endOfYear(now),
  })

  const yearlyChartData: ContributionDay[] = allDays.map((d) => ({
    dateStr: format(d, 'yyyy-MM-dd'),
    minutes: 0,
    formattedTime: '0 мин',
    intensity: 0,
  }))

  sessions.forEach((session) => {
    if (!session.startTime) return
    const sessionDateStr = format(parseISO(session.startTime), 'yyyy-MM-dd')
    const dayMatch = yearlyChartData.find((point) => point.dateStr === sessionDateStr)

    if (dayMatch) {
      dayMatch.minutes += Math.round(session.duration / 60)
    }
  })

  yearlyChartData.forEach((day) => {
    day.formattedTime = formatMinutes(day.minutes)

    if (day.minutes === 0) day.intensity = 0
    else if (day.minutes <= 60) day.intensity = 1
    else if (day.minutes <= 90) day.intensity = 2
    else if (day.minutes <= 180) day.intensity = 3
    else day.intensity = 4
  })

  return yearlyChartData
}

