// src/shared/components/FaviconController.tsx
import React, { memo } from 'react';
import { useTimerStore } from '@/features/timer/store/useTimerStore';
import { useDynamicFavicon } from '@/shared/hooks/useDynamicFavicon';

export const FaviconController: React.FC = memo(() => {

    const isRunning = useTimerStore((state) => state.isRunning);

    useDynamicFavicon(isRunning);

    return null;
});

export default FaviconController