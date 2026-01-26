import { NextRequest, NextResponse } from 'next/server';
import { getUserByStravaId, getGoalsByUserId, createGoal, updateGoal, deleteGoal, getActivitiesByUserId } from '@/lib/db';
import { calculateGoalProgress } from '@/lib/statistics';
import { GoalWithProgress } from '@/types';

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
    const goals = getGoalsByUserId(user.id);
    const activities = getActivitiesByUserId(user.id, 200);

    // Calculate progress for each goal
    const goalsWithProgress: GoalWithProgress[] = goals.map(goal => {
      const progress = calculateGoalProgress(
        activities,
        goal.type,
        goal.metric,
        goal.activity_type
      );

      const progressPercent = goal.target_value > 0 
        ? Math.min((progress.currentValue / goal.target_value) * 100, 100)
        : 0;

      return {
        ...goal,
        current_value: progress.currentValue,
        progress_percent: progressPercent,
        days_left: progress.daysLeft,
      };
    });

    return NextResponse.json({ goals: goalsWithProgress });
  } catch (err) {
    console.error('Error fetching goals:', err);
    return NextResponse.json({ error: 'Failed to fetch goals' }, { status: 500 });
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
    const { title, type, metric, target_value, activity_type } = body;

    if (!title || !type || !metric || target_value === undefined) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const goal = createGoal({
      user_id: user.id,
      title,
      type,
      metric,
      target_value,
      activity_type: activity_type || null,
    });

    return NextResponse.json({ goal });
  } catch (err) {
    console.error('Error creating goal:', err);
    return NextResponse.json({ error: 'Failed to create goal' }, { status: 500 });
  }
}

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
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json({ error: 'Goal ID is required' }, { status: 400 });
    }

    const goal = updateGoal(id, updates);
    if (!goal) {
      return NextResponse.json({ error: 'Goal not found' }, { status: 404 });
    }

    return NextResponse.json({ goal });
  } catch (err) {
    console.error('Error updating goal:', err);
    return NextResponse.json({ error: 'Failed to update goal' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
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
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Goal ID is required' }, { status: 400 });
    }

    const deleted = deleteGoal(Number(id));
    if (!deleted) {
      return NextResponse.json({ error: 'Goal not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Error deleting goal:', err);
    return NextResponse.json({ error: 'Failed to delete goal' }, { status: 500 });
  }
}
