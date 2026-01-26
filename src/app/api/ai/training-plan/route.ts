import { NextRequest, NextResponse } from 'next/server';
import { getUserByStravaId, getActivitiesByUserId, getGoalsByUserId } from '@/lib/db';
import { generateTrainingPlan } from '@/lib/groq';
import { startOfWeek, startOfMonth, differenceInDays, endOfWeek, endOfMonth } from 'date-fns';

// Calculate goal progress
function calculateGoalProgress(goal: any, activities: any[]) {
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

  return {
    ...goal,
    current_value: currentValue,
    progress_percent: progressPercent,
    days_left: daysLeft,
  };
}

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
    // Get recent activities
    const activities = getActivitiesByUserId(user.id, 50);
    
    // Get user goals with progress
    const goals = getGoalsByUserId(user.id);
    const goalsWithProgress = goals.map(g => calculateGoalProgress(g, activities));

    // Generate training plan
    const plan = await generateTrainingPlan(activities, goalsWithProgress);

    return NextResponse.json({ plan });
  } catch (err) {
    console.error('Training plan error:', err);
    return NextResponse.json({ error: 'Failed to generate training plan' }, { status: 500 });
  }
}
