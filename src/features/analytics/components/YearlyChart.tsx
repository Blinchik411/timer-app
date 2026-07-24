import { useLogStore } from "@/features/analytics/store/useLogStore.ts";
import { prepareYearlyChartData } from "@/features/analytics/utils/analyticsTransformer.ts";

const intensityColors: Record<number, string> = {
    0: '#ebedf0',
    1: '#9be9a8',
    2: '#40c463',
    3: '#30a14e',
    4: '#216e39',
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
        <div style={{ display: 'inline-block', margin: '20px 0', fontFamily: 'sans-serif' }}>

            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(53, 16px)',
                gap: '4px',
                marginBottom: '6px'
            }}>
                {monthsConfig.map((m) => (
                    <span
                        key={m.label}
                        style={{
                            gridColumnStart: m.col,
                            fontSize: '12px',
                            color: '#666',
                            whiteSpace: 'nowrap'
                        }}
                    >
                        {m.label}
                    </span>
                ))}
            </div>

            <div style={{
                display: 'grid',
                gridTemplateRows: 'repeat(7, 16px)',
                gridAutoFlow: 'column',
                gap: '4px',
            }}>
                {data.map((day) => (
                    <div
                        style={{
                            backgroundColor: intensityColors[day.intensity],
                            width: 16,
                            height: 16,
                            borderRadius: 2,
                        }}
                        key={day.dateStr}
                        title={`${day.dateStr}: ${day.minutes} мин.`}
                    >
                    </div>
                ))}
            </div>
        </div>
    );
};

export default YearlyChart;