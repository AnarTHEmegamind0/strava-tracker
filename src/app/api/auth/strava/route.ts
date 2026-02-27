import { NextRequest, NextResponse } from 'next/server';
import { getAuthorizationUrl } from '@/lib/strava';

export async function GET(request: NextRequest) {
  const headerHost = request.headers.get('x-forwarded-host') || request.headers.get('host');
  const headerProto = request.headers.get('x-forwarded-proto') || 'https';
  const safeOrigin = headerHost ? `${headerProto}://${headerHost}` : request.nextUrl.origin;

  const envRedirectUri = process.env.STRAVA_REDIRECT_URI;

  const isLocalOrigin = safeOrigin.includes('localhost') || safeOrigin.includes('127.0.0.1');
  const envPointsToLocalhost =
    !!envRedirectUri &&
    (envRedirectUri.includes('localhost') || envRedirectUri.includes('127.0.0.1'));

  const redirectUri =
    envRedirectUri && !(envPointsToLocalhost && !isLocalOrigin)
      ? envRedirectUri
      : `${safeOrigin}/api/auth/callback`;

  const authUrl = getAuthorizationUrl(redirectUri);
  return NextResponse.redirect(authUrl);
}
