/**
 * Game Over Screen Component
 * 
 * Displays the end game results with:
 * - Winner celebration with crown
 * - Final scoreboard with medals
 * - Game stats
 * - Play Again / Home buttons
 * - Share score functionality
 * 
 * UI Design: Dark theme with celebrations (Top Game App Style)
 */

import { useEffect, useState } from 'react';
import { soundService } from '../../services/soundService';

// =============================================================================
// TYPES
// =============================================================================

interface GameOverScreenProps {
  winner: {
    playerId: string;
    name: string;
    score: number;
  } | null;
  finalScores: Array<{
    playerId: string;
    name: string;
    score: number;
    isEliminated?: boolean;
  }>;
  currentPlayerId: string;
  roundsPlayed: number;
  onPlayAgain: () => void;
  onGoHome: () => void;
  gameCode: string;
}

// =============================================================================
// CONFETTI COMPONENT - More particles, better animation
// =============================================================================

const Confetti: React.FC = () => {
  const colors = ['#ff4136', '#ffdc00', '#22c55e', '#3b82f6', '#f472b6', '#a855f7', '#fbbf24'];
  const confettiPieces = Array.from({ length: 80 }, (_, i) => ({
    id: i,
    left: Math.random() * 100,
    delay: Math.random() * 2,
    duration: 2 + Math.random() * 3,
    color: colors[Math.floor(Math.random() * colors.length)],
    rotation: Math.random() * 360,
    size: 6 + Math.random() * 10,
    type: Math.random() > 0.5 ? 'circle' : 'rect',
  }));

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {confettiPieces.map((piece) => (
        <div
          key={piece.id}
          className="absolute animate-fall"
          style={{
            left: `${piece.left}%`,
            top: '-20px',
            width: `${piece.size}px`,
            height: `${piece.size}px`,
            backgroundColor: piece.color,
            animationDelay: `${piece.delay}s`,
            animationDuration: `${piece.duration}s`,
            transform: `rotate(${piece.rotation}deg)`,
            borderRadius: piece.type === 'circle' ? '50%' : '2px',
            boxShadow: `0 0 ${piece.size}px ${piece.color}`,
          }}
        />
      ))}
    </div>
  );
};

// =============================================================================
// SPARKLE EFFECT
// =============================================================================

const Sparkles: React.FC = () => {
  return (
    <div className="absolute inset-0 pointer-events-none">
      {Array.from({ length: 20 }).map((_, i) => (
        <div
          key={i}
          className="absolute w-1 h-1 bg-yellow-300 rounded-full animate-ping"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 2}s`,
            animationDuration: `${1 + Math.random()}s`,
          }}
        />
      ))}
    </div>
  );
};

// =============================================================================
// GAME OVER SCREEN COMPONENT
// =============================================================================

export const GameOverScreen: React.FC<GameOverScreenProps> = ({
  winner,
  finalScores,
  currentPlayerId,
  roundsPlayed,
  onPlayAgain,
  onGoHome,
  gameCode,
}) => {
  const [showConfetti, setShowConfetti] = useState(true);
  const [animatedScore, setAnimatedScore] = useState(0);
  const isWinner = winner?.playerId === currentPlayerId;
  const isSoloGame = finalScores.length === 1;

  // Animate score count-up
  useEffect(() => {
    if (!winner) return;
    
    const targetScore = winner.score;
    const duration = 1500; // 1.5 seconds
    const steps = 30;
    const increment = targetScore / steps;
    let current = 0;
    
    const timer = setInterval(() => {
      current += increment;
      if (current >= targetScore) {
        setAnimatedScore(targetScore);
        clearInterval(timer);
      } else {
        setAnimatedScore(Math.floor(current));
      }
    }, duration / steps);
    
    return () => clearInterval(timer);
  }, [winner]);

  // Play victory sound on mount
  useEffect(() => {
    soundService.playVictory();
    
    // Hide confetti after 6 seconds
    const timer = setTimeout(() => setShowConfetti(false), 6000);
    return () => clearTimeout(timer);
  }, []);

  // Get medal emoji based on rank
  const getMedal = (rank: number): string => {
    switch (rank) {
      case 1: return '🥇';
      case 2: return '🥈';
      case 3: return '🥉';
      default: return `#${rank}`;
    }
  };

  // Share score functionality
  const handleShare = async () => {
    const myScore = finalScores.find(s => s.playerId === currentPlayerId)?.score || 0;
    const rank = finalScores.findIndex(s => s.playerId === currentPlayerId) + 1;
    
    const shareText = isSoloGame
      ? `🎮 I reached Round ${roundsPlayed} in Regev Said with ${myScore} points! Can you beat my score?`
      : `🏆 I finished #${rank} in Regev Said with ${myScore} points! ${isWinner ? '👑 WINNER!' : ''}`;
    
    const shareUrl = `${window.location.origin}/?join=${gameCode}`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Regev Said Score',
          text: shareText,
          url: shareUrl,
        });
      } catch (err) {
        // User cancelled or error - fallback to copy
        if ((err as Error).name !== 'AbortError') {
          copyToClipboard(shareText + '\n' + shareUrl);
        }
      }
    } else {
      copyToClipboard(shareText + '\n' + shareUrl);
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      // Could add toast notification here
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background glow effects */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-yellow-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" style={{ animationDelay: '1s' }} />
      </div>
      
      {/* Confetti */}
      {showConfetti && <Confetti />}
      
      <div className="relative z-10 w-full max-w-md">
        {/* Game Over Title */}
        <div className="text-center mb-6 relative">
          <Sparkles />
          <h1 className="text-4xl sm:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-pink-500 to-purple-500 mb-2 animate-pulse">
            GAME OVER
          </h1>
        </div>

        {/* Winner Section */}
        {winner && (
          <div className="relative mb-6">
            {/* Glow ring */}
            <div className="absolute inset-0 bg-gradient-to-r from-yellow-500/30 via-orange-500/30 to-yellow-500/30 rounded-3xl blur-xl animate-pulse" />
            
            <div className="relative bg-gradient-to-br from-yellow-500/20 to-orange-500/20 backdrop-blur-xl border-2 border-yellow-500/50 rounded-3xl p-6 text-center overflow-hidden">
              {/* Crown animation */}
              <div className="text-6xl mb-3 animate-bounce drop-shadow-2xl">👑</div>
              
              <h2 className="text-xl font-black text-yellow-400 mb-3 uppercase tracking-wider">
                {isSoloGame ? 'Amazing!' : 'Champion!'}
              </h2>
              
              <div className="text-2xl text-white font-bold mb-2">
                {winner.name}
              </div>
              
              <div className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-orange-400 tabular-nums">
                {animatedScore}
              </div>
              <div className="text-yellow-400/80 text-sm font-medium">POINTS</div>
              
              {isWinner && !isSoloGame && (
                <div className="mt-4 inline-flex items-center gap-2 bg-green-500/20 border border-green-500/50 rounded-full px-4 py-2 text-green-400 text-sm font-bold">
                  <span>✨</span> That's YOU! <span>✨</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Scoreboard (Multiplayer only) */}
        {!isSoloGame && finalScores.length > 0 && (
          <div className="bg-slate-800/80 backdrop-blur-xl rounded-2xl p-4 mb-4 border border-purple-500/30">
            <h3 className="text-purple-300 font-bold text-center mb-3 text-sm uppercase tracking-wider">
              Final Standings
            </h3>
            
            <div className="space-y-2">
              {finalScores.map((player, index) => {
                const isCurrentPlayer = player.playerId === currentPlayerId;
                const rank = index + 1;
                
                return (
                  <div
                    key={player.playerId}
                    className={`flex items-center justify-between px-4 py-3 rounded-xl transition-all ${
                      isCurrentPlayer
                        ? 'bg-gradient-to-r from-purple-600 to-pink-600 shadow-lg shadow-purple-500/30 scale-105'
                        : rank === 1
                          ? 'bg-yellow-500/10 border border-yellow-500/30'
                          : 'bg-slate-700/50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className={`text-2xl w-10 text-center ${rank === 1 ? 'animate-bounce' : ''}`}>
                        {getMedal(rank)}
                      </span>
                      <span className="text-white font-bold">
                        {player.name}
                        {isCurrentPlayer && (
                          <span className="text-xs ml-2 text-purple-300 font-normal">(you)</span>
                        )}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-white font-black text-lg tabular-nums">
                        {player.score}
                      </span>
                      {player.isEliminated && (
                        <span className="text-red-400 text-sm">💀</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Game Stats */}
        <div className="bg-slate-800/60 backdrop-blur-sm rounded-2xl p-4 mb-6 border border-purple-500/20">
          <div className="flex justify-around text-center">
            <div className="flex-1">
              <div className="text-3xl font-black text-white">{roundsPlayed}</div>
              <div className="text-purple-400 text-xs font-medium uppercase tracking-wide">Rounds</div>
            </div>
            <div className="w-px bg-purple-500/30 mx-2" />
            <div className="flex-1">
              <div className="text-3xl font-black text-white tabular-nums">
                {finalScores.find(s => s.playerId === currentPlayerId)?.score || 0}
              </div>
              <div className="text-purple-400 text-xs font-medium uppercase tracking-wide">Your Score</div>
            </div>
            {!isSoloGame && (
              <>
                <div className="w-px bg-purple-500/30 mx-2" />
                <div className="flex-1">
                  <div className="text-3xl font-black text-white">
                    #{finalScores.findIndex(s => s.playerId === currentPlayerId) + 1}
                  </div>
                  <div className="text-purple-400 text-xs font-medium uppercase tracking-wide">Rank</div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          {/* Play Again Button */}
          <button
            onClick={onPlayAgain}
            className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500 active:scale-95 text-white font-black py-5 px-8 rounded-2xl transition-all duration-150 text-xl shadow-lg shadow-green-500/30 hover:shadow-green-500/50 border-b-4 border-green-700 active:border-b-0 active:mt-1"
            style={{ touchAction: 'manipulation' }}
          >
            <span className="flex items-center justify-center gap-3">
              <span className="text-2xl">🔄</span> PLAY AGAIN
            </span>
          </button>

          {/* Home Button */}
          <button
            onClick={onGoHome}
            className="w-full bg-slate-700 hover:bg-slate-600 active:scale-95 text-white font-bold py-4 px-6 rounded-2xl transition-all duration-150 text-lg border-b-4 border-slate-800 active:border-b-0 active:mt-1"
            style={{ touchAction: 'manipulation' }}
          >
            <span className="flex items-center justify-center gap-2">
              <span>🏠</span> HOME
            </span>
          </button>

          {/* Share Button */}
          <button
            onClick={handleShare}
            className="w-full bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-400 hover:to-cyan-500 active:scale-95 text-white font-bold py-4 px-6 rounded-2xl transition-all duration-150 text-lg shadow-lg shadow-blue-500/30 border-b-4 border-blue-700 active:border-b-0 active:mt-1"
            style={{ touchAction: 'manipulation' }}
          >
            <span className="flex items-center justify-center gap-2">
              <span>📤</span> SHARE SCORE
            </span>
          </button>
        </div>
      </div>

      {/* CSS for confetti animation */}
      <style>{`
        @keyframes fall {
          0% {
            transform: translateY(0) rotate(0deg);
            opacity: 1;
          }
          50% {
            opacity: 1;
          }
          100% {
            transform: translateY(100vh) rotate(1080deg);
            opacity: 0;
          }
        }
        .animate-fall {
          animation: fall linear infinite;
        }
      `}</style>
    </div>
  );
};

export default GameOverScreen;
