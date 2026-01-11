/**
 * Platform Types - 100% Reusable Multiplayer Infrastructure
 *
 * These types handle WHO is playing and HOW they connect.
 * Game-specific types belong in game.types.ts
 */
/**
 * Player in a game room
 */
export interface Player {
    id: string;
    displayName: string;
    avatarId: string;
    isHost: boolean;
    socketId: string | null;
    connected: boolean;
    lastActivity: Date;
}
/**
 * Player info for creating/joining games
 */
export interface PlayerInfo {
    displayName: string;
    avatarId: string;
}
/**
 * Room lifecycle states
 */
export type RoomStatus = 'waiting' | 'countdown' | 'active' | 'finished';
/**
 * Game room container
 */
export interface GameRoom {
    gameCode: string;
    players: Player[];
    status: RoomStatus;
    createdAt: Date;
    gameState: unknown;
}
/**
 * Session data stored in JWT
 */
export interface SessionPayload {
    playerId: string;
    gameCode: string;
    displayName: string;
    avatarId: string;
    isHost: boolean;
}
/**
 * Client-side session (subset of SessionPayload)
 */
export interface Session {
    playerId: string;
    gameCode: string;
    displayName: string;
    avatarId: string;
    isHost: boolean;
}
/**
 * Create session request
 */
export interface CreateSessionRequest {
    displayName: string;
    avatarId: string;
}
/**
 * Create session response
 */
export interface CreateSessionResponse {
    playerId: string;
    gameCode: string;
    session: Session;
}
/**
 * Join game request
 */
export interface JoinGameRequest {
    displayName: string;
    avatarId: string;
    gameCode: string;
}
/**
 * Join game response
 */
export interface JoinGameResponse {
    playerId: string;
    session: Session;
}
/**
 * Verify session response
 */
export interface VerifySessionResponse {
    valid: boolean;
    session?: Session;
}
/**
 * Platform WebSocket events (server → client)
 */
export interface PlatformServerEvents {
    player_joined: (player: Player) => void;
    player_left: (data: {
        playerId: string;
    }) => void;
    player_disconnected: (data: {
        playerId: string;
    }) => void;
    player_reconnected: (data: {
        playerId: string;
    }) => void;
    room_closed: () => void;
    countdown: (data: {
        count: number;
    }) => void;
    room_state: (room: GameRoom) => void;
    error: (data: {
        message: string;
    }) => void;
}
/**
 * Platform WebSocket events (client → server)
 */
export interface PlatformClientEvents {
    join_room_socket: (data: {
        gameCode: string;
        playerId: string;
    }) => void;
    leave_room: (data: {
        gameCode: string;
        playerId: string;
    }) => void;
    start_game: (data: {
        gameCode: string;
        playerId: string;
    }) => void;
}
export declare const PLATFORM_CONSTANTS: {
    readonly MAX_PLAYERS: 4;
    readonly GAME_CODE_LENGTH: 6;
    readonly DISCONNECT_BUFFER_MS: 5000;
    readonly DISCONNECT_GRACE_MS: 180000;
    readonly ROOM_CLEANUP_INTERVAL_MS: 300000;
    readonly ROOM_MAX_AGE_MS: 86400000;
    readonly MIN_DISPLAY_NAME_LENGTH: 3;
    readonly MAX_DISPLAY_NAME_LENGTH: 12;
    readonly VALID_AVATAR_IDS: readonly ["1", "2", "3", "4", "5", "6", "7", "8"];
    readonly JWT_EXPIRATION: "24h";
};
//# sourceMappingURL=platform.types.d.ts.map