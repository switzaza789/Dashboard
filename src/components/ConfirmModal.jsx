import React from 'react';
import { AlertTriangle, CheckCircle, Info, X } from 'lucide-react';

const ConfirmModal = ({ isOpen, onClose, onConfirm, title, message, type = 'danger', confirmText = 'ตกลง', cancelText = 'ยกเลิก' }) => {
  if (!isOpen) return null;

  const getIcon = () => {
    switch (type) {
      case 'danger':
        return <AlertTriangle size={32} className="text-red-400 animate-bounce" />;
      case 'success':
        return <CheckCircle size={32} className="text-green-400" />;
      default:
        return <Info size={32} className="text-cyan-400" />;
    }
  };

  const getConfirmButtonClass = () => {
    switch (type) {
      case 'danger':
        return 'bg-red-600 hover:bg-red-500 text-white border-red-500 shadow-[0_0_15px_rgba(239,68,68,0.2)]';
      case 'success':
        return 'bg-green-600 hover:bg-green-500 text-white border-green-500 shadow-[0_0_15px_rgba(34,197,94,0.2)]';
      default:
        return 'bg-cyan-600 hover:bg-cyan-500 text-white border-cyan-500 shadow-[0_0_15px_rgba(6,182,212,0.2)]';
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-md" 
        onClick={onClose}
      ></div>

      {/* Content */}
      <div className="relative w-full max-w-sm bg-[#111827] border border-[#1f2937] shadow-2xl rounded-2xl overflow-hidden flex flex-col p-6 text-center animate-in fade-in zoom-in-95 duration-200">
        
        {/* Close Button */}
        <button 
          onClick={onClose} 
          className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-white/10 text-gray-500 hover:text-white transition-colors"
        >
          <X size={16} />
        </button>

        {/* Icon */}
        <div className="mx-auto mb-4 w-16 h-16 rounded-full bg-slate-900/50 flex items-center justify-center border border-slate-700/50">
          {getIcon()}
        </div>

        {/* Text */}
        <h3 className="text-lg font-bold text-white mb-2">{title}</h3>
        <p className="text-gray-400 text-sm mb-6 whitespace-pre-line leading-relaxed">{message}</p>

        {/* Action Buttons */}
        <div className="flex gap-3 justify-center">
          {cancelText && (
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-[#1f2937] hover:bg-[#374151] text-gray-300 rounded-xl transition-colors text-sm font-semibold border border-gray-700 w-24"
            >
              {cancelText}
            </button>
          )}
          <button
            type="button"
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className={`px-4 py-2 rounded-xl transition-all text-sm font-semibold border w-28 ${getConfirmButtonClass()}`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
