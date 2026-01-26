import { NextRequest, NextResponse } from 'next/server';
import { getUserByStravaId, getActivitiesByUserId } from '@/lib/db';
import { getStreakInfo, updateStreaks } from '@/lib/streaks';

// GET /api/streaks - Get user's streak info
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
    const streaks = getStreakInfo(user.id);
    
    return NextResponse.json({
      streaks,
    });
  } catch (err) {
    console.error('Streaks error:', err);
    return NextResponse.json({ error: 'Failed to get streaks' }, { status: 500 });
  }
}

// POST /api/streaks - Recalculate and update streaks
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
    const activities = getActivitiesByUserId(user.id, 1000);
    const streaks = updateStreaks(user.id, activities);
    
    return NextResponse.json({
      streaks,
      updated: true,
    });
  } catch (err) {
    console.error('Update streaks error:', err);
    return NextResponse.json({ error: 'Failed to update streaks' }, { status: 500 });
  }
}
