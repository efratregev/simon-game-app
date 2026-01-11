/**
 * Server Entry Point
 *
 * Initializes Express + Socket.io server.
 */
import { Server } from 'socket.io';
declare const httpServer: import("http").Server<typeof import("http").IncomingMessage, typeof import("http").ServerResponse>;
declare const io: Server<import("socket.io").DefaultEventsMap, import("socket.io").DefaultEventsMap, import("socket.io").DefaultEventsMap, any>;
export declare function startServer(): void;
export { httpServer, io };
//# sourceMappingURL=server.d.ts.map