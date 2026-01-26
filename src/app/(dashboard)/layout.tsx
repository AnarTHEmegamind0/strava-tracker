'use client';

import { useApp } from '@/lib/context';
import Sidebar from '@/components/layout/Sidebar';
import { AppProvider } from '@/lib/context';

function DashboardLayoutContent({ children }: { children: React.ReactNode }) {
  const { athlete, loading } = useApp();

  if (loading) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-900 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#FC4C02] border-t-transparent" />
          <p className="text-gray-500 dark:text-gray-400">Ачааллаж байна...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 flex">
      <Sidebar athleteName={athlete ? `${athlete.firstname} ${athlete.lastname}` : undefined} />
      <main className="flex-1 overflow-auto pt-14 md:pt-0">
        {children}
      </main>
    </div>
  );
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <AppProvider>
      <DashboardLayoutContent>{children}</DashboardLayoutContent>
    </AppProvider>
  );
}
