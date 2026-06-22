import React, { useState } from 'react';
import { Lock, ArrowRight } from 'lucide-react';

const LoginScreen = ({ onLogin }) => {
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');

  // Default PIN is 1234 if not set in .env
  const correctPin = import.meta.env.VITE_LOGIN_PIN || '1234';

  const handleSubmit = (e) => {
    e.preventDefault();
    if (pin === correctPin) {
      onLogin();
    } else {
      setError('รหัส PIN ไม่ถูกต้อง / Invalid PIN');
      setPin('');
    }
  };

  return (
    <div className="min-h-screen bg-[#0b0f19] flex items-center justify-center p-4">
      <div className="bg-[#111827] border border-[#1f2937] p-8 rounded-2xl shadow-2xl max-w-sm w-full text-center">
        <div className="w-16 h-16 bg-cyan-900/50 text-cyan-400 rounded-full flex items-center justify-center mx-auto mb-6 border border-cyan-500/30">
          <Lock size={32} />
        </div>
        <h1 className="text-2xl font-bold text-white mb-2 tracking-wide">Team Dashboard</h1>
        <p className="text-gray-400 text-sm mb-8">กรุณากรอกรหัส PIN เพื่อเข้าสู่ระบบ</p>
        
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input 
            type="password" 
            value={pin}
            onChange={(e) => setPin(e.target.value)}
            className="bg-[#1f2937] border border-[#374151] rounded-xl px-4 py-3 text-center text-2xl text-white tracking-[0.5em] focus:outline-none focus:border-cyan-500 transition-colors"
            placeholder="••••"
            maxLength={6}
            autoFocus
          />
          {error && <p className="text-red-400 text-sm animate-pulse">{error}</p>}
          <button 
            type="submit"
            className="w-full bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-3 px-4 rounded-xl transition-colors flex items-center justify-center gap-2"
          >
            Enter Dashboard <ArrowRight size={20} />
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginScreen;
