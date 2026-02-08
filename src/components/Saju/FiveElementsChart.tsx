import { SajuData } from '@/types';
import {
    Radar,
    RadarChart,
    PolarGrid,
    PolarAngleAxis,
    PolarRadiusAxis,
    ResponsiveContainer,
    Tooltip
} from 'recharts';

export default function FiveElementsChart({ data }: { data: SajuData['fiveElements'] }) {
    if (!data || !data.scores) return null;

    const chartData = [
        { subject: 'Wood (목)', A: data.scores.wood, fullMark: 10 },
        { subject: 'Fire (화)', A: data.scores.fire, fullMark: 10 },
        { subject: 'Earth (토)', A: data.scores.earth, fullMark: 10 },
        { subject: 'Metal (금)', A: data.scores.metal, fullMark: 10 },
        { subject: 'Water (수)', A: data.scores.water, fullMark: 10 },
    ];

    // Calculate max value for dynamic scaling
    const maxVal = Math.max(...chartData.map(d => d.A));
    const domainMax = Math.max(maxVal + 2, 5); // Ensure at least 5 for scale

    return (
        <div className="w-full h-[300px] relative">
            <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="70%" data={chartData}>
                    <PolarGrid stroke="#ffffff30" />
                    <PolarAngleAxis
                        dataKey="subject"
                        tick={{ fill: '#A07CFE', fontSize: 10 }}
                    />
                    <PolarRadiusAxis
                        angle={90}
                        domain={[0, domainMax]}
                        tick={false}
                        axisLine={false}
                    />
                    <Radar
                        name="Element Strength"
                        dataKey="A"
                        stroke="#8884d8"
                        strokeWidth={2}
                        fill="#8884d8"
                        fillOpacity={0.4}
                    />
                    <Tooltip
                        contentStyle={{ backgroundColor: '#1a1a2e', borderColor: '#ffffff20', borderRadius: '8px' }}
                        itemStyle={{ color: '#fff', fontSize: '12px' }}
                    />
                </RadarChart>
            </ResponsiveContainer>

            {/* Center Label or Overlay if needed */}
            <div className="absolute top-2 right-2 text-[10px] text-white/30 border border-white/10 px-2 py-1 rounded">
                Dominant: <span className="text-purple-300">{data.dominant}</span>
            </div>
        </div>
    );
}
