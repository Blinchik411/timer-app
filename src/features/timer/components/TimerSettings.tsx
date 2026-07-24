import React, { useState } from 'react';
import { useTimerStore } from '@/features/timer/store/useTimerStore.ts';

const TimerSettings: React.FC = () => {
    const [minutesInput, setMinutesInput] = useState<number>(25);

    const isRunning = useTimerStore((state) => state.isRunning);
    const mode = useTimerStore((state) => state.mode);
    const setMode = useTimerStore((state) => state.setMode);
    const setTime = useTimerStore((state) => state.setTime);


    const handleStopWatchClick = () => {
        setMode('stopwatch', 0);
    };

    const handleTimerClick = () => {
        setMode('timer', minutesInput * 60);
    };


    const handlePresetClick = (mins: number) => {
        setMinutesInput(mins);
        setTime(mins * 60);
    };

    const handleCustomMinutesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = Math.max(1, Math.min(1440, Number(e.target.value) || 0));
        setMinutesInput(value);
        setTime(value * 60);
    };

    return (
        <div>
            <div>
                <button
                    type="button"
                    onClick={handleStopWatchClick}
                    disabled={isRunning}
                >
                    Секундомер
                </button>
                <button
                    type="button"
                    onClick={handleTimerClick}
                    disabled={isRunning}
                >
                    Таймер
                </button>
            </div>

            {mode === 'timer' && (
                <div>
                    <div>
                        {[5, 10, 15, 30, 40].map((mins) => (
                            <button
                                key={mins}
                                disabled={isRunning}
                                onClick={() => handlePresetClick(mins)}
                            >
                                {mins} мин
                            </button>
                        ))}
                    </div>
                    <div>
                        <label>
                            Свой вариант (мин):{' '}
                            <input
                                type="number"
                                min="1"
                                max="1440"
                                value={minutesInput}
                                onChange={handleCustomMinutesChange}
                                disabled={isRunning}
                            />
                        </label>
                    </div>
                </div>
            )}
        </div>
    );
};

export default React.memo(TimerSettings);