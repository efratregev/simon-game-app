/**
 * Game Code Utilities
 *
 * Generation and validation of unique game room codes.
 */
/**
 * Generate a unique game code
 *
 * @param existingCodes - Set of existing codes to avoid collisions
 * @param maxAttempts - Maximum attempts before throwing error
 * @returns A unique 6-character game code
 */
export declare function generateGameCode(existingCodes?: Set<string>, maxAttempts?: number): string;
/**
 * Format a game code for display (e.g., "ABC123" -> "ABC-123")
 */
export declare function formatGameCodeForDisplay(code: string): string;
/**
 * Normalize a game code input (remove dashes, uppercase)
 */
export declare function normalizeGameCode(input: string): string;
//# sourceMappingURL=gameCode.d.ts.map