"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.extractRequestMetadata = exports.optionalAuth = exports.requireVerified = exports.requireOnboarding = exports.authenticate = void 0;
const auth_service_1 = require("../services/auth.service");
const api_types_1 = require("../types/api.types");
const constants_1 = require("../utils/constants");
const logger_1 = __importDefault(require("../utils/logger"));
/**
 * Middleware to authenticate JWT token
 */
const authenticate = async (request, reply) => {
    try {
        // Get token from Authorization header
        const authHeader = request.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            logger_1.default.warn('Authentication failed - no token provided', {
                path: request.url,
                method: request.method,
            });
            return reply
                .status(constants_1.HTTP_STATUS.UNAUTHORIZED)
                .send((0, api_types_1.createErrorResponse)(api_types_1.ErrorCodes.UNAUTHORIZED, 'رمز التحقق مطلوب'));
        }
        const token = authHeader.substring(7); // Remove 'Bearer ' prefix
        // Verify token
        const decoded = auth_service_1.authService.verifyAccessToken(token);
        // Attach user to request
        request.user = {
            userId: decoded.userId,
            phoneNumber: decoded.phoneNumber,
            fullName: decoded.fullName,
            status: decoded.status,
            isOnboarded: decoded.isOnboarded,
        };
        logger_1.default.debug('User authenticated', {
            userId: decoded.userId,
            path: request.url,
        });
    }
    catch (error) {
        logger_1.default.warn('Authentication failed', {
            error: error.message,
            code: error.code,
            path: request.url,
        });
        const statusCode = error.code === api_types_1.ErrorCodes.TOKEN_EXPIRED
            ? constants_1.HTTP_STATUS.UNAUTHORIZED
            : constants_1.HTTP_STATUS.UNAUTHORIZED;
        return reply
            .status(statusCode)
            .send((0, api_types_1.createErrorResponse)(error.code || api_types_1.ErrorCodes.UNAUTHORIZED, error.message || constants_1.ERROR_MESSAGES.INVALID_CREDENTIALS));
    }
};
exports.authenticate = authenticate;
/**
 * Middleware to check if user has completed onboarding
 */
const requireOnboarding = async (request, reply) => {
    if (!request.user) {
        return reply
            .status(constants_1.HTTP_STATUS.UNAUTHORIZED)
            .send((0, api_types_1.createErrorResponse)(api_types_1.ErrorCodes.UNAUTHORIZED, 'رمز التحقق مطلوب'));
    }
    if (!request.user.isOnboarded) {
        logger_1.default.warn('Onboarding required', {
            userId: request.user.userId,
            path: request.url,
        });
        return reply
            .status(constants_1.HTTP_STATUS.FORBIDDEN)
            .send((0, api_types_1.createErrorResponse)(api_types_1.ErrorCodes.ONBOARDING_INCOMPLETE, constants_1.ERROR_MESSAGES.ONBOARDING_INCOMPLETE));
    }
};
exports.requireOnboarding = requireOnboarding;
/**
 * Middleware to check if user account is verified
 */
const requireVerified = async (request, reply) => {
    if (!request.user) {
        return reply
            .status(constants_1.HTTP_STATUS.UNAUTHORIZED)
            .send((0, api_types_1.createErrorResponse)(api_types_1.ErrorCodes.UNAUTHORIZED, 'رمز التحقق مطلوب'));
    }
    if (request.user.status === 'PENDING_VERIFICATION') {
        logger_1.default.warn('Account verification required', {
            userId: request.user.userId,
            path: request.url,
        });
        return reply
            .status(constants_1.HTTP_STATUS.FORBIDDEN)
            .send((0, api_types_1.createErrorResponse)(api_types_1.ErrorCodes.ACCOUNT_NOT_VERIFIED, constants_1.ERROR_MESSAGES.ACCOUNT_NOT_VERIFIED));
    }
    if (request.user.status === 'SUSPENDED') {
        logger_1.default.warn('Account suspended', {
            userId: request.user.userId,
            path: request.url,
        });
        return reply
            .status(constants_1.HTTP_STATUS.FORBIDDEN)
            .send((0, api_types_1.createErrorResponse)(api_types_1.ErrorCodes.ACCOUNT_SUSPENDED, constants_1.ERROR_MESSAGES.ACCOUNT_SUSPENDED));
    }
};
exports.requireVerified = requireVerified;
/**
 * Optional authentication - attaches user if token is present but doesn't fail if absent
 */
const optionalAuth = async (request, reply) => {
    try {
        const authHeader = request.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return; // No token, continue without user
        }
        const token = authHeader.substring(7);
        const decoded = auth_service_1.authService.verifyAccessToken(token);
        request.user = {
            userId: decoded.userId,
            phoneNumber: decoded.phoneNumber,
            fullName: decoded.fullName,
            status: decoded.status,
            isOnboarded: decoded.isOnboarded,
        };
        logger_1.default.debug('Optional auth - user authenticated', {
            userId: decoded.userId,
        });
    }
    catch (error) {
        // Token invalid but don't fail the request
        logger_1.default.debug('Optional auth - token invalid, continuing without user');
    }
};
exports.optionalAuth = optionalAuth;
/**
 * Extract request metadata for logging and audit
 */
const extractRequestMetadata = (request) => {
    return {
        ipAddress: request.ip,
        userAgent: request.headers['user-agent'] || 'unknown',
        method: request.method,
        url: request.url,
        requestId: request.id,
    };
};
exports.extractRequestMetadata = extractRequestMetadata;
//# sourceMappingURL=auth.middleware.js.map