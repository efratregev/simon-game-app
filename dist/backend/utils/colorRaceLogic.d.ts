/**
 * Color Race Game Logic
 *
 * Simple multiplayer reaction-speed game.
 * First player to click the correct color wins the round.
 */
import type { Player } from '../../shared/types';
import type { Color, ColorRaceGameState, PlayerAnswer } from '../../shared/types';
/**
 * Initialize a new Color Race game state
 */
export declare function initializeColorRaceGame(players: Player[]): ColorRaceGameState;
/**
 * Get a random color
 */
export declare function getRandomColor(): Color;
/**
 * Validate if an answer is correct
 */
export declare function validateAnswer(gameState: ColorRaceGameState, answer: PlayerAnswer): boolean;
/**
 * Process all answers for a round and determine winner
 */
export declare function processRound(gameState: ColorRaceGameState, answers: PlayerAnswer[]): ColorRaceGameState;
/**
 * Determine the winner of the game
 */
export declare function determineWinner(gameState: ColorRaceGameState): {
    winnerId: string;
    winnerScore: number;
} | null;
/**
 * Get sorted leaderboard
 */
export declare function getLeaderboard(gameState: ColorRaceGameState): Array<{
    playerId: string;
    score: number;
    rank: number;
}>;
//# sourceMappingURL=colorRaceLogic.d.ts.map