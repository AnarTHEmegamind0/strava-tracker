import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getUserByStravaId, getActivitiesByUserId } from '@/lib/db';
import { generateDailyPlanAI } from '@/lib/groq';

export async function GET() {
  try {
    const cookieStore = await cookies();
    const stravaUserId = cookieStore.get('strava_user_id')?.value;
    
    if (!stravaUserId) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const user = getUserByStravaId(Number(stravaUserId));
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Get recent activities for context
    const activities = getActivitiesByUserId(user.id, 30);
    
    // Generate AI daily plan
    const plan = await generateDailyPlanAI(activities);
    
    return NextResponse.json(plan);
  } catch (error) {
    console.error('Daily plan error:', error);
    
    // Return fallback data
    const now = new Date();
    const hour = now.getHours();
    let greeting = 'Сайн байна уу';
    if (hour < 12) greeting = 'Өглөөний мэнд';
    else if (hour < 18) greeting = 'Өдрийн мэнд';
    else greeting = 'Оройн мэнд';

    return NextResponse.json({
      greeting,
      date: now.toLocaleDateString('mn-MN', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      }),
      tasks: [
        { id: '1', title: 'Өглөөний сунгалт', type: 'recovery', completed: false, time: '07:00', duration: '15 мин' },
        { id: '2', title: 'Гүйлт эсвэл алхалт', type: 'workout', completed: false, time: '08:00', duration: '30-45 мин' },
        { id: '3', title: 'Эрүүл хоол', type: 'nutrition', completed: false, time: '12:00' },
        { id: '4', title: 'Унтахын өмнөх сунгалт', type: 'recovery', completed: false, time: '21:00', duration: '10 мин' },
      ],
      motivation: 'Өнөөдөр өөрийгөө сайжруул!',
    });
  }
}
