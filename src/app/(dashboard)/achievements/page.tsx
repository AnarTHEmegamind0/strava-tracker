'use client';

import { useApp } from '@/lib/context';
import DashboardHeader from '@/components/layout/DashboardHeader';
import AchievementList from '@/components/achievements/AchievementList';
import StreakCounter from '@/components/streaks/StreakCounter';

export default function AchievementsPage() {
  const { athlete } = useApp();

  return (
    <div className="min-h-screen">
      <DashboardHeader athlete={athlete} title="Амжилтууд" />
      
      <div className="p-6 space-y-6">
        {/* Streak Counter */}
        <StreakCounter />
        
        {/* Achievement List */}
        <AchievementList />
      </div>
    </div>
  );
}
