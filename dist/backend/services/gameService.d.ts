/**
 * Game Service
 *
 * Central manager for all game rooms and player state.
 * This is the core of the multiplayer platform infrastructure.
 *
 * 100% REUSABLE - Do not add game-specific logic here.
 */
import type { GameRoom, Player, PlayerInfo, RoomStatus } from '../../shared/types';
export declare class GameService {
    private rooms;
    /**
     * Create a new game room with the host player
     */
    createRoom(hostInfo: PlayerInfo): GameRoom;
    /**
     * Get a room by game code
     */
    getRoom(gameCode: string): GameRoom | null;
    /**
     * Get all rooms (for debugging/admin)
     */
    getAllRooms(): GameRoom[];
    /**
     * Delete a room
     */
    deleteRoom(gameCode: string): boolean;
    /**
     * Update room status
     */
    updateRoomStatus(gameCode: string, status: RoomStatus): GameRoom | null;
    /**
     * Update room game state
     */
    updateGameState(gameCode: string, gameState: unknown): GameRoom | null;
    /**
     * Add a player to a room
     */
    joinRoom(gameCode: string, playerInfo: PlayerInfo): GameRoom;
    /**
     * Get a player from a room
     */
    getPlayer(gameCode: string, playerId: string): Player | null;
    /**
     * Update a player's socket ID (for connection/reconnection)
     */
    updateSocketId(gameCode: string, playerId: string, socketId: string): GameRoom | null;
    /**
     * Mark a player as disconnected
     */
    markPlayerDisconnected(gameCode: string, playerId: string): void;
    /**
     * Remove a player if still disconnected
     */
    removeIfStillDisconnected(gameCode: string, playerId: string): boolean;
    /**
     * Update player's last activity timestamp
     */
    updatePlayerActivity(gameCode: string, playerId: string): void;
    /**
     * Remove a player from a room
     * Returns true if player was removed
     */
    removePlayer(gameCode: string, playerId: string): boolean;
    /**
     * Clean up dead/abandoned rooms
     */
    cleanupDeadRooms(): number;
    /**
     * Get count of active rooms
     */
    getRoomCount(): number;
    /**
     * Clear all rooms (for testing)
     */
    clearAllRooms(): void;
}
export declare const gameService: GameService;
//# sourceMappingURL=gameService.d.ts.map