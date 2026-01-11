/**
 * Circular Simon Board Component (Classic Design with SVG)
 * 
 * Authentic circular Simon game with proper pie-slice wedges using SVG paths.
 * Replicates the iconic look of the original 1978 Simon game.
 * 
 * UI Design: Dark theme with neon glows (Top Game App Style)
 */

import { useState, useEffect, useRef } from 'react';
import type { Color } from '../../shared/types';
import { soundService } from '../../services/soundService';

// =============================================================================
// TYPES
// =============================================================================

interface CircularSimonBoardProps {
  sequence: Color[];
  round: number;
  isShowingSequence: boolean;
  isInputPhase: boolean;
  playerSequence: Color[];
  canSubmit: boolean;
  lastResult: { isCorrect: boolean; playerName: string } | null;
  onColorClick: (color: Color) => void;
  onSubmit: () => void;
  disabled?: boolean;
  secondsRemaining: number;
  timerColor: 'green' | 'yellow' | 'red';
  isTimerPulsing: boolean;
}

// =============================================================================
// SVG PATH HELPER - Creates pie slice arc path
// =============================================================================

function createWedgePath(
  centerX: number,
  centerY: number,
  innerRadius: number,
  outerRadius: number,
  startAngle: number,
  endAngle: number
): string {
  // Convert angles to radians
  const startRad = (startAngle * Math.PI) / 180;
  const endRad = (endAngle * Math.PI) / 180;

  // Calculate points
  const x1 = centerX + outerRadius * Math.cos(startRad);
  const y1 = centerY + outerRadius * Math.sin(startRad);
  const x2 = centerX + outerRadius * Math.cos(endRad);
  const y2 = centerY + outerRadius * Math.sin(endRad);
  const x3 = centerX + innerRadius * Math.cos(endRad);
  const y3 = centerY + innerRadius * Math.sin(endRad);
  const x4 = centerX + innerRadius * Math.cos(startRad);
  const y4 = centerY + innerRadius * Math.sin(startRad);

  // Large arc flag (0 for arcs less than 180 degrees)
  const largeArc = endAngle - startAngle > 180 ? 1 : 0;

  // Create SVG path
  return `
    M ${x1} ${y1}
    A ${outerRadius} ${outerRadius} 0 ${largeArc} 1 ${x2} ${y2}
    L ${x3} ${y3}
    A ${innerRadius} ${innerRadius} 0 ${largeArc} 0 ${x4} ${y4}
    Z
  `;
}

// =============================================================================
// WEDGE COMPONENT (SVG Pie Slice)
// =============================================================================

interface WedgeProps {
  color: Color;
  isActive: boolean;
  onClick: () => void;
  disabled: boolean;
  startAngle: number;
  endAngle: number;
  centerX: number;
  centerY: number;
  innerRadius: number;
  outerRadius: number;
}

const ColorWedge: React.FC<WedgeProps> = ({
  color,
  isActive,
  onClick,
  disabled,
  startAngle,
  endAngle,
  centerX,
  centerY,
  innerRadius,
  outerRadius,
}) => {
  // DIMMED base colors (darker when inactive) and VERY BRIGHT when active
  const colors: Record<Color, { dim: string; bright: string; glow: string }> = {
    green: { dim: '#166534', bright: '#22ff66', glow: '#22c55e' },  // Dark green -> Neon green
    red: { dim: '#991b1b', bright: '#ff3333', glow: '#ef4444' },    // Dark red -> Bright red
    yellow: { dim: '#a16207', bright: '#ffff00', glow: '#facc15' }, // Dark yellow -> Pure yellow
    blue: { dim: '#1e40af', bright: '#44bbff', glow: '#3b82f6' },   // Dark blue -> Bright blue
  };

  const wedgeColor = colors[color];
  const fillColor = isActive ? wedgeColor.bright : wedgeColor.dim;

  const path = createWedgePath(
    centerX,
    centerY,
    innerRadius,
    outerRadius,
    startAngle,
    endAngle
  );

  return (
    <path
      d={path}
      fill={fillColor}
      stroke="#0f0f23"
      strokeWidth="6"
      onClick={disabled ? undefined : onClick}
      style={{
        cursor: disabled ? 'not-allowed' : 'pointer',
        transition: 'fill 0.1s ease, filter 0.1s ease, transform 0.1s ease',
        filter: isActive 
          ? `brightness(1.5) drop-shadow(0 0 40px ${wedgeColor.glow}) drop-shadow(0 0 80px ${wedgeColor.glow})` 
          : 'brightness(1)',
        transformOrigin: `${centerX}px ${centerY}px`,
        transform: isActive ? 'scale(1.03)' : 'scale(1)',
        opacity: disabled ? 0.5 : 1,
      }}
      role="button"
      aria-label={`${color} button`}
      tabIndex={disabled ? -1 : 0}
      onKeyDown={(e) => {
        if (!disabled && (e.key === 'Enter' || e.key === ' ')) {
          onClick();
        }
      }}
    />
  );
};

// =============================================================================
// CIRCULAR SIMON BOARD COMPONENT
// =============================================================================

export const CircularSimonBoard: React.FC<CircularSimonBoardProps> = ({
  sequence,
  round,
  isShowingSequence,
  isInputPhase,
  playerSequence,
  canSubmit,
  onColorClick,
  onSubmit,
  disabled = false,
  secondsRemaining,
  timerColor,
  isTimerPulsing,
}) => {
  const [activeColor, setActiveColor] = useState<Color | null>(null);

  // SVG dimensions
  const size = 300;
  const centerX = size / 2;
  const centerY = size / 2;
  const outerRadius = size / 2 - 10; // Leave margin for stroke
  const innerRadius = size * 0.18; // Center hub size
  const gapAngle = 4; // Gap between wedges in degrees

  // Wedge angles (with gaps)
  const wedges: { color: Color; start: number; end: number }[] = [
    { color: 'green', start: 180 + gapAngle / 2, end: 270 - gapAngle / 2 },   // Top Left
    { color: 'red', start: 270 + gapAngle / 2, end: 360 - gapAngle / 2 },      // Top Right
    { color: 'yellow', start: 90 + gapAngle / 2, end: 180 - gapAngle / 2 },    // Bottom Left
    { color: 'blue', start: 0 + gapAngle / 2, end: 90 - gapAngle / 2 },        // Bottom Right
  ];

  // Track which color in sequence is being shown
  const [sequenceIndex, setSequenceIndex] = useState<number>(-1);
  
  // Track if audio is initialized
  const audioInitialized = useRef(false);
  
  // CRITICAL FIX: Use ref to track current sequence to avoid closure issues
  // When sequence prop changes between rounds, the ref ensures we always read the latest value
  // Update ref immediately (not in useEffect) to ensure it's always current
  const sequenceRef = useRef<Color[]>(sequence);
  sequenceRef.current = sequence; // Update synchronously, not in useEffect

  // Initialize audio on first user interaction
  useEffect(() => {
    const initAudio = async () => {
      if (!audioInitialized.current) {
        await soundService.init();
        audioInitialized.current = true;
      }
    };

    // Try to init immediately (will work if user has interacted)
    initAudio();

    // Also listen for first click
    const handleClick = () => {
      initAudio();
      document.removeEventListener('click', handleClick);
    };
    document.addEventListener('click', handleClick);

    return () => {
      document.removeEventListener('click', handleClick);
    };
  }, []);

  // Animate sequence when showing - DRAMATIC and SLOW with SOUND
  useEffect(() => {
    // Reset state immediately when not showing
    if (!isShowingSequence || sequence.length === 0) {
      setActiveColor(null);
      setSequenceIndex(-1);
      return;
    }

    // CRITICAL: Capture ALL values at the start
    // These captured values will be used throughout the animation
    const sequenceLength = sequence.length;
    const sequenceToShow = [...sequence]; // Copy to ensure we have exact sequence
    const currentRound = round;
    
    // Verify we have a valid sequence
    if (sequenceLength === 0) {
      console.error(`🎨 ERROR: Empty sequence for round ${currentRound}`);
      return;
    }
    
    console.log(`🎨 ANIMATION START: Round ${currentRound}, Length: ${sequenceLength}, Colors:`, sequenceToShow);

    // CRITICAL: These MUST match backend SIMON_CONSTANTS in game.types.ts
    // Backend: SHOW_COLOR_DURATION_MS = 600, SHOW_COLOR_GAP_MS = 200
    const SHOW_DURATION = 600;  // How long each color stays lit
    const SHOW_GAP = 200;       // Gap between colors (all dark)

    let currentIndex = 0;
    let timeoutId: ReturnType<typeof setTimeout>;
    let isCancelled = false; // Track if this effect was cancelled

    const showNextColor = () => {
      // CRITICAL FIX: Use the captured sequenceLength instead of reading from ref
      // This ensures we always use the length from when the animation started
      console.log(`🎨 showNextColor: index=${currentIndex}, sequenceLength=${sequenceLength}, cancelled=${isCancelled}`);
      
      if (isCancelled || currentIndex >= sequenceLength) {
        console.log(`🎨 Animation complete or cancelled. Index: ${currentIndex}, Length: ${sequenceLength}`);
        setActiveColor(null);
        setSequenceIndex(-1);
        return;
      }

      // Use the captured sequence array
      const color = sequenceToShow[currentIndex];
      console.log(`🎨 Showing color ${currentIndex + 1}/${sequenceLength}: ${color}`);
      setActiveColor(color);
      setSequenceIndex(currentIndex);

      // 🔊 PLAY COLOR TONE (duration matches visual)
      soundService.playColor(color, SHOW_DURATION / 1000);

      // Vibrate when showing sequence
      if ('vibrate' in navigator) {
        navigator.vibrate(100);
      }

      setTimeout(() => {
        if (isCancelled) {
          console.log(`🎨 Cancelled during timeout for index ${currentIndex}`);
          return; // Don't continue if effect was cancelled
        }
        
        setActiveColor(null);
        currentIndex++;
        
        // Use the captured sequenceLength instead of reading from ref
        console.log(`🎨 After timeout: index=${currentIndex}, sequenceLength=${sequenceLength}, cancelled=${isCancelled}`);
        
        if (!isCancelled && currentIndex < sequenceLength) {
          timeoutId = setTimeout(showNextColor, SHOW_GAP);
        } else {
          console.log(`🎨 Animation finished. Final index: ${currentIndex}, Length: ${sequenceLength}`);
          setActiveColor(null);
          setSequenceIndex(-1);
        }
      }, SHOW_DURATION);
    };

    // Small delay before starting sequence
    timeoutId = setTimeout(showNextColor, 500);

    return () => {
      console.log(`🎨 CLEANUP: Round ${currentRound}, cancelling animation`);
      isCancelled = true; // Mark as cancelled to prevent stale callbacks
      if (timeoutId) clearTimeout(timeoutId);
      setActiveColor(null);
      setSequenceIndex(-1);
    };
  }, [isShowingSequence, sequence, round]); // Dependencies: re-run when any of these change

  // Handle color button click
  const handleColorClick = (color: Color) => {
    if (disabled || isShowingSequence || !isInputPhase) return;

    // 🔊 PLAY COLOR TONE (short click sound)
    soundService.playColorClick(color);

    if ('vibrate' in navigator) {
      navigator.vibrate(50);
    }

    setActiveColor(color);
    setTimeout(() => setActiveColor(null), 150);
    onColorClick(color);
  };

  // Get color emoji
  const getColorEmoji = (color: Color): string => {
    const emojis: Record<Color, string> = {
      red: '🔴',
      blue: '🔵',
      yellow: '🟡',
      green: '🟢',
    };
    return emojis[color];
  };

  return (
    <div className="game-area flex flex-col items-center gap-4 w-full">
      {/* Round Display - Prominent */}
      <div className="text-center">
        <div className="bg-slate-800/60 backdrop-blur-sm rounded-2xl px-8 py-3 border border-purple-500/30">
          <h2 className="text-sm text-purple-400 font-bold uppercase tracking-wider mb-1">
            Round
          </h2>
          <div className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500">
            {round}
          </div>
        </div>
        
        {isShowingSequence ? (
          <div className="mt-3 bg-yellow-500/20 border border-yellow-500/50 rounded-xl px-4 py-2 animate-pulse">
            <p className="text-yellow-400 font-bold text-sm uppercase tracking-wide">
              👀 Watch closely!
            </p>
          </div>
        ) : isInputPhase ? (
          <div className="mt-3 bg-green-500/20 border border-green-500/50 rounded-xl px-4 py-2">
            <p className="text-green-400 font-bold text-sm uppercase tracking-wide">
              🎮 Your turn!
            </p>
          </div>
        ) : disabled ? (
          <div className="mt-3 bg-slate-700/50 rounded-xl px-4 py-2">
            <p className="text-slate-400 text-sm">
              👻 Spectating...
            </p>
          </div>
        ) : null}
      </div>

      {/* Timer Display - Large and dramatic */}
      {isInputPhase && secondsRemaining > 0 && (
        <div className="relative">
          <div 
            className={`
              font-black transition-all duration-200 tabular-nums
              ${secondsRemaining > 10 ? 'text-5xl' : ''}
              ${secondsRemaining > 5 && secondsRemaining <= 10 ? 'text-6xl' : ''}
              ${secondsRemaining <= 5 ? 'text-7xl' : ''}
              ${timerColor === 'green' ? 'text-green-400 drop-shadow-[0_0_20px_rgba(34,197,94,0.5)]' : ''}
              ${timerColor === 'yellow' ? 'text-yellow-400 drop-shadow-[0_0_20px_rgba(250,204,21,0.5)]' : ''}
              ${timerColor === 'red' ? 'text-red-400 drop-shadow-[0_0_20px_rgba(239,68,68,0.5)]' : ''}
              ${isTimerPulsing ? 'animate-pulse scale-110' : ''}
            `}
          >
            {secondsRemaining}
          </div>
          {secondsRemaining <= 5 && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className={`w-full h-full rounded-full ${timerColor === 'red' ? 'bg-red-500/20' : 'bg-yellow-500/20'} animate-ping`} />
            </div>
          )}
        </div>
      )}

      {/* SVG Circular Simon Board */}
      <div className="relative w-full max-w-[min(85vw,320px)] mx-auto">
        {/* Outer glow ring */}
        <div className="absolute inset-0 rounded-full bg-gradient-to-r from-purple-500/20 via-cyan-500/20 to-pink-500/20 blur-xl scale-110" />
        
        <svg
          viewBox={`0 0 ${size} ${size}`}
          className="w-full h-auto relative z-10"
          style={{ touchAction: 'manipulation' }}
        >
          {/* Background circle with gradient */}
          <defs>
            <radialGradient id="bgGradient" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#1e1b4b" />
              <stop offset="100%" stopColor="#0f0f23" />
            </radialGradient>
          </defs>
          
          <circle
            cx={centerX}
            cy={centerY}
            r={outerRadius + 8}
            fill="url(#bgGradient)"
            stroke="#3b3b6b"
            strokeWidth="2"
          />

          {/* Colored wedges */}
          {wedges.map((wedge) => (
            <ColorWedge
              key={wedge.color}
              color={wedge.color}
              isActive={activeColor === wedge.color}
              onClick={() => handleColorClick(wedge.color)}
              disabled={disabled || isShowingSequence || !isInputPhase}
              startAngle={wedge.start}
              endAngle={wedge.end}
              centerX={centerX}
              centerY={centerY}
              innerRadius={innerRadius}
              outerRadius={outerRadius}
            />
          ))}

          {/* Center hub */}
          <circle
            cx={centerX}
            cy={centerY}
            r={innerRadius - 2}
            fill="#0f0f23"
            stroke="#3b3b6b"
            strokeWidth="3"
          />

          {/* Center content - shows sequence counter during playback, or SIMON text */}
          {isShowingSequence && sequenceIndex >= 0 ? (
            <>
              {/* Sequence counter */}
              <text
                x={centerX}
                y={centerY + 8}
                textAnchor="middle"
                fill="#fff"
                fontSize="36"
                fontWeight="900"
                fontFamily="system-ui, -apple-system, sans-serif"
              >
                {sequenceIndex + 1}
              </text>
              <text
                x={centerX}
                y={centerY + 26}
                textAnchor="middle"
                fill="#a78bfa"
                fontSize="12"
                fontFamily="system-ui, -apple-system, sans-serif"
              >
                of {sequence.length}
              </text>
            </>
          ) : (
            <text
              x={centerX}
              y={centerY + 8}
              textAnchor="middle"
              fill="#a78bfa"
              fontSize="20"
              fontWeight="900"
              fontFamily="system-ui, -apple-system, sans-serif"
              letterSpacing="3"
            >
              SIMON
            </text>
          )}
        </svg>
      </div>

      {/* Player Sequence Display */}
      {isInputPhase && playerSequence.length > 0 && (
        <div className="bg-slate-800/60 backdrop-blur-sm rounded-xl p-3 w-full max-w-[min(85vw,320px)] border border-purple-500/30">
          <div className="flex justify-center items-center gap-1.5 min-h-[32px]">
            {playerSequence.map((color, i) => (
              <span key={i} className="text-2xl">
                {getColorEmoji(color)}
              </span>
            ))}
            <span className="text-purple-400 text-sm font-bold ml-3 bg-purple-500/20 px-2 py-1 rounded-lg">
              {playerSequence.length}/{sequence.length}
            </span>
          </div>
        </div>
      )}

      {/* Submit Button */}
      {isInputPhase && (
        <button
          onClick={() => {
            if (canSubmit && 'vibrate' in navigator) {
              navigator.vibrate(100);
            }
            onSubmit();
          }}
          disabled={!canSubmit}
          style={{ touchAction: 'manipulation' }}
          className={`
            w-full max-w-[min(85vw,320px)] px-6 py-4 rounded-2xl font-black text-xl
            min-h-[64px]
            transition-all duration-150
            ${canSubmit 
              ? 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500 text-white cursor-pointer shadow-lg shadow-green-500/30 hover:shadow-green-500/50 border-b-4 border-green-700 active:border-b-0 active:mt-1 active:scale-95' 
              : 'bg-slate-700 text-slate-400 cursor-not-allowed border-b-4 border-slate-800'}
          `}
        >
          {canSubmit ? (
            <span className="flex items-center justify-center gap-2">
              <span>✅</span> SUBMIT
            </span>
          ) : (
            <span className="flex items-center justify-center gap-2">
              <span>⏳</span> {playerSequence.length}/{sequence.length}
            </span>
          )}
        </button>
      )}
    </div>
  );
};

export default CircularSimonBoard;
