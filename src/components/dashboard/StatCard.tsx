import type { ReactNode } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

type Tone = 'orange' | 'blue' | 'green' | 'violet';

const toneClasses: Record<Tone, { badge: string; icon: string }> = {
  orange: {
    badge: 'bg-primary/10 border border-primary/15',
    icon: 'text-primary',
  },
  blue: {
    badge: 'bg-blue-500/10 border border-blue-500/15 dark:bg-blue-400/10 dark:border-blue-400/15',
    icon: 'text-blue-600 dark:text-blue-400',
  },
  green: {
    badge: 'bg-success/10 border border-success/15',
    icon: 'text-success',
  },
  violet: {
    badge: 'bg-violet-500/10 border border-violet-500/15 dark:bg-violet-400/10 dark:border-violet-400/15',
    icon: 'text-violet-600 dark:text-violet-400',
  },
};

interface StatCardProps {
  label: string;
  value: string;
  unit?: string;
  icon: ReactNode;
  tone?: Tone;
}

export default function StatCard({
  label,
  value,
  unit,
  icon,
  tone = 'orange',
}: StatCardProps) {
  return (
    <Card className="overflow-hidden">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div
            className={cn(
              'grid h-10 w-10 shrink-0 place-items-center rounded-lg',
              toneClasses[tone].badge,
              toneClasses[tone].icon,
            )}
          >
            {icon}
          </div>

          <div className="min-w-0">
            <p className="text-xs text-muted-foreground">{label}</p>
            <p className="mt-1 text-lg font-semibold leading-none text-card-foreground md:text-xl">
              {value}
              {unit && <span className="ml-1 text-sm font-normal text-muted-foreground">{unit}</span>}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
