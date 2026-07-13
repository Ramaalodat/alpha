"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.securityMiddleware = exports.checkRequestSize = exports.preventParameterPollution = exports.validateContentType = exports.detectMaliciousInput = exports.detectXss = exports.detectSqlInjection = exports.sanitizeInput = void 0;
const security_config_1 = require("../config/security.config");
const logger_1 = __importDefault(require("../utils/logger"));
/**
 * Sanitize all string inputs in request body recursively
 */
const sanitizeObject = (obj) => {
    if (obj === null || obj === undefined) {
        return obj;
    }
    if (typeof obj === 'string') {
        return security_config_1.sanitizationRules.sanitizeText(obj);
    }
    if (Array.isArray(obj)) {
        return obj.map(item => sanitizeObject(item));
    }
    if (typeof obj === 'object') {
        const sanitized = {};
        for (const [key, value] of Object.entries(obj)) {
            sanitized[key] = sanitizeObject(value);
        }
        return sanitized;
    }
    return obj;
};
/**
 * Input Sanitization Middleware
 * Removes potentially harmful content from user inputs
 */
const sanitizeInput = async (request, reply) => {
    try {
        // Sanitize body
        if (request.body && typeof request.body === 'object') {
            request.body = sanitizeObject(request.body);
        }
        // Sanitize query parameters
        if (request.query && typeof request.query === 'object') {
            request.query = sanitizeObject(request.query);
        }
        // Sanitize params
        if (request.params && typeof request.params === 'object') {
            request.params = sanitizeObject(request.params);
        }
        logger_1.default.debug('Input sanitization completed', {
            url: request.url,
            method: request.method,
        });
    }
    catch (error) {
        logger_1.default.error('Input sanitization failed', {
            error: error instanceof Error ? error.message : 'Unknown error',
            url: request.url,
        });
        // Continue even if sanitization fails
    }
};
exports.sanitizeInput = sanitizeInput;
/**
 * Check for SQL Injection attempts
 */
const detectSqlInjection = (input) => {
    const sqlPatterns = [
        /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|EXECUTE)\b.*\b(FROM|INTO|WHERE|SET)\b)/gi,
        /(;|--|\/\*|\*\/|xp_|sp_)/gi,
        /(UNION.*SELECT|SELECT.*FROM|INSERT.*INTO|UPDATE.*SET|DELETE.*FROM)/gi,
        /(\bOR\b.*=.*\bOR\b|\bAND\b.*=.*\bAND\b)/gi,
    ];
    return sqlPatterns.some(pattern => pattern.test(input));
};
exports.detectSqlInjection = detectSqlInjection;
/**
 * Check for XSS attempts
 */
const detectXss = (input) => {
    const xssPatterns = [
        /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
        /javascript:/gi,
        /on\w+\s*=/gi,
        /<iframe/gi,
        /<object/gi,
        /<embed/gi,
        /eval\(/gi,
        /expression\(/gi,
    ];
    return xssPatterns.some(pattern => pattern.test(input));
};
exports.detectXss = detectXss;
/**
 * Detect malicious input patterns
 */
const detectMaliciousInput = async (request, reply) => {
    const checkValue = (value, path) => {
        if (typeof value === 'string') {
            if ((0, exports.detectSqlInjection)(value)) {
                logger_1.default.warn('SQL injection attempt detected', {
                    path,
                    value: value.substring(0, 100),
                    ip: request.ip,
                    userAgent: request.headers['user-agent'],
                });
                return true;
            }
            if ((0, exports.detectXss)(value)) {
                logger_1.default.warn('XSS attempt detected', {
                    path,
                    value: value.substring(0, 100),
                    ip: request.ip,
                    userAgent: request.headers['user-agent'],
                });
                return true;
            }
        }
        if (Array.isArray(value)) {
            return value.some((item, index) => checkValue(item, `${path}[${index}]`));
        }
        if (typeof value === 'object' && value !== null) {
            return Object.entries(value).some(([key, val]) => checkValue(val, `${path}.${key}`));
        }
        return false;
    };
    let maliciousDetected = false;
    // Check body
    if (request.body) {
        maliciousDetected = checkValue(request.body, 'body');
    }
    // Check query
    if (!maliciousDetected && request.query) {
        maliciousDetected = checkValue(request.query, 'query');
    }
    // Check params
    if (!maliciousDetected && request.params) {
        maliciousDetected = checkValue(request.params, 'params');
    }
    if (maliciousDetected) {
        return reply.status(400).send({
            success: false,
            error: {
                code: 'MALICIOUS_INPUT_DETECTED',
                message: 'تم رصد محتوى مشبوه في الطلب',
            },
        });
    }
};
exports.detectMaliciousInput = detectMaliciousInput;
/**
 * Validate Content-Type header
 */
const validateContentType = async (request, reply) => {
    const method = request.method;
    const contentType = request.headers['content-type'];
    // Only check for POST, PUT, PATCH requests
    if (['POST', 'PUT', 'PATCH'].includes(method)) {
        if (!contentType || !contentType.includes('application/json')) {
            logger_1.default.warn('Invalid content-type', {
                method,
                url: request.url,
                contentType,
            });
            return reply.status(415).send({
                success: false,
                error: {
                    code: 'UNSUPPORTED_MEDIA_TYPE',
                    message: 'يجب أن يكون Content-Type: application/json',
                },
            });
        }
    }
};
exports.validateContentType = validateContentType;
/**
 * Prevent parameter pollution
 */
const preventParameterPollution = async (request, reply) => {
    const query = request.query;
    for (const [key, value] of Object.entries(query)) {
        // If parameter appears multiple times, only keep the first occurrence
        if (Array.isArray(value)) {
            logger_1.default.warn('Parameter pollution attempt detected', {
                parameter: key,
                values: value,
                ip: request.ip,
            });
            // Keep only the first value
            query[key] = value[0];
        }
    }
    request.query = query;
};
exports.preventParameterPollution = preventParameterPollution;
/**
 * Check request size to prevent DoS
 */
const checkRequestSize = async (request, reply) => {
    const contentLength = request.headers['content-length'];
    if (contentLength) {
        const size = parseInt(contentLength, 10);
        const maxSize = 1024 * 1024; // 1MB
        if (size > maxSize) {
            logger_1.default.warn('Request too large', {
                size,
                maxSize,
                ip: request.ip,
            });
            return reply.status(413).send({
                success: false,
                error: {
                    code: 'PAYLOAD_TOO_LARGE',
                    message: 'حجم الطلب كبير جداً',
                },
            });
        }
    }
};
exports.checkRequestSize = checkRequestSize;
/**
 * Comprehensive security middleware
 * Combines all security checks
 */
const securityMiddleware = async (request, reply) => {
    // Skip for health check
    if (request.url === '/health') {
        return;
    }
    try {
        // Check request size
        await (0, exports.checkRequestSize)(request, reply);
        if (reply.sent)
            return;
        // Validate content type
        await (0, exports.validateContentType)(request, reply);
        if (reply.sent)
            return;
        // Prevent parameter pollution
        await (0, exports.preventParameterPollution)(request, reply);
        // Detect malicious input
        await (0, exports.detectMaliciousInput)(request, reply);
        if (reply.sent)
            return;
        // Sanitize input
        await (0, exports.sanitizeInput)(request, reply);
    }
    catch (error) {
        logger_1.default.error('Security middleware error', {
            error: error instanceof Error ? error.message : 'Unknown error',
            url: request.url,
        });
    }
};
exports.securityMiddleware = securityMiddleware;
//# sourceMappingURL=sanitization.middleware.js.map