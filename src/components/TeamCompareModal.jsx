import React, { useEffect, useRef, useState } from 'react';
import { format, isSameDay, addDays, subDays, getHours, getMinutes, differenceInMinutes } from 'date-fns';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import { fetchEvents } from '../api/calendar';

const TeamCompareModal = ({ isOpen, onClose, employees, initialDate }) => {
  const scrollRef = useRef(null);
  const [currentDate, setCurrentDate] = useState(initialDate || new Date());
  const [employeeEvents, setEmployeeEvents] = useState({});
  const [loading, setLoading] = useState(true);


  // Load all events for all employees when modal opens
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

  // Update internal date and scroll on open
  useEffect(() => {
    if (isOpen) {
      setCurrentDate(initialDate || new Date());
      setTimeout(() => {
        if (scrollRef.current) scrollRef.current.scrollTop = 480; // Scroll to 8 AM
      }, 100);
    }
  }, [isOpen, initialDate]);

  if (!isOpen || !employees) return null;

  const hours = [...Array(24)].map((_, i) => i);
  const formatTime = (isoString) => format(new Date(isoString), 'h:mm a');

  const getEventColor = (title) => {
    const t = title.toLowerCase();
    if (t.includes('ลา') || t.includes('sick') || t.includes('leave') || t.includes('vacation')) {
      return "bg-red-600/80 border-red-400 hover:bg-red-500 text-white";
    }
    if (t.includes('wfh') || t.includes('remote') || t.includes('บ้าน')) {
      return "bg-indigo-600/80 border-indigo-400 hover:bg-indigo-500 text-white";
    }
    return "bg-cyan-600/80 border-cyan-400 hover:bg-cyan-500 text-white";
  };

  const nextDay = () => setCurrentDate(prev => addDays(prev, 1));
  const prevDay = () => setCurrentDate(prev => subDays(prev, 1));
  const goToToday = () => setCurrentDate(new Date());

  const filteredEmployees = employees;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose}></div>
      
      {/* Modal Content */}
      <div className="relative w-full max-w-7xl h-[95vh] bg-[#111827] border border-[#1f2937] shadow-2xl rounded-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-[#1f2937] flex flex-col md:flex-row items-center justify-between gap-4 bg-gradient-to-r from-[#1f2937]/50 to-transparent shrink-0 relative">
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 z-10">
            <h2 className="text-xl md:text-2xl font-bold text-white uppercase tracking-wider flex items-center gap-2">
              👥 TEAM COMPARE
            </h2>
          </div>
          
          {/* Center: Date Navigator (Centered absolutely on md and up, normal flow on mobile) */}
          <div className="md:absolute md:left-1/2 md:transform md:-translate-x-1/2 flex items-center gap-2 z-10">
            <div className="flex items-center gap-4 bg-black/30 rounded-xl p-1 border border-[#374151]">
               <button onClick={prevDay} className="p-2 hover:bg-[#374151] rounded-lg transition-colors text-gray-400 hover:text-white" title="Previous Day">
                 <ChevronLeft size={20} />
               </button>
               <div className="flex flex-col items-center min-w-[140px]">
                 <span className="text-xs font-semibold text-cyan-400">{format(currentDate, 'EEEE')}</span>
                 <span className="text-sm md:text-base text-white font-medium">{format(currentDate, 'MMM d, yyyy')}</span>
               </div>
               <button onClick={nextDay} className="p-2 hover:bg-[#374151] rounded-lg transition-colors text-gray-400 hover:text-white" title="Next Day">
                 <ChevronRight size={20} />
               </button>
            </div>
            
            <button 
              onClick={goToToday}
              className="bg-[#1f2937] hover:bg-[#374151] text-cyan-400 hover:text-cyan-300 font-semibold px-4 py-2 rounded-xl border border-[#374151] hover:border-cyan-500/50 transition-all text-sm shrink-0 shadow-lg"
              title="Go to Today"
            >
              Today
            </button>
          </div>

          {/* Right: Close Button */}
          <button onClick={onClose} className="absolute right-4 top-4 md:static p-2 rounded-full hover:bg-white/10 text-gray-400 hover:text-white transition-colors z-10">
            <X size={24} />
          </button>
        </div>

        {loading ? (
          <div className="flex-1 flex items-center justify-center text-cyan-400">
            <div className="w-8 h-8 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : filteredEmployees.length === 0 ? (
          <div className="flex-1 flex items-center justify-center text-gray-500 py-20">
            ไม่มีพนักงานในแผนกนี้ / No employees in this department.
          </div>
        ) : (
          <>
            {/* Calendar Header (Employees) */}
            <div className="flex border-b border-[#374151] bg-[#1f2937]/30 shrink-0">
              <div className="w-16 shrink-0"></div> {/* Time column spacer */}
              <div className="flex-1 grid pr-4" style={{ gridTemplateColumns: `repeat(${filteredEmployees.length}, minmax(0, 1fr))` }}>
                {filteredEmployees.map(emp => (
                  <div key={emp.id} className="text-center py-3 border-l border-[#374151]/50 flex flex-col items-center justify-center gap-2">
                    <img 
                      src={emp.avatarUrl} 
                      alt={emp.name}
                      className="w-10 h-10 rounded-full border-2 border-cyan-400 bg-[#1f2937]"
                    />
                    <div className="text-sm font-bold text-gray-200 uppercase tracking-widest truncate w-full px-2">
                      {emp.name}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* All-Day Events Section */}
            <div className="flex border-b border-[#374151] bg-[#111827] shrink-0">
              <div className="w-16 shrink-0 border-r border-[#374151] flex items-center justify-center">
                <span className="text-[10px] text-gray-500 font-medium uppercase tracking-wider text-center">All-Day</span>
              </div>
              <div className="flex-1 grid pr-4" style={{ gridTemplateColumns: `repeat(${filteredEmployees.length}, minmax(0, 1fr))` }}>
                {filteredEmployees.map(emp => {
                  const eventsForDay = (employeeEvents[emp.email] || []).filter(e => isSameDay(new Date(e.start), currentDate));
                  const allDayEvents = eventsForDay.filter(e => {
                    const durationMinutes = Math.max(differenceInMinutes(new Date(e.end), new Date(e.start)), 0);
                    return durationMinutes >= 1430;
                  });

                  return (
                    <div key={emp.id} className="border-l border-[#374151]/50 p-1 flex flex-col gap-1 min-h-[30px]">
                      {allDayEvents.map(event => {
                        const blockColor = getEventColor(event.title);
                        return (
                          <div 
                            key={event.id} 
                            className={`rounded px-1.5 py-0.5 text-xs border ${blockColor} truncate cursor-pointer`}
                            title={`=== ${event.title} ===\n\nเวลา: All Day\n\nรายละเอียด/สถานที่:\n${event.location || '-'}`}
                          >
                            {event.title}
                          </div>
                        );
                      })}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Calendar Body (Time Grid) */}
            <div 
              className="flex-1 overflow-y-scroll overflow-x-hidden relative"
              ref={scrollRef}
            >
              <div className="flex h-[1440px] relative"> {/* 60px per hour * 24 = 1440px */}
                
                {/* Time Labels (Y-Axis) */}
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
                <div className="flex-1 grid relative" style={{ gridTemplateColumns: `repeat(${filteredEmployees.length}, minmax(0, 1fr))` }}>
                  
                  {/* Horizontal Grid Lines */}
                  <div className="absolute inset-0 pointer-events-none flex flex-col">
                    {hours.map(hour => (
                      <div key={hour} className="h-[60px] border-b border-[#374151]/30 w-full"></div>
                    ))}
                  </div>

                  {/* Vertical Employee Columns & Events */}
                  {filteredEmployees.map(emp => {
                    const eventsForDay = (employeeEvents[emp.email] || []).filter(e => isSameDay(new Date(e.start), currentDate));
                    const timedEvents = eventsForDay.filter(e => {
                      const durationMinutes = Math.max(differenceInMinutes(new Date(e.end), new Date(e.start)), 0);
                      return durationMinutes < 1430;
                    });
                    
                    return (
                      <div key={emp.id} className="relative border-l border-[#374151]/30 hover:bg-white/[0.02] transition-colors h-full">
                        {timedEvents.map(event => {
                          const startDate = new Date(event.start);
                          const endDate = new Date(event.end);
                          
                          // Calculate Top and Height
                          const startMinutes = (getHours(startDate) * 60) + getMinutes(startDate);
                          const durationMinutes = Math.max(differenceInMinutes(endDate, startDate), 0);
                          
                          const top = startMinutes;
                          const height = Math.max(durationMinutes, 25);
                          const blockColor = getEventColor(event.title);

                          return (
                            <div 
                              key={event.id}
                              className={`absolute left-0.5 right-0.5 rounded-md border ${blockColor} p-1 overflow-hidden shadow-sm transition-all cursor-pointer z-20`}
                              style={{ top: `${top}px`, height: `${height}px` }}
                              title={`=== ${event.title} ===\n\nเวลา: ${formatTime(event.start)} - ${formatTime(event.end)}\n\nรายละเอียด/สถานที่:\n${event.location || '-'}`}
                            >
                              <div className="font-semibold text-xs leading-tight truncate">{event.title}</div>
                              <div className="text-[10px] opacity-90 truncate mt-0.5">
                                {formatTime(event.start)} - {formatTime(event.end)}
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
          </>
        )}
      </div>
    </div>
  );
};

export default TeamCompareModal;
