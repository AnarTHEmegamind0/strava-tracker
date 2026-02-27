import { NextRequest, NextResponse } from 'next/server';
import { 
  getUserByStravaId, 
  getTrainingPlanById,
  getTrainingPlanWithProgress,
  updateTrainingPlan,
  updateTrainingPlanStatus,
  startTrainingPlan,
  deleteTrainingPlan 
} from '@/lib/db';
import { TrainingPlanStatus } from '@/types';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const stravaUserId = request.cookies.get('strava_user_id')?.value;

  if (!stravaUserId) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  const user = getUserByStravaId(Number(stravaUserId));
  
  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  try {
    const { id } = await params;
    const planId = parseInt(id, 10);
    
    const plan = getTrainingPlanWithProgress(planId);
    
    if (!plan) {
      return NextResponse.json({ error: 'Plan not found' }, { status: 404 });
    }
    
    if (plan.user_id !== user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    return NextResponse.json({ plan });
  } catch (err) {
    console.error('Get training plan error:', err);
    return NextResponse.json({ error: 'Failed to get training plan' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const stravaUserId = request.cookies.get('strava_user_id')?.value;

  if (!stravaUserId) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  const user = getUserByStravaId(Number(stravaUserId));
  
  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  try {
    const { id } = await params;
    const planId = parseInt(id, 10);
    const body = await request.json();
    
    const existingPlan = getTrainingPlanById(planId);
    
    if (!existingPlan) {
      return NextResponse.json({ error: 'Plan not found' }, { status: 404 });
    }
    
    if (existingPlan.user_id !== user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Handle special actions
    if (body.action === 'start') {
      const plan = startTrainingPlan(planId);
      return NextResponse.json({ plan });
    }
    
    if (body.action === 'complete') {
      updateTrainingPlanStatus(planId, 'completed');
      const plan = getTrainingPlanWithProgress(planId);
      return NextResponse.json({ plan });
    }
    
    if (body.action === 'archive') {
      updateTrainingPlanStatus(planId, 'archived');
      const plan = getTrainingPlanWithProgress(planId);
      return NextResponse.json({ plan });
    }

    // General update
    const plan = updateTrainingPlan(planId, {
      title: body.title,
      description: body.description,
      status: body.status as TrainingPlanStatus,
    });

    return NextResponse.json({ plan });
  } catch (err) {
    console.error('Update training plan error:', err);
    return NextResponse.json({ error: 'Failed to update training plan' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const stravaUserId = request.cookies.get('strava_user_id')?.value;

  if (!stravaUserId) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  const user = getUserByStravaId(Number(stravaUserId));
  
  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  try {
    const { id } = await params;
    const planId = parseInt(id, 10);
    
    const existingPlan = getTrainingPlanById(planId);
    
    if (!existingPlan) {
      return NextResponse.json({ error: 'Plan not found' }, { status: 404 });
    }
    
    if (existingPlan.user_id !== user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    deleteTrainingPlan(planId);

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Delete training plan error:', err);
    return NextResponse.json({ error: 'Failed to delete training plan' }, { status: 500 });
  }
}
