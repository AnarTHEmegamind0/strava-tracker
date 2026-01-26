'use client';

import { DBActivity } from '@/types';

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

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return hours > 0 ? `${hours}ц ${minutes}м` : `${minutes}м`;
  };

  const stats = [
    {
      label: 'Зай',
      value: `${totalDistance.toFixed(1)} км`,
      icon: '🏃',
      gradient: 'from-orange-500 to-red-500',
    },
    {
      label: 'Хугацаа',
      value: formatTime(totalTime),
      icon: '⏱️',
      gradient: 'from-blue-500 to-purple-500',
    },
    {
      label: 'Өндөрлөг',
      value: `${Math.round(totalElevation)} м`,
      icon: '⛰️',
      gradient: 'from-green-500 to-teal-500',
    },
    {
      label: 'Дасгал',
      value: String(activityCount),
      icon: '📊',
      gradient: 'from-pink-500 to-rose-500',
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className={`bg-gradient-to-br ${stat.gradient} rounded-xl p-4 text-white shadow-lg`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-2xl">{stat.icon}</span>
          </div>
          <p className="text-2xl font-bold">{stat.value}</p>
          <p className="text-sm opacity-80">{stat.label}</p>
        </div>
      ))}
    </div>
  );
}
