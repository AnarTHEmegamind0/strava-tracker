'use client';

import { useState, useEffect } from 'react';
import { WeatherWithRecommendation } from '@/types';
import { getWeatherIconUrl } from '@/lib/weather';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

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
      <Card>
        <CardContent className={`${compact ? 'p-4' : 'p-6'}`}>
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 animate-pulse rounded-full bg-muted" />
          <div className="space-y-2 flex-1">
            <div className="h-4 w-24 animate-pulse rounded bg-muted" />
            <div className="h-3 w-32 animate-pulse rounded bg-muted" />
          </div>
        </div>
        </CardContent>
      </Card>
    );
  }

  if (error || !weather) {
    return (
      <Card>
        <CardContent className={`${compact ? 'p-4' : 'p-6'}`}>
        <div className="flex items-center gap-3 text-muted-foreground">
          <span className="text-2xl">🌡️</span>
          <div>
            <p className="font-medium">Цаг агаар</p>
            <p className="text-sm">{error || 'Мэдээлэл байхгүй'}</p>
          </div>
        </div>
        </CardContent>
      </Card>
    );
  }

  if (compact) {
    return (
      <Card>
        <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img 
              src={getWeatherIconUrl(weather.icon)} 
              alt={weather.description}
              className="w-12 h-12"
            />
            <div>
              <p className="text-xl font-bold text-card-foreground">
                {weather.temp}°C
              </p>
              <p className="text-sm text-muted-foreground">
                {weather.location}
              </p>
            </div>
          </div>
          
          <div className={`px-3 py-1 rounded-full text-sm font-medium ${
            weather.recommendation.canWorkoutOutdoor
              ? 'bg-success/10 text-success'
              : 'bg-danger/10 text-danger'
          }`}>
            {weather.recommendation.canWorkoutOutdoor ? '✓ Гадаа OK' : '✕ Дотор'}
          </div>
        </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
      <div className="flex items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <span>🌤️</span> Цаг агаар
        </CardTitle>
        <span className="text-sm text-muted-foreground">
          {weather.location}
        </span>
      </div>
      </CardHeader>
      <CardContent className="pt-0">

      <div className="flex items-center gap-4 mb-4">
        <img 
          src={getWeatherIconUrl(weather.icon, '4x')} 
          alt={weather.description}
          className="w-20 h-20"
        />
        <div>
          <p className="text-3xl font-bold text-card-foreground">
            {weather.temp}°C
          </p>
          <p className="text-muted-foreground capitalize">
            {weather.description_mn}
          </p>
          <p className="text-sm text-muted-foreground">
            Мэдрэгдэх: {weather.feels_like}°C
          </p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-4 text-center">
        <div className="rounded-lg bg-muted/70 p-2">
          <p className="text-xs text-muted-foreground">Салхи</p>
          <p className="font-semibold text-card-foreground">{weather.wind_speed} км/ц</p>
        </div>
        <div className="rounded-lg bg-muted/70 p-2">
          <p className="text-xs text-muted-foreground">Чийгшил</p>
          <p className="font-semibold text-card-foreground">{weather.humidity}%</p>
        </div>
        <div className="rounded-lg bg-muted/70 p-2">
          <p className="text-xs text-muted-foreground">Үүлшил</p>
          <p className="font-semibold text-card-foreground">{weather.clouds}%</p>
        </div>
      </div>

      <div className={`rounded-lg p-4 ${
        weather.recommendation.canWorkoutOutdoor
          ? 'border border-success/20 bg-success/10'
          : 'border border-danger/20 bg-danger/10'
      }`}>
        <div className="flex items-center gap-2 mb-2">
          <span className="text-lg">
            {weather.recommendation.canWorkoutOutdoor ? '✅' : '⚠️'}
          </span>
          <span className={`font-semibold ${
            weather.recommendation.canWorkoutOutdoor
              ? 'text-success'
              : 'text-danger'
          }`}>
            {weather.recommendation.canWorkoutOutdoor 
              ? 'Гадаа дасгал хийхэд тохиромжтой' 
              : 'Дотор дасгал хийхийг зөвлөж байна'
            }
          </span>
        </div>
        <p className="text-sm text-foreground">
          {weather.recommendation.recommendation}
        </p>
      </div>

      {weather.recommendation.warnings.length > 0 && (
        <div className="mt-4 space-y-2">
          {weather.recommendation.warnings.map((warning, i) => (
            <div key={i} className="flex items-center gap-2 text-sm text-warning">
              <span>⚠️</span>
              <span>{warning}</span>
            </div>
          ))}
        </div>
      )}

      {weather.recommendation.clothing.length > 0 && (
        <div className="mt-4">
          <p className="mb-2 text-sm text-muted-foreground">Хувцасны зөвлөмж:</p>
          <div className="flex flex-wrap gap-2">
            {weather.recommendation.clothing.map((item, i) => (
              <span 
                key={i}
                className="rounded border border-border bg-muted px-2 py-1 text-sm text-foreground"
              >
                {item}
              </span>
            ))}
          </div>
        </div>
      )}

      {weather.recommendation.bestTimeToWorkout && (
        <div className="mt-4 rounded-lg bg-blue-500/10 p-3">
          <p className="text-sm text-blue-700 dark:text-blue-300">
            ⏰ Хамгийн тохиромжтой цаг: {weather.recommendation.bestTimeToWorkout}
          </p>
        </div>
      )}
      </CardContent>
    </Card>
  );
}
