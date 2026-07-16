import { useState} from "react";
import { useLogStore } from "../store/useLogStore.ts";
import { useTimer } from "../hooks/useTimer.tsx";
import formatTime from "../utils/formatTime.ts";

const TimerContainer = () => {
    const [initialTimerSeconds] = useState<number>(1800);

    const {
        time,
        isRunning,
        mode,
        setMode,
        start,
        pause,
        reset,
        setTime,
        getSessionData // Забираем метод из хука
    } = useTimer({
        initialMode: 'stopwatch',
        initialSeconds: 0
    });

    const addSession = useLogStore((state) => state.addSession);

    const handleStopWatchClick = () => {
        setMode('stopwatch');
        setTime(0);
    };

    const handleTimerClick = () => {
        setMode('timer');
        setTime(initialTimerSeconds);
    };

    const handleSave = () => {
        // Запрашиваем уже готовые и точные данные у хука
        const { startTime, endTime, duration } = getSessionData();

        if (duration <= 0) return;

        addSession({
            startTime,
            endTime,
            duration,
            mode,
        });

        reset();
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

            <div>
                {formatTime(time)}
            </div>

            <div>
                {!isRunning ? (
                    <button
                        type="button"
                        onClick={start}
                    >
                        Старт
                    </button>
                ) : (
                    <button
                        type="button"
                        onClick={pause}
                    >
                        Пауза
                    </button>
                )}

                <button
                    type="button"
                    onClick={reset}
                >
                    Сброс
                </button>

                <button
                    type="button"
                    onClick={handleSave}
                    disabled={mode === 'stopwatch' ? time === 0 : time === initialTimerSeconds}
                >
                    Сохранить
                </button>
            </div>
        </div>
    );
};

export default TimerContainer;