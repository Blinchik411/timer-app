import  { memo,useEffect } from "react";
import { useLogStore } from "@/features/analytics/store/useLogStore.ts";
import styles from "./TimerHeader.module.scss";
import fireIcon from "@/assets/icons/fire.png";
import trophyIcon from "@/assets/icons/trophy.png";

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
                <img src={fireIcon} alt="Серия" className={styles.icon} />
                <span>Текущая серия:</span>
                <strong className={styles.streakValue}>{streak.currentStreak}</strong>
            </div>

            <div className={styles.streakItem}>
                <img src={trophyIcon} alt="Рекорд" className={styles.icon} />
                <span>Рекорд:</span>
                <strong className={styles.streakValue}>{streak.biggestStreak}</strong>
            </div>
        </div>
    );
};

export default memo(TimerHeader);