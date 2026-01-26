import { NextRequest, NextResponse } from 'next/server';
import { getUserByStravaId, getActivitiesByUserId } from '@/lib/db';
import { getAchievementProgress, getAchievementStats, checkAchievements } from '@/lib/achievements';

// GET /api/achievements - Get all achievements with user's status
export async function GET(request: NextRequest) {
  const stravaUserId = request.cookies.get('strava_user_id')?.value;

  if (!stravaUserId) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  const user = getUserByStravaId(Number(stravaUserId));
  
  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  try {
    const activities = getActivitiesByUserId(user.id, 1000);
    const achievements = getAchievementProgress(user.id, activities);
    const stats = getAchievementStats(user.id);
    
    // Group by category
    const byCategory: Record<string, typeof achievements> = {};
    achievements.forEach(a => {
      if (!byCategory[a.category]) {
        byCategory[a.category] = [];
      }
      byCategory[a.category].push(a);
    });
    
    return NextResponse.json({
      achievements,
      byCategory,
      stats,
    });
  } catch (err) {
    console.error('Achievements error:', err);
    return NextResponse.json({ error: 'Failed to get achievements' }, { status: 500 });
  }
}

// POST /api/achievements - Check for new achievements
export async function POST(request: NextRequest) {
  const stravaUserId = request.cookies.get('strava_user_id')?.value;

  if (!stravaUserId) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  const user = getUserByStravaId(Number(stravaUserId));
  
  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  try {
    const body = await request.json().catch(() => ({}));
    const activityId = body.activityId;
    
    const activities = getActivitiesByUserId(user.id, 1000);
    const latestActivity = activityId 
      ? activities.find(a => a.id === activityId)
      : activities[0];
    
    const newAchievements = checkAchievements(user.id, activities, latestActivity);
    
    return NextResponse.json({
      newAchievements: newAchievements.map(na => ({
        ...na.achievement,
        activityId: na.activityId,
      })),
      count: newAchievements.length,
    });
  } catch (err) {
    console.error('Check achievements error:', err);
    return NextResponse.json({ error: 'Failed to check achievements' }, { status: 500 });
  }
}
