"use strict";
/**
 * Authentication Utilities
 *
 * JWT token generation and verification for session management.
 * Uses HTTP-only cookies for security.
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateToken = generateToken;
exports.verifyToken = verifyToken;
exports.getSessionCookieOptions = getSessionCookieOptions;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const types_1 = require("../../shared/types");
// =============================================================================
// CONFIGURATION
// =============================================================================
const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-in-production';
if (process.env.NODE_ENV === 'production' && JWT_SECRET === 'dev-secret-change-in-production') {
    throw new Error('JWT_SECRET must be set in production environment');
}
// =============================================================================
// TOKEN FUNCTIONS
// =============================================================================
/**
 * Generate a JWT token for a session
 */
function generateToken(payload) {
    return jsonwebtoken_1.default.sign(payload, JWT_SECRET, {
        expiresIn: types_1.PLATFORM_CONSTANTS.JWT_EXPIRATION,
    });
}
/**
 * Verify and decode a JWT token
 * Returns null if token is invalid or expired
 */
function verifyToken(token) {
    try {
        const decoded = jsonwebtoken_1.default.verify(token, JWT_SECRET);
        return decoded;
    }
    catch {
        return null;
    }
}
// =============================================================================
// COOKIE OPTIONS
// =============================================================================
/**
 * Get cookie options for session cookie
 */
function getSessionCookieOptions() {
    const isProduction = process.env.NODE_ENV === 'production';
    return {
        httpOnly: true,
        secure: isProduction,
        sameSite: 'strict',
        maxAge: 24 * 60 * 60 * 1000, // 24 hours in milliseconds
    };
}
//# sourceMappingURL=auth.js.map