'use client';

import { DBActivity } from '@/types';
import Link from 'next/link';

interface RecentActivitiesProps {
  activities: DBActivity[];
}

function getActivityIcon(type: string): string {
  const icons: Record<string, string> = {
    Run: '🏃',
    Ride: '🚴',
    Swim: '🏊',
    Walk: '🚶',
    Hike: '🥾',
    Workout: '💪',
    WeightTraining: '🏋️',
    Yoga: '🧘',
    default: '🏅',
  };
  return icons[type] || icons.default;
}

function getActivityTypeName(type: string): string {
  const names: Record<string, string> = {
    Run: 'Гүйлт',
    Ride: 'Дугуй',
    Swim: 'Усанд сэлэлт',
    Walk: 'Алхалт',
    Hike: 'Уулын аялал',
    Workout: 'Дасгал',
    WeightTraining: 'Хүндийн дасгал',
    Yoga: 'Йог',
  };
  return names[type] || type;
}

export default function RecentActivities({ activities }: RecentActivitiesProps) {
  const recentActivities = activities.slice(0, 5);

  const formatDistance = (meters: number) => {
    return `${(meters / 1000).toFixed(2)} км`;
  };

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return hours > 0 ? `${hours}ц ${minutes}м` : `${minutes}м`;
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Өнөөдөр';
    if (diffDays === 1) return 'Өчигдөр';
    if (diffDays < 7) return `${diffDays} өдрийн өмнө`;
    return date.toLocaleDateString('mn-MN', { month: 'short', day: 'numeric' });
  };

  if (recentActivities.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Сүүлийн дасгалууд
        </h3>
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          <p>Дасгал байхгүй байна.</p>
          <p className="text-sm mt-2">Strava-с синк хийж дасгалуудаа татна уу.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Сүүлийн дасгалууд
        </h3>
        <Link
          href="/training"
          className="text-sm text-[#FC4C02] hover:text-[#e34402] font-medium"
        >
          Бүгдийг харах
        </Link>
      </div>
      
      <div className="space-y-3">
        {recentActivities.map((activity) => (
          <Link
            key={activity.strava_id}
            href={`/activity/${activity.strava_id}`}
            className="flex items-center gap-4 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors cursor-pointer"
          >
            <span className="text-2xl">{getActivityIcon(activity.type)}</span>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-gray-900 dark:text-white truncate">
                {activity.name}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {formatDate(activity.start_date)} • {getActivityTypeName(activity.type)}
              </p>
            </div>
            <div className="text-right">
              <p className="font-semibold text-gray-900 dark:text-white">
                {formatDistance(activity.distance)}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {formatDuration(activity.moving_time)}
              </p>
            </div>
            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        ))}
      </div>
    </div>
  );
}
