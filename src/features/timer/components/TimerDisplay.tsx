
import React from 'react';
import { useTimerStore } from '@/features/timer/store/useTimerStore';
import formatTime from '@/shared/utils/formatTime.ts';

const TimerDisplay: React.FC = () => {
    const time = useTimerStore((state) => state.time);

    return (
        <div style={{ fontSize: '1.5rem', margin: '20px 0' }}>
            {formatTime(time)}
        </div>
    );
};

export default React.memo(TimerDisplay);