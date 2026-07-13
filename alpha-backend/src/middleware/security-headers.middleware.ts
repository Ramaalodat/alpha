import { FastifyRequest, FastifyReply } from 'fastify';
import { securityHeaders } from '../config/security.config';
import config from '../config/config';

/**
 * Add security headers to all responses
 */
export const addSecurityHeaders = async (
  request: FastifyRequest,
  reply: FastifyReply
): Promise<void> => {
  // Add all security headers
  Object.entries(securityHeaders).forEach(([header, value]) => {
    reply.header(header, value);
  });

  // Add custom headers
  reply.header('X-API-Version', 'v1');
  reply.header('X-Powered-By', 'BASIRA');

  // Add CORS headers if origin is present
  const origin = request.headers.origin;
  if (origin) {
    const allowedOrigins = config.security.corsOrigin;
    if (allowedOrigins === '*' || allowedOrigins.includes(origin)) {
      reply.header('Access-Control-Allow-Origin', origin);
      reply.header('Access-Control-Allow-Credentials', 'true');
    }
  }
};

/**
 * Enforce HTTPS in production
 */
export const enforceHttps = async (
  request: FastifyRequest,
  reply: FastifyReply
): Promise<void> => {
  // Skip in development
  if (config.app.nodeEnv !== 'production') {
    return;
  }

  // Check if request is secure
  const isSecure = request.protocol === 'https' || 
                   request.headers['x-forwarded-proto'] === 'https';

  if (!isSecure) {
    const host = request.headers.host || config.app.host;
    const secureUrl = `https://${host}${request.url}`;

    return reply.redirect(301, secureUrl);
  }
};

/**
 * Add request timing header
 */
export const addTimingHeader = async (
  request: FastifyRequest,
  reply: FastifyReply
): Promise<void> => {
  const startTime = Date.now();

  // Store start time in request
  (request as any).startTime = startTime;
};

/**
 * Calculate and add timing header (call in onResponse hook)
 */
export const calculateResponseTime = (request: FastifyRequest, reply: FastifyReply): void => {
  const startTime = (request as any).startTime;
  if (startTime) {
    const duration = Date.now() - startTime;
    reply.header('X-Response-Time', `${duration}ms`);
  }
};

/**
 * Hide sensitive error details in production
 */
export const sanitizeErrors = (error: any): any => {
  if (config.app.nodeEnv === 'production') {
    // Remove stack trace
    delete error.stack;
    
    // Remove sensitive details
    if (error.details) {
      delete error.details.stack;
      delete error.details.password;
      delete error.details.token;
      delete error.details.secret;
    }
  }

  return error;
};
