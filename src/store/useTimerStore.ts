import { create } from 'zustand';
import { get as idbGet, set as idbSet, del as idbDel } from 'idb-keyval';

export type TimerMode = 'stopwatch' | 'timer';

const STORAGE_KEY = 'coder-tracker-timer-state';

interface SavedTimerState {
    mode: TimerMode;
    isRunning: boolean;
    startTime: number | null;
    accumulatedSeconds: number;
    targetSeconds: number;
    sessionStartTime: string | null;
}

interface SessionData {
    startTime: string;
    endTime: string;
    duration: number;
}

interface TimerStore {
    time: number;
    isRunning: boolean;
    mode: TimerMode;
    isRestoring: boolean;

    restoreState: () => Promise<void>;
    start: () => void;
    pause: () => void;
    reset: () => Promise<void>;
    setMode: (mode: TimerMode, initialSeconds?: number) => void;
    setTime: (seconds: number) => void;
    getSessionData: () => SessionData;
}

// Внутренние переменные
let intervalId: number | null = null;
let saveIntervalId: number | null = null;
let startTimeVal: number = 0;
let accumulatedSecondsVal: number = 0;
let targetSecondsVal: number = 0;
let sessionStartTimeVal: string | null = null;
let sessionEndTimeVal: string | null = null;
let totalDurationVal: number = 0;

// Очистка всех интервалов
const clearAllIntervals = () => {
    if (intervalId !== null) {
        clearInterval(intervalId);
        intervalId = null;
    }
    if (saveIntervalId !== null) {
        clearInterval(saveIntervalId);
        saveIntervalId = null;
    }
};

// Сохранение в IndexedDB
const saveToStorage = async () => {
    const state = useTimerStore.getState();
    const stateToSave: SavedTimerState = {
        mode: state.mode,
        isRunning: state.isRunning,
        startTime: state.isRunning ? startTimeVal : null,
        accumulatedSeconds: state.isRunning ? 0 : accumulatedSecondsVal,
        targetSeconds: targetSecondsVal,
        sessionStartTime: sessionStartTimeVal,
    };

    try {
        await idbSet(STORAGE_KEY, stateToSave);
    } catch (error) {
        console.error('Ошибка сохранения:', error);
    }
};

// Функция тика
const tick = () => {
    const state = useTimerStore.getState();
    if (!state.isRunning) return;

    const now = Date.now();

    if (state.mode === 'stopwatch') {
        const seconds = Math.floor((now - startTimeVal) / 1000);
        totalDurationVal = seconds;
        useTimerStore.setState({ time: seconds });
    } else {
        const remaining = Math.ceil((startTimeVal - now) / 1000);

        if (remaining <= 0) {
            // Время вышло
            clearAllIntervals();
            totalDurationVal = targetSecondsVal;
            sessionEndTimeVal = new Date().toISOString();
            useTimerStore.setState({ time: 0, isRunning: false });
            idbDel(STORAGE_KEY);
        } else {
            totalDurationVal = targetSecondsVal - remaining;
            useTimerStore.setState({ time: remaining });
        }
    }
};

// Запуск интервалов
const startIntervals = () => {
    clearAllIntervals();

    // Основной интервал для тиков
    intervalId = window.setInterval(tick, 200);

    // Интервал для сохранения каждые 2 секунды
    saveIntervalId = window.setInterval(saveToStorage, 2000);
};

export const useTimerStore = create<TimerStore>((set, get) => ({
    time: 0,
    isRunning: false,
    mode: 'stopwatch',
    isRestoring: true,

    restoreState: async () => {
        try {
            // Используем idbGet вместо get (перекрытого Zustand)
            const saved: SavedTimerState | undefined = await idbGet(STORAGE_KEY);

            if (!saved) {
                set({ isRestoring: false });
                return;
            }

            // Восстанавливаем переменные
            targetSecondsVal = saved.targetSeconds || 0;
            sessionStartTimeVal = saved.sessionStartTime || null;
            accumulatedSecondsVal = saved.accumulatedSeconds || 0;

            // Устанавливаем режим
            set({ mode: saved.mode });

            if (saved.isRunning && saved.startTime) {
                const now = Date.now();
                startTimeVal = saved.startTime;

                let newTime = 0;

                if (saved.mode === 'stopwatch') {
                    newTime = Math.floor((now - saved.startTime) / 1000);
                } else {
                    newTime = Math.ceil((saved.startTime - now) / 1000);

                    if (newTime <= 0) {
                        // Время вышло
                        newTime = 0;
                        totalDurationVal = targetSecondsVal;
                        sessionEndTimeVal = new Date().toISOString();

                        set({
                            time: 0,
                            isRunning: false,
                            isRestoring: false
                        });

                        await idbDel(STORAGE_KEY);
                        return;
                    }
                }

                totalDurationVal = saved.mode === 'stopwatch' ? newTime : targetSecondsVal - newTime;

                set({
                    time: newTime,
                    isRunning: true,
                    isRestoring: false
                });

                // Запускаем интервалы
                startIntervals();
            } else {
                // Таймер на паузе
                set({
                    time: accumulatedSecondsVal,
                    isRunning: false,
                    isRestoring: false
                });
            }
        } catch (e) {
            console.error('Ошибка восстановления:', e);
            set({ isRestoring: false });
        }
    },

    start: () => {
        const state = get();

        // Не запускаем если восстанавливаемся или уже запущен
        if (state.isRestoring || state.isRunning) return;

        sessionEndTimeVal = null;

        // Устанавливаем время начала сессии
        if (!sessionStartTimeVal) {
            sessionStartTimeVal = new Date().toISOString();
        }

        // Устанавливаем startTimeVal
        const now = Date.now();
        if (state.mode === 'stopwatch') {
            startTimeVal = now - state.time * 1000;
        } else {
            startTimeVal = now + state.time * 1000;
        }

        // Обновляем состояние
        set({ isRunning: true });

        // Запускаем интервалы
        startIntervals();

        // Сохраняем
        saveToStorage();
    },

    pause: () => {
        const state = get();

        if (!state.isRunning || state.isRestoring) return;

        // Останавливаем интервалы
        clearAllIntervals();

        sessionEndTimeVal = new Date().toISOString();

        // Сохраняем текущее время
        accumulatedSecondsVal = state.time;
        totalDurationVal = state.mode === 'stopwatch' ? state.time : targetSecondsVal - state.time;

        // Обновляем состояние
        set({ isRunning: false });

        // Сохраняем
        saveToStorage();
    },

    reset: async () => {
        const state = get();

        // Останавливаем интервалы
        clearAllIntervals();

        const resetSeconds = state.mode === 'stopwatch' ? 0 : targetSecondsVal;

        accumulatedSecondsVal = resetSeconds;
        startTimeVal = 0;
        sessionStartTimeVal = null;
        sessionEndTimeVal = null;
        totalDurationVal = 0;

        set({ time: resetSeconds, isRunning: false });
        await idbDel(STORAGE_KEY);
    },

    setMode: (newMode: TimerMode, initialSeconds = 0) => {
        const state = get();
        if (state.isRunning || state.isRestoring) return;

        clearAllIntervals();

        const resetSeconds = newMode === 'stopwatch' ? 0 : initialSeconds;

        accumulatedSecondsVal = resetSeconds;
        targetSecondsVal = resetSeconds;
        startTimeVal = 0;
        sessionStartTimeVal = null;
        sessionEndTimeVal = null;
        totalDurationVal = 0;

        set({ mode: newMode, time: resetSeconds, isRunning: false });
        saveToStorage();
    },

    setTime: (newTime: number) => {
        const state = get();
        if (state.isRunning || state.isRestoring) return;

        const clampedTime = Math.max(0, newTime);

        accumulatedSecondsVal = clampedTime;
        targetSecondsVal = clampedTime;

        set({ time: clampedTime });
        saveToStorage();
    },

    getSessionData: () => {
        return {
            startTime: sessionStartTimeVal || new Date().toISOString(),
            endTime: sessionEndTimeVal || new Date().toISOString(),
            duration: totalDurationVal,
        };
    },
}));