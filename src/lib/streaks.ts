import { DBActivity, DBUserStreak, StreakType } from '@/types';
import { getUserStreak, upsertUserStreak, createAlert, hasAchievement } from './db';

export interface StreakInfo {
  daily: {
    current: number;
    best: number;
    lastActivityDate: string | null;
    isAtRisk: boolean; // true if no activity today and streak > 0
  };
  weekly: {
    current: number;
    best: number;
    lastActivityDate: string | null;
  };
}

// Calculate and update streaks based on activities
export function updateStreaks(userId: number, activities: DBActivity[]): StreakInfo {
  const sortedActivities = [...activities].sort(
    (a, b) => new Date(b.start_date).getTime() - new Date(a.start_date).getTime()
  );
  
  // Calculate daily streak
  const dailyStreak = calculateDailyStreak(sortedActivities);
  const existingDaily = getUserStreak(userId, 'daily');
  
  // Update daily streak in DB
  if (sortedActivities.length > 0) {
    const lastActivityDate = new Date(sortedActivities[0].start_date).toISOString().split('T')[0];
    upsertUserStreak(
      userId, 
      'daily', 
      dailyStreak.current, 
      Math.max(dailyStreak.current, existingDaily?.best_count || 0),
      lastActivityDate
    );
  }
  
  // Calculate weekly streak
  const weeklyStreak = calculateWeeklyStreak(sortedActivities);
  const existingWeekly = getUserStreak(userId, 'weekly');
  
  if (sortedActivities.length > 0) {
    const lastActivityDate = new Date(sortedActivities[0].start_date).toISOString().split('T')[0];
    upsertUserStreak(
      userId,
      'weekly',
      weeklyStreak.current,
      Math.max(weeklyStreak.current, existingWeekly?.best_count || 0),
      lastActivityDate
    );
  }
  
  // Check if streak is at risk (no activity today)
  const today = new Date().toISOString().split('T')[0];
  const lastActivity = sortedActivities[0];
  const lastActivityDate = lastActivity 
    ? new Date(lastActivity.start_date).toISOString().split('T')[0]
    : null;
  const isAtRisk = dailyStreak.current > 0 && lastActivityDate !== today;
  
  // Create alert if streak is at risk
  if (isAtRisk && dailyStreak.current >= 3) {
    checkAndCreateStreakRiskAlert(userId, dailyStreak.current);
  }
  
  return {
    daily: {
      current: dailyStreak.current,
      best: Math.max(dailyStreak.current, existingDaily?.best_count || 0),
      lastActivityDate,
      isAtRisk,
    },
    weekly: {
      current: weeklyStreak.current,
      best: Math.max(weeklyStreak.current, existingWeekly?.best_count || 0),
      lastActivityDate,
    },
  };
}

function calculateDailyStreak(sortedActivities: DBActivity[]): { current: number } {
  if (sortedActivities.length === 0) return { current: 0 };
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  // Get unique activity dates
  const activityDates = new Set<string>();
  sortedActivities.forEach(a => {
    const date = new Date(a.start_date);
    date.setHours(0, 0, 0, 0);
    activityDates.add(date.toISOString().split('T')[0]);
  });
  
  const sortedDates = Array.from(activityDates).sort().reverse();
  
  if (sortedDates.length === 0) return { current: 0 };
  
  // Check if most recent activity is today or yesterday
  const mostRecentDate = new Date(sortedDates[0]);
  const diffDays = Math.floor((today.getTime() - mostRecentDate.getTime()) / (1000 * 60 * 60 * 24));
  
  // If last activity was more than 1 day ago, streak is broken
  if (diffDays > 1) return { current: 0 };
  
  // Count consecutive days
  let streak = 1;
  let currentDate = mostRecentDate;
  
  for (let i = 1; i < sortedDates.length; i++) {
    const prevDate = new Date(sortedDates[i]);
    const dayDiff = Math.floor((currentDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24));
    
    if (dayDiff === 1) {
      streak++;
      currentDate = prevDate;
    } else if (dayDiff > 1) {
      break; // Streak broken
    }
    // dayDiff === 0 means same day, continue checking
  }
  
  return { current: streak };
}

function calculateWeeklyStreak(sortedActivities: DBActivity[]): { current: number } {
  if (sortedActivities.length === 0) return { current: 0 };
  
  // Get unique weeks with activities
  const activityWeeks = new Set<string>();
  sortedActivities.forEach(a => {
    const date = new Date(a.start_date);
    const weekKey = getWeekKey(date);
    activityWeeks.add(weekKey);
  });
  
  const sortedWeeks = Array.from(activityWeeks).sort().reverse();
  
  if (sortedWeeks.length === 0) return { current: 0 };
  
  // Get current week
  const currentWeekKey = getWeekKey(new Date());
  const lastActivityWeek = sortedWeeks[0];
  
  // Check if we have activity this week or last week
  const weekDiff = getWeekDifference(currentWeekKey, lastActivityWeek);
  if (weekDiff > 1) return { current: 0 };
  
  // Count consecutive weeks
  let streak = 1;
  for (let i = 1; i < sortedWeeks.length; i++) {
    const diff = getWeekDifference(sortedWeeks[i - 1], sortedWeeks[i]);
    if (diff === 1) {
      streak++;
    } else if (diff > 1) {
      break;
    }
  }
  
  return { current: streak };
}

function getWeekKey(date: Date): string {
  // Get ISO week number
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const weekNo = Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
  return `${d.getUTCFullYear()}-W${weekNo.toString().padStart(2, '0')}`;
}

function getWeekDifference(week1: string, week2: string): number {
  const [year1, w1] = week1.split('-W').map(Number);
  const [year2, w2] = week2.split('-W').map(Number);
  return (year1 - year2) * 52 + (w1 - w2);
}

// Check and create streak risk alert
function checkAndCreateStreakRiskAlert(userId: number, currentStreak: number): void {
  // Only create if streak is significant
  if (currentStreak < 3) return;
  
  // Check last alert to avoid spam
  createAlert({
    user_id: userId,
    alert_type: 'streak_risk',
    title: '🔥 Streak-ээ хамгаал!',
    message: `Таны ${currentStreak} хоногийн streak эрсдэлд орж байна. Өнөөдөр дасгал хийгээрэй!`,
    priority: 'high',
    action_url: '/dashboard',
  });
}

// Get current streak info for display
export function getStreakInfo(userId: number): StreakInfo {
  const daily = getUserStreak(userId, 'daily');
  const weekly = getUserStreak(userId, 'weekly');
  
  const today = new Date().toISOString().split('T')[0];
  const isAtRisk = daily 
    ? daily.current_count > 0 && daily.last_activity_date !== today
    : false;
  
  return {
    daily: {
      current: daily?.current_count || 0,
      best: daily?.best_count || 0,
      lastActivityDate: daily?.last_activity_date || null,
      isAtRisk,
    },
    weekly: {
      current: weekly?.current_count || 0,
      best: weekly?.best_count || 0,
      lastActivityDate: weekly?.last_activity_date || null,
    },
  };
}
