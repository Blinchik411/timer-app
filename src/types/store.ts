import type {StreakState} from "../utils/CalculateStreakTime.ts";

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
    updateSettings: (settings: Partial<Settings>) => void;
    checkStreak: () => void;
}



