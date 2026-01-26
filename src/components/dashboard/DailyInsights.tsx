'use client';

import { useState, useEffect } from 'react';

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
      <div className="bg-gradient-to-br from-[#FC4C02] to-orange-600 rounded-xl p-6 text-white">
        <div className="flex items-center gap-3 mb-4">
          <span className="text-2xl">🤖</span>
          <h3 className="text-lg font-semibold">AI Зөвлөмж</h3>
        </div>
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-white border-t-transparent"></div>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="bg-gradient-to-br from-gray-600 to-gray-700 rounded-xl p-6 text-white">
        <div className="flex items-center gap-3 mb-4">
          <span className="text-2xl">🤖</span>
          <h3 className="text-lg font-semibold">AI Зөвлөмж</h3>
        </div>
        <p className="text-white/80 text-sm">Зөвлөмж ачааллах боломжгүй байна. Дараа дахин оролдоно уу.</p>
      </div>
    );
  }

  const changeNum = parseInt(data.stats.distanceChange);
  const isIncrease = changeNum > 0;
  const isDecrease = changeNum < 0;

  return (
    <div className="bg-gradient-to-br from-[#FC4C02] to-orange-600 rounded-xl p-6 text-white">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <span className="text-2xl">🤖</span>
          <h3 className="text-lg font-semibold">AI Өдрийн зөвлөмж</h3>
        </div>
        <div className="text-xs bg-white/20 px-2 py-1 rounded-full">
          {new Date().toLocaleDateString('mn-MN', { weekday: 'short', month: 'short', day: 'numeric' })}
        </div>
      </div>

      {/* AI Insights */}
      <div className="bg-white/10 rounded-lg p-4 mb-4">
        <p className="text-sm leading-relaxed whitespace-pre-line">{data.insights}</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-white/10 rounded-lg p-3 text-center">
          <p className="text-2xl font-bold">{data.stats.lastWeekDistance.toFixed(1)}</p>
          <p className="text-xs text-white/70">км (7 хоног)</p>
        </div>
        <div className="bg-white/10 rounded-lg p-3 text-center">
          <p className="text-2xl font-bold">{data.stats.lastWeekCount}</p>
          <p className="text-xs text-white/70">дасгал</p>
        </div>
        <div className="bg-white/10 rounded-lg p-3 text-center">
          <div className="flex items-center justify-center gap-1">
            <p className="text-2xl font-bold">{Math.abs(changeNum)}%</p>
            {isIncrease && <span className="text-green-300">↑</span>}
            {isDecrease && <span className="text-red-300">↓</span>}
          </div>
          <p className="text-xs text-white/70">өөрчлөлт</p>
        </div>
      </div>

      {/* Days since last activity warning */}
      {data.stats.daysSinceLastActivity !== null && data.stats.daysSinceLastActivity >= 3 && (
        <div className="mt-4 bg-yellow-500/20 border border-yellow-300/30 rounded-lg p-3 flex items-center gap-2">
          <span>⚠️</span>
          <p className="text-sm">
            Сүүлийн дасгалаас {data.stats.daysSinceLastActivity} өдөр өнгөрлөө
          </p>
        </div>
      )}
    </div>
  );
}
