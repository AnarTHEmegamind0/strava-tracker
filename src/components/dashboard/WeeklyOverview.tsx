'use client';

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { DBActivity } from '@/types';
import { startOfWeek, format, eachDayOfInterval } from 'date-fns';
import { mn } from 'date-fns/locale';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

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

  const fullWeekData = daysOfWeek.map((day) => {
    const existing = data.find(d => {
      const mappedDay = dayMapping[d.day] || d.day;
      return mappedDay === day;
    });
    return existing ? { ...existing, day } : { day, distance: 0 };
  });

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle>Энэ долоо хоног</CardTitle>
      </CardHeader>
      <CardContent className="h-56">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={fullWeekData}>
            <XAxis
              dataKey="day"
              axisLine={false}
              tickLine={false}
              tick={{ fill: 'var(--muted-foreground)', fontSize: 12 }}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: 'var(--muted-foreground)', fontSize: 12 }}
              tickFormatter={(value) => `${value}км`}
            />
            <Tooltip
              formatter={(value) => [`${value} км`, 'Зай']}
              contentStyle={{
                backgroundColor: 'var(--card)',
                border: '1px solid var(--border)',
                borderRadius: '10px',
                color: 'var(--foreground)',
                boxShadow: '0 10px 28px rgba(2, 6, 23, 0.12)',
              }}
            />
            <Bar dataKey="distance" fill="var(--primary)" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
