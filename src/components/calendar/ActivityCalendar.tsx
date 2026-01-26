'use client';

import { useRef, useEffect } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { DBActivity } from '@/types';
import { EventClickArg, DatesSetArg } from '@fullcalendar/core';

interface ActivityCalendarProps {
  activities: DBActivity[];
  onDateClick: (date: Date, activities: DBActivity[]) => void;
  onActivityClick: (activity: DBActivity) => void;
}

// Activity type-аар өнгө тодорхойлох
function getActivityColor(type: string): string {
  const colors: Record<string, string> = {
    Run: '#FC4C02',      // Strava orange
    Ride: '#3B82F6',     // Blue
    Swim: '#06B6D4',     // Cyan
    Walk: '#10B981',     // Green
    Hike: '#10B981',     // Green
    Workout: '#8B5CF6',  // Purple
    WeightTraining: '#EC4899', // Pink
    Yoga: '#F59E0B',     // Amber
  };
  return colors[type] || '#6B7280'; // Default gray
}

function formatDistance(meters: number): string {
  return `${(meters / 1000).toFixed(1)}км`;
}

export default function ActivityCalendar({ 
  activities, 
  onDateClick, 
  onActivityClick 
}: ActivityCalendarProps) {
  const calendarRef = useRef<FullCalendar>(null);

  // Activities-ийг calendar events болгох
  const events = activities.map(activity => {
    const startDate = new Date(activity.start_date);
    return {
      id: String(activity.strava_id),
      title: `${activity.type}: ${formatDistance(activity.distance)}`,
      start: startDate,
      allDay: true,
      backgroundColor: getActivityColor(activity.type),
      borderColor: getActivityColor(activity.type),
      extendedProps: {
        activity,
      },
    };
  });

  const handleEventClick = (info: EventClickArg) => {
    const activity = info.event.extendedProps.activity as DBActivity;
    onActivityClick(activity);
  };

  const handleDateClick = (info: { date: Date }) => {
    const clickedDate = info.date;
    const dayStart = new Date(clickedDate);
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(clickedDate);
    dayEnd.setHours(23, 59, 59, 999);

    const dayActivities = activities.filter(a => {
      const activityDate = new Date(a.start_date);
      return activityDate >= dayStart && activityDate <= dayEnd;
    });

    onDateClick(clickedDate, dayActivities);
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4">
      <style jsx global>{`
        .fc {
          --fc-border-color: #e5e7eb;
          --fc-button-bg-color: #FC4C02;
          --fc-button-border-color: #FC4C02;
          --fc-button-hover-bg-color: #e34402;
          --fc-button-hover-border-color: #e34402;
          --fc-button-active-bg-color: #c73a02;
          --fc-button-active-border-color: #c73a02;
          --fc-today-bg-color: rgba(252, 76, 2, 0.1);
          --fc-page-bg-color: transparent;
          --fc-neutral-bg-color: #f9fafb;
          --fc-list-event-hover-bg-color: #f3f4f6;
        }
        
        .dark .fc {
          --fc-border-color: #374151;
          --fc-neutral-bg-color: #1f2937;
          --fc-page-bg-color: transparent;
          --fc-list-event-hover-bg-color: #374151;
        }
        
        .fc .fc-toolbar-title {
          font-size: 1.25rem;
          font-weight: 600;
        }
        
        .dark .fc .fc-toolbar-title {
          color: #fff;
        }
        
        .fc .fc-button {
          padding: 0.5rem 1rem;
          font-size: 0.875rem;
          font-weight: 500;
          border-radius: 0.5rem;
        }
        
        .fc .fc-daygrid-day-number {
          padding: 8px;
          font-weight: 500;
        }
        
        .dark .fc .fc-daygrid-day-number {
          color: #d1d5db;
        }
        
        .fc .fc-daygrid-day:hover {
          background-color: rgba(252, 76, 2, 0.05);
          cursor: pointer;
        }
        
        .fc .fc-event {
          border-radius: 4px;
          padding: 2px 4px;
          font-size: 0.75rem;
          font-weight: 500;
          cursor: pointer;
        }
        
        .fc .fc-event:hover {
          opacity: 0.9;
        }
        
        .fc .fc-col-header-cell-cushion {
          padding: 8px;
          font-weight: 600;
        }
        
        .dark .fc .fc-col-header-cell-cushion {
          color: #9ca3af;
        }
        
        .dark .fc th {
          border-color: #374151;
        }
        
        .dark .fc td {
          border-color: #374151;
        }
        
        .fc .fc-daygrid-more-link {
          color: #FC4C02;
          font-weight: 600;
        }
      `}</style>
      
      <FullCalendar
        ref={calendarRef}
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
        initialView="dayGridMonth"
        headerToolbar={{
          left: 'prev,next today',
          center: 'title',
          right: 'dayGridMonth,timeGridWeek,timeGridDay',
        }}
        events={events}
        eventClick={handleEventClick}
        dateClick={handleDateClick}
        height="auto"
        dayMaxEvents={3}
        weekends={true}
        firstDay={1} // Monday
        locale="mn"
        buttonText={{
          today: 'Өнөөдөр',
          month: 'Сар',
          week: 'Долоо хоног',
          day: 'Өдөр',
        }}
      />
    </div>
  );
}
