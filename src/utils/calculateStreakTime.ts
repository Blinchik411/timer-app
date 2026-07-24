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