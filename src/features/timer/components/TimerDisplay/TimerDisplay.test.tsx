import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import TimerDisplay from './TimerDisplay'
import { useTimerStore } from '@/features/timer/store/useTimerStore'

describe('TimerDisplay', () => {
  beforeEach(async () => {
    await useTimerStore.getState().reset()
  })

  it('renders initial 00:00:00 correctly', () => {
    render(<TimerDisplay />)
    expect(screen.getByText('00:00:00')).toBeInTheDocument()
  })

  it('displays formatted time when store time updates', () => {
    useTimerStore.setState({ time: 3665 }) // 01:01:05
    render(<TimerDisplay />)
    expect(screen.getByText('01:01:05')).toBeInTheDocument()
  })
})
