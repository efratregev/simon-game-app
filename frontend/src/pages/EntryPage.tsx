/**
 * Entry Page
 * 
 * Main menu with two paths:
 * 1. Play Solo - Jump straight into a single player game
 * 2. Play with Friends - Create or join a multiplayer game
 * 
 * UI Design: Dark theme with neon accents (Top Game App Style)
 */

import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { createSession, joinGame } from '../services/authService';
import { useAuthStore } from '../store/authStore';

type Mode = 'menu' | 'solo' | 'multiplayer' | 'create' | 'join';

export function EntryPage() {
  const [searchParams] = useSearchParams();
  const [mode, setMode] = useState<Mode>('menu');
  const [displayName, setDisplayName] = useState('');
  const [gameCode, setGameCode] = useState('');
  const [avatarId, setAvatarId] = useState('1');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const { setSession } = useAuthStore();
  const navigate = useNavigate();
  
  // Handle invite link with game code in URL
  useEffect(() => {
    const joinCode = searchParams.get('join');
    if (joinCode) {
      setMode('join');
      setGameCode(joinCode.toUpperCase());
    }
  }, [searchParams]);

  const handleCreateGame = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await createSession(displayName, avatarId);
      setSession(response.session);
      navigate('/waiting');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create game');
    } finally {
      setLoading(false);
    }
  };

  const handleJoinGame = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await joinGame(displayName, avatarId, gameCode);
      setSession(response.session);
      navigate('/waiting');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to join game');
    } finally {
      setLoading(false);
    }
  };

  // Handle solo play - creates a game and immediately starts
  const handleSoloPlay = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await createSession(displayName, avatarId);
      setSession(response.session);
      navigate('/waiting');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to start game');
    } finally {
      setLoading(false);
    }
  };

  // Get back destination based on current mode
  const getBackDestination = (): Mode => {
    if (mode === 'create' || mode === 'join') return 'multiplayer';
    return 'menu';
  };

  // Main menu screen
  if (mode === 'menu') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4 relative overflow-hidden">
        {/* Animated background glow */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" />
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-cyan-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" style={{ animationDelay: '1s' }} />
        </div>

        <div className="relative z-10 w-full max-w-md">
          {/* Game Logo */}
          <div className="text-center mb-8">
            <div className="text-6xl mb-4 animate-bounce">🎮</div>
            <h1 className="text-4xl sm:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-pink-500 to-purple-500 mb-2 drop-shadow-lg">
              Regev Said
            </h1>
            <p className="text-purple-300 text-lg font-medium tracking-wider uppercase">
              Memory Challenge
            </p>
          </div>

          {/* Main Card */}
          <div className="bg-slate-800/80 backdrop-blur-xl rounded-3xl p-8 border border-purple-500/30 shadow-2xl shadow-purple-500/20">
            <div className="space-y-4">
              {/* Play Solo Button - Primary */}
              <button
                onClick={() => setMode('solo')}
                className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500 active:scale-95 text-white font-black py-6 px-8 rounded-2xl transition-all duration-150 text-xl shadow-lg shadow-green-500/30 hover:shadow-green-500/50 border-b-4 border-green-700 active:border-b-0 active:mt-1"
                style={{ touchAction: 'manipulation' }}
              >
                <span className="flex items-center justify-center gap-3">
                  <span className="text-3xl">🎯</span>
                  <div className="text-left">
                    <div className="text-xl">PLAY SOLO</div>
                    <div className="text-sm font-medium opacity-80">Challenge yourself</div>
                  </div>
                </span>
              </button>
              
              {/* Play with Friends Button - Secondary */}
              <button
                onClick={() => setMode('multiplayer')}
                className="w-full bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-400 hover:to-cyan-500 active:scale-95 text-white font-black py-5 px-8 rounded-2xl transition-all duration-150 text-xl shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 border-b-4 border-blue-700 active:border-b-0 active:mt-1"
                style={{ touchAction: 'manipulation' }}
              >
                <span className="flex items-center justify-center gap-3">
                  <span className="text-2xl">👥</span>
                  PLAY WITH FRIENDS
                </span>
              </button>
            </div>

            {/* Footer hint */}
            <p className="text-center text-purple-400/60 text-sm mt-6">
              Test your memory • No account needed
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Multiplayer menu (Create or Join)
  if (mode === 'multiplayer') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4 relative overflow-hidden">
        {/* Animated background glow */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" />
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-cyan-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" style={{ animationDelay: '1s' }} />
        </div>

        <div className="relative z-10 w-full max-w-md">
          {/* Header */}
          <div className="text-center mb-6">
            <div className="text-5xl mb-3">👥</div>
            <h1 className="text-3xl font-black text-white mb-1">
              Play with Friends
            </h1>
            <p className="text-purple-300">
              Create a room or join an existing one
            </p>
          </div>

          {/* Main Card */}
          <div className="bg-slate-800/80 backdrop-blur-xl rounded-3xl p-8 border border-purple-500/30 shadow-2xl shadow-purple-500/20">
            <div className="space-y-4">
              {/* Create Game Button */}
              <button
                onClick={() => setMode('create')}
                className="w-full bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-400 hover:to-pink-500 active:scale-95 text-white font-black py-5 px-8 rounded-2xl transition-all duration-150 text-xl shadow-lg shadow-purple-500/30 hover:shadow-purple-500/50 border-b-4 border-purple-700 active:border-b-0 active:mt-1"
                style={{ touchAction: 'manipulation' }}
              >
                <span className="flex items-center justify-center gap-3">
                  <span className="text-2xl">🚀</span>
                  CREATE ROOM
                </span>
              </button>
              
              {/* Join Game Button */}
              <button
                onClick={() => setMode('join')}
                className="w-full bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-400 hover:to-amber-500 active:scale-95 text-white font-black py-5 px-8 rounded-2xl transition-all duration-150 text-xl shadow-lg shadow-orange-500/30 hover:shadow-orange-500/50 border-b-4 border-orange-700 active:border-b-0 active:mt-1"
                style={{ touchAction: 'manipulation' }}
              >
                <span className="flex items-center justify-center gap-3">
                  <span className="text-2xl">🎯</span>
                  JOIN ROOM
                </span>
              </button>
            </div>

            {/* Back Button */}
            <button
              onClick={() => setMode('menu')}
              className="w-full mt-6 text-purple-400/60 hover:text-purple-300 font-medium py-2 transition-colors"
            >
              ← Back to Menu
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Solo or Create/Join forms
  const isSolo = mode === 'solo';
  const isJoin = mode === 'join';
  const formTitle = isSolo ? '🎯 Play Solo' : isJoin ? '🎯 Join Room' : '🚀 Create Room';
  const formSubtitle = isSolo 
    ? 'Enter your name to start' 
    : isJoin 
      ? 'Enter the game code to join' 
      : 'Set up your game room';

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated background glow */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-cyan-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      <div className="relative z-10 w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-3xl font-black text-white mb-1">
            {formTitle}
          </h1>
          <p className="text-purple-300">
            {formSubtitle}
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-slate-800/80 backdrop-blur-xl rounded-3xl p-6 sm:p-8 border border-purple-500/30 shadow-2xl shadow-purple-500/20">
          {/* Back Button */}
          <button
            onClick={() => setMode(getBackDestination())}
            className="flex items-center gap-2 text-purple-400 hover:text-purple-300 active:text-purple-200 mb-6 font-medium transition-colors"
          >
            <span>←</span> Back
          </button>
          
          <form onSubmit={isSolo ? handleSoloPlay : (isJoin ? handleJoinGame : handleCreateGame)} className="space-y-5">
            {/* Display Name */}
            <div>
              <label className="block text-sm font-bold text-purple-300 mb-2 uppercase tracking-wide">
                Your Name
              </label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Enter your name"
                minLength={3}
                maxLength={12}
                required
                className="w-full px-4 py-4 bg-slate-700/50 border-2 border-purple-500/30 rounded-xl text-white placeholder-slate-400 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 focus:outline-none transition-all text-lg font-medium"
              />
            </div>
            
            {/* Game Code (Join only) */}
            {isJoin && (
              <div>
                <label className="block text-sm font-bold text-purple-300 mb-2 uppercase tracking-wide">
                  Game Code
                  {searchParams.get('join') && (
                    <span className="ml-2 text-xs text-green-400 font-normal normal-case">
                      ✅ From invite link
                    </span>
                  )}
                </label>
                <input
                  type="text"
                  value={gameCode}
                  onChange={(e) => setGameCode(e.target.value.toUpperCase())}
                  placeholder="ABCDEF"
                  maxLength={6}
                  required
                  className="w-full px-4 py-4 bg-slate-700/50 border-2 border-purple-500/30 rounded-xl text-white placeholder-slate-400 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 focus:outline-none transition-all text-2xl font-black text-center tracking-[0.3em] uppercase"
                />
              </div>
            )}
            
            {/* Avatar Selection */}
            <div>
              <label className="block text-sm font-bold text-purple-300 mb-3 uppercase tracking-wide">
                Choose Avatar
              </label>
              <div className="grid grid-cols-4 gap-2">
                {['1', '2', '3', '4', '5', '6', '7', '8'].map((id) => (
                  <button
                    key={id}
                    type="button"
                    onClick={() => setAvatarId(id)}
                    className={`aspect-square rounded-xl flex items-center justify-center text-3xl transition-all duration-150 active:scale-90 ${
                      avatarId === id
                        ? 'bg-gradient-to-br from-purple-500 to-pink-500 ring-2 ring-purple-400 ring-offset-2 ring-offset-slate-800 shadow-lg shadow-purple-500/50 scale-110'
                        : 'bg-slate-700/50 hover:bg-slate-600/50 border border-purple-500/20'
                    }`}
                    style={{ touchAction: 'manipulation' }}
                  >
                    {['😀', '🎮', '🚀', '⚡', '🎨', '🎯', '🏆', '🌟'][parseInt(id) - 1]}
                  </button>
                ))}
              </div>
            </div>
            
            {/* Error Message */}
            {error && (
              <div className="bg-red-500/20 border border-red-500/50 text-red-300 px-4 py-3 rounded-xl text-sm font-medium flex items-center gap-2">
                <span>⚠️</span> {error}
              </div>
            )}
            
            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className={`w-full font-black py-5 px-8 rounded-2xl transition-all duration-150 text-xl shadow-lg border-b-4 active:border-b-0 active:mt-1 active:scale-95 ${
                isSolo
                  ? 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500 text-white shadow-green-500/30 hover:shadow-green-500/50 border-green-700'
                  : isJoin
                    ? 'bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-400 hover:to-amber-500 text-white shadow-orange-500/30 hover:shadow-orange-500/50 border-orange-700'
                    : 'bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-400 hover:to-pink-500 text-white shadow-purple-500/30 hover:shadow-purple-500/50 border-purple-700'
              } disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100`}
              style={{ touchAction: 'manipulation' }}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="animate-spin">⏳</span> Loading...
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  {isSolo ? '🎮 START GAME' : isJoin ? '🚀 JOIN NOW' : '🎮 CREATE ROOM'}
                </span>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
