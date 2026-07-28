import {useMemo} from 'react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { useLogStore } from '@/features/analytics/store/useLogStore';
import { prepareWeeklyChartData } from '@/features/analytics/utils/analyticsTransformer.ts';
import {formatMinutes} from "@/shared/utils/formatMinutes";

const WeeklyChart = () => {
    const sessions = useLogStore((state) => state.sessions);

    const data = useMemo(() => prepareWeeklyChartData(sessions), [sessions]);

    return (
        <div style={{
            width: '100%',
            height: '100%',
            minHeight: 300,
            background: '#1c1c1c',
            padding: '20px',
            borderRadius: '16px',
            border: '1px solid #333336',
            boxSizing: 'border-box',
            display: 'flex',
            flexDirection: 'column'
        }}>
            <h4 style={{ marginTop: 0, textAlign: 'left', color: '#ffffff', fontSize: 18 }}>Активность за неделю</h4>

            <ResponsiveContainer width="100%" height="90%">
                <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>

                    <CartesianGrid strokeDasharray="3 3" stroke="#38383c" vertical={false} />

                    <XAxis
                        dataKey="label"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: '#a1a1aa', fontSize: 15 }}
                    />
                    <YAxis
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: '#a1a1aa', fontSize: 15 }}
                        domain={[0, (dataMax: number) => Math.max(60, Math.ceil(dataMax / 10) * 10)]}
                        allowDecimals={false}
                    />

                    <Tooltip
                        cursor={{ fill: 'rgba(255, 255, 255, 0.06)', radius: 4 }}
                        contentStyle={{
                            backgroundColor: '#18181b',
                            borderColor: '#3f3f46',
                            borderRadius: '8px',
                            color: '#ffffff',
                            fontSize: '13px',
                            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.5)'
                        }}
                        itemStyle={{ color: '#818cf8' }}
                        formatter={(value) => {
                            const minutes = value ? Number(value) : 0;
                            return [formatMinutes(minutes), 'Время'];
                        }}
                    />

                    <Bar
                        dataKey="minutes"
                        style={{ fill: '#6366f1' }}
                        activeBar={{ fill: 'rgba(255, 255, 255, 0.7)' }}
                        radius={[4, 4, 0, 0]}
                    />
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
};

// @ts-ignore
export default (WeeklyChart);