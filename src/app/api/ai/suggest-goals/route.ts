import { NextRequest, NextResponse } from 'next/server';
import { getUserByStravaId, getActivitiesByUserId } from '@/lib/db';
import { suggestGoals } from '@/lib/groq';

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
    // Get activities from the last 60 days for better suggestions
    const activities = getActivitiesByUserId(user.id, 100);

    if (activities.length === 0) {
      return NextResponse.json({ 
        suggestions: 'Дасгалын түүх байхгүй тул зорилго санал болгох боломжгүй байна. Эхлээд хэдэн дасгал хийгээрэй!' 
      });
    }

    const suggestions = await suggestGoals(activities);
    
    return NextResponse.json({ suggestions });
  } catch (err) {
    console.error('Suggest goals error:', err);
    return NextResponse.json({ error: 'Failed to generate goal suggestions' }, { status: 500 });
  }
}
