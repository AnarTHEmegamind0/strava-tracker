'use client';

import { useApp } from '@/lib/context';
import DashboardHeader from '@/components/layout/DashboardHeader';
import PDFExport from '@/components/export/PDFExport';
import ThemeToggle from '@/components/theme/ThemeToggle';
import Image from 'next/image';

export default function SettingsPage() {
  const { athlete, activities, logout, refreshActivities, activitiesLoading } = useApp();

  const handleLogout = async () => {
    if (confirm('Та гарахдаа итгэлтэй байна уу?')) {
      await logout();
    }
  };

  const handleClearData = async () => {
    if (confirm('Энэ нь таны чатын түүхийг устгана. Итгэлтэй байна уу?')) {
      try {
        await fetch('/api/chat', { method: 'DELETE' });
        alert('Чатын түүх устгагдлаа!');
      } catch (err) {
        console.error('Failed to clear data:', err);
      }
    }
  };

  // Calculate stats
  const totalDistance = activities.reduce((sum, a) => sum + a.distance, 0) / 1000;
  const totalTime = activities.reduce((sum, a) => sum + a.moving_time, 0);
  const totalActivities = activities.length;

  return (
    <div className="min-h-screen">
      <DashboardHeader athlete={athlete} title="Тохиргоо" />
      
      <div className="p-6 space-y-6 max-w-2xl">
        {/* Profile Section */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Профайл
          </h3>
          
          {athlete && (
            <div className="flex items-center gap-4">
              {athlete.profile ? (
                <Image
                  src={athlete.profile}
                  alt={`${athlete.firstname} ${athlete.lastname}`}
                  width={80}
                  height={80}
                  className="rounded-full"
                />
              ) : (
                <div className="w-20 h-20 bg-gray-300 dark:bg-gray-600 rounded-full flex items-center justify-center">
                  <span className="text-2xl text-gray-600 dark:text-gray-300">
                    {athlete.firstname?.[0]}{athlete.lastname?.[0]}
                  </span>
                </div>
              )}
              <div>
                <h4 className="text-xl font-bold text-gray-900 dark:text-white">
                  {athlete.firstname} {athlete.lastname}
                </h4>
                {athlete.username && (
                  <p className="text-gray-500 dark:text-gray-400">@{athlete.username}</p>
                )}
                {(athlete.city || athlete.country) && (
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {[athlete.city, athlete.country].filter(Boolean).join(', ')}
                  </p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Stats Summary */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Таны статистик
          </h3>
          
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-4 rounded-lg bg-gray-50 dark:bg-gray-700/50">
              <p className="text-2xl font-bold text-[#FC4C02]">{totalActivities}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Дасгал</p>
            </div>
            <div className="text-center p-4 rounded-lg bg-gray-50 dark:bg-gray-700/50">
              <p className="text-2xl font-bold text-[#FC4C02]">{totalDistance.toFixed(0)} км</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Нийт зай</p>
            </div>
            <div className="text-center p-4 rounded-lg bg-gray-50 dark:bg-gray-700/50">
              <p className="text-2xl font-bold text-[#FC4C02]">{Math.floor(totalTime / 3600)}ц</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Нийт хугацаа</p>
            </div>
          </div>
        </div>

        {/* Appearance */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Харагдац
          </h3>
          
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-900 dark:text-white">Загвар</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Өнгөний загвараа сонгоно уу
              </p>
            </div>
            <ThemeToggle />
          </div>
        </div>

        {/* Strava Sync */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Strava холболт
          </h3>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#FC4C02] rounded-lg flex items-center justify-center">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
                  <path d="M15.387 17.944l-2.089-4.116h-3.065L15.387 24l5.15-10.172h-3.066m-7.008-5.599l2.836 5.598h4.172L10.463 0l-7.03 13.828h4.169" />
                </svg>
              </div>
              <div>
                <p className="font-medium text-gray-900 dark:text-white">Strava-д холбогдсон</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {totalActivities} дасгал синк хийгдсэн
                </p>
              </div>
            </div>
            <button
              onClick={() => refreshActivities(true)}
              disabled={activitiesLoading}
              className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg font-medium hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50 transition-colors"
            >
              {activitiesLoading ? 'Синк хийж байна...' : 'Синк хийх'}
            </button>
          </div>
        </div>

        {/* Data Management */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Өгөгдлийн удирдлага
          </h3>
          
          <div className="space-y-3">
            {/* Export CSV */}
            <a
              href="/api/export"
              download
              className="w-full py-3 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 rounded-lg font-medium hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors px-4 flex items-center justify-between"
            >
              <span>Дасгалуудыг экспорт (CSV)</span>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </a>

            {/* Export PDF */}
            <PDFExport 
              activities={activities} 
              athleteName={athlete ? `${athlete.firstname} ${athlete.lastname}` : 'Тамирчин'} 
            />

            <button
              onClick={handleClearData}
              className="w-full py-3 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors text-left px-4 flex items-center justify-between"
            >
              <span>Чатын түүх устгах</span>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        </div>

        {/* Logout */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Бүртгэл
          </h3>
          
          <button
            onClick={handleLogout}
            className="w-full py-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg font-medium hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
          >
            Гарах
          </button>
        </div>

        {/* About */}
        <div className="text-center text-sm text-gray-500 dark:text-gray-400 py-4">
          <p>Strava Дасгалын Тэмдэглэл v1.0</p>
          <p>Strava API & Groq AI ашигласан</p>
        </div>
      </div>
    </div>
  );
}
