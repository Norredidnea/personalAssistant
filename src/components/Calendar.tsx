import React, { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Task, CalendarEvent } from '../types';

interface CalendarProps {
  tasks: Task[];
  events: CalendarEvent[];
  onDateSelect: (date: Date) => void;
}

export function Calendar({ tasks = [], events = [], onDateSelect }: CalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<'month' | 'week' | 'day'>('month');

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const days = [];
    
    // Ajouter les jours du mois précédent pour commencer à la bonne semaine
    const firstDayOfWeek = firstDay.getDay();
    for (let i = firstDayOfWeek - 1; i >= 0; i--) {
      const prevDate = new Date(year, month, -i);
      days.push({
        date: prevDate,
        isCurrentMonth: false,
        hasEvents: hasEventsOnDate(prevDate),
      });
    }
    
    // Ajouter les jours du mois en cours
    for (let i = 1; i <= lastDay.getDate(); i++) {
      const currentDate = new Date(year, month, i);
      days.push({
        date: currentDate,
        isCurrentMonth: true,
        hasEvents: hasEventsOnDate(currentDate),
      });
    }
    
    return days;
  };

  const hasEventsOnDate = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    return (tasks?.some(task => task.due_date === dateStr) || false) ||
           (events?.some(event => event.start_at.startsWith(dateStr)) || false);
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(prev.getMonth() + (direction === 'next' ? 1 : -1));
      return newDate;
    });
  };

  const days = getDaysInMonth(currentDate);

  return (
    <div className="bg-white rounded-xl shadow-lg p-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">
          {currentDate.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}
        </h2>
        <div className="flex gap-2">
          <button
            onClick={() => navigateMonth('prev')}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={() => navigateMonth('next')}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1">
        {['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'].map(day => (
          <div key={day} className="text-center text-sm font-medium text-gray-500 py-2">
            {day}
          </div>
        ))}
        
        {days.map(({ date, isCurrentMonth, hasEvents }, index) => (
          <button
            key={index}
            onClick={() => onDateSelect(date)}
            className={`
              aspect-square p-2 rounded-lg relative
              ${isCurrentMonth ? 'hover:bg-purple-50' : 'text-gray-400'}
              ${date.toDateString() === new Date().toDateString() ? 'bg-purple-100' : ''}
            `}
          >
            <span className="text-sm">{date.getDate()}</span>
            {hasEvents && (
              <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2">
                <div className="w-1 h-1 bg-purple-500 rounded-full"></div>
              </div>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}