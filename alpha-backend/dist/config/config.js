"use strict";
/**
 * Configuration Module
 * Centralized configuration management with validation
 * Implements Configuration Management Pattern
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.monitoringConfig = exports.backgroundJobsConfig = exports.aiConfig = exports.uploadConfig = exports.loggingConfig = exports.rateLimitConfig = exports.securityConfig = exports.otpConfig = exports.smsConfig = exports.jwtConfig = exports.redisConfig = exports.databaseConfig = exports.appConfig = void 0;
const dotenv_1 = require("dotenv");
// Load environment variables
(0, dotenv_1.config)();
/**
 * Environment variable getter with validation
 */
const getEnvVar = (name, defaultValue) => {
    const value = process.env[name];
    if (value === undefined) {
        if (defaultValue !== undefined) {
            return defaultValue;
        }
        throw new Error(`Environment variable ${name} is required but not set`);
    }
    return value;
};
/**
 * Parse environment variable as number
 */
const getEnvNumber = (name, defaultValue) => {
    const value = process.env[name];
    if (value === undefined) {
        if (defaultValue !== undefined) {
            return defaultValue;
        }
        throw new Error(`Environment variable ${name} is required but not set`);
    }
    const parsed = parseInt(value, 10);
    if (isNaN(parsed)) {
        throw new Error(`Environment variable ${name} must be a valid number`);
    }
    return parsed;
};
/**
 * Parse environment variable as boolean
 */
const getEnvBoolean = (name, defaultValue) => {
    const value = process.env[name];
    if (value === undefined) {
        if (defaultValue !== undefined) {
            return defaultValue;
        }
        throw new Error(`Environment variable ${name} is required but not set`);
    }
    return value.toLowerCase() === 'true';
};
/**
 * Parse environment variable as array
 */
const getEnvArray = (name, defaultValue) => {
    const value = process.env[name];
    if (value === undefined) {
        if (defaultValue !== undefined) {
            return defaultValue;
        }
        throw new Error(`Environment variable ${name} is required but not set`);
    }
    return value.split(',').map(item => item.trim());
};
/**
 * Build configuration object
 */
const buildConfig = () => ({
    app: {
        nodeEnv: getEnvVar('NODE_ENV', 'development'),
        port: getEnvNumber('PORT', 3000),
        host: getEnvVar('HOST', '0.0.0.0'),
        apiVersion: getEnvVar('API_VERSION', 'v1'),
        apiPrefix: getEnvVar('API_PREFIX', '/api'),
    },
    database: {
        url: getEnvVar('DATABASE_URL'),
    },
    redis: {
        url: getEnvVar('REDIS_URL', 'redis://localhost:6379'),
        password: getEnvVar('REDIS_PASSWORD', ''),
        db: getEnvNumber('REDIS_DB', 0),
    },
    jwt: {
        accessTokenSecret: getEnvVar('JWT_ACCESS_SECRET'),
        refreshTokenSecret: getEnvVar('JWT_REFRESH_SECRET'),
        accessTokenExpiry: getEnvVar('JWT_ACCESS_EXPIRES_IN', '15m'),
        refreshTokenExpiry: getEnvVar('JWT_REFRESH_EXPIRES_IN', '7d'),
        issuer: getEnvVar('JWT_ISSUER', 'basira-api'),
        audience: getEnvVar('JWT_AUDIENCE', 'basira-app'),
    },
    sms: {
        provider: getEnvVar('SMS_PROVIDER', 'twilio'),
        twilioAccountSid: getEnvVar('TWILIO_ACCOUNT_SID', ''),
        twilioAuthToken: getEnvVar('TWILIO_AUTH_TOKEN', ''),
        twilioPhoneNumber: getEnvVar('TWILIO_PHONE_NUMBER', ''),
    },
    otp: {
        length: getEnvNumber('OTP_LENGTH', 6),
        expiryMinutes: getEnvNumber('OTP_EXPIRY_MINUTES', 5),
        maxAttempts: getEnvNumber('OTP_MAX_ATTEMPTS', 3),
        rateLimitWindow: getEnvNumber('OTP_RATE_LIMIT_WINDOW', 15),
        dailyLimit: getEnvNumber('OTP_DAILY_LIMIT', 10),
    },
    security: {
        encryptionKey: getEnvVar('ENCRYPTION_KEY'),
        bcryptRounds: getEnvNumber('BCRYPT_ROUNDS', 12),
        corsOrigin: getEnvVar('CORS_ORIGIN', 'http://localhost:3000'),
        corsCredentials: getEnvBoolean('CORS_CREDENTIALS', true),
        helmetEnabled: getEnvBoolean('HELMET_ENABLED', true),
    },
    rateLimit: {
        windowMs: getEnvNumber('RATE_LIMIT_WINDOW_MS', 60000),
        maxRequests: getEnvNumber('RATE_LIMIT_MAX_REQUESTS', 100),
        skipSuccessRequests: getEnvBoolean('RATE_LIMIT_SKIP_SUCCESS_REQUESTS', false),
    },
    logging: {
        level: getEnvVar('LOG_LEVEL', 'info'),
        file: getEnvVar('LOG_FILE', 'logs/app.log'),
        maxSize: getEnvVar('LOG_MAX_SIZE', '10m'),
        maxFiles: getEnvNumber('LOG_MAX_FILES', 5),
    },
    upload: {
        maxSize: getEnvNumber('UPLOAD_MAX_SIZE', 10485760),
        allowedTypes: getEnvArray('UPLOAD_ALLOWED_TYPES', [
            'image/jpeg',
            'image/png',
            'image/webp',
            'application/pdf',
        ]),
        destination: getEnvVar('UPLOAD_DESTINATION', 'uploads/'),
    },
    ai: {
        serviceUrl: getEnvVar('AI_SERVICE_URL', 'https://api.openai.com/v1'),
        apiKey: getEnvVar('AI_SERVICE_API_KEY', ''),
        model: getEnvVar('AI_MODEL', 'gpt-3.5-turbo'),
    },
    backgroundJobs: {
        redisUrl: getEnvVar('BULL_REDIS_URL', 'redis://localhost:6379/1'),
        concurrency: getEnvNumber('QUEUE_CONCURRENCY', 5),
    },
    monitoring: {
        sentryDsn: getEnvVar('SENTRY_DSN', ''),
        analyticsEnabled: getEnvBoolean('ANALYTICS_ENABLED', false),
    },
});
/**
 * Validate configuration
 */
const validateConfig = (config) => {
    // Validate critical variables
    const criticalVars = [
        { name: 'DATABASE_URL', value: config.database.url },
        { name: 'JWT_ACCESS_SECRET', value: config.jwt.accessTokenSecret },
        { name: 'JWT_REFRESH_SECRET', value: config.jwt.refreshTokenSecret },
        { name: 'ENCRYPTION_KEY', value: config.security.encryptionKey },
    ];
    for (const { name, value } of criticalVars) {
        if (!value) {
            throw new Error(`Critical environment variable ${name} is missing`);
        }
    }
    // Validate JWT secrets are different
    if (config.jwt.accessTokenSecret === config.jwt.refreshTokenSecret) {
        throw new Error('JWT_ACCESS_SECRET and JWT_REFRESH_SECRET must be different');
    }
    // Validate encryption key length (32 bytes for AES-256)
    if (config.security.encryptionKey.length !== 32) {
        throw new Error('ENCRYPTION_KEY must be exactly 32 characters long for AES-256');
    }
    // Validate production settings
    if (config.app.nodeEnv === 'production') {
        if (config.jwt.accessTokenSecret.length < 32) {
            throw new Error('JWT_ACCESS_SECRET must be at least 32 characters in production');
        }
        if (config.jwt.refreshTokenSecret.length < 32) {
            throw new Error('JWT_REFRESH_SECRET must be at least 32 characters in production');
        }
        if (!config.security.helmetEnabled) {
            console.warn('WARNING: Helmet is disabled in production');
        }
    }
    // Validate numeric ranges
    if (config.otp.length < 4 || config.otp.length > 8) {
        throw new Error('OTP_LENGTH must be between 4 and 8');
    }
    if (config.security.bcryptRounds < 10 || config.security.bcryptRounds > 15) {
        throw new Error('BCRYPT_ROUNDS must be between 10 and 15');
    }
};
// Build and validate configuration
const config = buildConfig();
validateConfig(config);
// Export configuration
exports.default = config;
// Export individual config sections for convenience
exports.appConfig = config.app;
exports.databaseConfig = config.database;
exports.redisConfig = config.redis;
exports.jwtConfig = config.jwt;
exports.smsConfig = config.sms;
exports.otpConfig = config.otp;
exports.securityConfig = config.security;
exports.rateLimitConfig = config.rateLimit;
exports.loggingConfig = config.logging;
exports.uploadConfig = config.upload;
exports.aiConfig = config.ai;
exports.backgroundJobsConfig = config.backgroundJobs;
exports.monitoringConfig = config.monitoring;
//# sourceMappingURL=config.js.map