import React, { useState, useEffect, useRef } from 'react';
import { 
  format, isSameDay, addDays, subDays, startOfMonth, endOfMonth, 
  startOfWeek, endOfWeek, differenceInMinutes, getHours, getMinutes, isToday
} from 'date-fns';
import { X, Calendar as CalendarIcon } from 'lucide-react';
import { fetchEvents } from '../api/calendar';

const FullCalendarModal = ({ isOpen, onClose, currentDate, employees, onColorChange }) => {
  const [view, setView] = useState('month');
  const [employeeEvents, setEmployeeEvents] = useState({});
  const [loading, setLoading] = useState(true);
  
  // Initialize all employees to be visible
  const [visibleEmails, setVisibleEmails] = useState([]);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (employees.length > 0 && visibleEmails.length === 0) {
      setVisibleEmails(employees.map(e => e.email));
    }
  }, [employees]);

  useEffect(() => {
    let isMounted = true;
    const loadEvents = async () => {
      setLoading(true);
      const eventsMap = {};
      await Promise.all(employees.map(async (emp) => {
        eventsMap[emp.email] = await fetchEvents(emp.email);
      }));
      if (isMounted) {
        setEmployeeEvents(eventsMap);
        setLoading(false);
      }
    };

    if (isOpen && employees.length > 0) {
      loadEvents();
    }
    return () => { isMounted = false; };
  }, [isOpen, employees]);

  useEffect(() => {
    if (isOpen && (view === 'week' || view === 'day') && !loading) {
      setTimeout(() => {
        if (scrollRef.current) scrollRef.current.scrollTop = 480; // 60px * 8 = 480
      }, 100);
    }
  }, [isOpen, view, loading]);

  if (!isOpen) return null;

  const toggleEmployee = (email) => {
    setVisibleEmails(prev => 
      prev.includes(email) ? prev.filter(e => e !== email) : [...prev, email]
    );
  };

  // Combine and map visible events
  const allEvents = [];
  employees.forEach((emp) => {
    if (!visibleEmails.includes(emp.email)) return;
    
    const events = employeeEvents[emp.email] || [];
    const color = emp.calendarColor || '#2563eb';
    
    events.forEach(e => {
      const start = new Date(e.start);
      const end = new Date(e.end);
      
      let durationMinutes = 0;
      let isAllDay = false;
      
      if (isNaN(end.getTime())) {
        isAllDay = true;
      } else {
        durationMinutes = Math.max(differenceInMinutes(end, start), 0);
        if (durationMinutes >= 1430 || (start.getHours() === 0 && start.getMinutes() === 0 && end.getHours() === 0 && end.getMinutes() === 0)) {
          isAllDay = true;
        }
      }

      allEvents.push({
        ...e,
        employee: emp,
        color,
        start,
        end,
        isAllDay,
        durationMinutes
      });
    });
  });

  const formatTime = (date) => {
    if (isNaN(date.getTime())) return '';
    return format(date, 'h:mm a');
  };

  // -------------------------
  // Render Helpers
  // -------------------------

  const renderMonthView = () => {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart, { weekStartsOn: 1 });
    const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 });

    const days = [];
    let day = startDate;
    while (day <= endDate) {
      days.push(day);
      day = addDays(day, 1);
    }

    const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

    return (
      <div className="flex flex-col bg-[#111827] border border-[#374151] rounded-2xl overflow-hidden shadow-xl flex-1">
        <div className="grid grid-cols-7 bg-[#1f2937]/50 border-b border-[#374151]">
          {weekDays.map(wd => (
            <div key={wd} className="p-3 text-center text-sm font-bold text-gray-400 uppercase tracking-wider border-r border-[#374151]/50 last:border-0">
              {wd}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7 flex-1 auto-rows-[minmax(100px,1fr)] overflow-y-auto custom-scrollbar">
          {days.map((d) => {
            const isCurrentMonth = d.getMonth() === currentDate.getMonth();
            const isTodayDate = isToday(d);
            
            const dStart = new Date(d); dStart.setHours(0, 0, 0, 0);
            const dEnd = new Date(d); dEnd.setHours(23, 59, 59, 999);

            const dayEvents = allEvents.filter(e => {
              if (isNaN(e.end.getTime())) {
                return isSameDay(e.start, d);
              }
              return e.start <= dEnd && e.end > dStart;
            });
            
            dayEvents.sort((a, b) => {
              if (a.isAllDay && !b.isAllDay) return -1;
              if (!a.isAllDay && b.isAllDay) return 1;
              return a.start.getTime() - b.start.getTime();
            });

            return (
              <div 
                key={d.toISOString()} 
                className={`min-h-[100px] p-2 border-r border-b border-[#374151]/50 ${isCurrentMonth ? 'bg-transparent' : 'bg-[#1f2937]/30'} relative group hover:bg-white/[0.02] transition-colors flex flex-col gap-1 overflow-hidden`}
              >
                <div className="flex justify-between items-start mb-1">
                  <span className={`text-sm font-semibold w-7 h-7 flex items-center justify-center rounded-full ${isTodayDate ? 'bg-cyan-500 text-white' : isCurrentMonth ? 'text-gray-200' : 'text-gray-600'}`}>
                    {format(d, 'd')}
                  </span>
                </div>
                
                <div className="flex-1 flex flex-col gap-1 overflow-y-auto no-scrollbar">
                  {dayEvents.map(evt => {
                    if (evt.isAllDay) {
                      return (
                        <div 
                          key={evt.id} 
                          className="text-[10px] sm:text-xs px-1.5 py-0.5 rounded truncate border text-white cursor-pointer hover:opacity-90"
                          style={{ backgroundColor: evt.color + 'cc', borderColor: evt.color }}
                          title={`${evt.employee.name}: ${evt.title}`}
                        >
                          <span className="font-bold mr-1">{evt.employee.name.substring(0, 3)}:</span>
                          {evt.title}
                        </div>
                      );
                    } else {
                      return (
                        <div 
                          key={evt.id} 
                          className="text-[10px] sm:text-xs truncate cursor-pointer hover:bg-white/10 rounded px-1 flex items-center gap-1"
                          title={`${evt.employee.name}: ${evt.title} (${formatTime(evt.start)})`}
                        >
                          <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: evt.color }}></div>
                          <span className="text-gray-400 font-medium shrink-0">{format(evt.start, 'HH:mm')}</span>
                          <span className="text-gray-200 truncate">{evt.title}</span>
                        </div>
                      );
                    }
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderTimeGrid = (days) => {
    const hours = [...Array(24)].map((_, i) => i);

    return (
      <div className="flex flex-col flex-1 bg-[#111827] border border-[#374151] rounded-2xl overflow-hidden shadow-xl relative min-h-0">
        {/* Header: Days */}
        <div className="flex border-b border-[#374151] bg-[#1f2937]/50 shrink-0 pr-2">
          <div className="w-16 shrink-0 border-r border-[#374151]"></div>
          <div className="flex-1 grid" style={{ gridTemplateColumns: `repeat(${days.length}, minmax(0, 1fr))` }}>
            {days.map(d => {
              const isTodayDate = isToday(d);
              return (
                <div key={d.toISOString()} className="p-3 flex flex-col items-center justify-center border-l border-[#374151]/50 first:border-0">
                  <span className={`text-xs font-bold uppercase ${isTodayDate ? 'text-cyan-400' : 'text-gray-400'}`}>
                    {format(d, 'EEE')}
                  </span>
                  <span className={`text-lg sm:text-2xl font-light ${isTodayDate ? 'text-white bg-cyan-600 rounded-full w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center mt-1 shadow-lg shadow-cyan-500/30' : 'text-gray-200 mt-1'}`}>
                    {format(d, 'd')}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* All-Day Events Section */}
        <div className="flex border-b border-[#374151] bg-[#111827] shrink-0 pr-2 max-h-32 overflow-y-auto custom-scrollbar">
          <div className="w-16 shrink-0 border-r border-[#374151] flex items-center justify-center p-2">
            <span className="text-[10px] text-gray-500 font-medium uppercase tracking-wider text-center">All Day</span>
          </div>
          <div className="flex-1 grid" style={{ gridTemplateColumns: `repeat(${days.length}, minmax(0, 1fr))` }}>
            {days.map(d => {
              const dStart = new Date(d); dStart.setHours(0, 0, 0, 0);
              const dEnd = new Date(d); dEnd.setHours(23, 59, 59, 999);
              
              const allDayEvents = allEvents.filter(e => e.isAllDay && (
                (isNaN(e.end.getTime()) && isSameDay(e.start, d)) ||
                (!isNaN(e.end.getTime()) && e.start <= dEnd && e.end > dStart)
              ));

              return (
                <div key={d.toISOString()} className="border-l border-[#374151]/50 first:border-0 p-1 flex flex-col gap-1 min-h-[30px]">
                  {allDayEvents.map(evt => (
                    <div 
                      key={evt.id} 
                      className="rounded px-1.5 py-0.5 text-[10px] sm:text-xs border text-white truncate cursor-pointer hover:opacity-90"
                      style={{ backgroundColor: evt.color + 'cc', borderColor: evt.color }}
                      title={`${evt.employee.name}: ${evt.title}`}
                    >
                      <span className="font-bold mr-1">{evt.employee.name.substring(0,3)}:</span>
                      {evt.title}
                    </div>
                  ))}
                </div>
              );
            })}
          </div>
        </div>

        {/* Time Grid Body */}
        <div className="flex-1 overflow-y-scroll overflow-x-hidden relative custom-scrollbar" ref={scrollRef}>
          <div className="flex h-[1440px] relative"> {/* 60px per hour */}
            {/* Time Labels */}
            <div className="w-16 shrink-0 bg-[#111827] relative z-10 border-r border-[#374151]">
              {hours.map(hour => (
                <div key={hour} className="h-[60px] relative">
                  <span className="absolute -top-2.5 right-2 text-xs text-gray-500 font-medium">
                    {hour === 0 ? '' : format(new Date().setHours(hour, 0, 0, 0), 'h aa')}
                  </span>
                </div>
              ))}
            </div>

            {/* Grid Area */}
            <div className="flex-1 grid relative" style={{ gridTemplateColumns: `repeat(${days.length}, minmax(0, 1fr))` }}>
              {/* Horizontal Lines */}
              <div className="absolute inset-0 pointer-events-none flex flex-col">
                {hours.map(hour => (
                  <div key={hour} className="h-[60px] border-b border-[#374151]/30 w-full"></div>
                ))}
              </div>

              {/* Day Columns */}
              {days.map(d => {
                const timedEvents = allEvents.filter(e => !e.isAllDay && isSameDay(e.start, d));
                
                return (
                  <div key={d.toISOString()} className="relative border-l border-[#374151]/30 first:border-0 hover:bg-white/[0.02] transition-colors h-full">
                    {timedEvents.map(evt => {
                      const startMinutes = (getHours(evt.start) * 60) + getMinutes(evt.start);
                      const top = startMinutes;
                      const height = Math.max(evt.durationMinutes, 25); // Min height 25px

                      return (
                        <div 
                          key={evt.id}
                          className="absolute left-0.5 right-0.5 rounded-md border p-1 overflow-hidden shadow-sm hover:z-30 cursor-pointer transition-all z-20 flex flex-col text-white"
                          style={{ top: `${top}px`, height: `${height}px`, backgroundColor: evt.color + 'cc', borderColor: evt.color }}
                          title={`${evt.employee.name}: ${evt.title}\n${formatTime(evt.start)} - ${formatTime(evt.end)}\n${evt.location}`}
                        >
                          <div className="font-semibold text-[10px] leading-tight truncate">
                            {evt.employee.name.substring(0,3)}: {evt.title}
                          </div>
                          <div className="text-[9px] opacity-90 truncate mt-px">
                            {formatTime(evt.start)} - {formatTime(evt.end)}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose}></div>
      
      {/* Modal Container */}
      <div className="relative w-full max-w-[95vw] h-[95vh] bg-[#030712] border border-[#1f2937] shadow-2xl rounded-2xl overflow-hidden flex flex-col">
        
        {/* Header */}
        <div className="p-4 border-b border-[#1f2937] flex flex-col sm:flex-row items-center justify-between gap-4 bg-gradient-to-r from-[#1f2937]/50 to-transparent shrink-0">
          <div className="flex items-center gap-3">
            <CalendarIcon size={24} className="text-cyan-400" />
            <h2 className="text-xl font-bold text-white uppercase tracking-wider">Full Calendar</h2>
            
            {/* View Dropdown */}
            <select 
              value={view}
              onChange={(e) => setView(e.target.value)}
              className="ml-4 px-3 py-1.5 bg-[#1f2937] border border-[#374151] rounded-lg text-cyan-400 font-semibold focus:outline-none focus:border-cyan-500 cursor-pointer hover:border-cyan-400 text-sm"
            >
              <option value="month">Month View</option>
              <option value="week">Week View</option>
              <option value="day">Day View</option>
            </select>
          </div>
          
          <button onClick={onClose} className="p-2 rounded-full hover:bg-white/10 text-gray-400 hover:text-white transition-colors">
            <X size={24} />
          </button>
        </div>

        {/* Layout container: Sidebar (Filters) + Main Calendar */}
        <div className="flex-1 flex flex-col lg:flex-row overflow-hidden p-2 gap-2">
          
          {/* Main Calendar Area */}
          <div className="flex-1 flex flex-col min-w-0">
            {loading ? (
              <div className="flex-1 flex flex-col items-center justify-center py-20 bg-[#111827] rounded-2xl border border-[#1f2937]">
                <div className="w-10 h-10 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                <p className="text-gray-400">Loading Calendar Data...</p>
              </div>
            ) : (
              <>
                {view === 'month' && renderMonthView()}
                {view === 'week' && renderTimeGrid([...Array(7)].map((_, i) => addDays(startOfWeek(currentDate, { weekStartsOn: 1 }), i)))}
                {view === 'day' && renderTimeGrid([currentDate])}
              </>
            )}
          </div>

          {/* Right Sidebar: Legend & Filters */}
          <div className="w-full lg:w-64 bg-[#111827] border border-[#374151] rounded-2xl p-4 shrink-0 flex flex-col overflow-y-auto custom-scrollbar">
            <h3 className="text-sm font-bold text-gray-300 uppercase tracking-wider mb-4 border-b border-[#374151] pb-2">Filter & Colors</h3>
            
            <div className="flex flex-col gap-3">
              {employees.map((emp) => (
                <div key={emp.id} className="flex items-center gap-3 bg-[#1f2937]/50 p-2 rounded-lg border border-[#374151]/50 hover:bg-[#1f2937] transition-colors">
                  
                  {/* Checkbox */}
                  <input 
                    type="checkbox" 
                    checked={visibleEmails.includes(emp.email)}
                    onChange={() => toggleEmployee(emp.email)}
                    className="w-4 h-4 rounded bg-gray-800 border-gray-600 text-cyan-500 focus:ring-cyan-500 cursor-pointer"
                  />
                  
                  {/* Name */}
                  <span className="text-sm text-gray-200 font-medium flex-1 truncate">{emp.name}</span>
                  
                  {/* Color Picker */}
                  <div className="relative group shrink-0">
                    <input 
                      type="color" 
                      value={emp.calendarColor || '#2563eb'}
                      onChange={(e) => onColorChange(emp.email, e.target.value)}
                      className="w-6 h-6 p-0 border-0 rounded cursor-pointer overflow-hidden appearance-none bg-transparent"
                      title="Change color"
                    />
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-5 h-5 rounded pointer-events-none" style={{ backgroundColor: emp.calendarColor || '#2563eb' }}></div>
                  </div>

                </div>
              ))}
            </div>

            <div className="mt-auto pt-6 text-xs text-gray-500">
              <p>• Click the checkbox to show/hide events for each person.</p>
              <p className="mt-1">• Click the color box to choose a custom color for the calendar.</p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default FullCalendarModal;
