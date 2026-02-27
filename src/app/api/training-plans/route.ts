import { NextRequest, NextResponse } from 'next/server';
import { 
  getUserByStravaId, 
  createTrainingPlan, 
  getTrainingPlansByUserId,
  getTrainingPlanWithProgress 
} from '@/lib/db';
import { TrainingPlanStatus } from '@/types';

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
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') as TrainingPlanStatus | null;
    
    const plans = getTrainingPlansByUserId(user.id, status || undefined);
    
    // Add progress info to each plan
    const plansWithProgress = plans.map(plan => {
      const progress = getTrainingPlanWithProgress(plan.id);
      return progress || plan;
    });

    return NextResponse.json({ plans: plansWithProgress });
  } catch (err) {
    console.error('Get training plans error:', err);
    return NextResponse.json({ error: 'Failed to get training plans' }, { status: 500 });
  }
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
    const body = await request.json();
    
    const { title, description, duration, durationType, goalType, content } = body;
    
    if (!title || !content) {
      return NextResponse.json({ error: 'Title and content are required' }, { status: 400 });
    }

    const plan = createTrainingPlan({
      user_id: user.id,
      title,
      description: description || null,
      duration: duration || 7,
      duration_type: durationType || 'days',
      goal_type: goalType || 'general',
      content,
      status: 'active',
      start_date: undefined,
      end_date: undefined,
    });

    return NextResponse.json({ plan });
  } catch (err) {
    console.error('Create training plan error:', err);
    return NextResponse.json({ error: 'Failed to create training plan' }, { status: 500 });
  }
}
