"use strict";
/**
 * Express Application Setup
 *
 * Configures Express with CORS, middleware, and routes.
 * Socket.io is initialized separately in index.ts
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.app = void 0;
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const authController_1 = require("./controllers/authController");
// =============================================================================
// APP CONFIGURATION
// =============================================================================
const app = (0, express_1.default)();
exports.app = app;
// Environment
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';
const isProduction = process.env.NODE_ENV === 'production';
// =============================================================================
// MIDDLEWARE
// =============================================================================
// CORS - Allow frontend to send/receive cookies
app.use((0, cors_1.default)({
    origin: FRONTEND_URL,
    credentials: true, // CRITICAL: Allows cookies
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type'],
}));
// Parse JSON bodies
app.use(express_1.default.json());
// Parse cookies
app.use((0, cookie_parser_1.default)());
// =============================================================================
// ROUTES
// =============================================================================
// Health check
app.get('/health', (_req, res) => {
    res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        environment: isProduction ? 'production' : 'development',
    });
});
// Auth routes
app.use('/api/auth', authController_1.authRouter);
// =============================================================================
// ERROR HANDLING
// =============================================================================
// 404 handler
app.use((_req, res) => {
    res.status(404).json({ error: 'Not found' });
});
// Global error handler
app.use((err, _req, res, _next) => {
    console.error('❌ Unhandled error:', err);
    res.status(500).json({
        error: isProduction ? 'Internal server error' : err.message,
    });
});
//# sourceMappingURL=app.js.map