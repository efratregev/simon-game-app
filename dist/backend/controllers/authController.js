"use strict";
/**
 * Auth Controller
 *
 * Handles session creation and game joining.
 * No passwords, no registration - just name + avatar.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.authRouter = void 0;
const express_1 = require("express");
const zod_1 = require("zod");
const gameService_1 = require("../services/gameService");
const auth_1 = require("../utils/auth");
const validation_1 = require("../utils/validation");
const gameCode_1 = require("../utils/gameCode");
// =============================================================================
// ROUTER
// =============================================================================
exports.authRouter = (0, express_1.Router)();
// =============================================================================
// ENDPOINTS
// =============================================================================
/**
 * POST /api/auth/create-session
 *
 * Host creates a new game session.
 * Returns game code and sets JWT cookie.
 */
exports.authRouter.post('/create-session', (req, res) => {
    try {
        console.log('🔍 CREATE SESSION - Request body:', JSON.stringify(req.body));
        // Validate input
        const { displayName, avatarId } = (0, validation_1.validateCreateSession)(req.body);
        // Create room with host
        const room = gameService_1.gameService.createRoom({ displayName, avatarId });
        const player = room.players[0];
        // Create session
        const session = {
            playerId: player.id,
            gameCode: room.gameCode,
            displayName: player.displayName,
            avatarId: player.avatarId,
            isHost: true,
        };
        // Generate JWT token
        const token = (0, auth_1.generateToken)(session);
        // Set cookie
        res.cookie('session', token, (0, auth_1.getSessionCookieOptions)());
        // Return response
        const response = {
            playerId: player.id,
            gameCode: room.gameCode,
            session,
        };
        console.log(`✅ Room created: ${room.gameCode} by ${displayName}`);
        res.status(201).json(response);
    }
    catch (error) {
        handleError(error, res);
    }
});
/**
 * POST /api/auth/join-game
 *
 * Player joins an existing game.
 * Returns session and sets JWT cookie.
 */
exports.authRouter.post('/join-game', (req, res) => {
    try {
        // Validate input
        const { displayName, avatarId, gameCode: rawGameCode } = (0, validation_1.validateJoinGame)(req.body);
        // Normalize game code (remove dashes, uppercase)
        const gameCode = (0, gameCode_1.normalizeGameCode)(rawGameCode);
        // Join room
        const room = gameService_1.gameService.joinRoom(gameCode, { displayName, avatarId });
        const player = room.players[room.players.length - 1]; // Last added player
        // Create session
        const session = {
            playerId: player.id,
            gameCode: room.gameCode,
            displayName: player.displayName,
            avatarId: player.avatarId,
            isHost: false,
        };
        // Generate JWT token
        const token = (0, auth_1.generateToken)(session);
        // Set cookie
        res.cookie('session', token, (0, auth_1.getSessionCookieOptions)());
        // Return response
        const response = {
            playerId: player.id,
            session,
        };
        console.log(`🏠 ${displayName} joined room ${gameCode} (${room.players.length}/4 players)`);
        res.status(200).json(response);
    }
    catch (error) {
        handleError(error, res);
    }
});
/**
 * GET /api/auth/verify-session
 *
 * Verify if current session is valid.
 * Used on page refresh to restore session.
 */
exports.authRouter.get('/verify-session', (req, res) => {
    try {
        const token = req.cookies.session;
        if (!token) {
            const response = { valid: false };
            return res.json(response);
        }
        // Verify token
        const payload = (0, auth_1.verifyToken)(token);
        if (!payload) {
            const response = { valid: false };
            return res.json(response);
        }
        // Check if room still exists
        const room = gameService_1.gameService.getRoom(payload.gameCode);
        if (!room) {
            // Room was deleted, clear cookie
            res.clearCookie('session');
            const response = { valid: false };
            return res.json(response);
        }
        // Check if player is still in room
        const player = room.players.find(p => p.id === payload.playerId);
        if (!player) {
            // Player was removed, clear cookie
            res.clearCookie('session');
            const response = { valid: false };
            return res.json(response);
        }
        // Session is valid
        const session = {
            playerId: player.id,
            gameCode: room.gameCode,
            displayName: player.displayName,
            avatarId: player.avatarId,
            isHost: player.isHost,
        };
        const response = {
            valid: true,
            session,
        };
        return res.json(response);
    }
    catch (error) {
        handleError(error, res);
    }
});
/**
 * POST /api/auth/logout
 *
 * Clear session and leave room.
 */
exports.authRouter.post('/logout', (req, res) => {
    try {
        const token = req.cookies.session;
        if (token) {
            const payload = (0, auth_1.verifyToken)(token);
            if (payload) {
                // Remove player from room
                gameService_1.gameService.removePlayer(payload.gameCode, payload.playerId);
                console.log(`👋 ${payload.displayName} left room ${payload.gameCode}`);
            }
        }
        // Clear cookie
        res.clearCookie('session');
        res.json({ success: true });
    }
    catch (error) {
        handleError(error, res);
    }
});
// =============================================================================
// ERROR HANDLING
// =============================================================================
function handleError(error, res) {
    // Validation errors
    if (error instanceof zod_1.ZodError) {
        const details = error.errors.map(e => ({
            field: e.path.join('.'),
            message: e.message,
        }));
        console.error('❌ Validation failed:', JSON.stringify(details, null, 2));
        res.status(400).json({
            error: 'Validation failed',
            details,
        });
        return;
    }
    // Known game errors
    if (error instanceof Error) {
        const message = error.message;
        if (message === 'Room not found') {
            res.status(404).json({ error: message });
            return;
        }
        if (message === 'Room is full' || message === 'Game already in progress') {
            res.status(400).json({ error: message });
            return;
        }
        // Log unexpected errors
        console.error('❌ Controller error:', error);
    }
    // Generic error
    res.status(500).json({ error: 'Internal server error' });
}
//# sourceMappingURL=authController.js.map