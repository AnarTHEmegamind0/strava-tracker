'use client';

import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { WeeklyStats } from '@/types';

interface DistanceChartProps {
  data: WeeklyStats[];
}

export default function DistanceChart({ data }: DistanceChartProps) {
  const chartData = data.map(week => ({
    week: new Date(week.week_start).toLocaleDateString('mn-MN', { month: 'short', day: 'numeric' }),
    distance: Number((week.total_distance / 1000).toFixed(1)),
  }));

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        Зайн өөрчлөлт
      </h3>
      
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
            <XAxis 
              dataKey="week" 
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#9CA3AF', fontSize: 12 }}
            />
            <YAxis 
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#9CA3AF', fontSize: 12 }}
              tickFormatter={(value) => `${value}км`}
            />
            <Tooltip
              formatter={(value) => [`${value} км`, 'Зай']}
              contentStyle={{
                backgroundColor: '#1F2937',
                border: 'none',
                borderRadius: '8px',
                color: '#fff',
              }}
            />
            <Line 
              type="monotone"
              dataKey="distance" 
              stroke="#FC4C02" 
              strokeWidth={2}
              dot={{ fill: '#FC4C02', strokeWidth: 2 }}
              activeDot={{ r: 6, fill: '#FC4C02' }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
