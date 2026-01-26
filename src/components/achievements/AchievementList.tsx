'use client';

import { useState, useEffect } from 'react';
import { AchievementWithStatus } from '@/types';
import AchievementBadge from './AchievementBadge';

interface AchievementStats {
  total: number;
  unlocked: number;
  percentage: number;
  recentUnlocks: AchievementWithStatus[];
}

const categoryNames: Record<string, string> = {
  distance: 'Зайн амжилт',
  total_distance: 'Нийт зай',
  streak: 'Дараалал',
  elevation: 'Өндөрлөг',
  milestone: 'Чухал үе',
  special: 'Онцгой',
  speed: 'Хурд',
};

const categoryIcons: Record<string, string> = {
  distance: '🏃',
  total_distance: '🌍',
  streak: '🔥',
  elevation: '⛰️',
  milestone: '🏆',
  special: '✨',
  speed: '⚡',
};

export default function AchievementList() {
  const [achievements, setAchievements] = useState<AchievementWithStatus[]>([]);
  const [byCategory, setByCategory] = useState<Record<string, AchievementWithStatus[]>>({});
  const [stats, setStats] = useState<AchievementStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'unlocked' | 'locked'>('all');

  useEffect(() => {
    fetchAchievements();
  }, []);

  const fetchAchievements = async () => {
    try {
      const response = await fetch('/api/achievements');
      if (response.ok) {
        const data = await response.json();
        setAchievements(data.achievements);
        setByCategory(data.byCategory);
        setStats(data.stats);
      }
    } catch (err) {
      console.error('Failed to fetch achievements:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredAchievements = achievements.filter(a => {
    if (selectedCategory && a.category !== selectedCategory) return false;
    if (filter === 'unlocked') return a.unlocked;
    if (filter === 'locked') return !a.unlocked;
    return true;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-[#FC4C02] border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      {stats && (
        <div className="bg-gradient-to-r from-orange-500 to-red-500 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold">Таны амжилтууд</h3>
              <p className="text-3xl font-bold mt-1">
                {stats.unlocked} / {stats.total}
              </p>
            </div>
            <div className="text-right">
              <div className="text-4xl font-bold">{stats.percentage}%</div>
              <p className="text-sm opacity-80">дууссан</p>
            </div>
          </div>
          
          {/* Progress bar */}
          <div className="mt-4 h-2 bg-white/30 rounded-full overflow-hidden">
            <div 
              className="h-full bg-white rounded-full transition-all duration-500"
              style={{ width: `${stats.percentage}%` }}
            />
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            filter === 'all'
              ? 'bg-[#FC4C02] text-white'
              : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
          }`}
        >
          Бүгд
        </button>
        <button
          onClick={() => setFilter('unlocked')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            filter === 'unlocked'
              ? 'bg-green-500 text-white'
              : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
          }`}
        >
          ✓ Авсан
        </button>
        <button
          onClick={() => setFilter('locked')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            filter === 'locked'
              ? 'bg-gray-500 text-white'
              : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
          }`}
        >
          🔒 Аваагүй
        </button>
      </div>

      {/* Category Filter */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setSelectedCategory(null)}
          className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
            selectedCategory === null
              ? 'bg-[#FC4C02] text-white'
              : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
          }`}
        >
          Бүх төрөл
        </button>
        {Object.keys(byCategory).map(category => (
          <button
            key={category}
            onClick={() => setSelectedCategory(category)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors flex items-center gap-1 ${
              selectedCategory === category
                ? 'bg-[#FC4C02] text-white'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
            }`}
          >
            <span>{categoryIcons[category]}</span>
            <span>{categoryNames[category] || category}</span>
          </button>
        ))}
      </div>

      {/* Achievement Grid */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6">
        {filteredAchievements.length === 0 ? (
          <p className="text-center text-gray-500 dark:text-gray-400 py-8">
            {filter === 'unlocked' 
              ? 'Одоогоор амжилт аваагүй байна'
              : filter === 'locked'
              ? 'Бүх амжилтыг авсан байна!'
              : 'Амжилт олдсонгүй'
            }
          </p>
        ) : (
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-4">
            {filteredAchievements.map(achievement => (
              <AchievementBadge
                key={achievement.id}
                achievement={achievement}
                size="md"
              />
            ))}
          </div>
        )}
      </div>

      {/* Recent Unlocks */}
      {stats && stats.recentUnlocks.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Сүүлд авсан амжилтууд
          </h3>
          <div className="flex flex-wrap gap-4">
            {stats.recentUnlocks.map(achievement => (
              <div 
                key={achievement.id}
                className="flex items-center gap-3 bg-gray-50 dark:bg-gray-700 rounded-lg p-3"
              >
                <span className="text-2xl">{achievement.icon}</span>
                <div>
                  <p className="font-medium text-gray-900 dark:text-white text-sm">
                    {achievement.name_mn}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {achievement.unlocked_at && new Date(achievement.unlocked_at).toLocaleDateString('mn-MN')}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
