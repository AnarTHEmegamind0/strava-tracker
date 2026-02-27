'use client';

import { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

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
  const [error, setError] = useState(false);

  useEffect(() => {
    async function fetchStreaks() {
      try {
        const res = await fetch(`/api/streaks?user_id=${userId}`);
        if (res.ok) {
          const data = await res.json();
          setStreakData(data.streaks);
        } else {
          // Use default data when not authenticated
          setStreakData({
            daily: { current: 0, best: 0, lastActivityDate: null, isAtRisk: false },
            weekly: { current: 0, best: 0, lastActivityDate: null },
          });
          setError(true);
        }
      } catch (err) {
        console.error('Error fetching streaks:', err);
        setError(true);
        setStreakData({
          daily: { current: 0, best: 0, lastActivityDate: null, isAtRisk: false },
          weekly: { current: 0, best: 0, lastActivityDate: null },
        });
      } finally {
        setLoading(false);
      }
    }
    fetchStreaks();
  }, [userId]);

  if (loading) {
    return (
      <Card className="border-border/80 shadow-sm">
        <CardContent className={compact ? 'p-3' : 'p-6'}>
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 animate-pulse rounded-full bg-muted" />
          <div className="space-y-2 flex-1">
            <div className="h-4 w-20 animate-pulse rounded bg-muted" />
            <div className="h-3 w-16 animate-pulse rounded bg-muted" />
          </div>
        </div>
        </CardContent>
      </Card>
    );
  }

  if (!streakData) {
    return null;
  }

  const { daily, weekly } = streakData;

  // Compact mode for header/sidebar
  if (compact) {
    return (
      <div className="flex items-center gap-2 rounded-lg border border-primary/15 bg-gradient-to-r from-primary/10 to-orange-500/10 px-3 py-2">
        <div className="relative">
          <span className="text-xl">🔥</span>
          {daily.isAtRisk && (
            <span className="absolute -right-1 -top-1 h-3 w-3 animate-pulse rounded-full bg-warning" />
          )}
        </div>
        <div>
          <span className="text-lg font-bold text-foreground">{daily.current}</span>
          <span className="ml-1 text-sm text-muted-foreground">хоног</span>
        </div>
      </div>
    );
  }

  // Full mode for dashboard
  return (
    <Card className="border-border/80 shadow-sm">
      <CardHeader className="pb-2.5">
        <div className="flex items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <span>🔥</span> Streak
        </CardTitle>
        {daily.isAtRisk && (
          <Badge variant="warning" className="animate-pulse">
            Эрсдэлд!
          </Badge>
        )}
        </div>
      </CardHeader>
      <CardContent className="pt-0">

      <div className="grid grid-cols-2 gap-4">
        <div className="rounded-xl border border-primary/15 bg-gradient-to-br from-primary/10 to-orange-500/10 p-4 text-center">
          <div className="relative inline-block">
          <span className="text-2xl">🔥</span>
            {daily.isAtRisk && (
              <span className="absolute -right-1 -top-1 flex h-4 w-4 animate-pulse items-center justify-center rounded-full bg-warning">
                <span className="text-[10px]">!</span>
              </span>
            )}
          </div>
          <div className="mt-2">
            <div className="text-xl font-bold text-card-foreground">
              {daily.current}
            </div>
            <div className="text-xs text-muted-foreground">
              Өдрийн streak
            </div>
          </div>
          <div className="mt-1 text-xs text-muted-foreground">
            Шилдэг: {daily.best}
          </div>
        </div>

        <div className="rounded-xl border border-blue-500/15 bg-gradient-to-br from-blue-500/10 to-indigo-500/10 p-4 text-center">
          <span className="text-2xl">📅</span>
          <div className="mt-2">
            <div className="text-xl font-bold text-card-foreground">
              {weekly.current}
            </div>
            <div className="text-xs text-muted-foreground">
              7 хоногийн streak
            </div>
          </div>
          <div className="mt-1 text-xs text-muted-foreground">
            Шилдэг: {weekly.best}
          </div>
        </div>
      </div>

      {daily.isAtRisk && daily.current > 0 && (
        <div className="mt-4 rounded-lg border border-warning/20 bg-warning/10 p-3">
          <p className="text-sm text-warning">
            ⚠️ Өнөөдөр дасгал хийгээгүй байна. Streak-ээ хадгалаарай!
          </p>
        </div>
      )}

      {daily.current >= 7 && !daily.isAtRisk && (
        <div className="mt-4 rounded-lg border border-success/20 bg-success/10 p-3">
          <p className="text-sm text-success">
            💪 {daily.current} хоногийн streak! Гайхалтай!
          </p>
        </div>
      )}

      {error && daily.current === 0 && (
        <div className="mt-4 rounded-lg bg-muted p-3">
          <p className="text-center text-sm text-muted-foreground">
            Strava-д нэвтэрч дасгал татаарай
          </p>
        </div>
      )}
      </CardContent>
    </Card>
  );
}
