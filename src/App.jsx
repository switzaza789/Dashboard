import React, { useState, useEffect, useRef } from 'react';
import { fetchEmployees } from './api/calendar';
import EmployeeCard from './components/EmployeeCard';
import DayEventsModal from './components/DayEventsModal';
import EmployeeEventsModal from './components/EmployeeEventsModal';
import TeamCompareModal from './components/TeamCompareModal';
import FullCalendarModal from './components/FullCalendarModal';
import LoginScreen from './components/LoginScreen';

import EditProfileModal from './components/EditProfileModal';
import Toast from './components/Toast';
import { startOfWeek, addDays, subDays, format } from 'date-fns';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, LayoutGrid, List, LayoutTemplate, Users, LogOut, Sun, Moon, Calendar } from 'lucide-react';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Base date for the current view week
  const [currentDate, setCurrentDate] = useState(new Date());
  // Week start (Monday)
  const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });

  // Format the current selected date
  const getDisplayDate = () => {
    return currentDate.toLocaleDateString('th-TH', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  // Day Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [modalData, setModalData] = useState({ date: new Date(), events: [], employeeName: '' });

  // Employee Modal State
  const [empModalOpen, setEmpModalOpen] = useState(false);
  const [empModalData, setEmpModalData] = useState({ employee: null, events: [] });

  // Team Compare Modal State
  const [compareModalOpen, setCompareModalOpen] = useState(false);

  // Full Calendar Modal State
  const [fullCalendarOpen, setFullCalendarOpen] = useState(false);



  // Edit Profile Modal State
  const [editProfileModalOpen, setEditProfileModalOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);

  // Toast Notification State
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
  };

  // Local storage customization mapping
  const [customProfiles, setCustomProfiles] = useState(() => {
    const saved = localStorage.getItem('custom_profiles');
    return saved ? JSON.parse(saved) : {};
  });

  const handleUpdateProfile = (email, department, customStatus, avatarUrl) => {
    const updated = {
      ...customProfiles,
      [email]: { department, customStatus, avatarUrl }
    };
    setCustomProfiles(updated);
    localStorage.setItem('custom_profiles', JSON.stringify(updated));
  };

  const handleUpdateColor = (email, color) => {
    const current = customProfiles[email] || {};
    const updated = {
      ...customProfiles,
      [email]: { ...current, calendarColor: color }
    };
    setCustomProfiles(updated);
    localStorage.setItem('custom_profiles', JSON.stringify(updated));
  };

  // Force dark mode on mount
  useEffect(() => {
    document.documentElement.classList.add('dark');
  }, []);

  // Layout State
  const [gridCols, setGridCols] = useState(3);

  // Live Time State
  const [currentTimeReal, setCurrentTimeReal] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTimeReal(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Date Picker Ref
  const dateInputRef = useRef(null);

  const handleDateClick = () => {
    if (dateInputRef.current) {
      try {
        // Modern browsers support showPicker() to open the native date UI
        dateInputRef.current.showPicker();
      } catch (e) {
        dateInputRef.current.focus();
      }
    }
  };

  // Fetch Data on Auth
  useEffect(() => {
    if (!isAuthenticated) return;
    
    let isMounted = true;
    const loadData = async () => {
      setLoading(true);
      const data = await fetchEmployees();
      if (isMounted) {
        setEmployees(data);
        setLoading(false);
      }
    };
    loadData();
    return () => { isMounted = false; };
  }, [isAuthenticated]);

  const refreshData = async () => {
    setLoading(true);
    const data = await fetchEmployees();
    setEmployees(data);
    setLoading(false);
  };

  const nextDay = () => setCurrentDate(addDays(currentDate, 1));
  const prevDay = () => setCurrentDate(subDays(currentDate, 1));
  const goToday = () => setCurrentDate(new Date());



  // Merge local custom storage data with fetched DB data
  const DEFAULT_COLORS = ["#2563eb", "#dc2626", "#059669", "#7c3aed", "#d97706", "#db2777", "#0d9488"];

  const processedEmployees = employees.map((emp, index) => {
    const custom = customProfiles[emp.email] || {};
    return {
      ...emp,
      department: custom.department || emp.department || 'General',
      customStatus: custom.customStatus || '',
      avatarUrl: custom.avatarUrl || emp.avatarUrl,
      calendarColor: custom.calendarColor || DEFAULT_COLORS[index % DEFAULT_COLORS.length]
    };
  });

  const filteredEmployees = processedEmployees;

  const handleOpenDayModal = (employee, date, dayEvents) => {
    setModalData({
      date,
      events: dayEvents,
      employeeName: employee.name,
      employeeEmail: employee.email
    });
    setModalOpen(true);
  };

  const handleOpenEmployeeModal = (employee, allEvents) => {
    setEmpModalData({
      employee,
      events: allEvents
    });
    setEmpModalOpen(true);
  };

  if (!isAuthenticated) {
    return <LoginScreen onLogin={() => setIsAuthenticated(true)} />;
  }

  return (
    <div className="min-h-screen w-full bg-[#030712] text-gray-200 font-sans p-4 md:p-8 overflow-y-auto">
      
      {/* Header */}
      <div className="max-w-6xl mx-auto mb-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-600 to-blue-600 dark:from-cyan-400 dark:to-blue-500">
            Team Schedule
          </h1>
          <div 
            className="relative group cursor-pointer inline-block mt-2 bg-gray-800/50 hover:bg-gray-800 px-4 py-2 rounded-xl transition-all border border-gray-700/50 hover:border-cyan-500/50"
            onClick={handleDateClick}
            title="คลิกเพื่อเลือกวันที่"
          >
            <p className="text-cyan-400 font-medium flex items-center gap-2">
              <CalendarIcon size={16} className="group-hover:animate-bounce" />
              วันที่กำลังแสดงผล: {getDisplayDate()}
            </p>
            <input 
              ref={dateInputRef}
              type="date"
              value={format(currentDate, 'yyyy-MM-dd')}
              onChange={(e) => {
                if (e.target.value) {
                  setCurrentDate(new Date(e.target.value));
                }
              }}
              className="absolute bottom-0 left-0 w-0 h-0 opacity-0 pointer-events-none"
            />
          </div>
        </div>
        
        {/* Navigation & Layout Controls */}
        <div className="flex flex-wrap items-center gap-3">
          




          <button 
            onClick={() => setFullCalendarOpen(true)}
            className="hidden md:flex items-center gap-2 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-medium transition-colors shadow-[0_0_15px_rgba(147,51,234,0.3)] border border-purple-400"
          >
            <CalendarIcon size={18} />
            Full Calendar
          </button>

          <button 
            onClick={() => setCompareModalOpen(true)}
            className="hidden md:flex items-center gap-2 px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-medium transition-colors shadow-[0_0_15px_rgba(6,182,212,0.3)] border border-cyan-400"
          >
            <Users size={18} />
            Compare Team
          </button>

          {/* Theme toggle removed to maintain dark mode */}

          <button 
            onClick={() => setIsAuthenticated(false)}
            className="flex items-center gap-2 p-2 rounded-xl text-gray-400 hover:text-red-400 hover:bg-red-400/10 transition-colors"
            title="Logout"
          >
            <LogOut size={20} />
          </button>

          {/* Live Clock */}
          <div className="hidden md:flex items-center gap-2 px-4 py-2 rounded-xl bg-[#1f2937]/50 border border-cyan-500/30 text-cyan-300 font-mono text-lg font-semibold tracking-wider shadow-[0_0_10px_rgba(6,182,212,0.1)]">
            {format(currentTimeReal, 'HH:mm:ss')}
          </div>

          {/* Layout Toggles */}
          <div className="flex rounded-xl bg-[#1f2937] border border-[#374151] overflow-hidden mr-2">
            <button 
              onClick={() => setGridCols(1)} 
              className={`p-2 transition-colors ${gridCols === 1 ? 'bg-cyan-500/20 text-cyan-400' : 'hover:bg-[#374151] text-gray-400 hover:text-white'}`}
              title="1 Column"
            >
              <List size={20} />
            </button>
            <div className="w-[1px] bg-[#374151]"></div>
            <button 
              onClick={() => setGridCols(2)} 
              className={`p-2 transition-colors ${gridCols === 2 ? 'bg-cyan-500/20 text-cyan-400' : 'hover:bg-[#374151] text-gray-400 hover:text-white'}`}
              title="2 Columns"
            >
              <LayoutGrid size={20} />
            </button>
            <div className="w-[1px] bg-[#374151]"></div>
            <button 
              onClick={() => setGridCols(3)} 
              className={`p-2 transition-colors ${gridCols === 3 ? 'bg-cyan-500/20 text-cyan-400' : 'hover:bg-[#374151] text-gray-400 hover:text-white'}`}
              title="3 Columns"
            >
              <LayoutTemplate size={20} />
            </button>
            <div className="w-[1px] bg-[#374151]"></div>
            <button 
              onClick={() => setGridCols(5)} 
              className={`p-2 transition-colors ${gridCols === 5 ? 'bg-cyan-500/20 text-cyan-400' : 'hover:bg-[#374151] text-gray-400 hover:text-white'}`}
              title="Fit All (5 Columns)"
            >
              <Users size={20} />
            </button>
          </div>

          <button 
            onClick={goToday}
            className="px-4 py-2 rounded-xl bg-[#1f2937] border border-[#374151] hover:bg-[#374151] hover:text-white transition-colors text-sm font-medium flex items-center gap-2"
          >
            <CalendarIcon size={16} className="text-cyan-400" />
            Today
          </button>
          <div className="flex rounded-xl bg-[#1f2937] border border-[#374151] overflow-hidden">
            <button onClick={prevDay} className="p-2 hover:bg-[#374151] hover:text-white transition-colors">
              <ChevronLeft size={20} />
            </button>
            <div className="w-[1px] bg-[#374151]"></div>
            <button onClick={nextDay} className="p-2 hover:bg-[#374151] hover:text-white transition-colors">
              <ChevronRight size={20} />
            </button>
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="max-w-6xl mx-auto">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-10 h-10 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-gray-400">Loading team members...</p>
          </div>
        ) : filteredEmployees.length === 0 ? (
          <div className="text-center py-20 text-gray-500">
            No employees found. Please check your Google Sheet.
          </div>
        ) : (
          <div className={`grid gap-4 md:gap-6 ${gridCols === 1 ? 'grid-cols-1 max-w-3xl mx-auto' : gridCols === 2 ? 'grid-cols-1 lg:grid-cols-2' : gridCols === 3 ? 'grid-cols-1 lg:grid-cols-2 xl:grid-cols-3' : 'grid-cols-1 md:grid-cols-3 xl:grid-cols-5'}`}>
            {filteredEmployees.map(emp => (
              <EmployeeCard 
                key={emp.id} 
                employee={emp} 
                currentDate={currentDate} 
                onOpenDayModal={handleOpenDayModal}
                onOpenEmployeeModal={handleOpenEmployeeModal}
                onOpenEditProfileModal={(employee) => {
                  setEditingEmployee(employee);
                  setEditProfileModalOpen(true);
                }}
                gridCols={gridCols}
              />
            ))}
          </div>
        )}
      </div>

      {/* Day Detail Modal */}
      <DayEventsModal 
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        date={modalData.date}
        events={modalData.events}
        employeeName={modalData.employeeName}
        employeeEmail={modalData.employeeEmail}
        onDataChanged={refreshData}
        showToast={showToast}
      />

      {/* Full Employee Events Modal */}
      <EmployeeEventsModal
        isOpen={empModalOpen}
        onClose={() => setEmpModalOpen(false)}
        employee={empModalData.employee}
        events={empModalData.events}
        weekStart={weekStart}
        onDataChanged={refreshData}
        showToast={showToast}
      />

      {/* Team Compare Modal */}
      <TeamCompareModal 
        isOpen={compareModalOpen}
        onClose={() => setCompareModalOpen(false)}
        employees={processedEmployees}
        initialDate={currentDate}
      />

      {/* Full Calendar Modal */}
      <FullCalendarModal
        isOpen={fullCalendarOpen}
        onClose={() => setFullCalendarOpen(false)}
        currentDate={currentDate}
        employees={processedEmployees}
        onColorChange={handleUpdateColor}
      />

      {/* Edit Profile & Status Modal */}
      <EditProfileModal 
        isOpen={editProfileModalOpen}
        onClose={() => {
          setEditProfileModalOpen(false);
          setEditingEmployee(null);
        }}
        employee={editingEmployee}
        onSave={handleUpdateProfile}
      />

      {/* Toast Notification */}
      <Toast 
        show={toast.show}
        message={toast.message}
        type={toast.type}
        onClose={() => setToast(prev => ({ ...prev, show: false }))}
      />
    </div>
  );
}

export default App;
