'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface Task {
  id: string;
  title: string;
  type: 'workout' | 'recovery' | 'nutrition' | 'sleep';
  completed: boolean;
  time?: string;
  duration?: string;
  description?: string;
}

interface DailyPlanData {
  greeting: string;
  date: string;
  tasks: Task[];
  motivation: string;
}

const taskIcons: Record<string, React.ReactNode> = {
  workout: (
    <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M13 2L4 14h7l-1 8 10-14h-7V2z" />
    </svg>
  ),
  recovery: (
    <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
    </svg>
  ),
  nutrition: (
    <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6l4 2m6-2a10 10 0 11-20 0 10 10 0 0120 0z" />
    </svg>
  ),
  sleep: (
    <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
    </svg>
  ),
};

const taskColors: Record<string, string> = {
  workout: 'bg-primary/10 text-primary border-primary/20',
  recovery: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
  nutrition: 'bg-amber-500/10 text-amber-600 border-amber-500/20',
  sleep: 'bg-indigo-500/10 text-indigo-600 border-indigo-500/20',
};

export default function DailyPlan() {
  const [data, setData] = useState<DailyPlanData | null>(null);
  const [loading, setLoading] = useState(true);
  const [tasks, setTasks] = useState<Task[]>([]);

  useEffect(() => {
    const fetchPlan = async () => {
      try {
        const response = await fetch('/api/ai/daily-plan');
        if (response.ok) {
          const result = await response.json();
          setData(result);
          setTasks(result.tasks || []);
        } else {
          // Fallback data
          const now = new Date();
          const hour = now.getHours();
          let greeting = 'Сайн байна уу';
          if (hour < 12) greeting = 'Өглөөний мэнд';
          else if (hour < 18) greeting = 'Өдрийн мэнд';
          else greeting = 'Оройн мэнд';

          setData({
            greeting,
            date: now.toLocaleDateString('mn-MN', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            }),
            tasks: [
              { id: '1', title: 'Өглөөний сунгалт', type: 'recovery', completed: false, time: '07:00', duration: '15 мин' },
              { id: '2', title: 'Гүйлтийн дасгал', type: 'workout', completed: false, time: '08:00', duration: '45 мин', description: 'Хөнгөн темпээр 5км' },
              { id: '3', title: 'Уураг ихтэй өглөөний хоол', type: 'nutrition', completed: false, time: '09:00' },
              { id: '4', title: '8 цаг унтах', type: 'sleep', completed: false, time: '22:00' },
            ],
            motivation: 'Бага алхамууд том өөрчлөлтийг авчирна!',
          });
          setTasks([
            { id: '1', title: 'Өглөөний сунгалт', type: 'recovery', completed: false, time: '07:00', duration: '15 мин' },
            { id: '2', title: 'Гүйлтийн дасгал', type: 'workout', completed: false, time: '08:00', duration: '45 мин', description: 'Хөнгөн темпээр 5км' },
            { id: '3', title: 'Уураг ихтэй өглөөний хоол', type: 'nutrition', completed: false, time: '09:00' },
            { id: '4', title: '8 цаг унтах', type: 'sleep', completed: false, time: '22:00' },
          ]);
        }
      } catch {
        // Use fallback
        const now = new Date();
        setData({
          greeting: 'Сайн байна уу',
          date: now.toLocaleDateString('mn-MN', { weekday: 'long', month: 'long', day: 'numeric' }),
          tasks: [],
          motivation: 'Өнөөдөр шинэ зорилго тавь!',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchPlan();
  }, []);

  useEffect(() => {
    if (!data || tasks.length === 0) return;
    const key = `daily-plan-${new Date().toISOString().slice(0, 10)}`;
    localStorage.setItem(key, JSON.stringify(tasks));
  }, [data, tasks]);

  useEffect(() => {
    const key = `daily-plan-${new Date().toISOString().slice(0, 10)}`;
    const saved = localStorage.getItem(key);
    if (!saved) return;

    try {
      const parsed = JSON.parse(saved) as Task[];
      if (Array.isArray(parsed) && parsed.length > 0) {
        setTasks(parsed);
      }
    } catch {
      // ignore invalid local cache
    }
  }, []);

  const toggleTask = (taskId: string) => {
    setTasks((prev) =>
      prev.map((task) =>
        task.id === taskId ? { ...task, completed: !task.completed } : task
      )
    );
  };

  const completedCount = tasks.filter((t) => t.completed).length;
  const progress = tasks.length > 0 ? (completedCount / tasks.length) * 100 : 0;

  if (loading) {
    return (
      <Card className="overflow-hidden">
        <CardContent className="p-5 sm:p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-8 w-48 rounded-lg bg-muted" />
            <div className="h-4 w-32 rounded bg-muted" />
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-16 rounded-xl bg-muted" />
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden border-0 bg-gradient-to-br from-card to-card/80 shadow-xl">
      <CardContent className="p-0">
        {/* Header with gradient */}
        <div className="bg-gradient-to-r from-primary via-primary to-accent p-5 text-white sm:p-6">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-2xl font-bold">{data?.greeting}!</h2>
              <p className="mt-1 text-sm text-white/80">{data?.date}</p>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold">{completedCount}/{tasks.length}</div>
              <p className="text-xs text-white/80">даалгавар</p>
            </div>
          </div>
          
          {/* Progress bar */}
          <div className="mt-4">
            <div className="flex items-center justify-between text-xs text-white/80">
              <span>Өнөөдрийн явц</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-white/20">
              <div
                className="h-full rounded-full bg-white transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>

        {/* Tasks */}
        <div className="space-y-2.5 p-4 sm:p-5">
          {tasks.map((task, index) => (
            <button
              key={task.id}
              onClick={() => toggleTask(task.id)}
              className={`group flex w-full items-center gap-3 rounded-xl border p-3.5 text-left transition-all duration-200 hover:shadow-md ${
                task.completed
                  ? 'border-muted bg-muted/50 opacity-60'
                  : taskColors[task.type]
              }`}
              style={{ animationDelay: `${index * 50}ms` }}
            >
              {/* Checkbox */}
              <div
                className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 transition-all ${
                  task.completed
                    ? 'border-success bg-success text-white'
                    : 'border-current group-hover:border-primary'
                }`}
              >
                {task.completed && (
                  <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth={3} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </div>

              {/* Icon */}
              <div className={`shrink-0 ${task.completed ? 'text-muted-foreground' : ''}`}>
                {taskIcons[task.type]}
              </div>

              {/* Content */}
              <div className="min-w-0 flex-1">
                <p className={`font-medium ${task.completed ? 'line-through' : ''}`}>
                  {task.title}
                </p>
                {task.description && (
                  <p className="truncate text-xs text-muted-foreground">{task.description}</p>
                )}
              </div>

              {/* Time & Duration */}
              <div className="shrink-0 text-right text-xs text-muted-foreground">
                {task.time && <p className="font-medium">{task.time}</p>}
                {task.duration && <p>{task.duration}</p>}
              </div>
            </button>
          ))}
        </div>

        {/* Motivation */}
        {data?.motivation && (
          <div className="border-t border-border/50 px-4 py-3 sm:px-5">
            <p className="flex items-center gap-2 text-sm text-muted-foreground">
              <span className="text-lg">💪</span>
              <span className="italic">{data.motivation}</span>
            </p>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2 p-4 pt-0 sm:p-5 sm:pt-0">
          <Link href="/plans" className="flex-1">
            <Button variant="outline" size="sm" className="w-full">
              <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
              Төлөвлөгөө рүү
            </Button>
          </Link>
          <Link href="/coach" className="flex-1">
            <Button variant="secondary" size="sm" className="w-full">
              <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h4M20 20v-5h-4m3.4-6A8 8 0 006.3 8M17.7 16A8 8 0 017 19" />
              </svg>
              AI-тай ярилцах
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
