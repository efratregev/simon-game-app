/**
 * Game Types - Game-Specific Logic
 *
 * These types handle WHAT players are playing.
 * Platform types belong in platform.types.ts
 */
/**
 * Available colors in both games
 */
export type Color = 'red' | 'blue' | 'yellow' | 'green';
/**
 * All available colors
 */
export declare const COLORS: Color[];
/**
 * Color Race game phases
 */
export type ColorRacePhase = 'waiting' | 'countdown' | 'showing_color' | 'round_result' | 'finished';
/**
 * Color Race game state
 */
export interface ColorRaceGameState {
    gameType: 'color_race';
    phase: ColorRacePhase;
    currentColor: Color | null;
    round: number;
    totalRounds: number;
    scores: Record<string, number>;
    roundWinner: string | null;
}
/**
 * Player answer submission
 */
export interface PlayerAnswer {
    playerId: string;
    color: Color;
    timestamp: number;
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
export declare const COLOR_RACE_CONSTANTS: {
    readonly TOTAL_ROUNDS: 5;
    readonly ROUND_RESULT_DELAY_MS: 2000;
};
/**
 * Simon Says game phases
 */
export type SimonPhase = 'waiting' | 'countdown' | 'showing_sequence' | 'player_input' | 'round_result' | 'elimination' | 'finished';
/**
 * Player status in Simon Says
 */
export type SimonPlayerStatus = 'playing' | 'eliminated' | 'spectating';
/**
 * Simon Says player state
 */
export interface SimonPlayerState {
    playerId: string;
    status: SimonPlayerStatus;
    currentInputIndex: number;
    eliminatedAtRound: number | null;
}
/**
 * Player submission (Step 4)
 */
export interface PlayerSubmission {
    playerId: string;
    sequence: Color[];
    timestamp: number;
    isCorrect: boolean;
}
/**
 * Simon Says game state
 */
export interface SimonGameState {
    gameType: 'simon';
    phase: SimonPhase;
    sequence: Color[];
    round: number;
    playerStates: Record<string, SimonPlayerState>;
    currentShowingIndex: number;
    timeoutMs: number;
    timeoutAt: number | null;
    timerStartedAt: number | null;
    scores: Record<string, number>;
    submissions: Record<string, PlayerSubmission>;
    roundWinner: string | null;
    winnerId: string | null;
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
    'simon:player_submitted': (data: {
        playerId: string;
        playerName: string;
    }) => void;
    'simon:timeout': (data: {
        playerId: string;
        playerName: string;
        correctSequence: Color[];
    }) => void;
    'simon:player_eliminated': (data: {
        playerId: string;
        playerName: string;
        reason: 'wrong_sequence' | 'timeout';
    }) => void;
    'simon:round_result': (data: {
        roundWinner: {
            playerId: string;
            name: string;
        } | null;
        eliminations: Array<{
            playerId: string;
            name: string;
            reason: string;
        }>;
        scores: Record<string, number>;
        playerStatuses: Record<string, SimonPlayerStatus>;
    }) => void;
    'simon:round_complete': (data: {
        round: number;
        playersRemaining: number;
    }) => void;
    'simon:game_finished': (data: {
        winner: {
            playerId: string;
            name: string;
            score: number;
        };
        finalScores: Array<{
            playerId: string;
            name: string;
            score: number;
        }>;
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
export declare const SIMON_CONSTANTS: {
    readonly INITIAL_SEQUENCE_LENGTH: 1;
    readonly SEQUENCE_INCREMENT: 1;
    readonly INITIAL_TIMEOUT_MS: 5000;
    readonly TIMEOUT_DECREMENT_MS: 250;
    readonly MIN_TIMEOUT_MS: 1500;
    readonly SHOW_COLOR_DURATION_MS: 600;
    readonly SHOW_COLOR_GAP_MS: 200;
};
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
//# sourceMappingURL=game.types.d.ts.map