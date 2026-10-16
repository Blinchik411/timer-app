import { useEffect } from 'react'
import { useTimerStore } from '@/features/timer/store/useTimerStore'
import TimerDisplay from '@/features/timer/components/TimerDisplay/TimerDisplay'
import WeeklyChart from '@/features/analytics/components/WeeklyChart/WeeklyChart'
import YearlyChart from '@/features/analytics/components/YearlyChart/YearlyChart'
import TimerSettings from '@/features/timer/components/TimerSettings/TimerSettings'
import TimerControls from '@/features/timer/components/TimerControls/TimerControls'
import TimerHeader from '@/features/timer/components/TimerHeader/TimerHeader'
import { BackupSettings } from '@/widgets/backup-settings/BackupSettings'
import { DayEditor } from '@/widgets/day-editor'
import styles from './TimerPage.module.scss'

export const TimerPage = () => {
  const isRestoring = useTimerStore((state) => state.isRestoring)
  const restoreState = useTimerStore((state) => state.restoreState)

  useEffect(() => {
    restoreState()
  }, [restoreState])

  if (isRestoring) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loadingText}>Загрузка таймера...</div>
      </div>
    )
  }

  return (
    <main className={styles.layout}>
      <section className={styles.timerSection} aria-label="Таймер">
        <TimerHeader />
        <TimerSettings />
        <TimerDisplay />
        <TimerControls />
      </section>
      <aside className={styles.statsSection} aria-label="Статистика и настройки">
        <WeeklyChart />
        <YearlyChart />
        <BackupSettings />
        <DayEditor />
      </aside>
    </main>
  )
}

export default TimerPage
