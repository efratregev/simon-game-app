"use strict";
/**
 * Server Entry Point
 *
 * Initializes Express + Socket.io server.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.io = exports.httpServer = void 0;
exports.startServer = startServer;
const http_1 = require("http");
const socket_io_1 = require("socket.io");
const app_1 = require("./app");
const gameHandler_1 = require("./websocket/gameHandler");
// =============================================================================
// CONFIGURATION
// =============================================================================
const PORT = process.env.PORT || 3000;
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';
const isProduction = process.env.NODE_ENV === 'production';
// =============================================================================
// SERVER SETUP
// =============================================================================
// Create HTTP server
const httpServer = (0, http_1.createServer)(app_1.app);
exports.httpServer = httpServer;
// Create Socket.io server
const io = new socket_io_1.Server(httpServer, {
    cors: {
        origin: FRONTEND_URL,
        credentials: true, // CRITICAL: Allows cookies
    },
    transports: ['websocket', 'polling'],
});
exports.io = io;
// Initialize WebSocket handlers
(0, gameHandler_1.initializeGameHandlers)(io);
// =============================================================================
// START SERVER
// =============================================================================
function startServer() {
    httpServer.listen(PORT, () => {
        console.log('');
        console.log('🎮 ═══════════════════════════════════════════');
        console.log('   SIMON GAME SERVER');
        console.log('═══════════════════════════════════════════════');
        console.log(`   🌐 HTTP:      http://localhost:${PORT}`);
        console.log(`   🔌 WebSocket: ws://localhost:${PORT}`);
        console.log(`   🎯 Frontend:  ${FRONTEND_URL}`);
        console.log(`   📦 Mode:      ${isProduction ? 'production' : 'development'}`);
        console.log('═══════════════════════════════════════════════');
        console.log('');
    });
}
// Start if run directly
if (require.main === module) {
    startServer();
}
//# sourceMappingURL=server.js.map