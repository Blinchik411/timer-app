import { create } from 'zustand';
import { get as idbGet, set as idbSet, del as idbDel } from 'idb-keyval';

// Режимы работы: секундомер (прямой отсчет) или таймер (обратный отсчет)
export type TimerMode = 'stopwatch' | 'timer';

// Уникальный ключ для хранения снимка состояния таймера в IndexedDB
const STORAGE_KEY = 'coder-tracker-timer-state';

// Интерфейс сохраненного состояния в IndexedDB
interface SavedTimerState {
    mode: TimerMode;
    isRunning: boolean;
    startTime: number | null; // Точка отсчета времени в миллисекундах (Date.now())
    accumulatedSeconds: number; // Накопленное время на паузе
    targetSeconds: number; // Целевое время для обратного отсчета
    sessionStartTime: string | null; // ISO-штамп старта всей рабочей сессии
}

// Данные сессии, экспортируемые для сохранения в историю/аналитику
interface SessionData {
    startTime: string;
    endTime: string;
    duration: number; // Чистая продолжительность в секундах
}

// Интерфейс Zustand-стора (публичные состояния и методы для UI)
interface TimerStore {
    time: number; // Текущие секунды на экране
    isRunning: boolean; // Флаг активности (идет отсчет / пауза)
    mode: TimerMode; // Текущий режим
    isRestoring: boolean; // Флаг фоновой гидратации из IndexedDB

    restoreState: () => Promise<void>;
    start: () => void;
    pause: () => void;
    reset: () => Promise<void>;
    setMode: (mode: TimerMode, initialSeconds?: number) => void;
    setTime: (seconds: number) => void;
    getSessionData: () => SessionData;
}

/* ==========================================================================
   ВНУТРЕННИЕ ПЕРЕМЕННЫЕ МОДУЛЯ (Модульный стейт)
   Изолированы от React/Zustand для предотвращения лишних ререндеров
   ========================================================================== */
let intervalId: number | null = null; // ID таймера для вызова tick (200 мс)
let saveIntervalId: number | null = null; // ID таймера для автосохранения (2000 мс)
let startTimeVal: number = 0; // Точечная метка системного времени Date.now()
let accumulatedSecondsVal: number = 0; // Накопленное время при паузе
let targetSecondsVal: number = 0; // Исходное целевое время (для таймера)
let sessionStartTimeVal: string | null = null; // Дата/время первого клика "Старт"
let sessionEndTimeVal: string | null = null; // Дата/время паузы или завершения
let totalDurationVal: number = 0; // Вычисленная полная длительность сессии

/**
 * Очищает все фоновые интервалы тиков и автосохранения.
 * Защищает от утечек памяти и параллельного запуска нескольких таймеров.
 */
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

/**
 * Делает асинхронный снимок (snapshot) текущего состояния и сохраняет в IndexedDB.
 * Запускается каждые 2 секунды во время хода таймера или при смене состояний.
 */
const saveToStorage = async () => {
    const state = useTimerStore.getState();
    const stateToSave: SavedTimerState = {
        mode: state.mode,
        isRunning: state.isRunning,
        // Если запущен — сохраняем точку старта, если на паузе — null
        startTime: state.isRunning ? startTimeVal : null,
        // Если запущен — накопленное время 0, если на паузе — текущее время паузы
        accumulatedSeconds: state.isRunning ? 0 : accumulatedSecondsVal,
        targetSeconds: targetSecondsVal,
        sessionStartTime: sessionStartTimeVal,
    };

    try {
        await idbSet(STORAGE_KEY, stateToSave);
    } catch (error) {
        console.error('Ошибка сохранения состояния в IndexedDB:', error);
    }
};

/**
 * Вычислительное сердце отсчета времени.
 * Запускается 5 раз в секунду (200 мс).
 * Вычисляет время на основе разницы системных меток Date.now(),
 * что предотвращает рассинхрон при работе во фоновых вкладках.
 */
const tick = () => {
    const state = useTimerStore.getState();
    if (!state.isRunning) return;

    const now = Date.now();

    if (state.mode === 'stopwatch') {
        // Секундомер: считаем, сколько секунд прошло с момента startTimeVal
        const seconds = Math.floor((now - startTimeVal) / 1000);
        totalDurationVal = seconds;
        useTimerStore.setState({ time: seconds });
    } else {
        // Таймер: считаем, сколько секунд осталось до target-метки startTimeVal
        const remaining = Math.ceil((startTimeVal - now) / 1000);

        if (remaining <= 0) {
            // Завершение отсчета
            clearAllIntervals();
            totalDurationVal = targetSecondsVal;
            sessionEndTimeVal = new Date().toISOString();
            useTimerStore.setState({ time: 0, isRunning: false });
            idbDel(STORAGE_KEY); // Очищаем хранилище после естественного финиша
        } else {
            totalDurationVal = targetSecondsVal - remaining;
            useTimerStore.setState({ time: remaining });
        }
    }
};

/**
 * Координирует запуск фоновых интервалов тика (200 мс) и сохранения (2000 мс).
 */
const startIntervals = () => {
    clearAllIntervals(); // Гарантированный сброс перед созданием новых

    intervalId = window.setInterval(tick, 200);
    saveIntervalId = window.setInterval(saveToStorage, 2000);
};

/* ==========================================================================
   ZUSTAND STORE
   ========================================================================== */
export const useTimerStore = create<TimerStore>((set, get) => ({
    time: 0,
    isRunning: false,
    mode: 'stopwatch',
    isRestoring: true, // По умолчанию идет гидратация из БД

    /**
     * Восстанавливает состояние при первом старте/перезагрузке страницы.
     * Рассчитывает время, прошедшее пока сайт был оффлайн.
     */
    restoreState: async () => {
        try {
            // Используем idbGet (переименованный импорт), чтобы избегнуть конфликта с get из Zustand
            const saved: SavedTimerState | undefined = await idbGet(STORAGE_KEY);

            if (!saved) {
                set({ isRestoring: false });
                return;
            }

            // Восстанавливаем внутренние переменные из хранилища
            targetSecondsVal = saved.targetSeconds || 0;
            sessionStartTimeVal = saved.sessionStartTime || null;
            accumulatedSecondsVal = saved.accumulatedSeconds || 0;

            set({ mode: saved.mode });

            // Если таймер был запущен на момент закрытия вкладки
            if (saved.isRunning && saved.startTime) {
                const now = Date.now();
                startTimeVal = saved.startTime;

                let newTime = 0;

                if (saved.mode === 'stopwatch') {
                    // Вычисляем набежавшее время секундомера
                    newTime = Math.floor((now - saved.startTime) / 1000);
                } else {
                    // Вычисляем оставшееся время обратного отсчета
                    newTime = Math.ceil((saved.startTime - now) / 1000);

                    // Если время истекло, пока сайт был закрыт
                    if (newTime <= 0) {
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

                // Возобновляем интервалы
                startIntervals();
            } else {
                // Если таймер находился на паузе
                set({
                    time: accumulatedSecondsVal,
                    isRunning: false,
                    isRestoring: false
                });
            }
        } catch (e) {
            console.error('Ошибка восстановления состояния таймера:', e);
            set({ isRestoring: false });
        }
    },

    /**
     * Запускает или возобновляет отсчет времени с учетом накопленного баланса.
     */
    start: () => {
        const state = get();

        // Блокируем вызов во время восстановления или повторных кликов
        if (state.isRestoring || state.isRunning) return;

        sessionEndTimeVal = null;

        // Фиксируем старт сессии при первом запуске
        if (!sessionStartTimeVal) {
            sessionStartTimeVal = new Date().toISOString();
        }

        // Вычисляем startTimeVal с учетом уже накопленных секунд
        const now = Date.now();
        if (state.mode === 'stopwatch') {
            startTimeVal = now - state.time * 1000;
        } else {
            startTimeVal = now + state.time * 1000;
        }

        set({ isRunning: true });
        startIntervals();
        saveToStorage();
    },

    /**
     * Ставит отсчет на паузу и фиксирует текущие результаты.
     */
    pause: () => {
        const state = get();

        if (!state.isRunning || state.isRestoring) return;

        clearAllIntervals();

        sessionEndTimeVal = new Date().toISOString();
        accumulatedSecondsVal = state.time;
        totalDurationVal = state.mode === 'stopwatch' ? state.time : targetSecondsVal - state.time;

        set({ isRunning: false });
        saveToStorage();
    },

    /**
     * Полностью сбрасывает таймер к дефолтным значениям и очищает хранилище.
     */
    reset: async () => {
        const state = get();

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

    /**
     * Переключает режим (stopwatch/timer) и подготавливает стартовые секунды.
     */
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

    /**
     * Задает кастомное время (например, выбор пресета 25 мин или ввод в инпут).
     */
    setTime: (newTime: number) => {
        const state = get();
        if (state.isRunning || state.isRestoring) return;

        const clampedTime = Math.max(0, newTime); // Защита от отрицательных чисел

        accumulatedSecondsVal = clampedTime;
        targetSecondsVal = clampedTime;

        set({ time: clampedTime });
        saveToStorage();
    },

    /**
     * Формирует и возвращает финальный снимок данных сессии для логирования и аналитики.
     */
    getSessionData: () => {
        return {
            startTime: sessionStartTimeVal || new Date().toISOString(),
            endTime: sessionEndTimeVal || new Date().toISOString(),
            duration: totalDurationVal,
        };
    },
}));