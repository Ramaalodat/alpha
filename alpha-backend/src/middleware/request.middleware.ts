import { FastifyRequest, FastifyReply } from 'fastify';
import { randomUUID } from 'crypto';
import logger from '../utils/logger';

/**
 * Add request ID to each request
 */
export const requestIdMiddleware = async (
  request: FastifyRequest,
  reply: FastifyReply
) => {
  const requestId = request.headers['x-request-id'] as string || randomUUID();
  request.id = requestId;
  reply.header('X-Request-ID', requestId);
};

/**
 * Log all incoming requests
 */
export const requestLogger = async (
  request: FastifyRequest,
  reply: FastifyReply
) => {
  const start = Date.now();

  // Log request
  logger.info('Incoming request', {
    requestId: request.id,
    method: request.method,
    url: request.url,
    ip: request.ip,
    userAgent: request.headers['user-agent'],
    userId: (request.user as any)?.userId,
  });

  // Store start time for response logging
  (request as any).startTime = start;
};

/**
 * Add security headers
 */
export const securityHeaders = async (
  request: FastifyRequest,
  reply: FastifyReply
) => {
  reply.headers({
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block',
    'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
  });
};

/**
 * CORS headers for development
 */
export const corsMiddleware = async (
  request: FastifyRequest,
  reply: FastifyReply
) => {
  const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'];
  const origin = request.headers.origin;

  if (origin && allowedOrigins.includes(origin)) {
    reply.header('Access-Control-Allow-Origin', origin);
    reply.header('Access-Control-Allow-Credentials', 'true');
    reply.header('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
    reply.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Request-ID');
  }

  // Handle preflight
  if (request.method === 'OPTIONS') {
    return reply.status(204).send();
  }
};
