'use client';

import { StravaAthlete } from '@/types';
import AlertsDropdown from '@/components/alerts/AlertsDropdown';
import AppTopbar from '@/components/layout/AppTopbar';

interface DashboardHeaderProps {
  athlete: StravaAthlete | null;
  title: string;
}

export default function DashboardHeader({ athlete, title }: DashboardHeaderProps) {
  const fullName = athlete ? `${athlete.firstname} ${athlete.lastname}`.trim() : '';
  const initials = athlete
    ? `${athlete.firstname?.[0] || ''}${athlete.lastname?.[0] || ''}`.toUpperCase()
    : 'AT';

  return (
    <AppTopbar
      title={title}
      actions={<AlertsDropdown userId={athlete?.id || 1} />}
      profile={
        athlete
          ? {
              fullName,
              username: athlete.username,
              imageUrl: athlete.profile,
              initials,
            }
          : null
      }
    />
  );
}
