'use client';

import Image from 'next/image';
import { StravaAthlete } from '@/types';
import AlertsDropdown from '@/components/alerts/AlertsDropdown';

interface DashboardHeaderProps {
  athlete: StravaAthlete | null;
  title: string;
}

export default function DashboardHeader({ athlete, title }: DashboardHeaderProps) {
  return (
    <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{title}</h1>
        
        <div className="flex items-center gap-4">
          {/* Notifications */}
          <AlertsDropdown userId={athlete?.id || 1} />
          
          {/* User Profile */}
          {athlete && (
            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  {athlete.firstname} {athlete.lastname}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  @{athlete.username || 'athlete'}
                </p>
              </div>
              {athlete.profile ? (
                <Image
                  src={athlete.profile}
                  alt={`${athlete.firstname} ${athlete.lastname}`}
                  width={40}
                  height={40}
                  className="rounded-full"
                />
              ) : (
                <div className="w-10 h-10 bg-gray-300 dark:bg-gray-600 rounded-full flex items-center justify-center">
                  <span className="text-sm text-gray-600 dark:text-gray-300">
                    {athlete.firstname?.[0]}{athlete.lastname?.[0]}
                  </span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
