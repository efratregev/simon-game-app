"use strict";
/**
 * Platform Types - 100% Reusable Multiplayer Infrastructure
 *
 * These types handle WHO is playing and HOW they connect.
 * Game-specific types belong in game.types.ts
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.PLATFORM_CONSTANTS = void 0;
// =============================================================================
// CONSTANTS
// =============================================================================
exports.PLATFORM_CONSTANTS = {
    // Room settings
    MAX_PLAYERS: 4,
    GAME_CODE_LENGTH: 6,
    // Timeouts
    DISCONNECT_BUFFER_MS: 5000, // 5 seconds before marking disconnected
    DISCONNECT_GRACE_MS: 180000, // 3 minutes before removing player
    ROOM_CLEANUP_INTERVAL_MS: 300000, // 5 minutes
    ROOM_MAX_AGE_MS: 86400000, // 24 hours
    // Validation
    MIN_DISPLAY_NAME_LENGTH: 3,
    MAX_DISPLAY_NAME_LENGTH: 12,
    VALID_AVATAR_IDS: ['1', '2', '3', '4', '5', '6', '7', '8'],
    // JWT
    JWT_EXPIRATION: '24h',
};
//# sourceMappingURL=platform.types.js.map