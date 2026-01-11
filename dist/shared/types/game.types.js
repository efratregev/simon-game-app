"use strict";
/**
 * Game Types - Game-Specific Logic
 *
 * These types handle WHAT players are playing.
 * Platform types belong in platform.types.ts
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.SIMON_CONSTANTS = exports.COLOR_RACE_CONSTANTS = exports.COLORS = void 0;
/**
 * All available colors
 */
exports.COLORS = ['red', 'blue', 'yellow', 'green'];
/**
 * Color Race constants
 */
exports.COLOR_RACE_CONSTANTS = {
    TOTAL_ROUNDS: 5,
    ROUND_RESULT_DELAY_MS: 2000,
};
/**
 * Simon Says constants
 */
exports.SIMON_CONSTANTS = {
    INITIAL_SEQUENCE_LENGTH: 1,
    SEQUENCE_INCREMENT: 1,
    INITIAL_TIMEOUT_MS: 5000, // 5 seconds
    TIMEOUT_DECREMENT_MS: 250, // Decrease by 250ms each round
    MIN_TIMEOUT_MS: 1500, // Minimum 1.5 seconds
    SHOW_COLOR_DURATION_MS: 600, // How long each color shows
    SHOW_COLOR_GAP_MS: 200, // Gap between colors
};
//# sourceMappingURL=game.types.js.map