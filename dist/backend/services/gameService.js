"use strict";
/**
 * Game Service
 *
 * Central manager for all game rooms and player state.
 * This is the core of the multiplayer platform infrastructure.
 *
 * 100% REUSABLE - Do not add game-specific logic here.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.gameService = exports.GameService = void 0;
const uuid_1 = require("uuid");
const types_1 = require("../../shared/types");
const gameCode_1 = require("../utils/gameCode");
// =============================================================================
// SERVICE CLASS
// =============================================================================
class GameService {
    rooms = new Map();
    // ===========================================================================
    // ROOM MANAGEMENT
    // ===========================================================================
    /**
     * Create a new game room with the host player
     */
    createRoom(hostInfo) {
        const existingCodes = new Set(this.rooms.keys());
        const gameCode = (0, gameCode_1.generateGameCode)(existingCodes);
        const host = {
            id: (0, uuid_1.v4)(),
            displayName: hostInfo.displayName,
            avatarId: hostInfo.avatarId,
            isHost: true,
            socketId: null,
            connected: false,
            lastActivity: new Date(),
        };
        const room = {
            gameCode,
            players: [host],
            status: 'waiting',
            createdAt: new Date(),
            gameState: null,
        };
        this.rooms.set(gameCode, room);
        return room;
    }
    /**
     * Get a room by game code
     */
    getRoom(gameCode) {
        return this.rooms.get(gameCode) ?? null;
    }
    /**
     * Get all rooms (for debugging/admin)
     */
    getAllRooms() {
        return Array.from(this.rooms.values());
    }
    /**
     * Delete a room
     */
    deleteRoom(gameCode) {
        return this.rooms.delete(gameCode);
    }
    /**
     * Update room status
     */
    updateRoomStatus(gameCode, status) {
        const room = this.rooms.get(gameCode);
        if (!room)
            return null;
        room.status = status;
        return room;
    }
    /**
     * Update room game state
     */
    updateGameState(gameCode, gameState) {
        const room = this.rooms.get(gameCode);
        if (!room)
            return null;
        room.gameState = gameState;
        return room;
    }
    // ===========================================================================
    // PLAYER MANAGEMENT
    // ===========================================================================
    /**
     * Add a player to a room
     */
    joinRoom(gameCode, playerInfo) {
        const room = this.rooms.get(gameCode);
        if (!room) {
            throw new Error('Room not found');
        }
        if (room.status !== 'waiting') {
            throw new Error('Game already in progress');
        }
        if (room.players.length >= types_1.PLATFORM_CONSTANTS.MAX_PLAYERS) {
            throw new Error('Room is full');
        }
        const player = {
            id: (0, uuid_1.v4)(),
            displayName: playerInfo.displayName,
            avatarId: playerInfo.avatarId,
            isHost: false,
            socketId: null,
            connected: false,
            lastActivity: new Date(),
        };
        room.players.push(player);
        return room;
    }
    /**
     * Get a player from a room
     */
    getPlayer(gameCode, playerId) {
        const room = this.rooms.get(gameCode);
        if (!room)
            return null;
        return room.players.find(p => p.id === playerId) ?? null;
    }
    /**
     * Update a player's socket ID (for connection/reconnection)
     */
    updateSocketId(gameCode, playerId, socketId) {
        const room = this.rooms.get(gameCode);
        if (!room)
            return null;
        const player = room.players.find(p => p.id === playerId);
        if (!player)
            return null;
        player.socketId = socketId;
        player.connected = true;
        player.lastActivity = new Date();
        return room;
    }
    /**
     * Mark a player as disconnected
     */
    markPlayerDisconnected(gameCode, playerId) {
        const room = this.rooms.get(gameCode);
        if (!room)
            return;
        const player = room.players.find(p => p.id === playerId);
        if (!player)
            return;
        player.connected = false;
        player.socketId = null;
    }
    /**
     * Remove a player if still disconnected
     */
    removeIfStillDisconnected(gameCode, playerId) {
        const room = this.rooms.get(gameCode);
        if (!room)
            return false;
        const player = room.players.find(p => p.id === playerId);
        if (!player)
            return false;
        // Only remove if still disconnected
        if (!player.connected) {
            return this.removePlayer(gameCode, playerId);
        }
        return false;
    }
    /**
     * Update player's last activity timestamp
     */
    updatePlayerActivity(gameCode, playerId) {
        const room = this.rooms.get(gameCode);
        if (!room)
            return;
        const player = room.players.find(p => p.id === playerId);
        if (!player)
            return;
        player.lastActivity = new Date();
    }
    /**
     * Remove a player from a room
     * Returns true if player was removed
     */
    removePlayer(gameCode, playerId) {
        const room = this.rooms.get(gameCode);
        if (!room)
            return false;
        const playerIndex = room.players.findIndex(p => p.id === playerId);
        if (playerIndex === -1)
            return false;
        const removedPlayer = room.players[playerIndex];
        room.players.splice(playerIndex, 1);
        // If room is empty, delete it
        if (room.players.length === 0) {
            this.rooms.delete(gameCode);
            return true;
        }
        // If removed player was host, transfer host to next player
        if (removedPlayer.isHost && room.players.length > 0) {
            room.players[0].isHost = true;
        }
        return true;
    }
    // ===========================================================================
    // CLEANUP
    // ===========================================================================
    /**
     * Clean up dead/abandoned rooms
     */
    cleanupDeadRooms() {
        const now = new Date();
        let cleaned = 0;
        for (const [gameCode, room] of this.rooms.entries()) {
            // Remove rooms older than max age
            const roomAge = now.getTime() - room.createdAt.getTime();
            if (roomAge > types_1.PLATFORM_CONSTANTS.ROOM_MAX_AGE_MS) {
                this.rooms.delete(gameCode);
                cleaned++;
                continue;
            }
            // Remove rooms where all players are disconnected
            const allDisconnected = room.players.every(p => !p.connected);
            if (allDisconnected && room.players.length > 0) {
                // Check if any player has been disconnected for too long
                const oldestActivity = Math.min(...room.players.map(p => p.lastActivity.getTime()));
                const disconnectAge = now.getTime() - oldestActivity;
                if (disconnectAge > types_1.PLATFORM_CONSTANTS.DISCONNECT_GRACE_MS) {
                    this.rooms.delete(gameCode);
                    cleaned++;
                }
            }
        }
        return cleaned;
    }
    /**
     * Get count of active rooms
     */
    getRoomCount() {
        return this.rooms.size;
    }
    /**
     * Clear all rooms (for testing)
     */
    clearAllRooms() {
        this.rooms.clear();
    }
}
exports.GameService = GameService;
// =============================================================================
// SINGLETON INSTANCE
// =============================================================================
exports.gameService = new GameService();
//# sourceMappingURL=gameService.js.map