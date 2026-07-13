"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.notFoundHandler = exports.errorHandler = void 0;
const api_types_1 = require("../types/api.types");
const constants_1 = require("../utils/constants");
const logger_1 = __importDefault(require("../utils/logger"));
/**
 * Global error handler
 */
const errorHandler = (error, request, reply) => {
    // Log error
    logger_1.default.error('Request error', {
        error: error.message,
        stack: error.stack,
        url: request.url,
        method: request.method,
        statusCode: error.statusCode,
        userId: request.user?.userId,
    });
    // Handle Fastify validation errors
    if (error.validation) {
        return reply
            .status(constants_1.HTTP_STATUS.BAD_REQUEST)
            .send((0, api_types_1.createErrorResponse)(api_types_1.ErrorCodes.VALIDATION_ERROR, 'خطأ في البيانات المدخلة', { validation: error.validation }));
    }
    // Handle 404 Not Found
    if (error.statusCode === 404) {
        return reply
            .status(constants_1.HTTP_STATUS.NOT_FOUND)
            .send((0, api_types_1.createErrorResponse)(api_types_1.ErrorCodes.NOT_FOUND, 'الصفحة أو المورد غير موجود'));
    }
    // Handle rate limit errors
    if (error.statusCode === 429) {
        return reply
            .status(constants_1.HTTP_STATUS.TOO_MANY_REQUESTS)
            .send((0, api_types_1.createErrorResponse)(api_types_1.ErrorCodes.RATE_LIMIT_EXCEEDED, 'تم تجاوز الحد المسموح من الطلبات. حاول مرة أخرى لاحقاً'));
    }
    // Handle payload too large
    if (error.statusCode === 413) {
        return reply
            .status(constants_1.HTTP_STATUS.BAD_REQUEST)
            .send((0, api_types_1.createErrorResponse)(api_types_1.ErrorCodes.VALIDATION_ERROR, 'حجم البيانات المرسلة كبير جداً'));
    }
    // Handle database errors
    if (error.message.includes('Prisma') || error.message.includes('database')) {
        logger_1.default.error('Database error', { error: error.message });
        return reply
            .status(constants_1.HTTP_STATUS.INTERNAL_SERVER_ERROR)
            .send((0, api_types_1.createErrorResponse)(api_types_1.ErrorCodes.DATABASE_ERROR, 'حدث خطأ في قاعدة البيانات'));
    }
    // Default internal server error
    return reply
        .status(error.statusCode || constants_1.HTTP_STATUS.INTERNAL_SERVER_ERROR)
        .send((0, api_types_1.createErrorResponse)(api_types_1.ErrorCodes.INTERNAL_ERROR, process.env.NODE_ENV === 'production'
        ? 'حدث خطأ في النظام'
        : error.message, process.env.NODE_ENV === 'development' ? { stack: error.stack } : undefined));
};
exports.errorHandler = errorHandler;
/**
 * Handle 404 routes
 */
const notFoundHandler = (request, reply) => {
    logger_1.default.warn('Route not found', {
        url: request.url,
        method: request.method,
    });
    return reply
        .status(constants_1.HTTP_STATUS.NOT_FOUND)
        .send((0, api_types_1.createErrorResponse)(api_types_1.ErrorCodes.NOT_FOUND, 'الصفحة أو المورد غير موجود'));
};
exports.notFoundHandler = notFoundHandler;
//# sourceMappingURL=error.middleware.js.map