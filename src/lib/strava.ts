import { 
  StravaTokens, 
  StravaAthlete, 
  StravaActivity, 
  ActivityStream, 
  ActivityLap, 
  AthleteStats,
  ActivityZone,
  DetailedStravaActivity
} from '@/types';
import { getStravaCredentials } from '@/lib/db';

const STRAVA_API_BASE = 'https://www.strava.com/api/v3';
const STRAVA_OAUTH_URL = 'https://www.strava.com/oauth';

// Get credentials from database or fallback to env
function getCredentials(): { clientId: string; clientSecret: string } {
  const dbCredentials = getStravaCredentials();
  
  if (dbCredentials) {
    return dbCredentials;
  }
  
  // Fallback to environment variables
  return {
    clientId: process.env.STRAVA_CLIENT_ID || '',
    clientSecret: process.env.STRAVA_CLIENT_SECRET || '',
  };
}

export function getAuthorizationUrl(): string {
  const { clientId } = getCredentials();
  const redirectUri = process.env.STRAVA_REDIRECT_URI || 'http://localhost:3000/api/auth/callback';
  const scope = 'read,activity:read_all,profile:read_all';
  
  return `${STRAVA_OAUTH_URL}/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=${scope}`;
}

export async function exchangeCodeForTokens(code: string): Promise<StravaTokens> {
  const { clientId, clientSecret } = getCredentials();
  
  const response = await fetch(`${STRAVA_OAUTH_URL}/token`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      client_id: clientId,
      client_secret: clientSecret,
      code,
      grant_type: 'authorization_code',
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to exchange code: ${error}`);
  }

  return response.json();
}

export async function refreshAccessToken(refreshToken: string): Promise<StravaTokens> {
  const { clientId, clientSecret } = getCredentials();
  
  const response = await fetch(`${STRAVA_OAUTH_URL}/token`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      client_id: clientId,
      client_secret: clientSecret,
      refresh_token: refreshToken,
      grant_type: 'refresh_token',
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to refresh token: ${error}`);
  }

  return response.json();
}

export async function getAthlete(accessToken: string): Promise<StravaAthlete> {
  const response = await fetch(`${STRAVA_API_BASE}/athlete`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch athlete');
  }

  return response.json();
}

export async function getActivities(
  accessToken: string,
  page = 1,
  perPage = 30
): Promise<StravaActivity[]> {
  const response = await fetch(
    `${STRAVA_API_BASE}/athlete/activities?page=${page}&per_page=${perPage}`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error('Failed to fetch activities');
  }

  return response.json();
}

export async function getActivityById(
  accessToken: string,
  activityId: number,
  includeAllEfforts = true
): Promise<DetailedStravaActivity> {
  const response = await fetch(
    `${STRAVA_API_BASE}/activities/${activityId}?include_all_efforts=${includeAllEfforts}`, 
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error('Failed to fetch activity');
  }

  return response.json();
}

// Get Activity Streams (GPS, heartrate, etc.)
export async function getActivityStreams(
  accessToken: string,
  activityId: number,
  keys: string[] = ['time', 'distance', 'latlng', 'altitude', 'heartrate', 'cadence', 'watts', 'velocity_smooth', 'grade_smooth']
): Promise<ActivityStream> {
  const keysParam = keys.join(',');
  const response = await fetch(
    `${STRAVA_API_BASE}/activities/${activityId}/streams?keys=${keysParam}&key_by_type=true`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  if (!response.ok) {
    // Streams may not be available for manual activities
    if (response.status === 404) {
      return {};
    }
    throw new Error('Failed to fetch activity streams');
  }

  const data = await response.json();
  
  // Transform the response to our format
  const streams: ActivityStream = {};
  if (data.time) streams.time = data.time.data;
  if (data.distance) streams.distance = data.distance.data;
  if (data.latlng) streams.latlng = data.latlng.data;
  if (data.altitude) streams.altitude = data.altitude.data;
  if (data.heartrate) streams.heartrate = data.heartrate.data;
  if (data.cadence) streams.cadence = data.cadence.data;
  if (data.watts) streams.watts = data.watts.data;
  if (data.velocity_smooth) streams.velocity_smooth = data.velocity_smooth.data;
  if (data.grade_smooth) streams.grade_smooth = data.grade_smooth.data;
  
  return streams;
}

// Get Activity Laps
export async function getActivityLaps(
  accessToken: string,
  activityId: number
): Promise<ActivityLap[]> {
  const response = await fetch(
    `${STRAVA_API_BASE}/activities/${activityId}/laps`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error('Failed to fetch activity laps');
  }

  return response.json();
}

// Get Athlete Stats
export async function getAthleteStats(
  accessToken: string,
  athleteId: number
): Promise<AthleteStats> {
  const response = await fetch(
    `${STRAVA_API_BASE}/athletes/${athleteId}/stats`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error('Failed to fetch athlete stats');
  }

  return response.json();
}

// Get Athlete Zones (Heart Rate & Power)
export async function getAthleteZones(
  accessToken: string
): Promise<{ heart_rate: { custom_zones: boolean; zones: { min: number; max: number }[] }; power?: { zones: { min: number; max: number }[] } }> {
  const response = await fetch(
    `${STRAVA_API_BASE}/athlete/zones`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error('Failed to fetch athlete zones');
  }

  return response.json();
}

// Get Activity Zones
export async function getActivityZones(
  accessToken: string,
  activityId: number
): Promise<ActivityZone[]> {
  const response = await fetch(
    `${STRAVA_API_BASE}/activities/${activityId}/zones`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  if (!response.ok) {
    // Zones may not be available
    if (response.status === 404) {
      return [];
    }
    throw new Error('Failed to fetch activity zones');
  }

  return response.json();
}

// Helper to ensure valid access token
export async function getValidAccessToken(
  accessToken: string,
  refreshToken: string,
  expiresAt: number
): Promise<{ accessToken: string; refreshToken: string; expiresAt: number; refreshed: boolean }> {
  const now = Math.floor(Date.now() / 1000);
  
  // Token is still valid (with 5 minute buffer)
  if (expiresAt > now + 300) {
    return { accessToken, refreshToken, expiresAt, refreshed: false };
  }

  // Need to refresh
  const tokens = await refreshAccessToken(refreshToken);
  return {
    accessToken: tokens.access_token,
    refreshToken: tokens.refresh_token,
    expiresAt: tokens.expires_at,
    refreshed: true,
  };
}

// Format helpers
export function formatDistance(meters: number): string {
  const km = meters / 1000;
  return `${km.toFixed(2)} km`;
}

export function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  
  if (hours > 0) {
    return `${hours}h ${minutes}m ${secs}s`;
  }
  return `${minutes}m ${secs}s`;
}

export function formatPace(metersPerSecond: number): string {
  if (metersPerSecond === 0) return '-';
  const minPerKm = (1000 / metersPerSecond) / 60;
  const minutes = Math.floor(minPerKm);
  const seconds = Math.round((minPerKm - minutes) * 60);
  return `${minutes}:${seconds.toString().padStart(2, '0')} /km`;
}

export function formatSpeed(metersPerSecond: number): string {
  const kmh = metersPerSecond * 3.6;
  return `${kmh.toFixed(1)} km/h`;
}
