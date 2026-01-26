'use client';

import { useState } from 'react';
import { GoalWithProgress } from '@/types';

interface GoalCardProps {
  goal: GoalWithProgress;
  onDelete: (id: number) => void;
}

function getMetricDisplay(metric: string, value: number): string {
  switch (metric) {
    case 'distance':
      return `${(value / 1000).toFixed(1)} км`;
    case 'time':
      return `${(value / 3600).toFixed(1)} ц`;
    case 'elevation':
      return `${Math.round(value)} м`;
    case 'count':
      return `${Math.round(value)}`;
    default:
      return value.toString();
  }
}

function getGoalIcon(metric: string): string {
  switch (metric) {
    case 'distance': return '🏃';
    case 'time': return '⏱️';
    case 'elevation': return '⛰️';
    case 'count': return '📊';
    default: return '🎯';
  }
}

export default function GoalCard({ goal, onDelete }: GoalCardProps) {
  const [showAdvice, setShowAdvice] = useState(false);
  const [advice, setAdvice] = useState<string | null>(null);
  const [loadingAdvice, setLoadingAdvice] = useState(false);
  
  const isCompleted = goal.progress_percent >= 100;

  const getAdvice = async () => {
    if (advice) {
      setShowAdvice(!showAdvice);
      return;
    }

    setLoadingAdvice(true);
    setShowAdvice(true);
    try {
      const response = await fetch('/api/ai/goal-advice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ goalId: goal.id }),
      });
      
      if (response.ok) {
        const data = await response.json();
        setAdvice(data.advice);
      }
    } catch (err) {
      console.error('Failed to get advice:', err);
      setAdvice('Зөвлөгөө авахад алдаа гарлаа. Дахин оролдоно уу.');
    } finally {
      setLoadingAdvice(false);
    }
  };
  
  return (
    <div className={`bg-white dark:bg-gray-800 rounded-xl shadow-sm p-5 border-2 transition-colors ${
      isCompleted ? 'border-green-500' : 'border-transparent'
    }`}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <span className="text-2xl">{getGoalIcon(goal.metric)}</span>
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white">
              {goal.title}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {goal.type === 'weekly' ? 'Долоо хоногийн' : 'Сарын'} зорилго
              {goal.activity_type ? ` • ${goal.activity_type}` : ''}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={getAdvice}
            disabled={loadingAdvice}
            className="p-2 text-gray-400 hover:text-[#FC4C02] transition-colors"
            title="AI зөвлөгөө авах"
          >
            {loadingAdvice ? (
              <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            )}
          </button>
          <button
            onClick={() => onDelete(goal.id)}
            className="p-2 text-gray-400 hover:text-red-500 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-3">
        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              isCompleted ? 'bg-green-500' : 'bg-[#FC4C02]'
            }`}
            style={{ width: `${Math.min(goal.progress_percent, 100)}%` }}
          />
        </div>
      </div>

      {/* Stats */}
      <div className="flex items-center justify-between text-sm">
        <div>
          <span className="font-semibold text-gray-900 dark:text-white">
            {getMetricDisplay(goal.metric, goal.current_value)}
          </span>
          <span className="text-gray-500 dark:text-gray-400">
            {' / '}{getMetricDisplay(goal.metric, goal.target_value)}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span className={`font-semibold ${isCompleted ? 'text-green-500' : 'text-[#FC4C02]'}`}>
            {Math.round(goal.progress_percent)}%
          </span>
          {!isCompleted && (
            <span className="text-gray-500 dark:text-gray-400">
              {goal.days_left} өдөр үлдсэн
            </span>
          )}
          {isCompleted && (
            <span className="text-green-500 font-medium">
              Биелсэн! 🎉
            </span>
          )}
        </div>
      </div>

      {/* AI Advice Section */}
      {showAdvice && (
        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2 mb-2">
            <span>🤖</span>
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">AI Дасгалжуулагчын зөвлөмж</span>
          </div>
          {loadingAdvice ? (
            <div className="flex items-center gap-2 text-gray-500">
              <span>Зорилгыг шинжилж байна...</span>
            </div>
          ) : (
            <div className="bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 rounded-lg p-3">
              <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{advice}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
