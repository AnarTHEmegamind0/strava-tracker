'use client';

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { DBActivity } from '@/types';
import { startOfWeek, format, eachDayOfInterval } from 'date-fns';
import { mn } from 'date-fns/locale';

interface WeeklyOverviewProps {
  activities: DBActivity[];
}

export default function WeeklyOverview({ activities }: WeeklyOverviewProps) {
  // Get this week's data
  const today = new Date();
  const weekStart = startOfWeek(today, { weekStartsOn: 1 });
  
  // Generate all days of the week
  const days = eachDayOfInterval({
    start: weekStart,
    end: today,
  });

  // Calculate distance per day
  const data = days.map(day => {
    const dayStart = new Date(day);
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(day);
    dayEnd.setHours(23, 59, 59, 999);

    const dayActivities = activities.filter(a => {
      const date = new Date(a.start_date);
      return date >= dayStart && date <= dayEnd;
    });

    const distance = dayActivities.reduce((sum, a) => sum + a.distance, 0) / 1000;

    return {
      day: format(day, 'EEE', { locale: mn }),
      distance: Number(distance.toFixed(1)),
    };
  });

  // Mongolian day abbreviations
  const daysOfWeek = ['Да', 'Мя', 'Лх', 'Пү', 'Ба', 'Бя', 'Ня'];
  const dayMapping: Record<string, string> = {
    'Mon': 'Да', 'Tue': 'Мя', 'Wed': 'Лх', 'Thu': 'Пү', 
    'Fri': 'Ба', 'Sat': 'Бя', 'Sun': 'Ня',
    'да': 'Да', 'мя': 'Мя', 'лх': 'Лх', 'пү': 'Пү',
    'ба': 'Ба', 'бя': 'Бя', 'ня': 'Ня'
  };

  const fullWeekData = daysOfWeek.map((day, index) => {
    const existing = data.find(d => {
      const mappedDay = dayMapping[d.day] || d.day;
      return mappedDay === day;
    });
    return existing ? { ...existing, day } : { day, distance: 0 };
  });

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        Энэ долоо хоног
      </h3>
      
      <div className="h-48">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={fullWeekData}>
            <XAxis 
              dataKey="day" 
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
            <Bar 
              dataKey="distance" 
              fill="#FC4C02" 
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
