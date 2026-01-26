'use client';

import Link from 'next/link';
import { DBActivity } from '@/types';

interface ActivityCardProps {
  activity: DBActivity;
}

function formatDistance(meters: number): string {
  const km = meters / 1000;
  return `${km.toFixed(2)} км`;
}

function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  
  if (hours > 0) {
    return `${hours}ц ${minutes}м`;
  }
  return `${minutes}м ${secs}с`;
}

function formatPace(distance: number, time: number): string {
  if (distance === 0) return '-';
  const minPerKm = (time / 60) / (distance / 1000);
  const minutes = Math.floor(minPerKm);
  const seconds = Math.round((minPerKm - minutes) * 60);
  return `${minutes}:${seconds.toString().padStart(2, '0')} /км`;
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

export default function ActivityCard({ activity }: ActivityCardProps) {
  const date = new Date(activity.start_date);
  const formattedDate = date.toLocaleDateString('mn-MN', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
  const formattedTime = date.toLocaleTimeString('mn-MN', {
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <Link href={`/activity/${activity.strava_id}`}>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 hover:shadow-md hover:border-[#FC4C02] dark:hover:border-[#FC4C02] transition-all cursor-pointer">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl">{getActivityIcon(activity.type)}</span>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white">
                {activity.name}
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {formattedDate} at {formattedTime}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-2 py-1 rounded">
              {getActivityTypeName(activity.type)}
            </span>
            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </div>
        
        <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400 uppercase">Зай</p>
            <p className="text-lg font-semibold text-gray-900 dark:text-white">
              {formatDistance(activity.distance)}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400 uppercase">Хугацаа</p>
            <p className="text-lg font-semibold text-gray-900 dark:text-white">
              {formatDuration(activity.moving_time)}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400 uppercase">Хурд</p>
            <p className="text-lg font-semibold text-gray-900 dark:text-white">
              {formatPace(activity.distance, activity.moving_time)}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400 uppercase">Өндөрлөг</p>
            <p className="text-lg font-semibold text-gray-900 dark:text-white">
              {Math.round(activity.elevation_gain)}м
            </p>
          </div>
        </div>
      </div>
    </Link>
  );
}
