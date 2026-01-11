/**
 * Simon Game Logic
 *
 * Core game logic for Simon Says multiplayer game.
 * Handles sequence generation, validation, and game progression.
 */
import type { Player } from '../../shared/types';
import type { Color, SimonGameState } from '../../shared/types';
/**
 * Initialize a new Simon game state
 */
export declare function initializeSimonGame(players: Player[]): SimonGameState;
/**
 * Generate a random color sequence of specified length
 */
export declare function generateSequence(length: number): Color[];
/**
 * Add one more color to existing sequence
 */
export declare function extendSequence(currentSequence: Color[]): Color[];
/**
 * Calculate timeout in seconds based on sequence length
 * Formula: 15 + (sequenceLength × 2) seconds
 */
export declare function calculateTimeoutSeconds(sequenceLength: number): number;
/**
 * Calculate timeout in milliseconds based on sequence length
 */
export declare function calculateTimeoutMs(sequenceLength: number): number;
/**
 * Validate if a player's color input is correct (used in Step 4+)
 */
export declare function validateInput(gameState: SimonGameState, playerId: string, color: Color, inputIndex: number): boolean;
/**
 * Validate an entire submitted sequence (Step 2)
 */
export declare function validateSequence(gameState: SimonGameState, submittedSequence: Color[]): boolean;
/**
 * Process all submissions for a round
 * Find fastest correct, eliminate wrong/timeout players, award points
 */
export declare function processRoundSubmissions(gameState: SimonGameState): {
    gameState: SimonGameState;
    roundWinner: {
        playerId: string;
        score: number;
    } | null;
    eliminations: Array<{
        playerId: string;
        reason: 'wrong_sequence' | 'timeout';
    }>;
};
/**
 * Check if all active players have submitted
 */
export declare function haveAllPlayersSubmitted(gameState: SimonGameState): boolean;
/**
 * Advance to the next round
 */
export declare function advanceToNextRound(gameState: SimonGameState): SimonGameState;
/**
 * Eliminate a player from the game
 */
export declare function eliminatePlayer(gameState: SimonGameState, playerId: string, round: number): SimonGameState;
/**
 * Check if game should end
 *
 * Solo mode (1 total player): End only when that player is eliminated (0 active)
 * Multiplayer (2+ players): End when 1 or fewer active players remain
 */
export declare function shouldGameEnd(gameState: SimonGameState): boolean;
/**
 * Get the winner (last player standing or highest scorer)
 */
export declare function getWinner(gameState: SimonGameState): string | null;
/**
 * Get count of active (still playing) players
 */
export declare function getActivePlayerCount(gameState: SimonGameState): number;
/**
 * Update player's current input index (progress through sequence)
 */
export declare function updatePlayerProgress(gameState: SimonGameState, playerId: string): SimonGameState;
//# sourceMappingURL=simonLogic.d.ts.map