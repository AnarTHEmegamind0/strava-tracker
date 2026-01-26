import { NextRequest, NextResponse } from 'next/server';
import { getUserByStravaId, getActivitiesByUserId } from '@/lib/db';
import { calculateRecoveryScore } from '@/lib/groq';

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
    const activities = getActivitiesByUserId(user.id, 30);
    const result = await calculateRecoveryScore(activities);
    return NextResponse.json(result);
  } catch (err) {
    console.error('Recovery score error:', err);
    return NextResponse.json({ error: 'Failed to calculate recovery score' }, { status: 500 });
  }
}
