import React, { useEffect, useRef } from 'react';
import { X, CheckCircle, AlertTriangle } from 'lucide-react';

const Toast = ({ show, message, type = 'success', onClose }) => {
  const onCloseRef = useRef(onClose);

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    if (show) {
      const timer = setTimeout(() => {
        onCloseRef.current();
      }, 4000); // Automatically dismisses after 4 seconds
      return () => clearTimeout(timer);
    }
  }, [show]);

  if (!show) return null;

  return (
    <div className={`fixed bottom-5 right-5 z-[200] flex items-center gap-3 px-4 py-3.5 rounded-xl border shadow-2xl animate-in slide-in-from-bottom-5 fade-in duration-300 min-w-[280px] max-w-sm ${
      type === 'success' 
        ? 'bg-emerald-950/90 border-emerald-500/50 text-emerald-300 shadow-[0_0_15px_rgba(16,185,129,0.15)]' 
        : 'bg-red-950/90 border-red-500/50 text-red-300 shadow-[0_0_15px_rgba(239,68,68,0.15)]'
    }`}>
      {/* Icon */}
      {type === 'success' ? (
        <CheckCircle size={20} className="text-emerald-400 shrink-0" />
      ) : (
        <AlertTriangle size={20} className="text-red-400 shrink-0" />
      )}

      {/* Message */}
      <div className="flex-1 text-sm font-semibold leading-snug">
        {message}
      </div>

      {/* Close Button */}
      <button 
        onClick={onClose}
        className="p-1 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
      >
        <X size={14} />
      </button>
    </div>
  );
};

export default Toast;
