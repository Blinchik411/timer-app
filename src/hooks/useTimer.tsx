import { useState, useEffect, useRef, useCallback } from 'react';
import { get, set, del } from 'idb-keyval';

type TimerMode = 'stopwatch' | 'timer';

interface UseTimerConfig {
    initialMode?: TimerMode;
    initialSeconds?: number;
}

const STORAGE_KEY = 'coder-tracker-timer-state';

interface SavedTimerState {
    mode: TimerMode;
    isRunning: boolean;
    startTime: number | null;
    msAtPause: number;
    targetSeconds: number;
    sessionStartTime: string | null;
}

export const useTimer = ({ initialMode = 'stopwatch', initialSeconds = 0 }: UseTimerConfig = {}) => {
    const [mode, setMode] = useState<TimerMode>(initialMode);
    const [time, setTime] = useState<number>(initialSeconds);
    const [isRunning, setIsRunning] = useState<boolean>(false);

    const [isRestoring, setIsRestoring] = useState<boolean>(true);

    const intervalRef = useRef<number | null>(null);
    const startTimeRef = useRef<number>(0);
    const accumulatedTimeRef = useRef<number>(initialSeconds);
    const targetSecondsRef = useRef<number>(initialSeconds);

    const sessionStartTimeRef = useRef<string | null>(null);
    const sessionEndTimeRef = useRef<string | null>(null);
    const totalDurationRef = useRef<number>(0);


    const saveToStorage = useCallback(async (customIsRunning?: boolean, customMode?: TimerMode) => {
        const running = customIsRunning !== undefined
            ? customIsRunning
            : isRunning;

        const stateToSave: SavedTimerState = {
            mode: customMode || mode,
            isRunning: running,
            startTime: running ? startTimeRef.current : null,
            msAtPause: accumulatedTimeRef.current * 1000,
            targetSeconds: targetSecondsRef.current,
            sessionStartTime: sessionStartTimeRef.current
        };
        await set(STORAGE_KEY, stateToSave);
    }, [mode, isRunning]);


    useEffect(() => {
        const restoreState = async () => {
            try {
                const saved: SavedTimerState | undefined = await get(STORAGE_KEY);
                if (!saved) {
                    setIsRestoring(false);
                    return;
                }

                setMode(saved.mode);
                targetSecondsRef.current = saved.targetSeconds;
                sessionStartTimeRef.current = saved.sessionStartTime;

                if (saved.isRunning && saved.startTime) {
                    const now = Date.now();
                    startTimeRef.current = saved.startTime;

                    if (saved.mode === 'stopwatch') {
                        const passed = Math.floor((now - saved.startTime) / 1000);
                        setTime(passed);
                        accumulatedTimeRef.current = passed;
                        setIsRunning(true);
                    } else {
                        const remaining = Math.ceil((saved.startTime - now) / 1000);
                        if (remaining <= 0) {
                            setTime(0);
                            accumulatedTimeRef.current = 0;
                            setIsRunning(false);
                            await del(STORAGE_KEY);
                        } else {
                            setTime(remaining);
                            accumulatedTimeRef.current = remaining;
                            setIsRunning(true);
                        }
                    }
                } else {
                    const pausedSeconds = Math.round(saved.msAtPause / 1000);
                    setTime(pausedSeconds);
                    accumulatedTimeRef.current = pausedSeconds;
                    setIsRunning(false);
                }
            } catch (e) {
                console.error("Ошибка восстановления таймера:", e);
            } finally {
                setIsRestoring(false);
            }
        };

        restoreState();
    }, []);

    const start = useCallback(() => {
        if (isRunning || isRestoring) return;

        const nextIsRunning = true;
        setIsRunning(nextIsRunning);
        sessionEndTimeRef.current = null;

        if (!sessionStartTimeRef.current) {
            sessionStartTimeRef.current = new Date().toISOString();
        }

        if (mode === 'stopwatch') {
            startTimeRef.current = Date.now() - accumulatedTimeRef.current * 1000;
        } else {
            startTimeRef.current = Date.now() + accumulatedTimeRef.current * 1000;
        }

        saveToStorage(nextIsRunning);
    }, [isRunning, isRestoring, mode, saveToStorage]);

    const pause = useCallback(() => {
        if (!isRunning || isRestoring) return;

        const nextIsRunning = false;
        setIsRunning(nextIsRunning);
        if (intervalRef.current) {
            window.clearInterval(intervalRef.current);
        }

        sessionEndTimeRef.current = new Date().toISOString();

        const now = Date.now();
        if (mode === 'stopwatch') {
            const exactSeconds = Math.floor((now - startTimeRef.current) / 1000);
            accumulatedTimeRef.current = exactSeconds;
            totalDurationRef.current = exactSeconds;
        } else {
            const remaining = Math.ceil((startTimeRef.current - now) / 1000);
            const exactRemaining = remaining > 0 ? remaining : 0;
            accumulatedTimeRef.current = exactRemaining;
            totalDurationRef.current = targetSecondsRef.current - exactRemaining;
        }

        saveToStorage(nextIsRunning);
    }, [isRunning, isRestoring, mode, saveToStorage]);

    const reset = useCallback(async () => {
        setIsRunning(false);
        if (intervalRef.current) {
            window.clearInterval(intervalRef.current);
        }

        const resetSeconds = mode === 'stopwatch' ? 0 : targetSecondsRef.current;
        accumulatedTimeRef.current = resetSeconds;
        setTime(resetSeconds);

        sessionStartTimeRef.current = null;
        sessionEndTimeRef.current = null;
        totalDurationRef.current = 0;

        await del(STORAGE_KEY);
    }, [mode]);


    useEffect(() => {
        if (isRunning && !isRestoring) {
            intervalRef.current = window.setInterval(() => {
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
                        sessionEndTimeRef.current = new Date().toISOString();
                        del(STORAGE_KEY);
                        if (intervalRef.current) window.clearInterval(intervalRef.current);
                    } else {
                        setTime(calculatedSeconds);
                        totalDurationRef.current = targetSecondsRef.current - calculatedSeconds;
                    }
                }
            }, 200);
        }

        return () => {
            if (intervalRef.current) {
                window.clearInterval(intervalRef.current);
            }
        };
    }, [isRunning, isRestoring, mode]);

    const handleSetMode = useCallback((newMode: TimerMode) => {
        if (isRunning || isRestoring) return;

        setMode(newMode);


        const resetSeconds = newMode === 'stopwatch' ? 0 : initialSeconds;
        accumulatedTimeRef.current = resetSeconds;
        targetSecondsRef.current = resetSeconds;
        setTime(resetSeconds);

        sessionStartTimeRef.current = null;
        sessionEndTimeRef.current = null;
        totalDurationRef.current = 0;


        const stateToSave: SavedTimerState = {
            mode: newMode,
            isRunning: false,
            startTime: null,
            msAtPause: resetSeconds * 1000,
            targetSeconds: resetSeconds,
            sessionStartTime: null
        };
        set(STORAGE_KEY, stateToSave);
    }, [isRunning, isRestoring, initialSeconds]);

    const getSessionData = useCallback(() => {
        del(STORAGE_KEY);
        return {
            startTime: sessionStartTimeRef.current || new Date().toISOString(),
            endTime: sessionEndTimeRef.current || new Date().toISOString(),
            duration: totalDurationRef.current,
        };
    }, []);

    const setTimeWrapper = useCallback((newTime: number) => {
        if (isRunning || isRestoring) return;

        accumulatedTimeRef.current = newTime;
        targetSecondsRef.current = newTime;
        setTime(newTime);
        saveToStorage(false);
    }, [isRunning, isRestoring, saveToStorage]);

    return {
        time,
        isRunning,
        mode,
        setMode: handleSetMode,
        start,
        pause,
        reset,
        getSessionData,
        setTime: setTimeWrapper
    };
};