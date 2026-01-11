/**
 * Waiting Room / Game Page
 * 
 * Combined page that shows:
 * - Waiting room before game starts
 * - Simon game board during gameplay
 * 
 * UI Design: Dark theme with neon accents (Top Game App Style)
 */

import { useEffect, useState, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { useSimonStore } from '../store/simonStore';
import { socketService } from '../services/socketService';
import { soundService } from '../services/soundService';
import { CircularSimonBoard } from '../components/game/CircularSimonBoard';
import { GameOverScreen } from '../components/game/GameOverScreen';
import { Toast } from '../components/ui/Toast';
import { MuteButton } from '../components/ui/MuteButton';

export function WaitingRoomPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const isSoloMode = searchParams.get('solo') === 'true';
  const { session, clearSession } = useAuthStore();
  const gameCode = session?.gameCode;
  const playerId = session?.playerId;
  
  const { 
    isGameActive, 
    currentSequence, 
    currentRound, 
    isShowingSequence,
    isInputPhase,
    playerSequence,
    canSubmit,
    lastResult,
    message,
    secondsRemaining,
    timerColor,
    isTimerPulsing,
    isEliminated,
    scores,
    submittedPlayers,
    isGameOver,
    gameWinner,
    finalScores,
    initializeListeners,
    cleanup,
    addColorToSequence,
    submitSequence,
    resetGame,
  } = useSimonStore();
  
  const [roomStatus, setRoomStatus] = useState<'waiting' | 'countdown' | 'active'>('waiting');
  const [countdownValue, setCountdownValue] = useState<number | null>(null);
  const [isHost, setIsHost] = useState(session?.isHost || false);
  const [players, setPlayers] = useState<any[]>([]);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);
  const lastCountdownValue = useRef<number | null>(null);
  const hasAutoStarted = useRef(false);
  const [isRoomReady, setIsRoomReady] = useState(false);
  
  // Initialize on mount
  useEffect(() => {
    console.log('🎮 WaitingRoomPage mounted');
    
    // CRITICAL FIX: Connect socket FIRST, then initialize listeners
    const socket = socketService.connect();
    console.log('✅ Socket connected:', socket.connected);
    
    // Initialize Simon listeners AFTER socket is connected
    initializeListeners();
    
    // Join room via socket
    if (gameCode && playerId) {
      socket.emit('join_room_socket', { gameCode, playerId });
    }
    
    // Listen for initial room state (ONCE to avoid race condition)
    socket.once('room_state', (room: any) => {
      console.log('📦 Initial room state:', room);
      setPlayers(room.players || []);
      setRoomStatus(room.status);
      
      // Check if we're the host
      const me = room.players?.find((p: any) => p.id === playerId);
      const isHostPlayer = me?.isHost || false;
      console.log('🎮 isHost check:', { playerId, me, isHostPlayer });
      setIsHost(isHostPlayer);
      setIsRoomReady(true);
    });
    
    // Listen for room state updates (when players join/leave)
    socket.on('room_state_update', (room: any) => {
      console.log('🔄 Room state updated:', room);
      setPlayers(room.players || []);
      setRoomStatus(room.status);
      
      // Check if we're the host
      const me = room.players?.find((p: any) => p.id === playerId);
      setIsHost(me?.isHost || false);
    });
    
    // Listen for errors
    socket.on('error', (data: { message: string }) => {
      console.error('❌ Server error:', data.message);
      setToast({ message: data.message, type: 'error' });
    });
    
    // Listen for countdown
    socket.on('countdown', (data: { count: number }) => {
      console.log('⏳ Countdown:', data.count);
      setRoomStatus('countdown');
      setCountdownValue(data.count);
      
      // 🔊 Play countdown beep (only once per second)
      if (lastCountdownValue.current !== data.count) {
        soundService.playCountdown(data.count);
        lastCountdownValue.current = data.count;
      }
      
      if (data.count === 0) {
        setRoomStatus('active');
        setCountdownValue(null);
        lastCountdownValue.current = null;
      }
    });
    
    // Listen for player joined (for real-time feedback)
    socket.on('player_joined', (player: any) => {
      console.log('👋 Player joined:', player);
      // Don't modify state here - wait for room_state_update
    });
    
    // Listen for player left
    socket.on('player_left', (data: { playerId: string }) => {
      console.log('👋 Player left:', data.playerId);
      setPlayers(prev => prev.filter(p => p.id !== data.playerId));
    });
    
    // Listen for game restarted (Play Again)
    socket.on('game_restarted', (data: { gameCode: string }) => {
      console.log('🔄 Game restarted:', data.gameCode);
      // Reset local state to waiting room
      resetGame();
      setRoomStatus('waiting');
      lastCountdownValue.current = null;
    });
    
    // Cleanup on unmount
    return () => {
      cleanup();
      socket.off('room_state');
      socket.off('room_state_update');
      socket.off('error');
      socket.off('countdown');
      socket.off('player_joined');
      socket.off('player_left');
      socket.off('game_restarted');
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gameCode, playerId]); // Removed initializeListeners & cleanup - they're stable

  // Auto-start for solo mode (skip waiting room)
  useEffect(() => {
    if (isSoloMode && isRoomReady && !hasAutoStarted.current && roomStatus === 'waiting') {
      console.log('🎯 Solo mode: Auto-starting game...');
      hasAutoStarted.current = true;
      handleStartGame();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSoloMode, isRoomReady, roomStatus]);
  
  // Handle start game (host only)
  const handleStartGame = async () => {
    console.log('🎮 DEBUG: handleStartGame called');
    console.log('🎮 DEBUG: gameCode:', gameCode);
    console.log('🎮 DEBUG: playerId:', playerId);
    console.log('🎮 DEBUG: isHost:', isHost);
    
    // 🔊 Initialize sound on user interaction
    await soundService.init();
    
    const socket = socketService.getSocket();
    console.log('🎮 DEBUG: socket exists:', !!socket);
    console.log('🎮 DEBUG: socket connected:', socket?.connected);
    
    if (!socket) {
      console.error('❌ No socket connection');
      setToast({ message: 'No connection to server', type: 'error' });
      return;
    }
    
    if (!gameCode || !playerId) {
      console.error('❌ Missing gameCode or playerId');
      setToast({ message: 'Missing game info', type: 'error' });
      return;
    }
    
    console.log('📤 Emitting start_game:', { gameCode, playerId });
    socket.emit('start_game', { gameCode, playerId });
  };
  
  // Copy game code to clipboard
  const copyGameCode = async () => {
    if (!gameCode) return;
    
    try {
      await navigator.clipboard.writeText(gameCode);
      setToast({ message: 'Game code copied!', type: 'success' });
    } catch (err) {
      setToast({ message: 'Failed to copy code', type: 'error' });
    }
  };
  
  // Copy invite link to clipboard
  const copyInviteLink = async () => {
    if (!gameCode) return;
    
    const inviteUrl = `${window.location.origin}/?join=${gameCode}`;
    
    try {
      await navigator.clipboard.writeText(inviteUrl);
      setToast({ message: 'Invite link copied!', type: 'success' });
    } catch (err) {
      setToast({ message: 'Failed to copy link', type: 'error' });
    }
  };
  
  // Handle Play Again
  const handlePlayAgain = () => {
    // Reset local game state
    resetGame();
    setRoomStatus('waiting');
    
    // Emit restart_game to reset room on server
    const socket = socketService.getSocket();
    if (socket && gameCode && playerId) {
      console.log('🔄 Restarting game:', { gameCode, playerId });
      socket.emit('restart_game', { gameCode, playerId });
    }
  };

  // Handle Go Home
  const handleGoHome = () => {
    cleanup();
    clearSession();
    navigate('/');
  };

  // Share game using native share API (mobile-friendly)
  const shareGame = async () => {
    if (!gameCode) return;
    
    const inviteUrl = `${window.location.origin}/?join=${gameCode}`;
    
    // Check if native share is supported
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Join my Regev Said game!',
          text: `Join me in Regev Said! Use code: ${gameCode}`,
          url: inviteUrl,
        });
        setToast({ message: 'Invite shared!', type: 'success' });
      } catch (err) {
        // User cancelled or error - fallback to copy
        if ((err as Error).name !== 'AbortError') {
          copyInviteLink();
        }
      }
    } else {
      // Fallback to copy for desktop
      copyInviteLink();
    }
  };
  
  // Render Game Over screen
  if (isGameOver) {
    return (
      <>
        <MuteButton />
        <GameOverScreen
          winner={gameWinner}
          finalScores={finalScores}
          currentPlayerId={playerId || ''}
          roundsPlayed={currentRound}
          onPlayAgain={handlePlayAgain}
          onGoHome={handleGoHome}
          gameCode={gameCode || ''}
        />
      </>
    );
  }

  // Handle Exit Game (leave in the middle)
  const handleExitGame = () => {
    // Emit leave_room to server
    const socket = socketService.getSocket();
    if (socket && gameCode && playerId) {
      socket.emit('leave_room', { gameCode, playerId });
    }
    
    // Clean up and go home
    cleanup();
    clearSession();
    navigate('/');
  };

  // Render game board if active
  if (roomStatus === 'active' && isGameActive) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-2 sm:p-4 relative overflow-hidden">
        {/* Background effects */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-pulse" />
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-cyan-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-pulse" />
        </div>
        
        {/* Top Right Buttons */}
        <div className="fixed top-4 right-4 z-50 flex items-center gap-2">
          {/* Mute Button (inline) */}
          <MuteButton inline />
          {/* Exit Button */}
          <button
            onClick={handleExitGame}
            className="bg-red-500/20 hover:bg-red-500/40 backdrop-blur-xl border border-red-500/50 text-red-400 hover:text-red-300 font-bold px-4 py-3 rounded-xl transition-all duration-150 active:scale-95"
            style={{ touchAction: 'manipulation' }}
          >
            Exit
          </button>
        </div>
        
        <div className="relative z-10 flex flex-col items-center w-full max-w-md">
          {/* Scoreboard */}
          {isGameActive && Object.keys(scores).length > 0 && (
            <div className="bg-slate-800/80 backdrop-blur-xl rounded-2xl p-3 mb-4 w-full border border-purple-500/30">
              <div className="space-y-1.5">
                {players.map((player) => {
                  const score = scores[player.id] || 0;
                  const hasSubmitted = submittedPlayers.includes(player.id);
                  const isCurrentPlayer = player.id === playerId;
                  
                  return (
                    <div
                      key={player.id}
                      className={`flex items-center justify-between px-3 py-2 rounded-xl transition-all ${
                        isCurrentPlayer 
                          ? 'bg-gradient-to-r from-purple-600 to-pink-600 shadow-lg shadow-purple-500/30' 
                          : 'bg-slate-700/50'
                      }`}
                    >
                      <span className="text-white text-sm font-medium flex items-center gap-2">
                        <span className="text-lg">{player.avatar}</span>
                        <span>{player.displayName}</span>
                        {player.isHost && <span className="text-yellow-400 text-xs">👑</span>}
                      </span>
                      <div className="flex items-center gap-3">
                        <span className="text-white text-lg font-black">
                          {score}
                        </span>
                        {hasSubmitted && isInputPhase && (
                          <span className="text-green-400 text-sm">✓</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
          
          {/* Eliminated Message */}
          {isEliminated && (
            <div className="bg-red-500/20 border-2 border-red-500 rounded-2xl p-4 mb-4 text-center w-full animate-pulse">
              <div className="text-4xl mb-2">💀</div>
              <div className="text-red-400 text-xl font-black uppercase tracking-wide">
                Eliminated!
              </div>
              <p className="text-red-300/60 text-sm mt-1">Watch the others play</p>
            </div>
          )}
          
          <CircularSimonBoard
            sequence={currentSequence}
            round={currentRound}
            isShowingSequence={isShowingSequence}
            isInputPhase={isInputPhase}
            playerSequence={playerSequence}
            canSubmit={canSubmit}
            lastResult={lastResult}
            onColorClick={addColorToSequence}
            onSubmit={() => {
              if (gameCode && playerId) {
                submitSequence(gameCode, playerId);
              }
            }}
            disabled={isEliminated}
            secondsRemaining={secondsRemaining}
            timerColor={timerColor}
            isTimerPulsing={isTimerPulsing}
          />
          
          {/* Message Display */}
          <div className="mt-6 text-center">
            <p className="text-purple-200 text-lg font-medium">{message}</p>
          </div>
        </div>
      </div>
    );
  }
  
  // Render countdown
  if (roomStatus === 'countdown' && countdownValue !== null) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4 relative overflow-hidden">
        {/* Animated rings */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-64 h-64 border-4 border-purple-500/30 rounded-full animate-ping" />
          <div className="absolute w-48 h-48 border-4 border-cyan-500/30 rounded-full animate-ping" style={{ animationDelay: '0.2s' }} />
          <div className="absolute w-32 h-32 border-4 border-pink-500/30 rounded-full animate-ping" style={{ animationDelay: '0.4s' }} />
        </div>
        
        <div className="relative z-10 text-center">
          <div className="text-9xl sm:text-[12rem] font-black text-transparent bg-clip-text bg-gradient-to-b from-white to-purple-400 animate-pulse">
            {countdownValue}
          </div>
          <p className="text-2xl text-purple-300 font-bold uppercase tracking-widest mt-4">
            Get Ready!
          </p>
        </div>
      </div>
    );
  }
  
  // Render waiting room
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-cyan-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" style={{ animationDelay: '1s' }} />
      </div>
      
      {/* Leave Room Button - Top Left */}
      <button
        onClick={handleGoHome}
        className="fixed top-4 left-4 z-50 flex items-center gap-2 bg-slate-800/80 backdrop-blur-xl border border-purple-500/30 text-purple-400 hover:text-purple-300 active:text-purple-200 px-4 py-3 rounded-xl font-medium transition-all active:scale-95"
        style={{ touchAction: 'manipulation' }}
      >
        <span>←</span> Leave
      </button>
      
      {/* Toast notification */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
      
      <div className="relative z-10 w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-3xl font-black text-white mb-1">Waiting Room</h1>
          <p className="text-purple-300">Invite friends to join!</p>
        </div>
        
        {/* Main Card */}
        <div className="bg-slate-800/80 backdrop-blur-xl rounded-3xl p-6 border border-purple-500/30 shadow-2xl shadow-purple-500/20">
          {/* Game Code Display */}
          <div className="text-center mb-6">
            <p className="text-purple-400 text-sm font-medium uppercase tracking-wide mb-2">Game Code</p>
            <div 
              onClick={copyGameCode}
              className="bg-slate-900/50 rounded-2xl py-4 px-6 cursor-pointer hover:bg-slate-900/70 transition-colors border-2 border-dashed border-purple-500/30 hover:border-purple-500/50"
            >
              <span className="font-mono font-black text-4xl text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500 tracking-[0.2em]">
                {gameCode}
              </span>
            </div>
            <p className="text-purple-400/60 text-xs mt-2">Tap to copy</p>
          </div>
          
          {/* Invite Buttons */}
          <div className="grid grid-cols-3 gap-2 mb-6">
            <button
              onClick={copyGameCode}
              className="bg-slate-700/50 hover:bg-slate-600/50 active:scale-95 text-white font-medium py-3 px-3 rounded-xl transition-all duration-150 flex flex-col items-center gap-1 border border-purple-500/20"
              style={{ touchAction: 'manipulation' }}
            >
              <span className="text-xl">📋</span>
              <span className="text-xs">Code</span>
            </button>
            
            <button
              onClick={copyInviteLink}
              className="bg-slate-700/50 hover:bg-slate-600/50 active:scale-95 text-white font-medium py-3 px-3 rounded-xl transition-all duration-150 flex flex-col items-center gap-1 border border-purple-500/20"
              style={{ touchAction: 'manipulation' }}
            >
              <span className="text-xl">🔗</span>
              <span className="text-xs">Link</span>
            </button>
            
            <button
              onClick={shareGame}
              className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500 active:scale-95 text-white font-medium py-3 px-3 rounded-xl transition-all duration-150 flex flex-col items-center gap-1 shadow-lg shadow-green-500/30"
              style={{ touchAction: 'manipulation' }}
            >
              <span className="text-xl">📤</span>
              <span className="text-xs">Share</span>
            </button>
          </div>
          
          {/* Players List */}
          <div className="mb-6">
            <h2 className="text-sm font-bold text-purple-300 mb-3 uppercase tracking-wide flex items-center gap-2">
              <span>👥</span> Players ({players.length})
            </h2>
            <div className="space-y-2">
              {players.map(player => (
                <div 
                  key={player.id} 
                  className={`rounded-xl p-3 flex items-center justify-between transition-all ${
                    player.id === playerId 
                      ? 'bg-gradient-to-r from-purple-600/50 to-pink-600/50 border border-purple-500/50' 
                      : 'bg-slate-700/30 border border-transparent'
                  }`}
                >
                  <span className="font-medium text-white flex items-center gap-2">
                    <span className="text-xl">{['😀', '🎮', '🚀', '⚡', '🎨', '🎯', '🏆', '🌟'][parseInt(player.avatarId || '1') - 1] || '😀'}</span>
                    <span>{player.displayName}</span>
                    {player.id === playerId && (
                      <span className="text-xs text-purple-400 font-normal">(You)</span>
                    )}
                  </span>
                  {player.isHost && (
                    <span className="bg-yellow-500/20 text-yellow-400 text-xs font-bold px-2 py-1 rounded-full">
                      👑 HOST
                    </span>
                  )}
                </div>
              ))}
              
              {/* Waiting for players indicator */}
              {players.length < 2 && (
                <div className="rounded-xl p-3 border-2 border-dashed border-purple-500/30 text-center">
                  <span className="text-purple-400/60 text-sm">Waiting for more players...</span>
                </div>
              )}
            </div>
          </div>
          
          {/* Start Button (host only, or solo player) */}
          {(isHost || players.length === 1) && (
            <>
              {players.length === 1 && (
                <p className="text-center text-sm text-purple-400/60 mb-3">
                  💡 You can start solo or wait for others
                </p>
              )}
              <button
                onClick={handleStartGame}
                className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500 active:scale-95 text-white font-black py-5 px-8 rounded-2xl transition-all duration-150 text-xl shadow-lg shadow-green-500/30 hover:shadow-green-500/50 border-b-4 border-green-700 active:border-b-0 active:mt-1"
                style={{ touchAction: 'manipulation' }}
              >
                <span className="flex items-center justify-center gap-3">
                  <span className="text-2xl">🎮</span>
                  {players.length === 1 ? 'START SOLO' : 'START GAME'}
                </span>
              </button>
            </>
          )}
          
          {!isHost && players.length > 1 && (
            <div className="text-center py-4">
              <div className="inline-flex items-center gap-2 text-purple-400">
                <span className="animate-pulse">⏳</span>
                <span>Waiting for host to start...</span>
              </div>
            </div>
          )}
        </div>
        
      </div>
    </div>
  );
}
