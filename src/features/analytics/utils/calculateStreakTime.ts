export interface StreakState {
    currentStreak: number;
    biggestStreak: number;
    lastActivity: string;
}


export const getLocalDateString = (dateInput?: string | Date): string => {
    const date = dateInput ? new Date(dateInput) : new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};


const getDaysDiff = (lastActivityStr: string, todayStr: string): number => {
    if (!lastActivityStr) return 0;
    const todayDate = new Date(todayStr);
    const lastActiveDate = new Date(lastActivityStr);
    const diffTime = Math.abs(todayDate.getTime() - lastActiveDate.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};


export const calculateNewStreak = (currentState: StreakState): StreakState => {
    const todayStr = getLocalDateString();
    const lastActivityStr = currentState.lastActivity;

    let newCurrentStreak = currentState.currentStreak;

    if (!lastActivityStr) {
        newCurrentStreak = 1;
    } else if (lastActivityStr === todayStr) {
        newCurrentStreak = currentState.currentStreak;
    } else {
        const diffDays = getDaysDiff(lastActivityStr, todayStr);

        newCurrentStreak = (diffDays === 1)
            ? currentState.currentStreak + 1
            : 1;
    }

    return {
        currentStreak: newCurrentStreak,
        biggestStreak: Math.max(newCurrentStreak, currentState.biggestStreak),
        lastActivity: todayStr,
    };
};


export const checkAndResetExpiredStreak = (currentState: StreakState): StreakState => {
    const todayStr = getLocalDateString();
    const lastActivityStr = currentState.lastActivity;

    if (!lastActivityStr || lastActivityStr === todayStr) {
        return currentState;
    }

    const diffDays = getDaysDiff(lastActivityStr, todayStr);

    if (diffDays > 1) {
        return {
            ...currentState,
            currentStreak: 0
        };
    }

    return currentState;
};

export const recalculateStreakFromSessions = (
    sessions: Array<{ startTime: string; duration: number }>
): StreakState => {
    const dailyDurationMap = new Map<string, number>();

    for (const session of sessions) {
        if (!session.startTime || session.duration <= 0) continue;
        const dateStr = getLocalDateString(new Date(session.startTime));
        dailyDurationMap.set(
            dateStr,
            (dailyDurationMap.get(dateStr) || 0) + session.duration
        );
    }

    const activeDates = Array.from(dailyDurationMap.entries())
        .filter(([, dur]) => dur > 0)
        .map(([d]) => d)
        .sort();

    if (activeDates.length === 0) {
        return {
            currentStreak: 0,
            biggestStreak: 0,
            lastActivity: '',
        };
    }

    const activeSet = new Set(activeDates);
    const lastActivity = activeDates[activeDates.length - 1];

    let biggestStreak = 0;
    let tempStreak = 0;
    let prevDate: Date | null = null;

    for (const dStr of activeDates) {
        const [y, m, d] = dStr.split('-').map(Number);
        const curDate = new Date(y, m - 1, d);

        if (!prevDate) {
            tempStreak = 1;
        } else {
            const diffDays = Math.round((curDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24));
            if (diffDays === 1) {
                tempStreak += 1;
            } else if (diffDays > 1) {
                tempStreak = 1;
            }
        }

        if (tempStreak > biggestStreak) {
            biggestStreak = tempStreak;
        }
        prevDate = curDate;
    }

    const today = new Date();
    const todayStr = getLocalDateString(today);
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = getLocalDateString(yesterday);

    let currentStreak = 0;
    if (activeSet.has(todayStr) || activeSet.has(yesterdayStr)) {
        const checkDate = activeSet.has(todayStr) ? new Date() : yesterday;
        while (activeSet.has(getLocalDateString(checkDate))) {
            currentStreak++;
            checkDate.setDate(checkDate.getDate() - 1);
        }
    }

    return {
        currentStreak,
        biggestStreak: Math.max(biggestStreak, currentStreak),
        lastActivity,
    };
};