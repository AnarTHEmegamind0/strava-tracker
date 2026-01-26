import { NextRequest, NextResponse } from 'next/server';
import { getUserByStravaId, getUserSettings, upsertUserSettings } from '@/lib/db';
import { PreferredUnits, Language } from '@/types';

// GET /api/user-settings - Get user settings
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
    const settings = getUserSettings(user.id);
    
    // Return default settings if none exist
    if (!settings) {
      return NextResponse.json({
        settings: {
          user_id: user.id,
          notifications_enabled: true,
          weekly_report_enabled: true,
          weather_location: null,
          weather_lat: null,
          weather_lng: null,
          preferred_units: 'metric' as PreferredUnits,
          language: 'mn' as Language,
        }
      });
    }
    
    return NextResponse.json({ settings });
  } catch (err) {
    console.error('Get settings error:', err);
    return NextResponse.json({ error: 'Failed to get settings' }, { status: 500 });
  }
}

// PUT /api/user-settings - Update user settings
export async function PUT(request: NextRequest) {
  const stravaUserId = request.cookies.get('strava_user_id')?.value;

  if (!stravaUserId) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  const user = getUserByStravaId(Number(stravaUserId));
  
  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  try {
    const body = await request.json();
    
    // Validate and sanitize input
    const updates: Record<string, unknown> = { user_id: user.id };
    
    if (typeof body.notifications_enabled === 'boolean') {
      updates.notifications_enabled = body.notifications_enabled ? 1 : 0;
    }
    if (typeof body.weekly_report_enabled === 'boolean') {
      updates.weekly_report_enabled = body.weekly_report_enabled ? 1 : 0;
    }
    if (body.weather_location !== undefined) {
      updates.weather_location = body.weather_location;
    }
    if (typeof body.weather_lat === 'number') {
      updates.weather_lat = body.weather_lat;
    }
    if (typeof body.weather_lng === 'number') {
      updates.weather_lng = body.weather_lng;
    }
    if (body.preferred_units === 'metric' || body.preferred_units === 'imperial') {
      updates.preferred_units = body.preferred_units;
    }
    if (body.language === 'mn' || body.language === 'en') {
      updates.language = body.language;
    }
    
    const settings = upsertUserSettings(updates as Parameters<typeof upsertUserSettings>[0]);
    
    return NextResponse.json({ settings, success: true });
  } catch (err) {
    console.error('Update settings error:', err);
    return NextResponse.json({ error: 'Failed to update settings' }, { status: 500 });
  }
}
