/**
 * Game Types - Game-Specific Logic
 * 
 * These types handle WHAT players are playing.
 * Platform types belong in platform.types.ts
 */

// =============================================================================
// SHARED GAME TYPES
// =============================================================================

/**
 * Available colors in both games
 */
export type Color = 'red' | 'blue' | 'yellow' | 'green';

/**
 * All available colors
 */
export const COLORS: Color[] = ['red', 'blue', 'yellow', 'green'];

// =============================================================================
// COLOR RACE TYPES (Dummy Game)
// =============================================================================

/**
 * Color Race game phases
 */
export type ColorRacePhase = 
  | 'waiting'        // Lobby (handled by platform)
  | 'countdown'      // 3-2-1 before game (handled by platform)
  | 'showing_color'  // Displaying color to click
  | 'round_result'   // Showing who won the round
  | 'finished';      // Game over

/**
 * Color Race game state
 */
export interface ColorRaceGameState {
  gameType: 'color_race';
  phase: ColorRacePhase;
  currentColor: Color | null;     // The color players need to click
  round: number;                   // Current round (1-5)
  totalRounds: number;             // Total rounds in game
  scores: Record<string, number>;  // playerId -> score
  roundWinner: string | null;      // playerId of round winner
}

/**
 * Player answer submission
 */
export interface PlayerAnswer {
  playerId: string;
  color: Color;
  timestamp: number;  // Server timestamp for tie-breaking
}

/**
 * Color Race WebSocket events (server → client)
 */
export interface ColorRaceServerEvents {
  'color_race:new_round': (data: {
    round: number;
    color: Color;
    totalRounds: number;
  }) => void;
  
  'color_race:round_result': (data: {
    winnerId: string | null;
    winnerName: string | null;
    scores: Record<string, number>;
  }) => void;
  
  'color_race:game_finished': (data: {
    winnerId: string;
    winnerName: string;
    finalScores: Record<string, number>;
  }) => void;
}

/**
 * Color Race WebSocket events (client → server)
 */
export interface ColorRaceClientEvents {
  'color_race:submit_answer': (data: {
    gameCode: string;
    playerId: string;
    color: Color;
  }) => void;
}

/**
 * Color Race constants
 */
export const COLOR_RACE_CONSTANTS = {
  TOTAL_ROUNDS: 5,
  ROUND_RESULT_DELAY_MS: 2000,
} as const;

// =============================================================================
// SIMON SAYS TYPES (Main Game)
// =============================================================================

/**
 * Simon Says game phases
 */
export type SimonPhase = 
  | 'waiting'           // Lobby (handled by platform)
  | 'countdown'         // 3-2-1 before game (handled by platform)
  | 'showing_sequence'  // Simon showing the sequence
  | 'player_input'      // Player's turn to repeat
  | 'round_result'      // Showing who passed/failed
  | 'elimination'       // Player eliminated
  | 'finished';         // Game over, winner declared

/**
 * Player status in Simon Says
 */
export type SimonPlayerStatus = 
  | 'playing'      // Still in the game
  | 'eliminated'   // Made a mistake
  | 'spectating';  // Watching after elimination

/**
 * Simon Says player state
 */
export interface SimonPlayerState {
  playerId: string;
  status: SimonPlayerStatus;
  currentInputIndex: number;  // How far in the sequence they are
  eliminatedAtRound: number | null;
}

/**
 * Simon Says game state
 */
export interface SimonGameState {
  gameType: 'simon';
  phase: SimonPhase;
  sequence: Color[];                           // The sequence to repeat
  round: number;                               // Current round
  playerStates: Record<string, SimonPlayerState>;
  currentShowingIndex: number;                 // For animation during showing
  timeoutMs: number;                           // Time limit per input
  timeoutAt: number | null;                    // Timestamp when timeout occurs (Step 3)
  timerStartedAt: number | null;               // Timestamp when input phase began (Step 3)
  winnerId: string | null;                     // Last player standing
}

/**
 * Simon Says WebSocket events (server → client)
 */
export interface SimonServerEvents {
  'simon:sequence_start': (data: {
    round: number;
    sequenceLength: number;
    timeoutMs: number;
  }) => void;
  
  'simon:show_color': (data: {
    color: Color;
    index: number;
    total: number;
  }) => void;
  
  'simon:sequence_complete': () => void;
  
  'simon:input_phase': (data: {
    round: number;
    timeoutAt: number;
    timeoutSeconds: number;
  }) => void;
  
  'simon:your_turn': (data: {
    timeoutMs: number;
  }) => void;
  
  'simon:input_correct': (data: {
    playerId: string;
    index: number;
  }) => void;
  
  'simon:timeout': (data: {
    playerId: string;
    playerName: string;
    correctSequence: Color[];
  }) => void;
  
  'simon:player_eliminated': (data: {
    playerId: string;
    playerName: string;
    reason: 'wrong_color' | 'timeout';
  }) => void;
  
  'simon:round_complete': (data: {
    round: number;
    playersRemaining: number;
  }) => void;
  
  'simon:game_finished': (data: {
    winnerId: string;
    winnerName: string;
    finalRound: number;
  }) => void;
}

/**
 * Simon Says WebSocket events (client → server)
 */
export interface SimonClientEvents {
  'simon:submit_input': (data: {
    gameCode: string;
    playerId: string;
    color: Color;
    inputIndex: number;
  }) => void;
}

/**
 * Simon Says constants
 */
export const SIMON_CONSTANTS = {
  INITIAL_SEQUENCE_LENGTH: 1,
  SEQUENCE_INCREMENT: 1,
  INITIAL_TIMEOUT_MS: 5000,          // 5 seconds
  TIMEOUT_DECREMENT_MS: 250,          // Decrease by 250ms each round
  MIN_TIMEOUT_MS: 1500,               // Minimum 1.5 seconds
  SHOW_COLOR_DURATION_MS: 600,        // How long each color shows
  SHOW_COLOR_GAP_MS: 200,             // Gap between colors
} as const;

// =============================================================================
// UNION TYPES
// =============================================================================

/**
 * Any game state
 */
export type GameState = ColorRaceGameState | SimonGameState;

/**
 * All game server events
 */
export type GameServerEvents = ColorRaceServerEvents & SimonServerEvents;

/**
 * All game client events
 */
export type GameClientEvents = ColorRaceClientEvents & SimonClientEvents;
