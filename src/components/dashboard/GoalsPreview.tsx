'use client';

import { GoalWithProgress } from '@/types';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface GoalsPreviewProps {
  goals: GoalWithProgress[];
}

function getMetricUnit(metric: string): string {
  switch (metric) {
    case 'distance': return 'км';
    case 'time': return 'ц';
    case 'elevation': return 'м';
    case 'count': return '';
    default: return '';
  }
}

function formatValue(value: number, metric: string): string {
  switch (metric) {
    case 'distance': return (value / 1000).toFixed(1);
    case 'time': return (value / 3600).toFixed(1);
    case 'elevation': return Math.round(value).toString();
    case 'count': return Math.round(value).toString();
    default: return value.toString();
  }
}

export default function GoalsPreview({ goals }: GoalsPreviewProps) {
  const activeGoals = goals.slice(0, 3);

  if (activeGoals.length === 0) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle>Зорилго</CardTitle>
          <Link
            href="/goals"
            className="text-sm font-medium text-primary hover:underline"
          >
            Нэмэх
          </Link>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="py-6 text-center text-muted-foreground">
          <p>Зорилго тавиагүй байна.</p>
            <p className="mt-1 text-sm">Зорилго тавьж ахиц дэвшлээ хянаарай!</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle>Зорилго</CardTitle>
        <Link
          href="/goals"
          className="text-sm font-medium text-primary hover:underline"
        >
          Бүгдийг харах
        </Link>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {activeGoals.map((goal) => {
          const current = formatValue(goal.current_value, goal.metric);
          const target = formatValue(goal.target_value, goal.metric);
          const unit = getMetricUnit(goal.metric);
          
          return (
            <div key={goal.id} className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-card-foreground">
                  {goal.title}
                </span>
                <span className="text-xs text-muted-foreground">
                  {goal.days_left} өдөр үлдсэн
                </span>
              </div>
              <div className="relative">
                <div className="h-2 overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-primary transition-all duration-500"
                    style={{ width: `${Math.min(goal.progress_percent, 100)}%` }}
                  />
                </div>
              </div>
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>{current}{unit} / {target}{unit}</span>
                <span>{Math.round(goal.progress_percent)}%</span>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
