import React, { useState, useEffect } from 'react';
import { X, Calendar as CalendarIcon, Clock, MapPin, AlignLeft, User } from 'lucide-react';
import { createEvent } from '../api/calendar';
import { format } from 'date-fns';

const CreateEventModal = ({ isOpen, onClose, employees, onEventCreated, initialEmail = '', initialDate = '', showToast }) => {
  const [formData, setFormData] = useState({
    email: initialEmail || '',
    title: '',
    date: initialDate || format(new Date(), 'yyyy-MM-dd'),
    startTime: '09:00',
    endTime: '10:00',
    location: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      setFormData({
        email: initialEmail || '',
        title: '',
        date: initialDate || format(new Date(), 'yyyy-MM-dd'),
        startTime: '09:00',
        endTime: '10:00',
        location: ''
      });
      setError('');
    }
  }, [isOpen, initialEmail, initialDate]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Combine date and time to ISO string
      const startIso = new Date(`${formData.date}T${formData.startTime}`).toISOString();
      const endIso = new Date(`${formData.date}T${formData.endTime}`).toISOString();

      await createEvent({
        email: formData.email,
        title: formData.title,
        start: startIso,
        end: endIso,
        location: formData.location
      });
      
      if (showToast) {
        showToast('เพิ่มกิจกรรมใหม่สำเร็จเรียบร้อยแล้ว / Event created successfully!', 'success');
      }
      
      onEventCreated();
      onClose();
    } catch (err) {
      if (showToast) {
        showToast('ไม่สามารถบันทึกกิจกรรมได้ / Create event failed', 'error');
      }
      setError('เกิดข้อผิดพลาดในการบันทึกข้อมูล กรุณาลองใหม่');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose}></div>
      <div className="relative w-full max-w-md bg-[#111827] border border-[#1f2937] shadow-2xl rounded-2xl overflow-hidden flex flex-col">
        <div className="p-4 border-b border-[#1f2937] flex items-center justify-between bg-gradient-to-r from-[#1f2937]/50 to-transparent">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <CalendarIcon size={20} className="text-cyan-400" />
            สร้างกิจกรรมใหม่
          </h2>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-white/10 text-gray-400 hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="p-6">
          {error && <div className="mb-4 p-3 bg-red-900/30 border border-red-500/50 text-red-400 rounded-lg text-sm">{error}</div>}
          
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1.5 flex items-center gap-2"><User size={14}/> พนักงาน</label>
              <select 
                required
                value={formData.email}
                onChange={e => setFormData({...formData, email: e.target.value})}
                className="w-full bg-[#1f2937] border border-[#374151] rounded-lg p-2.5 text-white focus:outline-none focus:border-cyan-500"
              >
                <option value="">-- เลือกพนักงาน --</option>
                {employees.map(emp => (
                  <option key={emp.email} value={emp.email}>{emp.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1.5 flex items-center gap-2"><AlignLeft size={14}/> ชื่องาน / กิจกรรม</label>
              <input 
                required
                type="text"
                placeholder="เช่น ประชุมทีม, WFH, ลาพักร้อน"
                value={formData.title}
                onChange={e => setFormData({...formData, title: e.target.value})}
                className="w-full bg-[#1f2937] border border-[#374151] rounded-lg p-2.5 text-white focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-400 mb-1.5 flex items-center gap-2"><CalendarIcon size={14}/> วันที่</label>
                <input 
                  required
                  type="date"
                  value={formData.date}
                  onChange={e => setFormData({...formData, date: e.target.value})}
                  className="w-full bg-[#1f2937] border border-[#374151] rounded-lg p-2.5 text-white focus:outline-none focus:border-cyan-500 [color-scheme:dark]"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1.5 flex items-center gap-2"><Clock size={14}/> เวลาเริ่ม</label>
                <input 
                  required
                  type="time"
                  value={formData.startTime}
                  onChange={e => setFormData({...formData, startTime: e.target.value})}
                  className="w-full bg-[#1f2937] border border-[#374151] rounded-lg p-2.5 text-white focus:outline-none focus:border-cyan-500 [color-scheme:dark]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1.5 flex items-center gap-2"><Clock size={14}/> เวลาสิ้นสุด</label>
                <input 
                  required
                  type="time"
                  value={formData.endTime}
                  onChange={e => setFormData({...formData, endTime: e.target.value})}
                  className="w-full bg-[#1f2937] border border-[#374151] rounded-lg p-2.5 text-white focus:outline-none focus:border-cyan-500 [color-scheme:dark]"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1.5 flex items-center gap-2"><MapPin size={14}/> สถานที่ / รายละเอียด</label>
              <textarea 
                rows="2"
                placeholder="ลิงก์ประชุม หรือรายละเอียดเพิ่มเติม"
                value={formData.location}
                onChange={e => setFormData({...formData, location: e.target.value})}
                className="w-full bg-[#1f2937] border border-[#374151] rounded-lg p-2.5 text-white focus:outline-none focus:border-cyan-500 resize-none"
              ></textarea>
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="mt-2 w-full bg-cyan-600 hover:bg-cyan-500 disabled:bg-gray-600 text-white font-bold py-3 px-4 rounded-xl transition-colors flex items-center justify-center gap-2"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : "บันทึกกิจกรรม"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateEventModal;
