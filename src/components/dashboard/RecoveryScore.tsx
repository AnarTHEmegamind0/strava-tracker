'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface RecoveryData {
  score: number;
  status: string;
  recommendation: string;
}

export default function RecoveryScore() {
  const [data, setData] = useState<RecoveryData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRecovery = async () => {
      try {
        const response = await fetch('/api/ai/recovery-score');
        if (response.ok) {
          const result = await response.json();
          setData(result);
        }
      } catch (err) {
        console.error('Failed to fetch recovery score:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchRecovery();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'excellent': return 'text-green-500';
      case 'good': return 'text-blue-500';
      case 'moderate': return 'text-yellow-500';
      case 'low': return 'text-red-500';
      default: return 'text-gray-500';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'excellent': return 'Маш сайн';
      case 'good': return 'Сайн';
      case 'moderate': return 'Дунд';
      case 'low': return 'Бага';
      default: return 'Тодорхойгүй';
    }
  };

  const getStatusEmoji = (status: string) => {
    switch (status) {
      case 'excellent': return '💪';
      case 'good': return '👍';
      case 'moderate': return '😐';
      case 'low': return '😴';
      default: return '❓';
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-3">
            <span className="text-xl">🔋</span>
            Сэргээлт
          </CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center py-8">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </CardContent>
      </Card>
    );
  }

  if (!data) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-3">
            <span className="text-xl">🔋</span>
            Сэргээлт
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="py-4 text-center text-sm text-muted-foreground">Тооцоолох боломжгүй</p>
        </CardContent>
      </Card>
    );
  }

  // Calculate the circle progress
  const circumference = 2 * Math.PI * 45; // radius = 45
  const progress = (data.score / 100) * circumference;
  const offset = circumference - progress;

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-3">
          <span className="text-xl">🔋</span>
          Сэргээлтийн оноо
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
      <div className="flex flex-col items-center">
        <div className="relative w-32 h-32">
          <svg className="w-full h-full transform -rotate-90">
            <circle
              cx="64"
              cy="64"
              r="45"
              fill="none"
              stroke="currentColor"
              strokeWidth="10"
              className="text-muted"
            />
            <circle
              cx="64"
              cy="64"
              r="45"
              fill="none"
              stroke="url(#gradient)"
              strokeWidth="10"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={offset}
              className="transition-all duration-1000 ease-out"
            />
            <defs>
              <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" className={`${data.status === 'excellent' ? 'stop-color-green-500' : data.status === 'good' ? 'stop-color-blue-500' : data.status === 'moderate' ? 'stop-color-yellow-500' : 'stop-color-red-500'}`} stopColor={data.status === 'excellent' ? '#22c55e' : data.status === 'good' ? '#3b82f6' : data.status === 'moderate' ? '#eab308' : '#ef4444'} />
                <stop offset="100%" className="stop-color-current" stopColor={data.status === 'excellent' ? '#10b981' : data.status === 'good' ? '#06b6d4' : data.status === 'moderate' ? '#f97316' : '#f43f5e'} />
              </linearGradient>
            </defs>
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-2xl font-bold text-card-foreground">{data.score}</span>
            <span className="text-xs text-muted-foreground">/100</span>
          </div>
        </div>

        <div className="mt-4 flex items-center gap-2">
          <span className="text-xl">{getStatusEmoji(data.status)}</span>
          <span className={`font-semibold ${getStatusColor(data.status)}`}>
            {getStatusText(data.status)}
          </span>
        </div>

        <p className="mt-3 text-center text-sm text-muted-foreground">
          {data.recommendation}
        </p>
      </div>
      </CardContent>
    </Card>
  );
}
