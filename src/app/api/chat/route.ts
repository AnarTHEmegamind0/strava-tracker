import { NextRequest, NextResponse } from 'next/server';
import { getUserByStravaId, getActivitiesByUserId, saveChatMessage, getChatHistory } from '@/lib/db';
import { chat } from '@/lib/groq';

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
    const { message } = await request.json();

    if (!message || typeof message !== 'string') {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    // Get user's activities for context
    const activities = getActivitiesByUserId(user.id, 30);
    
    // Get chat history
    const chatHistory = getChatHistory(user.id, 10).reverse();
    const formattedHistory = chatHistory.map(msg => ({
      role: msg.role as 'user' | 'assistant',
      content: msg.content,
    }));

    // Save user message
    saveChatMessage(user.id, 'user', message);

    // Get AI response
    const response = await chat(message, activities, formattedHistory);

    if (response.error) {
      return NextResponse.json({ error: response.error }, { status: 500 });
    }

    // Save assistant response
    saveChatMessage(user.id, 'assistant', response.message);

    return NextResponse.json({ message: response.message });
  } catch (err) {
    console.error('Chat error:', err);
    return NextResponse.json({ error: 'Failed to process chat' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  const stravaUserId = request.cookies.get('strava_user_id')?.value;

  if (!stravaUserId) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  const user = getUserByStravaId(Number(stravaUserId));
  
  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  const chatHistory = getChatHistory(user.id, 50).reverse();
  
  return NextResponse.json({ messages: chatHistory });
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

  const { clearChatHistory } = await import('@/lib/db');
  clearChatHistory(user.id);
  
  return NextResponse.json({ success: true });
}
