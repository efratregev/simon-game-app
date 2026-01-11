/**
 * Validation Utilities
 *
 * Input validation using Zod schemas.
 */
import { z } from 'zod';
/**
 * Display name validation schema
 */
export declare const displayNameSchema: z.ZodString;
/**
 * Avatar ID validation schema
 */
export declare const avatarIdSchema: z.ZodEffects<z.ZodString, string, string>;
/**
 * Game code validation schema
 * Accepts lowercase (will be normalized to uppercase)
 */
export declare const gameCodeSchema: z.ZodString;
/**
 * Create session request schema
 */
export declare const createSessionSchema: z.ZodObject<{
    displayName: z.ZodString;
    avatarId: z.ZodEffects<z.ZodString, string, string>;
}, "strip", z.ZodTypeAny, {
    displayName: string;
    avatarId: string;
}, {
    displayName: string;
    avatarId: string;
}>;
/**
 * Join game request schema
 */
export declare const joinGameSchema: z.ZodObject<{
    displayName: z.ZodString;
    avatarId: z.ZodEffects<z.ZodString, string, string>;
    gameCode: z.ZodString;
}, "strip", z.ZodTypeAny, {
    gameCode: string;
    displayName: string;
    avatarId: string;
}, {
    gameCode: string;
    displayName: string;
    avatarId: string;
}>;
export type CreateSessionInput = z.infer<typeof createSessionSchema>;
export type JoinGameInput = z.infer<typeof joinGameSchema>;
/**
 * Validate and parse create session input
 */
export declare function validateCreateSession(input: unknown): CreateSessionInput;
/**
 * Validate and parse join game input
 */
export declare function validateJoinGame(input: unknown): JoinGameInput;
/**
 * Check if a game code is valid format
 */
export declare function isValidGameCode(code: string): boolean;
//# sourceMappingURL=validation.d.ts.map