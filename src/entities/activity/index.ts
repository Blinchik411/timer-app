export { useLogStore } from './model/useLogStore'
export type { Session, StreakState, LogState } from './model/types'
export {
  getLocalDateString,
  calculateNewStreak,
  checkAndResetExpiredStreak,
  recalculateStreakFromSessions,
} from './lib/calculateStreakTime'
