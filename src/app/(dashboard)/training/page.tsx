'use client';

import { useState, useMemo } from 'react';
import { useApp } from '@/lib/context';
import DashboardHeader from '@/components/layout/DashboardHeader';
import ActivityFilters from '@/components/training/ActivityFilters';
import ActivityCard from '@/components/ActivityCard';

export default function TrainingPage() {
  const { athlete, activities, activitiesLoading, refreshActivities } = useApp();
  const [selectedType, setSelectedType] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Get unique activity types
  const activityTypes = useMemo(() => {
    const types = new Set(activities.map(a => a.type));
    return Array.from(types).sort();
  }, [activities]);

  // Filter activities
  const filteredActivities = useMemo(() => {
    return activities.filter(activity => {
      // Type filter
      if (selectedType !== 'all' && activity.type !== selectedType) {
        return false;
      }
      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        return activity.name.toLowerCase().includes(query);
      }
      return true;
    });
  }, [activities, selectedType, searchQuery]);

  // Stats for filtered activities
  const stats = useMemo(() => {
    const totalDistance = filteredActivities.reduce((sum, a) => sum + a.distance, 0) / 1000;
    const totalTime = filteredActivities.reduce((sum, a) => sum + a.moving_time, 0);
    const totalElevation = filteredActivities.reduce((sum, a) => sum + a.elevation_gain, 0);
    
    return {
      count: filteredActivities.length,
      distance: totalDistance.toFixed(1),
      time: Math.floor(totalTime / 3600),
      elevation: Math.round(totalElevation),
    };
  }, [filteredActivities]);

  return (
    <div className="min-h-screen">
      <DashboardHeader athlete={athlete} title="Дасгалын бүртгэл" />
      
      <div className="page-container section-stack py-6">
        {/* Filters */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <ActivityFilters
            activityTypes={activityTypes}
            selectedType={selectedType}
            onTypeChange={setSelectedType}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
          />
          
          <button
            onClick={() => refreshActivities(true)}
            disabled={activitiesLoading}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-[#FC4C02] hover:bg-[#e34402] disabled:opacity-50 text-white rounded-lg font-medium transition-colors"
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
            {activitiesLoading ? 'Синк хийж байна...' : 'Синк'}
          </button>
        </div>

        {/* Stats Summary */}
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          <div className="rounded-xl border border-border/70 bg-card p-4">
            <p className="text-sm text-muted-foreground">Дасгалууд</p>
            <p className="text-2xl font-bold text-foreground">{stats.count}</p>
          </div>
          <div className="rounded-xl border border-border/70 bg-card p-4">
            <p className="text-sm text-muted-foreground">Нийт зай</p>
            <p className="text-2xl font-bold text-foreground">{stats.distance} км</p>
          </div>
          <div className="rounded-xl border border-border/70 bg-card p-4">
            <p className="text-sm text-muted-foreground">Нийт хугацаа</p>
            <p className="text-2xl font-bold text-foreground">{stats.time}ц</p>
          </div>
          <div className="rounded-xl border border-border/70 bg-card p-4">
            <p className="text-sm text-muted-foreground">Нийт өндөрлөг</p>
            <p className="text-2xl font-bold text-foreground">{stats.elevation}м</p>
          </div>
        </div>

        {/* Activity List */}
        {filteredActivities.length === 0 ? (
          <div className="py-12 text-center text-muted-foreground">
            {activities.length === 0 ? (
              <>
                <p>Дасгал байхгүй байна.</p>
                <p className="text-sm mt-2">&quot;Синк&quot; товч дарж Strava-с дасгалуудаа татна уу.</p>
              </>
            ) : (
              <p>Шүүлтүүрт тохирох дасгал олдсонгүй.</p>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredActivities.map((activity) => (
              <ActivityCard key={activity.strava_id} activity={activity} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
