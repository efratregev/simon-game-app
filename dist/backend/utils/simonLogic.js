"use strict";
/**
 * Simon Game Logic
 *
 * Core game logic for Simon Says multiplayer game.
 * Handles sequence generation, validation, and game progression.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.initializeSimonGame = initializeSimonGame;
exports.generateSequence = generateSequence;
exports.extendSequence = extendSequence;
exports.calculateTimeoutSeconds = calculateTimeoutSeconds;
exports.calculateTimeoutMs = calculateTimeoutMs;
exports.validateInput = validateInput;
exports.validateSequence = validateSequence;
exports.processRoundSubmissions = processRoundSubmissions;
exports.haveAllPlayersSubmitted = haveAllPlayersSubmitted;
exports.advanceToNextRound = advanceToNextRound;
exports.eliminatePlayer = eliminatePlayer;
exports.shouldGameEnd = shouldGameEnd;
exports.getWinner = getWinner;
exports.getActivePlayerCount = getActivePlayerCount;
exports.updatePlayerProgress = updatePlayerProgress;
const types_1 = require("../../shared/types");
// =============================================================================
// INITIALIZATION
// =============================================================================
/**
 * Initialize a new Simon game state
 */
function initializeSimonGame(players) {
    const playerStates = {};
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
    const initialSequence = generateSequence(types_1.SIMON_CONSTANTS.INITIAL_SEQUENCE_LENGTH);
    // Initialize scores (Step 4)
    const scores = {};
    players.forEach(player => {
        scores[player.id] = 0;
    });
    return {
        gameType: 'simon',
        phase: 'showing_sequence',
        sequence: initialSequence,
        round: 1,
        playerStates,
        currentShowingIndex: 0,
        timeoutMs: calculateTimeoutMs(types_1.SIMON_CONSTANTS.INITIAL_SEQUENCE_LENGTH), // ✅ 17 seconds for round 1!
        timeoutAt: null, // Step 3: Set when input phase begins
        timerStartedAt: null, // Step 3: Set when input phase begins
        scores, // Step 4: Player scores
        submissions: {}, // Step 4: Current round submissions
        roundWinner: null, // Step 4: Round winner
        winnerId: null,
    };
}
// =============================================================================
// SEQUENCE GENERATION
// =============================================================================
/**
 * Generate a random color sequence of specified length
 */
function generateSequence(length) {
    const sequence = [];
    for (let i = 0; i < length; i++) {
        const randomIndex = Math.floor(Math.random() * types_1.COLORS.length);
        sequence.push(types_1.COLORS[randomIndex]);
    }
    return sequence;
}
/**
 * Add one more color to existing sequence
 */
function extendSequence(currentSequence) {
    const randomIndex = Math.floor(Math.random() * types_1.COLORS.length);
    return [...currentSequence, types_1.COLORS[randomIndex]];
}
// =============================================================================
// TIMING (Step 3)
// =============================================================================
/**
 * Calculate timeout in seconds based on sequence length
 * Formula: 15 + (sequenceLength × 2) seconds
 */
function calculateTimeoutSeconds(sequenceLength) {
    return 15 + (sequenceLength * 2);
}
/**
 * Calculate timeout in milliseconds based on sequence length
 */
function calculateTimeoutMs(sequenceLength) {
    return calculateTimeoutSeconds(sequenceLength) * 1000;
}
// =============================================================================
// VALIDATION
// =============================================================================
/**
 * Validate if a player's color input is correct (used in Step 4+)
 */
function validateInput(gameState, playerId, color, inputIndex) {
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
function validateSequence(gameState, submittedSequence) {
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
// ROUND PROCESSING (Step 4)
// =============================================================================
/**
 * Process all submissions for a round
 * Find fastest correct, eliminate wrong/timeout players, award points
 */
function processRoundSubmissions(gameState) {
    const submissions = Object.values(gameState.submissions);
    const eliminations = [];
    let updatedPlayerStates = { ...gameState.playerStates };
    let updatedScores = { ...gameState.scores };
    let roundWinner = null;
    // Filter to only correct submissions
    const correctSubmissions = submissions.filter(s => s.isCorrect);
    // Eliminate all wrong submissions
    submissions.forEach(submission => {
        if (!submission.isCorrect && updatedPlayerStates[submission.playerId]?.status === 'playing') {
            updatedPlayerStates[submission.playerId] = {
                ...updatedPlayerStates[submission.playerId],
                status: 'eliminated',
                eliminatedAtRound: gameState.round,
            };
            eliminations.push({
                playerId: submission.playerId,
                reason: 'wrong_sequence',
            });
        }
    });
    // Find fastest correct submission(s)
    if (correctSubmissions.length > 0) {
        // Sort by timestamp (earliest first)
        const sorted = [...correctSubmissions].sort((a, b) => a.timestamp - b.timestamp);
        const fastestTime = sorted[0].timestamp;
        // Check for ties (same millisecond)
        const winners = sorted.filter(s => s.timestamp === fastestTime);
        // Award +1 point to all winners (handles ties)
        winners.forEach(winner => {
            updatedScores[winner.playerId] = (updatedScores[winner.playerId] || 0) + 1;
        });
        // Set round winner (first if tie)
        roundWinner = {
            playerId: winners[0].playerId,
            score: updatedScores[winners[0].playerId],
        };
    }
    return {
        gameState: {
            ...gameState,
            playerStates: updatedPlayerStates,
            scores: updatedScores,
            roundWinner: roundWinner?.playerId || null,
            submissions: {}, // Clear for next round
        },
        roundWinner,
        eliminations,
    };
}
/**
 * Check if all active players have submitted
 */
function haveAllPlayersSubmitted(gameState) {
    const activePlayers = Object.values(gameState.playerStates).filter(state => state.status === 'playing');
    const submissions = Object.keys(gameState.submissions);
    return activePlayers.length > 0 && submissions.length >= activePlayers.length;
}
// =============================================================================
// GAME PROGRESSION
// =============================================================================
/**
 * Advance to the next round
 */
function advanceToNextRound(gameState) {
    // Extend sequence by one color
    const newSequence = extendSequence(gameState.sequence);
    // Calculate new timeout (decreases each round but has minimum)
    const newTimeout = Math.max(types_1.SIMON_CONSTANTS.MIN_TIMEOUT_MS, gameState.timeoutMs - types_1.SIMON_CONSTANTS.TIMEOUT_DECREMENT_MS);
    // Reset all active players' input index for new round
    const updatedPlayerStates = {};
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
        submissions: {}, // Step 4: Clear submissions for new round
        roundWinner: null, // Step 4: Clear round winner
    };
}
/**
 * Eliminate a player from the game
 */
function eliminatePlayer(gameState, playerId, round) {
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
 * Check if game should end
 *
 * Solo mode (1 total player): End only when that player is eliminated (0 active)
 * Multiplayer (2+ players): End when 1 or fewer active players remain
 */
function shouldGameEnd(gameState) {
    const totalPlayers = Object.keys(gameState.playerStates).length;
    const activePlayers = Object.values(gameState.playerStates).filter(state => state.status === 'playing');
    // Solo mode: only end when the player is eliminated
    if (totalPlayers === 1) {
        return activePlayers.length === 0;
    }
    // Multiplayer: end when 1 or fewer active players
    return activePlayers.length <= 1;
}
/**
 * Get the winner (last player standing or highest scorer)
 */
function getWinner(gameState) {
    const activePlayers = Object.values(gameState.playerStates).filter(state => state.status === 'playing');
    // If 1 player still active, they're the winner
    if (activePlayers.length === 1) {
        return activePlayers[0].playerId;
    }
    // If all eliminated, return player with highest score
    if (activePlayers.length === 0) {
        let highestScore = -1;
        let winnerId = null;
        Object.entries(gameState.scores).forEach(([playerId, score]) => {
            if (score > highestScore) {
                highestScore = score;
                winnerId = playerId;
            }
        });
        return winnerId;
    }
    return null;
}
/**
 * Get count of active (still playing) players
 */
function getActivePlayerCount(gameState) {
    return Object.values(gameState.playerStates).filter(state => state.status === 'playing').length;
}
/**
 * Update player's current input index (progress through sequence)
 */
function updatePlayerProgress(gameState, playerId) {
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
//# sourceMappingURL=simonLogic.js.map