import { NextRequest, NextResponse } from 'next/server';
import { getUserByStravaId, getActivitiesByUserId } from '@/lib/db';
import { generateDailyInsights } from '@/lib/groq';

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
    // Get recent activities (last 30 days)
    const activities = getActivitiesByUserId(user.id, 50);
    
    // Calculate basic stats for context
    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const fourteenDaysAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);
    
    const lastWeekActivities = activities.filter(a => new Date(a.start_date) >= sevenDaysAgo);
    const prevWeekActivities = activities.filter(a => {
      const date = new Date(a.start_date);
      return date >= fourteenDaysAgo && date < sevenDaysAgo;
    });

    // Calculate metrics
    const lastWeekDistance = lastWeekActivities.reduce((sum, a) => sum + a.distance, 0) / 1000;
    const lastWeekTime = lastWeekActivities.reduce((sum, a) => sum + a.moving_time, 0);
    const prevWeekDistance = prevWeekActivities.reduce((sum, a) => sum + a.distance, 0) / 1000;
    
    // Days since last activity
    const lastActivityDate = activities.length > 0 ? new Date(activities[0].start_date) : null;
    const daysSinceLastActivity = lastActivityDate 
      ? Math.floor((now.getTime() - lastActivityDate.getTime()) / (24 * 60 * 60 * 1000))
      : null;

    // Get AI insights
    const insights = await generateDailyInsights(activities, {
      lastWeekDistance,
      lastWeekTime,
      lastWeekCount: lastWeekActivities.length,
      prevWeekDistance,
      prevWeekCount: prevWeekActivities.length,
      daysSinceLastActivity,
    });

    return NextResponse.json({ 
      insights,
      stats: {
        lastWeekDistance,
        lastWeekTime,
        lastWeekCount: lastWeekActivities.length,
        daysSinceLastActivity,
        distanceChange: prevWeekDistance > 0 
          ? ((lastWeekDistance - prevWeekDistance) / prevWeekDistance * 100).toFixed(0)
          : 0,
      }
    });
  } catch (err) {
    console.error('Daily insights error:', err);
    return NextResponse.json({ error: 'Failed to generate insights' }, { status: 500 });
  }
}
