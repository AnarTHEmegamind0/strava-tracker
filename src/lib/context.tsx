'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { StravaAthlete, DBActivity, DBGoal, GoalWithProgress } from '@/types';
import { useRouter } from 'next/navigation';

interface AppContextType {
  athlete: StravaAthlete | null;
  activities: DBActivity[];
  goals: GoalWithProgress[];
  loading: boolean;
  activitiesLoading: boolean;
  refreshActivities: (sync?: boolean) => Promise<void>;
  refreshGoals: () => Promise<void>;
  logout: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [athlete, setAthlete] = useState<StravaAthlete | null>(null);
  const [activities, setActivities] = useState<DBActivity[]>([]);
  const [goals, setGoals] = useState<GoalWithProgress[]>([]);
  const [loading, setLoading] = useState(true);
  const [activitiesLoading, setActivitiesLoading] = useState(false);

  // Check auth on mount
  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const response = await fetch('/api/athlete');
      if (response.ok) {
        const data = await response.json();
        setAthlete(data);
        // Load activities and goals
        await Promise.all([
          refreshActivities(false),
          refreshGoals(),
        ]);
      } else {
        // Not authenticated, redirect to login
        router.push('/');
      }
    } catch (err) {
      console.error('Auth check failed:', err);
      router.push('/');
    } finally {
      setLoading(false);
    }
  };

  const refreshActivities = async (sync = false) => {
    setActivitiesLoading(true);
    try {
      const response = await fetch(`/api/activities?refresh=${sync}`);
      if (response.ok) {
        const data = await response.json();
        setActivities(data.activities);
      }
    } catch (err) {
      console.error('Failed to load activities:', err);
    } finally {
      setActivitiesLoading(false);
    }
  };

  const refreshGoals = async () => {
    try {
      const response = await fetch('/api/goals');
      if (response.ok) {
        const data = await response.json();
        setGoals(data.goals);
      }
    } catch (err) {
      console.error('Failed to load goals:', err);
    }
  };

  const logout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      setAthlete(null);
      setActivities([]);
      setGoals([]);
      router.push('/');
    } catch (err) {
      console.error('Logout failed:', err);
    }
  };

  return (
    <AppContext.Provider
      value={{
        athlete,
        activities,
        goals,
        loading,
        activitiesLoading,
        refreshActivities,
        refreshGoals,
        logout,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
