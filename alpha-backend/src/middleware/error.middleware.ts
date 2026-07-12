import { FastifyError, FastifyReply, FastifyRequest } from 'fastify';
import { createErrorResponse, ErrorCodes } from '../types/api.types';
import { HTTP_STATUS } from '../utils/constants';
import logger from '../utils/logger';

/**
 * Global error handler
 */
export const errorHandler = (
  error: FastifyError,
  request: FastifyRequest,
  reply: FastifyReply
) => {
  // Log error
  logger.error('Request error', {
    error: error.message,
    stack: error.stack,
    url: request.url,
    method: request.method,
    statusCode: error.statusCode,
    userId: (request.user as any)?.userId,
  });

  // Handle Fastify validation errors
  if (error.validation) {
    return reply
      .status(HTTP_STATUS.BAD_REQUEST)
      .send(createErrorResponse(
        ErrorCodes.VALIDATION_ERROR,
        'خطأ في البيانات المدخلة',
        { validation: error.validation }
      ));
  }

  // Handle 404 Not Found
  if (error.statusCode === 404) {
    return reply
      .status(HTTP_STATUS.NOT_FOUND)
      .send(createErrorResponse(
        ErrorCodes.NOT_FOUND,
        'الصفحة أو المورد غير موجود'
      ));
  }

  // Handle rate limit errors
  if (error.statusCode === 429) {
    return reply
      .status(HTTP_STATUS.TOO_MANY_REQUESTS)
      .send(createErrorResponse(
        ErrorCodes.RATE_LIMIT_EXCEEDED,
        'تم تجاوز الحد المسموح من الطلبات. حاول مرة أخرى لاحقاً'
      ));
  }

  // Handle payload too large
  if (error.statusCode === 413) {
    return reply
      .status(HTTP_STATUS.BAD_REQUEST)
      .send(createErrorResponse(
        ErrorCodes.VALIDATION_ERROR,
        'حجم البيانات المرسلة كبير جداً'
      ));
  }

  // Handle database errors
  if (error.message.includes('Prisma') || error.message.includes('database')) {
    logger.error('Database error', { error: error.message });
    return reply
      .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
      .send(createErrorResponse(
        ErrorCodes.DATABASE_ERROR,
        'حدث خطأ في قاعدة البيانات'
      ));
  }

  // Default internal server error
  return reply
    .status(error.statusCode || HTTP_STATUS.INTERNAL_SERVER_ERROR)
    .send(createErrorResponse(
      ErrorCodes.INTERNAL_ERROR,
      process.env.NODE_ENV === 'production'
        ? 'حدث خطأ في النظام'
        : error.message,
      process.env.NODE_ENV === 'development' ? { stack: error.stack } : undefined
    ));
};

/**
 * Handle 404 routes
 */
export const notFoundHandler = (request: FastifyRequest, reply: FastifyReply) => {
  logger.warn('Route not found', {
    url: request.url,
    method: request.method,
  });

  return reply
    .status(HTTP_STATUS.NOT_FOUND)
    .send(createErrorResponse(
      ErrorCodes.NOT_FOUND,
      'الصفحة أو المورد غير موجود'
    ));
};
