// src/shared/components/FaviconController.tsx
import React, { memo } from 'react';
import { useTimerStore } from '@/features/timer/store/useTimerStore';
import { useDynamicFavicon } from '../../../shared/hooks/useDynamicFavicon';

export const FaviconController: React.FC = memo(() => {
    // Вытаскиваем точечно isRunning
    const isRunning = useTimerStore((state) => state.isRunning);

    useDynamicFavicon(isRunning);

    return null; // Он ничего не рендерит в DOM!
});

export default FaviconController