import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { get, set, del } from 'idb-keyval';
import { type LogState, type Session, type Settings } from '@/features/analytics/types/analytics.types.ts'
import {calculateNewStreak, checkAndResetExpiredStreak} from "@/features/analytics/utils/calculateStreakTime.ts";

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

                    const updateStreak = calculateNewStreak(state.streak)

                    return {
                        sessions: [...state.sessions, newSession],
                        streak: updateStreak,
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