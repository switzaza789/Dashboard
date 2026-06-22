import React, { useState } from 'react';
import { format } from 'date-fns';
import { X, Clock, MapPin } from 'lucide-react';

const DayEventsModal = ({ isOpen, onClose, date, events, employeeName, employeeEmail, onDataChanged, onAddEventClick, showToast }) => {


  if (!isOpen) return null;

  const formatTime = (isoString) => format(new Date(isoString), 'h:mm a');



  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      ></div>
      
      {/* Modal Content */}
      <div className="relative w-full max-w-lg bg-[#111827] border border-[#1f2937] shadow-2xl rounded-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="p-6 border-b border-[#1f2937] flex items-center justify-between bg-[#1f2937]/30">
          <div>
            <h2 className="text-xl font-bold text-white mb-1">
              {format(date, 'EEEE, MMMM d, yyyy')}
            </h2>
            <p className="text-sm text-cyan-400 font-medium">
              Schedule for {employeeName}
            </p>
          </div>
          <button 
            onClick={onClose}
            className="p-2 rounded-full hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto flex-1">

          {events.length === 0 ? (
            <div className="text-center text-gray-500 py-10 border border-dashed border-[#374151] rounded-xl">
              No events scheduled for this day.
            </div>
          ) : (
            <div className="space-y-4">
              {events.map(event => (
                <div key={event.id} className="p-4 bg-[#1f2937] border border-[#374151] rounded-xl flex items-center justify-between group">
                  <div>
                    <h3 className="font-bold text-white text-lg">{event.title}</h3>
                    <div className="flex flex-col gap-1 mt-2 text-sm text-gray-400">
                      <div className="flex items-center gap-2">
                        <Clock size={14} className="text-cyan-400" />
                        <span>{formatTime(event.start)} - {formatTime(event.end)}</span>
                      </div>
                      {event.location && (
                        <div className="flex items-center gap-2">
                          <MapPin size={14} className="text-cyan-400" />
                          <span>{event.location}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  

                </div>
              ))}
            </div>
          )}
        </div>
      </div>


    </div>
  );
};

export default DayEventsModal;
