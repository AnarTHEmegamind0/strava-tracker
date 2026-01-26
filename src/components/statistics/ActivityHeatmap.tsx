'use client';

import { useMemo, useState } from 'react';
import { DBActivity } from '@/types';
import { format, subDays, startOfWeek, eachDayOfInterval, getDay, subYears } from 'date-fns';

interface ActivityHeatmapProps {
  activities: DBActivity[];
}

// GitHub-style color scale (Strava orange theme)
function getColorForValue(value: number, maxValue: number): string {
  if (value === 0) return 'bg-gray-100 dark:bg-gray-800';
  const intensity = value / maxValue;
  if (intensity < 0.25) return 'bg-orange-200 dark:bg-orange-900/40';
  if (intensity < 0.5) return 'bg-orange-300 dark:bg-orange-700/60';
  if (intensity < 0.75) return 'bg-orange-400 dark:bg-orange-600/80';
  return 'bg-[#FC4C02] dark:bg-[#FC4C02]';
}

export default function ActivityHeatmap({ activities }: ActivityHeatmapProps) {
  const [tooltip, setTooltip] = useState<{ date: string; value: number; count: number; x: number; y: number } | null>(null);

  // Calculate heatmap data for last 365 days
  const { heatmapData, maxValue, weeks, totalDistance, totalActivities } = useMemo(() => {
    const today = new Date();
    const oneYearAgo = subYears(today, 1);
    
    // Start from the beginning of the week one year ago
    const startDate = startOfWeek(oneYearAgo, { weekStartsOn: 0 });
    
    // Create a map of date -> total distance
    const activityMap = new Map<string, { distance: number; count: number }>();
    
    activities.forEach(activity => {
      const dateKey = format(new Date(activity.start_date), 'yyyy-MM-dd');
      const existing = activityMap.get(dateKey) || { distance: 0, count: 0 };
      activityMap.set(dateKey, {
        distance: existing.distance + activity.distance,
        count: existing.count + 1,
      });
    });

    // Generate all days
    const days = eachDayOfInterval({ start: startDate, end: today });
    
    // Group by weeks
    const weekData: { date: Date; distance: number; count: number }[][] = [];
    let currentWeek: { date: Date; distance: number; count: number }[] = [];
    
    days.forEach((day) => {
      const dateKey = format(day, 'yyyy-MM-dd');
      const data = activityMap.get(dateKey) || { distance: 0, count: 0 };
      
      currentWeek.push({ date: day, distance: data.distance, count: data.count });
      
      if (getDay(day) === 6) { // Saturday is end of week
        weekData.push(currentWeek);
        currentWeek = [];
      }
    });
    
    // Add remaining days
    if (currentWeek.length > 0) {
      weekData.push(currentWeek);
    }

    // Find max value for color scaling
    const allDistances = Array.from(activityMap.values()).map(v => v.distance);
    const max = Math.max(...allDistances, 1);

    // Calculate totals
    let total = 0;
    let count = 0;
    activityMap.forEach(v => {
      total += v.distance;
      count += v.count;
    });

    return {
      heatmapData: activityMap,
      maxValue: max,
      weeks: weekData,
      totalDistance: total / 1000,
      totalActivities: count,
    };
  }, [activities]);

  const months = useMemo(() => {
    const result: { name: string; week: number }[] = [];
    let lastMonth = -1;
    
    weeks.forEach((week, weekIndex) => {
      if (week.length > 0) {
        const month = week[0].date.getMonth();
        if (month !== lastMonth) {
          result.push({
            name: format(week[0].date, 'MMM'),
            week: weekIndex,
          });
          lastMonth = month;
        }
      }
    });
    
    return result;
  }, [weeks]);

  const dayLabels = ['Ня', 'Да', 'Мя', 'Лх', 'Пү', 'Ба', 'Бя'];

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Дасгалын хуваарь
        </h3>
        <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
          <span>{totalActivities} дасгал</span>
          <span>Нийт {totalDistance.toFixed(0)} км</span>
        </div>
      </div>

      {/* Month Labels */}
      <div className="flex mb-1 ml-8">
        {months.map((month, i) => (
          <div
            key={i}
            className="text-xs text-gray-400 dark:text-gray-500"
            style={{ marginLeft: i === 0 ? `${month.week * 12}px` : `${(month.week - months[i - 1].week - 1) * 12}px` }}
          >
            {month.name}
          </div>
        ))}
      </div>

      {/* Heatmap Grid */}
      <div className="flex">
        {/* Day Labels */}
        <div className="flex flex-col gap-[2px] mr-2 text-xs text-gray-400 dark:text-gray-500">
          {dayLabels.map((day, i) => (
            <div key={day} className="h-[10px] leading-[10px]" style={{ visibility: i % 2 === 1 ? 'visible' : 'hidden' }}>
              {day}
            </div>
          ))}
        </div>

        {/* Grid */}
        <div className="flex gap-[2px] overflow-x-auto">
          {weeks.map((week, weekIndex) => (
            <div key={weekIndex} className="flex flex-col gap-[2px]">
              {/* Fill empty days at start of first week */}
              {weekIndex === 0 && week.length < 7 && (
                Array(7 - week.length).fill(null).map((_, i) => (
                  <div key={`empty-${i}`} className="w-[10px] h-[10px]" />
                ))
              )}
              {week.map((day, dayIndex) => {
                const dateKey = format(day.date, 'yyyy-MM-dd');
                const colorClass = getColorForValue(day.distance, maxValue);
                
                return (
                  <div
                    key={dateKey}
                    className={`w-[10px] h-[10px] rounded-sm ${colorClass} cursor-pointer transition-transform hover:scale-125 hover:ring-1 hover:ring-gray-400`}
                    onMouseEnter={(e) => {
                      const rect = e.currentTarget.getBoundingClientRect();
                      setTooltip({
                        date: format(day.date, 'MMM d, yyyy'),
                        value: day.distance / 1000,
                        count: day.count,
                        x: rect.left + rect.width / 2,
                        y: rect.top,
                      });
                    }}
                    onMouseLeave={() => setTooltip(null)}
                  />
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center justify-end gap-2 mt-4">
        <span className="text-xs text-gray-400 dark:text-gray-500">Бага</span>
        <div className="flex gap-[2px]">
          <div className="w-[10px] h-[10px] rounded-sm bg-gray-100 dark:bg-gray-800" />
          <div className="w-[10px] h-[10px] rounded-sm bg-orange-200 dark:bg-orange-900/40" />
          <div className="w-[10px] h-[10px] rounded-sm bg-orange-300 dark:bg-orange-700/60" />
          <div className="w-[10px] h-[10px] rounded-sm bg-orange-400 dark:bg-orange-600/80" />
          <div className="w-[10px] h-[10px] rounded-sm bg-[#FC4C02]" />
        </div>
        <span className="text-xs text-gray-400 dark:text-gray-500">Их</span>
      </div>

      {/* Tooltip */}
      {tooltip && (
        <div
          className="fixed z-50 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg shadow-lg pointer-events-none"
          style={{
            left: tooltip.x,
            top: tooltip.y - 40,
            transform: 'translateX(-50%)',
          }}
        >
          <div className="font-semibold">{tooltip.date}</div>
          {tooltip.count > 0 ? (
            <div>{tooltip.value.toFixed(1)} км • {tooltip.count} дасгал</div>
          ) : (
            <div>Дасгал байхгүй</div>
          )}
        </div>
      )}
    </div>
  );
}
