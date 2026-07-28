import { memo } from 'react';
import { useTimerStore } from '@/features/timer/store/useTimerStore';
import { useDynamicFavicon } from '@/shared/hooks/useDynamicFavicon';

export const FaviconController = memo(() => {

    const isRunning = useTimerStore((state) => state.isRunning);

    useDynamicFavicon(isRunning);

    return null;
});

export default FaviconController