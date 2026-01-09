/**
 * Simon Game Logic
 * 
 * Core game logic for Simon Says multiplayer game.
 * Handles sequence generation, validation, and game progression.
 */

import type { Player } from '@shared/types';
import type { 
  Color, 
  SimonGameState, 
  SimonPlayerState,
} from '@shared/types';
import { COLORS, SIMON_CONSTANTS } from '@shared/types';

// =============================================================================
// INITIALIZATION
// =============================================================================

/**
 * Initialize a new Simon game state
 */
export function initializeSimonGame(players: Player[]): SimonGameState {
  const playerStates: Record<string, SimonPlayerState> = {};
  
  // Initialize state for all players
  players.forEach(player => {
    playerStates[player.id] = {
      playerId: player.id,
      status: 'playing',
      currentInputIndex: 0,
      eliminatedAtRound: null,
    };
  });
  
  // Generate first sequence (1 color for round 1)
  const initialSequence = generateSequence(SIMON_CONSTANTS.INITIAL_SEQUENCE_LENGTH);
  
  return {
    gameType: 'simon',
    phase: 'showing_sequence',
    sequence: initialSequence,
    round: 1,
    playerStates,
    currentShowingIndex: 0,
    timeoutMs: SIMON_CONSTANTS.INITIAL_TIMEOUT_MS,
    timeoutAt: null,        // Step 3: Set when input phase begins
    timerStartedAt: null,   // Step 3: Set when input phase begins
    winnerId: null,
  };
}

// =============================================================================
// SEQUENCE GENERATION
// =============================================================================

/**
 * Generate a random color sequence of specified length
 */
export function generateSequence(length: number): Color[] {
  const sequence: Color[] = [];
  
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * COLORS.length);
    sequence.push(COLORS[randomIndex]);
  }
  
  return sequence;
}

/**
 * Add one more color to existing sequence
 */
export function extendSequence(currentSequence: Color[]): Color[] {
  const randomIndex = Math.floor(Math.random() * COLORS.length);
  return [...currentSequence, COLORS[randomIndex]];
}

// =============================================================================
// TIMING (Step 3)
// =============================================================================

/**
 * Calculate timeout in seconds based on sequence length
 * Formula: 15 + (sequenceLength × 2) seconds
 */
export function calculateTimeoutSeconds(sequenceLength: number): number {
  return 15 + (sequenceLength * 2);
}

/**
 * Calculate timeout in milliseconds based on sequence length
 */
export function calculateTimeoutMs(sequenceLength: number): number {
  return calculateTimeoutSeconds(sequenceLength) * 1000;
}

// =============================================================================
// VALIDATION
// =============================================================================

/**
 * Validate if a player's color input is correct (used in Step 4+)
 */
export function validateInput(
  gameState: SimonGameState,
  playerId: string,
  color: Color,
  inputIndex: number
): boolean {
  // Check if input index matches expected position
  const playerState = gameState.playerStates[playerId];
  if (!playerState || playerState.currentInputIndex !== inputIndex) {
    return false;
  }
  
  // Check if color matches the sequence at this index
  const expectedColor = gameState.sequence[inputIndex];
  return color === expectedColor;
}

/**
 * Validate an entire submitted sequence (Step 2)
 */
export function validateSequence(
  gameState: SimonGameState,
  submittedSequence: Color[]
): boolean {
  // Check length matches
  if (submittedSequence.length !== gameState.sequence.length) {
    return false;
  }
  
  // Check each color in order
  for (let i = 0; i < gameState.sequence.length; i++) {
    if (submittedSequence[i] !== gameState.sequence[i]) {
      return false;
    }
  }
  
  return true;
}

// =============================================================================
// GAME PROGRESSION
// =============================================================================

/**
 * Advance to the next round
 */
export function advanceToNextRound(gameState: SimonGameState): SimonGameState {
  // Extend sequence by one color
  const newSequence = extendSequence(gameState.sequence);
  
  // Calculate new timeout (decreases each round but has minimum)
  const newTimeout = Math.max(
    SIMON_CONSTANTS.MIN_TIMEOUT_MS,
    gameState.timeoutMs - SIMON_CONSTANTS.TIMEOUT_DECREMENT_MS
  );
  
  // Reset all active players' input index for new round
  const updatedPlayerStates: Record<string, SimonPlayerState> = {};
  Object.entries(gameState.playerStates).forEach(([id, state]) => {
    updatedPlayerStates[id] = {
      ...state,
      currentInputIndex: 0,
    };
  });
  
  return {
    ...gameState,
    phase: 'showing_sequence',
    sequence: newSequence,
    round: gameState.round + 1,
    playerStates: updatedPlayerStates,
    currentShowingIndex: 0,
    timeoutMs: newTimeout,
  };
}

/**
 * Eliminate a player from the game
 */
export function eliminatePlayer(
  gameState: SimonGameState,
  playerId: string,
  round: number
): SimonGameState {
  const updatedPlayerStates = { ...gameState.playerStates };
  
  if (updatedPlayerStates[playerId]) {
    updatedPlayerStates[playerId] = {
      ...updatedPlayerStates[playerId],
      status: 'eliminated',
      eliminatedAtRound: round,
    };
  }
  
  return {
    ...gameState,
    playerStates: updatedPlayerStates,
  };
}

/**
 * Check if game should end (only 1 or 0 players remaining)
 */
export function shouldGameEnd(gameState: SimonGameState): boolean {
  const activePlayers = Object.values(gameState.playerStates).filter(
    state => state.status === 'playing'
  );
  
  return activePlayers.length <= 1;
}

/**
 * Get the winner (last player standing)
 */
export function getWinner(gameState: SimonGameState): string | null {
  const activePlayers = Object.values(gameState.playerStates).filter(
    state => state.status === 'playing'
  );
  
  if (activePlayers.length === 1) {
    return activePlayers[0].playerId;
  }
  
  // If no active players, find who lasted longest
  if (activePlayers.length === 0) {
    let lastEliminatedRound = -1;
    let lastPlayerId: string | null = null;
    
    Object.values(gameState.playerStates).forEach(state => {
      if (state.eliminatedAtRound !== null && state.eliminatedAtRound > lastEliminatedRound) {
        lastEliminatedRound = state.eliminatedAtRound;
        lastPlayerId = state.playerId;
      }
    });
    
    return lastPlayerId;
  }
  
  return null;
}

/**
 * Get count of active (still playing) players
 */
export function getActivePlayerCount(gameState: SimonGameState): number {
  return Object.values(gameState.playerStates).filter(
    state => state.status === 'playing'
  ).length;
}

/**
 * Update player's current input index (progress through sequence)
 */
export function updatePlayerProgress(
  gameState: SimonGameState,
  playerId: string
): SimonGameState {
  const updatedPlayerStates = { ...gameState.playerStates };
  
  if (updatedPlayerStates[playerId]) {
    updatedPlayerStates[playerId] = {
      ...updatedPlayerStates[playerId],
      currentInputIndex: updatedPlayerStates[playerId].currentInputIndex + 1,
    };
  }
  
  return {
    ...gameState,
    playerStates: updatedPlayerStates,
  };
}
