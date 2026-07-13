import { FastifyRequest, FastifyReply } from 'fastify';
import { authService } from '../services/auth.service';
import { ErrorCodes, createErrorResponse } from '../types/api.types';
import { ERROR_MESSAGES, HTTP_STATUS } from '../utils/constants';
import logger from '../utils/logger';

/**
 * Middleware to authenticate JWT token
 */
export const authenticate = async (
  request: FastifyRequest,
  reply: FastifyReply
): Promise<void> => {
  try {
    // Get token from Authorization header
    const authHeader = request.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      logger.warn('Authentication failed - no token provided', {
        path: request.url,
        method: request.method,
      });

      return reply
        .status(HTTP_STATUS.UNAUTHORIZED)
        .send(createErrorResponse(
          ErrorCodes.UNAUTHORIZED,
          'رمز التحقق مطلوب'
        ));
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    // Verify token
    const decoded = authService.verifyAccessToken(token);

    // Attach user to request
    request.user = {
      userId: decoded.userId,
      phoneNumber: decoded.phoneNumber,
      fullName: decoded.fullName,
      status: decoded.status,
      isOnboarded: decoded.isOnboarded,
    };

    logger.debug('User authenticated', {
      userId: decoded.userId,
      path: request.url,
    });
  } catch (error: any) {
    logger.warn('Authentication failed', {
      error: error.message,
      code: error.code,
      path: request.url,
    });

    const statusCode = error.code === ErrorCodes.TOKEN_EXPIRED
      ? HTTP_STATUS.UNAUTHORIZED
      : HTTP_STATUS.UNAUTHORIZED;

    return reply
      .status(statusCode)
      .send(createErrorResponse(
        error.code || ErrorCodes.UNAUTHORIZED,
        error.message || ERROR_MESSAGES.INVALID_CREDENTIALS
      ));
  }
};

/**
 * Middleware to check if user has completed onboarding
 */
export const requireOnboarding = async (
  request: FastifyRequest,
  reply: FastifyReply
): Promise<void> => {
  if (!request.user) {
    return reply
      .status(HTTP_STATUS.UNAUTHORIZED)
      .send(createErrorResponse(
        ErrorCodes.UNAUTHORIZED,
        'رمز التحقق مطلوب'
      ));
  }

  if (!request.user.isOnboarded) {
    logger.warn('Onboarding required', {
      userId: request.user.userId,
      path: request.url,
    });

    return reply
      .status(HTTP_STATUS.FORBIDDEN)
      .send(createErrorResponse(
        ErrorCodes.ONBOARDING_INCOMPLETE,
        ERROR_MESSAGES.ONBOARDING_INCOMPLETE
      ));
  }
};

/**
 * Middleware to check if user account is verified
 */
export const requireVerified = async (
  request: FastifyRequest,
  reply: FastifyReply
): Promise<void> => {
  if (!request.user) {
    return reply
      .status(HTTP_STATUS.UNAUTHORIZED)
      .send(createErrorResponse(
        ErrorCodes.UNAUTHORIZED,
        'رمز التحقق مطلوب'
      ));
  }

  if (request.user.status === 'PENDING_VERIFICATION') {
    logger.warn('Account verification required', {
      userId: request.user.userId,
      path: request.url,
    });

    return reply
      .status(HTTP_STATUS.FORBIDDEN)
      .send(createErrorResponse(
        ErrorCodes.ACCOUNT_NOT_VERIFIED,
        ERROR_MESSAGES.ACCOUNT_NOT_VERIFIED
      ));
  }

  if (request.user.status === 'SUSPENDED') {
    logger.warn('Account suspended', {
      userId: request.user.userId,
      path: request.url,
    });

    return reply
      .status(HTTP_STATUS.FORBIDDEN)
      .send(createErrorResponse(
        ErrorCodes.ACCOUNT_SUSPENDED,
        ERROR_MESSAGES.ACCOUNT_SUSPENDED
      ));
  }
};

/**
 * Optional authentication - attaches user if token is present but doesn't fail if absent
 */
export const optionalAuth = async (
  request: FastifyRequest,
  reply: FastifyReply
): Promise<void> => {
  try {
    const authHeader = request.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return; // No token, continue without user
    }

    const token = authHeader.substring(7);
    const decoded = authService.verifyAccessToken(token);

    request.user = {
      userId: decoded.userId,
      phoneNumber: decoded.phoneNumber,
      fullName: decoded.fullName,
      status: decoded.status,
      isOnboarded: decoded.isOnboarded,
    };

    logger.debug('Optional auth - user authenticated', {
      userId: decoded.userId,
    });
  } catch (error) {
    // Token invalid but don't fail the request
    logger.debug('Optional auth - token invalid, continuing without user');
  }
};

/**
 * Extract request metadata for logging and audit
 */
export const extractRequestMetadata = (request: FastifyRequest) => {
  return {
    ipAddress: request.ip,
    userAgent: request.headers['user-agent'] || 'unknown',
    method: request.method,
    url: request.url,
    requestId: request.id,
  };
};
