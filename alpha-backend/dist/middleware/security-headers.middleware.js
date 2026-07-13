"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sanitizeErrors = exports.calculateResponseTime = exports.addTimingHeader = exports.enforceHttps = exports.addSecurityHeaders = void 0;
const security_config_1 = require("../config/security.config");
const config_1 = __importDefault(require("../config/config"));
/**
 * Add security headers to all responses
 */
const addSecurityHeaders = async (request, reply) => {
    // Add all security headers
    Object.entries(security_config_1.securityHeaders).forEach(([header, value]) => {
        reply.header(header, value);
    });
    // Add custom headers
    reply.header('X-API-Version', 'v1');
    reply.header('X-Powered-By', 'BASIRA');
    // Add CORS headers if origin is present
    const origin = request.headers.origin;
    if (origin) {
        const allowedOrigins = config_1.default.security.corsOrigin;
        if (allowedOrigins === '*' || allowedOrigins.includes(origin)) {
            reply.header('Access-Control-Allow-Origin', origin);
            reply.header('Access-Control-Allow-Credentials', 'true');
        }
    }
};
exports.addSecurityHeaders = addSecurityHeaders;
/**
 * Enforce HTTPS in production
 */
const enforceHttps = async (request, reply) => {
    // Skip in development
    if (config_1.default.app.nodeEnv !== 'production') {
        return;
    }
    // Check if request is secure
    const isSecure = request.protocol === 'https' ||
        request.headers['x-forwarded-proto'] === 'https';
    if (!isSecure) {
        const host = request.headers.host || config_1.default.app.host;
        const secureUrl = `https://${host}${request.url}`;
        return reply.redirect(301, secureUrl);
    }
};
exports.enforceHttps = enforceHttps;
/**
 * Add request timing header
 */
const addTimingHeader = async (request, reply) => {
    const startTime = Date.now();
    // Store start time in request
    request.startTime = startTime;
};
exports.addTimingHeader = addTimingHeader;
/**
 * Calculate and add timing header (call in onResponse hook)
 */
const calculateResponseTime = (request, reply) => {
    const startTime = request.startTime;
    if (startTime) {
        const duration = Date.now() - startTime;
        reply.header('X-Response-Time', `${duration}ms`);
    }
};
exports.calculateResponseTime = calculateResponseTime;
/**
 * Hide sensitive error details in production
 */
const sanitizeErrors = (error) => {
    if (config_1.default.app.nodeEnv === 'production') {
        // Remove stack trace
        delete error.stack;
        // Remove sensitive details
        if (error.details) {
            delete error.details.stack;
            delete error.details.password;
            delete error.details.token;
            delete error.details.secret;
        }
    }
    return error;
};
exports.sanitizeErrors = sanitizeErrors;
//# sourceMappingURL=security-headers.middleware.js.map