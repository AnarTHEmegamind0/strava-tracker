'use client';

import type { ReactNode } from 'react';
import Sidebar from '@/components/layout/Sidebar';
import BottomNav from '@/components/layout/BottomNav';
import { cn } from '@/lib/utils';

interface AppShellProps {
  athleteName?: string;
  children: ReactNode;
  className?: string;
}

export default function AppShell({ athleteName, children, className }: AppShellProps) {
  return (
    <div className="min-h-screen bg-transparent text-foreground md:grid md:grid-cols-[auto_1fr]">
      <Sidebar athleteName={athleteName} />
      <main className={cn('min-w-0 flex-1 pt-14 pb-24 md:pb-0 md:pt-0', className)}>
        {children}
      </main>
      <BottomNav />
    </div>
  );
}
