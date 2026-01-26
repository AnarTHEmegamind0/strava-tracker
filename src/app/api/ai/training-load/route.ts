import { NextRequest, NextResponse } from 'next/server';
import { getUserByStravaId, getActivitiesByUserId } from '@/lib/db';
import { analyzeTrainingLoad } from '@/lib/groq';

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
    const activities = getActivitiesByUserId(user.id, 60);
    const result = await analyzeTrainingLoad(activities);
    return NextResponse.json(result);
  } catch (err) {
    console.error('Training load error:', err);
    return NextResponse.json({ error: 'Failed to analyze training load' }, { status: 500 });
  }
}
