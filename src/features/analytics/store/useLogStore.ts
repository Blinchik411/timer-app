import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { get, set, del } from 'idb-keyval';
import { type LogState, type Session, type Settings } from '@/features/analytics/types/analytics.types.ts'
import {
    checkAndResetExpiredStreak,
    recalculateStreakFromSessions,
    getLocalDateString
} from "@/features/analytics/utils/calculateStreakTime.ts";

const customIDBStorage = {
    getItem: async (name: string): Promise<string | null> => {
        const value = await get(name);
        return value ?? null;
    },
    setItem: async (name: string, value: string): Promise<void> => {
        await set(name, value);
    },
    removeItem: async (name: string): Promise<void> => {
        await del(name);
    }
};

export const useLogStore = create<LogState>()(
    persist<LogState>(
        (set) => ({
            sessions: [],
            streak: {
                currentStreak: 0,
                biggestStreak: 0,
                lastActivity: '',
            },
            settings: {
                dailyNotification: '18:00',
                toggleNotification: false,
            },
            addSession: (newSession: Session) => {
                set((state) => {
                    const newSessions = [...state.sessions, newSession];
                    return {
                        sessions: newSessions,
                        streak: recalculateStreakFromSessions(newSessions),
                    };
                });
            },
            addManualTime: (dateStr: string, minutes: number) => {
                if (minutes <= 0) return;

                const [year, month, day] = dateStr.split('-').map(Number);
                const startTimeDate = new Date(year, month - 1, day, 12, 0, 0);
                const startTime = startTimeDate.toISOString();
                const endTime = new Date(startTimeDate.getTime() + minutes * 60 * 1000).toISOString();

                const newSession: Session = {
                    id: crypto.randomUUID(),
                    startTime,
                    endTime,
                    duration: minutes * 60,
                    mode: 'manual',
                };

                set((state) => {
                    const newSessions = [...state.sessions, newSession];
                    return {
                        sessions: newSessions,
                        streak: recalculateStreakFromSessions(newSessions),
                    };
                });
            },
            setDayTime: (dateStr: string, minutes: number) => {
                set((state) => {
                    const filteredSessions = state.sessions.filter((s) => {
                        const sessionDate = getLocalDateString(new Date(s.startTime));
                        return sessionDate !== dateStr;
                    });

                    if (minutes <= 0) {
                        return {
                            sessions: filteredSessions,
                            streak: recalculateStreakFromSessions(filteredSessions),
                        };
                    }

                    const [year, month, day] = dateStr.split('-').map(Number);
                    const startTimeDate = new Date(year, month - 1, day, 12, 0, 0);
                    const startTime = startTimeDate.toISOString();
                    const endTime = new Date(startTimeDate.getTime() + minutes * 60 * 1000).toISOString();

                    const newSession: Session = {
                        id: crypto.randomUUID(),
                        startTime,
                        endTime,
                        duration: minutes * 60,
                        mode: 'manual',
                    };

                    const newSessions = [...filteredSessions, newSession];
                    return {
                        sessions: newSessions,
                        streak: recalculateStreakFromSessions(newSessions),
                    };
                });
            },
            clearDayTime: (dateStr: string) => {
                set((state) => {
                    const filteredSessions = state.sessions.filter((s) => {
                        const sessionDate = getLocalDateString(new Date(s.startTime));
                        return sessionDate !== dateStr;
                    });

                    return {
                        sessions: filteredSessions,
                        streak: recalculateStreakFromSessions(filteredSessions),
                    };
                });
            },
            updateSettings: (newSettings: Partial<Settings>) => {
                set((state) => ({
                    settings: { ...state.settings, ...newSettings }
                }));
            },
            checkStreak: () => {
                set((state) => ({
                    streak: checkAndResetExpiredStreak(state.streak)
                }));
            },
        }),
        {
            name: 'coder-tracker-storage',
            storage: createJSONStorage(() => customIDBStorage),
        }
    )
);