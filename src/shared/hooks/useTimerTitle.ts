import { useEffect } from 'react'
import formatTime from '../utils/formatTime'

const BASE_TITLE = 'Coder Tracker — Трекер времени'

export const useTimerTitle = (time: number, isRunning: boolean): void => {
  useEffect(() => {
    if (isRunning) {
      document.title = `${formatTime(time)} • Coder Tracker`
    } else if (time > 0) {
      document.title = `[Пауза ${formatTime(time)}] • Coder Tracker`
    } else {
      document.title = BASE_TITLE
    }

    return () => {
      document.title = BASE_TITLE
    }
  }, [time, isRunning])
}
