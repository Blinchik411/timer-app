import React from "react";
import { useTimerStore } from "@/features/timer/store/useTimerStore";
import { useLogStore } from "@/features/analytics/store/useLogStore";
import styles from "./TimerControls.module.scss";

const TimerControls = () => {
    const isRunning = useTimerStore((state) => state.isRunning);
    const mode = useTimerStore((state) => state.mode);

    const canSave = useTimerStore((state) => state.time > 0);

    // Действия
    const start = useTimerStore((state) => state.start);
    const pause = useTimerStore((state) => state.pause);
    const reset = useTimerStore((state) => state.reset);
    const getSessionData = useTimerStore((state) => state.getSessionData);

    const addSession = useLogStore((state) => state.addSession);

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

    return (
        <div className={styles.controlsContainer}>
            {/* Верхняя строка: Старт/Пауза и Сброс */}
            <div className={styles.topRow}>
                <button
                    type="button"
                    className={`${styles.btnStart} ${isRunning ? styles.running : ''}`}
                    onClick={isRunning ? pause : start}
                >
                    {isRunning ? 'Пауза' : 'Старт'}
                </button>

                <button
                    type="button"
                    className={styles.btnReset}
                    onClick={reset}
                >
                    Сброс
                </button>
            </div>

            {/* Нижная строка: Сохранить */}
            <button
                type="button"
                className={styles.btnSave}
                onClick={handleSave}
                disabled={!canSave}
            >
                Сохранить сессию
            </button>
        </div>
    );
};

export default React.memo(TimerControls);