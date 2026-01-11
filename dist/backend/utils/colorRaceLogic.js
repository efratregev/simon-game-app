"use strict";
/**
 * Color Race Game Logic
 *
 * Simple multiplayer reaction-speed game.
 * First player to click the correct color wins the round.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.initializeColorRaceGame = initializeColorRaceGame;
exports.getRandomColor = getRandomColor;
exports.validateAnswer = validateAnswer;
exports.processRound = processRound;
exports.determineWinner = determineWinner;
exports.getLeaderboard = getLeaderboard;
const types_1 = require("../../shared/types");
// =============================================================================
// INITIALIZATION
// =============================================================================
/**
 * Initialize a new Color Race game state
 */
function initializeColorRaceGame(players) {
    const scores = {};
    // Initialize scores for all players
    players.forEach(player => {
        scores[player.id] = 0;
    });
    return {
        gameType: 'color_race',
        phase: 'showing_color',
        currentColor: getRandomColor(),
        round: 1,
        totalRounds: types_1.COLOR_RACE_CONSTANTS.TOTAL_ROUNDS,
        scores,
        roundWinner: null,
    };
}
// =============================================================================
// COLOR GENERATION
// =============================================================================
/**
 * Get a random color
 */
function getRandomColor() {
    const randomIndex = Math.floor(Math.random() * types_1.COLORS.length);
    return types_1.COLORS[randomIndex];
}
// =============================================================================
// ANSWER VALIDATION
// =============================================================================
/**
 * Validate if an answer is correct
 */
function validateAnswer(gameState, answer) {
    return answer.color === gameState.currentColor;
}
// =============================================================================
// ROUND PROCESSING
// =============================================================================
/**
 * Process all answers for a round and determine winner
 */
function processRound(gameState, answers) {
    // Find correct answers
    const correctAnswers = answers.filter(answer => answer.color === gameState.currentColor);
    if (correctAnswers.length === 0) {
        // No one answered correctly - no winner this round
        return advanceToNextRound(gameState, null);
    }
    // Find fastest correct answer (lowest timestamp)
    const fastest = correctAnswers.reduce((prev, current) => current.timestamp < prev.timestamp ? current : prev);
    // Create new state with updated score
    const newScores = { ...gameState.scores };
    newScores[fastest.playerId] = (newScores[fastest.playerId] || 0) + 1;
    return advanceToNextRound({ ...gameState, scores: newScores }, fastest.playerId);
}
/**
 * Advance to the next round or finish the game
 */
function advanceToNextRound(gameState, roundWinnerId) {
    const isLastRound = gameState.round >= gameState.totalRounds;
    if (isLastRound) {
        return {
            ...gameState,
            phase: 'finished',
            roundWinner: roundWinnerId,
            currentColor: null,
        };
    }
    return {
        ...gameState,
        phase: 'showing_color',
        currentColor: getRandomColor(),
        round: gameState.round + 1,
        roundWinner: roundWinnerId,
    };
}
// =============================================================================
// WINNER DETERMINATION
// =============================================================================
/**
 * Determine the winner of the game
 */
function determineWinner(gameState) {
    const scores = gameState.scores;
    const playerIds = Object.keys(scores);
    if (playerIds.length === 0) {
        return null;
    }
    // Find highest score
    let maxScore = -1;
    let winnerId = '';
    playerIds.forEach(playerId => {
        const score = scores[playerId];
        if (score > maxScore) {
            maxScore = score;
            winnerId = playerId;
        }
    });
    return { winnerId, winnerScore: maxScore };
}
/**
 * Get sorted leaderboard
 */
function getLeaderboard(gameState) {
    const entries = Object.entries(gameState.scores)
        .map(([playerId, score]) => ({ playerId, score }))
        .sort((a, b) => b.score - a.score);
    return entries.map((entry, index) => ({
        ...entry,
        rank: index + 1,
    }));
}
//# sourceMappingURL=colorRaceLogic.js.map