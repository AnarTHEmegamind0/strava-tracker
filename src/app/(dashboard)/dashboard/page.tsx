'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { useApp } from '@/lib/context';
import QuickStats from '@/components/dashboard/QuickStats';
import RecentActivities from '@/components/dashboard/RecentActivities';
import WeeklyOverview from '@/components/dashboard/WeeklyOverview';
import GoalsPreview from '@/components/dashboard/GoalsPreview';
import DailyInsights from '@/components/dashboard/DailyInsights';
import RecoveryScore from '@/components/dashboard/RecoveryScore';
import WeatherWidget from '@/components/weather/WeatherWidget';
import StreakCounter from '@/components/streaks/StreakCounter';
import DailyPlan from '@/components/dashboard/DailyPlan';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 6) return 'Сайхан амраарай';
  if (hour < 12) return 'Өглөөний мэнд';
  if (hour < 18) return 'Өдрийн мэнд';
  if (hour < 22) return 'Оройн мэнд';
  return 'Сайхан амраарай';
}

function getMotivationalQuote(): string {
  const quotes = [
    'Өнөөдрийн хүчин чармайлт маргааш үр дүнгээ өгнө',
    'Аялал мянган алхамаас эхэлдэг',
    'Өөрийгөө сорь, хязгаараа тэлэ',
    'Тууштай байвал зорилгодоо хүрнэ',
    'Жижиг алхам ч том ялалт руу хөтөлнө',
  ];
  return quotes[Math.floor(Math.random() * quotes.length)];
}

export default function DashboardPage() {
  const { athlete, activities, goals, activitiesLoading, refreshActivities } = useApp();
  const now = new Date();
  const greeting = getGreeting();
  const quote = getMotivationalQuote();

  return (
    <div className="min-h-screen bg-transparent">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5" />
        <div className="relative mx-auto max-w-7xl px-3 py-5 sm:px-4 md:px-6 md:py-7">
          {/* Top Bar: Date & Sync */}
          <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-accent text-white shadow-lg">
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M15.387 17.944l-2.089-4.116h-3.065L15.387 24l5.15-10.172h-3.066m-7.008-5.599l2.836 5.598h4.172L10.463 0l-7.03 13.828h4.169" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  {now.toLocaleDateString('mn-MN', { weekday: 'long', month: 'long', day: 'numeric' })}
                </p>
                <p className="text-xs text-muted-foreground/70">
                  {now.toLocaleTimeString('mn-MN', { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>

            <Button
              onClick={() => refreshActivities(true)}
              disabled={activitiesLoading}
              size="md"
              className="group shadow-lg"
              leadingIcon={
                <svg
                  className={`h-4 w-4 transition-transform group-hover:rotate-180 ${activitiesLoading ? 'animate-spin' : ''}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h4M20 20v-5h-4m3.4-6A8 8 0 006.3 8M17.7 16A8 8 0 017 19" />
                </svg>
              }
            >
              {activitiesLoading ? 'Синк хийж байна...' : 'Strava синк'}
            </Button>
          </div>

          {/* Greeting Card */}
          <Card className="mb-5 overflow-hidden border-0 bg-gradient-to-r from-card via-card to-secondary/30 shadow-lg">
            <CardContent className="p-5 sm:p-6">
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div className="flex items-center gap-4">
                  {athlete?.profile && (
                    <div className="relative">
                      <Image
                        src={athlete.profile}
                        alt={athlete.firstname}
                        width={64}
                        height={64}
                        className="h-16 w-16 rounded-2xl border-2 border-primary/20 object-cover shadow-md"
                      />
                      <div className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-success text-white shadow">
                        <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth={3} viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                    </div>
                  )}
                  <div>
                    <h1 className="text-2xl font-bold text-foreground md:text-3xl">
                      {greeting}{athlete?.firstname ? `, ${athlete.firstname}` : ''}!
                    </h1>
                    <p className="mt-1 text-sm text-muted-foreground italic">
                      &quot;{quote}&quot;
                    </p>
                  </div>
                </div>

                {/* Mini Weather */}
                <div className="flex items-center gap-3 rounded-xl bg-muted/50 px-4 py-3">
                  <WeatherMini />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <QuickStats activities={activities} period="week" />
        </div>
      </div>

      {/* Main Content */}
      <div className="mx-auto max-w-7xl px-3 pb-8 sm:px-4 md:px-6 md:pb-10">
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-12">
          {/* Left Column - Main Content */}
          <div className="space-y-5 lg:col-span-8">
            {/* Daily Plan - AI Generated Checklist */}
            <DailyPlan />

            {/* AI Insights */}
            <DailyInsights />

            {/* Weekly Overview */}
            <WeeklyOverview activities={activities} />

            {/* Recent Activities */}
            <RecentActivities activities={activities} />
          </div>

          {/* Right Column - Sidebar Widgets */}
          <div className="space-y-5 lg:col-span-4">
            {/* Weather Full */}
            <WeatherWidget compact={false} />

            {/* Streak Counter */}
            <StreakCounter compact={false} />

            {/* Recovery Score */}
            <RecoveryScore />

            {/* Goals Preview */}
            <GoalsPreview goals={goals} />

            {/* Quick Actions */}
            <QuickActions />
          </div>
        </div>
      </div>
    </div>
  );
}

// Mini Weather Component for header
function WeatherMini() {
  const [temp, setTemp] = useState<string>('--');
  const [location, setLocation] = useState<string>('');

  useEffect(() => {
    const load = async () => {
      try {
        const response = await fetch('/api/weather');
        if (!response.ok) return;
        const data = await response.json();
        if (data?.weather) {
          setTemp(String(data.weather.temp));
          setLocation(String(data.weather.location || '')); 
        }
      } catch {
        // keep placeholder on failure
      }
    };

    load();
  }, []);

  return (
    <div className="flex items-center gap-2 text-sm">
      <svg className="h-5 w-5 text-amber-500" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 2.25a.75.75 0 01.75.75v2.25a.75.75 0 01-1.5 0V3a.75.75 0 01.75-.75zM7.5 12a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM18.894 6.166a.75.75 0 00-1.06-1.06l-1.591 1.59a.75.75 0 101.06 1.061l1.591-1.59zM21.75 12a.75.75 0 01-.75.75h-2.25a.75.75 0 010-1.5H21a.75.75 0 01.75.75zM17.834 18.894a.75.75 0 001.06-1.06l-1.59-1.591a.75.75 0 10-1.061 1.06l1.59 1.591zM12 18a.75.75 0 01.75.75V21a.75.75 0 01-1.5 0v-2.25A.75.75 0 0112 18zM7.758 17.303a.75.75 0 00-1.061-1.06l-1.591 1.59a.75.75 0 001.06 1.061l1.592-1.59zM6 12a.75.75 0 01-.75.75H3a.75.75 0 010-1.5h2.25A.75.75 0 016 12zM6.697 7.757a.75.75 0 001.06-1.06l-1.59-1.591a.75.75 0 00-1.061 1.06l1.59 1.591z" />
      </svg>
      <div>
        <span className="font-medium text-foreground">{temp}°C</span>
        {location && <p className="text-[11px] text-muted-foreground">{location}</p>}
      </div>
    </div>
  );
}

// Quick Actions Component
function QuickActions() {
  const actions = [
    { label: 'Дасгал нэмэх', icon: '➕', href: '/training', color: 'bg-primary/10 text-primary hover:bg-primary/20' },
    { label: 'AI зөвлөмж', icon: '🤖', href: '/coach', color: 'bg-accent/10 text-accent hover:bg-accent/20' },
    { label: 'Зорилго тавих', icon: '🎯', href: '/goals', color: 'bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20' },
    { label: 'Төлөвлөгөө', icon: '📋', href: '/plans', color: 'bg-indigo-500/10 text-indigo-600 hover:bg-indigo-500/20' },
  ];

  return (
    <Card className="border-border/80 shadow-sm">
      <CardContent className="p-4 sm:p-5">
        <h3 className="mb-3 text-sm font-semibold text-foreground">Түргэн үйлдэл</h3>
        <div className="grid grid-cols-2 gap-2.5">
          {actions.map((action) => (
            <a
              key={action.label}
              href={action.href}
              className={`flex items-center gap-2 rounded-xl px-3.5 py-3 text-sm font-medium transition-all ${action.color}`}
            >
              <span>{action.icon}</span>
              <span>{action.label}</span>
            </a>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
