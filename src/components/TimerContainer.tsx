import React, {useEffect, useState} from "react";
import { useLogStore } from "../store/useLogStore.ts";
import { useTimer } from "../hooks/useTimer.tsx";
import formatTime from "../utils/formatTime.ts";

const TimerContainer = () => {
    const [minutesInput, setMinutesInput] = useState<number>(25);

    const {
        time,
        isRunning,
        mode,
        setMode,
        start,
        pause,
        reset,
        setTime,
        getSessionData
    } = useTimer({
        initialMode: 'stopwatch',
        initialSeconds: 0
    });

    const addSession = useLogStore((state) => state.addSession);
    const streak = useLogStore((state) => state.streak);
    const checkStreak = useLogStore((state) => state.checkStreak);


    const handleStopWatchClick = () => {
        setMode('stopwatch');
        setTime(0);
    };

    const handleTimerClick = () => {
        setMode('timer');
        setTime(minutesInput * 60);
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
    };

    const isSaveDisabled = mode === 'stopwatch'
        ? time === 0
        : time === (minutesInput * 60);

    useEffect(() => {
        checkStreak();
    }, [checkStreak]);

    return (
        <div>
            <div style={{ display: 'flex', gap: '20px', marginBottom: '20px', background: '#f5f5f5', padding: '10px', borderRadius: '8px' }}>
                <div>
                    🔥 Текущая серия: <strong>{streak.currentStreak}</strong>
                </div>
                <div>
                    🏆 Рекорд: <strong>{streak.biggestStreak}</strong>
                </div>
            </div>
            <div style={{ marginBottom: '20px' }}>
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
                <div style={{ marginBottom: '20px', padding: '10px', border: '1px dashed #ccc', borderRadius: '8px' }}>
                    <div style={{ marginBottom: '10px' }}>
                        <button
                            disabled={isRunning}
                            onClick={() => handlePresetClick(5)}
                            style={{ marginRight: '5px' }}
                        >
                            5 мин
                        </button>
                        <button
                            disabled={isRunning}
                            onClick={() => handlePresetClick(10)}
                            style={{ marginRight: '5px' }}
                        >
                            10 мин
                        </button>
                        <button
                            disabled={isRunning}
                            onClick={() => handlePresetClick(15)}
                            style={{ marginRight: '5px' }}
                        >
                            15 мин
                        </button>
                        <button
                            disabled={isRunning}
                            onClick={() => handlePresetClick(30)}
                            style={{ marginRight: '5px' }}
                        >
                            30 мин
                        </button>
                        <button
                            disabled={isRunning}
                            onClick={() => handlePresetClick(40)}
                        >
                            40 мин
                        </button>
                    </div>
                    <div>
                        <label>
                            Свой вариант (мин):{' '}
                            <input
                                type="number"
                                value={minutesInput}
                                onChange={handleCustomMinutesChange}
                                disabled={isRunning}
                            />
                        </label>
                    </div>
                </div>
            )}

            {/* Циферблат */}
            <div style={{ fontSize: '1.5rem', margin: '20px 0' }}>
                {formatTime(time)}
            </div>

            {/* Управление */}
            <div>
                {!isRunning ? (
                    <button
                        type="button"
                        onClick={start}
                        style={{ marginRight: '10px', padding: '5px 15px' }}
                    >
                        Старт
                    </button>
                ) : (
                    <button
                        type="button"
                        onClick={pause}
                        style={{ marginRight: '10px', padding: '5px 15px' }}
                    >
                        Пауза
                    </button>
                )}

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
                    disabled={isSaveDisabled}
                    style={{ padding: '5px 15px' }}
                >
                    Сохранить
                </button>
            </div>
        </div>
    );
};

export default TimerContainer;