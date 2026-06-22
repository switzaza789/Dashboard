import React, { useState, useEffect } from 'react';
import { format, isSameDay, addDays, isToday } from 'date-fns';
import { fetchEvents } from '../api/calendar';

const EmployeeCard = ({ employee, currentDate, onOpenDayModal, onOpenEmployeeModal, onOpenEditProfileModal, gridCols = 2 }) => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  
  const isCompact = gridCols >= 3;

  // We show 5 days starting from the selected currentDate (rolling window)
  const workDays = [...Array(5)].map((_, i) => addDays(currentDate, i));

  useEffect(() => {
    let isMounted = true;
    const loadEvents = async () => {
      setLoading(true);
      // Fetch events for the 5 displayed days
      const data = await fetchEvents(employee.email, currentDate, addDays(currentDate, 4));
      if (isMounted) {
        setEvents(data);
        setLoading(false);
      }
    };
    if (employee.email) {
      loadEvents();
    }
    return () => { isMounted = false; };
  }, [employee, currentDate.toISOString()]);

  // Determine Live Status based on today's events (to match UI)
  const now = new Date();
  const todayEvents = events.filter(e => isSameDay(new Date(e.start), now));
  
  // Try to find an event that is active right now
  let currentEvent = todayEvents.find(e => {
    const start = new Date(e.start);
    const end = new Date(e.end);
    if (isNaN(end.getTime())) return true;
    return now >= start && now <= end;
  });

  // If no strictly active event, but there are events today, use the first one
  if (!currentEvent && todayEvents.length > 0) {
    currentEvent = todayEvents[0];
  }

  // Calculate status (prioritize customStatus override)
  let statusText = employee.customStatus || "Available";
  let statusColor = "text-emerald-400";
  let statusBorder = "border-emerald-400/50";

  if (employee.customStatus) {
    const cStatus = employee.customStatus.toLowerCase();
    if (cStatus.includes('ลา') || cStatus.includes('sick') || cStatus.includes('leave') || cStatus.includes('vacation')) {
      statusColor = "text-red-400";
      statusBorder = "border-red-400/50";
    } else if (cStatus.includes('wfh') || cStatus.includes('remote') || cStatus.includes('บ้าน')) {
      statusColor = "text-blue-400";
      statusBorder = "border-blue-400/50";
    } else if (cStatus.includes('meeting') || cStatus.includes('ประชุม')) {
      statusColor = "text-pink-400";
      statusBorder = "border-pink-400/50";
    } else {
      statusColor = "text-amber-400";
      statusBorder = "border-amber-400/50";
    }
  } else if (currentEvent) {
    const title = currentEvent.title.toLowerCase();
    if (title.includes('ลา') || title.includes('sick') || title.includes('leave') || title.includes('vacation')) {
      statusText = "On Leave";
      statusColor = "text-red-400";
      statusBorder = "border-red-400/50";
    } else if (title.includes('wfh') || title.includes('work from home') || title.includes('remote') || title.includes('บ้าน')) {
      statusText = "Working Remotely";
      statusColor = "text-blue-400";
      statusBorder = "border-blue-400/50";
    } else if (title.includes('meeting') || title.includes('ประชุม')) {
      statusText = "In a Meeting";
      statusColor = "text-pink-400";
      statusBorder = "border-pink-400/50";
    } else if (title.includes('ออฟฟิศ') || title.includes('office')) {
      statusText = "At Office";
      statusColor = "text-emerald-400";
      statusBorder = "border-emerald-400/50";
    } else {
      // Instead of generic "In a Meeting", use the actual event title (truncated)
      statusText = currentEvent.title.length > 18 ? currentEvent.title.substring(0, 18) + '...' : currentEvent.title;
      statusColor = "text-amber-400";
      statusBorder = "border-amber-400/50";
    }
  }



  return (
    <div className={`flex flex-col md:flex-row ${isCompact ? 'gap-4 p-4' : 'gap-6 p-6'} bg-[#111827] rounded-3xl border border-[#1f2937] shadow-xl hover:shadow-cyan-900/40 hover:border-cyan-500/50 hover:scale-[1.02] hover:z-10 relative transition-all duration-300`}>
      
      {/* Left Panel: Profile */}
      <div 
        onClick={() => onOpenEmployeeModal(employee, events)}
        className={`flex flex-col items-center justify-center shrink-0 relative cursor-pointer group/profile ${isCompact ? 'min-w-[120px] md:w-1/4' : 'min-w-[200px] md:w-1/3'}`}
        title={`คลิกเพื่อดูตารางงานทั้งหมดของ ${employee.name}`}
      >
        <div className={`relative transition-transform duration-300 group-hover/profile:scale-110 ${isCompact ? 'w-16 h-16 mb-2' : 'w-28 h-28 mb-4'}`}>
          <div className="absolute inset-0 rounded-full border-[3px] border-cyan-400 p-1 group-hover/profile:border-pink-400 transition-colors duration-300">
            <img 
              src={employee.avatarUrl || `https://ui-avatars.com/api/?name=${employee.name}&background=1f2937&color=fff`} 
              alt={employee.name}
              className="w-full h-full rounded-full object-cover bg-[#1f2937]"
            />
          </div>
        </div>
        <h2 className={`${isCompact ? 'text-base' : 'text-xl'} font-bold text-white uppercase tracking-wider text-center group-hover/profile:text-cyan-400 transition-colors duration-300`}>{employee.name}</h2>
        

        
        <div className={`mt-1.5 flex items-center gap-1.5 ${isCompact ? 'text-xs flex-col' : 'text-sm mt-2'}`}>
          {!isCompact && <span className="text-gray-400 font-medium">Status:</span>}
          <span className={`${statusColor} font-semibold text-center bg-black/30 px-2 py-0.5 rounded-full border ${statusBorder}`}>
            {statusText}
          </span>
        </div>

        {/* Shortcut Button Row */}
        <div className="flex gap-1.5 mt-3.5 shrink-0">

          
          <button
            onClick={(e) => {
              e.stopPropagation();
              onOpenEditProfileModal(employee);
            }}
            className="py-1 px-2 bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-white rounded-lg text-xs font-semibold border border-gray-700 flex items-center gap-1 transition-all"
            title="แก้ไขแผนก / สถานะ"
          >
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            แก้ไข
          </button>
        </div>
      </div>

      {/* Right Panel: 5-Day List */}
      <div className="flex-1 flex flex-col justify-center gap-2 min-w-0 relative">
        <div className={`flex flex-col gap-2 transition-opacity duration-200 ${loading ? 'opacity-40' : 'opacity-100'}`}>
          {workDays.map(day => {
            const dayEvents = events.filter(e => isSameDay(new Date(e.start), day));
            // Sort by start time
            dayEvents.sort((a, b) => new Date(a.start) - new Date(b.start));
            
            // Get summary text
            let summaryText = '-';
            if (dayEvents.length === 1) {
              summaryText = dayEvents[0].title;
            } else if (dayEvents.length > 1) {
              summaryText = `${dayEvents[0].title} (+${dayEvents.length - 1} more)`;
            }

            const isCurrentDay = isToday(day);

            return (
              <button 
                key={day.toISOString()}
                onClick={(e) => {
                  e.stopPropagation();
                  onOpenDayModal(employee, day, dayEvents);
                }}
                className={`flex items-center text-left w-full ${isCompact ? 'p-2' : 'p-3'} rounded-xl transition-colors group relative overflow-hidden ${
                  isCurrentDay 
                    ? 'bg-cyan-900/30 border border-cyan-500/50 hover:bg-cyan-800/40' 
                    : 'bg-[#1f2937]/50 border border-[#1f2937] hover:bg-[#374151]/80 hover:border-cyan-500/50'
                }`}
                title={`คลิกเพื่อดูรายละเอียด: ${summaryText}`}
              >
                <div className={`${isCompact ? 'w-12 text-[10px]' : 'w-16 text-xs'} shrink-0 flex flex-col font-bold uppercase tracking-widest leading-tight ${isCurrentDay ? 'text-white' : 'text-cyan-400'}`}>
                  <span>{format(day, 'EEE')}</span>
                  <span className="text-[10px] text-gray-500">{format(day, 'd/M')}</span>
                </div>
                <div className={`flex-1 truncate transition-colors font-medium min-w-0 ${isCompact ? 'text-xs' : 'text-sm'} ${isCurrentDay ? 'text-cyan-300' : 'text-gray-300 group-hover:text-white'}`}>
                  {summaryText}
                </div>
                {isCurrentDay && (
                  <div className="absolute right-3 w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></div>
                )}
              </button>
            );
          })}
        </div>
        
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/10 rounded-xl backdrop-blur-[1px]">
            <div className="w-6 h-6 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}
      </div>

    </div>
  );
};

export default EmployeeCard;
