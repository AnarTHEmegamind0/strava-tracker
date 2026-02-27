'use client';

import { useState, useEffect } from 'react';
import { useApp } from '@/lib/context';
import DashboardHeader from '@/components/layout/DashboardHeader';
import Link from 'next/link';

interface TrainingPlan {
  id: number;
  title: string;
  description?: string;
  duration: number;
  duration_type: 'weeks' | 'days';
  goal_type: string;
  content: string;
  status: 'active' | 'completed' | 'archived';
  start_date?: string;
  end_date?: string;
  created_at: string;
  days_completed?: number;
  total_days?: number;
  progress_percent?: number;
}

interface ParsedDay {
  day: number;
  title: string;
  type: 'rest' | 'easy' | 'long' | 'tempo' | 'interval' | 'race';
  distance?: string;
  duration?: string;
  description: string;
  isToday?: boolean;
  isCompleted?: boolean;
}

const goalTypeLabels: Record<string, string> = {
  general: 'Ерөнхий фитнесс',
  '5k': '5км уралдаан',
  '10k': '10км уралдаан',
  half_marathon: 'Хагас марафон',
  marathon: 'Марафон',
  weight_loss: 'Жин хасах',
  endurance: 'Тэсвэр нэмэгдүүлэх',
};

const workoutTypeConfig: Record<string, { label: string; color: string; bgColor: string; icon: string }> = {
  rest: { label: 'Амралт', color: 'text-blue-600', bgColor: 'bg-blue-50 dark:bg-blue-900/20', icon: '😴' },
  easy: { label: 'Хөнгөн', color: 'text-green-600', bgColor: 'bg-green-50 dark:bg-green-900/20', icon: '🚶' },
  long: { label: 'Урт', color: 'text-purple-600', bgColor: 'bg-purple-50 dark:bg-purple-900/20', icon: '🏃' },
  tempo: { label: 'Темп', color: 'text-orange-600', bgColor: 'bg-orange-50 dark:bg-orange-900/20', icon: '⚡' },
  interval: { label: 'Интервал', color: 'text-red-600', bgColor: 'bg-red-50 dark:bg-red-900/20', icon: '🔥' },
  race: { label: 'Уралдаан', color: 'text-yellow-600', bgColor: 'bg-yellow-50 dark:bg-yellow-900/20', icon: '🏆' },
};

const statusConfig: Record<string, { label: string; color: string; bgColor: string }> = {
  active: { label: 'Идэвхтэй', color: 'text-green-700', bgColor: 'bg-green-100 dark:bg-green-900/30' },
  completed: { label: 'Дууссан', color: 'text-blue-700', bgColor: 'bg-blue-100 dark:bg-blue-900/30' },
  archived: { label: 'Архив', color: 'text-gray-500', bgColor: 'bg-gray-100 dark:bg-gray-700' },
};

// Parse training plan content into structured days
function parsePlanContent(content: string, totalDays: number, daysCompleted: number): ParsedDay[] {
  const days: ParsedDay[] = [];
  const lines = content.split('\n');
  
  let currentDay: Partial<ParsedDay> | null = null;
  let currentDescription: string[] = [];
  
  for (const line of lines) {
    const trimmedLine = line.trim();
    
    // Match day patterns like "Өдөр 1:", "Day 1:", "1-р өдөр", etc.
    const dayMatch = trimmedLine.match(/^(?:Өдөр|Day|📅)?\s*(\d+)(?:-р өдөр|:|\.|-)?\s*[:\-]?\s*(.*)$/i) ||
                     trimmedLine.match(/^(\d+)(?:-р)?\s*(?:өдөр|day)[:\-]?\s*(.*)$/i);
    
    if (dayMatch) {
      // Save previous day
      if (currentDay && currentDay.day) {
        currentDay.description = currentDescription.join('\n').trim();
        days.push(currentDay as ParsedDay);
      }
      
      const dayNum = parseInt(dayMatch[1]);
      const restOfLine = dayMatch[2] || '';
      
      // Determine workout type from content
      let type: ParsedDay['type'] = 'easy';
      const lowerLine = restOfLine.toLowerCase();
      
      if (lowerLine.includes('амралт') || lowerLine.includes('rest') || lowerLine.includes('амрах')) {
        type = 'rest';
      } else if (lowerLine.includes('урт') || lowerLine.includes('long')) {
        type = 'long';
      } else if (lowerLine.includes('темп') || lowerLine.includes('tempo')) {
        type = 'tempo';
      } else if (lowerLine.includes('интервал') || lowerLine.includes('interval') || lowerLine.includes('хурд')) {
        type = 'interval';
      } else if (lowerLine.includes('уралдаан') || lowerLine.includes('race')) {
        type = 'race';
      } else if (lowerLine.includes('хөнгөн') || lowerLine.includes('easy') || lowerLine.includes('сэргээлт')) {
        type = 'easy';
      }
      
      // Extract distance if present
      const distanceMatch = restOfLine.match(/(\d+(?:\.\d+)?)\s*(?:км|km)/i);
      const durationMatch = restOfLine.match(/(\d+)\s*(?:минут|мин|min)/i);
      
      currentDay = {
        day: dayNum,
        title: restOfLine || `${dayNum}-р өдөр`,
        type,
        distance: distanceMatch ? `${distanceMatch[1]} км` : undefined,
        duration: durationMatch ? `${durationMatch[1]} мин` : undefined,
        isCompleted: dayNum <= daysCompleted,
        isToday: dayNum === daysCompleted + 1,
      };
      currentDescription = [];
      
      // If there's content after the day number on same line
      if (restOfLine && !restOfLine.match(/^[\s\-:]*$/)) {
        currentDescription.push(restOfLine);
      }
    } else if (currentDay && trimmedLine) {
      // Add to current day's description
      currentDescription.push(trimmedLine);
    }
  }
  
  // Save last day
  if (currentDay && currentDay.day) {
    currentDay.description = currentDescription.join('\n').trim();
    days.push(currentDay as ParsedDay);
  }
  
  // If no days parsed, create placeholder days
  if (days.length === 0) {
    for (let i = 1; i <= totalDays; i++) {
      days.push({
        day: i,
        title: `${i}-р өдөр`,
        type: i % 7 === 0 ? 'rest' : 'easy',
        description: content.substring(0, 200) + '...',
        isCompleted: i <= daysCompleted,
        isToday: i === daysCompleted + 1,
      });
    }
  }
  
  return days;
}

export default function PlansPage() {
  const { athlete } = useApp();
  const [plans, setPlans] = useState<TrainingPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPlan, setSelectedPlan] = useState<TrainingPlan | null>(null);
  const [viewMode, setViewMode] = useState<'cards' | 'table' | 'timeline'>('cards');
  const [showRawContent, setShowRawContent] = useState(false);
  const [selectedDay, setSelectedDay] = useState<ParsedDay | null>(null); // For day detail modal

  useEffect(() => {
    loadPlans();
  }, []);

  const loadPlans = async () => {
    try {
      const response = await fetch('/api/training-plans');
      if (response.ok) {
        const data = await response.json();
        setPlans(data.plans || []);
        // Auto-select first active plan
        const activePlan = data.plans?.find((p: TrainingPlan) => p.status === 'active');
        if (activePlan) setSelectedPlan(activePlan);
      }
    } catch (err) {
      console.error('Failed to load training plans:', err);
    } finally {
      setLoading(false);
    }
  };

  const startPlan = async (planId: number) => {
    try {
      const response = await fetch(`/api/training-plans/${planId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'start' }),
      });
      if (response.ok) {
        loadPlans();
      }
    } catch (err) {
      console.error('Failed to start plan:', err);
    }
  };

  const completePlan = async (planId: number) => {
    try {
      const response = await fetch(`/api/training-plans/${planId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'complete' }),
      });
      if (response.ok) {
        loadPlans();
      }
    } catch (err) {
      console.error('Failed to complete plan:', err);
    }
  };

  const deletePlan = async (planId: number) => {
    if (!confirm('Энэ төлөвлөгөөг устгах уу?')) return;
    try {
      const response = await fetch(`/api/training-plans/${planId}`, { method: 'DELETE' });
      if (response.ok) {
        loadPlans();
        if (selectedPlan?.id === planId) setSelectedPlan(null);
      }
    } catch (err) {
      console.error('Failed to delete plan:', err);
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('mn-MN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const parsedDays = selectedPlan 
    ? parsePlanContent(selectedPlan.content, selectedPlan.total_days || selectedPlan.duration * (selectedPlan.duration_type === 'weeks' ? 7 : 1), selectedPlan.days_completed || 0)
    : [];

  // Group days by week
  const weekGroups = parsedDays.reduce((acc, day) => {
    const weekNum = Math.ceil(day.day / 7);
    if (!acc[weekNum]) acc[weekNum] = [];
    acc[weekNum].push(day);
    return acc;
  }, {} as Record<number, ParsedDay[]>);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <DashboardHeader athlete={athlete} title="Дасгалын Төлөвлөгөө" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Миний Төлөвлөгөөнүүд
            </h1>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              AI-ийн үүсгэсэн дасгалын хуваарь
            </p>
          </div>
          <Link
            href="/coach"
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-[#FC4C02] to-orange-500 hover:from-[#e34402] hover:to-orange-600 text-white rounded-xl transition-all shadow-lg shadow-orange-500/25 font-medium"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Шинэ төлөвлөгөө
          </Link>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <svg className="animate-spin h-10 w-10 text-[#FC4C02] mx-auto mb-4" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              <p className="text-gray-500 dark:text-gray-400">Уншиж байна...</p>
            </div>
          </div>
        ) : plans.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-orange-100 to-red-100 dark:from-orange-900/30 dark:to-red-900/30 rounded-full flex items-center justify-center">
              <span className="text-5xl">📋</span>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Төлөвлөгөө байхгүй байна
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-6 max-w-md mx-auto">
              AI дасгалжуулагчаас өөрийн зорилгод тохирсон хувийн төлөвлөгөө үүсгээрэй
            </p>
            <Link
              href="/coach"
              className="inline-flex items-center gap-2 px-6 py-3 bg-[#FC4C02] hover:bg-[#e34402] text-white rounded-xl transition-colors font-medium"
            >
              <span className="text-xl">🤖</span>
              AI-аар төлөвлөгөө үүсгэх
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Plans List Sidebar */}
            <div className="lg:col-span-1">
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm overflow-hidden">
                <div className="p-4 border-b border-gray-100 dark:border-gray-700">
                  <h3 className="font-semibold text-gray-900 dark:text-white">Төлөвлөгөөнүүд</h3>
                </div>
                <div className="divide-y divide-gray-100 dark:divide-gray-700 max-h-[600px] overflow-y-auto">
                  {plans.map(plan => (
                    <button
                      key={plan.id}
                      onClick={() => setSelectedPlan(plan)}
                      className={`w-full p-4 text-left transition-all hover:bg-gray-50 dark:hover:bg-gray-700/50 ${
                        selectedPlan?.id === plan.id ? 'bg-orange-50 dark:bg-orange-900/20 border-l-4 border-[#FC4C02]' : ''
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <h4 className="font-medium text-gray-900 dark:text-white text-sm line-clamp-1">
                          {plan.title}
                        </h4>
                        <span className={`flex-shrink-0 px-2 py-0.5 text-xs rounded-full ${statusConfig[plan.status].bgColor} ${statusConfig[plan.status].color}`}>
                          {statusConfig[plan.status].label}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                        {goalTypeLabels[plan.goal_type]} • {plan.duration} {plan.duration_type === 'weeks' ? 'долоо хоног' : 'өдөр'}
                      </p>
                      {plan.status === 'active' && plan.start_date && (
                        <div className="mt-2">
                          <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                            <span>{plan.days_completed || 0}/{plan.total_days}</span>
                            <span>{Math.round(plan.progress_percent || 0)}%</span>
                          </div>
                          <div className="h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-gradient-to-r from-[#FC4C02] to-orange-500 rounded-full"
                              style={{ width: `${plan.progress_percent || 0}%` }}
                            />
                          </div>
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Plan Details */}
            <div className="lg:col-span-3">
              {selectedPlan ? (
                <div className="space-y-6">
                  {/* Plan Header Card */}
                  <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-6">
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                            {selectedPlan.title}
                          </h2>
                          <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${statusConfig[selectedPlan.status].bgColor} ${statusConfig[selectedPlan.status].color}`}>
                            {statusConfig[selectedPlan.status].label}
                          </span>
                        </div>
                        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                          <span className="flex items-center gap-1">
                            <span>🎯</span> {goalTypeLabels[selectedPlan.goal_type]}
                          </span>
                          <span className="flex items-center gap-1">
                            <span>📅</span> {selectedPlan.duration} {selectedPlan.duration_type === 'weeks' ? 'долоо хоног' : 'өдөр'}
                          </span>
                          {selectedPlan.start_date && (
                            <span className="flex items-center gap-1">
                              <span>🚀</span> {formatDate(selectedPlan.start_date)}
                            </span>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        {selectedPlan.status === 'active' && !selectedPlan.start_date && (
                          <button
                            onClick={() => startPlan(selectedPlan.id)}
                            className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white text-sm font-medium rounded-xl transition-colors"
                          >
                            Эхлүүлэх
                          </button>
                        )}
                        {selectedPlan.status === 'active' && selectedPlan.start_date && (
                          <button
                            onClick={() => completePlan(selectedPlan.id)}
                            className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium rounded-xl transition-colors"
                          >
                            Дуусгах
                          </button>
                        )}
                        <button
                          onClick={() => deletePlan(selectedPlan.id)}
                          className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-colors"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    {selectedPlan.status === 'active' && selectedPlan.start_date && (
                      <div className="mt-6 p-4 bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 rounded-xl">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            Явц: {selectedPlan.days_completed || 0} / {selectedPlan.total_days || 0} өдөр
                          </span>
                          <span className="text-lg font-bold text-[#FC4C02]">
                            {Math.round(selectedPlan.progress_percent || 0)}%
                          </span>
                        </div>
                        <div className="h-3 bg-white dark:bg-gray-700 rounded-full overflow-hidden shadow-inner">
                          <div 
                            className="h-full bg-gradient-to-r from-[#FC4C02] to-orange-500 rounded-full transition-all duration-500"
                            style={{ width: `${selectedPlan.progress_percent || 0}%` }}
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* View Mode Toggle */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 p-1 bg-gray-100 dark:bg-gray-800 rounded-xl">
                      {[
                        { key: 'cards', label: 'Карт', icon: '▦' },
                        { key: 'table', label: 'Хүснэгт', icon: '▤' },
                        { key: 'timeline', label: 'Цагийн шугам', icon: '▥' },
                      ].map(mode => (
                        <button
                          key={mode.key}
                          onClick={() => setViewMode(mode.key as any)}
                          className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${
                            viewMode === mode.key
                              ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                          }`}
                        >
                          {mode.icon} {mode.label}
                        </button>
                      ))}
                    </div>
                    <button
                      onClick={() => setShowRawContent(!showRawContent)}
                      className="text-sm text-gray-500 hover:text-[#FC4C02] transition-colors"
                    >
                      {showRawContent ? 'Бүтэцтэй харах' : 'Бүтэн текст харах'}
                    </button>
                  </div>

                  {/* Content Display */}
                  {showRawContent ? (
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-6">
                      <pre className="whitespace-pre-wrap text-sm text-gray-700 dark:text-gray-300 leading-relaxed font-sans">
                        {selectedPlan.content}
                      </pre>
                    </div>
                  ) : viewMode === 'cards' ? (
                    /* Cards View */
                    <div className="space-y-6">
                      {Object.entries(weekGroups).map(([weekNum, days]) => (
                        <div key={weekNum} className="space-y-3">
                          <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            {parseInt(weekNum)}-р долоо хоног
                          </h3>
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                            {days.map(day => {
                              const config = workoutTypeConfig[day.type];
                              return (
                                <button
                                  key={day.day}
                                  onClick={() => setSelectedDay(day)}
                                  className={`relative p-4 rounded-xl border-2 transition-all text-left hover:scale-[1.02] hover:shadow-lg cursor-pointer ${
                                    day.isToday 
                                      ? 'border-[#FC4C02] bg-orange-50 dark:bg-orange-900/20 ring-2 ring-[#FC4C02]/20' 
                                      : day.isCompleted
                                        ? 'border-green-200 dark:border-green-800 bg-green-50/50 dark:bg-green-900/10'
                                        : 'border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-gray-300 dark:hover:border-gray-600'
                                  }`}
                                >
                                  {day.isToday && (
                                    <div className="absolute -top-2 -right-2 px-2 py-0.5 bg-[#FC4C02] text-white text-xs font-bold rounded-full">
                                      Өнөөдөр
                                    </div>
                                  )}
                                  {day.isCompleted && (
                                    <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center">
                                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                      </svg>
                                    </div>
                                  )}
                                  
                                  <div className="flex items-center justify-between mb-2">
                                    <span className="text-2xl">{config.icon}</span>
                                    <span className="text-xs font-medium text-gray-400">Өдөр {day.day}</span>
                                  </div>
                                  
                                  <div className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium mb-2 ${config.bgColor} ${config.color}`}>
                                    {config.label}
                                  </div>
                                  
                                  <p className="text-sm font-medium text-gray-900 dark:text-white mb-1 line-clamp-1">
                                    {day.title}
                                  </p>
                                  
                                  <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                                    {day.distance && <span>📏 {day.distance}</span>}
                                    {day.duration && <span>⏱️ {day.duration}</span>}
                                  </div>
                                  
                                  {day.description && (
                                    <p className="mt-2 text-xs text-gray-500 dark:text-gray-400 line-clamp-2">
                                      {day.description}
                                    </p>
                                  )}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : viewMode === 'table' ? (
                    /* Table View */
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm overflow-hidden">
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead>
                            <tr className="bg-gray-50 dark:bg-gray-700/50">
                              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Өдөр</th>
                              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Төрөл</th>
                              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Дасгал</th>
                              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Зай</th>
                              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Хугацаа</th>
                              <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Төлөв</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                            {parsedDays.map(day => {
                              const config = workoutTypeConfig[day.type];
                              return (
                                <tr 
                                  key={day.day}
                                  onClick={() => setSelectedDay(day)}
                                  className={`transition-colors cursor-pointer ${
                                    day.isToday 
                                      ? 'bg-orange-50 dark:bg-orange-900/20' 
                                      : day.isCompleted
                                        ? 'bg-green-50/50 dark:bg-green-900/10'
                                        : 'hover:bg-gray-50 dark:hover:bg-gray-700/50'
                                  }`}
                                >
                                  <td className="px-4 py-3">
                                    <div className="flex items-center gap-2">
                                      <span className="text-lg">{config.icon}</span>
                                      <span className="font-medium text-gray-900 dark:text-white">Өдөр {day.day}</span>
                                      {day.isToday && (
                                        <span className="px-2 py-0.5 bg-[#FC4C02] text-white text-xs font-bold rounded-full">
                                          Өнөөдөр
                                        </span>
                                      )}
                                    </div>
                                  </td>
                                  <td className="px-4 py-3">
                                    <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-medium ${config.bgColor} ${config.color}`}>
                                      {config.label}
                                    </span>
                                  </td>
                                  <td className="px-4 py-3">
                                    <p className="text-sm text-gray-700 dark:text-gray-300 max-w-xs truncate">
                                      {day.title}
                                    </p>
                                  </td>
                                  <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                                    {day.distance || '-'}
                                  </td>
                                  <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                                    {day.duration || '-'}
                                  </td>
                                  <td className="px-4 py-3 text-center">
                                    {day.isCompleted ? (
                                      <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs font-medium rounded-full">
                                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                        </svg>
                                        Дууссан
                                      </span>
                                    ) : day.isToday ? (
                                      <span className="inline-block px-2.5 py-1 bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 text-xs font-medium rounded-full">
                                        Хийх
                                      </span>
                                    ) : (
                                      <span className="inline-block px-2.5 py-1 bg-gray-100 dark:bg-gray-700 text-gray-500 text-xs font-medium rounded-full">
                                        Хүлээгдэж буй
                                      </span>
                                    )}
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  ) : (
                    /* Timeline View */
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-6">
                      <div className="relative">
                        {/* Timeline line */}
                        <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gray-200 dark:bg-gray-700" />
                        
                        <div className="space-y-6">
                          {parsedDays.map((day, index) => {
                            const config = workoutTypeConfig[day.type];
                            return (
                              <div 
                                key={day.day} 
                                className="relative pl-14 cursor-pointer"
                                onClick={() => setSelectedDay(day)}
                              >
                                {/* Timeline dot */}
                                <div className={`absolute left-4 w-5 h-5 rounded-full border-4 ${
                                  day.isToday 
                                    ? 'bg-[#FC4C02] border-orange-200 dark:border-orange-800' 
                                    : day.isCompleted
                                      ? 'bg-green-500 border-green-200 dark:border-green-800'
                                      : 'bg-gray-300 dark:bg-gray-600 border-gray-100 dark:border-gray-700'
                                }`} />
                                
                                <div className={`p-4 rounded-xl transition-all hover:shadow-md hover:scale-[1.01] ${
                                  day.isToday 
                                    ? 'bg-orange-50 dark:bg-orange-900/20 border-2 border-[#FC4C02]' 
                                    : 'bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700'
                                }`}>
                                  <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center gap-3">
                                      <span className="text-2xl">{config.icon}</span>
                                      <div>
                                        <div className="flex items-center gap-2">
                                          <span className="font-semibold text-gray-900 dark:text-white">Өдөр {day.day}</span>
                                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${config.bgColor} ${config.color}`}>
                                            {config.label}
                                          </span>
                                          {day.isToday && (
                                            <span className="px-2 py-0.5 bg-[#FC4C02] text-white text-xs font-bold rounded-full">
                                              Өнөөдөр
                                            </span>
                                          )}
                                        </div>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">{day.title}</p>
                                      </div>
                                    </div>
                                    
                                    <div className="flex items-center gap-3 text-sm text-gray-500 dark:text-gray-400">
                                      {day.distance && <span>📏 {day.distance}</span>}
                                      {day.duration && <span>⏱️ {day.duration}</span>}
                                      {day.isCompleted && (
                                        <span className="flex items-center gap-1 text-green-600">
                                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                          </svg>
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                  
                                  {day.description && (
                                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-2 pl-11">
                                      {day.description}
                                    </p>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-12 text-center">
                  <div className="text-6xl mb-4">👈</div>
                  <p className="text-gray-500 dark:text-gray-400">
                    Зүүн талаас төлөвлөгөө сонгоно уу
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Day Detail Modal */}
      {selectedDay && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setSelectedDay(null)}
          />
          
          {/* Modal */}
          <div className="relative w-full max-w-lg bg-white dark:bg-gray-800 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
            {/* Header */}
            <div className={`p-6 ${workoutTypeConfig[selectedDay.type].bgColor}`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <span className="text-5xl">{workoutTypeConfig[selectedDay.type].icon}</span>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                        Өдөр {selectedDay.day}
                      </h3>
                      {selectedDay.isToday && (
                        <span className="px-2.5 py-1 bg-[#FC4C02] text-white text-xs font-bold rounded-full">
                          Өнөөдөр
                        </span>
                      )}
                      {selectedDay.isCompleted && (
                        <span className="px-2.5 py-1 bg-green-500 text-white text-xs font-bold rounded-full flex items-center gap-1">
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                          Дууссан
                        </span>
                      )}
                    </div>
                    <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${workoutTypeConfig[selectedDay.type].color} bg-white/80 dark:bg-gray-900/50`}>
                      {workoutTypeConfig[selectedDay.type].label}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedDay(null)}
                  className="p-2 hover:bg-white/20 rounded-full transition-colors"
                >
                  <svg className="w-6 h-6 text-gray-700 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6">
              {/* Title */}
              <div>
                <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Дасгал</h4>
                <p className="text-lg font-semibold text-gray-900 dark:text-white">
                  {selectedDay.title}
                </p>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-4">
                {selectedDay.distance && (
                  <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                    <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 mb-1">
                      <span className="text-lg">📏</span>
                      <span className="text-sm font-medium">Зай</span>
                    </div>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {selectedDay.distance}
                    </p>
                  </div>
                )}
                {selectedDay.duration && (
                  <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                    <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 mb-1">
                      <span className="text-lg">⏱️</span>
                      <span className="text-sm font-medium">Хугацаа</span>
                    </div>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {selectedDay.duration}
                    </p>
                  </div>
                )}
                {!selectedDay.distance && !selectedDay.duration && selectedDay.type === 'rest' && (
                  <div className="col-span-2 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl text-center">
                    <span className="text-3xl mb-2 block">😴</span>
                    <p className="text-blue-700 dark:text-blue-300 font-medium">
                      Амралтын өдөр - Биеийг сэргээ!
                    </p>
                  </div>
                )}
              </div>

              {/* Description */}
              {selectedDay.description && (
                <div>
                  <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Дэлгэрэнгүй</h4>
                  <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                    <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">
                      {selectedDay.description}
                    </p>
                  </div>
                </div>
              )}

              {/* Workout Type Info */}
              <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-xl">
                <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Дасгалын төрлийн тухай</h4>
                <div className="flex items-start gap-3">
                  <span className="text-2xl">{workoutTypeConfig[selectedDay.type].icon}</span>
                  <div>
                    <p className={`font-semibold ${workoutTypeConfig[selectedDay.type].color}`}>
                      {workoutTypeConfig[selectedDay.type].label}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      {selectedDay.type === 'rest' && 'Биеийг сэргээх, булчинг нөхөн сэргээх өдөр. Хөнгөн сунгалт хийж болно.'}
                      {selectedDay.type === 'easy' && 'Хөнгөн эрчимтэй гүйлт. Ярилцаж чадах хурдтай гүйнэ. Суурь тэсвэрийг бэхжүүлнэ.'}
                      {selectedDay.type === 'long' && 'Урт зайн гүйлт. Тэсвэр, аэроб хүчин чадлыг сайжруулна. Хурдыг бага байлгана.'}
                      {selectedDay.type === 'tempo' && 'Темп гүйлт. "Тухтай бус" хурдтай гүйнэ. Босго хурдыг сайжруулна.'}
                      {selectedDay.type === 'interval' && 'Интервал дасгал. Хурдан/удаан давталт. VO2max болон хурдыг сайжруулна.'}
                      {selectedDay.type === 'race' && 'Уралдааны өдөр! Бүх хүчээ дайчил. Өмнөх өдрүүдэд сайн амар.'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Tips based on workout type */}
              <div className="p-4 bg-gradient-to-r from-orange-50 to-yellow-50 dark:from-orange-900/20 dark:to-yellow-900/20 rounded-xl">
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                  <span>💡</span> Зөвлөмж
                </h4>
                <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                  {selectedDay.type === 'rest' && (
                    <>
                      <li>• Хөнгөн сунгалт, foam rolling хийж болно</li>
                      <li>• 7-8 цаг унтах</li>
                      <li>• Ус ууж, зөв хооллох</li>
                    </>
                  )}
                  {selectedDay.type === 'easy' && (
                    <>
                      <li>• Хурдаа бага байлга, ярилцаж чадах байх</li>
                      <li>• Гүйлтийн өмнө 5-10 мин халаалт хий</li>
                      <li>• Дуусгаад сунгалт хий</li>
                    </>
                  )}
                  {selectedDay.type === 'long' && (
                    <>
                      <li>• Урт гүйлтийн өмнөх орой сайн унт</li>
                      <li>• Дунд нь ус, электролит авч бай</li>
                      <li>• Хурдаа тогтвортой байлга</li>
                    </>
                  )}
                  {selectedDay.type === 'tempo' && (
                    <>
                      <li>• Халаалт, сэрүүцэлт заавал хий</li>
                      <li>• "Тухтай бус" боловч хэлээр ярьж чадах байх</li>
                      <li>• Хурдаа тогтвортой барь</li>
                    </>
                  )}
                  {selectedDay.type === 'interval' && (
                    <>
                      <li>• Сайн халаалт (10-15 мин) заавал хий</li>
                      <li>• Давталт бүрт бүх хүчээ гарга</li>
                      <li>• Сэрүүцэлтийг бүү алга</li>
                    </>
                  )}
                  {selectedDay.type === 'race' && (
                    <>
                      <li>• Өмнөх орой эрт унт</li>
                      <li>• Өглөө хөнгөн хоол ид (2-3 цагийн өмнө)</li>
                      <li>• Халаалтаа хий, амжилт!</li>
                    </>
                  )}
                </ul>
              </div>
            </div>

            {/* Footer */}
            <div className="p-6 bg-gray-50 dark:bg-gray-700/50 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={() => setSelectedDay(null)}
                className="w-full py-3 bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-medium rounded-xl hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors"
              >
                Хаах
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
