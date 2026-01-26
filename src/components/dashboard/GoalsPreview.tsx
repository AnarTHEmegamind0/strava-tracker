'use client';

import { GoalWithProgress } from '@/types';
import Link from 'next/link';

interface GoalsPreviewProps {
  goals: GoalWithProgress[];
}

function getMetricUnit(metric: string): string {
  switch (metric) {
    case 'distance': return 'км';
    case 'time': return 'ц';
    case 'elevation': return 'м';
    case 'count': return '';
    default: return '';
  }
}

function formatValue(value: number, metric: string): string {
  switch (metric) {
    case 'distance': return (value / 1000).toFixed(1);
    case 'time': return (value / 3600).toFixed(1);
    case 'elevation': return Math.round(value).toString();
    case 'count': return Math.round(value).toString();
    default: return value.toString();
  }
}

export default function GoalsPreview({ goals }: GoalsPreviewProps) {
  const activeGoals = goals.slice(0, 3);

  if (activeGoals.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Зорилго
          </h3>
          <Link
            href="/goals"
            className="text-sm text-[#FC4C02] hover:text-[#e34402] font-medium"
          >
            Нэмэх
          </Link>
        </div>
        <div className="text-center py-6 text-gray-500 dark:text-gray-400">
          <p>Зорилго тавиагүй байна.</p>
          <p className="text-sm mt-1">Зорилго тавьж ахиц дэвшлээ хянаарай!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Зорилго
        </h3>
        <Link
          href="/goals"
          className="text-sm text-[#FC4C02] hover:text-[#e34402] font-medium"
        >
          Бүгдийг харах
        </Link>
      </div>
      
      <div className="space-y-4">
        {activeGoals.map((goal) => {
          const current = formatValue(goal.current_value, goal.metric);
          const target = formatValue(goal.target_value, goal.metric);
          const unit = getMetricUnit(goal.metric);
          
          return (
            <div key={goal.id} className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  {goal.title}
                </span>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {goal.days_left} өдөр үлдсэн
                </span>
              </div>
              <div className="relative">
                <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#FC4C02] rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(goal.progress_percent, 100)}%` }}
                  />
                </div>
              </div>
              <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                <span>{current}{unit} / {target}{unit}</span>
                <span>{Math.round(goal.progress_percent)}%</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
