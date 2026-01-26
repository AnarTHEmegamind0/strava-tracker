import { NextRequest, NextResponse } from 'next/server';
import { 
  getUserByStravaId, 
  getUserAlerts, 
  getUnreadAlertCount,
  markAlertAsRead,
  markAllAlertsAsRead,
  deleteAlert,
} from '@/lib/db';

// GET /api/alerts - Get user's alerts
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
    const limit = parseInt(searchParams.get('limit') || '20');
    const unreadOnly = searchParams.get('unreadOnly') === 'true';
    
    const alerts = getUserAlerts(user.id, limit, unreadOnly);
    const unreadCount = getUnreadAlertCount(user.id);
    
    return NextResponse.json({
      alerts,
      unreadCount,
    });
  } catch (err) {
    console.error('Alerts error:', err);
    return NextResponse.json({ error: 'Failed to get alerts' }, { status: 500 });
  }
}

// POST /api/alerts - Mark alert(s) as read
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
    const { alertId, markAll } = body;
    
    if (markAll) {
      const count = markAllAlertsAsRead(user.id);
      return NextResponse.json({ success: true, count });
    }
    
    if (alertId) {
      const success = markAlertAsRead(alertId);
      return NextResponse.json({ success });
    }
    
    return NextResponse.json({ error: 'Missing alertId or markAll' }, { status: 400 });
  } catch (err) {
    console.error('Mark alert error:', err);
    return NextResponse.json({ error: 'Failed to mark alert' }, { status: 500 });
  }
}

// DELETE /api/alerts - Delete an alert
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
    const alertId = parseInt(searchParams.get('id') || '0');
    
    if (!alertId) {
      return NextResponse.json({ error: 'Missing alert id' }, { status: 400 });
    }
    
    const success = deleteAlert(alertId);
    return NextResponse.json({ success });
  } catch (err) {
    console.error('Delete alert error:', err);
    return NextResponse.json({ error: 'Failed to delete alert' }, { status: 500 });
  }
}
