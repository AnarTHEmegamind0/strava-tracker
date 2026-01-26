import { DBActivity, DBAchievement, AchievementWithStatus } from '@/types';
import { 
  getAllAchievements, 
  getAchievementsWithStatus, 
  unlockAchievement, 
  hasAchievement,
  insertAchievement,
  getActivitiesByUserId,
  getUserStreak,
  createAlert,
} from './db';
import { DEFAULT_ACHIEVEMENTS } from './achievements-data';

// Seed achievements if not exist
export function seedAchievements(): void {
  const existing = getAllAchievements();
  if (existing.length === 0) {
    for (const achievement of DEFAULT_ACHIEVEMENTS) {
      insertAchievement(achievement);
    }
  }
}

export interface NewAchievement {
  achievement: DBAchievement;
  activityId?: number;
}

// Check all achievements for a user after an activity
export function checkAchievements(
  userId: number, 
  activities: DBActivity[], 
  latestActivity?: DBActivity
): NewAchievement[] {
  seedAchievements();
  
  const newAchievements: NewAchievement[] = [];
  const allAchievements = getAllAchievements();
  
  for (const achievement of allAchievements) {
    // Skip if already unlocked
    if (hasAchievement(userId, achievement.key)) continue;
    
    const unlocked = checkSingleAchievement(achievement, activities, latestActivity, userId);
    
    if (unlocked) {
      const success = unlockAchievement(userId, achievement.id, latestActivity?.id);
      if (success) {
        newAchievements.push({ 
          achievement, 
          activityId: latestActivity?.id 
        });
        
        // Create alert for the achievement
        createAlert({
          user_id: userId,
          alert_type: 'achievement',
          title: `🏆 ${achievement.name_mn}`,
          message: achievement.description_mn || `${achievement.name_mn} badge авлаа!`,
          priority: 'normal',
          action_url: '/achievements',
        });
      }
    }
  }
  
  return newAchievements;
}

function checkSingleAchievement(
  achievement: DBAchievement,
  activities: DBActivity[],
  latestActivity: DBActivity | undefined,
  userId: number
): boolean {
  // Filter by activity type if specified
  const relevantActivities = achievement.activity_type
    ? activities.filter(a => a.type === achievement.activity_type)
    : activities;
  
  switch (achievement.category) {
    case 'distance':
      return checkDistanceAchievement(achievement, relevantActivities);
    
    case 'total_distance':
      return checkTotalDistanceAchievement(achievement, relevantActivities);
    
    case 'streak':
      return checkStreakAchievement(achievement, userId);
    
    case 'elevation':
      return checkElevationAchievement(achievement, relevantActivities);
    
    case 'milestone':
      return checkMilestoneAchievement(achievement, relevantActivities);
    
    case 'special':
      return checkSpecialAchievement(achievement, latestActivity, activities);
    
    case 'speed':
      return checkSpeedAchievement(achievement, relevantActivities);
    
    default:
      return false;
  }
}

// Single activity distance check
function checkDistanceAchievement(achievement: DBAchievement, activities: DBActivity[]): boolean {
  return activities.some(a => a.distance >= achievement.threshold);
}

// Total cumulative distance check
function checkTotalDistanceAchievement(achievement: DBAchievement, activities: DBActivity[]): boolean {
  const totalDistance = activities.reduce((sum, a) => sum + a.distance, 0);
  return totalDistance >= achievement.threshold;
}

// Streak check (uses streak data from DB)
function checkStreakAchievement(achievement: DBAchievement, userId: number): boolean {
  const streak = getUserStreak(userId, 'daily');
  if (!streak) return false;
  
  // Check both current and best streak
  return streak.current_count >= achievement.threshold || streak.best_count >= achievement.threshold;
}

// Single activity elevation check
function checkElevationAchievement(achievement: DBAchievement, activities: DBActivity[]): boolean {
  // Check if it's a total elevation achievement
  if (achievement.key.startsWith('total_elevation')) {
    const totalElevation = activities.reduce((sum, a) => sum + a.elevation_gain, 0);
    return totalElevation >= achievement.threshold;
  }
  
  // Single activity elevation
  return activities.some(a => a.elevation_gain >= achievement.threshold);
}

// Activity count milestones
function checkMilestoneAchievement(achievement: DBAchievement, activities: DBActivity[]): boolean {
  return activities.length >= achievement.threshold;
}

// Special time-based achievements
function checkSpecialAchievement(
  achievement: DBAchievement, 
  latestActivity: DBActivity | undefined,
  activities: DBActivity[]
): boolean {
  if (!latestActivity) return false;
  
  const activityDate = new Date(latestActivity.start_date);
  const hour = activityDate.getHours();
  const dayOfWeek = activityDate.getDay(); // 0 = Sunday, 6 = Saturday
  const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
  
  switch (achievement.key) {
    case 'early_bird':
      return hour < 6;
    
    case 'night_owl':
      return hour >= 21;
    
    case 'lunch_runner':
      return hour >= 12 && hour < 13;
    
    case 'new_year_starter':
      return activityDate.getMonth() === 0 && activityDate.getDate() === 1;
    
    case 'weekend_warrior': {
      // Count weekend activities in the current month
      const currentMonth = activityDate.getMonth();
      const currentYear = activityDate.getFullYear();
      const weekendActivities = activities.filter(a => {
        const d = new Date(a.start_date);
        const dow = d.getDay();
        return d.getMonth() === currentMonth && 
               d.getFullYear() === currentYear &&
               (dow === 0 || dow === 6);
      });
      return weekendActivities.length >= achievement.threshold;
    }
    
    default:
      return false;
  }
}

// Speed achievements (pace-based)
function checkSpeedAchievement(achievement: DBAchievement, activities: DBActivity[]): boolean {
  // Speed achievements have different distance requirements
  const distanceRequirements: Record<string, number> = {
    'speed_sub30_5k': 5000,
    'speed_sub25_5k': 5000,
    'speed_sub20_5k': 5000,
    'speed_sub60_10k': 10000,
    'speed_sub50_10k': 10000,
  };
  
  const requiredDistance = distanceRequirements[achievement.key];
  if (!requiredDistance) return false;
  
  // Find activities that are at least the required distance
  // and check if any finished under the threshold time
  return activities.some(a => {
    if (a.distance < requiredDistance) return false;
    
    // Calculate time for exactly the required distance (proportional)
    const timeForDistance = (requiredDistance / a.distance) * a.moving_time;
    return timeForDistance <= achievement.threshold;
  });
}

// Get user's achievement progress
export function getAchievementProgress(
  userId: number,
  activities: DBActivity[]
): AchievementWithStatus[] {
  seedAchievements();
  
  const achievementsWithStatus = getAchievementsWithStatus(userId);
  
  // Calculate progress for each achievement
  return achievementsWithStatus.map(achievement => {
    if (achievement.unlocked) {
      return { ...achievement, progress: 100 };
    }
    
    const progress = calculateProgress(achievement, activities, userId);
    return { ...achievement, progress };
  });
}

function calculateProgress(
  achievement: DBAchievement,
  activities: DBActivity[],
  userId: number
): number {
  const relevantActivities = achievement.activity_type
    ? activities.filter(a => a.type === achievement.activity_type)
    : activities;
  
  let current = 0;
  
  switch (achievement.category) {
    case 'distance':
      current = Math.max(...relevantActivities.map(a => a.distance), 0);
      break;
    
    case 'total_distance':
      current = relevantActivities.reduce((sum, a) => sum + a.distance, 0);
      break;
    
    case 'streak': {
      const streak = getUserStreak(userId, 'daily');
      current = streak ? Math.max(streak.current_count, streak.best_count) : 0;
      break;
    }
    
    case 'elevation':
      if (achievement.key.startsWith('total_elevation')) {
        current = relevantActivities.reduce((sum, a) => sum + a.elevation_gain, 0);
      } else {
        current = Math.max(...relevantActivities.map(a => a.elevation_gain), 0);
      }
      break;
    
    case 'milestone':
      current = relevantActivities.length;
      break;
    
    default:
      current = 0;
  }
  
  return Math.min(100, Math.round((current / achievement.threshold) * 100));
}

// Get achievement stats summary
export function getAchievementStats(userId: number): {
  total: number;
  unlocked: number;
  percentage: number;
  recentUnlocks: AchievementWithStatus[];
} {
  seedAchievements();
  
  const achievements = getAchievementsWithStatus(userId);
  const total = achievements.length;
  const unlocked = achievements.filter(a => a.unlocked).length;
  const recentUnlocks = achievements
    .filter(a => a.unlocked)
    .sort((a, b) => new Date(b.unlocked_at!).getTime() - new Date(a.unlocked_at!).getTime())
    .slice(0, 5);
  
  return {
    total,
    unlocked,
    percentage: total > 0 ? Math.round((unlocked / total) * 100) : 0,
    recentUnlocks,
  };
}
