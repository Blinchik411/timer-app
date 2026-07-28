import React, { useState } from 'react';
import { useTimerStore } from '@/features/timer/store/useTimerStore.ts';
import styles from './TimerSettings.module.scss';

const TimerSettings = () => {
    // 1. Позволяем стейту хранить пустую строку
    const [minutesInput, setMinutesInput] = useState<number | ''>(25);

    const isRunning = useTimerStore((state) => state.isRunning);
    const mode = useTimerStore((state) => state.mode);
    const setMode = useTimerStore((state) => state.setMode);
    const setTime = useTimerStore((state) => state.setTime);

    const handleStopWatchClick = () => {
        setMode('stopwatch', 0);
    };

    const handleTimerClick = () => {
        const currentMins = typeof minutesInput === 'number' ? minutesInput : 25;
        setMode('timer', currentMins * 60);
    };

    const handlePresetClick = (mins: number) => {
        setMinutesInput(mins);
        setTime(mins * 60);
    };

    const handleCustomMinutesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const rawValue = e.target.value;

        if (rawValue === '') {
            setMinutesInput('');
            return;
        }

        const numValue = Number(rawValue);


        if (!Number.isNaN(numValue)) {
            const clampedValue = Math.max(1, Math.min(1440, numValue));
            setMinutesInput(clampedValue);
            setTime(clampedValue * 60);
        }
    };

    // 4. Чтобы при уходе фокуса инпут не оставался пустым
    const handleBlur = () => {
        if (minutesInput === '' || minutesInput < 1) {
            setMinutesInput(25);
            setTime(25 * 60);
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.modeToggle}>
                <button
                    type="button"
                    className={`${styles.modeButton} ${mode === 'stopwatch' ? styles.active : ''}`}
                    onClick={handleStopWatchClick}
                    disabled={isRunning}
                >
                    Секундомер
                </button>
                <button
                    type="button"
                    className={`${styles.modeButton} ${mode === 'timer' ? styles.active : ''}`}
                    onClick={handleTimerClick}
                    disabled={isRunning}
                >
                    Таймер
                </button>
            </div>

            <div className={`${styles.timerOptions} ${mode !== 'timer' ? styles.hidden : ''}`}>
                <div className={styles.presets}>
                    {[5, 10, 15, 30, 40, 60].map((mins) => (
                        <button
                            key={mins}
                            type="button"
                            className={`${styles.presetButton} ${minutesInput === mins ? styles.active : ''}`}
                            disabled={isRunning}
                            onClick={() => handlePresetClick(mins)}
                        >
                            {mins} мин
                        </button>
                    ))}
                </div>

                <label className={styles.customInputLabel}>
                    <span>Свой вариант:</span>
                    <input
                        type="number"
                        min="1"
                        max="1440"
                        value={minutesInput}
                        onChange={handleCustomMinutesChange}
                        onBlur={handleBlur}
                        disabled={isRunning}
                    />
                    <span>мин</span>
                </label>
            </div>
        </div>
    );
};

export default React.memo(TimerSettings);