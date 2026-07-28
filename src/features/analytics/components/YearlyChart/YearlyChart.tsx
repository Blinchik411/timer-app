import React from 'react';
import { useLogStore } from "@/features/analytics/store/useLogStore.ts";
import { prepareYearlyChartData } from "@/features/analytics/utils/analyticsTransformer.ts";
import styles from './YearlyChart.module.scss';


const intensityColors: Record<number, string> = {
    0: '#27272a',
    1: '#2e2b5e',
    2: '#4343a8',
    3: '#5f62e6',
    4: '#818cf8',
};

const monthsConfig = [
    { label: 'Янв', col: 1 },
    { label: 'Фев', col: 5 },
    { label: 'Мар', col: 9 },
    { label: 'Апр', col: 14 },
    { label: 'Май', col: 18 },
    { label: 'Июн', col: 22 },
    { label: 'Июл', col: 27 },
    { label: 'Авг', col: 31 },
    { label: 'Сен', col: 36 },
    { label: 'Окт', col: 40 },
    { label: 'Ноя', col: 44 },
    { label: 'Дек', col: 49 },
];

const YearlyChart = () => {
    const sessions = useLogStore((state) => state.sessions);
    const data = prepareYearlyChartData(sessions);

    return (
        <div className={styles.chartCard}>
            <h4 className={styles.title}>Активность за год</h4>

            <div className={styles.scrollContainer}>
                <div className={styles.gridWrapper}>
                    {/* Месяцы */}
                    <div className={styles.monthsGrid}>
                        {monthsConfig.map((m) => (
                            <span
                                key={m.label}
                                style={{ gridColumnStart: m.col }}
                                className={styles.monthLabel}
                            >
                                {m.label}
                            </span>
                        ))}
                    </div>

                    <div className={styles.daysGrid}>
                        {data.map((day) => (
                            <div
                                className={styles.daySquare}
                                style={{
                                    backgroundColor: intensityColors[day.intensity],
                                }}
                                key={day.dateStr}
                                data-tooltip={`${day.dateStr}: ${day.minutes} мин`}
                            />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default React.memo(YearlyChart);