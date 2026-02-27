import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

const actions = [
  {
    href: '/achievements',
    label: 'Амжилт',
    emoji: '🏆',
    hint: 'Badge, milestones',
    tone: 'from-yellow-500/10 to-orange-500/10',
  },
  {
    href: '/coach',
    label: 'AI Коуч',
    emoji: '🤖',
    hint: 'Өдрийн зөвлөмж',
    tone: 'from-blue-500/10 to-cyan-500/10',
  },
  {
    href: '/statistics',
    label: 'Статистик',
    emoji: '📊',
    hint: 'Trend & charts',
    tone: 'from-emerald-500/10 to-teal-500/10',
  },
  {
    href: '/predictions',
    label: 'Таамаглал',
    emoji: '🎯',
    hint: 'Performance forecast',
    tone: 'from-violet-500/10 to-pink-500/10',
  },
];

export default function QuickActionGrid() {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm">Хурдан холбоос</CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-2 gap-2">
        {actions.map((action) => (
          <Link
            key={action.href}
            href={action.href}
            className={cn(
              'rounded-lg border border-border bg-gradient-to-br p-3 transition-colors hover:border-primary/30 hover:bg-muted/40',
              action.tone,
            )}
          >
            <div className="text-lg">{action.emoji}</div>
            <p className="mt-2 text-sm font-medium">{action.label}</p>
            <p className="mt-1 text-[11px] text-muted-foreground">{action.hint}</p>
          </Link>
        ))}
      </CardContent>
    </Card>
  );
}
