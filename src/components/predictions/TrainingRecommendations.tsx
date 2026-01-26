'use client';

import { useMemo } from 'react';
import { DBActivity } from '@/types';
import Link from 'next/link';

interface TrainingRecommendationsProps {
  activities: DBActivity[];
}

interface Recommendation {
  title: string;
  description: string;
  icon: React.ReactNode;
  priority: 'high' | 'medium' | 'low';
  type: 'workout' | 'volume' | 'recovery' | 'tip';
  action?: {
    label: string;
    href: string;
  };
}

export default function TrainingRecommendations({ activities }: TrainingRecommendationsProps) {
  const { recommendations, stats } = useMemo(() => {
    const recs: Recommendation[] = [];
    
    // Calculate stats
    const totalDistance = activities.reduce((sum, a) => sum + a.distance, 0);
    const avgDistance = totalDistance / activities.length;
    const maxDistance = Math.max(...activities.map(a => a.distance));
    const avgPace = activities.reduce((sum, a) => sum + (a.moving_time / 60) / (a.distance / 1000), 0) / activities.length;
    
    // Weekly volume (last 4 weeks)
    const fourWeeksAgo = new Date();
    fourWeeksAgo.setDate(fourWeeksAgo.getDate() - 28);
    const recentActivities = activities.filter(a => new Date(a.start_date) >= fourWeeksAgo);
    const weeklyVolume = recentActivities.reduce((sum, a) => sum + a.distance, 0) / 4;
    
    // Check run frequency
    const weeksOfData = Math.max(1, Math.ceil((Date.now() - new Date(activities[activities.length - 1]?.start_date || Date.now()).getTime()) / (7 * 24 * 60 * 60 * 1000)));
    const runsPerWeek = activities.length / weeksOfData;
    
    // Long run analysis
    const hasLongRuns = activities.some(a => a.distance >= 15000);
    const longestRun = maxDistance;
    
    // Icons
    const icons = {
      longRun: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
        </svg>
      ),
      speed: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      ),
      volume: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
      frequency: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
      recovery: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
        </svg>
      ),
      cross: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
      ),
      consistency: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      ),
    };
    
    // 1. Long Run Recommendations
    if (!hasLongRuns && avgDistance < 8000) {
      recs.push({
        title: 'Урт зайн гүйлт нэмэх',
        description: 'Долоо хоногт нэг удаа 10-15 км урт зайн гүйлт хий. Энэ нь тэсвэр тэвчээрийг сайжруулж, марафонд бэлтгэхэд тусална.',
        icon: icons.longRun,
        priority: 'high',
        type: 'workout',
      });
    } else if (longestRun < 21000) {
      recs.push({
        title: 'Урт зайгаа нэмэгдүүл',
        description: `Одоогийн хамгийн урт гүйлт: ${(longestRun / 1000).toFixed(1)} км. Хагас марафонд бэлтгэхийн тулд 18-21 км хүртэл аажмаар нэмэгдүүл.`,
        icon: icons.longRun,
        priority: 'medium',
        type: 'volume',
      });
    }
    
    // 2. Speed Work Recommendations
    const hasFastRuns = activities.some(a => {
      const pace = (a.moving_time / 60) / (a.distance / 1000);
      return pace < avgPace * 0.85;
    });
    
    if (!hasFastRuns) {
      recs.push({
        title: 'Хурдны дасгал нэмэх',
        description: 'Долоо хоногт 1 удаа интервал буюу темпо гүйлт хий. Жишээ: 400м x 8 буюу 5км темпо гүйлт.',
        icon: icons.speed,
        priority: 'high',
        type: 'workout',
        action: {
          label: 'AI Дасгалжуулагчаас асуух',
          href: '/coach',
        },
      });
    }
    
    // 3. Volume Recommendations
    if (weeklyVolume < 20000) {
      recs.push({
        title: 'Долоо хоногийн зайг нэмэгдүүл',
        description: `Одоогийн дундаж: ${(weeklyVolume / 1000).toFixed(1)} км/долоо хоног. 10км уралдаанд сайн бэлтгэхийн тулд 25-35 км/долоо хоног руу аажмаар нэмэгдүүл.`,
        icon: icons.volume,
        priority: 'medium',
        type: 'volume',
      });
    } else if (weeklyVolume < 40000) {
      recs.push({
        title: 'Эзлэхүүнээ барь',
        description: `Сайн байна! Долоо хоногт ${(weeklyVolume / 1000).toFixed(1)} км гүйж байна. Хагас марафонд бэлтгэхийн тулд 40-50 км руу аажмаар нэмэгдүүл.`,
        icon: icons.volume,
        priority: 'low',
        type: 'volume',
      });
    }
    
    // 4. Frequency Recommendations
    if (runsPerWeek < 3) {
      recs.push({
        title: 'Гүйлтийн давтамжийг нэмэгдүүл',
        description: `Долоо хоногт ${runsPerWeek.toFixed(1)} удаа гүйж байна. Хамгийн багадаа 3-4 удаа гүйхийг зорь.`,
        icon: icons.frequency,
        priority: 'high',
        type: 'workout',
      });
    }
    
    // 5. Recovery Tips
    recs.push({
      title: 'Сэргээх өдрүүдийг мартуузай',
      description: 'Хүнд дасгалын дараа 1-2 өдөр хөнгөн идэвхтэй амралт авах нь гэмтлээс сэргийлж, биеийг сэргээхэд тусална.',
      icon: icons.recovery,
      priority: 'medium',
      type: 'recovery',
    });
    
    // 6. Pace Consistency
    const paceVariance = activities.reduce((sum, a) => {
      const pace = (a.moving_time / 60) / (a.distance / 1000);
      return sum + Math.pow(pace - avgPace, 2);
    }, 0) / activities.length;
    
    if (Math.sqrt(paceVariance) > 1.5) {
      recs.push({
        title: 'Хурдны тогтвортой байдал',
        description: 'Гүйлтийн хурд маш их өөрчлөгдөж байна. Хөнгөн өдрүүдэд удаан, хүнд өдрүүдэд хурдан гүй.',
        icon: icons.consistency,
        priority: 'medium',
        type: 'tip',
      });
    }
    
    // 7. Cross Training
    recs.push({
      title: 'Хөндлөн дасгал',
      description: 'Долоо хоногт 1-2 удаа усанд сэлэх, унадаг дугуй эсвэл йога хийх нь гүйлтэнд тусална.',
      icon: icons.cross,
      priority: 'low',
      type: 'tip',
    });
    
    return {
      recommendations: recs,
      stats: {
        weeklyVolume: weeklyVolume / 1000,
        runsPerWeek,
        longestRun: longestRun / 1000,
        avgPace,
      },
    };
  }, [activities]);

  const getPriorityStyles = (priority: 'high' | 'medium' | 'low') => {
    switch (priority) {
      case 'high': 
        return {
          bg: 'bg-red-50 dark:bg-red-900/20',
          border: 'border-red-200 dark:border-red-800',
          icon: 'bg-red-100 dark:bg-red-900/40 text-red-600 dark:text-red-400',
          badge: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400',
        };
      case 'medium': 
        return {
          bg: 'bg-amber-50 dark:bg-amber-900/20',
          border: 'border-amber-200 dark:border-amber-800',
          icon: 'bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400',
          badge: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400',
        };
      case 'low': 
        return {
          bg: 'bg-green-50 dark:bg-green-900/20',
          border: 'border-green-200 dark:border-green-800',
          icon: 'bg-green-100 dark:bg-green-900/40 text-green-600 dark:text-green-400',
          badge: 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400',
        };
    }
  };

  const getPriorityLabel = (priority: 'high' | 'medium' | 'low') => {
    switch (priority) {
      case 'high': return 'Чухал';
      case 'medium': return 'Дунд';
      case 'low': return 'Санал';
    }
  };

  const getTypeLabel = (type: 'workout' | 'volume' | 'recovery' | 'tip') => {
    switch (type) {
      case 'workout': return 'Дасгал';
      case 'volume': return 'Эзлэхүүн';
      case 'recovery': return 'Сэргээлт';
      case 'tip': return 'Зөвлөгөө';
    }
  };

  const highPriority = recommendations.filter(r => r.priority === 'high');
  const otherPriority = recommendations.filter(r => r.priority !== 'high');

  return (
    <div className="space-y-4">
      {/* Current Stats Overview */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-4">
        <h3 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <svg className="w-5 h-5 text-[#FC4C02]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          Таны одоогийн статистик
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-3 text-center">
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.weeklyVolume.toFixed(1)}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">км/долоо хоног</p>
          </div>
          <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-3 text-center">
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.runsPerWeek.toFixed(1)}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">гүйлт/долоо хоног</p>
          </div>
          <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-3 text-center">
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.longestRun.toFixed(1)}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">хамгийн урт км</p>
          </div>
          <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-3 text-center">
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {Math.floor(stats.avgPace)}:{Math.round((stats.avgPace % 1) * 60).toString().padStart(2, '0')}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">дундаж хурд /км</p>
          </div>
        </div>
      </div>

      {/* High Priority Recommendations */}
      {highPriority.length > 0 && (
        <div className="space-y-3">
          <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2 px-1">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            Нэн чухал зөвлөмжүүд
          </h3>
          <div className="grid gap-3">
            {highPriority.map((rec, index) => {
              const styles = getPriorityStyles(rec.priority);
              return (
                <div
                  key={index}
                  className={`${styles.bg} ${styles.border} border rounded-2xl p-4 transition-all hover:shadow-md`}
                >
                  <div className="flex gap-4">
                    <div className={`w-12 h-12 rounded-xl ${styles.icon} flex items-center justify-center flex-shrink-0`}>
                      {rec.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <h4 className="font-semibold text-gray-900 dark:text-white">
                          {rec.title}
                        </h4>
                        <div className="flex gap-1.5 flex-shrink-0">
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${styles.badge}`}>
                            {getPriorityLabel(rec.priority)}
                          </span>
                          <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300">
                            {getTypeLabel(rec.type)}
                          </span>
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
                        {rec.description}
                      </p>
                      {rec.action && (
                        <Link
                          href={rec.action.href}
                          className="inline-flex items-center gap-1.5 text-sm font-medium text-[#FC4C02] hover:text-orange-600 transition-colors"
                        >
                          {rec.action.label}
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Other Recommendations */}
      {otherPriority.length > 0 && (
        <div className="space-y-3">
          <h3 className="font-semibold text-gray-900 dark:text-white px-1">
            Бусад зөвлөмжүүд
          </h3>
          <div className="grid sm:grid-cols-2 gap-3">
            {otherPriority.map((rec, index) => {
              const styles = getPriorityStyles(rec.priority);
              return (
                <div
                  key={index}
                  className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4 transition-all hover:shadow-md"
                >
                  <div className="flex gap-3">
                    <div className={`w-10 h-10 rounded-lg ${styles.icon} flex items-center justify-center flex-shrink-0`}>
                      {rec.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium text-gray-900 dark:text-white text-sm">
                          {rec.title}
                        </h4>
                        <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${styles.badge}`}>
                          {getPriorityLabel(rec.priority)}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2">
                        {rec.description}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* CTA for AI Coach */}
      <div className="relative overflow-hidden bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 rounded-2xl p-6 text-white">
        <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-white/10 rounded-full blur-2xl" />
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
              </svg>
            </div>
            <div>
              <h4 className="font-bold text-lg">Хувийн дасгалын төлөвлөгөө</h4>
              <p className="text-white/80 text-sm">AI Дасгалжуулагчаас зорилгодоо тохирсон төлөвлөгөө авна уу</p>
            </div>
          </div>
          <Link
            href="/coach"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white text-purple-600 rounded-xl font-semibold hover:bg-gray-100 transition-colors shadow-lg"
          >
            Асуух
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </Link>
        </div>
      </div>
    </div>
  );
}
