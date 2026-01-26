'use client';

import { useMemo, useState } from 'react';
import { DBActivity } from '@/types';

interface RacePredictionsProps {
  activities: DBActivity[];
}

interface RaceDistance {
  distance: number;
  label: string;
  shortLabel: string;
  emoji: string;
  color: string;
}

interface PredictionResult {
  distance: number;
  label: string;
  shortLabel: string;
  emoji: string;
  color: string;
  predictedTime: number;
  predictedPace: number;
  confidence: 'high' | 'medium' | 'low';
  basedOn: {
    distance: number;
    time: number;
    name: string;
    date: string;
  } | null;
}

const RACE_DISTANCES: RaceDistance[] = [
  { distance: 5000, label: '5 километр', shortLabel: '5K', emoji: '🏃', color: 'from-green-500 to-emerald-600' },
  { distance: 10000, label: '10 километр', shortLabel: '10K', emoji: '🏃‍♂️', color: 'from-blue-500 to-cyan-600' },
  { distance: 15000, label: '15 километр', shortLabel: '15K', emoji: '🏃‍♀️', color: 'from-purple-500 to-violet-600' },
  { distance: 20000, label: '20 километр', shortLabel: '20K', emoji: '🔥', color: 'from-pink-500 to-rose-600' },
  { distance: 21097.5, label: 'Хагас марафон', shortLabel: 'HM', emoji: '🏅', color: 'from-orange-500 to-amber-600' },
  { distance: 42195, label: 'Бүтэн марафон', shortLabel: 'FM', emoji: '🏆', color: 'from-red-500 to-orange-600' },
];

function riegelFormula(time1: number, distance1: number, distance2: number): number {
  return time1 * Math.pow(distance2 / distance1, 1.06);
}

function findBestEffort(
  activities: DBActivity[],
  minDistance: number,
  maxDistance: number
): DBActivity | null {
  const qualifying = activities.filter(
    a => a.distance >= minDistance && a.distance <= maxDistance
  );
  if (qualifying.length === 0) return null;
  return qualifying.reduce((best, current) => {
    const bestPace = best.moving_time / best.distance;
    const currentPace = current.moving_time / current.distance;
    return currentPace < bestPace ? current : best;
  });
}

function calculateConfidence(
  referenceDistance: number,
  targetDistance: number
): 'high' | 'medium' | 'low' {
  const ratio = referenceDistance / targetDistance;
  if (ratio >= 0.7 && ratio <= 1.5) return 'high';
  if (ratio >= 0.4 && ratio <= 2.5) return 'medium';
  return 'low';
}

export default function RacePredictions({ activities }: RacePredictionsProps) {
  const [selectedPrediction, setSelectedPrediction] = useState<PredictionResult | null>(null);

  const predictions = useMemo(() => {
    const results: PredictionResult[] = [];
    const referenceEfforts = [
      findBestEffort(activities, 3000, 6000),
      findBestEffort(activities, 8000, 12000),
      findBestEffort(activities, 13000, 18000),
      findBestEffort(activities, 19000, 25000),
    ].filter(Boolean) as DBActivity[];
    
    if (referenceEfforts.length === 0) {
      const bestRun = activities.reduce((best, current) => {
        const bestPace = best.moving_time / best.distance;
        const currentPace = current.moving_time / current.distance;
        return currentPace < bestPace ? current : best;
      });
      referenceEfforts.push(bestRun);
    }
    
    for (const race of RACE_DISTANCES) {
      let bestReference = referenceEfforts[0];
      let bestConfidence: 'high' | 'medium' | 'low' = 'low';
      
      for (const ref of referenceEfforts) {
        const confidence = calculateConfidence(ref.distance, race.distance);
        if (
          confidence === 'high' ||
          (confidence === 'medium' && bestConfidence === 'low') ||
          (confidence === bestConfidence && 
           Math.abs(ref.distance - race.distance) < Math.abs(bestReference.distance - race.distance))
        ) {
          bestReference = ref;
          bestConfidence = confidence;
        }
      }
      
      const predictedTime = riegelFormula(
        bestReference.moving_time,
        bestReference.distance,
        race.distance
      );
      
      const predictedPace = (predictedTime / 60) / (race.distance / 1000);
      
      results.push({
        distance: race.distance,
        label: race.label,
        shortLabel: race.shortLabel,
        emoji: race.emoji,
        color: race.color,
        predictedTime,
        predictedPace,
        confidence: bestConfidence,
        basedOn: {
          distance: bestReference.distance,
          time: bestReference.moving_time,
          name: bestReference.name,
          date: bestReference.start_date,
        },
      });
    }
    
    return results;
  }, [activities]);

  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const formatPace = (minPerKm: number): string => {
    const minutes = Math.floor(minPerKm);
    const seconds = Math.round((minPerKm - minutes) * 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const getConfidenceBadge = (confidence: 'high' | 'medium' | 'low') => {
    const styles = {
      high: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 ring-green-500/20',
      medium: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400 ring-yellow-500/20',
      low: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 ring-red-500/20',
    };
    const labels = { high: 'Өндөр', medium: 'Дунд', low: 'Бага' };
    const icons = {
      high: (
        <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
        </svg>
      ),
      medium: (
        <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
        </svg>
      ),
      low: (
        <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
        </svg>
      ),
    };
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ring-1 ring-inset ${styles[confidence]}`}>
        {icons[confidence]}
        {labels[confidence]}
      </span>
    );
  };

  return (
    <div className="space-y-4">
      {/* Main Prediction Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {predictions.map((prediction, index) => (
          <div
            key={prediction.distance}
            onClick={() => setSelectedPrediction(selectedPrediction?.distance === prediction.distance ? null : prediction)}
            className={`group relative overflow-hidden bg-white dark:bg-gray-800 rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer ${
              selectedPrediction?.distance === prediction.distance ? 'ring-2 ring-[#FC4C02] shadow-xl' : ''
            }`}
            style={{ animationDelay: `${index * 50}ms` }}
          >
            {/* Gradient Header */}
            <div className={`bg-gradient-to-r ${prediction.color} p-4 relative overflow-hidden`}>
              <div className="absolute -right-4 -top-4 w-20 h-20 bg-white/10 rounded-full blur-xl" />
              <div className="relative z-10 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{prediction.emoji}</span>
                  <div>
                    <h3 className="font-bold text-white text-lg">{prediction.shortLabel}</h3>
                    <p className="text-white/80 text-xs">{prediction.label}</p>
                  </div>
                </div>
                {getConfidenceBadge(prediction.confidence)}
              </div>
            </div>

            {/* Content */}
            <div className="p-4">
              {/* Time */}
              <div className="mb-4">
                <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">
                  Таамагласан хугацаа
                </p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">
                  {formatTime(prediction.predictedTime)}
                </p>
              </div>

              {/* Pace */}
              <div className="flex items-center justify-between py-3 border-t border-gray-100 dark:border-gray-700">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                    <svg className="w-4 h-4 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Хурд</p>
                    <p className="font-semibold text-gray-900 dark:text-white">{formatPace(prediction.predictedPace)} /км</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-500 dark:text-gray-400">Зай</p>
                  <p className="font-semibold text-gray-900 dark:text-white">{(prediction.distance / 1000).toFixed(1)} км</p>
                </div>
              </div>

              {/* Expand indicator */}
              <div className={`flex items-center justify-center pt-2 text-xs text-gray-400 dark:text-gray-500 transition-opacity ${
                selectedPrediction?.distance === prediction.distance ? 'opacity-0' : 'opacity-100 group-hover:opacity-100'
              }`}>
                <span>Дэлгэрэнгүй харах</span>
                <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>

            {/* Expanded Details */}
            {selectedPrediction?.distance === prediction.distance && prediction.basedOn && (
              <div className="px-4 pb-4 border-t border-gray-100 dark:border-gray-700 pt-3 animate-fadeIn">
                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-3">
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
                    Суурь гүйлт
                  </p>
                  <p className="font-medium text-gray-900 dark:text-white truncate">
                    {prediction.basedOn.name}
                  </p>
                  <div className="flex items-center gap-4 mt-2 text-sm">
                    <span className="text-gray-500 dark:text-gray-400">
                      {(prediction.basedOn.distance / 1000).toFixed(2)} км
                    </span>
                    <span className="text-gray-300 dark:text-gray-600">•</span>
                    <span className="text-gray-500 dark:text-gray-400">
                      {formatTime(prediction.basedOn.time)}
                    </span>
                    <span className="text-gray-300 dark:text-gray-600">•</span>
                    <span className="text-gray-500 dark:text-gray-400">
                      {new Date(prediction.basedOn.date).toLocaleDateString('mn-MN')}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Comparison Table */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-100 dark:border-gray-700">
          <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <svg className="w-5 h-5 text-[#FC4C02]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
            </svg>
            Бүх таамаглалын харьцуулалт
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-700/50">
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Зай</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Хугацаа</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Хурд</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Итгэлцүүр</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {predictions.map((p) => (
                <tr key={p.distance} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span>{p.emoji}</span>
                      <span className="font-medium text-gray-900 dark:text-white">{p.label}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 font-mono font-semibold text-gray-900 dark:text-white">
                    {formatTime(p.predictedTime)}
                  </td>
                  <td className="px-4 py-3 text-gray-600 dark:text-gray-300">
                    {formatPace(p.predictedPace)} /км
                  </td>
                  <td className="px-4 py-3">
                    {getConfidenceBadge(p.confidence)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
