import { NextRequest, NextResponse } from 'next/server';
import { getUserByStravaId, getActivitiesByUserId } from '@/lib/db';
import { getWeeklySummary } from '@/lib/groq';

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
    // Get recent activities
    const activities = getActivitiesByUserId(user.id, 30);

    // Get AI weekly summary
    const summary = await getWeeklySummary(activities);

    return NextResponse.json({ summary });
  } catch (err) {
    console.error('Weekly summary error:', err);
    return NextResponse.json({ error: 'Failed to generate weekly summary' }, { status: 500 });
  }
}
