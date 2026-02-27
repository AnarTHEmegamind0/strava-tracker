'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface InsightsData {
  insights: string;
  stats: {
    lastWeekDistance: number;
    lastWeekTime: number;
    lastWeekCount: number;
    daysSinceLastActivity: number | null;
    distanceChange: string;
  };
}

export default function DailyInsights() {
  const [data, setData] = useState<InsightsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchInsights = async () => {
      try {
        const response = await fetch('/api/ai/daily-insights');
        if (response.ok) {
          const result = await response.json();
          setData(result);
        } else {
          setError(true);
        }
      } catch (err) {
        console.error('Failed to fetch insights:', err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchInsights();
  }, []);

  if (loading) {
    return (
      <Card className="border-primary/20 bg-gradient-to-br from-primary to-accent text-white">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-3 text-white">
            <span className="text-2xl">🤖</span>
            AI Зөвлөмж
          </CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center py-8">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-white border-t-transparent" />
        </CardContent>
      </Card>
    );
  }

  if (error || !data) {
    return (
      <Card className="border-border bg-gradient-to-br from-slate-700 to-slate-800 text-white dark:from-slate-800 dark:to-slate-900">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-3 text-white">
            <span className="text-2xl">🤖</span>
            AI Зөвлөмж
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-white/80">Зөвлөмж ачааллах боломжгүй байна. Дараа дахин оролдоно уу.</p>
        </CardContent>
      </Card>
    );
  }

  const changeNum = parseInt(data.stats.distanceChange);
  const isIncrease = changeNum > 0;
  const isDecrease = changeNum < 0;

  return (
    <Card className="border-primary/20 bg-gradient-to-br from-primary to-accent text-white">
      <CardContent className="p-5 sm:p-6">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="text-xl">🤖</span>
          <h3 className="text-lg font-semibold">AI Өдрийн зөвлөмж</h3>
        </div>
        <div className="rounded-full bg-white/20 px-2 py-1 text-xs whitespace-nowrap">
          {new Date().toLocaleDateString('mn-MN', { weekday: 'short', month: 'short', day: 'numeric' })}
        </div>
      </div>

      <div className="mb-4 rounded-lg bg-white/10 p-4">
        <p className="text-sm leading-relaxed whitespace-pre-line">{data.insights}</p>
      </div>

      <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-3 sm:gap-3">
        <div className="rounded-lg bg-white/10 p-3 text-center">
          <p className="text-xl font-bold">{data.stats.lastWeekDistance.toFixed(1)}</p>
          <p className="text-xs text-white/70">км (7 хоног)</p>
        </div>
        <div className="rounded-lg bg-white/10 p-3 text-center">
          <p className="text-xl font-bold">{data.stats.lastWeekCount}</p>
          <p className="text-xs text-white/70">дасгал</p>
        </div>
        <div className="rounded-lg bg-white/10 p-3 text-center">
          <div className="flex items-center justify-center gap-1">
            <p className="text-xl font-bold">{Math.abs(changeNum)}%</p>
            {isIncrease && <span className="text-green-300">↑</span>}
            {isDecrease && <span className="text-red-300">↓</span>}
          </div>
          <p className="text-xs text-white/70">өөрчлөлт</p>
        </div>
      </div>

      {data.stats.daysSinceLastActivity !== null && data.stats.daysSinceLastActivity >= 3 && (
        <div className="mt-4 bg-yellow-500/20 border border-yellow-300/30 rounded-lg p-3 flex items-center gap-2">
          <span>⚠️</span>
          <p className="text-sm">
            Сүүлийн дасгалаас {data.stats.daysSinceLastActivity} өдөр өнгөрлөө
          </p>
        </div>
      )}
      </CardContent>
    </Card>
  );
}
