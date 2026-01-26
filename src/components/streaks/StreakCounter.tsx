'use client';

import { useState, useEffect } from 'react';

interface StreakData {
  daily: {
    current: number;
    best: number;
    lastActivityDate: string | null;
    isAtRisk: boolean;
  };
  weekly: {
    current: number;
    best: number;
    lastActivityDate: string | null;
  };
}

interface StreakCounterProps {
  userId?: number;
  compact?: boolean;
}

export default function StreakCounter({ userId = 1, compact = false }: StreakCounterProps) {
  const [streakData, setStreakData] = useState<StreakData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStreaks() {
      try {
        const res = await fetch(`/api/streaks?user_id=${userId}`);
        if (res.ok) {
          const data = await res.json();
          setStreakData(data.streaks);
        }
      } catch (error) {
        console.error('Error fetching streaks:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchStreaks();
  }, [userId]);

  if (loading) {
    return (
      <div className={`animate-pulse ${compact ? 'h-10' : 'h-32'} bg-gray-100 dark:bg-gray-700 rounded-lg`} />
    );
  }

  if (!streakData) {
    return null;
  }

  const { daily, weekly } = streakData;

  // Compact mode for header/sidebar
  if (compact) {
    return (
      <div className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 rounded-lg">
        <div className="relative">
          <span className="text-2xl">🔥</span>
          {daily.isAtRisk && (
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-400 rounded-full animate-pulse" />
          )}
        </div>
        <div>
          <span className="font-bold text-lg text-gray-900 dark:text-white">{daily.current}</span>
          <span className="text-sm text-gray-600 dark:text-gray-400 ml-1">хоног</span>
        </div>
      </div>
    );
  }

  // Full mode for dashboard
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Streak
        </h3>
        {daily.isAtRisk && (
          <span className="px-2 py-1 text-xs font-medium text-yellow-700 dark:text-yellow-300 bg-yellow-100 dark:bg-yellow-900/30 rounded-full animate-pulse">
            Эрсдэлд!
          </span>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* Daily Streak */}
        <div className="text-center p-4 bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 rounded-xl">
          <div className="relative inline-block">
            <span className="text-4xl">🔥</span>
            {daily.isAtRisk && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-yellow-400 rounded-full animate-pulse flex items-center justify-center">
                <span className="text-[10px]">!</span>
              </span>
            )}
          </div>
          <div className="mt-2">
            <div className="text-3xl font-bold text-gray-900 dark:text-white">
              {daily.current}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Өдрийн streak
            </div>
          </div>
          <div className="mt-2 text-xs text-gray-500 dark:text-gray-500">
            Хамгийн сайн: {daily.best} хоног
          </div>
        </div>

        {/* Weekly Streak */}
        <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl">
          <span className="text-4xl">📅</span>
          <div className="mt-2">
            <div className="text-3xl font-bold text-gray-900 dark:text-white">
              {weekly.current}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Долоо хоногийн streak
            </div>
          </div>
          <div className="mt-2 text-xs text-gray-500 dark:text-gray-500">
            Хамгийн сайн: {weekly.best} долоо хоног
          </div>
        </div>
      </div>

      {/* Motivational message */}
      {daily.isAtRisk && daily.current > 0 && (
        <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
          <p className="text-sm text-yellow-800 dark:text-yellow-200">
            <span className="font-semibold">Анхааруулга:</span> Өнөөдөр дасгал хийгээгүй байна. 
            Streak-ээ хадгалахын тулд дор хаяж нэг дасгал хийгээрэй!
          </p>
        </div>
      )}

      {daily.current >= 7 && !daily.isAtRisk && (
        <div className="mt-4 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
          <p className="text-sm text-green-800 dark:text-green-200">
            <span className="font-semibold">Гайхалтай!</span> {daily.current} хоногийн streak 
            үргэлжилж байна. Танд хүч байна! 💪
          </p>
        </div>
      )}
    </div>
  );
}
