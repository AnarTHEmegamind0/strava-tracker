'use client';

import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { ActivityTypeBreakdown } from '@/types';

interface ActivityTypeChartProps {
  data: ActivityTypeBreakdown[];
}

const COLORS = ['#FC4C02', '#3B82F6', '#10B981', '#8B5CF6', '#F59E0B', '#EF4444', '#06B6D4'];

export default function ActivityTypeChart({ data }: ActivityTypeChartProps) {
  const chartData = data.map(item => ({
    name: item.type,
    value: item.count,
    percentage: item.percentage.toFixed(1),
  }));

  return (
    <div className="rounded-xl bg-white p-4 shadow-sm dark:bg-gray-800 sm:p-6">
      <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
        Дасгалын төрлүүд
      </h3>
      
      <div className="h-64 sm:h-72">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="42%"
              innerRadius={45}
              outerRadius={70}
              paddingAngle={5}
              dataKey="value"
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip
              formatter={(value, name) => [value, name]}
              contentStyle={{
                backgroundColor: '#1F2937',
                border: 'none',
                borderRadius: '8px',
                color: '#fff',
              }}
            />
            <Legend 
              verticalAlign="bottom"
              iconSize={10}
              wrapperStyle={{ fontSize: '12px', paddingTop: '8px' }}
              formatter={(value) => <span className="text-gray-700 dark:text-gray-300">{value}</span>}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
