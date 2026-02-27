'use client';

import { DBActivity } from '@/types';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface RecentActivitiesProps {
  activities: DBActivity[];
}

function getActivityIcon(type: string): string {
  const icons: Record<string, string> = {
    Run: '🏃',
    Ride: '🚴',
    Swim: '🏊',
    Walk: '🚶',
    Hike: '🥾',
    Workout: '💪',
    WeightTraining: '🏋️',
    Yoga: '🧘',
    default: '🏅',
  };
  return icons[type] || icons.default;
}

function getActivityTypeName(type: string): string {
  const names: Record<string, string> = {
    Run: 'Гүйлт',
    Ride: 'Дугуй',
    Swim: 'Усанд сэлэлт',
    Walk: 'Алхалт',
    Hike: 'Уулын аялал',
    Workout: 'Дасгал',
    WeightTraining: 'Хүндийн дасгал',
    Yoga: 'Йог',
  };
  return names[type] || type;
}

export default function RecentActivities({ activities }: RecentActivitiesProps) {
  const recentActivities = activities.slice(0, 5);

  const formatDistance = (meters: number) => {
    return `${(meters / 1000).toFixed(2)} км`;
  };

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return hours > 0 ? `${hours}ц ${minutes}м` : `${minutes}м`;
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Өнөөдөр';
    if (diffDays === 1) return 'Өчигдөр';
    if (diffDays < 7) return `${diffDays} өдрийн өмнө`;
    return date.toLocaleDateString('mn-MN', { month: 'short', day: 'numeric' });
  };

  if (recentActivities.length === 0) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Сүүлийн дасгалууд</CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="py-8 text-center text-muted-foreground">
            <p>Дасгал байхгүй байна.</p>
            <p className="mt-2 text-sm">Strava-с синк хийж дасгалуудаа татна уу.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between gap-3">
          <CardTitle>Сүүлийн дасгалууд</CardTitle>
        <Link
          href="/training"
          className="text-sm font-medium text-primary hover:underline"
        >
          Бүгдийг харах
        </Link>
        </div>
      </CardHeader>

      <CardContent className="space-y-2">
        {recentActivities.map((activity) => (
          <Link
            key={activity.strava_id}
            href={`/activity/${activity.strava_id}`}
            className="flex cursor-pointer items-center gap-4 rounded-lg border border-transparent p-3 transition-colors hover:border-border hover:bg-muted/60"
          >
            <span className="text-2xl">{getActivityIcon(activity.type)}</span>
            <div className="flex-1 min-w-0">
              <p className="truncate font-medium text-card-foreground">
                {activity.name}
              </p>
              <p className="text-sm text-muted-foreground">
                {formatDate(activity.start_date)} • {getActivityTypeName(activity.type)}
              </p>
            </div>
            <div className="text-right">
              <p className="font-semibold text-card-foreground">
                {formatDistance(activity.distance)}
              </p>
              <p className="text-sm text-muted-foreground">
                {formatDuration(activity.moving_time)}
              </p>
            </div>
            <svg className="h-5 w-5 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        ))}
      </CardContent>
    </Card>
  );
}
