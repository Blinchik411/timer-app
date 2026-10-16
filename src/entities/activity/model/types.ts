export interface StreakState {
  currentStreak: number
  biggestStreak: number
  lastActivity: string
}

export interface Session {
  id: string
  startTime: string
  endTime: string
  duration: number
  mode: string
}

export interface LogState {
  sessions: Session[]
  streak: StreakState
  addSession: (session: Session) => void
  addManualTime: (dateStr: string, minutes: number) => void
  setDayTime: (dateStr: string, minutes: number) => void
  clearDayTime: (dateStr: string) => void
  checkStreak: () => void
}
