'use client';

import { DBActivity } from '@/types';
import { format } from 'date-fns';
import { useState } from 'react';

interface ActivityModalProps {
  isOpen: boolean;
  onClose: () => void;
  date: Date | null;
  activities: DBActivity[];
  selectedActivity: DBActivity | null;
  onAnalyze: (activity: DBActivity) => void;
  analyzing: boolean;
  analysis: string | null;
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
  };
  return icons[type] || '🏅';
}

function formatDistance(meters: number): string {
  return `${(meters / 1000).toFixed(2)} км`;
}

function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  return `${minutes}:${secs.toString().padStart(2, '0')}`;
}

function formatPace(avgSpeed: number): string {
  if (avgSpeed <= 0) return '-';
  const paceSecondsPerKm = 1000 / avgSpeed;
  const minutes = Math.floor(paceSecondsPerKm / 60);
  const seconds = Math.round(paceSecondsPerKm % 60);
  return `${minutes}:${seconds.toString().padStart(2, '0')} /км`;
}

function getActivityColor(type: string): string {
  const colors: Record<string, string> = {
    Run: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400',
    Ride: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
    Swim: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-400',
    Walk: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
    Hike: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
    Workout: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
  };
  return colors[type] || 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
}

export default function ActivityModal({
  isOpen,
  onClose,
  date,
  activities,
  selectedActivity,
  onAnalyze,
  analyzing,
  analysis,
}: ActivityModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 transition-opacity"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-xl max-w-2xl w-full max-h-[80vh] overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                {date ? format(date, 'yyyy оны MM сарын dd') : 'Дасгалын дэлгэрэнгүй'}
              </h2>
              {activities.length > 0 && !selectedActivity && (
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  {activities.length} дасгал
                </p>
              )}
            </div>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          {/* Content */}
          <div className="p-6 overflow-y-auto max-h-[60vh]">
            {selectedActivity ? (
              // Single activity detail view
              <div className="space-y-6">
                {/* Activity header */}
                <div className="flex items-start gap-4">
                  <span className="text-4xl">{getActivityIcon(selectedActivity.type)}</span>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {selectedActivity.name}
                    </h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getActivityColor(selectedActivity.type)}`}>
                        {selectedActivity.type}
                      </span>
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        {format(new Date(selectedActivity.start_date), 'h:mm a')}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Stats grid */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4">
                    <p className="text-sm text-gray-500 dark:text-gray-400">Зай</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {formatDistance(selectedActivity.distance)}
                    </p>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4">
                    <p className="text-sm text-gray-500 dark:text-gray-400">Хугацаа</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {formatDuration(selectedActivity.moving_time)}
                    </p>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4">
                    <p className="text-sm text-gray-500 dark:text-gray-400">Дундаж хурд</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {formatPace(selectedActivity.average_speed)}
                    </p>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4">
                    <p className="text-sm text-gray-500 dark:text-gray-400">Өндөрлөг</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {Math.round(selectedActivity.elevation_gain)} м
                    </p>
                  </div>
                </div>

                {/* AI Analysis section */}
                <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                      <span>🤖</span> AI Шинжилгээ
                    </h4>
                    <button
                      onClick={() => onAnalyze(selectedActivity)}
                      disabled={analyzing}
                      className="px-4 py-2 bg-[#FC4C02] text-white rounded-lg hover:bg-[#e34402] disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium flex items-center gap-2"
                    >
                      {analyzing ? (
                        <>
                          <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                          </svg>
                          Шинжилж байна...
                        </>
                      ) : (
                        <>
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                          </svg>
                          Шинжлэх
                        </>
                      )}
                    </button>
                  </div>
                  
                  {analysis ? (
                    <div className="bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 rounded-xl p-4 prose prose-sm dark:prose-invert max-w-none">
                      <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{analysis}</p>
                    </div>
                  ) : (
                    <p className="text-gray-500 dark:text-gray-400 text-sm">
                      &quot;Шинжлэх&quot; товчийг дарж энэ дасгалын талаар AI зөвлөмж аваарай.
                    </p>
                  )}
                </div>
              </div>
            ) : activities.length > 0 ? (
              // Activities list for the day
              <div className="space-y-3">
                {activities.map((activity) => (
                  <button
                    key={activity.strava_id}
                    onClick={() => onAnalyze(activity)}
                    className="w-full flex items-center gap-4 p-4 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors text-left border border-gray-200 dark:border-gray-700"
                  >
                    <span className="text-3xl">{getActivityIcon(activity.type)}</span>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 dark:text-white truncate">
                        {activity.name}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {activity.type} • {format(new Date(activity.start_date), 'h:mm a')}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900 dark:text-white">
                        {formatDistance(activity.distance)}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {formatDuration(activity.moving_time)}
                      </p>
                    </div>
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                ))}
              </div>
            ) : (
              // No activities
              <div className="text-center py-12">
                <div className="text-4xl mb-4">🏖️</div>
                <p className="text-gray-500 dark:text-gray-400">Энэ өдөр дасгал байхгүй</p>
                <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">Амралтын өдөр эсвэл өгөгдөл татагдаагүй</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
