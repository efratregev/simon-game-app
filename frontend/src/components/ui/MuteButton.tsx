/**
 * Mute Button Component
 * 
 * Toggle button for muting/unmuting game sounds.
 * Persists preference in localStorage.
 * 
 * UI Design: Dark glassmorphism with glow effects
 */

import { useState, useEffect } from 'react';
import { soundService } from '../../services/soundService';

interface MuteButtonProps {
  /** If true, removes fixed positioning for inline use */
  inline?: boolean;
}

export const MuteButton: React.FC<MuteButtonProps> = ({ inline = false }) => {
  const [isMuted, setIsMuted] = useState(soundService.getMuted());

  // Sync with sound service on mount
  useEffect(() => {
    setIsMuted(soundService.getMuted());
  }, []);

  const handleToggle = () => {
    const newMuted = soundService.toggleMute();
    setIsMuted(newMuted);
  };

  return (
    <button
      onClick={handleToggle}
      className={`
        ${inline ? '' : 'fixed top-4 right-4 z-50'}
        w-12 h-12 rounded-xl
        flex items-center justify-center
        transition-all duration-200
        backdrop-blur-xl border
        active:scale-90
        ${isMuted 
          ? 'bg-slate-800/80 border-slate-600/50 hover:bg-slate-700/80 shadow-lg' 
          : 'bg-green-500/20 border-green-500/50 hover:bg-green-500/30 shadow-lg shadow-green-500/20'}
      `}
      style={{ touchAction: 'manipulation' }}
      aria-label={isMuted ? 'Unmute sounds' : 'Mute sounds'}
      title={isMuted ? 'Click to unmute' : 'Click to mute'}
    >
      <span className="text-xl">
        {isMuted ? '🔇' : '🔊'}
      </span>
    </button>
  );
};

export default MuteButton;
