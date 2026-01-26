'use client';

import { useState, useEffect } from 'react';
import { useApp } from '@/lib/context';
import DashboardHeader from '@/components/layout/DashboardHeader';
import RacePredictions from '@/components/predictions/RacePredictions';
import PredictionMethodology from '@/components/predictions/PredictionMethodology';
import TrainingRecommendations from '@/components/predictions/TrainingRecommendations';

export default function PredictionsPage() {
  const { athlete, activities } = useApp();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'predictions' | 'recommendations' | 'methodology'>('predictions');

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 500);
    return () => clearTimeout(timer);
  }, [activities]);

  // Filter only running activities
  const runActivities = activities.filter(a => a.type === 'Run' && a.distance >= 1000);
  
  // Calculate stats for hero section
  const totalRuns = runActivities.length;
  const totalDistance = runActivities.reduce((sum, a) => sum + a.distance, 0);
  const longestRun = Math.max(...runActivities.map(a => a.distance), 0);
  const avgPace = totalRuns > 0 
    ? runActivities.reduce((sum, a) => sum + (a.moving_time / 60) / (a.distance / 1000), 0) / totalRuns 
    : 0;

  const formatPace = (pace: number) => {
    if (!pace || !isFinite(pace)) return '--:--';
    const mins = Math.floor(pace);
    const secs = Math.round((pace - mins) * 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <DashboardHeader athlete={athlete} title="Уралдааны таамаглал" />
        <div className="flex items-center justify-center h-[60vh]">
          <div className="text-center">
            <div className="relative w-20 h-20 mx-auto mb-4">
              <div className="absolute inset-0 rounded-full border-4 border-gray-200 dark:border-gray-700" />
              <div className="absolute inset-0 rounded-full border-4 border-[#FC4C02] border-t-transparent animate-spin" />
              <div className="absolute inset-0 flex items-center justify-center">
                <svg className="w-8 h-8 text-[#FC4C02]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
            </div>
            <p className="text-gray-500 dark:text-gray-400 animate-pulse">Таамаглал бэлтгэж байна...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <DashboardHeader athlete={athlete} title="Уралдааны таамаглал" />
      
      <div className="p-4 md:p-6 space-y-6">
        {/* Hero Section */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#FC4C02] via-orange-500 to-amber-500 p-6 md:p-8 text-white">
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
              <defs>
                <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
                  <path d="M 10 0 L 0 0 0 10" fill="none" stroke="white" strokeWidth="0.5"/>
                </pattern>
              </defs>
              <rect width="100" height="100" fill="url(#grid)" />
            </svg>
          </div>
          
          {/* Decorative circles */}
          <div className="absolute -right-10 -top-10 w-40 h-40 bg-white/10 rounded-full blur-2xl" />
          <div className="absolute -left-10 -bottom-10 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
          
          <div className="relative z-10">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
              <div>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center">
                    <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    </svg>
                  </div>
                  <div>
                    <h1 className="text-2xl md:text-3xl font-bold">Уралдааны таамаглал</h1>
                    <p className="text-white/80 text-sm">Riegel томьёо ашигласан</p>
                  </div>
                </div>
                <p className="text-white/90 max-w-lg text-sm md:text-base">
                  Таны гүйлтийн түүх дээр суурилан 5км-ээс бүтэн марафон хүртэлх уралдааны хугацааг таамаглана.
                </p>
              </div>
              
              {/* Quick Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="bg-white/15 backdrop-blur rounded-xl p-3 text-center">
                  <p className="text-2xl md:text-3xl font-bold">{totalRuns}</p>
                  <p className="text-xs text-white/70">Нийт гүйлт</p>
                </div>
                <div className="bg-white/15 backdrop-blur rounded-xl p-3 text-center">
                  <p className="text-2xl md:text-3xl font-bold">{(totalDistance / 1000).toFixed(0)}</p>
                  <p className="text-xs text-white/70">Нийт км</p>
                </div>
                <div className="bg-white/15 backdrop-blur rounded-xl p-3 text-center">
                  <p className="text-2xl md:text-3xl font-bold">{(longestRun / 1000).toFixed(1)}</p>
                  <p className="text-xs text-white/70">Хамгийн урт км</p>
                </div>
                <div className="bg-white/15 backdrop-blur rounded-xl p-3 text-center">
                  <p className="text-2xl md:text-3xl font-bold">{formatPace(avgPace)}</p>
                  <p className="text-xs text-white/70">Дундаж хурд</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {runActivities.length < 3 ? (
          /* Empty State */
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 md:p-12 text-center shadow-sm">
            <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
              <svg className="w-12 h-12 text-[#FC4C02]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
              Илүү их өгөгдөл хэрэгтэй
            </h3>
            <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto mb-6">
              Таамаглал гаргахын тулд хамгийн багадаа <span className="font-semibold text-[#FC4C02]">3 гүйлтийн</span> бүртгэлтэй байх шаардлагатай. 
              Одоогоор <span className="font-semibold">{runActivities.length}</span> гүйлт бүртгэгдсэн байна.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <a 
                href="/training" 
                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-[#FC4C02] text-white rounded-xl font-medium hover:bg-orange-600 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Дасгал нэмэх
              </a>
              <a 
                href="/dashboard" 
                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                Хянах самбар руу буцах
              </a>
            </div>
          </div>
        ) : (
          <>
            {/* Tab Navigation */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-1.5 shadow-sm">
              <div className="flex gap-1">
                <button
                  onClick={() => setActiveTab('predictions')}
                  className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium transition-all ${
                    activeTab === 'predictions'
                      ? 'bg-[#FC4C02] text-white shadow-lg shadow-orange-500/25'
                      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                  <span className="hidden sm:inline">Таамаглал</span>
                </button>
                <button
                  onClick={() => setActiveTab('recommendations')}
                  className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium transition-all ${
                    activeTab === 'recommendations'
                      ? 'bg-[#FC4C02] text-white shadow-lg shadow-orange-500/25'
                      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                  <span className="hidden sm:inline">Зөвлөмж</span>
                </button>
                <button
                  onClick={() => setActiveTab('methodology')}
                  className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium transition-all ${
                    activeTab === 'methodology'
                      ? 'bg-[#FC4C02] text-white shadow-lg shadow-orange-500/25'
                      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="hidden sm:inline">Арга зүй</span>
                </button>
              </div>
            </div>

            {/* Tab Content */}
            <div className="transition-all duration-300">
              {activeTab === 'predictions' && <RacePredictions activities={runActivities} />}
              {activeTab === 'recommendations' && <TrainingRecommendations activities={runActivities} />}
              {activeTab === 'methodology' && <PredictionMethodology />}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
