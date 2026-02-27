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
import QuickActionGrid from '@/components/dashboard/QuickActionGrid';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

export default function DashboardPage() {
  const { athlete, activities, goals, activitiesLoading, refreshActivities } = useApp();

  return (
    <div className="min-h-screen bg-transparent">
      <DashboardHeader athlete={athlete} title="Хянах самбар" />
      <div className="mx-auto max-w-7xl space-y-6 px-4 py-6 md:px-6">
        <div className="grid gap-4 lg:grid-cols-[1fr_auto]">
          <Card className="overflow-hidden">
            <CardContent className="flex flex-col gap-2 p-5 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-lg font-semibold text-card-foreground md:text-xl">
                  Сайн байна уу{athlete?.firstname ? `, ${athlete.firstname}` : ''}!
                </h2>
                <p className="text-sm text-muted-foreground">
                  {new Date().toLocaleDateString('mn-MN', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </p>
              </div>
              <div className="text-xs text-muted-foreground md:text-sm">
                Энэ өдөрт зориулсан самбар ба AI зөвлөмжүүд
              </div>
            </CardContent>
          </Card>

          <div className="flex items-start justify-end">
            <Button
              onClick={() => refreshActivities(true)}
              disabled={activitiesLoading}
              size="lg"
              leadingIcon={
                <svg
                  className={`h-4 w-4 ${activitiesLoading ? 'animate-spin' : ''}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.8}
                    d="M4 4v5h4M20 20v-5h-4m3.4-6A8 8 0 006.3 8M17.7 16A8 8 0 017 19"
                  />
                </svg>
              }
            >
              {activitiesLoading ? 'Синк хийж байна...' : 'Strava-с татах'}
            </Button>
          </div>
        </div>

        <QuickStats activities={activities} period="week" />

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            <DailyInsights />
            <WeeklyOverview activities={activities} />
            <RecentActivities activities={activities} />
          </div>

          <div className="space-y-6">
            <WeatherWidget compact={false} />
            <StreakCounter compact={false} />
            <RecoveryScore />
            <GoalsPreview goals={goals} />
            <QuickActionGrid />
          </div>
        </div>
      </div>
    </div>
  );
}
