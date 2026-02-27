'use client';

import { useApp } from '@/lib/context';
import { AppProvider } from '@/lib/context';
import AppShell from '@/components/layout/AppShell';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

function DashboardLayoutContent({ children }: { children: React.ReactNode }) {
  const { loading } = useApp();

  if (loading) {
    return (
      <div className="min-h-screen bg-background px-4 py-6 md:px-6">
        <div className="mx-auto flex max-w-7xl items-center justify-center pt-16 md:pt-24">
          <Card className="w-full max-w-lg">
            <CardContent className="flex items-center gap-4 p-6">
              <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-56" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <AppShell>
      {children}
    </AppShell>
  );
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <AppProvider>
      <DashboardLayoutContent>{children}</DashboardLayoutContent>
    </AppProvider>
  );
}
