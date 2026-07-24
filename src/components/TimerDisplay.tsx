// TimerDisplay.tsx должен быть минималистичным:
import React from 'react';
import { useTimerStore } from '../store/useTimerStore';
import formatTime from '../utils/formatTime';

const TimerDisplay: React.FC = () => {
    const time = useTimerStore((state) => state.time);

    return (
        <div style={{ fontSize: '1.5rem', margin: '20px 0' }}>
            {formatTime(time)}
        </div>
    );
};

export default React.memo(TimerDisplay);