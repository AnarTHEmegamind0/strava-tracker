'use client';

import { useState } from 'react';
import { useApp } from '@/lib/context';
import DashboardHeader from '@/components/layout/DashboardHeader';
import ActivityCalendar from '@/components/calendar/ActivityCalendar';
import ActivityModal from '@/components/calendar/ActivityModal';
import { DBActivity } from '@/types';

export default function CalendarPage() {
  const { athlete, activities } = useApp();
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedActivities, setSelectedActivities] = useState<DBActivity[]>([]);
  const [selectedActivity, setSelectedActivity] = useState<DBActivity | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<string | null>(null);

  const handleDateClick = (date: Date, dayActivities: DBActivity[]) => {
    setSelectedDate(date);
    setSelectedActivities(dayActivities);
    setSelectedActivity(null);
    setAnalysis(null);
    setModalOpen(true);
  };

  const handleActivityClick = (activity: DBActivity) => {
    setSelectedActivity(activity);
    setSelectedActivities([]);
    setSelectedDate(new Date(activity.start_date));
    setAnalysis(null);
    setModalOpen(true);
  };

  const handleAnalyze = async (activity: DBActivity) => {
    // If clicking from the list, switch to single activity view
    if (!selectedActivity) {
      setSelectedActivity(activity);
      setSelectedActivities([]);
    }
    
    setAnalyzing(true);
    setAnalysis(null);
    
    try {
      const response = await fetch('/api/ai/analyze-activity', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ activityId: activity.strava_id }),
      });
      
      if (response.ok) {
        const data = await response.json();
        setAnalysis(data.analysis);
      } else {
        setAnalysis('Шинжилгээ хийхэд алдаа гарлаа. Дахин оролдоно уу.');
      }
    } catch (err) {
      console.error('Analysis error:', err);
      setAnalysis('Шинжилгээ хийхэд алдаа гарлаа. Дахин оролдоно уу.');
    } finally {
      setAnalyzing(false);
    }
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedDate(null);
    setSelectedActivities([]);
    setSelectedActivity(null);
    setAnalysis(null);
  };

  // Activity stats for the legend
  const activityTypes = activities.reduce((acc, a) => {
    acc[a.type] = (acc[a.type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const typeColors: Record<string, string> = {
    Run: '#FC4C02',
    Ride: '#3B82F6',
    Swim: '#06B6D4',
    Walk: '#10B981',
    Hike: '#10B981',
    Workout: '#8B5CF6',
    WeightTraining: '#EC4899',
    Yoga: '#F59E0B',
  };

  const typeNames: Record<string, string> = {
    Run: 'Гүйлт',
    Ride: 'Дугуй',
    Swim: 'Усанд сэлэлт',
    Walk: 'Алхалт',
    Hike: 'Уулын аялал',
    Workout: 'Дасгал',
    WeightTraining: 'Хүндийн дасгал',
    Yoga: 'Йог',
  };

  return (
    <div className="min-h-screen">
      <DashboardHeader athlete={athlete} title="Календарь" />
      
      <div className="p-6 space-y-6">
        {/* Legend */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4">
          <div className="flex flex-wrap gap-4">
            {Object.entries(activityTypes).map(([type, count]) => (
              <div key={type} className="flex items-center gap-2">
                <span
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: typeColors[type] || '#6B7280' }}
                />
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {typeNames[type] || type} ({count})
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Calendar */}
        <ActivityCalendar
          activities={activities}
          onDateClick={handleDateClick}
          onActivityClick={handleActivityClick}
        />

        {/* Tips */}
        <div className="bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <span className="text-2xl">💡</span>
            <div>
              <p className="font-medium text-gray-900 dark:text-white">Зөвлөмж</p>
              <ul className="text-sm text-gray-600 dark:text-gray-400 mt-1 space-y-1">
                <li>• Огноо дээр дарж тухайн өдрийн дасгалуудыг харна уу</li>
                <li>• Дасгал дээр дарж дэлгэрэнгүй болон AI шинжилгээ авна уу</li>
                <li>• Сар/Долоо хоног/Өдөр товчлуурууд ашиглан харагдацаа өөрчилнө үү</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Modal */}
      <ActivityModal
        isOpen={modalOpen}
        onClose={handleCloseModal}
        date={selectedDate}
        activities={selectedActivities}
        selectedActivity={selectedActivity}
        onAnalyze={handleAnalyze}
        analyzing={analyzing}
        analysis={analysis}
      />
    </div>
  );
}
