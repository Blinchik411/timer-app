import React, { useState, useEffect } from "react";
import { useTimerStore } from "../store/useTimerStore.ts";
import { useLogStore } from "../store/useLogStore.ts";

const TimerControls = () => {
    // Подписываемся на подмножество стора
    const isRunning = useTimerStore((state) => state.isRunning);
    const time = useTimerStore((state) => state.time);
    const mode = useTimerStore((state) => state.mode);

    // Действия таймера
    const start = useTimerStore((state) => state.start);
    const pause = useTimerStore((state) => state.pause);
    const reset = useTimerStore((state) => state.reset);
    const getSessionData = useTimerStore((state) => state.getSessionData);

    // Действие лога
    const addSession = useLogStore((state) => state.addSession);

    const [canSave, setCanSave] = useState(false);

    // Следим за временем: если натикала хотя бы 1 секунда, разрешаем сохранение
    useEffect(() => {
        setCanSave(time > 0);
    }, [time]);

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