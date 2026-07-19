import { type Session } from '../types/store';
import { getLocalDateString } from './CalculateStreakTime';

export interface ChartDataPoint {
    dateStr: string;
    label: string;
    minutes: number;
}

export interface ContributionDay {
    dateStr: string,
    minutes: number,
    intensity: 0 | 1 | 2 | 3 | 4;
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

export const prepareYearlyChartData = (sessions: Session[]): ContributionDay[] => {

    const yearlyChartData: ContributionDay[] = [];

    const startDate = new Date(new Date().getFullYear(), 0, 1);
    const endDate = new Date(new Date().getFullYear(), 11, 31);

    let current = new Date(startDate)

    while (current <= endDate) {

        const dateStr = getLocalDateString(current);

        yearlyChartData.push({
            dateStr: dateStr,
            minutes: 0,
            intensity: 0
        });

        current.setDate(current.getDate() + 1);
    }

    sessions.forEach((session) => {

        const sessionDateStr = getLocalDateString(new Date(session.startTime));

        const dayMatch = yearlyChartData.find(point => point.dateStr === sessionDateStr);

        if (dayMatch) {
            dayMatch.minutes += Math.round(session.duration / 60);
        }
    });

    yearlyChartData.forEach((day) => {
        if (day.minutes === 0) day.intensity = 0;
        else if (day.minutes <= 60) day.intensity = 1;
        else if (day.minutes <= 90) day.intensity = 2;
        else if (day.minutes <= 180) day.intensity = 3;
        else day.intensity = 4;
    });

    return yearlyChartData
}