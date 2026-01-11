/**
 * Toast Notification Component
 * 
 * Shows temporary success/error messages
 * UI Design: Dark glassmorphism with neon accents
 */

import { useEffect } from 'react';

interface ToastProps {
  message: string;
  type?: 'success' | 'error' | 'info';
  duration?: number;
  onClose: () => void;
}

export function Toast({ message, type = 'success', duration = 3000, onClose }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const styles = {
    success: {
      bg: 'bg-green-500/20 backdrop-blur-xl border-green-500/50',
      text: 'text-green-400',
      shadow: 'shadow-green-500/20',
    },
    error: {
      bg: 'bg-red-500/20 backdrop-blur-xl border-red-500/50',
      text: 'text-red-400',
      shadow: 'shadow-red-500/20',
    },
    info: {
      bg: 'bg-blue-500/20 backdrop-blur-xl border-blue-500/50',
      text: 'text-blue-400',
      shadow: 'shadow-blue-500/20',
    },
  };

  const icons = {
    success: '✅',
    error: '⚠️',
    info: 'ℹ️',
  };

  const style = styles[type];

  return (
    <div className="fixed top-2 right-2 sm:top-4 sm:right-4 z-50 animate-slide-in max-w-[calc(100vw-1rem)] sm:max-w-md">
      <div className={`${style.bg} border rounded-2xl shadow-lg ${style.shadow} px-4 sm:px-5 py-3 sm:py-4 flex items-center gap-3 min-w-[280px] sm:min-w-[320px]`}>
        <span className="text-2xl">{icons[type]}</span>
        <span className={`font-bold text-sm sm:text-base flex-1 ${style.text}`}>{message}</span>
        <button
          onClick={onClose}
          className="text-white/60 hover:text-white active:text-white transition-colors text-lg w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center"
          aria-label="Close"
        >
          ✕
        </button>
      </div>
    </div>
  );
}
