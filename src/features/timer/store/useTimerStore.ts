import { create } from 'zustand'
import { get as idbGet, set as idbSet, del as idbDel } from 'idb-keyval'
import { playTimerCompletionSound } from '@/shared/utils/soundAlert'

// Режимы работы: секундомер (прямой отсчет) или таймер (обратный отсчет)
export type TimerMode = 'stopwatch' | 'timer'

// Уникальный ключ для хранения снимка состояния таймера в IndexedDB
const STORAGE_KEY = 'coder-tracker-timer-state'

// Интерфейс сохраненного состояния в IndexedDB
interface SavedTimerState {
  mode: TimerMode
  isRunning: boolean
  startTime: number | null // Точка отсчета времени в миллисекундах (Date.now())
  accumulatedSeconds: number // Накопленное время на паузе
  targetSeconds: number // Целевое время для обратного отсчета
  sessionStartTime: string | null // ISO-штамп старта всей рабочей сессии
}

// Данные сессии, экспортируемые для сохранения в историю/аналитику
interface SessionData {
  startTime: string
  endTime: string
  duration: number // Чистая продолжительность в секундах
}

// Интерфейс Zustand-стора (публичные состояния и методы для UI)
interface TimerStore {
  time: number // Текущие секунды на экране
  isRunning: boolean // Флаг активности (идет отсчет / пауза)
  mode: TimerMode // Текущий режим
  isRestoring: boolean // Флаг фоновой гидратации из IndexedDB

  restoreState: () => Promise<void>
  start: () => void
  pause: () => void
  reset: () => Promise<void>
  setMode: (mode: TimerMode, initialSeconds?: number) => void
  setTime: (seconds: number) => void
  getSessionData: () => SessionData
}

/* ==========================================================================
   ВНУТРЕННИЕ ПЕРЕМЕННЫЕ МОДУЛЯ
   ========================================================================== */
let intervalId: number | null = null // ID таймера для вызова tick (200 мс)
let saveIntervalId: number | null = null // ID таймера для автосохранения (2000 мс)
let startTimeVal = 0 // Точечная метка системного времени Date.now()
let accumulatedSecondsVal = 0 // Накопленное время при паузе
let targetSecondsVal = 0 // Исходное целевое время (для таймера)
let sessionStartTimeVal: string | null = null // Дата/время первого клика "Старт"
let sessionEndTimeVal: string | null = null // Дата/время паузы или завершения
let totalDurationVal = 0 // Вычисленная полная длительность сессии
let isSaving = false // Мьютекс для предотвращения параллельных записей в IndexedDB

/**
 * Очищает все фоновые интервалы тиков и автосохранения.
 */
const clearAllIntervals = () => {
  if (intervalId !== null) {
    clearInterval(intervalId)
    intervalId = null
  }
  if (saveIntervalId !== null) {
    clearInterval(saveIntervalId)
    saveIntervalId = null
  }
}

/**
 * Делает асинхронный снимок состояния и сохраняет в IndexedDB.
 * Защищен от состояний гонки флагом isSaving.
 */
const saveToStorage = async () => {
  if (isSaving) {
    return
  }

  isSaving = true
  const state = useTimerStore.getState()
  const stateToSave: SavedTimerState = {
    mode: state.mode,
    isRunning: state.isRunning,
    startTime: state.isRunning ? startTimeVal : null,
    accumulatedSeconds: state.isRunning ? 0 : accumulatedSecondsVal,
    targetSeconds: targetSecondsVal,
    sessionStartTime: sessionStartTimeVal,
  }

  try {
    await idbSet(STORAGE_KEY, stateToSave)
  } catch (error) {
    console.error('Ошибка сохранения состояния в IndexedDB:', error)
  } finally {
    isSaving = false
  }
}

/**
 * Вычислительное сердце отсчета времени.
 * Вычисляет время на основе разницы системных меток Date.now(),
 * предотвращает ререндеры при неизменном значении секунд.
 */
const tick = () => {
  const state = useTimerStore.getState()
  if (!state.isRunning) {
    return
  }

  const now = Date.now()

  if (state.mode === 'stopwatch') {
    const seconds = Math.floor((now - startTimeVal) / 1000)
    totalDurationVal = seconds

    if (seconds !== state.time) {
      useTimerStore.setState({ time: seconds })
    }
  } else {
    const remaining = Math.ceil((startTimeVal - now) / 1000)

    if (remaining <= 0) {
      clearAllIntervals()
      totalDurationVal = targetSecondsVal
      sessionEndTimeVal = new Date().toISOString()
      useTimerStore.setState({ time: 0, isRunning: false })
      idbDel(STORAGE_KEY).catch((e) => console.error('Ошибка очистки IndexedDB:', e))
      playTimerCompletionSound()
    } else {
      totalDurationVal = targetSecondsVal - remaining
      if (remaining !== state.time) {
        useTimerStore.setState({ time: remaining })
      }
    }
  }
}

/**
 * Координирует запуск фоновых интервалов тика (200 мс) и сохранения (2000 мс).
 */
const startIntervals = () => {
  clearAllIntervals()
  intervalId = window.setInterval(tick, 200)
  saveIntervalId = window.setInterval(saveToStorage, 2000)
}

// Защита от потери данных при скрытии/закрытии вкладки
if (typeof window !== 'undefined') {
  window.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') {
      saveToStorage()
    } else if (useTimerStore.getState().isRunning) {
      tick()
    }
  })

  window.addEventListener('pagehide', () => {
    if (useTimerStore.getState().isRunning) {
      saveToStorage()
    }
  })
}

/* ==========================================================================
   ZUSTAND STORE
   ========================================================================== */
export const useTimerStore = create<TimerStore>((set, get) => ({
  time: 0,
  isRunning: false,
  mode: 'stopwatch',
  isRestoring: true,

  restoreState: async () => {
    try {
      const saved: SavedTimerState | undefined = await idbGet(STORAGE_KEY)

      if (!saved) {
        set({ isRestoring: false })
        return
      }

      targetSecondsVal = saved.targetSeconds || 0
      sessionStartTimeVal = saved.sessionStartTime || null
      accumulatedSecondsVal = saved.accumulatedSeconds || 0

      set({ mode: saved.mode })

      if (saved.isRunning && saved.startTime) {
        const now = Date.now()
        startTimeVal = saved.startTime

        let newTime = 0

        if (saved.mode === 'stopwatch') {
          newTime = Math.floor((now - saved.startTime) / 1000)
        } else {
          newTime = Math.ceil((saved.startTime - now) / 1000)

          if (newTime <= 0) {
            newTime = 0
            totalDurationVal = targetSecondsVal
            sessionEndTimeVal = new Date().toISOString()

            set({
              time: 0,
              isRunning: false,
              isRestoring: false,
            })

            await idbDel(STORAGE_KEY)
            return
          }
        }

        totalDurationVal = saved.mode === 'stopwatch' ? newTime : targetSecondsVal - newTime

        set({
          time: newTime,
          isRunning: true,
          isRestoring: false,
        })

        startIntervals()
      } else {
        set({
          time: accumulatedSecondsVal,
          isRunning: false,
          isRestoring: false,
        })
      }
    } catch (e) {
      console.error('Ошибка восстановления состояния таймера:', e)
      set({ isRestoring: false })
    }
  },

  start: () => {
    const state = get()
    if (state.isRestoring || state.isRunning) {
      return
    }

    sessionEndTimeVal = null

    if (!sessionStartTimeVal) {
      sessionStartTimeVal = new Date().toISOString()
    }

    const now = Date.now()
    if (state.mode === 'stopwatch') {
      startTimeVal = now - state.time * 1000
    } else {
      startTimeVal = now + state.time * 1000
    }

    set({ isRunning: true })
    startIntervals()
    saveToStorage()
  },

  pause: () => {
    const state = get()
    if (!state.isRunning || state.isRestoring) {
      return
    }

    clearAllIntervals()

    sessionEndTimeVal = new Date().toISOString()
    accumulatedSecondsVal = state.time
    totalDurationVal = state.mode === 'stopwatch' ? state.time : targetSecondsVal - state.time

    set({ isRunning: false })
    saveToStorage()
  },

  reset: async () => {
    const state = get()
    clearAllIntervals()

    const resetSeconds = state.mode === 'stopwatch' ? 0 : targetSecondsVal

    accumulatedSecondsVal = resetSeconds
    startTimeVal = 0
    sessionStartTimeVal = null
    sessionEndTimeVal = null
    totalDurationVal = 0

    set({ time: resetSeconds, isRunning: false })
    await idbDel(STORAGE_KEY)
  },

  setMode: (newMode: TimerMode, initialSeconds = 0) => {
    const state = get()
    if (state.isRunning || state.isRestoring) {
      return
    }

    clearAllIntervals()

    const resetSeconds = newMode === 'stopwatch' ? 0 : initialSeconds

    accumulatedSecondsVal = resetSeconds
    targetSecondsVal = resetSeconds
    startTimeVal = 0
    sessionStartTimeVal = null
    sessionEndTimeVal = null
    totalDurationVal = 0

    set({ mode: newMode, time: resetSeconds, isRunning: false })
    saveToStorage()
  },

  setTime: (newTime: number) => {
    const state = get()
    if (state.isRunning || state.isRestoring) {
      return
    }

    const clampedTime = Math.max(0, newTime)

    accumulatedSecondsVal = clampedTime
    targetSecondsVal = clampedTime

    set({ time: clampedTime })
    saveToStorage()
  },

  getSessionData: () => {
    return {
      startTime: sessionStartTimeVal || new Date().toISOString(),
      endTime: sessionEndTimeVal || new Date().toISOString(),
      duration: totalDurationVal,
    }
  },
}))
