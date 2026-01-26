'use client';

import { useState, useEffect } from 'react';
import { AthleteStats } from '@/types';

function formatDistance(meters: number): string {
  const km = meters / 1000;
  if (km >= 1000) {
    return `${(km / 1000).toFixed(1)}k км`;
  }
  return `${km.toFixed(0)} км`;
}

function formatTime(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  if (hours >= 100) {
    return `${hours}ц`;
  }
  const minutes = Math.floor((seconds % 3600) / 60);
  return `${hours}ц ${minutes}м`;
}

export default function StravaStats() {
  const [stats, setStats] = useState<AthleteStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'run' | 'ride' | 'swim'>('run');

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch('/api/athlete/stats');
        if (response.ok) {
          const data = await response.json();
          setStats(data.stats);
        }
      } catch (error) {
        console.error('Failed to fetch Strava stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Strava Статистик</h3>
        <div className="flex items-center justify-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#FC4C02]"></div>
        </div>
      </div>
    );
  }

  if (!stats) {
    return null;
  }

  const getTabData = () => {
    switch (activeTab) {
      case 'run':
        return {
          recent: stats.recent_run_totals,
          ytd: stats.ytd_run_totals,
          all: stats.all_run_totals,
          icon: '🏃',
          name: 'Гүйлт',
        };
      case 'ride':
        return {
          recent: stats.recent_ride_totals,
          ytd: stats.ytd_ride_totals,
          all: stats.all_ride_totals,
          icon: '🚴',
          name: 'Дугуй',
        };
      case 'swim':
        return {
          recent: stats.recent_swim_totals,
          ytd: stats.ytd_swim_totals,
          all: stats.all_swim_totals,
          icon: '🏊',
          name: 'Усанд сэлэлт',
        };
    }
  };

  const tabData = getTabData();

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
          <svg className="w-5 h-5 text-[#FC4C02]" viewBox="0 0 24 24" fill="currentColor">
            <path d="M15.387 17.944l-2.089-4.116h-3.065L15.387 24l5.15-10.172h-3.066m-7.008-5.599l2.836 5.598h4.172L10.463 0l-7 13.828h4.169" />
          </svg>
          Strava Статистик
        </h3>
        
        {/* Activity Type Tabs */}
        <div className="flex gap-1 bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
          {(['run', 'ride', 'swim'] as const).map((type) => (
            <button
              key={type}
              onClick={() => setActiveTab(type)}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                activeTab === type
                  ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              {type === 'run' ? '🏃' : type === 'ride' ? '🚴' : '🏊'}
            </button>
          ))}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="space-y-4">
        {/* Recent (4 weeks) */}
        <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Сүүлийн 4 долоо хоног</span>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {tabData.recent.count}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Дасгал</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {formatDistance(tabData.recent.distance)}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Зай</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {formatTime(tabData.recent.moving_time)}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Хугацаа</p>
            </div>
          </div>
        </div>

        {/* YTD (Year to Date) */}
        <div className="p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-sm font-medium text-orange-600 dark:text-orange-400">
              {new Date().getFullYear()} он (YTD)
            </span>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {tabData.ytd.count}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Дасгал</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {formatDistance(tabData.ytd.distance)}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Зай</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {formatTime(tabData.ytd.moving_time)}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Хугацаа</p>
            </div>
          </div>
        </div>

        {/* All Time */}
        <div className="p-4 bg-gradient-to-br from-[#FC4C02]/10 to-red-500/10 dark:from-[#FC4C02]/20 dark:to-red-500/20 rounded-lg border border-[#FC4C02]/20">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-sm font-medium text-[#FC4C02]">Нийт бүх цаг</span>
            <span className="text-lg">{tabData.icon}</span>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {tabData.all.count}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Дасгал</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {formatDistance(tabData.all.distance)}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Зай</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {formatTime(tabData.all.moving_time)}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Хугацаа</p>
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-[#FC4C02]/20">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500 dark:text-gray-400">Нийт өндөрлөг</span>
              <span className="font-semibold text-gray-900 dark:text-white">
                {Math.round(tabData.all.elevation_gain).toLocaleString()} м
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Biggest achievements */}
      {(stats.biggest_ride_distance > 0 || stats.biggest_climb_elevation_gain > 0) && (
        <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
          <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3">Рекордууд</h4>
          <div className="flex gap-4">
            {stats.biggest_ride_distance > 0 && (
              <div className="flex items-center gap-3 px-4 py-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <span className="text-2xl">🚴</span>
                <div>
                  <p className="text-lg font-bold text-gray-900 dark:text-white">
                    {(stats.biggest_ride_distance / 1000).toFixed(1)} км
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Хамгийн урт унах</p>
                </div>
              </div>
            )}
            {stats.biggest_climb_elevation_gain > 0 && (
              <div className="flex items-center gap-3 px-4 py-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <span className="text-2xl">⛰️</span>
                <div>
                  <p className="text-lg font-bold text-gray-900 dark:text-white">
                    {Math.round(stats.biggest_climb_elevation_gain)} м
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Хамгийн их өндөрлөг</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
