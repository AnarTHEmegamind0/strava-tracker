'use client';

import { DBActivity } from '@/types';
import ActivityCard from './ActivityCard';

interface ActivityListProps {
  activities: DBActivity[];
  loading: boolean;
  onRefresh: () => void;
}

export default function ActivityList({ activities, loading, onRefresh }: ActivityListProps) {
  // Calculate stats
  const totalDistance = activities.reduce((sum, a) => sum + a.distance, 0) / 1000;
  const totalTime = activities.reduce((sum, a) => sum + a.moving_time, 0);
  const totalElevation = activities.reduce((sum, a) => sum + a.elevation_gain, 0);
  const totalActivities = activities.length;

  const formatHours = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };

  return (
    <div className="space-y-6">
      {/* Stats Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-orange-500 to-red-500 rounded-xl p-4 text-white">
          <p className="text-sm opacity-80">Total Distance</p>
          <p className="text-2xl font-bold">{totalDistance.toFixed(1)} km</p>
        </div>
        <div className="bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl p-4 text-white">
          <p className="text-sm opacity-80">Total Time</p>
          <p className="text-2xl font-bold">{formatHours(totalTime)}</p>
        </div>
        <div className="bg-gradient-to-br from-green-500 to-teal-500 rounded-xl p-4 text-white">
          <p className="text-sm opacity-80">Total Elevation</p>
          <p className="text-2xl font-bold">{Math.round(totalElevation)}m</p>
        </div>
        <div className="bg-gradient-to-br from-pink-500 to-rose-500 rounded-xl p-4 text-white">
          <p className="text-sm opacity-80">Activities</p>
          <p className="text-2xl font-bold">{totalActivities}</p>
        </div>
      </div>

      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">
          Recent Activities
        </h2>
        <button
          onClick={onRefresh}
          disabled={loading}
          className="flex items-center gap-2 text-sm text-[#FC4C02] hover:text-[#e34402] disabled:opacity-50"
        >
          <svg
            className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
          </svg>
          {loading ? 'Syncing...' : 'Sync from Strava'}
        </button>
      </div>

      {/* Activity List */}
      {activities.length === 0 ? (
        <div className="text-center py-12 text-gray-500 dark:text-gray-400">
          <p>No activities yet.</p>
          <p className="text-sm mt-2">Click &quot;Sync from Strava&quot; to load your activities.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {activities.map((activity) => (
            <ActivityCard key={activity.strava_id} activity={activity} />
          ))}
        </div>
      )}
    </div>
  );
}
