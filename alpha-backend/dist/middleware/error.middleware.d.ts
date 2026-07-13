import { FastifyError, FastifyReply, FastifyRequest } from 'fastify';
/**
 * Global error handler
 */
export declare const errorHandler: (error: FastifyError, request: FastifyRequest, reply: FastifyReply) => FastifyReply<import("fastify").RawServerDefault, import("http").IncomingMessage, import("http").ServerResponse<import("http").IncomingMessage>, import("fastify").RouteGenericInterface, unknown, import("fastify").FastifySchema, import("fastify").FastifyTypeProviderDefault, unknown>;
/**
 * Handle 404 routes
 */
export declare const notFoundHandler: (request: FastifyRequest, reply: FastifyReply) => FastifyReply<import("fastify").RawServerDefault, import("http").IncomingMessage, import("http").ServerResponse<import("http").IncomingMessage>, import("fastify").RouteGenericInterface, unknown, import("fastify").FastifySchema, import("fastify").FastifyTypeProviderDefault, unknown>;
//# sourceMappingURL=error.middleware.d.ts.map