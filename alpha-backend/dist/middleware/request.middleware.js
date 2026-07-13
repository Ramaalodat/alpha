"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.corsMiddleware = exports.securityHeaders = exports.requestLogger = exports.requestIdMiddleware = void 0;
const crypto_1 = require("crypto");
const logger_1 = __importDefault(require("../utils/logger"));
/**
 * Add request ID to each request
 */
const requestIdMiddleware = async (request, reply) => {
    const requestId = request.headers['x-request-id'] || (0, crypto_1.randomUUID)();
    request.id = requestId;
    reply.header('X-Request-ID', requestId);
};
exports.requestIdMiddleware = requestIdMiddleware;
/**
 * Log all incoming requests
 */
const requestLogger = async (request, reply) => {
    const start = Date.now();
    // Log request
    logger_1.default.info('Incoming request', {
        requestId: request.id,
        method: request.method,
        url: request.url,
        ip: request.ip,
        userAgent: request.headers['user-agent'],
        userId: request.user?.userId,
    });
    // Store start time for response logging
    request.startTime = start;
};
exports.requestLogger = requestLogger;
/**
 * Add security headers
 */
const securityHeaders = async (request, reply) => {
    reply.headers({
        'X-Content-Type-Options': 'nosniff',
        'X-Frame-Options': 'DENY',
        'X-XSS-Protection': '1; mode=block',
        'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
    });
};
exports.securityHeaders = securityHeaders;
/**
 * CORS headers for development
 */
const corsMiddleware = async (request, reply) => {
    const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'];
    const origin = request.headers.origin;
    if (origin && allowedOrigins.includes(origin)) {
        reply.header('Access-Control-Allow-Origin', origin);
        reply.header('Access-Control-Allow-Credentials', 'true');
        reply.header('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
        reply.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Request-ID');
    }
    // Handle preflight
    if (request.method === 'OPTIONS') {
        return reply.status(204).send();
    }
};
exports.corsMiddleware = corsMiddleware;
//# sourceMappingURL=request.middleware.js.map