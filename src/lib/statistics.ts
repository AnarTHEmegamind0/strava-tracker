import { DBActivity, WeeklyStats, ActivityTypeBreakdown, PersonalRecord } from '@/types';
import { startOfWeek, endOfWeek, startOfMonth, endOfMonth, subWeeks, format, differenceInDays } from 'date-fns';

// Calculate weekly stats
export function calculateWeeklyStats(activities: DBActivity[], weekStart: Date): WeeklyStats {
  const weekEnd = endOfWeek(weekStart, { weekStartsOn: 1 });
  
  const weekActivities = activities.filter(a => {
    const date = new Date(a.start_date);
    return date >= weekStart && date <= weekEnd;
  });

  const totalDistance = weekActivities.reduce((sum, a) => sum + a.distance, 0);
  const totalTime = weekActivities.reduce((sum, a) => sum + a.moving_time, 0);
  const totalElevation = weekActivities.reduce((sum, a) => sum + a.elevation_gain, 0);
  const activityCount = weekActivities.length;
  
  // Calculate average pace (min/km) from activities that have distance
  const runActivities = weekActivities.filter(a => a.distance > 0 && (a.type === 'Run' || a.type === 'Walk'));
  const avgPace = runActivities.length > 0
    ? runActivities.reduce((sum, a) => sum + (a.moving_time / 60) / (a.distance / 1000), 0) / runActivities.length
    : 0;

  return {
    week_start: format(weekStart, 'yyyy-MM-dd'),
    total_distance: totalDistance,
    total_time: totalTime,
    total_elevation: totalElevation,
    activity_count: activityCount,
    avg_pace: avgPace,
  };
}

// Get stats for last N weeks
export function getWeeklyStatsHistory(activities: DBActivity[], weeks: number = 8): WeeklyStats[] {
  const stats: WeeklyStats[] = [];
  
  for (let i = 0; i < weeks; i++) {
    const weekStart = startOfWeek(subWeeks(new Date(), i), { weekStartsOn: 1 });
    stats.push(calculateWeeklyStats(activities, weekStart));
  }
  
  return stats.reverse();
}

// Calculate monthly stats
export function calculateMonthlyStats(activities: DBActivity[], date: Date = new Date()) {
  const monthStart = startOfMonth(date);
  const monthEnd = endOfMonth(date);
  
  const monthActivities = activities.filter(a => {
    const actDate = new Date(a.start_date);
    return actDate >= monthStart && actDate <= monthEnd;
  });

  const totalDistance = monthActivities.reduce((sum, a) => sum + a.distance, 0);
  const totalTime = monthActivities.reduce((sum, a) => sum + a.moving_time, 0);
  const totalElevation = monthActivities.reduce((sum, a) => sum + a.elevation_gain, 0);
  const activityCount = monthActivities.length;

  return {
    month: format(date, 'yyyy-MM'),
    total_distance: totalDistance,
    total_time: totalTime,
    total_elevation: totalElevation,
    activity_count: activityCount,
  };
}

// Activity type breakdown
export function getActivityTypeBreakdown(activities: DBActivity[]): ActivityTypeBreakdown[] {
  const typeMap = new Map<string, { count: number; distance: number; time: number }>();
  
  activities.forEach(a => {
    const existing = typeMap.get(a.type) || { count: 0, distance: 0, time: 0 };
    typeMap.set(a.type, {
      count: existing.count + 1,
      distance: existing.distance + a.distance,
      time: existing.time + a.moving_time,
    });
  });

  const total = activities.length;
  const breakdown: ActivityTypeBreakdown[] = [];
  
  typeMap.forEach((value, type) => {
    breakdown.push({
      type,
      count: value.count,
      distance: value.distance,
      time: value.time,
      percentage: total > 0 ? (value.count / total) * 100 : 0,
    });
  });

  return breakdown.sort((a, b) => b.count - a.count);
}

// Personal records
export function getPersonalRecords(activities: DBActivity[]): PersonalRecord[] {
  const records: PersonalRecord[] = [];
  
  if (activities.length === 0) return records;

  // Filter only running activities
  const runs = activities.filter(a => a.type === 'Run' && a.distance >= 1000);

  // Distance-based best times (5km, 10km, 15km, 20km)
  const distanceTargets = [
    { distance: 5000, label: '5км хамгийн хурдан' },
    { distance: 10000, label: '10км хамгийн хурдан' },
    { distance: 15000, label: '15км хамгийн хурдан' },
    { distance: 21097, label: 'Хагас марафон' },
  ];

  distanceTargets.forEach(target => {
    // Find runs that are at least the target distance
    const qualifyingRuns = runs.filter(a => a.distance >= target.distance);
    
    if (qualifyingRuns.length > 0) {
      // Calculate estimated time for exact distance based on pace
      const fastestRun = qualifyingRuns.reduce((fast, a) => {
        // Calculate time it would take to run exactly the target distance at this activity's pace
        const pacePerMeter = a.moving_time / a.distance;
        const estimatedTime = pacePerMeter * target.distance;
        
        const fastPacePerMeter = fast.moving_time / fast.distance;
        const fastEstimatedTime = fastPacePerMeter * target.distance;
        
        return estimatedTime < fastEstimatedTime ? a : fast;
      }, qualifyingRuns[0]);
      
      // Calculate the estimated time for exact distance
      const pacePerMeter = fastestRun.moving_time / fastestRun.distance;
      const estimatedTime = pacePerMeter * target.distance;
      
      records.push({
        type: target.label,
        value: estimatedTime, // Time in seconds
        activity_name: fastestRun.name,
        date: fastestRun.start_date,
      });
    }
  });

  // Longest distance
  const longestDistance = activities.reduce((max, a) => a.distance > max.distance ? a : max, activities[0]);
  records.push({
    type: 'Хамгийн урт зай',
    value: longestDistance.distance,
    activity_name: longestDistance.name,
    date: longestDistance.start_date,
  });

  // Most elevation
  const mostElevation = activities.reduce((max, a) => a.elevation_gain > max.elevation_gain ? a : max, activities[0]);
  records.push({
    type: 'Хамгийн их өндөрлөг',
    value: mostElevation.elevation_gain,
    activity_name: mostElevation.name,
    date: mostElevation.start_date,
  });

  // Longest duration
  const longestDuration = activities.reduce((max, a) => a.moving_time > max.moving_time ? a : max, activities[0]);
  records.push({
    type: 'Хамгийн урт хугацаа',
    value: longestDuration.moving_time,
    activity_name: longestDuration.name,
    date: longestDuration.start_date,
  });

  // Fastest overall pace (for runs with at least 1km)
  if (runs.length > 0) {
    const fastestRun = runs.reduce((fast, a) => {
      const pace = (a.moving_time / 60) / (a.distance / 1000);
      const fastPace = (fast.moving_time / 60) / (fast.distance / 1000);
      return pace < fastPace ? a : fast;
    }, runs[0]);
    
    const pace = (fastestRun.moving_time / 60) / (fastestRun.distance / 1000);
    records.push({
      type: 'Хамгийн хурдан хурд',
      value: pace,
      activity_name: fastestRun.name,
      date: fastestRun.start_date,
    });
  }

  return records;
}

// Week over week comparison
export function getWeekComparison(activities: DBActivity[]) {
  const thisWeekStart = startOfWeek(new Date(), { weekStartsOn: 1 });
  const lastWeekStart = startOfWeek(subWeeks(new Date(), 1), { weekStartsOn: 1 });
  
  const thisWeek = calculateWeeklyStats(activities, thisWeekStart);
  const lastWeek = calculateWeeklyStats(activities, lastWeekStart);

  const calcChange = (current: number, previous: number) => {
    if (previous === 0) return current > 0 ? 100 : 0;
    return ((current - previous) / previous) * 100;
  };

  return {
    thisWeek,
    lastWeek,
    changes: {
      distance: calcChange(thisWeek.total_distance, lastWeek.total_distance),
      time: calcChange(thisWeek.total_time, lastWeek.total_time),
      elevation: calcChange(thisWeek.total_elevation, lastWeek.total_elevation),
      count: thisWeek.activity_count - lastWeek.activity_count,
    },
  };
}

// Goal progress calculation
export function calculateGoalProgress(
  activities: DBActivity[],
  goalType: 'weekly' | 'monthly',
  metric: 'distance' | 'time' | 'count' | 'elevation',
  activityType: string | null
) {
  const now = new Date();
  let startDate: Date;
  let endDate: Date;
  
  if (goalType === 'weekly') {
    startDate = startOfWeek(now, { weekStartsOn: 1 });
    endDate = endOfWeek(now, { weekStartsOn: 1 });
  } else {
    startDate = startOfMonth(now);
    endDate = endOfMonth(now);
  }

  let filteredActivities = activities.filter(a => {
    const date = new Date(a.start_date);
    return date >= startDate && date <= endDate;
  });

  if (activityType && activityType !== 'all') {
    filteredActivities = filteredActivities.filter(a => a.type === activityType);
  }

  let currentValue = 0;
  switch (metric) {
    case 'distance':
      currentValue = filteredActivities.reduce((sum, a) => sum + a.distance, 0);
      break;
    case 'time':
      currentValue = filteredActivities.reduce((sum, a) => sum + a.moving_time, 0);
      break;
    case 'count':
      currentValue = filteredActivities.length;
      break;
    case 'elevation':
      currentValue = filteredActivities.reduce((sum, a) => sum + a.elevation_gain, 0);
      break;
  }

  const daysLeft = differenceInDays(endDate, now);

  return {
    currentValue,
    daysLeft: Math.max(0, daysLeft),
  };
}

// Format helpers
export function formatDistance(meters: number): string {
  if (meters >= 1000) {
    return `${(meters / 1000).toFixed(1)} km`;
  }
  return `${Math.round(meters)} m`;
}

export function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  
  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${minutes}m`;
}

export function formatPace(minPerKm: number): string {
  if (minPerKm === 0 || !isFinite(minPerKm)) return '-';
  const minutes = Math.floor(minPerKm);
  const seconds = Math.round((minPerKm - minutes) * 60);
  return `${minutes}:${seconds.toString().padStart(2, '0')} /km`;
}
