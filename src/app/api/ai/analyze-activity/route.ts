import { NextRequest, NextResponse } from 'next/server';
import { getUserByStravaId, getActivitiesByUserId, getActivityByStravaId } from '@/lib/db';
import { analyzeActivity } from '@/lib/groq';

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
    const { activityId } = await request.json();

    if (!activityId) {
      return NextResponse.json({ error: 'Activity ID is required' }, { status: 400 });
    }

    // Get the specific activity
    const activity = getActivityByStravaId(activityId);
    
    if (!activity) {
      return NextResponse.json({ error: 'Activity not found' }, { status: 404 });
    }

    // Get recent activities for context
    const recentActivities = getActivitiesByUserId(user.id, 30);

    // Get AI analysis
    const analysis = await analyzeActivity(activity, recentActivities);

    return NextResponse.json({ analysis });
  } catch (err) {
    console.error('Activity analysis error:', err);
    return NextResponse.json({ error: 'Failed to analyze activity' }, { status: 500 });
  }
}
