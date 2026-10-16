import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { useTimerStore } from './useTimerStore'

vi.mock('@/shared/utils/soundAlert', () => ({
  playTimerCompletionSound: vi.fn(),
}))

describe('useTimerStore', () => {
  beforeEach(async () => {
    vi.useFakeTimers()
    useTimerStore.setState({ isRestoring: false, time: 0, isRunning: false, mode: 'stopwatch' })
    await useTimerStore.getState().reset()
  })

  afterEach(() => {
    vi.useRealTimers()
    vi.clearAllMocks()
  })

  it('initializes with default values', () => {
    const state = useTimerStore.getState()
    expect(state.time).toBe(0)
    expect(state.isRunning).toBe(false)
    expect(state.mode).toBe('stopwatch')
  })

  it('increments stopwatch time accurately across intervals', () => {
    const store = useTimerStore.getState()
    store.setMode('stopwatch')
    store.start()

    expect(useTimerStore.getState().isRunning).toBe(true)

    // Advance 3 seconds
    vi.advanceTimersByTime(3000)

    expect(useTimerStore.getState().time).toBe(3)

    // Pause
    useTimerStore.getState().pause()
    expect(useTimerStore.getState().isRunning).toBe(false)

    // Advancing timers while paused does not change time
    vi.advanceTimersByTime(2000)
    expect(useTimerStore.getState().time).toBe(3)
  })

  it('counts down correctly in timer mode and finishes at zero', () => {
    const store = useTimerStore.getState()
    store.setMode('timer', 10) // 10 seconds timer
    expect(useTimerStore.getState().time).toBe(10)

    store.start()
    expect(useTimerStore.getState().isRunning).toBe(true)

    // Advance 4 seconds
    vi.advanceTimersByTime(4000)
    expect(useTimerStore.getState().time).toBe(6)

    // Advance remaining 6 seconds
    vi.advanceTimersByTime(6000)
    expect(useTimerStore.getState().time).toBe(0)
    expect(useTimerStore.getState().isRunning).toBe(false)
  })

  it('resets timer properly', async () => {
    const store = useTimerStore.getState()
    store.setMode('stopwatch')
    store.start()
    vi.advanceTimersByTime(5000)

    expect(useTimerStore.getState().time).toBe(5)

    await store.reset()
    expect(useTimerStore.getState().time).toBe(0)
    expect(useTimerStore.getState().isRunning).toBe(false)
  })

  it('returns valid session data upon getSessionData()', () => {
    const store = useTimerStore.getState()
    store.start()
    vi.advanceTimersByTime(2000)
    store.pause()

    const session = store.getSessionData()
    expect(session.duration).toBe(2)
    expect(session.startTime).toBeDefined()
    expect(session.endTime).toBeDefined()
  })
})
