import { memo } from 'react'
import { useTimerStore } from '@/features/timer/store/useTimerStore'
import { useDynamicFavicon } from '@/shared/hooks/useDynamicFavicon'
import { useTimerTitle } from '@/shared/hooks/useTimerTitle'

export const FaviconController = memo(() => {
  const isRunning = useTimerStore((state) => state.isRunning)
  const time = useTimerStore((state) => state.time)

  useDynamicFavicon(isRunning)
  useTimerTitle(time, isRunning)

  return null
})

export default FaviconController
