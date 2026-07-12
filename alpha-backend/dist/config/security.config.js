"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.securityConfig = exports.apiSecurity = exports.fileUploadConfig = exports.sessionConfig = exports.passwordPolicy = exports.securityHeaders = exports.sanitizationRules = exports.otpRateLimit = exports.authRateLimit = exports.rateLimitConfig = exports.corsConfig = exports.helmetConfig = void 0;
const config_1 = __importDefault(require("./config"));
/**
 * Helmet Security Headers Configuration
 * Provides protection against common web vulnerabilities
 */
const helmetConfig = {
    // Content Security Policy
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            baseUri: ["'self'"],
            fontSrc: ["'self'", 'https:', 'data:'],
            formAction: ["'self'"],
            frameAncestors: ["'self'"],
            imgSrc: ["'self'", 'data:', 'https:'],
            objectSrc: ["'none'"],
            scriptSrc: ["'self'"],
            scriptSrcAttr: ["'none'"],
            styleSrc: ["'self'", 'https:', "'unsafe-inline'"],
            upgradeInsecureRequests: [],
        },
    },
    // Cross-Origin-Embedder-Policy
    crossOriginEmbedderPolicy: config_1.default.app.nodeEnv === 'production',
    // Cross-Origin-Opener-Policy
    crossOriginOpenerPolicy: { policy: 'same-origin' },
    // Cross-Origin-Resource-Policy
    crossOriginResourcePolicy: { policy: 'same-origin' },
    // DNS Prefetch Control
    dnsPrefetchControl: { allow: false },
    // Frame Options (prevent clickjacking)
    frameguard: { action: 'deny' },
    // Hide Powered-By header
    hidePoweredBy: true,
    // HTTP Strict Transport Security (HSTS)
    hsts: {
        maxAge: 31536000, // 1 year
        includeSubDomains: true,
        preload: true,
    },
    // IE No Open
    ieNoOpen: true,
    // Disable client-side caching
    noSniff: true,
    // Origin Agent Cluster
    originAgentCluster: true,
    // Permitted Cross-Domain Policies
    permittedCrossDomainPolicies: { permittedPolicies: 'none' },
    // Referrer Policy
    referrerPolicy: { policy: 'no-referrer' },
    // XSS Filter
    xssFilter: true,
};
exports.helmetConfig = helmetConfig;
/**
 * CORS Configuration
 * Controls which domains can access the API
 */
const corsConfig = {
    origin: (origin, callback) => {
        // Allow requests with no origin (mobile apps, postman, etc.)
        if (!origin) {
            callback(null, true);
            return;
        }
        // Get allowed origins from config
        const allowedOrigins = config_1.default.security.corsOrigin;
        // Check if origin is allowed
        if (allowedOrigins === '*' || allowedOrigins.includes(origin)) {
            callback(null, true);
        }
        else {
            callback(new Error('Not allowed by CORS'), false);
        }
    },
    // Allowed HTTP methods
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    // Allowed headers
    allowedHeaders: [
        'Content-Type',
        'Authorization',
        'X-Request-ID',
        'X-Requested-With',
        'Accept',
        'Origin',
    ],
    // Exposed headers
    exposedHeaders: ['X-Request-ID', 'X-RateLimit-Limit', 'X-RateLimit-Remaining'],
    // Allow credentials (cookies, authorization headers)
    credentials: config_1.default.security.corsCredentials,
    // Preflight cache duration (in seconds)
    maxAge: 600, // 10 minutes
    // Allow preflight to succeed even if route doesn't exist
    preflightContinue: false,
    // Status code for successful OPTIONS request
    optionsSuccessStatus: 204,
};
exports.corsConfig = corsConfig;
/**
 * Rate Limiting Configuration
 * Prevents abuse and DDoS attacks
 */
const rateLimitConfig = {
    global: true,
    // Default: 100 requests per minute
    max: 100,
    timeWindow: '1 minute',
    // Custom error response
    errorResponseBuilder: (request, context) => ({
        success: false,
        error: {
            code: 'RATE_LIMIT_EXCEEDED',
            message: 'تم تجاوز الحد المسموح من الطلبات. حاول مرة أخرى لاحقاً',
            details: {
                limit: context.max,
                remaining: 0,
                retryAfter: Math.ceil(context.ttl / 1000),
            },
        },
        meta: {
            timestamp: new Date().toISOString(),
            version: 'v1',
        },
    }),
    // Add rate limit headers to response
    addHeaders: {
        'x-ratelimit-limit': true,
        'x-ratelimit-remaining': true,
        'x-ratelimit-reset': true,
        'retry-after': true,
    },
    // Key generator (use IP or user ID)
    keyGenerator: (request) => {
        // Use user ID if authenticated
        if (request.user?.userId) {
            return `user:${request.user.userId}`;
        }
        // Otherwise use IP address
        return request.ip;
    },
    // Skip rate limiting for health check
    skip: (request) => {
        return request.url === '/health';
    },
    // Use Redis for distributed rate limiting (if available)
    redis: undefined,
};
exports.rateLimitConfig = rateLimitConfig;
/**
 * Specific rate limits for sensitive endpoints
 */
const authRateLimit = {
    max: 5,
    timeWindow: '15 minutes',
    keyGenerator: (request) => {
        const body = request.body;
        return body?.phoneNumber || request.ip;
    },
};
exports.authRateLimit = authRateLimit;
const otpRateLimit = {
    max: 3,
    timeWindow: '15 minutes',
    keyGenerator: (request) => {
        const body = request.body;
        return body?.phoneNumber || request.ip;
    },
};
exports.otpRateLimit = otpRateLimit;
/**
 * Input Sanitization Rules
 */
const sanitizationRules = {
    // Remove HTML tags
    stripHtml: (input) => {
        return input.replace(/<[^>]*>/g, '');
    },
    // Remove SQL injection attempts
    stripSql: (input) => {
        const sqlPatterns = [
            /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|EXECUTE)\b)/gi,
            /(;|--|\/\*|\*\/|xp_|sp_)/gi,
            /(UNION|JOIN|WHERE|HAVING|GROUP BY|ORDER BY)/gi,
        ];
        let sanitized = input;
        sqlPatterns.forEach(pattern => {
            sanitized = sanitized.replace(pattern, '');
        });
        return sanitized;
    },
    // Remove XSS attempts
    stripXss: (input) => {
        const xssPatterns = [
            /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
            /javascript:/gi,
            /on\w+\s*=/gi,
            /<iframe/gi,
            /<object/gi,
            /<embed/gi,
        ];
        let sanitized = input;
        xssPatterns.forEach(pattern => {
            sanitized = sanitized.replace(pattern, '');
        });
        return sanitized;
    },
    // Sanitize all text inputs
    sanitizeText: (input) => {
        if (!input || typeof input !== 'string')
            return input;
        let sanitized = input.trim();
        sanitized = sanitizationRules.stripHtml(sanitized);
        sanitized = sanitizationRules.stripXss(sanitized);
        sanitized = sanitizationRules.stripSql(sanitized);
        return sanitized;
    },
};
exports.sanitizationRules = sanitizationRules;
/**
 * Security Headers to add to all responses
 */
const securityHeaders = {
    // Prevent MIME type sniffing
    'X-Content-Type-Options': 'nosniff',
    // Prevent clickjacking
    'X-Frame-Options': 'DENY',
    // XSS Protection (legacy browsers)
    'X-XSS-Protection': '1; mode=block',
    // Force HTTPS
    'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',
    // Referrer Policy
    'Referrer-Policy': 'no-referrer',
    // Permissions Policy (formerly Feature Policy)
    'Permissions-Policy': 'geolocation=(), microphone=(), camera=()',
    // Cache Control for sensitive data
    'Cache-Control': 'no-store, no-cache, must-revalidate, private',
    'Pragma': 'no-cache',
    'Expires': '0',
};
exports.securityHeaders = securityHeaders;
/**
 * Password Requirements
 */
const passwordPolicy = {
    minLength: 8,
    maxLength: 128,
    requireUppercase: true,
    requireLowercase: true,
    requireNumbers: true,
    requireSymbols: false,
    preventCommon: true,
    preventUserInfo: true,
    // Common weak passwords to block
    commonPasswords: [
        'password', 'password123', '12345678', 'qwerty', 'abc123',
        'monkey', '1234567890', 'letmein', 'trustno1', 'dragon',
    ],
};
exports.passwordPolicy = passwordPolicy;
/**
 * Session Security Configuration
 */
const sessionConfig = {
    // JWT token expiry
    accessTokenExpiry: '15m',
    refreshTokenExpiry: '7d',
    // Session timeout (minutes of inactivity)
    sessionTimeout: 30,
    // Maximum concurrent sessions per user
    maxSessions: 5,
    // Force logout after password change
    logoutOnPasswordChange: true,
    // Require re-authentication for sensitive operations
    requireReauth: {
        deleteAccount: true,
        changePassword: true,
        changeEmail: true,
        changePhone: true,
    },
};
exports.sessionConfig = sessionConfig;
/**
 * File Upload Security
 */
const fileUploadConfig = {
    maxFileSize: 10 * 1024 * 1024, // 10MB
    allowedMimeTypes: [
        'image/jpeg',
        'image/png',
        'image/webp',
        'image/jpg',
        'application/pdf',
    ],
    allowedExtensions: [
        '.jpg',
        '.jpeg',
        '.png',
        '.webp',
        '.pdf',
    ],
    // Scan files for malware (integration required)
    scanForMalware: config_1.default.app.nodeEnv === 'production',
    // Store files with random names
    randomizeFilenames: true,
};
exports.fileUploadConfig = fileUploadConfig;
/**
 * API Security Best Practices
 */
const apiSecurity = {
    // Hide error details in production
    exposeErrors: config_1.default.app.nodeEnv === 'development',
    // Log all failed authentication attempts
    logFailedAuth: true,
    // Block after N failed login attempts
    maxLoginAttempts: 5,
    lockoutDuration: 15, // minutes
    // Require HTTPS in production
    requireHttps: config_1.default.app.nodeEnv === 'production',
    // API versioning
    apiVersion: 'v1',
    // Request ID for tracing
    requireRequestId: true,
    // Maximum request body size
    maxRequestSize: '1mb',
    // Timeout for requests
    requestTimeout: 30000, // 30 seconds
};
exports.apiSecurity = apiSecurity;
// Export as object for convenience
exports.securityConfig = {
    helmet: helmetConfig,
    cors: corsConfig,
    rateLimit: rateLimitConfig,
    authRateLimit,
    otpRateLimit,
    sanitizationRules,
    securityHeaders,
    passwordPolicy,
    sessionConfig,
    fileUploadConfig,
    apiSecurity,
};
exports.default = exports.securityConfig;
//# sourceMappingURL=security.config.js.map