'use client';

import { AchievementWithStatus } from '@/types';

interface AchievementBadgeProps {
  achievement: AchievementWithStatus;
  size?: 'sm' | 'md' | 'lg';
  showProgress?: boolean;
}

export default function AchievementBadge({ 
  achievement, 
  size = 'md',
  showProgress = true 
}: AchievementBadgeProps) {
  const sizeClasses = {
    sm: 'w-12 h-12 text-xl',
    md: 'w-16 h-16 text-2xl',
    lg: 'w-24 h-24 text-4xl',
  };

  const containerClasses = {
    sm: 'p-2',
    md: 'p-3',
    lg: 'p-4',
  };

  const isUnlocked = achievement.unlocked;
  const progress = achievement.progress || 0;

  return (
    <div className={`flex flex-col items-center ${containerClasses[size]}`}>
      {/* Badge Circle */}
      <div className="relative">
        {/* Progress Ring (background) */}
        {showProgress && !isUnlocked && (
          <svg 
            className={`absolute inset-0 ${sizeClasses[size]} -rotate-90`}
            viewBox="0 0 100 100"
          >
            <circle
              cx="50"
              cy="50"
              r="45"
              fill="none"
              stroke="currentColor"
              strokeWidth="6"
              className="text-gray-200 dark:text-gray-700"
            />
            <circle
              cx="50"
              cy="50"
              r="45"
              fill="none"
              stroke="currentColor"
              strokeWidth="6"
              strokeLinecap="round"
              strokeDasharray={`${progress * 2.83} 283`}
              className="text-[#FC4C02] transition-all duration-500"
            />
          </svg>
        )}
        
        {/* Badge Icon */}
        <div 
          className={`
            ${sizeClasses[size]} 
            rounded-full flex items-center justify-center
            transition-all duration-300
            ${isUnlocked 
              ? 'bg-gradient-to-br from-yellow-400 to-orange-500 shadow-lg shadow-orange-500/30' 
              : 'bg-gray-100 dark:bg-gray-800 grayscale opacity-50'
            }
          `}
        >
          <span className={isUnlocked ? '' : 'grayscale'}>{achievement.icon}</span>
        </div>

        {/* Unlocked checkmark */}
        {isUnlocked && (
          <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center shadow">
            <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          </div>
        )}
      </div>

      {/* Badge Name */}
      <p className={`
        mt-2 text-center font-medium
        ${size === 'sm' ? 'text-xs' : size === 'md' ? 'text-sm' : 'text-base'}
        ${isUnlocked ? 'text-gray-900 dark:text-white' : 'text-gray-400 dark:text-gray-500'}
      `}>
        {achievement.name_mn}
      </p>

      {/* Progress or Date */}
      {showProgress && (
        <p className={`
          text-center
          ${size === 'sm' ? 'text-xs' : 'text-xs'}
          text-gray-500 dark:text-gray-400
        `}>
          {isUnlocked && achievement.unlocked_at 
            ? new Date(achievement.unlocked_at).toLocaleDateString('mn-MN')
            : `${progress}%`
          }
        </p>
      )}
    </div>
  );
}
