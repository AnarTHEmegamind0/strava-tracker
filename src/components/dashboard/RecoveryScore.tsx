'use client';

import { useState, useEffect } from 'react';

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

  const getStatusBg = (status: string) => {
    switch (status) {
      case 'excellent': return 'from-green-500 to-emerald-600';
      case 'good': return 'from-blue-500 to-cyan-600';
      case 'moderate': return 'from-yellow-500 to-orange-500';
      case 'low': return 'from-red-500 to-rose-600';
      default: return 'from-gray-500 to-gray-600';
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
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
        <div className="flex items-center gap-3 mb-4">
          <span className="text-2xl">🔋</span>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Сэргээлт</h3>
        </div>
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-[#FC4C02] border-t-transparent"></div>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
        <div className="flex items-center gap-3 mb-4">
          <span className="text-2xl">🔋</span>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Сэргээлт</h3>
        </div>
        <p className="text-gray-500 dark:text-gray-400 text-sm text-center py-4">
          Тооцоолох боломжгүй
        </p>
      </div>
    );
  }

  // Calculate the circle progress
  const circumference = 2 * Math.PI * 45; // radius = 45
  const progress = (data.score / 100) * circumference;
  const offset = circumference - progress;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
      <div className="flex items-center gap-3 mb-4">
        <span className="text-2xl">🔋</span>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Сэргээлтийн оноо</h3>
      </div>

      {/* Circular Progress */}
      <div className="flex flex-col items-center">
        <div className="relative w-32 h-32">
          <svg className="w-full h-full transform -rotate-90">
            {/* Background circle */}
            <circle
              cx="64"
              cy="64"
              r="45"
              fill="none"
              stroke="currentColor"
              strokeWidth="10"
              className="text-gray-200 dark:text-gray-700"
            />
            {/* Progress circle */}
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
          {/* Score text */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-3xl font-bold text-gray-900 dark:text-white">{data.score}</span>
            <span className="text-xs text-gray-500 dark:text-gray-400">/100</span>
          </div>
        </div>

        {/* Status */}
        <div className="mt-4 flex items-center gap-2">
          <span className="text-2xl">{getStatusEmoji(data.status)}</span>
          <span className={`font-semibold ${getStatusColor(data.status)}`}>
            {getStatusText(data.status)}
          </span>
        </div>

        {/* Recommendation */}
        <p className="mt-3 text-sm text-gray-600 dark:text-gray-400 text-center">
          {data.recommendation}
        </p>
      </div>
    </div>
  );
}
