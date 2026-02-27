'use client';

import { useState } from 'react';
import { useApp } from '@/lib/context';
import DashboardHeader from '@/components/layout/DashboardHeader';
import GoalForm from '@/components/goals/GoalForm';
import GoalCard from '@/components/goals/GoalCard';
import GoalSuggestions from '@/components/goals/GoalSuggestions';
import { GoalType, GoalMetric } from '@/types';

export default function GoalsPage() {
  const { athlete, goals, refreshGoals } = useApp();
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);

  const weeklyGoals = goals.filter(g => g.type === 'weekly');
  const monthlyGoals = goals.filter(g => g.type === 'monthly');

  const handleAddGoal = async (goal: {
    title: string;
    type: GoalType;
    metric: GoalMetric;
    target_value: number;
    activity_type: string | null;
  }) => {
    setLoading(true);
    try {
      const response = await fetch('/api/goals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(goal),
      });

      if (response.ok) {
        await refreshGoals();
        setShowForm(false);
      }
    } catch (err) {
      console.error('Failed to add goal:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteGoal = async (id: number) => {
    if (!confirm('Энэ зорилгыг устгахдаа итгэлтэй байна уу?')) return;
    
    try {
      const response = await fetch(`/api/goals?id=${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        await refreshGoals();
      }
    } catch (err) {
      console.error('Failed to delete goal:', err);
    }
  };

  return (
    <div className="min-h-screen">
      <DashboardHeader athlete={athlete} title="Зорилго" />
      
      <div className="page-container section-stack py-6">
        {/* Add Goal Button / Form */}
        {showForm ? (
          <GoalForm
            onSubmit={handleAddGoal}
            onCancel={() => setShowForm(false)}
          />
        ) : (
          <button
            onClick={() => setShowForm(true)}
            className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-border py-4 text-muted-foreground transition-colors hover:border-primary hover:text-primary"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Шинэ зорилго нэмэх
          </button>
        )}

        {/* Weekly Goals */}
        <div>
          <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-foreground">
            <span>📅</span> Долоо хоногийн зорилго
          </h2>
          {weeklyGoals.length === 0 ? (
            <p className="rounded-xl bg-card py-8 text-center text-muted-foreground">
              Долоо хоногийн зорилго тавиагүй байна. Дээрээс нэмнэ үү!
            </p>
          ) : (
            <div className="space-y-4">
              {weeklyGoals.map(goal => (
                <GoalCard
                  key={goal.id}
                  goal={goal}
                  onDelete={handleDeleteGoal}
                />
              ))}
            </div>
          )}
        </div>

        {/* Monthly Goals */}
        <div>
          <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-foreground">
            <span>📆</span> Сарын зорилго
          </h2>
          {monthlyGoals.length === 0 ? (
            <p className="rounded-xl bg-card py-8 text-center text-muted-foreground">
              Сарын зорилго тавиагүй байна. Дээрээс нэмнэ үү!
            </p>
          ) : (
            <div className="space-y-4">
              {monthlyGoals.map(goal => (
                <GoalCard
                  key={goal.id}
                  goal={goal}
                  onDelete={handleDeleteGoal}
                />
              ))}
            </div>
          )}
        </div>

        {/* AI Goal Suggestions */}
        <GoalSuggestions />

        {/* Tips */}
        {goals.length === 0 && (
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-6">
            <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
              💡 Зорилго тавих зөвлөмж
            </h3>
            <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
              <li>• Биелүүлж чадах зорилгоос эхэлж аажмаар нэмэгдүүлээрэй</li>
              <li>• Долоо хоногийн зорилго тогтмол байдлыг бий болгоно</li>
              <li>• Сарын зорилго том зорилтуудад тохиромжтой</li>
              <li>• Олон төрлийн хэмжүүр (зай, хугацаа, тоо) ашиглаарай</li>
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
