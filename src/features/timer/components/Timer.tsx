import  { useEffect } from "react";
import { useTimerStore } from "@/features/timer/store/useTimerStore.ts";
import TimerDisplay from "@/features/timer/components/TimerDisplay.tsx";
import WeeklyChart from "@/features/analytics/components/WeeklyChart.tsx";
import YearlyChart from "@/features/analytics/components/YearlyChart.tsx";
import TimerSettings from "@/features/timer/components/TimerSettings.tsx";
import TimerControls from "@/features/timer/components/TimerControls.tsx";
import TimerHeader from "@/features/timer/components/TimerHeader.tsx";


const Timer = () => {

    const isRestoring = useTimerStore((state) => state.isRestoring);
    const restoreState = useTimerStore((state) => state.restoreState);



    useEffect(() => {
        restoreState();
    }, [restoreState]);

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
            <TimerHeader />
            <TimerSettings />
            <TimerDisplay />
            <TimerControls />
            <WeeklyChart />
            <YearlyChart />
        </div>
    );
};

export default Timer;