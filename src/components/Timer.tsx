import  { useEffect } from "react";
import { useTimerStore } from "../store/useTimerStore.ts";
import TimerDisplay from "./TimerDisplay.tsx";
import WeeklyChart from "./WeeklyChart.tsx";
import YearlyChart from "./YearlyChart.tsx";
import TimerSettings from "./TimerSettings.tsx";
import TimerControls from "./TimerControls.tsx";
import TimerHeader from "./TimerHeader.tsx";

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