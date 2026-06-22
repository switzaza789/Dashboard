import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';
import { 
  startOfWeek, 
  endOfWeek, 
  addDays, 
  subWeeks, 
  addWeeks, 
  format, 
  isSameDay, 
  isToday 
} from 'date-fns';
import { fetchEvents } from '../api/calendar';

const ScheduleBoard = ({ employee, currentDate, setCurrentDate }) => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);

  // We start the week on Monday (weekStartsOn: 1)
  const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(currentDate, { weekStartsOn: 1 });

  // Generate array of 7 days
  const days = [...Array(7)].map((_, i) => addDays(weekStart, i));

  useEffect(() => {
    const loadEvents = async () => {
      setLoading(true);
      if (employee) {
        const data = await fetchEvents(employee.email, weekStart, weekEnd);
        setEvents(data);
      }
      setLoading(false);
    };
    loadEvents();
  }, [employee, weekStart.toISOString()]); // Reload when employee or week changes

  const nextWeek = () => setCurrentDate(addWeeks(currentDate, 1));
  const prevWeek = () => setCurrentDate(subWeeks(currentDate, 1));
  const goToday = () => setCurrentDate(new Date());

  // Helper to format time (e.g., "10:00 AM")
  const formatTime = (dateString) => {
    return format(new Date(dateString), 'h:mm a');
  };

  return (
    <div className="h-full flex flex-col p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold">{format(weekStart, 'MMMM yyyy')}</h2>
          <p className="text-gray-400">
            {format(weekStart, 'MMM d')} - {format(weekEnd, 'MMM d, yyyy')}
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <button 
            onClick={goToday}
            className="glass-button px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2"
          >
            <CalendarIcon size={16} />
            Today
          </button>
          <div className="glass-panel flex rounded-lg overflow-hidden">
            <button onClick={prevWeek} className="p-2 hover:bg-white/5 transition-colors">
              <ChevronLeft size={20} />
            </button>
            <div className="w-[1px] bg-white/10"></div>
            <button onClick={nextWeek} className="p-2 hover:bg-white/5 transition-colors">
              <ChevronRight size={20} />
            </button>
          </div>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="flex-1 glass-panel rounded-2xl overflow-hidden flex flex-col relative">
        {loading && (
          <div className="absolute inset-0 bg-[var(--bg)]/50 backdrop-blur-sm flex items-center justify-center z-10">
            <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}
        
        {/* Days Header */}
        <div className="grid grid-cols-7 border-b border-[var(--color-dark-border)] bg-black/20">
          {days.map(day => {
            const today = isToday(day);
            return (
              <div 
                key={day.toISOString()} 
                className={`py-4 text-center border-r border-[var(--color-dark-border)] last:border-r-0 ${today ? 'bg-indigo-500/10' : ''}`}
              >
                <div className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-1">
                  {format(day, 'EEE')}
                </div>
                <div className={`text-xl font-bold inline-flex items-center justify-center w-8 h-8 rounded-full ${today ? 'bg-indigo-500 text-white' : ''}`}>
                  {format(day, 'd')}
                </div>
              </div>
            );
          })}
        </div>

        {/* Schedule Body */}
        <div className="flex-1 grid grid-cols-7 overflow-y-auto">
          {days.map(day => {
            // Filter events for this specific day
            const dayEvents = events.filter(e => isSameDay(new Date(e.start), day));
            const today = isToday(day);

            return (
              <div 
                key={day.toISOString()} 
                className={`border-r border-[var(--color-dark-border)] last:border-r-0 p-2 min-h-[500px] ${today ? 'bg-indigo-500/5' : ''}`}
              >
                {dayEvents.map(event => (
                  <div 
                    key={event.id}
                    className="mb-2 p-3 rounded-xl bg-gradient-to-br from-indigo-500/20 to-blue-500/20 border border-indigo-500/30 hover:border-indigo-500/50 transition-colors"
                  >
                    <div className="text-xs text-indigo-300 font-medium mb-1">
                      {formatTime(event.start)} - {formatTime(event.end)}
                    </div>
                    <div className="text-sm font-semibold truncate">
                      {event.title}
                    </div>
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default ScheduleBoard;
