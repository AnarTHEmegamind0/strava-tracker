import { NextRequest, NextResponse } from 'next/server';
import { getUserByStravaId, getActivitiesByUserId, getGoalById } from '@/lib/db';
import { getGoalAdvice } from '@/lib/groq';
import { startOfWeek, startOfMonth, differenceInDays, endOfWeek, endOfMonth } from 'date-fns';

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
    const { goalId } = await request.json();

    if (!goalId) {
      return NextResponse.json({ error: 'Goal ID is required' }, { status: 400 });
    }

    // Get the goal
    const goal = getGoalById(goalId);
    
    if (!goal) {
      return NextResponse.json({ error: 'Goal not found' }, { status: 404 });
    }

    // Get activities
    const activities = getActivitiesByUserId(user.id, 50);

    // Calculate progress
    const now = new Date();
    let periodStart: Date;
    let periodEnd: Date;

    if (goal.type === 'weekly') {
      periodStart = startOfWeek(now, { weekStartsOn: 1 });
      periodEnd = endOfWeek(now, { weekStartsOn: 1 });
    } else {
      periodStart = startOfMonth(now);
      periodEnd = endOfMonth(now);
    }

    const periodActivities = activities.filter(a => {
      const date = new Date(a.start_date);
      return date >= periodStart && date <= periodEnd;
    }).filter(a => !goal.activity_type || goal.activity_type === 'all' || a.type === goal.activity_type);

    let currentValue = 0;
    switch (goal.metric) {
      case 'distance':
        currentValue = periodActivities.reduce((sum, a) => sum + a.distance, 0);
        break;
      case 'time':
        currentValue = periodActivities.reduce((sum, a) => sum + a.moving_time, 0);
        break;
      case 'count':
        currentValue = periodActivities.length;
        break;
      case 'elevation':
        currentValue = periodActivities.reduce((sum, a) => sum + a.elevation_gain, 0);
        break;
    }

    const progressPercent = (currentValue / goal.target_value) * 100;
    const daysLeft = Math.max(0, differenceInDays(periodEnd, now));

    const goalWithProgress = {
      title: goal.title,
      metric: goal.metric,
      target_value: goal.target_value,
      current_value: currentValue,
      progress_percent: progressPercent,
      days_left: daysLeft,
    };

    // Get AI advice
    const advice = await getGoalAdvice(goalWithProgress, activities);

    return NextResponse.json({ advice });
  } catch (err) {
    console.error('Goal advice error:', err);
    return NextResponse.json({ error: 'Failed to get goal advice' }, { status: 500 });
  }
}
