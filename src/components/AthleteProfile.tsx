'use client';

import { StravaAthlete } from '@/types';
import Image from 'next/image';

interface AthleteProfileProps {
  athlete: StravaAthlete;
  onLogout: () => void;
}

export default function AthleteProfile({ athlete, onLogout }: AthleteProfileProps) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
      <div className="flex items-center gap-4">
        {athlete.profile ? (
          <Image
            src={athlete.profile}
            alt={`${athlete.firstname} ${athlete.lastname}`}
            width={64}
            height={64}
            className="rounded-full"
          />
        ) : (
          <div className="w-16 h-16 bg-gray-300 dark:bg-gray-600 rounded-full flex items-center justify-center">
            <span className="text-2xl text-gray-600 dark:text-gray-300">
              {athlete.firstname?.[0]}{athlete.lastname?.[0]}
            </span>
          </div>
        )}
        <div className="flex-1">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            {athlete.firstname} {athlete.lastname}
          </h2>
          {athlete.username && (
            <p className="text-gray-500 dark:text-gray-400">@{athlete.username}</p>
          )}
          {(athlete.city || athlete.country) && (
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {[athlete.city, athlete.country].filter(Boolean).join(', ')}
            </p>
          )}
        </div>
        <button
          onClick={onLogout}
          className="text-sm text-gray-500 hover:text-red-500 transition-colors"
        >
          Logout
        </button>
      </div>
    </div>
  );
}
