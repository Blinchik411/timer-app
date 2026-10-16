import { memo, useEffect, useRef, useCallback } from 'react'
import { useTimerStore } from '@/features/timer/store/useTimerStore'
import { useLogStore } from '@/entities/activity'
import styles from './TimerControls.module.scss'

const TimerControls = () => {
  const startButtonRef = useRef<HTMLButtonElement>(null)

  const isRunning = useTimerStore((state) => state.isRunning)
  const mode = useTimerStore((state) => state.mode)
  const canSave = useTimerStore((state) => state.time > 0)

  const start = useTimerStore((state) => state.start)
  const pause = useTimerStore((state) => state.pause)
  const reset = useTimerStore((state) => state.reset)
  const getSessionData = useTimerStore((state) => state.getSessionData)

  const addSession = useLogStore((state) => state.addSession)

  const handleSave = useCallback(() => {
    const { startTime, endTime, duration } = getSessionData()

    if (duration <= 0) {
      return
    }

    addSession({
      id: crypto.randomUUID(),
      startTime,
      endTime,
      duration,
      mode,
    })

    reset()
  }, [getSessionData, addSession, mode, reset])

  useEffect(() => {
    startButtonRef.current?.focus()
  }, [])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Игнорируем нажатия, если пользователь вводит текст в инпутах
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return
      }

      const state = useTimerStore.getState()

      switch (e.code) {
        case 'Space':
          e.preventDefault()
          if (state.isRunning) {
            state.pause()
          } else {
            state.start()
          }
          break

        case 'KeyR':
          e.preventDefault()
          state.reset()
          break

        case 'Enter':
          e.preventDefault()
          if (state.time > 0) {
            handleSave()
          }
          break
      }
    }

    window.addEventListener('keydown', handleKeyDown)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [handleSave])

  return (
    <div className={styles.controlsContainer}>
      <div className={styles.topRow}>
        <button
          ref={startButtonRef}
          type="button"
          className={`${styles.btnStart} ${isRunning ? styles.running : ''}`}
          onClick={isRunning ? pause : start}
        >
          {isRunning ? 'Пауза' : 'Старт'}
        </button>

        <button type="button" className={styles.btnReset} onClick={reset}>
          Сброс
        </button>
      </div>

      <button type="button" className={styles.btnSave} onClick={handleSave} disabled={!canSave}>
        Сохранить сессию
      </button>
    </div>
  )
}

export default memo(TimerControls)
