import { NextRequest, NextResponse } from 'next/server';
import { getUserByStravaId, getActivitiesByUserId } from '@/lib/db';
import {
  calculateWeeklyStats,
  calculateMonthlyStats,
  getWeeklyStatsHistory,
  getActivityTypeBreakdown,
  getPersonalRecords,
  getWeekComparison,
} from '@/lib/statistics';
import { startOfWeek } from 'date-fns';

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
    const activities = getActivitiesByUserId(user.id, 500);

    // Calculate various statistics
    const thisWeekStart = startOfWeek(new Date(), { weekStartsOn: 1 });
    const weeklyStats = calculateWeeklyStats(activities, thisWeekStart);
    const monthlyStats = calculateMonthlyStats(activities);
    const weeklyHistory = getWeeklyStatsHistory(activities, 8);
    const activityBreakdown = getActivityTypeBreakdown(activities);
    const personalRecords = getPersonalRecords(activities);
    const weekComparison = getWeekComparison(activities);

    return NextResponse.json({
      weeklyStats,
      monthlyStats,
      weeklyHistory,
      activityBreakdown,
      personalRecords,
      weekComparison,
    });
  } catch (err) {
    console.error('Error fetching statistics:', err);
    return NextResponse.json({ error: 'Failed to fetch statistics' }, { status: 500 });
  }
}
