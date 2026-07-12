import Joi from 'joi';
import logger from '../utils/logger';

/**
 * Environment Variables Schema
 * Validates all required environment variables at startup
 */
const envSchema = Joi.object({
  // Application
  NODE_ENV: Joi.string()
    .valid('development', 'production', 'test')
    .default('development'),
  
  PORT: Joi.number()
    .port()
    .default(3000),
  
  HOST: Joi.string()
    .hostname()
    .default('0.0.0.0'),

  API_PREFIX: Joi.string()
    .default('/api'),

  // Database
  DATABASE_URL: Joi.string()
    .uri()
    .required()
    .description('PostgreSQL connection string'),

  // JWT Secrets
  JWT_ACCESS_SECRET: Joi.string()
    .min(32)
    .required()
    .description('Secret for access tokens (min 32 characters)'),

  JWT_REFRESH_SECRET: Joi.string()
    .min(32)
    .required()
    .description('Secret for refresh tokens (min 32 characters)'),

  JWT_ACCESS_EXPIRES_IN: Joi.string()
    .default('15m'),

  JWT_REFRESH_EXPIRES_IN: Joi.string()
    .default('7d'),

  // CORS
  CORS_ORIGIN: Joi.string()
    .default('*')
    .description('Comma-separated list of allowed origins'),

  CORS_CREDENTIALS: Joi.boolean()
    .default(true),

  // Redis (optional)
  REDIS_HOST: Joi.string()
    .hostname()
    .optional(),

  REDIS_PORT: Joi.number()
    .port()
    .default(6379),

  REDIS_PASSWORD: Joi.string()
    .optional()
    .allow(''),

  REDIS_DB: Joi.number()
    .integer()
    .min(0)
    .max(15)
    .default(0),

  // Rate Limiting
  RATE_LIMIT_MAX_REQUESTS: Joi.number()
    .integer()
    .positive()
    .default(100),

  RATE_LIMIT_WINDOW_MS: Joi.number()
    .integer()
    .positive()
    .default(60000), // 1 minute

  // OTP Configuration
  OTP_EXPIRY_MINUTES: Joi.number()
    .integer()
    .positive()
    .default(5),

  OTP_MAX_ATTEMPTS: Joi.number()
    .integer()
    .positive()
    .default(3),

  // SMS Service (Twilio)
  TWILIO_ACCOUNT_SID: Joi.string()
    .optional()
    .when('NODE_ENV', {
      is: 'production',
      then: Joi.required(),
    }),

  TWILIO_AUTH_TOKEN: Joi.string()
    .optional()
    .when('NODE_ENV', {
      is: 'production',
      then: Joi.required(),
    }),

  TWILIO_PHONE_NUMBER: Joi.string()
    .optional()
    .when('NODE_ENV', {
      is: 'production',
      then: Joi.required(),
    }),

  // Logging
  LOG_LEVEL: Joi.string()
    .valid('error', 'warn', 'info', 'debug')
    .default('info'),

  LOG_FILE_ENABLED: Joi.boolean()
    .default(true),

  LOG_CONSOLE_ENABLED: Joi.boolean()
    .default(true),

  // Security
  BCRYPT_ROUNDS: Joi.number()
    .integer()
    .min(10)
    .max(15)
    .default(12),

  SESSION_TIMEOUT_MINUTES: Joi.number()
    .integer()
    .positive()
    .default(30),

  MAX_LOGIN_ATTEMPTS: Joi.number()
    .integer()
    .positive()
    .default(5),

  // File Upload
  MAX_FILE_SIZE_MB: Joi.number()
    .integer()
    .positive()
    .default(10),

  UPLOAD_PATH: Joi.string()
    .default('./uploads'),

  // Email Service (optional)
  SMTP_HOST: Joi.string()
    .hostname()
    .optional(),

  SMTP_PORT: Joi.number()
    .port()
    .optional(),

  SMTP_USER: Joi.string()
    .optional(),

  SMTP_PASSWORD: Joi.string()
    .optional(),

  SMTP_FROM: Joi.string()
    .email()
    .optional(),

  // Monitoring & Analytics (optional)
  SENTRY_DSN: Joi.string()
    .uri()
    .optional(),

  ANALYTICS_ENABLED: Joi.boolean()
    .default(false),

}).unknown(true); // Allow other environment variables

/**
 * Validate environment variables
 */
export const validateEnv = (): { [key: string]: any } => {
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

    logger.error('❌ Environment validation failed:', { errors });

    console.error('\n❌ Environment Validation Errors:\n');
    errors.forEach(err => {
      console.error(`  • ${err.key}: ${err.message}`);
    });
    console.error('\nPlease check your .env file and ensure all required variables are set.\n');

    process.exit(1);
  }

  return value;
};

/**
 * Check for weak secrets in production
 */
export const checkSecurityConfig = (env: any): void => {
  if (env.NODE_ENV === 'production') {
    const warnings: string[] = [];

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
      logger.warn('Security configuration warnings detected', { warnings });
    }
  }
};

/**
 * Mask sensitive environment variables in logs
 */
export const maskSensitiveEnv = (env: any): any => {
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

/**
 * Generate secure random string for secrets
 */
export const generateSecureSecret = (length: number = 64): string => {
  const crypto = require('crypto');
  return crypto.randomBytes(length).toString('hex');
};

/**
 * Display environment configuration on startup
 */
export const displayEnvConfig = (env: any): void => {
  const masked = maskSensitiveEnv(env);

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

  logger.info('Environment configuration loaded', { config: masked });
};

export default {
  validate: validateEnv,
  checkSecurity: checkSecurityConfig,
  mask: maskSensitiveEnv,
  display: displayEnvConfig,
  generateSecret: generateSecureSecret,
};
