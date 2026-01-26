import { DBActivity } from '@/types';

// Workout Classification Types and Functions (Client-side safe)
export type WorkoutType = 'recovery' | 'easy' | 'long' | 'tempo' | 'interval' | 'race';

export function classifyWorkout(activity: DBActivity, recentActivities: DBActivity[]): WorkoutType {
  const distance = activity.distance / 1000; // km
  const duration = activity.moving_time / 60; // minutes
  const pace = duration / distance; // min/km
  
  // Get average stats for comparison
  const sameTypeActivities = recentActivities.filter(a => a.type === activity.type);
  const avgDistance = sameTypeActivities.length > 0 
    ? sameTypeActivities.reduce((s, a) => s + a.distance, 0) / sameTypeActivities.length / 1000
    : distance;
  const avgPace = sameTypeActivities.length > 0
    ? sameTypeActivities.reduce((s, a) => s + (a.moving_time / 60) / (a.distance / 1000), 0) / sameTypeActivities.length
    : pace;

  // Classification logic
  if (pace > avgPace * 1.15 || duration < 25) {
    return 'recovery'; // Slow pace or short duration
  }
  if (distance > avgDistance * 1.4 && pace > avgPace * 0.95) {
    return 'long'; // Long run, easy pace
  }
  if (pace < avgPace * 0.9 && distance < avgDistance * 0.7) {
    return 'interval'; // Fast pace, shorter distance
  }
  if (pace < avgPace * 0.95 && distance >= avgDistance * 0.8) {
    return 'tempo'; // Fast pace, normal distance
  }
  if (pace < avgPace * 0.85) {
    return 'race'; // Very fast pace
  }
  return 'easy'; // Default
}

export function getWorkoutTypeInfo(type: WorkoutType): { name: string; nameMn: string; color: string; description: string } {
  const types: Record<WorkoutType, { name: string; nameMn: string; color: string; description: string }> = {
    recovery: { name: 'Recovery', nameMn: 'Сэргээлт', color: 'bg-blue-500', description: 'Хөнгөн, сэргээх зорилготой' },
    easy: { name: 'Easy', nameMn: 'Хөнгөн', color: 'bg-green-500', description: 'Суурь тэсвэр бэхжүүлэх' },
    long: { name: 'Long Run', nameMn: 'Урт гүйлт', color: 'bg-purple-500', description: 'Тэсвэр, аэроб хүчин чадал' },
    tempo: { name: 'Tempo', nameMn: 'Темп', color: 'bg-yellow-500', description: 'Босго хурд сайжруулах' },
    interval: { name: 'Interval', nameMn: 'Интервал', color: 'bg-orange-500', description: 'Хурд, VO2max сайжруулах' },
    race: { name: 'Race', nameMn: 'Уралдаан', color: 'bg-red-500', description: 'Бүх хүчээ дайчилсан' },
  };
  return types[type];
}
