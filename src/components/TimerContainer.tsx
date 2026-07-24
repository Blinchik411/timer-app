import React, { useEffect, useState } from "react";
import { useLogStore } from "../store/useLogStore.ts";
import { useTimerStore } from "../store/useTimerStore.ts";
import TimerDisplay from "./TimerDisplay.tsx";
import WeeklyChart from "./WeeklyChart.tsx";
import YearlyChart from "./YearlyChart.tsx";

const TimerContainer = () => {
    const [minutesInput, setMinutesInput] = useState<number>(25);

    // Подписываемся только на нужные поля
    const isRunning = useTimerStore((state) => state.isRunning);
    const mode = useTimerStore((state) => state.mode);
    const isRestoring = useTimerStore((state) => state.isRestoring);

    // Экшены
    const setMode = useTimerStore((state) => state.setMode);
    const start = useTimerStore((state) => state.start);
    const pause = useTimerStore((state) => state.pause);
    const reset = useTimerStore((state) => state.reset);
    const setTime = useTimerStore((state) => state.setTime);
    const getSessionData = useTimerStore((state) => state.getSessionData);
    const restoreState = useTimerStore((state) => state.restoreState);

    // Стор для логов
    const addSession = useLogStore((state) => state.addSession);
    const streak = useLogStore((state) => state.streak);
    const checkStreak = useLogStore((state) => state.checkStreak);
    const isHydrated = useLogStore.persist.hasHydrated();

    const [canSave, setCanSave] = useState(false);

    // Восстановление при монтировании
    useEffect(() => {
        restoreState();
    }, []); // Только при монтировании

    // Проверка streak
    useEffect(() => {
        if (isHydrated) {
            checkStreak();
        }
    }, [isHydrated, checkStreak]);

    const handleStopWatchClick = () => {
        setMode('stopwatch', 0);
        setCanSave(false);
    };

    const handleTimerClick = () => {
        setMode('timer', minutesInput * 60);
        setCanSave(false);
    };

    const handlePresetClick = (mins: number) => {
        setMinutesInput(mins);
        setTime(mins * 60);
        setCanSave(false);
    };

    const handleCustomMinutesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = Math.max(1, Math.min(1440, Number(e.target.value) || 0));
        setMinutesInput(value);
        setTime(value * 60);
        setCanSave(false);
    };

    const handleSave = () => {
        const { startTime, endTime, duration } = getSessionData();

        if (duration <= 0) return;

        addSession({
            id: crypto.randomUUID(),
            startTime,
            endTime,
            duration,
            mode,
        });

        reset();
        setCanSave(false);
    };

    // Показываем загрузку
    if (isRestoring) {
        return (
            <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                height: '200px'
            }}>
                <div>Загрузка таймера...</div>
            </div>
        );
    }

    return (
        <div>
            {/* Streak info */}
            <div style={{
                display: 'flex',
                gap: '20px',
                marginBottom: '20px',
                background: '#f5f5f5',
                padding: '10px',
                borderRadius: '8px'
            }}>
                <div>
                    🔥 Текущая серия: <strong>{streak.currentStreak}</strong>
                </div>
                <div>
                    🏆 Рекорд: <strong>{streak.biggestStreak}</strong>
                </div>
            </div>

            {/* Mode selection */}
            <div style={{ marginBottom: '20px' }}>
                <button
                    type="button"
                    onClick={handleStopWatchClick}
                    disabled={isRunning}
                    style={{ marginRight: '10px' }}
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

            {/* Timer settings */}
            {mode === 'timer' && (
                <div style={{
                    marginBottom: '20px',
                    padding: '10px',
                    border: '1px dashed #ccc',
                    borderRadius: '8px'
                }}>
                    <div style={{ marginBottom: '10px' }}>
                        {[5, 10, 15, 30, 40].map(mins => (
                            <button
                                key={mins}
                                disabled={isRunning}
                                onClick={() => handlePresetClick(mins)}
                                style={{ marginRight: '5px' }}
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
                                style={{ width: '70px' }}
                            />
                        </label>
                    </div>
                </div>
            )}

            {/* Timer Display - только этот компонент ререндерится при тиках */}
            <TimerDisplay onTimeChange={setCanSave} />

            {/* Controls */}
            <div style={{ marginBottom: '20px' }}>
                <button
                    type="button"
                    onClick={isRunning ? pause : start}
                    style={{ marginRight: '10px', padding: '5px 15px' }}
                >
                    {isRunning ? 'Пауза' : 'Старт'}
                </button>

                <button
                    type="button"
                    onClick={reset}
                    style={{ marginRight: '10px', padding: '5px 15px' }}
                >
                    Сброс
                </button>

                <button
                    type="button"
                    onClick={handleSave}
                    disabled={!canSave}
                    style={{ padding: '5px 15px' }}
                >
                    Сохранить
                </button>
            </div>

            {/* Charts - не ререндерятся при тиках */}
            <WeeklyChart />
            <YearlyChart />
        </div>
    );
};

export default TimerContainer;