'use client';

import { DBActivity } from '@/types';
import StatCard from '@/components/dashboard/StatCard';

interface QuickStatsProps {
  activities: DBActivity[];
  period: 'week' | 'month';
}

export default function QuickStats({ activities, period }: QuickStatsProps) {
  // Filter activities by period
  const now = new Date();
  const periodStart = new Date();
  
  if (period === 'week') {
    const day = now.getDay();
    const diff = day === 0 ? 6 : day - 1; // Monday as start
    periodStart.setDate(now.getDate() - diff);
  } else {
    periodStart.setDate(1);
  }
  periodStart.setHours(0, 0, 0, 0);

  const filteredActivities = activities.filter(a => {
    const date = new Date(a.start_date);
    return date >= periodStart;
  });

  const totalDistance = filteredActivities.reduce((sum, a) => sum + a.distance, 0) / 1000;
  const totalTime = filteredActivities.reduce((sum, a) => sum + a.moving_time, 0);
  const totalElevation = filteredActivities.reduce((sum, a) => sum + a.elevation_gain, 0);
  const activityCount = filteredActivities.length;
  
  // Calculate average pace for runs
  const runActivities = filteredActivities.filter(a => a.type === 'Run');
  const avgPace = runActivities.length > 0 
    ? runActivities.reduce((sum, a) => sum + a.moving_time, 0) / 
      (runActivities.reduce((sum, a) => sum + a.distance, 0) / 1000)
    : 0;

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) {
      return `${hours}ц ${minutes}м`;
    }
    return `${minutes}м`;
  };

  const formatPace = (secondsPerKm: number) => {
    if (secondsPerKm === 0) return '-';
    const minutes = Math.floor(secondsPerKm / 60);
    const seconds = Math.round(secondsPerKm % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const stats = [
    {
      label: 'Нийт зай',
      value: totalDistance.toFixed(1),
      unit: 'км',
      tone: 'orange' as const,
      icon: (
        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M13 5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zm-3 14l2-5 2 1 1 4m-6 0l2-6-2-2 2-3 4 2 2 3" />
        </svg>
      ),
    },
    {
      label: 'Хугацаа',
      value: formatTime(totalTime),
      unit: '',
      tone: 'blue' as const,
      icon: (
        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <circle cx="12" cy="13" r="7" strokeWidth={1.8} />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 13V9m0-6v3m-2 0h4" />
        </svg>
      ),
    },
    {
      label: 'Өндөрлөг',
      value: Math.round(totalElevation).toLocaleString(),
      unit: 'м',
      tone: 'green' as const,
      icon: (
        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M3 19l6-8 4 5 3-4 5 7H3z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M14 7l1.5-2L17 7" />
        </svg>
      ),
    },
    {
      label: 'Дасгал',
      value: activityCount.toString(),
      unit: 'удаа',
      tone: 'violet' as const,
      icon: (
        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M4 19h16M7 17V9m5 8V5m5 12v-6" />
        </svg>
      ),
    },
    ...(period === 'week'
      ? [
          {
            label: 'Дундаж pace',
            value: formatPace(avgPace),
            unit: '/км',
            tone: 'blue' as const,
            icon: (
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M4 14a8 8 0 1116 0" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 14l4-3" />
              </svg>
            ),
          },
        ]
      : []),
  ];

  return (
    <div className="grid grid-cols-2 gap-3 md:gap-4 xl:grid-cols-5">
      {stats.map((stat) => (
        <StatCard
          key={stat.label}
          label={stat.label}
          value={stat.value}
          unit={stat.unit}
          icon={stat.icon}
          tone={stat.tone}
        />
      ))}
    </div>
  );
}
