import { NextResponse } from 'next/server';
import { getAuthorizationUrl } from '@/lib/strava';

export async function GET(request: Request) {
  const origin = new URL(request.url).origin;
  const redirectUri = process.env.STRAVA_REDIRECT_URI || `${origin}/api/auth/callback`;
  const authUrl = getAuthorizationUrl(redirectUri);
  return NextResponse.redirect(authUrl);
}
