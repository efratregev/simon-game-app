"use strict";
/**
 * Validation Utilities
 *
 * Input validation using Zod schemas.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.joinGameSchema = exports.createSessionSchema = exports.gameCodeSchema = exports.avatarIdSchema = exports.displayNameSchema = void 0;
exports.validateCreateSession = validateCreateSession;
exports.validateJoinGame = validateJoinGame;
exports.isValidGameCode = isValidGameCode;
const zod_1 = require("zod");
const types_1 = require("../../shared/types");
// =============================================================================
// SCHEMAS
// =============================================================================
/**
 * Display name validation schema
 */
exports.displayNameSchema = zod_1.z
    .string()
    .min(types_1.PLATFORM_CONSTANTS.MIN_DISPLAY_NAME_LENGTH, `Display name must be at least ${types_1.PLATFORM_CONSTANTS.MIN_DISPLAY_NAME_LENGTH} characters`)
    .max(types_1.PLATFORM_CONSTANTS.MAX_DISPLAY_NAME_LENGTH, `Display name must be at most ${types_1.PLATFORM_CONSTANTS.MAX_DISPLAY_NAME_LENGTH} characters`)
    .regex(/^[a-zA-Z0-9\s-]+$/, 'Display name can only contain letters, numbers, spaces, and hyphens');
/**
 * Avatar ID validation schema
 */
exports.avatarIdSchema = zod_1.z
    .string()
    .refine((val) => types_1.PLATFORM_CONSTANTS.VALID_AVATAR_IDS.includes(val), `Avatar ID must be one of: ${types_1.PLATFORM_CONSTANTS.VALID_AVATAR_IDS.join(', ')}`);
/**
 * Game code validation schema
 * Accepts lowercase (will be normalized to uppercase)
 */
exports.gameCodeSchema = zod_1.z
    .string()
    .length(types_1.PLATFORM_CONSTANTS.GAME_CODE_LENGTH, `Game code must be exactly ${types_1.PLATFORM_CONSTANTS.GAME_CODE_LENGTH} characters`)
    .regex(/^[A-Za-z0-9]+$/, 'Game code must be alphanumeric');
/**
 * Create session request schema
 */
exports.createSessionSchema = zod_1.z.object({
    displayName: exports.displayNameSchema,
    avatarId: exports.avatarIdSchema,
});
/**
 * Join game request schema
 */
exports.joinGameSchema = zod_1.z.object({
    displayName: exports.displayNameSchema,
    avatarId: exports.avatarIdSchema,
    gameCode: exports.gameCodeSchema,
});
// =============================================================================
// HELPER FUNCTIONS
// =============================================================================
/**
 * Validate and parse create session input
 */
function validateCreateSession(input) {
    return exports.createSessionSchema.parse(input);
}
/**
 * Validate and parse join game input
 */
function validateJoinGame(input) {
    return exports.joinGameSchema.parse(input);
}
/**
 * Check if a game code is valid format
 */
function isValidGameCode(code) {
    return exports.gameCodeSchema.safeParse(code).success;
}
//# sourceMappingURL=validation.js.map