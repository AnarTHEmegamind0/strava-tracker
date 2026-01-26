'use client';

import { useMemo } from 'react';
import { DBActivity } from '@/types';
import { classifyWorkout, getWorkoutTypeInfo, WorkoutType } from '@/lib/workout-utils';

interface WorkoutBreakdownProps {
  activities: DBActivity[];
}

export default function WorkoutBreakdown({ activities }: WorkoutBreakdownProps) {
  const breakdown = useMemo(() => {
    if (activities.length === 0) return [];

    // Only classify Run and Ride activities (activities that have pace/speed)
    const classifiableActivities = activities.filter(a => 
      a.type === 'Run' || a.type === 'Ride' || a.type === 'Swim'
    );

    if (classifiableActivities.length === 0) return [];

    // Classify each workout
    const classifications: Record<WorkoutType, DBActivity[]> = {
      recovery: [],
      easy: [],
      long: [],
      tempo: [],
      interval: [],
      race: [],
    };

    classifiableActivities.forEach(activity => {
      const type = classifyWorkout(activity, activities);
      classifications[type].push(activity);
    });

    // Convert to array with stats
    return Object.entries(classifications)
      .map(([type, acts]) => ({
        type: type as WorkoutType,
        count: acts.length,
        totalDistance: acts.reduce((sum, a) => sum + a.distance, 0) / 1000,
        totalTime: acts.reduce((sum, a) => sum + a.moving_time, 0),
        percentage: classifiableActivities.length > 0 
          ? (acts.length / classifiableActivities.length) * 100 
          : 0,
        info: getWorkoutTypeInfo(type as WorkoutType),
      }))
      .filter(item => item.count > 0)
      .sort((a, b) => b.count - a.count);
  }, [activities]);

  // Calculate 80/20 distribution
  const distribution = useMemo(() => {
    if (breakdown.length === 0) return null;

    const easyTypes = ['recovery', 'easy', 'long'];
    const hardTypes = ['tempo', 'interval', 'race'];

    const easyCount = breakdown
      .filter(b => easyTypes.includes(b.type))
      .reduce((sum, b) => sum + b.count, 0);
    const hardCount = breakdown
      .filter(b => hardTypes.includes(b.type))
      .reduce((sum, b) => sum + b.count, 0);
    const total = easyCount + hardCount;

    if (total === 0) return null;

    const easyPercent = Math.round((easyCount / total) * 100);
    const hardPercent = Math.round((hardCount / total) * 100);

    return { easyPercent, hardPercent, easyCount, hardCount };
  }, [breakdown]);

  if (activities.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Дасгалын төрлийн задаргаа
        </h3>
        <p className="text-gray-500 dark:text-gray-400 text-center py-8">
          Энэ хугацаанд дасгал байхгүй байна
        </p>
      </div>
    );
  }

  if (breakdown.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Дасгалын төрлийн задаргаа
        </h3>
        <p className="text-gray-500 dark:text-gray-400 text-center py-8">
          Ангилах боломжтой дасгал (гүйлт, дугуй) байхгүй байна
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Дасгалын төрлийн задаргаа
        </h3>
        <span className="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
          AI ангилал
        </span>
      </div>

      {/* 80/20 Rule Analysis */}
      {distribution && (
        <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              80/20 Дүрэм
            </span>
            <span className={`text-xs px-2 py-1 rounded-full ${
              distribution.easyPercent >= 75 && distribution.easyPercent <= 85
                ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                : 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400'
            }`}>
              {distribution.easyPercent >= 75 && distribution.easyPercent <= 85 
                ? 'Тэнцвэртэй' 
                : 'Тохируулах шаардлагатай'}
            </span>
          </div>
          
          <div className="flex gap-2 h-3 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-600">
            <div 
              className="bg-green-500 transition-all duration-500"
              style={{ width: `${distribution.easyPercent}%` }}
            />
            <div 
              className="bg-orange-500 transition-all duration-500"
              style={{ width: `${distribution.hardPercent}%` }}
            />
          </div>
          
          <div className="flex justify-between mt-2 text-xs text-gray-600 dark:text-gray-400">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 bg-green-500 rounded-full" />
              Хөнгөн: {distribution.easyPercent}% ({distribution.easyCount})
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 bg-orange-500 rounded-full" />
              Хүнд: {distribution.hardPercent}% ({distribution.hardCount})
            </span>
          </div>
          
          <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
            Зөвлөмж: Нийт дасгалын 80% хөнгөн, 20% хүнд байх нь хамгийн үр дүнтэй.
          </p>
        </div>
      )}

      {/* Workout Type List */}
      <div className="space-y-3">
        {breakdown.map(item => (
          <div key={item.type} className="flex items-center gap-3">
            <div className={`w-3 h-3 rounded-full ${item.info.color}`} />
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  {item.info.nameMn}
                </span>
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {item.count} дасгал
                </span>
              </div>
              <div className="flex items-center justify-between mt-1">
                <div className="flex-1 h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden mr-3">
                  <div 
                    className={`h-full ${item.info.color} transition-all duration-500`}
                    style={{ width: `${item.percentage}%` }}
                  />
                </div>
                <span className="text-xs text-gray-500 dark:text-gray-400 w-10 text-right">
                  {Math.round(item.percentage)}%
                </span>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {item.totalDistance.toFixed(1)} км • {Math.floor(item.totalTime / 60)} мин
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Төрлийн тайлбар:</p>
        <div className="grid grid-cols-2 gap-2">
          {[
            { type: 'recovery' as WorkoutType, desc: 'Маш хөнгөн хурд' },
            { type: 'easy' as WorkoutType, desc: 'Суурь бэлтгэл' },
            { type: 'long' as WorkoutType, desc: 'Урт зайн гүйлт' },
            { type: 'tempo' as WorkoutType, desc: 'Босго хурд' },
            { type: 'interval' as WorkoutType, desc: 'Хурдны дасгал' },
            { type: 'race' as WorkoutType, desc: 'Уралдааны хурд' },
          ].map(({ type, desc }) => {
            const info = getWorkoutTypeInfo(type);
            return (
              <div key={type} className="flex items-center gap-2 text-xs">
                <span className={`w-2 h-2 rounded-full ${info.color}`} />
                <span className="text-gray-600 dark:text-gray-400">
                  {info.nameMn}: {desc}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
