import { NextRequest, NextResponse } from 'next/server';
import { getUserByStravaId, updateUserTokens } from '@/lib/db';
import { getAthlete, getValidAccessToken } from '@/lib/strava';

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
    // Ensure token is valid
    const { accessToken, refreshToken, expiresAt, refreshed } = await getValidAccessToken(
      user.access_token,
      user.refresh_token,
      user.token_expires_at
    );

    // Update tokens if refreshed
    if (refreshed) {
      updateUserTokens(user.strava_id, accessToken, refreshToken, expiresAt);
    }

    // Get fresh athlete data
    const athlete = await getAthlete(accessToken);

    return NextResponse.json({
      id: athlete.id,
      username: athlete.username,
      firstname: athlete.firstname,
      lastname: athlete.lastname,
      city: athlete.city,
      country: athlete.country,
      profile: athlete.profile,
      profile_medium: athlete.profile_medium,
    });
  } catch (err) {
    console.error('Error fetching athlete:', err);
    return NextResponse.json({ error: 'Failed to fetch athlete' }, { status: 500 });
  }
}
