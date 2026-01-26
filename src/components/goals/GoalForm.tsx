'use client';

import { useState } from 'react';
import { GoalType, GoalMetric } from '@/types';

interface GoalFormProps {
  onSubmit: (goal: {
    title: string;
    type: GoalType;
    metric: GoalMetric;
    target_value: number;
    activity_type: string | null;
  }) => void;
  onCancel: () => void;
}

export default function GoalForm({ onSubmit, onCancel }: GoalFormProps) {
  const [title, setTitle] = useState('');
  const [type, setType] = useState<GoalType>('weekly');
  const [metric, setMetric] = useState<GoalMetric>('distance');
  const [targetValue, setTargetValue] = useState('');
  const [activityType, setActivityType] = useState('all');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    let value = parseFloat(targetValue);
    
    // Convert to base units
    if (metric === 'distance') {
      value = value * 1000; // km to meters
    } else if (metric === 'time') {
      value = value * 3600; // hours to seconds
    }

    onSubmit({
      title: title || getDefaultTitle(),
      type,
      metric,
      target_value: value,
      activity_type: activityType === 'all' ? null : activityType,
    });
  };

  const getDefaultTitle = () => {
    const periodLabel = type === 'weekly' ? 'долоо хоногт' : 'сарын';
    const metricLabels: Record<GoalMetric, string> = {
      distance: `${targetValue}км`,
      time: `${targetValue}ц`,
      count: `${targetValue} дасгал`,
      elevation: `${targetValue}м өндөрлөг`,
    };
    return `${metricLabels[metric]} ${periodLabel}`;
  };

  const getMetricUnit = () => {
    switch (metric) {
      case 'distance': return 'км';
      case 'time': return 'цаг';
      case 'count': return 'дасгал';
      case 'elevation': return 'метр';
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        Шинэ зорилго нэмэх
      </h3>
      
      <div className="space-y-4">
        {/* Goal Type */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Зорилгын хугацаа
          </label>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setType('weekly')}
              className={`flex-1 py-2 rounded-lg font-medium transition-colors ${
                type === 'weekly'
                  ? 'bg-[#FC4C02] text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
              }`}
            >
              Долоо хоног
            </button>
            <button
              type="button"
              onClick={() => setType('monthly')}
              className={`flex-1 py-2 rounded-lg font-medium transition-colors ${
                type === 'monthly'
                  ? 'bg-[#FC4C02] text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
              }`}
            >
              Сар
            </button>
          </div>
        </div>

        {/* Metric */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Юу хянах вэ
          </label>
          <select
            value={metric}
            onChange={(e) => setMetric(e.target.value as GoalMetric)}
            className="w-full px-4 py-2 bg-gray-100 dark:bg-gray-700 border-0 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-[#FC4C02]"
          >
            <option value="distance">Зай (км)</option>
            <option value="time">Хугацаа (цаг)</option>
            <option value="count">Дасгалын тоо</option>
            <option value="elevation">Өндөрлөг (метр)</option>
          </select>
        </div>

        {/* Target Value */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Зорилт ({getMetricUnit()})
          </label>
          <input
            type="number"
            value={targetValue}
            onChange={(e) => setTargetValue(e.target.value)}
            placeholder={`жишээ нь: ${metric === 'distance' ? '50' : metric === 'time' ? '10' : metric === 'count' ? '5' : '500'}`}
            required
            min="0"
            step="any"
            className="w-full px-4 py-2 bg-gray-100 dark:bg-gray-700 border-0 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-[#FC4C02]"
          />
        </div>

        {/* Activity Type */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Дасгалын төрөл
          </label>
          <select
            value={activityType}
            onChange={(e) => setActivityType(e.target.value)}
            className="w-full px-4 py-2 bg-gray-100 dark:bg-gray-700 border-0 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-[#FC4C02]"
          >
            <option value="all">Бүх дасгал</option>
            <option value="Run">Гүйлт</option>
            <option value="Ride">Дугуй</option>
            <option value="Swim">Усанд сэлэлт</option>
            <option value="Walk">Алхалт</option>
            <option value="Hike">Уулын аялал</option>
          </select>
        </div>

        {/* Custom Title (optional) */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Зорилгын нэр (сонголттой)
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder={getDefaultTitle() || 'Зорилгынхоо нэрийг оруулна уу'}
            className="w-full px-4 py-2 bg-gray-100 dark:bg-gray-700 border-0 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-[#FC4C02]"
          />
        </div>

        {/* Buttons */}
        <div className="flex gap-3 pt-2">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
          >
            Болих
          </button>
          <button
            type="submit"
            disabled={!targetValue}
            className="flex-1 py-2 bg-[#FC4C02] text-white rounded-lg font-medium hover:bg-[#e34402] disabled:opacity-50 transition-colors"
          >
            Нэмэх
          </button>
        </div>
      </div>
    </form>
  );
}
