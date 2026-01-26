'use client';

import { useApp } from '@/lib/context';
import DashboardHeader from '@/components/layout/DashboardHeader';
import QuickStats from '@/components/dashboard/QuickStats';
import RecentActivities from '@/components/dashboard/RecentActivities';
import WeeklyOverview from '@/components/dashboard/WeeklyOverview';
import GoalsPreview from '@/components/dashboard/GoalsPreview';
import DailyInsights from '@/components/dashboard/DailyInsights';
import RecoveryScore from '@/components/dashboard/RecoveryScore';
import WeatherWidget from '@/components/weather/WeatherWidget';
import StreakCounter from '@/components/streaks/StreakCounter';

export default function DashboardPage() {
  const { athlete, activities, goals, activitiesLoading, refreshActivities } = useApp();

  return (
    <div className="min-h-screen">
      <DashboardHeader athlete={athlete} title="Хянах самбар" />
      
      <div className="p-6 space-y-6">
        {/* Sync button */}
        <div className="flex justify-end">
          <button
            onClick={() => refreshActivities(true)}
            disabled={activitiesLoading}
            className="flex items-center gap-2 text-sm text-[#FC4C02] hover:text-[#e34402] disabled:opacity-50 font-medium"
          >
            <svg
              className={`w-4 h-4 ${activitiesLoading ? 'animate-spin' : ''}`}
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
            {activitiesLoading ? 'Синк хийж байна...' : 'Strava-с татах'}
          </button>
        </div>

        {/* Weather + Streak Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <WeatherWidget compact />
          <StreakCounter compact={false} />
        </div>

        {/* AI Insights + Recovery Score */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <DailyInsights />
          </div>
          <RecoveryScore />
        </div>

        {/* Quick Stats */}
        <QuickStats activities={activities} period="week" />

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Weekly Chart */}
          <WeeklyOverview activities={activities} />
          
          {/* Goals Preview */}
          <GoalsPreview goals={goals} />
        </div>

        {/* Recent Activities */}
        <RecentActivities activities={activities} />
      </div>
    </div>
  );
}
