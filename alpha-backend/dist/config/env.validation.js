"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.displayEnvConfig = exports.generateSecureSecret = exports.maskSensitiveEnv = exports.checkSecurityConfig = exports.validateEnv = void 0;
const joi_1 = __importDefault(require("joi"));
const logger_1 = __importDefault(require("../utils/logger"));
/**
 * Environment Variables Schema
 * Validates all required environment variables at startup
 */
const envSchema = joi_1.default.object({
    // Application
    NODE_ENV: joi_1.default.string()
        .valid('development', 'production', 'test')
        .default('development'),
    PORT: joi_1.default.number()
        .port()
        .default(3000),
    HOST: joi_1.default.string()
        .hostname()
        .default('0.0.0.0'),
    API_PREFIX: joi_1.default.string()
        .default('/api'),
    // Database
    DATABASE_URL: joi_1.default.string()
        .uri()
        .required()
        .description('PostgreSQL connection string'),
    // JWT Secrets
    JWT_ACCESS_SECRET: joi_1.default.string()
        .min(32)
        .required()
        .description('Secret for access tokens (min 32 characters)'),
    JWT_REFRESH_SECRET: joi_1.default.string()
        .min(32)
        .required()
        .description('Secret for refresh tokens (min 32 characters)'),
    JWT_ACCESS_EXPIRES_IN: joi_1.default.string()
        .default('15m'),
    JWT_REFRESH_EXPIRES_IN: joi_1.default.string()
        .default('7d'),
    // CORS
    CORS_ORIGIN: joi_1.default.string()
        .default('*')
        .description('Comma-separated list of allowed origins'),
    CORS_CREDENTIALS: joi_1.default.boolean()
        .default(true),
    // Redis (optional)
    REDIS_HOST: joi_1.default.string()
        .hostname()
        .optional(),
    REDIS_PORT: joi_1.default.number()
        .port()
        .default(6379),
    REDIS_PASSWORD: joi_1.default.string()
        .optional()
        .allow(''),
    REDIS_DB: joi_1.default.number()
        .integer()
        .min(0)
        .max(15)
        .default(0),
    // Rate Limiting
    RATE_LIMIT_MAX_REQUESTS: joi_1.default.number()
        .integer()
        .positive()
        .default(100),
    RATE_LIMIT_WINDOW_MS: joi_1.default.number()
        .integer()
        .positive()
        .default(60000), // 1 minute
    // OTP Configuration
    OTP_EXPIRY_MINUTES: joi_1.default.number()
        .integer()
        .positive()
        .default(5),
    OTP_MAX_ATTEMPTS: joi_1.default.number()
        .integer()
        .positive()
        .default(3),
    // SMS Service (Twilio)
    TWILIO_ACCOUNT_SID: joi_1.default.string()
        .optional()
        .when('NODE_ENV', {
        is: 'production',
        then: joi_1.default.required(),
    }),
    TWILIO_AUTH_TOKEN: joi_1.default.string()
        .optional()
        .when('NODE_ENV', {
        is: 'production',
        then: joi_1.default.required(),
    }),
    TWILIO_PHONE_NUMBER: joi_1.default.string()
        .optional()
        .when('NODE_ENV', {
        is: 'production',
        then: joi_1.default.required(),
    }),
    // Logging
    LOG_LEVEL: joi_1.default.string()
        .valid('error', 'warn', 'info', 'debug')
        .default('info'),
    LOG_FILE_ENABLED: joi_1.default.boolean()
        .default(true),
    LOG_CONSOLE_ENABLED: joi_1.default.boolean()
        .default(true),
    // Security
    BCRYPT_ROUNDS: joi_1.default.number()
        .integer()
        .min(10)
        .max(15)
        .default(12),
    SESSION_TIMEOUT_MINUTES: joi_1.default.number()
        .integer()
        .positive()
        .default(30),
    MAX_LOGIN_ATTEMPTS: joi_1.default.number()
        .integer()
        .positive()
        .default(5),
    // File Upload
    MAX_FILE_SIZE_MB: joi_1.default.number()
        .integer()
        .positive()
        .default(10),
    UPLOAD_PATH: joi_1.default.string()
        .default('./uploads'),
    // Email Service (optional)
    SMTP_HOST: joi_1.default.string()
        .hostname()
        .optional(),
    SMTP_PORT: joi_1.default.number()
        .port()
        .optional(),
    SMTP_USER: joi_1.default.string()
        .optional(),
    SMTP_PASSWORD: joi_1.default.string()
        .optional(),
    SMTP_FROM: joi_1.default.string()
        .email()
        .optional(),
    // Monitoring & Analytics (optional)
    SENTRY_DSN: joi_1.default.string()
        .uri()
        .optional(),
    ANALYTICS_ENABLED: joi_1.default.boolean()
        .default(false),
}).unknown(true); // Allow other environment variables
/**
 * Validate environment variables
 */
const validateEnv = () => {
    const { error, value } = envSchema.validate(process.env, {
        abortEarly: false,
        stripUnknown: true,
    });
    if (error) {
        const errors = error.details.map(detail => ({
            key: detail.path.join('.'),
            message: detail.message,
            type: detail.type,
        }));
        logger_1.default.error('❌ Environment validation failed:', { errors });
        console.error('\n❌ Environment Validation Errors:\n');
        errors.forEach(err => {
            console.error(`  • ${err.key}: ${err.message}`);
        });
        console.error('\nPlease check your .env file and ensure all required variables are set.\n');
        process.exit(1);
    }
    return value;
};
exports.validateEnv = validateEnv;
/**
 * Check for weak secrets in production
 */
const checkSecurityConfig = (env) => {
    if (env.NODE_ENV === 'production') {
        const warnings = [];
        // Check JWT secrets strength
        if (env.JWT_ACCESS_SECRET.length < 64) {
            warnings.push('JWT_ACCESS_SECRET should be at least 64 characters in production');
        }
        if (env.JWT_REFRESH_SECRET.length < 64) {
            warnings.push('JWT_REFRESH_SECRET should be at least 64 characters in production');
        }
        // Check if using default secrets
        if (env.JWT_ACCESS_SECRET.includes('change-this')) {
            warnings.push('JWT_ACCESS_SECRET contains "change-this" - use a strong random secret');
        }
        if (env.JWT_REFRESH_SECRET.includes('change-this')) {
            warnings.push('JWT_REFRESH_SECRET contains "change-this" - use a strong random secret');
        }
        // Check CORS configuration
        if (env.CORS_ORIGIN === '*') {
            warnings.push('CORS_ORIGIN is set to "*" - specify allowed origins in production');
        }
        // Check database URL
        if (!env.DATABASE_URL.includes('ssl=true')) {
            warnings.push('DATABASE_URL should use SSL connection in production');
        }
        // Display warnings
        if (warnings.length > 0) {
            console.warn('\n⚠️  Security Configuration Warnings:\n');
            warnings.forEach(warning => {
                console.warn(`  • ${warning}`);
            });
            console.warn('\n');
            logger_1.default.warn('Security configuration warnings detected', { warnings });
        }
    }
};
exports.checkSecurityConfig = checkSecurityConfig;
/**
 * Mask sensitive environment variables in logs
 */
const maskSensitiveEnv = (env) => {
    const sensitiveKeys = [
        'DATABASE_URL',
        'JWT_ACCESS_SECRET',
        'JWT_REFRESH_SECRET',
        'REDIS_PASSWORD',
        'TWILIO_AUTH_TOKEN',
        'SMTP_PASSWORD',
        'SENTRY_DSN',
    ];
    const masked = { ...env };
    sensitiveKeys.forEach(key => {
        if (masked[key]) {
            const value = String(masked[key]);
            // Show only first 4 characters
            masked[key] = value.substring(0, 4) + '*'.repeat(Math.max(0, value.length - 4));
        }
    });
    return masked;
};
exports.maskSensitiveEnv = maskSensitiveEnv;
/**
 * Generate secure random string for secrets
 */
const generateSecureSecret = (length = 64) => {
    const crypto = require('crypto');
    return crypto.randomBytes(length).toString('hex');
};
exports.generateSecureSecret = generateSecureSecret;
/**
 * Display environment configuration on startup
 */
const displayEnvConfig = (env) => {
    const masked = (0, exports.maskSensitiveEnv)(env);
    console.log('\n📋 Environment Configuration:\n');
    console.log(`  Environment:     ${env.NODE_ENV}`);
    console.log(`  Port:            ${env.PORT}`);
    console.log(`  Host:            ${env.HOST}`);
    console.log(`  Database:        ${masked.DATABASE_URL}`);
    console.log(`  Redis:           ${env.REDIS_HOST ? 'Enabled' : 'Disabled'}`);
    console.log(`  CORS Origin:     ${env.CORS_ORIGIN}`);
    console.log(`  Log Level:       ${env.LOG_LEVEL}`);
    console.log(`  SMS Service:     ${env.TWILIO_ACCOUNT_SID ? 'Configured' : 'Not Configured'}`);
    console.log('');
    logger_1.default.info('Environment configuration loaded', { config: masked });
};
exports.displayEnvConfig = displayEnvConfig;
exports.default = {
    validate: exports.validateEnv,
    checkSecurity: exports.checkSecurityConfig,
    mask: exports.maskSensitiveEnv,
    display: exports.displayEnvConfig,
    generateSecret: exports.generateSecureSecret,
};
//# sourceMappingURL=env.validation.js.map