'use client';

import { useMemo } from 'react';
import { DBActivity } from '@/types';

interface PaceZonesProps {
  activities: DBActivity[];
}

interface PaceZone {
  name: string;
  nameMn: string;
  min: number; // min/km
  max: number;
  color: string;
  bgColor: string;
  description: string;
  benefit: string;
}

const PACE_ZONES: PaceZone[] = [
  { 
    name: 'Zone 5', 
    nameMn: 'VO2max / Спринт', 
    min: 0, 
    max: 4.0, 
    color: '#DC2626', 
    bgColor: 'bg-red-500',
    description: '< 4:00 /км',
    benefit: 'Хамгийн дээд хурд, богино хугацааны хүч'
  },
  { 
    name: 'Zone 4', 
    nameMn: 'Босго (Threshold)', 
    min: 4.0, 
    max: 5.0, 
    color: '#EA580C', 
    bgColor: 'bg-orange-500',
    description: '4:00 - 5:00 /км',
    benefit: 'Лактат босго сайжруулах'
  },
  { 
    name: 'Zone 3', 
    nameMn: 'Темп (Aerobic)', 
    min: 5.0, 
    max: 6.0, 
    color: '#CA8A04', 
    bgColor: 'bg-yellow-500',
    description: '5:00 - 6:00 /км',
    benefit: 'Аэроб хүчин чадал нэмэгдүүлэх'
  },
  { 
    name: 'Zone 2', 
    nameMn: 'Хөнгөн (Easy)', 
    min: 6.0, 
    max: 7.0, 
    color: '#16A34A', 
    bgColor: 'bg-green-500',
    description: '6:00 - 7:00 /км',
    benefit: 'Суурь тэсвэр бэхжүүлэх'
  },
  { 
    name: 'Zone 1', 
    nameMn: 'Сэргээлт (Recovery)', 
    min: 7.0, 
    max: Infinity, 
    color: '#2563EB', 
    bgColor: 'bg-blue-500',
    description: '> 7:00 /км',
    benefit: 'Сэргээлт, халаалт'
  },
];

function getPaceZone(avgSpeed: number): PaceZone | null {
  if (avgSpeed <= 0) return null;
  const paceMinPerKm = (1000 / avgSpeed) / 60;
  return PACE_ZONES.find(zone => paceMinPerKm >= zone.min && paceMinPerKm < zone.max) || PACE_ZONES[PACE_ZONES.length - 1];
}

function formatPace(avgSpeed: number): string {
  if (avgSpeed <= 0) return '-';
  const paceSecondsPerKm = 1000 / avgSpeed;
  const minutes = Math.floor(paceSecondsPerKm / 60);
  const seconds = Math.round(paceSecondsPerKm % 60);
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

function formatTime(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  if (hours > 0) {
    return `${hours}ц ${minutes}м`;
  }
  return `${minutes}м`;
}

export default function PaceZones({ activities }: PaceZonesProps) {
  // Only analyze running activities
  const runActivities = useMemo(() => 
    activities.filter(a => a.type === 'Run' && a.average_speed > 0),
    [activities]
  );

  const zoneData = useMemo(() => {
    const zoneCounts: Record<string, { count: number; distance: number; time: number }> = {};
    
    PACE_ZONES.forEach(zone => {
      zoneCounts[zone.name] = { count: 0, distance: 0, time: 0 };
    });

    runActivities.forEach(activity => {
      const zone = getPaceZone(activity.average_speed);
      if (zone) {
        zoneCounts[zone.name].count++;
        zoneCounts[zone.name].distance += activity.distance;
        zoneCounts[zone.name].time += activity.moving_time;
      }
    });

    return PACE_ZONES.map(zone => ({
      ...zone,
      count: zoneCounts[zone.name].count,
      distance: zoneCounts[zone.name].distance / 1000,
      time: zoneCounts[zone.name].time,
    }));
  }, [runActivities]);

  const totalRuns = runActivities.length;
  const totalDistance = runActivities.reduce((sum, a) => sum + a.distance, 0) / 1000;
  const totalTime = runActivities.reduce((sum, a) => sum + a.moving_time, 0);
  const avgPace = totalRuns > 0
    ? runActivities.reduce((sum, a) => sum + (1000 / a.average_speed), 0) / totalRuns
    : 0;

  // Calculate 80/20 rule compliance
  const easyZones = zoneData.filter(z => z.name === 'Zone 1' || z.name === 'Zone 2');
  const hardZones = zoneData.filter(z => z.name === 'Zone 3' || z.name === 'Zone 4' || z.name === 'Zone 5');
  const easyTime = easyZones.reduce((sum, z) => sum + z.time, 0);
  const hardTime = hardZones.reduce((sum, z) => sum + z.time, 0);
  const easyPercentage = totalTime > 0 ? (easyTime / totalTime * 100) : 0;

  if (runActivities.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          ⚡ Хурдны бүсүүд (Pace Zones)
        </h3>
        <p className="text-gray-500 dark:text-gray-400 text-center py-8">
          Гүйлтийн дасгал олдсонгүй. Strava-с синк хийнэ үү.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
          ⚡ Хурдны бүсүүд (Pace Zones)
        </h3>
        <div className="flex flex-wrap gap-4 text-sm">
          <div className="px-3 py-1 bg-gray-100 dark:bg-gray-700 rounded-lg">
            <span className="text-gray-500 dark:text-gray-400">Нийт: </span>
            <span className="font-medium text-gray-900 dark:text-white">{totalRuns} гүйлт</span>
          </div>
          <div className="px-3 py-1 bg-gray-100 dark:bg-gray-700 rounded-lg">
            <span className="text-gray-500 dark:text-gray-400">Зай: </span>
            <span className="font-medium text-gray-900 dark:text-white">{totalDistance.toFixed(1)} км</span>
          </div>
          <div className="px-3 py-1 bg-gray-100 dark:bg-gray-700 rounded-lg">
            <span className="text-gray-500 dark:text-gray-400">Дундаж: </span>
            <span className="font-medium text-gray-900 dark:text-white">{formatPace(1000 / avgPace)} /км</span>
          </div>
        </div>
      </div>

      {/* Zone Bars */}
      <div className="space-y-4">
        {zoneData.map((zone) => {
          const percentage = totalRuns > 0 ? (zone.count / totalRuns * 100) : 0;
          const timePercentage = totalTime > 0 ? (zone.time / totalTime * 100) : 0;
          
          return (
            <div key={zone.name} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-4 h-4 rounded ${zone.bgColor}`}></div>
                  <div>
                    <span className="font-medium text-gray-900 dark:text-white">{zone.nameMn}</span>
                    <span className="text-gray-500 dark:text-gray-400 text-sm ml-2">({zone.description})</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="font-semibold text-gray-900 dark:text-white">{zone.count}</span>
                  <span className="text-gray-500 dark:text-gray-400 text-sm ml-1">гүйлт</span>
                  <span className="text-gray-400 dark:text-gray-500 text-sm ml-2">({percentage.toFixed(0)}%)</span>
                </div>
              </div>
              
              {/* Progress bar */}
              <div className="h-8 bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden">
                <div 
                  className={`h-full ${zone.bgColor} flex items-center justify-between px-3 transition-all duration-500`}
                  style={{ width: `${Math.max(percentage, zone.count > 0 ? 15 : 0)}%` }}
                >
                  {zone.count > 0 && (
                    <>
                      <span className="text-white text-sm font-medium">
                        {zone.distance.toFixed(1)} км
                      </span>
                      <span className="text-white/80 text-sm">
                        {formatTime(zone.time)}
                      </span>
                    </>
                  )}
                </div>
              </div>
              
              {/* Benefit */}
              {zone.count > 0 && (
                <p className="text-xs text-gray-500 dark:text-gray-400 pl-7">
                  💪 {zone.benefit}
                </p>
              )}
            </div>
          );
        })}
      </div>

      {/* 80/20 Rule Analysis */}
      <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-green-50 dark:from-blue-900/20 dark:to-green-900/20 rounded-xl">
        <div className="flex items-center gap-3 mb-3">
          <span className="text-2xl">📊</span>
          <h4 className="font-semibold text-gray-900 dark:text-white">80/20 Дүрэм Шинжилгээ</h4>
        </div>
        
        <div className="grid grid-cols-2 gap-4 mb-3">
          <div className="text-center p-3 bg-white/50 dark:bg-gray-800/50 rounded-lg">
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
              {easyPercentage.toFixed(0)}%
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Хөнгөн (Zone 1-2)</div>
            <div className="text-xs text-gray-500 dark:text-gray-500">{formatTime(easyTime)}</div>
          </div>
          <div className="text-center p-3 bg-white/50 dark:bg-gray-800/50 rounded-lg">
            <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
              {(100 - easyPercentage).toFixed(0)}%
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Хүнд (Zone 3-5)</div>
            <div className="text-xs text-gray-500 dark:text-gray-500">{formatTime(hardTime)}</div>
          </div>
        </div>

        <div className="text-sm">
          {easyPercentage >= 75 && easyPercentage <= 85 ? (
            <p className="text-green-700 dark:text-green-400">
              ✅ Маш сайн! Таны дасгалын хуваарилалт 80/20 дүрэмд нийцэж байна. Энэ нь гэмтлээс урьдчилан сэргийлж, тэсвэр хүчийг сайжруулдаг.
            </p>
          ) : easyPercentage > 85 ? (
            <p className="text-blue-700 dark:text-blue-400">
              💡 Хөнгөн дасгал давамгайлж байна. Долоо хоногт 1-2 удаа интервал эсвэл темп гүйлт нэмэхийг зөвлөж байна.
            </p>
          ) : (
            <p className="text-orange-700 dark:text-orange-400">
              ⚠️ Хүнд дасгал хэт их байна. Илүү олон хөнгөн гүйлт (Zone 1-2) нэмж, сэргээлтэд анхаараарай.
            </p>
          )}
        </div>
      </div>

      {/* Legend */}
      <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
        <p className="text-xs text-gray-500 dark:text-gray-400">
          <span className="font-medium">Тайлбар:</span> Хурдны бүс нь дундаж хурдаар тодорхойлогдоно. 
          80/20 дүрэм гэдэг нь дасгалын 80% хөнгөн, 20% хүнд байх ёстойг хэлнэ.
        </p>
      </div>
    </div>
  );
}
