import React, { useEffect } from 'react';
import { useTimerStore } from '../store/useTimerStore';
import formatTime from '../utils/formatTime';

interface TimerDisplayProps {
    onTimeChange?: (canSave: boolean) => void;
}

const TimerDisplay: React.FC<TimerDisplayProps> = ({ onTimeChange }) => {
    const time = useTimerStore((state) => state.time);
    const mode = useTimerStore((state) => state.mode);

    useEffect(() => {
        if (onTimeChange) {
            const canSave = time > 0;
            onTimeChange(canSave);
        }
    }, [time, mode, onTimeChange]);

    return (
        <div style={{ fontSize: '1.5rem', margin: '20px 0' }}>
            {formatTime(time)}
        </div>
    );
};

export default React.memo(TimerDisplay);