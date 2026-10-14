import type {StreakState} from "../utils/calculateStreakTime.ts";

export interface Session {
    id: string;
    startTime: string;
    endTime: string;
    duration: number;
    mode: string;
}

export interface Settings  {
    dailyNotification: string;
    toggleNotification: boolean;
}

export interface LogState {
    sessions: Session[];
    streak: StreakState;
    settings: Settings;
    addSession: (session: Session) => void;
    addManualTime: (dateStr: string, minutes: number) => void;
    setDayTime: (dateStr: string, minutes: number) => void;
    clearDayTime: (dateStr: string) => void;
    updateSettings: (settings: Partial<Settings>) => void;
    checkStreak: () => void;
}



