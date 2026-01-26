import { NextRequest, NextResponse } from 'next/server';
import { exchangeCodeForTokens } from '@/lib/strava';
import { upsertUser } from '@/lib/db';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get('code');
  const error = searchParams.get('error');

  if (error) {
    return NextResponse.redirect(new URL('/?error=auth_denied', request.url));
  }

  if (!code) {
    return NextResponse.redirect(new URL('/?error=no_code', request.url));
  }

  try {
    const tokens = await exchangeCodeForTokens(code);
    
    if (!tokens.athlete) {
      return NextResponse.redirect(new URL('/?error=no_athlete', request.url));
    }

    // Save user to database
    const user = upsertUser({
      strava_id: tokens.athlete.id,
      username: tokens.athlete.username || '',
      firstname: tokens.athlete.firstname || '',
      lastname: tokens.athlete.lastname || '',
      profile_url: tokens.athlete.profile || '',
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token,
      token_expires_at: tokens.expires_at,
    });

    // Create response with cookie
    const response = NextResponse.redirect(new URL('/', request.url));
    
    // Set user session cookie (simple approach - in production use proper session management)
    response.cookies.set('strava_user_id', String(user.strava_id), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 30, // 30 days
    });

    return response;
  } catch (err) {
    console.error('OAuth callback error:', err);
    return NextResponse.redirect(new URL('/?error=token_exchange', request.url));
  }
}
