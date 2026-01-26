import { NextRequest, NextResponse } from 'next/server';
import { getUserByStravaId, getActivitiesByUserId } from '@/lib/db';

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
    // Get all activities
    const activities = getActivitiesByUserId(user.id, 1000);

    // Create CSV content
    const headers = ['Date', 'Name', 'Type', 'Distance (km)', 'Duration (min)', 'Elevation (m)', 'Avg Pace (min/km)'];
    
    const rows = activities.map(a => {
      const date = new Date(a.start_date).toISOString().split('T')[0];
      const distance = (a.distance / 1000).toFixed(2);
      const duration = (a.moving_time / 60).toFixed(1);
      const elevation = a.elevation_gain.toFixed(1);
      const pace = a.average_speed > 0 
        ? ((1000 / a.average_speed) / 60).toFixed(2)
        : '-';
      
      return [date, `"${a.name}"`, a.type, distance, duration, elevation, pace].join(',');
    });

    const csv = [headers.join(','), ...rows].join('\n');

    // Return CSV file
    return new NextResponse(csv, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="strava-activities-${new Date().toISOString().split('T')[0]}.csv"`,
      },
    });
  } catch (err) {
    console.error('Export error:', err);
    return NextResponse.json({ error: 'Failed to export activities' }, { status: 500 });
  }
}
