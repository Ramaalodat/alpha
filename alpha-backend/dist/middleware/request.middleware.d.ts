import { FastifyRequest, FastifyReply } from 'fastify';
/**
 * Add request ID to each request
 */
export declare const requestIdMiddleware: (request: FastifyRequest, reply: FastifyReply) => Promise<void>;
/**
 * Log all incoming requests
 */
export declare const requestLogger: (request: FastifyRequest, reply: FastifyReply) => Promise<void>;
/**
 * Add security headers
 */
export declare const securityHeaders: (request: FastifyRequest, reply: FastifyReply) => Promise<void>;
/**
 * CORS headers for development
 */
export declare const corsMiddleware: (request: FastifyRequest, reply: FastifyReply) => Promise<undefined>;
//# sourceMappingURL=request.middleware.d.ts.map