import React, { useEffect } from "react";
import { useLogStore } from "@/features/analytics/store/useLogStore.ts";

const TimerHeader = () => {
    const streak = useLogStore((state) => state.streak);
    const checkStreak = useLogStore((state) => state.checkStreak);

    useEffect(() => {

        if (useLogStore.persist.hasHydrated()) {
            checkStreak();
        }

        const unsubHydrate = useLogStore.persist.onFinishHydration(() => {
            checkStreak();
        });

        return () => {
            unsubHydrate();
        };
    }, [checkStreak]);

    return (
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
    );
};

export default React.memo(TimerHeader);