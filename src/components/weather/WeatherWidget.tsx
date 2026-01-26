'use client';

import { useState, useEffect } from 'react';
import { WeatherWithRecommendation } from '@/types';
import { getWeatherIconUrl } from '@/lib/weather';

interface WeatherWidgetProps {
  compact?: boolean;
}

export default function WeatherWidget({ compact = false }: WeatherWidgetProps) {
  const [weather, setWeather] = useState<WeatherWithRecommendation | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchWeather();
  }, []);

  const fetchWeather = async () => {
    try {
      const response = await fetch('/api/weather');
      if (response.ok) {
        const data = await response.json();
        setWeather(data.weather);
      } else {
        const data = await response.json();
        setError(data.message || 'Failed to load weather');
      }
    } catch (err) {
      console.error('Failed to fetch weather:', err);
      setError('Цаг агаар авах боломжгүй');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className={`bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm ${compact ? '' : 'p-6'}`}>
        <div className="flex items-center gap-3">
          <div className="animate-pulse bg-gray-200 dark:bg-gray-700 rounded-full w-12 h-12" />
          <div className="space-y-2 flex-1">
            <div className="animate-pulse bg-gray-200 dark:bg-gray-700 h-4 w-24 rounded" />
            <div className="animate-pulse bg-gray-200 dark:bg-gray-700 h-3 w-32 rounded" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !weather) {
    return (
      <div className={`bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm ${compact ? '' : 'p-6'}`}>
        <div className="flex items-center gap-3 text-gray-500 dark:text-gray-400">
          <span className="text-2xl">🌡️</span>
          <div>
            <p className="font-medium">Цаг агаар</p>
            <p className="text-sm">{error || 'Мэдээлэл байхгүй'}</p>
          </div>
        </div>
      </div>
    );
  }

  if (compact) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img 
              src={getWeatherIconUrl(weather.icon)} 
              alt={weather.description}
              className="w-12 h-12"
            />
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {weather.temp}°C
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {weather.location}
              </p>
            </div>
          </div>
          
          <div className={`px-3 py-1 rounded-full text-sm font-medium ${
            weather.recommendation.canWorkoutOutdoor
              ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
              : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
          }`}>
            {weather.recommendation.canWorkoutOutdoor ? '✓ Гадаа OK' : '✕ Дотор'}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
          <span>🌤️</span> Цаг агаар
        </h3>
        <span className="text-sm text-gray-500 dark:text-gray-400">
          {weather.location}
        </span>
      </div>

      {/* Main weather info */}
      <div className="flex items-center gap-4 mb-4">
        <img 
          src={getWeatherIconUrl(weather.icon, '4x')} 
          alt={weather.description}
          className="w-20 h-20"
        />
        <div>
          <p className="text-4xl font-bold text-gray-900 dark:text-white">
            {weather.temp}°C
          </p>
          <p className="text-gray-500 dark:text-gray-400 capitalize">
            {weather.description_mn}
          </p>
          <p className="text-sm text-gray-400 dark:text-gray-500">
            Мэдрэгдэх: {weather.feels_like}°C
          </p>
        </div>
      </div>

      {/* Weather details */}
      <div className="grid grid-cols-3 gap-4 mb-4 text-center">
        <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-2">
          <p className="text-xs text-gray-500 dark:text-gray-400">Салхи</p>
          <p className="font-semibold text-gray-900 dark:text-white">{weather.wind_speed} км/ц</p>
        </div>
        <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-2">
          <p className="text-xs text-gray-500 dark:text-gray-400">Чийгшил</p>
          <p className="font-semibold text-gray-900 dark:text-white">{weather.humidity}%</p>
        </div>
        <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-2">
          <p className="text-xs text-gray-500 dark:text-gray-400">Үүлшил</p>
          <p className="font-semibold text-gray-900 dark:text-white">{weather.clouds}%</p>
        </div>
      </div>

      {/* Workout recommendation */}
      <div className={`rounded-lg p-4 ${
        weather.recommendation.canWorkoutOutdoor
          ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800'
          : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800'
      }`}>
        <div className="flex items-center gap-2 mb-2">
          <span className="text-lg">
            {weather.recommendation.canWorkoutOutdoor ? '✅' : '⚠️'}
          </span>
          <span className={`font-semibold ${
            weather.recommendation.canWorkoutOutdoor
              ? 'text-green-700 dark:text-green-400'
              : 'text-red-700 dark:text-red-400'
          }`}>
            {weather.recommendation.canWorkoutOutdoor 
              ? 'Гадаа дасгал хийхэд тохиромжтой' 
              : 'Дотор дасгал хийхийг зөвлөж байна'
            }
          </span>
        </div>
        <p className="text-sm text-gray-700 dark:text-gray-300">
          {weather.recommendation.recommendation}
        </p>
      </div>

      {/* Warnings */}
      {weather.recommendation.warnings.length > 0 && (
        <div className="mt-4 space-y-2">
          {weather.recommendation.warnings.map((warning, i) => (
            <div key={i} className="flex items-center gap-2 text-sm text-yellow-700 dark:text-yellow-400">
              <span>⚠️</span>
              <span>{warning}</span>
            </div>
          ))}
        </div>
      )}

      {/* Clothing suggestions */}
      {weather.recommendation.clothing.length > 0 && (
        <div className="mt-4">
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Хувцасны зөвлөмж:</p>
          <div className="flex flex-wrap gap-2">
            {weather.recommendation.clothing.map((item, i) => (
              <span 
                key={i}
                className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-sm text-gray-700 dark:text-gray-300"
              >
                {item}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Best time to workout */}
      {weather.recommendation.bestTimeToWorkout && (
        <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <p className="text-sm text-blue-700 dark:text-blue-400">
            ⏰ Хамгийн тохиромжтой цаг: {weather.recommendation.bestTimeToWorkout}
          </p>
        </div>
      )}
    </div>
  );
}
