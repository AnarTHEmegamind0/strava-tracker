import { NextResponse } from 'next/server';
import { getAuthorizationUrl } from '@/lib/strava';

export async function GET(request: Request) {
  const origin = new URL(request.url).origin;
  const envRedirectUri = process.env.STRAVA_REDIRECT_URI;

  const isLocalOrigin = origin.includes('localhost') || origin.includes('127.0.0.1');
  const envPointsToLocalhost =
    !!envRedirectUri &&
    (envRedirectUri.includes('localhost') || envRedirectUri.includes('127.0.0.1'));

  const redirectUri =
    envRedirectUri && !(envPointsToLocalhost && !isLocalOrigin)
      ? envRedirectUri
      : `${origin}/api/auth/callback`;

  const authUrl = getAuthorizationUrl(redirectUri);
  return NextResponse.redirect(authUrl);
}
