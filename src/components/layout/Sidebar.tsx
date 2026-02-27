'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState, type ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const navItems = [
  { href: '/dashboard', label: 'Хянах самбар', icon: 'home' },
  { href: '/training', label: 'Дасгалын бүртгэл', icon: 'activity' },
  { href: '/statistics', label: 'Статистик', icon: 'chart' },
  { href: '/achievements', label: 'Амжилтууд', icon: 'trophy' },
  { href: '/predictions', label: 'Таамаглал', icon: 'prediction' },
  { href: '/coach', label: 'AI Дасгалжуулагч', icon: 'bot' },
  { href: '/plans', label: 'Төлөвлөгөө', icon: 'plan' },
  { href: '/goals', label: 'Зорилго', icon: 'target' },
];

const bottomNavItems = [{ href: '/settings', label: 'Тохиргоо', icon: 'settings' }];

function Icon({ name, className = '' }: { name: string; className?: string }): ReactNode {
  const icons: Record<string, ReactNode> = {
    home: (
      <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M3 12l9-9 9 9M5 10v10a1 1 0 001 1h4v-7h4v7h4a1 1 0 001-1V10" />
      </svg>
    ),
    activity: (
      <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M13 2L4 14h7l-1 8 10-14h-7V2z" />
      </svg>
    ),
    chart: (
      <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M4 19V9m8 10V5m8 14v-7" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M2 19h20" />
      </svg>
    ),
    trophy: (
      <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M8 4h8v3a4 4 0 01-4 4 4 4 0 01-4-4V4zm0 0H5a2 2 0 00-2 2v1a4 4 0 004 4h1m8-7h3a2 2 0 012 2v1a4 4 0 01-4 4h-1M9 14h6m-5 0v3a2 2 0 002 2 2 2 0 002-2v-3" />
      </svg>
    ),
    prediction: (
      <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M4 16l5-5 4 4 7-8" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M16 7h4v4" />
      </svg>
    ),
    bot: (
      <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <rect x="4" y="7" width="16" height="10" rx="3" strokeWidth="1.8" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 4v3M9 12h.01M15 12h.01M9 17v2m6-2v2" />
      </svg>
    ),
    target: (
      <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <circle cx="12" cy="12" r="8" strokeWidth="1.8" />
        <circle cx="12" cy="12" r="4" strokeWidth="1.8" />
        <circle cx="12" cy="12" r="1.2" fill="currentColor" stroke="none" />
      </svg>
    ),
    plan: (
      <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <rect x="5" y="3" width="14" height="18" rx="2" strokeWidth="1.8" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 8h6M9 12h6M9 16h3" />
      </svg>
    ),
    settings: (
      <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 8.5a3.5 3.5 0 100 7 3.5 3.5 0 000-7zm8 3.5l-2 .7a6.9 6.9 0 01-.5 1.2l1 1.9-1.8 1.8-1.9-1a6.9 6.9 0 01-1.2.5L12 20l-1.4-2.1a6.9 6.9 0 01-1.2-.5l-1.9 1-1.8-1.8 1-1.9a6.9 6.9 0 01-.5-1.2L4 12l2.1-1.4c.1-.4.3-.8.5-1.2l-1-1.9 1.8-1.8 1.9 1c.4-.2.8-.4 1.2-.5L12 4l1.4 2.1c.4.1.8.3 1.2.5l1.9-1 1.8 1.8-1 1.9c.2.4.4.8.5 1.2L20 12z" />
      </svg>
    ),
    menu: (
      <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M4 6h16M4 12h16M4 18h16" />
      </svg>
    ),
    close: (
      <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M6 6l12 12M18 6L6 18" />
      </svg>
    ),
    collapse: (
      <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M15 5l-6 7 6 7" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M20 5v14" />
      </svg>
    ),
    expand: (
      <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 5l6 7-6 7" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M4 5v14" />
      </svg>
    ),
  };
  return icons[name] ?? null;
}

interface SidebarProps {
  athleteName?: string;
}

function NavLink({
  href,
  label,
  icon,
  active,
  collapsed,
  onClick,
}: {
  href: string;
  label: string;
  icon: string;
  active: boolean;
  collapsed: boolean;
  onClick?: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      title={collapsed ? label : undefined}
      className={cn(
        'group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-card',
        active
          ? 'bg-secondary text-primary'
          : 'text-muted-foreground hover:bg-muted hover:text-foreground',
        collapsed && 'justify-center px-2',
      )}
    >
      {active && <span className="absolute left-0 top-1.5 bottom-1.5 w-0.5 rounded-full bg-primary" />}
      <Icon name={icon} className="h-5 w-5 shrink-0" />
      {!collapsed && <span className="truncate font-medium">{label}</span>}
    </Link>
  );
}

export default function Sidebar({ athleteName }: SidebarProps) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setMobileOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileOpen]);

  const renderContent = (isMobile = false) => {
    const isCollapsed = !isMobile && collapsed;

    return (
      <>
        <div className={cn('border-b border-border p-3', isCollapsed && 'px-2')}>
          <Link
            href="/dashboard"
            className={cn(
              'flex items-center gap-3 rounded-lg px-2 py-2 hover:bg-muted',
              isCollapsed && 'justify-center px-0',
            )}
          >
            <div className="grid h-9 w-9 place-items-center rounded-lg bg-primary/10 text-primary">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M15.387 17.944l-2.089-4.116h-3.065L15.387 24l5.15-10.172h-3.066m-7.008-5.599l2.836 5.598h4.172L10.463 0l-7.03 13.828h4.169" />
              </svg>
            </div>
            {!isCollapsed && (
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-foreground">Strava Tracker</p>
                <p className="truncate text-xs text-muted-foreground">
                  {athleteName || 'Дасгалын тэмдэглэл'}
                </p>
              </div>
            )}
          </Link>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto p-2">
          {navItems.map((item) => {
            const active = pathname === item.href || pathname?.startsWith(`${item.href}/`);
            return (
              <NavLink
                key={item.href}
                href={item.href}
                label={item.label}
                icon={item.icon}
                active={!!active}
                collapsed={isCollapsed}
                onClick={isMobile ? () => setMobileOpen(false) : undefined}
              />
            );
          })}
        </nav>

        <div className="space-y-1 border-t border-border p-2">
          {bottomNavItems.map((item) => {
            const active = pathname === item.href || pathname?.startsWith(`${item.href}/`);
            return (
              <NavLink
                key={item.href}
                href={item.href}
                label={item.label}
                icon={item.icon}
                active={!!active}
                collapsed={isCollapsed}
                onClick={isMobile ? () => setMobileOpen(false) : undefined}
              />
            );
          })}

          <Button
            variant="ghost"
            size={isCollapsed ? 'icon' : 'md'}
            className={cn(
              'hidden w-full md:inline-flex justify-start text-muted-foreground hover:text-foreground',
              isCollapsed && 'justify-center',
            )}
            onClick={() => setCollapsed((prev) => !prev)}
            title={isCollapsed ? 'Expand' : 'Collapse'}
            leadingIcon={<Icon name={isCollapsed ? 'expand' : 'collapse'} className="h-5 w-5" />}
          >
            {!isCollapsed && 'Хураах'}
          </Button>
        </div>
      </>
    );
  };

  return (
    <>
      <div className="fixed inset-x-0 top-0 z-40 flex h-14 items-center justify-between border-b border-border bg-card/95 px-4 backdrop-blur md:hidden">
        <Link href="/dashboard" className="flex items-center gap-2">
          <div className="grid h-8 w-8 place-items-center rounded-md bg-primary/10 text-primary">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M15.387 17.944l-2.089-4.116h-3.065L15.387 24l5.15-10.172h-3.066m-7.008-5.599l2.836 5.598h4.172L10.463 0l-7.03 13.828h4.169" />
            </svg>
          </div>
          <div>
            <p className="text-sm font-semibold">Strava Tracker</p>
            <p className="text-[11px] text-muted-foreground">Дасгалын тэмдэглэл</p>
          </div>
        </Link>

        <Button
          variant="ghost"
          size="icon"
          aria-label={mobileOpen ? 'Close navigation' : 'Open navigation'}
          onClick={() => setMobileOpen((prev) => !prev)}
        >
          <Icon name={mobileOpen ? 'close' : 'menu'} className="h-5 w-5" />
        </Button>
      </div>

      {mobileOpen && (
        <button
          aria-label="Close navigation overlay"
          className="fixed inset-0 z-40 bg-black/45 md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <aside
        className={cn(
          'fixed inset-y-14 left-0 z-50 flex w-72 flex-col border-r border-border bg-card shadow-xl transition-transform duration-200 md:hidden',
          mobileOpen ? 'translate-x-0' : '-translate-x-full',
        )}
      >
        {renderContent(true)}
      </aside>

      <aside
        className={cn(
          'hidden md:sticky md:top-0 md:flex md:h-screen md:flex-col md:border-r md:border-border md:bg-card',
          collapsed ? 'md:w-20' : 'md:w-72',
        )}
      >
        {renderContent(false)}
      </aside>
    </>
  );
}
