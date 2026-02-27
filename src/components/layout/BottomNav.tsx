'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

const navItems = [
  {
    href: '/dashboard',
    label: 'Нүүр',
    icon: (
      <svg className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l9-9 9 9M5 10v10a1 1 0 001 1h4v-7h4v7h4a1 1 0 001-1V10" />
      </svg>
    ),
    iconFilled: (
      <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 2L3 11h3v9a1 1 0 001 1h4v-7h2v7h4a1 1 0 001-1v-9h3L12 2z" />
      </svg>
    ),
  },
  {
    href: '/training',
    label: 'Дасгал',
    icon: (
      <svg className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M13 2L4 14h7l-1 8 10-14h-7V2z" />
      </svg>
    ),
    iconFilled: (
      <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
        <path d="M13 2L4 14h7l-1 8 10-14h-7V2z" />
      </svg>
    ),
  },
  {
    href: '/achievements',
    label: 'Амжилт',
    icon: (
      <svg className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M8 4h8v3a4 4 0 01-4 4 4 4 0 01-4-4V4zm0 0H5a2 2 0 00-2 2v1a4 4 0 004 4h1m8-7h3a2 2 0 012 2v1a4 4 0 01-4 4h-1M9 14h6m-5 0v3a2 2 0 002 2 2 2 0 002-2v-3" />
      </svg>
    ),
    iconFilled: (
      <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
        <path d="M8 4h8v3a4 4 0 01-8 0V4zm-3 0h2v3a5.97 5.97 0 01-.28 1.82A4 4 0 013 7V6a2 2 0 012-2zm14 0h-2v3a5.97 5.97 0 00.28 1.82A4 4 0 0021 7V6a2 2 0 00-2-2zM9 14h6v3a3 3 0 11-6 0v-3z" />
      </svg>
    ),
  },
  {
    href: '/predictions',
    label: 'Таамаг',
    icon: (
      <svg className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l5-5 4 4 7-8" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M16 7h4v4" />
      </svg>
    ),
    iconFilled: (
      <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
        <path d="M3.293 16.293a1 1 0 011.414 0L9 20.586l4.293-4.293a1 1 0 011.414 0L22 23.586V17a1 1 0 112 0v8a1 1 0 01-1 1h-8a1 1 0 110-2h6.586L14 17.414l-4.293 4.293a1 1 0 01-1.414 0l-5-5a1 1 0 010-1.414z" />
      </svg>
    ),
  },
  {
    href: '/coach',
    label: 'AI Coach',
    icon: (
      <svg className="h-7 w-7" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456z" />
      </svg>
    ),
    iconFilled: (
      <svg className="h-7 w-7" fill="currentColor" viewBox="0 0 24 24">
        <path fillRule="evenodd" d="M9 4.5a.75.75 0 01.721.544l.813 2.846a3.75 3.75 0 002.576 2.576l2.846.813a.75.75 0 010 1.442l-2.846.813a3.75 3.75 0 00-2.576 2.576l-.813 2.846a.75.75 0 01-1.442 0l-.813-2.846a3.75 3.75 0 00-2.576-2.576l-2.846-.813a.75.75 0 010-1.442l2.846-.813A3.75 3.75 0 007.466 7.89l.813-2.846A.75.75 0 019 4.5zM18 1.5a.75.75 0 01.728.568l.258 1.036c.236.94.97 1.674 1.91 1.91l1.036.258a.75.75 0 010 1.456l-1.036.258c-.94.236-1.674.97-1.91 1.91l-.258 1.036a.75.75 0 01-1.456 0l-.258-1.036a2.625 2.625 0 00-1.91-1.91l-1.036-.258a.75.75 0 010-1.456l1.036-.258a2.625 2.625 0 001.91-1.91l.258-1.036A.75.75 0 0118 1.5z" clipRule="evenodd" />
      </svg>
    ),
  },
  {
    href: '/statistics',
    label: 'Статистик',
    icon: (
      <svg className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 3v18h18M7 16v-4m4 4v-8m4 8v-6m4 6v-10" />
      </svg>
    ),
    iconFilled: (
      <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
        <path d="M3 3v18h18M7 12v4H5v-4h2zm4-4v8H9V8h2zm4 2v6h-2v-6h2zm4-4v10h-2V6h2z" />
      </svg>
    ),
  },
  {
    href: '/plans',
    label: 'Төлөвлөгөө',
    icon: (
      <svg className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" />
      </svg>
    ),
    iconFilled: (
      <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
        <path d="M7 5a1 1 0 011-1h13v2H8a1 1 0 01-1-1zM7 11a1 1 0 011-1h13v2H8a1 1 0 01-1-1zM7 17a1 1 0 011-1h13v2H8a1 1 0 01-1-1zM3 6a1 1 0 100-2 1 1 0 000 2zm0 6a1 1 0 100-2 1 1 0 000 2zm0 6a1 1 0 100-2 1 1 0 000 2z" />
      </svg>
    ),
  },
  {
    href: '/goals',
    label: 'Зорилго',
    icon: (
      <svg className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
        <circle cx="12" cy="12" r="9" />
        <circle cx="12" cy="12" r="5" />
        <circle cx="12" cy="12" r="1.5" fill="currentColor" stroke="none" />
      </svg>
    ),
    iconFilled: (
      <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
        <path fillRule="evenodd" d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm0 4a6 6 0 100 12 6 6 0 000-12zm0 3a3 3 0 100 6 3 3 0 000-6z" clipRule="evenodd" />
      </svg>
    ),
  },
  {
    href: '/settings',
    label: 'Профайл',
    icon: (
      <svg className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6.75a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.5 20.1a7.5 7.5 0 0115 0" />
      </svg>
    ),
    iconFilled: (
      <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
        <path fillRule="evenodd" d="M12 2a4.75 4.75 0 100 9.5A4.75 4.75 0 0012 2zM3.5 21a8.5 8.5 0 0117 0 .5.5 0 01-.5.5h-16a.5.5 0 01-.5-.5z" clipRule="evenodd" />
      </svg>
    ),
  },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden safe-bottom">
      <div className="mx-2 mb-0.5 rounded-2xl border border-border/50 bg-card/95 shadow-lg backdrop-blur-xl">
        <div className="no-scrollbar flex items-center gap-1 overflow-x-auto px-1 py-1.5">
          {navItems.map((item) => {
            const isActive = pathname === item.href || pathname?.startsWith(`${item.href}/`);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex min-w-[74px] shrink-0 flex-col items-center gap-0.5 rounded-lg px-2 py-1.5 transition-all duration-200',
                  isActive ? 'bg-secondary text-primary' : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                )}
              >
                <div className={cn(
                  'relative transition-transform duration-200',
                  isActive && 'scale-105'
                )}>
                  {isActive ? item.iconFilled : item.icon}
                  {isActive && (
                    <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-primary" />
                  )}
                </div>
                <span className={cn(
                  'text-[10px] font-medium leading-none',
                  isActive && 'font-semibold'
                )}>
                  {item.label}
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
