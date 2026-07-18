import { type Session } from '../types/store';
import { getLocalDateString } from './CalculateStreakTime';

export interface ChartDataPoint {
    dateStr: string;
    label: string;
    minutes: number;
}


export const prepareWeeklyChartData = (sessions: Session[]): ChartDataPoint[] => {

    const daysOfWeek = ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'];
    const chartData: ChartDataPoint[] = [];

    const today = new Date();

    const currentDay = today.getDay();

    const daysSinceMonday = currentDay === 0
        ? 6
        : currentDay - 1;


    for (let i = 0; i < 7; i++) {
        const d = new Date();

        d.setDate(today.getDate() - daysSinceMonday + i);

        const dateStr = getLocalDateString(d);
        const label = daysOfWeek[d.getDay()];

        chartData.push({
            dateStr,
            label,
            minutes: 0
        });
    }

    sessions.forEach((session) => {
        const sessionDateStr = getLocalDateString(new Date(session.startTime));
        const dayMatch = chartData.find(point => point.dateStr === sessionDateStr);

        if (dayMatch) {
            dayMatch.minutes += Math.round(session.duration / 60);
        }
    });

    return chartData;
};