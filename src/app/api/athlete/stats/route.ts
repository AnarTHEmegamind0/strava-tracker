import { NextRequest, NextResponse } from 'next/server';
import { getUserByStravaId, updateUserTokens } from '@/lib/db';
import { getAthleteStats, getAthleteZones, getValidAccessToken } from '@/lib/strava';

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
    const { accessToken, refreshToken, expiresAt, refreshed } = await getValidAccessToken(
      user.access_token,
      user.refresh_token,
      user.token_expires_at
    );

    if (refreshed) {
      updateUserTokens(user.strava_id, accessToken, refreshToken, expiresAt);
    }

    // Fetch stats and zones in parallel
    const [stats, zones] = await Promise.all([
      getAthleteStats(accessToken, user.strava_id),
      getAthleteZones(accessToken).catch(() => null),
    ]);

    return NextResponse.json({ stats, zones });
  } catch (err) {
    console.error('Error fetching athlete stats:', err);
    return NextResponse.json({ error: 'Failed to fetch athlete stats' }, { status: 500 });
  }
}
