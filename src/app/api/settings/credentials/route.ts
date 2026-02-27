import { NextResponse } from 'next/server';
import { clearStravaCredentials, getStravaCredentials, setStravaCredentials, hasStravaCredentials } from '@/lib/db';

// GET - Check if credentials exist (don't return actual values for security)
export async function GET() {
  try {
    const hasCredentials = hasStravaCredentials();
    const credentials = getStravaCredentials();
    
    return NextResponse.json({
      configured: hasCredentials,
      // Only return masked version for UI display
      clientId: credentials?.clientId ? `${credentials.clientId.slice(0, 4)}****` : null,
    });
  } catch (error) {
    console.error('Failed to get credentials:', error);
    return NextResponse.json({ error: 'Failed to get credentials' }, { status: 500 });
  }
}

// POST - Save credentials
export async function POST(request: Request) {
  try {
    const { clientId, clientSecret } = await request.json();
    
    if (!clientId || !clientSecret) {
      return NextResponse.json(
        { error: 'Client ID and Client Secret are required' },
        { status: 400 }
      );
    }
    
    // Validate format (basic validation)
    if (clientId.length < 4 || clientSecret.length < 10) {
      return NextResponse.json(
        { error: 'Invalid credentials format' },
        { status: 400 }
      );
    }
    
    setStravaCredentials(clientId.trim(), clientSecret.trim());
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to save credentials:', error);
    return NextResponse.json({ error: 'Failed to save credentials' }, { status: 500 });
  }
}

// DELETE - Clear stored credentials so env fallback can be used
export async function DELETE() {
  try {
    clearStravaCredentials();
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to clear credentials:', error);
    return NextResponse.json({ error: 'Failed to clear credentials' }, { status: 500 });
  }
}
