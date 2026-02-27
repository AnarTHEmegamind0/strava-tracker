'use client';

import type { ReactNode } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface AppTopbarProps {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
  profile?: {
    fullName: string;
    username?: string | null;
    imageUrl?: string | null;
    initials: string;
  } | null;
}

export default function AppTopbar({ title, subtitle, actions, profile }: AppTopbarProps) {
  return (
    <header className="sticky top-0 z-30 border-b border-border/80 bg-background/90 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3.5 md:px-6">
        <div className="min-w-0">
          <h1 className="truncate text-xl font-semibold tracking-tight md:text-[1.35rem]">{title}</h1>
          {subtitle && <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>}
        </div>

        <div className="flex shrink-0 items-center gap-3">
          {actions}

          {profile && (
            <div
              className={cn(
                'hidden items-center gap-3 rounded-xl border border-border/90 bg-card/95 px-3 py-2 shadow-sm sm:flex',
              )}
            >
              <div className="text-right">
                <p className="text-sm font-medium leading-none">{profile.fullName}</p>
                <div className="mt-1">
                  <Badge variant="secondary" className="font-normal">
                    @{profile.username || 'athlete'}
                  </Badge>
                </div>
              </div>
              <Avatar>
                {profile.imageUrl ? (
                  <AvatarImage src={profile.imageUrl} alt={profile.fullName} />
                ) : (
                  <AvatarFallback>{profile.initials}</AvatarFallback>
                )}
              </Avatar>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
