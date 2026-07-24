import React from "react";
import { useTimerStore } from "@/features/timer/store/useTimerStore.ts";
import { useLogStore } from "@/features/analytics/store/useLogStore";

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
    );
};

export default React.memo(TimerControls);