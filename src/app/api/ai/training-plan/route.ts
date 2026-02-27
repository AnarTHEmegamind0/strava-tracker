import { NextRequest, NextResponse } from 'next/server';
import { getUserByStravaId, getActivitiesByUserId, getGoalsByUserId } from '@/lib/db';
import { generateTrainingPlan, TrainingPlanOptions } from '@/lib/groq';
import { startOfWeek, startOfMonth, differenceInDays, endOfWeek, endOfMonth } from 'date-fns';
import { DBActivity, DBGoal } from '@/types';

// Calculate goal progress
function calculateGoalProgress(goal: DBGoal, activities: DBActivity[]) {
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

function extractChecklistFromPlan(plan: string) {
  const lines = plan.split('\n').map((line) => line.trim()).filter(Boolean);
  const items = lines
    .filter((line) => /^(?:Өдөр|Day)\s*\d+/i.test(line) || /^\d+[-.]\s/.test(line))
    .slice(0, 14)
    .map((line, index) => ({
      id: `task-${index + 1}`,
      title: line.replace(/^[-*]\s*/, ''),
      completed: false,
    }));

  if (items.length > 0) {
    return items;
  }

  return [
    { id: 'task-1', title: 'Өнөөдрийн үндсэн дасгалаа хий', completed: false },
    { id: 'task-2', title: 'Сэргэлтийн сунгалт 10-15 минут', completed: false },
    { id: 'task-3', title: 'Ус, хоол, унтлагын дэглэмээ баримтал', completed: false },
  ];
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
    // Parse request body for custom options
    let options: TrainingPlanOptions | undefined;
    try {
      const body = await request.json();
      if (body.duration || body.goalType) {
        options = {
          duration: body.duration || 7,
          durationType: body.durationType || 'days',
          goalType: body.goalType || 'general',
          targetDate: body.targetDate,
        };
      }
    } catch {
      // No body or invalid JSON, use defaults
    }

    // Get recent activities
    const activities = getActivitiesByUserId(user.id, 50);
    
    // Get user goals with progress
    const goals = getGoalsByUserId(user.id);
    const goalsWithProgress = goals.map(g => calculateGoalProgress(g, activities));

    // Generate training plan with options
    const plan = await generateTrainingPlan(activities, goalsWithProgress, options);

    const checklist = extractChecklistFromPlan(plan);

    return NextResponse.json({ plan, checklist });
  } catch (err) {
    console.error('Training plan error:', err);
    return NextResponse.json({ error: 'Failed to generate training plan' }, { status: 500 });
  }
}
