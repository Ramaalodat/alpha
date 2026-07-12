"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.logApiRequest = exports.logDatabaseOperation = exports.logPerformance = exports.logSystemEvent = exports.logSecurityEvent = exports.logUserAction = exports.logError = exports.logWithContext = exports.logger = void 0;
const winston_1 = __importDefault(require("winston"));
const config_1 = __importDefault(require("../config/config"));
// Create logger configuration
const loggerConfig = {
    level: config_1.default.logging.level,
    format: winston_1.default.format.combine(winston_1.default.format.timestamp({
        format: 'YYYY-MM-DD HH:mm:ss.SSS'
    }), winston_1.default.format.errors({ stack: true }), winston_1.default.format.json(), winston_1.default.format.printf(({ timestamp, level, message, requestId, userId, action, ...meta }) => {
        const logObject = {
            timestamp,
            level,
            message,
            requestId,
            userId,
            action,
            ...meta
        };
        return JSON.stringify(logObject);
    })),
    defaultMeta: {
        service: 'basira-api'
    },
    transports: []
};
// Console transport for development
if (config_1.default.app.nodeEnv === 'development') {
    const transports = loggerConfig.transports;
    transports.push(new winston_1.default.transports.Console({
        format: winston_1.default.format.combine(winston_1.default.format.colorize(), winston_1.default.format.simple(), winston_1.default.format.printf(({ timestamp, level, message, requestId, userId, action, ...meta }) => {
            let logMessage = `${timestamp} [${level}]: ${message}`;
            if (requestId)
                logMessage += ` [requestId: ${requestId}]`;
            if (userId)
                logMessage += ` [userId: ${userId}]`;
            if (action)
                logMessage += ` [action: ${action}]`;
            // Add meta data if present
            const metaKeys = Object.keys(meta);
            if (metaKeys.length > 0) {
                const metaString = metaKeys
                    .map(key => `${key}: ${JSON.stringify(meta[key])}`)
                    .join(', ');
                logMessage += ` [${metaString}]`;
            }
            return logMessage;
        }))
    }));
}
// File transport for production
if (config_1.default.app.nodeEnv === 'production' || config_1.default.logging.file) {
    const transports = loggerConfig.transports;
    transports.push(new winston_1.default.transports.File({
        filename: config_1.default.logging.file,
        maxsize: parseSize(config_1.default.logging.maxSize),
        maxFiles: config_1.default.logging.maxFiles,
        format: winston_1.default.format.combine(winston_1.default.format.timestamp(), winston_1.default.format.json())
    }));
}
// Error file transport
const transports = loggerConfig.transports;
transports.push(new winston_1.default.transports.File({
    filename: 'logs/error.log',
    level: 'error',
    maxsize: parseSize(config_1.default.logging.maxSize),
    maxFiles: config_1.default.logging.maxFiles,
    format: winston_1.default.format.combine(winston_1.default.format.timestamp(), winston_1.default.format.json())
}));
// Create logger instance
exports.logger = winston_1.default.createLogger(loggerConfig);
// Helper function to parse size strings like "10m", "100k", etc.
function parseSize(size) {
    const match = size.match(/^(\d+)([kmg]?)$/i);
    if (!match)
        return 10485760; // 10MB default
    const num = parseInt(match[1], 10);
    const unit = match[2]?.toLowerCase() || '';
    switch (unit) {
        case 'k': return num * 1024;
        case 'm': return num * 1024 * 1024;
        case 'g': return num * 1024 * 1024 * 1024;
        default: return num;
    }
}
// Add custom logging methods for common patterns
const logWithContext = (level, message, context = {}) => {
    exports.logger.log(level, message, context);
};
exports.logWithContext = logWithContext;
const logError = (message, error, context = {}) => {
    const errorDetails = error instanceof Error ? {
        name: error.name,
        message: error.message,
        stack: error.stack,
    } : { error: String(error) };
    exports.logger.error(message, {
        ...context,
        error: errorDetails,
    });
};
exports.logError = logError;
const logUserAction = (action, userId, details = {}, requestId) => {
    exports.logger.info('User action performed', {
        action,
        userId,
        requestId,
        ...details,
    });
};
exports.logUserAction = logUserAction;
const logSecurityEvent = (event, details) => {
    exports.logger.warn('Security event', {
        action: 'security_event',
        event,
        ...details,
    });
};
exports.logSecurityEvent = logSecurityEvent;
const logSystemEvent = (event, details = {}) => {
    exports.logger.info('System event', {
        action: 'system_event',
        event,
        ...details,
    });
};
exports.logSystemEvent = logSystemEvent;
// Performance logging
const logPerformance = (operation, duration, context = {}) => {
    exports.logger.info('Performance metric', {
        action: 'performance',
        operation,
        duration,
        ...context,
    });
};
exports.logPerformance = logPerformance;
// Database operation logging
const logDatabaseOperation = (operation, table, duration, context = {}) => {
    exports.logger.debug('Database operation', {
        action: 'database',
        operation,
        table,
        duration,
        ...context,
    });
};
exports.logDatabaseOperation = logDatabaseOperation;
// API request/response logging
const logApiRequest = (method, path, statusCode, duration, context = {}) => {
    const level = statusCode >= 400 ? 'warn' : 'info';
    exports.logger.log(level, 'API request', {
        action: 'api_request',
        method,
        path,
        statusCode,
        duration,
        ...context,
    });
};
exports.logApiRequest = logApiRequest;
// Structured logging for different environments
if (config_1.default.app.nodeEnv === 'test') {
    // Suppress logs during testing unless LOG_LEVEL is explicitly set
    if (!process.env.LOG_LEVEL) {
        exports.logger.level = 'error';
    }
}
exports.default = exports.logger;
//# sourceMappingURL=logger.js.map