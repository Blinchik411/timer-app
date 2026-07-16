export interface Session {
    id: string;
    startTime: string;
    endTime: string;
    duration: number;
    mode: string;
}

export interface StreakInfo {
    currentStreak: number;
    biggestStreak: number;
    lastActivity:  string;
}

export interface Settings  {
    dailyNotification: string;
    toggleNotification: boolean;
}

export interface LogState {
    sessions: Session[];
    streak: StreakInfo;
    settings: Settings;
    addSession: (session: Omit<Session, 'id'>) => void;
    updateSettings: (settings: Partial<Settings>) => void;

}



