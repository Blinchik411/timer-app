import { useState, useEffect, useRef, useCallback } from 'react';

type TimerMode = 'stopwatch' | 'timer';

interface UseTimerConfig {
    initialMode?: TimerMode;
    initialSeconds?: number;
}

export const useTimer = ({ initialMode = 'stopwatch', initialSeconds = 0 }: UseTimerConfig = {}) => {
    const [mode, setMode] = useState<TimerMode>(initialMode);
    const [time, setTime] = useState<number>(initialSeconds);
    const [isRunning, setIsRunning] = useState<boolean>(false);

    const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const startTimeRef = useRef<number>(0);
    const accumulatedTimeRef = useRef<number>(initialSeconds);

    const targetSecondsRef = useRef<number>(initialSeconds);

    const sessionStartTimeRef = useRef<string | null>(null);
    const totalDurationRef = useRef<number>(0);

    const start = useCallback(() => {
        if (isRunning) return;

        setIsRunning(true);

        if (!sessionStartTimeRef.current) {
            sessionStartTimeRef.current = new Date().toISOString();
        }

        if (mode === 'stopwatch') {
            startTimeRef.current = Date.now() - accumulatedTimeRef.current * 1000;
        } else {
            startTimeRef.current = Date.now() + accumulatedTimeRef.current * 1000;
        }
    }, [isRunning, mode]);

    const pause = useCallback(() => {
        if (!isRunning) return;

        setIsRunning(false);
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
        }

        accumulatedTimeRef.current = time;
    }, [isRunning, time]);

    const reset = useCallback(() => {
        setIsRunning(false);
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
        }

        const resetSeconds = mode === 'stopwatch' ? 0 : targetSecondsRef.current;
        accumulatedTimeRef.current = resetSeconds;
        setTime(resetSeconds);

        sessionStartTimeRef.current = null;
        totalDurationRef.current = 0;
    }, [mode]);

    useEffect(() => {
        if (isRunning) {
            intervalRef.current = setInterval(() => {
                const now = Date.now();

                if (mode === 'stopwatch') {
                    const calculatedSeconds = Math.floor((now - startTimeRef.current) / 1000);
                    setTime(calculatedSeconds);
                    totalDurationRef.current = calculatedSeconds;
                } else {
                    const calculatedSeconds = Math.ceil((startTimeRef.current - now) / 1000);

                    if (calculatedSeconds <= 0) {
                        setIsRunning(false);
                        setTime(0);
                        totalDurationRef.current = targetSecondsRef.current;
                        if (intervalRef.current) clearInterval(intervalRef.current);
                    } else {
                        setTime(calculatedSeconds);
                        totalDurationRef.current = targetSecondsRef.current - calculatedSeconds;
                    }
                }
            }, 200);
        }

        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        };
    }, [isRunning, mode]);

    const getSessionData = useCallback(() => {
        return {
            startTime: sessionStartTimeRef.current || new Date().toISOString(),
            endTime: new Date().toISOString(),
            duration: totalDurationRef.current,
        };
    }, []);

    const setTimeWrapper = useCallback((newTime: number) => {
        accumulatedTimeRef.current = newTime;

        if (!isRunning) {
            targetSecondsRef.current = newTime;
        }
        setTime(newTime);
    }, [isRunning]);

    return {
        time,
        isRunning,
        mode,
        setMode,
        start,
        pause,
        reset,
        getSessionData,
        setTime: setTimeWrapper
    };
};