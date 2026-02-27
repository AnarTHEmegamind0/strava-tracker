'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useApp } from '@/lib/context';
import { DBActivity, ActivityStream, ActivityLap, ActivityZone, SegmentEffort, DetailedStravaActivity } from '@/types';
import DashboardHeader from '@/components/layout/DashboardHeader';
import dynamic from 'next/dynamic';

// Dynamic import for Map (SSR disabled)
const ActivityMap = dynamic(() => import('@/components/activity/ActivityMap'), { 
  ssr: false,
  loading: () => (
    <div className="h-[400px] bg-gray-100 dark:bg-gray-700 rounded-xl flex items-center justify-center">
      <div className="text-gray-500 dark:text-gray-400">Газрын зураг ачааллаж байна...</div>
    </div>
  )
});

function formatDistance(meters: number): string {
  const km = meters / 1000;
  return `${km.toFixed(2)} км`;
}

function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  return `${minutes}:${secs.toString().padStart(2, '0')}`;
}

function formatPace(distance: number, time: number): string {
  if (distance === 0) return '-';
  const minPerKm = (time / 60) / (distance / 1000);
  const minutes = Math.floor(minPerKm);
  const seconds = Math.round((minPerKm - minutes) * 60);
  return `${minutes}:${seconds.toString().padStart(2, '0')} /км`;
}

function formatSpeed(distance: number, time: number): string {
  if (time === 0) return '-';
  const kmh = (distance / 1000) / (time / 3600);
  return `${kmh.toFixed(1)} км/ц`;
}

function getActivityIcon(type: string): string {
  const icons: Record<string, string> = {
    Run: '🏃', Ride: '🚴', Swim: '🏊', Walk: '🚶', Hike: '🥾',
    Workout: '💪', WeightTraining: '🏋️', Yoga: '🧘',
  };
  return icons[type] || '🏅';
}

function getActivityTypeName(type: string): string {
  const names: Record<string, string> = {
    Run: 'Гүйлт', Ride: 'Дугуй', Swim: 'Усанд сэлэлт', Walk: 'Алхалт',
    Hike: 'Уулын аялал', Workout: 'Дасгал', WeightTraining: 'Хүндийн дасгал', Yoga: 'Йог',
  };
  return names[type] || type;
}

function getActivityColor(type: string): string {
  const colors: Record<string, string> = {
    Run: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400',
    Ride: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
    Swim: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-400',
    Walk: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
    Hike: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
    Workout: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
  };
  return colors[type] || 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
}

interface ActivityData {
  activity: DetailedStravaActivity;
  streams: ActivityStream;
  laps: ActivityLap[];
  zones: ActivityZone[];
}

export default function ActivityDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { athlete, activities } = useApp();
  const [basicActivity, setBasicActivity] = useState<DBActivity | null>(null);
  const [detailedData, setDetailedData] = useState<ActivityData | null>(null);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'laps' | 'segments' | 'zones'>('overview');

  const activityId = params.id as string;

  useEffect(() => {
    const found = activities.find(a => a.strava_id.toString() === activityId);
    if (found) {
      setBasicActivity(found);
    }

    const fetchDetails = async () => {
      try {
        const response = await fetch(`/api/activities/${activityId}`);
        if (response.ok) {
          const data = await response.json();
          setDetailedData(data);
        }
      } catch (error) {
        console.error('Failed to fetch activity details:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDetails();
  }, [activityId, activities]);

  const handleAnalyze = async () => {
    if (!activityId) return;
    
    setAnalyzing(true);
    try {
      const response = await fetch('/api/ai/analyze-activity', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ activityId: Number(activityId) }),
      });
      
      if (response.ok) {
        const data = await response.json();
        setAnalysis(data.analysis);
      } else {
        const error = await response.json();
        console.error('Analysis error:', error);
      }
    } catch (error) {
      console.error('Analysis failed:', error);
    } finally {
      setAnalyzing(false);
    }
  };

  const activity = detailedData?.activity || basicActivity;

  if (!activity && loading) {
    return (
      <div className="min-h-screen">
        <DashboardHeader athlete={athlete} title="Дасгалын дэлгэрэнгүй" />
        <div className="p-6 flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FC4C02] mx-auto mb-4"></div>
            <p className="text-gray-500 dark:text-gray-400">Ачааллаж байна...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!activity) {
    return (
      <div className="min-h-screen">
        <DashboardHeader athlete={athlete} title="Дасгалын дэлгэрэнгүй" />
        <div className="p-6 flex items-center justify-center h-64">
          <div className="text-center text-gray-500 dark:text-gray-400">
            <div className="text-4xl mb-4">🔍</div>
            <p>Дасгал олдсонгүй</p>
            <button onClick={() => router.back()} className="mt-4 px-4 py-2 bg-[#FC4C02] text-white rounded-lg hover:bg-[#e34402] transition-colors">
              Буцах
            </button>
          </div>
        </div>
      </div>
    );
  }

  const startDate = (activity as DetailedStravaActivity).start_date_local || (activity as DetailedStravaActivity).start_date || (activity as DBActivity).start_date;
  const date = new Date(startDate);
  const formattedDate = date.toLocaleDateString('mn-MN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  const formattedTime = date.toLocaleTimeString('mn-MN', { hour: '2-digit', minute: '2-digit' });
  const showPace = ['Run', 'Walk', 'Hike'].includes(activity.type);
  const distance = (activity as DetailedStravaActivity).distance || (activity as DBActivity).distance;
  const movingTime = (activity as DetailedStravaActivity).moving_time || (activity as DBActivity).moving_time;
  const elevationGain = (activity as DetailedStravaActivity).total_elevation_gain || (activity as DBActivity).elevation_gain;

  return (
    <div className="min-h-screen">
      <DashboardHeader athlete={athlete} title="Дасгалын дэлгэрэнгүй" />
      
      <div className="p-6 max-w-6xl mx-auto">
        {/* Back Button */}
        <button onClick={() => router.back()} className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-6 transition-colors">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Буцах
        </button>

        {/* Activity Header */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-6 mb-6">
          <div className="flex items-start gap-4">
            <span className="text-5xl">{getActivityIcon(activity.type)}</span>
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{activity.name}</h1>
              <div className="flex flex-wrap items-center gap-3 mt-2">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getActivityColor(activity.type)}`}>
                  {getActivityTypeName(activity.type)}
                </span>
                <span className="text-gray-500 dark:text-gray-400">{formattedDate}</span>
                <span className="text-gray-500 dark:text-gray-400">{formattedTime}</span>
                {(activity as DetailedStravaActivity).device_name && (
                  <span className="text-xs text-gray-400 dark:text-gray-500">
                    📱 {(activity as DetailedStravaActivity).device_name}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Map */}
        {(detailedData?.streams?.latlng || (activity as DetailedStravaActivity).map?.summary_polyline) && (
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-4 mb-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">🗺️ Маршрут</h3>
            <ActivityMap 
              latlng={detailedData?.streams?.latlng} 
              polyline={(activity as DetailedStravaActivity).map?.summary_polyline}
            />
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <StatCard icon="📏" label="Зай" value={formatDistance(distance)} color="blue" />
          <StatCard icon="⏱️" label="Хугацаа" value={formatDuration(movingTime)} color="green" />
          <StatCard icon="⚡" label={showPace ? 'Pace' : 'Хурд'} value={showPace ? formatPace(distance, movingTime) : formatSpeed(distance, movingTime)} color="orange" />
          <StatCard icon="⛰️" label="Өндөрлөг" value={`${Math.round(elevationGain)} м`} color="purple" />
        </div>

        {/* Tabs */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm mb-6">
          <div className="flex border-b border-gray-200 dark:border-gray-700 overflow-x-auto">
            <TabButton active={activeTab === 'overview'} onClick={() => setActiveTab('overview')}>Ерөнхий</TabButton>
            {detailedData?.laps && detailedData.laps.length > 0 && (
              <TabButton active={activeTab === 'laps'} onClick={() => setActiveTab('laps')}>
                Lap ({detailedData.laps.length})
              </TabButton>
            )}
            {detailedData?.activity?.segment_efforts && detailedData.activity.segment_efforts.length > 0 && (
              <TabButton active={activeTab === 'segments'} onClick={() => setActiveTab('segments')}>
                Segment ({detailedData.activity.segment_efforts.length})
              </TabButton>
            )}
            {detailedData?.zones && detailedData.zones.length > 0 && (
              <TabButton active={activeTab === 'zones'} onClick={() => setActiveTab('zones')}>HR Zones</TabButton>
            )}
          </div>

          <div className="p-6">
            {activeTab === 'overview' && (
              <OverviewTab 
                activity={activity as DetailedStravaActivity} 
                basicActivity={basicActivity}
              />
            )}
            {activeTab === 'laps' && detailedData?.laps && (
              <LapsTab laps={detailedData.laps} activityType={activity.type} />
            )}
            {activeTab === 'segments' && detailedData?.activity?.segment_efforts && (
              <SegmentsTab segments={detailedData.activity.segment_efforts} />
            )}
            {activeTab === 'zones' && detailedData?.zones && (
              <ZonesTab zones={detailedData.zones} />
            )}
          </div>
        </div>

        {/* AI Analysis Section */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              🤖 AI Шинжилгээ
            </h3>
            <button onClick={handleAnalyze} disabled={analyzing} className="px-4 py-2 bg-[#FC4C02] text-white rounded-lg hover:bg-[#e34402] disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium flex items-center gap-2">
              {analyzing ? (
                <>
                  <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Шинжилж байна...
                </>
              ) : (
                '🔬 Шинжлэх'
              )}
            </button>
          </div>
          
          {analysis ? (
            <div className="bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 rounded-xl p-4">
              <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{analysis}</p>
            </div>
          ) : (
            <p className="text-gray-500 dark:text-gray-400 text-sm">
              &quot;Шинжлэх&quot; товчийг дарж энэ дасгалын талаар AI зөвлөмж аваарай.
            </p>
          )}
        </div>

        {/* View on Strava */}
        <div className="text-center">
          <a href={`https://www.strava.com/activities/${activityId}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-6 py-3 bg-[#FC4C02] text-white rounded-lg hover:bg-[#e34402] transition-colors font-medium">
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M15.387 17.944l-2.089-4.116h-3.065L15.387 24l5.15-10.172h-3.066m-7.008-5.599l2.836 5.598h4.172L10.463 0l-7 13.828h4.169" />
            </svg>
            Strava дээр харах
          </a>
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon, label, value, color }: { icon: string; label: string; value: string; color: string }) {
  const bgColors: Record<string, string> = {
    blue: 'bg-blue-100 dark:bg-blue-900/30',
    green: 'bg-green-100 dark:bg-green-900/30',
    orange: 'bg-orange-100 dark:bg-orange-900/30',
    purple: 'bg-purple-100 dark:bg-purple-900/30',
  };
  
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm">
      <div className="flex items-center gap-3 mb-2">
        <div className={`p-2 ${bgColors[color]} rounded-lg text-xl`}>{icon}</div>
        <p className="text-sm text-gray-500 dark:text-gray-400">{label}</p>
      </div>
      <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
    </div>
  );
}

function TabButton({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={`px-6 py-4 text-sm font-medium transition-colors whitespace-nowrap ${
        active 
          ? 'text-[#FC4C02] border-b-2 border-[#FC4C02]' 
          : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
      }`}
    >
      {children}
    </button>
  );
}

function OverviewTab({ activity, basicActivity }: { activity: DetailedStravaActivity; basicActivity: DBActivity | null }) {
  const calories = activity.calories || basicActivity?.calories || 0;
  const avgHr = activity.average_heartrate;
  const maxHr = activity.max_heartrate;
  const avgCadence = activity.average_cadence;
  const avgWatts = activity.average_watts;
  const maxWatts = activity.max_watts;
  const gear = activity.gear;
  const prCount = activity.pr_count || 0;
  const kudos = activity.kudos_count || 0;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {calories > 0 && (
          <div><p className="text-sm text-gray-500 dark:text-gray-400">Калори</p><p className="text-xl font-semibold text-gray-900 dark:text-white">{Math.round(calories)} kcal</p></div>
        )}
        {avgHr && (
          <div><p className="text-sm text-gray-500 dark:text-gray-400">Дундаж HR</p><p className="text-xl font-semibold text-gray-900 dark:text-white">{Math.round(avgHr)} bpm</p></div>
        )}
        {maxHr && (
          <div><p className="text-sm text-gray-500 dark:text-gray-400">Макс HR</p><p className="text-xl font-semibold text-gray-900 dark:text-white">{Math.round(maxHr)} bpm</p></div>
        )}
        {avgCadence && (
          <div><p className="text-sm text-gray-500 dark:text-gray-400">Cadence</p><p className="text-xl font-semibold text-gray-900 dark:text-white">{Math.round(avgCadence)} spm</p></div>
        )}
        {avgWatts && (
          <div><p className="text-sm text-gray-500 dark:text-gray-400">Дундаж Power</p><p className="text-xl font-semibold text-gray-900 dark:text-white">{Math.round(avgWatts)} W</p></div>
        )}
        {maxWatts && (
          <div><p className="text-sm text-gray-500 dark:text-gray-400">Макс Power</p><p className="text-xl font-semibold text-gray-900 dark:text-white">{Math.round(maxWatts)} W</p></div>
        )}
      </div>

      {(prCount > 0 || kudos > 0) && (
        <div className="flex gap-4">
          {prCount > 0 && (
            <div className="flex items-center gap-2 px-4 py-2 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg">
              <span className="text-2xl">🏆</span>
              <p className="text-sm text-yellow-800 dark:text-yellow-400 font-medium">{prCount} PR</p>
            </div>
          )}
          {kudos > 0 && (
            <div className="flex items-center gap-2 px-4 py-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
              <span className="text-2xl">👏</span>
              <p className="text-sm text-orange-800 dark:text-orange-400 font-medium">{kudos} Kudos</p>
            </div>
          )}
        </div>
      )}

      {gear && (
        <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
          <p className="text-sm text-gray-500 dark:text-gray-400">Тоног төхөөрөмж</p>
          <p className="font-medium text-gray-900 dark:text-white">{gear.name}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400">Нийт: {(gear.distance / 1000).toFixed(0)} км</p>
        </div>
      )}

      {activity.splits_metric && activity.splits_metric.length > 0 && (
        <div>
          <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Километр тус бүрийн хурд</h4>
          <div className="space-y-2">
            {activity.splits_metric.slice(0, 10).map((split, i) => {
              const pace = split.moving_time / 60;
              const paceMin = Math.floor(pace);
              const paceSec = Math.round((pace - paceMin) * 60);
              return (
                <div key={i} className="flex items-center gap-4">
                  <span className="w-8 text-sm text-gray-500 dark:text-gray-400">{split.split} км</span>
                  <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-6 overflow-hidden">
                    <div className="bg-[#FC4C02] h-full rounded-full flex items-center justify-end px-2" style={{ width: `${Math.min(100, (5 / pace) * 100)}%` }}>
                      <span className="text-xs text-white font-medium">{paceMin}:{paceSec.toString().padStart(2, '0')}</span>
                    </div>
                  </div>
                  {split.average_heartrate && <span className="text-sm text-gray-500 dark:text-gray-400">❤️ {Math.round(split.average_heartrate)}</span>}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

function LapsTab({ laps, activityType }: { laps: ActivityLap[]; activityType: string }) {
  const showPace = ['Run', 'Walk', 'Hike'].includes(activityType);
  const fastestLap = laps.reduce((min, lap) => lap.average_speed > min.average_speed ? lap : min, laps[0]);
  const slowestLap = laps.reduce((max, lap) => lap.average_speed < max.average_speed ? lap : max, laps[0]);

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-gray-700">
            <th className="pb-3 font-medium">Lap</th>
            <th className="pb-3 font-medium">Зай</th>
            <th className="pb-3 font-medium">Хугацаа</th>
            <th className="pb-3 font-medium">{showPace ? 'Pace' : 'Хурд'}</th>
            <th className="pb-3 font-medium">Өндөрлөг</th>
            {laps[0]?.average_heartrate && <th className="pb-3 font-medium">HR</th>}
          </tr>
        </thead>
        <tbody>
          {laps.map((lap, i) => {
            const isFastest = lap.id === fastestLap.id;
            const isSlowest = lap.id === slowestLap.id && laps.length > 1;
            return (
              <tr key={lap.id} className={`border-b border-gray-100 dark:border-gray-700/50 ${isFastest ? 'bg-green-50 dark:bg-green-900/20' : isSlowest ? 'bg-red-50 dark:bg-red-900/20' : ''}`}>
                <td className="py-3 font-medium text-gray-900 dark:text-white">{i + 1}{isFastest && ' 🏆'}{isSlowest && ' 🐢'}</td>
                <td className="py-3 text-gray-900 dark:text-white">{formatDistance(lap.distance)}</td>
                <td className="py-3 text-gray-900 dark:text-white">{formatDuration(lap.moving_time)}</td>
                <td className="py-3 text-gray-900 dark:text-white">{showPace ? formatPace(lap.distance, lap.moving_time) : formatSpeed(lap.distance, lap.moving_time)}</td>
                <td className="py-3 text-gray-900 dark:text-white">{Math.round(lap.total_elevation_gain)} м</td>
                {lap.average_heartrate && <td className="py-3 text-gray-900 dark:text-white">{Math.round(lap.average_heartrate)} bpm</td>}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function SegmentsTab({ segments }: { segments: SegmentEffort[] }) {
  return (
    <div className="space-y-4">
      {segments.map((segment) => (
        <div key={segment.id} className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
          <div className="flex items-start justify-between">
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white">{segment.name}</h4>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {formatDistance(segment.distance)} • {formatDuration(segment.moving_time)}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">{segment.segment.city}, {segment.segment.country}</p>
            </div>
            <div className="text-right flex gap-2">
              {segment.pr_rank && (
                <span className={`px-2 py-1 rounded text-xs font-bold ${segment.pr_rank === 1 ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400' : segment.pr_rank === 2 ? 'bg-gray-200 text-gray-800 dark:bg-gray-600 dark:text-gray-200' : segment.pr_rank === 3 ? 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400' : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'}`}>
                  PR #{segment.pr_rank}
                </span>
              )}
              {segment.kom_rank && (
                <span className="px-2 py-1 bg-[#FC4C02] text-white rounded text-xs font-bold">KOM #{segment.kom_rank}</span>
              )}
            </div>
          </div>
          <div className="mt-3 flex gap-4 text-sm text-gray-500 dark:text-gray-400">
            <span>Дундаж налуу: {segment.segment.average_grade.toFixed(1)}%</span>
            <span>Макс налуу: {segment.segment.maximum_grade.toFixed(1)}%</span>
            {segment.average_heartrate && <span>HR: {Math.round(segment.average_heartrate)} bpm</span>}
            {segment.average_watts && <span>Power: {Math.round(segment.average_watts)} W</span>}
          </div>
        </div>
      ))}
    </div>
  );
}

function ZonesTab({ zones }: { zones: ActivityZone[] }) {
  const hrZone = zones.find(z => z.type === 'heartrate');
  const powerZone = zones.find(z => z.type === 'power');
  const zoneLabels = ['Амралт', 'Хөнгөн', 'Дунд', 'Хүнд', 'Макс'];
  const zoneColors = ['bg-gray-400', 'bg-blue-400', 'bg-green-400', 'bg-yellow-400', 'bg-red-500'];

  const renderZone = (zone: ActivityZone, title: string) => {
    const totalTime = zone.distribution_buckets.reduce((sum, b) => sum + b.time, 0);
    return (
      <div>
        <h4 className="font-semibold text-gray-900 dark:text-white mb-4">{title}</h4>
        <div className="space-y-3">
          {zone.distribution_buckets.map((bucket, i) => {
            const percentage = totalTime > 0 ? (bucket.time / totalTime) * 100 : 0;
            const minutes = Math.floor(bucket.time / 60);
            const seconds = bucket.time % 60;
            return (
              <div key={i} className="flex items-center gap-4">
                <div className="w-20 text-sm text-gray-500 dark:text-gray-400">Zone {i + 1}<br /><span className="text-xs">{zoneLabels[i] || ''}</span></div>
                <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-8 overflow-hidden">
                  <div className={`${zoneColors[i]} h-full rounded-full flex items-center px-3`} style={{ width: `${Math.max(percentage, 5)}%` }}>
                    <span className="text-xs text-white font-medium">{percentage.toFixed(1)}%</span>
                  </div>
                </div>
                <div className="w-20 text-right text-sm text-gray-900 dark:text-white">{minutes}:{seconds.toString().padStart(2, '0')}</div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-8">
      {hrZone && renderZone(hrZone, '❤️ Зүрхний цохилт (Heart Rate Zones)')}
      {powerZone && renderZone(powerZone, '⚡ Чадал (Power Zones)')}
      {!hrZone && !powerZone && (
        <p className="text-gray-500 dark:text-gray-400 text-center py-8">Zone мэдээлэл байхгүй байна.</p>
      )}
    </div>
  );
}
