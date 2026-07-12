import { FastifyRequest, FastifyReply } from 'fastify';
/**
 * Input Sanitization Middleware
 * Removes potentially harmful content from user inputs
 */
export declare const sanitizeInput: (request: FastifyRequest, reply: FastifyReply) => Promise<void>;
/**
 * Check for SQL Injection attempts
 */
export declare const detectSqlInjection: (input: string) => boolean;
/**
 * Check for XSS attempts
 */
export declare const detectXss: (input: string) => boolean;
/**
 * Detect malicious input patterns
 */
export declare const detectMaliciousInput: (request: FastifyRequest, reply: FastifyReply) => Promise<void>;
/**
 * Validate Content-Type header
 */
export declare const validateContentType: (request: FastifyRequest, reply: FastifyReply) => Promise<void>;
/**
 * Prevent parameter pollution
 */
export declare const preventParameterPollution: (request: FastifyRequest, reply: FastifyReply) => Promise<void>;
/**
 * Check request size to prevent DoS
 */
export declare const checkRequestSize: (request: FastifyRequest, reply: FastifyReply) => Promise<void>;
/**
 * Comprehensive security middleware
 * Combines all security checks
 */
export declare const securityMiddleware: (request: FastifyRequest, reply: FastifyReply) => Promise<void>;
//# sourceMappingURL=sanitization.middleware.d.ts.map