import React, { useEffect, useRef, useState } from 'react';
import { format, isToday, isSameDay, addDays, getHours, getMinutes, differenceInMinutes } from 'date-fns';
import { X, Calendar as CalendarIcon } from 'lucide-react';

const EmployeeEventsModal = ({ isOpen, onClose, employee, events, weekStart, onDataChanged, onAddEventClick, showToast }) => {
  const scrollRef = useRef(null);
  const [selectedEvent, setSelectedEvent] = useState(null);


  useEffect(() => {
    if (isOpen && scrollRef.current) {
      // Scroll to 8 AM (60px per hour * 8 = 480px)
      scrollRef.current.scrollTop = 480;
    }
  }, [isOpen]);

  if (!isOpen || !employee || !weekStart) return null;

  // Render full 7 days (Monday to Sunday)
  const days = [...Array(7)].map((_, i) => addDays(weekStart, i));
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



  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      ></div>
      
      {/* Modal Content */}
      <div className="relative w-full max-w-6xl h-[90vh] bg-[#111827] border border-[#1f2937] shadow-2xl rounded-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-[#1f2937] flex items-center justify-between bg-gradient-to-r from-[#1f2937]/50 to-transparent shrink-0">
          <div className="flex items-center gap-4">
            <img 
              src={employee.avatarUrl || `https://ui-avatars.com/api/?name=${employee.name}&background=1f2937&color=fff`} 
              alt={employee.name}
              className="w-12 h-12 rounded-full border-2 border-cyan-400 bg-[#1f2937]"
            />
            <div>
              <h2 className="text-xl font-bold text-white uppercase tracking-wider">
                {employee.name}'s Schedule
              </h2>
              <p className="text-xs text-cyan-400 font-medium flex items-center gap-1 mt-0.5">
                <CalendarIcon size={12} />
                Week of {format(weekStart, 'MMMM d, yyyy')}
              </p>
            </div>
            

          </div>
          <button 
            onClick={onClose}
            className="p-2 rounded-full hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Calendar Header (Days) */}
        <div className="flex border-b border-[#374151] bg-[#1f2937]/30 shrink-0">
          <div className="w-16 shrink-0"></div> {/* Time column spacer */}
          <div className="flex-1 grid grid-cols-7 pr-4"> {/* pr-4 to align with scrollbar */}
            {days.map(day => {
              const currentDay = isToday(day);
              return (
                <div key={day.toISOString()} className="text-center py-3 border-l border-[#374151]/50">
                  <div className={`text-xs font-medium uppercase tracking-widest ${currentDay ? 'text-cyan-400' : 'text-gray-400'}`}>
                    {format(day, 'EEE')}
                  </div>
                  <div className={`text-xl font-light mt-1 ${currentDay ? 'text-white bg-cyan-600 rounded-full w-8 h-8 mx-auto flex items-center justify-center' : 'text-gray-200'}`}>
                    {format(day, 'd')}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* All-Day Events Section */}
        <div className="flex border-b border-[#374151] bg-[#111827] shrink-0">
          <div className="w-16 shrink-0 border-r border-[#374151] flex items-center justify-center">
            <span className="text-[10px] text-gray-500 font-medium uppercase tracking-wider">All-Day</span>
          </div>
          <div className="flex-1 grid grid-cols-7 pr-4">
            {days.map(day => {
              const dayEvents = events.filter(e => isSameDay(new Date(e.start), day));
              const allDayEvents = dayEvents.filter(e => {
                const durationMinutes = Math.max(differenceInMinutes(new Date(e.end), new Date(e.start)), 0);
                return durationMinutes >= 1430; // 23h 50m or more is considered All-Day
              });

              return (
                <div key={day.toISOString()} className="border-l border-[#374151]/50 p-1 flex flex-col gap-1 min-h-[30px]">
                  {allDayEvents.map(event => {
                    const blockColor = getEventColor(event.title);
                    return (
                      <div 
                        key={event.id} 
                        onClick={() => setSelectedEvent(event)}
                        className={`rounded px-1.5 py-0.5 text-xs border ${blockColor} truncate cursor-pointer hover:scale-105 transition-transform`}
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
            <div className="flex-1 grid grid-cols-7 relative">
              
              {/* Horizontal Grid Lines */}
              <div className="absolute inset-0 pointer-events-none flex flex-col">
                {hours.map(hour => (
                  <div key={hour} className="h-[60px] border-b border-[#374151]/30"></div>
                ))}
              </div>

              {/* Vertical Day Columns & Events */}
              {days.map(day => {
                const dayEvents = events.filter(e => isSameDay(new Date(e.start), day));
                const timedEvents = dayEvents.filter(e => {
                  const durationMinutes = Math.max(differenceInMinutes(new Date(e.end), new Date(e.start)), 0);
                  return durationMinutes < 1430; // Only non-all-day events
                });
                
                return (
                  <div key={day.toISOString()} className="relative border-l border-[#374151]/30 hover:bg-white/[0.02] transition-colors">
                    {timedEvents.map(event => {
                      const startDate = new Date(event.start);
                      const endDate = new Date(event.end);
                      
                      // Calculate Top and Height
                      const startMinutes = (getHours(startDate) * 60) + getMinutes(startDate);
                      const durationMinutes = Math.max(differenceInMinutes(endDate, startDate), 0); // avoid negative
                      
                      // 1 minute = 1px (since 1 hour = 60px)
                      const top = startMinutes;
                      // Ensure minimum height so it's visible
                      const height = Math.max(durationMinutes, 25);

                      const blockColor = getEventColor(event.title);

                      return (
                        <div 
                          key={event.id}
                          onClick={() => setSelectedEvent(event)}
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
      </div>

      {/* Selected Event Details Modal */}
      {selectedEvent && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60" onClick={() => setSelectedEvent(null)}></div>
          <div className="relative bg-[#1f2937] border border-[#374151] rounded-xl shadow-2xl p-6 max-w-sm w-full">
            <h3 className="text-xl font-bold text-white mb-2">{selectedEvent.title}</h3>
            <p className="text-cyan-400 text-sm mb-4">
              {formatTime(selectedEvent.start)} - {formatTime(selectedEvent.end)}
            </p>
            {selectedEvent.location && <p className="text-gray-300 text-sm mb-6 bg-black/20 p-2 rounded">{selectedEvent.location}</p>}
            
            <div className="flex justify-end mt-4">
              <button 
                onClick={() => setSelectedEvent(null)} 
                className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg transition-colors font-semibold text-sm"
              >
                ปิด / Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployeeEventsModal;
