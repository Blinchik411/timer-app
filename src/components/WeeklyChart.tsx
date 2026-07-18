import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { useLogStore } from '../store/useLogStore';
import { prepareWeeklyChartData } from '../utils/analyticsTransformer';

const WeeklyChart = () => {
    const sessions = useLogStore((state) => state.sessions);

    const data = prepareWeeklyChartData(sessions);

    return (
        <div style={{ width: 300, height: 300, background: '#fff', padding: '20px', borderRadius: '8px', border: '1px solid #eee' }}>
            <h4 style={{ marginTop: 0, textAlign: 'left' }}>Активность за неделю</h4>

            <ResponsiveContainer width="100%" height="90%">
                <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>

                    <CartesianGrid strokeDasharray="5 5" vertical={false} />


                    <XAxis dataKey="label" axisLine={false} tickLine={false} />
                    <YAxis axisLine={false} tickLine={false} />

                    <Tooltip
                        cursor={{ fill: '#f5f5f5' }}
                        formatter={(value) => {
                            const minutes = value ? Number(value) : 0;
                            return [`${minutes} мин`, 'Время'];
                        }}
                    />

                    <Bar dataKey="minutes" fill="#4caf50" radius={[4, 4, 0, 0]} />
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
};

export default WeeklyChart;