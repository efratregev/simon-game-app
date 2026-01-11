/**
 * Authentication Utilities
 *
 * JWT token generation and verification for session management.
 * Uses HTTP-only cookies for security.
 */
import type { SessionPayload } from '../../shared/types';
/**
 * Generate a JWT token for a session
 */
export declare function generateToken(payload: SessionPayload): string;
/**
 * Verify and decode a JWT token
 * Returns null if token is invalid or expired
 */
export declare function verifyToken(token: string): SessionPayload | null;
/**
 * Get cookie options for session cookie
 */
export declare function getSessionCookieOptions(): {
    httpOnly: boolean;
    secure: boolean;
    sameSite: "strict";
    maxAge: number;
};
//# sourceMappingURL=auth.d.ts.map