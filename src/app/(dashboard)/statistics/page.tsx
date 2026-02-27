'use client';

import { useState, useEffect, useMemo } from 'react';
import { useApp } from '@/lib/context';
import DashboardHeader from '@/components/layout/DashboardHeader';
import DistanceChart from '@/components/statistics/DistanceChart';
import ActivityTypeChart from '@/components/statistics/ActivityTypeChart';
import PersonalRecords from '@/components/statistics/PersonalRecords';
import WeekComparison from '@/components/statistics/WeekComparison';
import ActivityHeatmap from '@/components/statistics/ActivityHeatmap';
import PaceZones from '@/components/statistics/PaceZones';
import StravaStats from '@/components/statistics/StravaStats';
import TrainingLoad from '@/components/statistics/TrainingLoad';
import WorkoutBreakdown from '@/components/statistics/WorkoutBreakdown';
import { WeeklyStats, ActivityTypeBreakdown, PersonalRecord } from '@/types';

interface StatsData {
  weeklyStats: WeeklyStats;
  monthlyStats: {
    month: string;
    total_distance: number;
    total_time: number;
    total_elevation: number;
    activity_count: number;
  };
  weeklyHistory: WeeklyStats[];
  activityBreakdown: ActivityTypeBreakdown[];
  personalRecords: PersonalRecord[];
  weekComparison: {
    thisWeek: WeeklyStats;
    lastWeek: WeeklyStats;
    changes: {
      distance: number;
      time: number;
      elevation: number;
      count: number;
    };
  };
}

type PeriodType = 'week' | 'month' | 'year' | 'custom';

function getDateRange(period: PeriodType, customStart?: string, customEnd?: string): { start: Date; end: Date } {
  const now = new Date();
  const end = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);
  
  switch (period) {
    case 'week': {
      const start = new Date(end);
      const day = start.getDay();
      const diff = start.getDate() - day + (day === 0 ? -6 : 1);
      start.setDate(diff);
      start.setHours(0, 0, 0, 0);
      return { start, end };
    }
    case 'month': {
      const start = new Date(now.getFullYear(), now.getMonth(), 1);
      return { start, end };
    }
    case 'year': {
      const start = new Date(now.getFullYear(), 0, 1);
      return { start, end };
    }
    case 'custom': {
      const start = customStart ? new Date(customStart) : new Date(now.getFullYear(), now.getMonth(), 1);
      const customEndDate = customEnd ? new Date(customEnd) : end;
      customEndDate.setHours(23, 59, 59);
      return { start, end: customEndDate };
    }
    default:
      return { start: new Date(now.getFullYear(), now.getMonth(), 1), end };
  }
}

function formatDateRange(start: Date, end: Date): string {
  const options: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' };
  const startStr = start.toLocaleDateString('mn-MN', options);
  const endStr = end.toLocaleDateString('mn-MN', options);
  return `${startStr} - ${endStr}`;
}

export default function StatisticsPage() {
  const { athlete, activities } = useApp();
  const [statsData, setStatsData] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<PeriodType>('week');
  const [customStartDate, setCustomStartDate] = useState<string>('');
  const [customEndDate, setCustomEndDate] = useState<string>('');
  const [showCustomPicker, setShowCustomPicker] = useState(false);

  useEffect(() => {
    fetchStats();
  }, []);

  // Set default custom dates
  useEffect(() => {
    if (!customStartDate) {
      const now = new Date();
      const start = new Date(now.getFullYear(), now.getMonth(), 1);
      setCustomStartDate(start.toISOString().split('T')[0]);
      setCustomEndDate(now.toISOString().split('T')[0]);
    }
  }, [customStartDate]);

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/statistics');
      if (response.ok) {
        const data = await response.json();
        setStatsData(data);
      }
    } catch (err) {
      console.error('Failed to fetch statistics:', err);
    } finally {
      setLoading(false);
    }
  };

  // Filter activities based on selected period
  const filteredActivities = useMemo(() => {
    const { start, end } = getDateRange(period, customStartDate, customEndDate);
    
    return activities.filter(activity => {
      const activityDate = new Date(activity.start_date);
      return activityDate >= start && activityDate <= end;
    });
  }, [activities, period, customStartDate, customEndDate]);

  // Calculate stats for filtered activities
  const filteredStats = useMemo(() => {
    const total_distance = filteredActivities.reduce((sum, a) => sum + a.distance, 0);
    const total_time = filteredActivities.reduce((sum, a) => sum + a.moving_time, 0);
    const total_elevation = filteredActivities.reduce((sum, a) => sum + a.elevation_gain, 0);
    const total_calories = filteredActivities.reduce((sum, a) => sum + (a.calories || 0), 0);
    
    return {
      total_distance,
      total_time,
      total_elevation,
      total_calories,
      activity_count: filteredActivities.length,
    };
  }, [filteredActivities]);

  // Calculate activity breakdown for filtered data
  const filteredBreakdown = useMemo((): ActivityTypeBreakdown[] => {
    const typeMap = new Map<string, { count: number; distance: number; time: number }>();
    
    filteredActivities.forEach(activity => {
      const existing = typeMap.get(activity.type) || { count: 0, distance: 0, time: 0 };
      typeMap.set(activity.type, {
        count: existing.count + 1,
        distance: existing.distance + activity.distance,
        time: existing.time + activity.moving_time,
      });
    });

    const total = filteredActivities.length;
    return Array.from(typeMap.entries()).map(([type, data]) => ({
      type,
      count: data.count,
      distance: data.distance,
      time: data.time,
      percentage: total > 0 ? (data.count / total) * 100 : 0,
    })).sort((a, b) => b.count - a.count);
  }, [filteredActivities]);

  const { start: rangeStart, end: rangeEnd } = getDateRange(period, customStartDate, customEndDate);

  if (loading) {
    return (
      <div className="min-h-screen">
        <DashboardHeader athlete={athlete} title="Статистик" />
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#FC4C02] border-t-transparent" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <DashboardHeader athlete={athlete} title="Статистик" />
      
      <div className="page-container section-stack py-4 md:py-6">
        {/* Period Filter */}
        <div className="rounded-xl border border-border/70 bg-card p-3 shadow-sm sm:p-4">
          <div className="mb-2 text-sm text-muted-foreground">Хугацаа:</div>
          <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap sm:items-center">

            <button
              onClick={() => { setPeriod('week'); setShowCustomPicker(false); }}
              className={`min-w-0 px-3 py-2 rounded-lg font-medium transition-colors text-xs sm:flex-none sm:px-4 sm:text-sm ${
                period === 'week'
                  ? 'bg-[#FC4C02] text-white'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              }`}
            >
              Энэ долоо хоног
            </button>
            
            <button
              onClick={() => { setPeriod('month'); setShowCustomPicker(false); }}
              className={`min-w-0 px-3 py-2 rounded-lg font-medium transition-colors text-xs sm:flex-none sm:px-4 sm:text-sm ${
                period === 'month'
                  ? 'bg-[#FC4C02] text-white'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              }`}
            >
              Энэ сар
            </button>
            
            <button
              onClick={() => { setPeriod('year'); setShowCustomPicker(false); }}
              className={`min-w-0 px-3 py-2 rounded-lg font-medium transition-colors text-xs sm:flex-none sm:px-4 sm:text-sm ${
                period === 'year'
                  ? 'bg-[#FC4C02] text-white'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              }`}
            >
              Энэ жил
            </button>
            
            <button
              onClick={() => { setPeriod('custom'); setShowCustomPicker(true); }}
              className={`col-span-2 px-3 py-2 rounded-lg font-medium transition-colors text-xs flex items-center justify-center gap-2 sm:w-auto sm:px-4 sm:text-sm ${
                period === 'custom'
                  ? 'bg-[#FC4C02] text-white'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              }`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              Хугацаа сонгох
            </button>
          </div>

          {/* Custom Date Picker */}
          {showCustomPicker && period === 'custom' && (
            <div className="mt-4 border-t border-border/70 pt-4">
              <div className="grid gap-3 sm:grid-cols-[1fr_auto_1fr] sm:items-end">
                <div className="min-w-0">
                  <label className="mb-1 block text-xs text-muted-foreground">Эхлэх огноо</label>
                  <input
                    type="date"
                    value={customStartDate}
                    onChange={(e) => setCustomStartDate(e.target.value)}
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-transparent focus:ring-2 focus:ring-[#FC4C02]"
                  />
                </div>
                <div className="hidden text-center text-muted-foreground sm:block">→</div>
                <div className="min-w-0">
                  <label className="mb-1 block text-xs text-muted-foreground">Дуусах огноо</label>
                  <input
                    type="date"
                    value={customEndDate}
                    onChange={(e) => setCustomEndDate(e.target.value)}
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-transparent focus:ring-2 focus:ring-[#FC4C02]"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Date Range Display */}
          <div className="mt-3 text-sm text-muted-foreground">
            📅 {formatDateRange(rangeStart, rangeEnd)} • {filteredActivities.length} дасгал
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
          <div className="min-w-0 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl p-4 text-white">
            <p className="text-sm opacity-80">Зай</p>
            <p className="text-xl font-bold sm:text-2xl">{(filteredStats.total_distance / 1000).toFixed(1)} км</p>
          </div>
          <div className="min-w-0 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl p-4 text-white">
            <p className="text-sm opacity-80">Хугацаа</p>
            <p className="text-xl font-bold sm:text-2xl">
              {Math.floor(filteredStats.total_time / 3600)}ц {Math.floor((filteredStats.total_time % 3600) / 60)}м
            </p>
          </div>
          <div className="min-w-0 bg-gradient-to-br from-green-500 to-teal-500 rounded-xl p-4 text-white">
            <p className="text-sm opacity-80">Өндөрлөг</p>
            <p className="text-xl font-bold sm:text-2xl">{Math.round(filteredStats.total_elevation)} м</p>
          </div>
          <div className="min-w-0 bg-gradient-to-br from-pink-500 to-rose-500 rounded-xl p-4 text-white">
            <p className="text-sm opacity-80">Дасгал</p>
            <p className="text-xl font-bold sm:text-2xl">{filteredStats.activity_count}</p>
          </div>
          <div className="min-w-0 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-xl p-4 text-white">
            <p className="text-sm opacity-80">Калори</p>
            <p className="text-xl font-bold sm:text-2xl">{Math.round(filteredStats.total_calories).toLocaleString()}</p>
          </div>
        </div>

        {/* AI Analysis Grid */}
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 lg:gap-6">
          {/* Training Load */}
          <div className="min-w-0">
            <TrainingLoad />
          </div>

          {/* Workout Breakdown */}
          <div className="min-w-0">
            <WorkoutBreakdown activities={filteredActivities} />
          </div>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 lg:gap-6">
          {/* Strava Stats */}
          <div className="min-w-0">
            <StravaStats />
          </div>

          {/* Week Comparison */}
          {statsData?.weekComparison && (
            <div className="min-w-0">
              <WeekComparison
                thisWeek={statsData.weekComparison.thisWeek}
                changes={statsData.weekComparison.changes}
              />
            </div>
          )}

          {/* Activity Type Breakdown - using filtered data */}
          {filteredBreakdown.length > 0 && (
            <div className="min-w-0">
              <ActivityTypeChart data={filteredBreakdown} />
            </div>
          )}
        </div>

        {/* Distance Chart */}
        {statsData?.weeklyHistory && statsData.weeklyHistory.length > 0 && (
          <div className="min-w-0">
            <DistanceChart data={statsData.weeklyHistory} />
          </div>
        )}

        {/* Activity Heatmap - using filtered activities */}
        <div className="min-w-0">
          <ActivityHeatmap activities={filteredActivities} />
        </div>

        {/* Pace Zones - using filtered activities */}
        <div className="min-w-0">
          <PaceZones activities={filteredActivities} />
        </div>

        {/* Personal Records */}
        {statsData?.personalRecords && (
          <div className="min-w-0">
            <PersonalRecords records={statsData.personalRecords} />
          </div>
        )}
      </div>
    </div>
  );
}
