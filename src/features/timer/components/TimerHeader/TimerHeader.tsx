import React, { useEffect } from "react";
import { useLogStore } from "@/features/analytics/store/useLogStore.ts";
import styles from './TimerHeader.module.scss';

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
        <div className={styles.streakBadge}>
            <div className={styles.streakItem}>
                🔥 Текущая серия: <strong className={styles.streakValue}>{streak.currentStreak}</strong>
            </div>
            <div className={styles.streakItem}>
                🏆 Рекорд: <strong className={styles.streakValue}>{streak.biggestStreak}</strong>
            </div>
        </div>
    );
};

export default React.memo(TimerHeader);