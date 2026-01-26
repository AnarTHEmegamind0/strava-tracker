import { NextRequest, NextResponse } from 'next/server';
import { getUserByStravaId, updateUserTokens } from '@/lib/db';
import { 
  getActivityById, 
  getActivityStreams, 
  getActivityLaps, 
  getActivityZones,
  getValidAccessToken 
} from '@/lib/strava';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const stravaUserId = request.cookies.get('strava_user_id')?.value;
  const { id } = await params;

  if (!stravaUserId) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  const user = getUserByStravaId(Number(stravaUserId));
  
  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  try {
    const { accessToken, refreshToken, expiresAt, refreshed } = await getValidAccessToken(
      user.access_token,
      user.refresh_token,
      user.token_expires_at
    );

    if (refreshed) {
      updateUserTokens(user.strava_id, accessToken, refreshToken, expiresAt);
    }

    const activityId = Number(id);

    // Fetch all data in parallel
    const [activity, streams, laps, zones] = await Promise.all([
      getActivityById(accessToken, activityId, true),
      getActivityStreams(accessToken, activityId).catch(() => ({})),
      getActivityLaps(accessToken, activityId).catch(() => []),
      getActivityZones(accessToken, activityId).catch(() => []),
    ]);

    return NextResponse.json({ 
      activity,
      streams,
      laps,
      zones,
    });
  } catch (err) {
    console.error('Error fetching activity details:', err);
    return NextResponse.json({ error: 'Failed to fetch activity details' }, { status: 500 });
  }
}
