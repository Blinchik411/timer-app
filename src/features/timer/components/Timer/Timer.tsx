import { useEffect } from "react";
import { useTimerStore } from "@/features/timer/store/useTimerStore.ts";
import TimerDisplay from "@/features/timer/components/TimerDisplay/TimerDisplay.tsx";
import WeeklyChart from "@/features/analytics/components/WeeklyChart/WeeklyChart.tsx";
import YearlyChart from "@/features/analytics/components/YearlyChart/YearlyChart.tsx";
import TimerSettings from "@/features/timer/components/TimerSettings/TimerSettings.tsx";
import TimerControls from "@/features/timer/components/TimerControls/TimerControls.tsx";
import TimerHeader from "@/features/timer/components/TimerHeader/TimerHeader.tsx";
import styles from './Timer.module.scss'

const Timer = () => {

    const isRestoring = useTimerStore((state) => state.isRestoring);
    const restoreState = useTimerStore((state) => state.restoreState);



    useEffect(() => {
        restoreState();
    }, [restoreState]);

    if (isRestoring) {
        return (
            <div>
                <div>Загрузка таймера...</div>
            </div>
        );
    }

    return (
        <div className={styles.layout}>
            <section className={styles.timerSection}>
                <TimerHeader />
                <TimerSettings />
                <TimerDisplay />
                <TimerControls />
            </section>
            <aside className={styles.statsSection}>
                <WeeklyChart />
                <YearlyChart />
            </aside>
        </div>
    );
};

export default Timer;