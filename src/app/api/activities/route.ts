import { NextRequest, NextResponse } from 'next/server';
import { getUserByStravaId, updateUserTokens, upsertActivity, getActivitiesByUserId } from '@/lib/db';
import { getActivities, getValidAccessToken } from '@/lib/strava';

export async function GET(request: NextRequest) {
  const stravaUserId = request.cookies.get('strava_user_id')?.value;

  if (!stravaUserId) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  const user = getUserByStravaId(Number(stravaUserId));
  
  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  const searchParams = request.nextUrl.searchParams;
  const refresh = searchParams.get('refresh') === 'true';

  try {
    // If refresh requested, fetch from Strava API
    if (refresh) {
      const { accessToken, refreshToken, expiresAt, refreshed } = await getValidAccessToken(
        user.access_token,
        user.refresh_token,
        user.token_expires_at
      );

      if (refreshed) {
        updateUserTokens(user.strava_id, accessToken, refreshToken, expiresAt);
      }

      // Fetch activities from Strava
      const stravaActivities = await getActivities(accessToken, 1, 50);

      // Save to database
      for (const activity of stravaActivities) {
        upsertActivity({
          user_id: user.id,
          strava_id: activity.id,
          name: activity.name,
          type: activity.sport_type || activity.type,
          start_date: activity.start_date_local,
          distance: activity.distance,
          moving_time: activity.moving_time,
          elevation_gain: activity.total_elevation_gain,
          average_speed: activity.average_speed,
          calories: activity.calories || 0,
        });
      }
    }

    // Get activities from database
    const activities = getActivitiesByUserId(user.id, 50);

    return NextResponse.json({ activities });
  } catch (err) {
    console.error('Error fetching activities:', err);
    return NextResponse.json({ error: 'Failed to fetch activities' }, { status: 500 });
  }
}
