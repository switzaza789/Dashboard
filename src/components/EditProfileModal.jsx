import React, { useState, useEffect } from 'react';
import { X, Save, User, Activity } from 'lucide-react';

const EditProfileModal = ({ isOpen, onClose, employee, onSave }) => {
  const [department, setDepartment] = useState('');
  const [customStatus, setCustomStatus] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');

  useEffect(() => {
    if (isOpen && employee) {
      setDepartment(employee.department || 'Engineer');
      setCustomStatus(employee.customStatus || '');
      setAvatarUrl(employee.avatarUrl || '');
    }
  }, [isOpen, employee]);

  if (!isOpen || !employee) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(employee.email, department, customStatus, avatarUrl);
    onClose();
  };

  const quickStatuses = [
    { text: "ใช้สถานะตามปฏิทิน (Auto)", value: "" },
    { text: "Available (ว่าง)", value: "Available" },
    { text: "In a Meeting (ประชุมอยู่)", value: "In a Meeting" },
    { text: "Working Remotely / WFH", value: "Working Remotely" },
    { text: "On Leave (ลา)", value: "On Leave" },
    { text: "Out of Office (อยู่นอกออฟฟิศ)", value: "Out of Office" },
    { text: "Lunch Break (พักกลางวัน)", value: "Lunch Break" }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose}></div>
      
      {/* Modal */}
      <div className="relative w-full max-w-md bg-[#111827] border border-[#1f2937] shadow-2xl rounded-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-[#1f2937] flex items-center justify-between bg-[#1f2937]/50">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <User size={18} className="text-cyan-400" />
            แก้ไขข้อมูลพนักงาน: {employee.name}
          </h2>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-white/10 text-gray-400 hover:text-white transition-colors">
            <X size={18} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-5">

          {/* Avatar URL Input */}
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1.5 flex items-center gap-2">
              <User size={14} className="text-cyan-400" />
              URL รูปโปรไฟล์ (Profile Image URL)
            </label>
            <input
              type="text"
              placeholder="วางลิงก์รูปภาพ (เช่น https://.../image.jpg)"
              value={avatarUrl}
              onChange={(e) => setAvatarUrl(e.target.value)}
              className="w-full bg-[#1f2937] border border-[#374151] rounded-lg p-2.5 text-white focus:outline-none focus:border-cyan-500 text-sm"
            />
          </div>
          {/* Custom Status Input */}
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1.5 flex items-center gap-2">
              <Activity size={14} className="text-cyan-400" />
              ระบุสถานะเอง (Custom Status)
            </label>
            <input
              type="text"
              placeholder="เว้นว่างไว้เพื่อดึงสถานะอัตโนมัติจากปฏิทิน"
              value={customStatus}
              onChange={(e) => setCustomStatus(e.target.value)}
              className="w-full bg-[#1f2937] border border-[#374151] rounded-lg p-2.5 text-white focus:outline-none focus:border-cyan-500 text-sm mb-3"
            />
            
            {/* Quick Status Buttons */}
            <div className="flex flex-col gap-1.5 bg-black/20 p-2.5 rounded-lg border border-[#1f2937]">
              <span className="text-[10px] text-gray-500 uppercase tracking-widest font-semibold">ทางลัดสถานะด่วน (Quick Status)</span>
              <div className="flex flex-wrap gap-1.5 mt-1">
                {quickStatuses.map((qs) => (
                  <button
                    key={qs.text}
                    type="button"
                    onClick={() => setCustomStatus(qs.value)}
                    className={`text-xs px-2.5 py-1 rounded-md transition-colors ${
                      customStatus === qs.value 
                        ? 'bg-cyan-600 text-white font-medium' 
                        : 'bg-[#1f2937] hover:bg-[#374151] text-gray-300'
                    }`}
                  >
                    {qs.text}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex gap-3 justify-end mt-2 pt-4 border-t border-[#1f2937]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-400 hover:text-white transition-colors text-sm"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg flex items-center gap-1.5 font-bold transition-colors text-sm"
            >
              <Save size={16} />
              บันทึกข้อมูล
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditProfileModal;
