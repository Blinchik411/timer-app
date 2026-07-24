
import React from 'react';
import { useTimerStore } from '@/features/timer/store/useTimerStore';
import formatTime from '@/shared/utils/formatTime.ts';

const TimerDisplay: React.FC = () => {
    const time = useTimerStore((state) => state.time);

    return (
        <div>
            {formatTime(time)}
        </div>
    );
};

export default React.memo(TimerDisplay);