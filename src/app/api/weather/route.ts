import { NextRequest, NextResponse } from 'next/server';
import { getUserByStravaId, getUserSettings } from '@/lib/db';
import { getWeatherWithRecommendation, DEFAULT_LOCATIONS } from '@/lib/weather';

// GET /api/weather - Get weather for user's location or default
export async function GET(request: NextRequest) {
  const stravaUserId = request.cookies.get('strava_user_id')?.value;

  // Allow unauthenticated access with query params
  const { searchParams } = new URL(request.url);
  const lat = searchParams.get('lat');
  const lng = searchParams.get('lng');
  const location = searchParams.get('location');

  let weatherLat: number;
  let weatherLng: number;
  let locationName: string;

  // If coordinates provided, use them
  if (lat && lng) {
    weatherLat = parseFloat(lat);
    weatherLng = parseFloat(lng);
    locationName = location || 'Custom location';
  } else if (stravaUserId) {
    // Try to get user's saved location
    const user = getUserByStravaId(Number(stravaUserId));
    if (user) {
      const settings = getUserSettings(user.id);
      if (settings?.weather_lat && settings?.weather_lng) {
        weatherLat = settings.weather_lat;
        weatherLng = settings.weather_lng;
        locationName = settings.weather_location || 'Saved location';
      } else {
        // Default to Ulaanbaatar
        weatherLat = DEFAULT_LOCATIONS[0].lat;
        weatherLng = DEFAULT_LOCATIONS[0].lng;
        locationName = DEFAULT_LOCATIONS[0].name;
      }
    } else {
      weatherLat = DEFAULT_LOCATIONS[0].lat;
      weatherLng = DEFAULT_LOCATIONS[0].lng;
      locationName = DEFAULT_LOCATIONS[0].name;
    }
  } else {
    // Default to Ulaanbaatar for unauthenticated users
    weatherLat = DEFAULT_LOCATIONS[0].lat;
    weatherLng = DEFAULT_LOCATIONS[0].lng;
    locationName = DEFAULT_LOCATIONS[0].name;
  }

  try {
    const weather = await getWeatherWithRecommendation(weatherLat, weatherLng, locationName);
    
    if (!weather) {
      return NextResponse.json({ 
        error: 'Failed to fetch weather data',
        message: 'OpenWeatherMap API key may not be configured'
      }, { status: 500 });
    }
    
    return NextResponse.json({
      weather,
      locations: DEFAULT_LOCATIONS,
    });
  } catch (err) {
    console.error('Weather API error:', err);
    return NextResponse.json({ error: 'Failed to get weather' }, { status: 500 });
  }
}
