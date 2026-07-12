import { FastifyRequest, FastifyReply } from 'fastify';
import { sanitizationRules } from '../config/security.config';
import logger from '../utils/logger';

/**
 * Sanitize all string inputs in request body recursively
 */
const sanitizeObject = (obj: any): any => {
  if (obj === null || obj === undefined) {
    return obj;
  }

  if (typeof obj === 'string') {
    return sanitizationRules.sanitizeText(obj);
  }

  if (Array.isArray(obj)) {
    return obj.map(item => sanitizeObject(item));
  }

  if (typeof obj === 'object') {
    const sanitized: any = {};
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
export const sanitizeInput = async (
  request: FastifyRequest,
  reply: FastifyReply
): Promise<void> => {
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

    logger.debug('Input sanitization completed', {
      url: request.url,
      method: request.method,
    });
  } catch (error) {
    logger.error('Input sanitization failed', {
      error: error instanceof Error ? error.message : 'Unknown error',
      url: request.url,
    });
    // Continue even if sanitization fails
  }
};

/**
 * Check for SQL Injection attempts
 */
export const detectSqlInjection = (input: string): boolean => {
  const sqlPatterns = [
    /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|EXECUTE)\b.*\b(FROM|INTO|WHERE|SET)\b)/gi,
    /(;|--|\/\*|\*\/|xp_|sp_)/gi,
    /(UNION.*SELECT|SELECT.*FROM|INSERT.*INTO|UPDATE.*SET|DELETE.*FROM)/gi,
    /(\bOR\b.*=.*\bOR\b|\bAND\b.*=.*\bAND\b)/gi,
  ];

  return sqlPatterns.some(pattern => pattern.test(input));
};

/**
 * Check for XSS attempts
 */
export const detectXss = (input: string): boolean => {
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

/**
 * Detect malicious input patterns
 */
export const detectMaliciousInput = async (
  request: FastifyRequest,
  reply: FastifyReply
): Promise<void> => {
  const checkValue = (value: any, path: string): boolean => {
    if (typeof value === 'string') {
      if (detectSqlInjection(value)) {
        logger.warn('SQL injection attempt detected', {
          path,
          value: value.substring(0, 100),
          ip: request.ip,
          userAgent: request.headers['user-agent'],
        });
        return true;
      }

      if (detectXss(value)) {
        logger.warn('XSS attempt detected', {
          path,
          value: value.substring(0, 100),
          ip: request.ip,
          userAgent: request.headers['user-agent'],
        });
        return true;
      }
    }

    if (Array.isArray(value)) {
      return value.some((item, index) => 
        checkValue(item, `${path}[${index}]`)
      );
    }

    if (typeof value === 'object' && value !== null) {
      return Object.entries(value).some(([key, val]) => 
        checkValue(val, `${path}.${key}`)
      );
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

/**
 * Validate Content-Type header
 */
export const validateContentType = async (
  request: FastifyRequest,
  reply: FastifyReply
): Promise<void> => {
  const method = request.method;
  const contentType = request.headers['content-type'];

  // Only check for POST, PUT, PATCH requests
  if (['POST', 'PUT', 'PATCH'].includes(method)) {
    if (!contentType || !contentType.includes('application/json')) {
      logger.warn('Invalid content-type', {
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

/**
 * Prevent parameter pollution
 */
export const preventParameterPollution = async (
  request: FastifyRequest,
  reply: FastifyReply
): Promise<void> => {
  const query = request.query as Record<string, any>;

  for (const [key, value] of Object.entries(query)) {
    // If parameter appears multiple times, only keep the first occurrence
    if (Array.isArray(value)) {
      logger.warn('Parameter pollution attempt detected', {
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

/**
 * Check request size to prevent DoS
 */
export const checkRequestSize = async (
  request: FastifyRequest,
  reply: FastifyReply
): Promise<void> => {
  const contentLength = request.headers['content-length'];

  if (contentLength) {
    const size = parseInt(contentLength, 10);
    const maxSize = 1024 * 1024; // 1MB

    if (size > maxSize) {
      logger.warn('Request too large', {
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

/**
 * Comprehensive security middleware
 * Combines all security checks
 */
export const securityMiddleware = async (
  request: FastifyRequest,
  reply: FastifyReply
): Promise<void> => {
  // Skip for health check
  if (request.url === '/health') {
    return;
  }

  try {
    // Check request size
    await checkRequestSize(request, reply);
    if (reply.sent) return;

    // Validate content type
    await validateContentType(request, reply);
    if (reply.sent) return;

    // Prevent parameter pollution
    await preventParameterPollution(request, reply);

    // Detect malicious input
    await detectMaliciousInput(request, reply);
    if (reply.sent) return;

    // Sanitize input
    await sanitizeInput(request, reply);
  } catch (error) {
    logger.error('Security middleware error', {
      error: error instanceof Error ? error.message : 'Unknown error',
      url: request.url,
    });
  }
};
