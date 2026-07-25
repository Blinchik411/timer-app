import React from 'react';
import { useTimerStore } from '@/features/timer/store/useTimerStore';
import formatTime from '@/shared/utils/formatTime.ts';
import styles from './TimerDisplay.module.scss';

const TimerDisplay: React.FC = () => {
    const time = useTimerStore((state) => state.time);

    return (
        <div className={styles.displayContainer}>
            <span className={styles.timeText}>
                {formatTime(time)}
            </span>
        </div>
    );
};

export default React.memo(TimerDisplay);