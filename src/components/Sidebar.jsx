import React from 'react';
import { User, Settings, Video } from 'lucide-react';

const Sidebar = ({ employees, selectedEmployee, onSelectEmployee }) => {
  // Simple check for "live status". In reality, this would check current time against events.
  const isLiveMeeting = false;

  return (
    <div className="glass-panel h-full flex flex-col p-6 rounded-r-3xl border-l-0 border-y-0">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-indigo-400">
          Calendar Dash
        </h1>
        <button className="glass-button p-2 rounded-full text-gray-300 hover:text-white">
          <Settings size={20} />
        </button>
      </div>

      {selectedEmployee && (
        <div className="flex flex-col items-center mb-8 relative">
          <div className="relative w-32 h-32 mb-4">
            <img 
              src={selectedEmployee.avatarUrl || `https://ui-avatars.com/api/?name=${selectedEmployee.name}`} 
              alt={selectedEmployee.name}
              className="w-full h-full rounded-full object-cover border-4 border-indigo-500/30"
            />
            {/* Live Status Indicator */}
            <div className={`absolute bottom-2 right-2 w-5 h-5 rounded-full border-2 border-[var(--bg)] ${isLiveMeeting ? 'bg-red-500 animate-pulse' : 'bg-emerald-500'}`}></div>
          </div>
          
          <h2 className="text-2xl font-semibold">{selectedEmployee.name}</h2>
          <p className="text-gray-400 text-sm">{selectedEmployee.email}</p>
          
          <div className={`mt-4 px-4 py-1.5 rounded-full text-sm font-medium flex items-center gap-2 ${isLiveMeeting ? 'bg-red-500/10 text-red-400 border border-red-500/20' : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'}`}>
            {isLiveMeeting ? <Video size={14} /> : <div className="w-2 h-2 rounded-full bg-emerald-400" />}
            {isLiveMeeting ? 'In a Meeting' : 'Available'}
          </div>
        </div>
      )}

      <div className="mt-auto">
        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Team Members</h3>
        <div className="space-y-2">
          {employees.map(emp => (
            <button
              key={emp.id}
              onClick={() => onSelectEmployee(emp)}
              className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all ${selectedEmployee?.id === emp.id ? 'bg-indigo-500/20 border border-indigo-500/30' : 'glass-button'}`}
            >
              <img 
                src={emp.avatarUrl || `https://ui-avatars.com/api/?name=${emp.name}`} 
                alt={emp.name}
                className="w-8 h-8 rounded-full"
              />
              <span className="font-medium text-sm">{emp.name}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
