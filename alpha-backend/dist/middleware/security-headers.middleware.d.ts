import { FastifyRequest, FastifyReply } from 'fastify';
/**
 * Add security headers to all responses
 */
export declare const addSecurityHeaders: (request: FastifyRequest, reply: FastifyReply) => Promise<void>;
/**
 * Enforce HTTPS in production
 */
export declare const enforceHttps: (request: FastifyRequest, reply: FastifyReply) => Promise<void>;
/**
 * Add request timing header
 */
export declare const addTimingHeader: (request: FastifyRequest, reply: FastifyReply) => Promise<void>;
/**
 * Hide sensitive error details in production
 */
export declare const sanitizeErrors: (error: any) => any;
//# sourceMappingURL=security-headers.middleware.d.ts.map