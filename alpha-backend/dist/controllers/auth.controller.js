"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authController = exports.AuthController = void 0;
const auth_service_1 = require("../services/auth.service");
const otp_service_1 = require("../services/otp.service");
const api_types_1 = require("../types/api.types");
const constants_1 = require("../utils/constants");
const auth_middleware_1 = require("../middleware/auth.middleware");
const logger_1 = __importDefault(require("../utils/logger"));
class AuthController {
    /**
     * Register new user
     * POST /api/auth/register
     */
    async register(request, reply) {
        try {
            const body = request.body;
            const metadata = (0, auth_middleware_1.extractRequestMetadata)(request);
            const result = await auth_service_1.authService.register({
                ...body,
                ipAddress: metadata.ipAddress,
                userAgent: metadata.userAgent,
            });
            logger_1.default.info('User registration successful', {
                userId: result.user.id,
                phoneNumber: result.user.phoneNumber,
            });
            return reply
                .status(constants_1.HTTP_STATUS.CREATED)
                .send((0, api_types_1.createSuccessResponse)(result, result.message));
        }
        catch (error) {
            logger_1.default.error('Registration failed', { error: error.message, code: error.code });
            const statusCode = error.code === api_types_1.ErrorCodes.PHONE_NUMBER_EXISTS
                ? constants_1.HTTP_STATUS.CONFLICT
                : constants_1.HTTP_STATUS.BAD_REQUEST;
            return reply
                .status(statusCode)
                .send((0, api_types_1.createErrorResponse)(error.code, error.message, error.details));
        }
    }
    /**
     * Verify phone number with OTP
     * POST /api/auth/verify-phone
     */
    async verifyPhone(request, reply) {
        try {
            const body = request.body;
            const result = await auth_service_1.authService.verifyPhone(body.phoneNumber, body.otpCode);
            logger_1.default.info('Phone verification successful', {
                userId: result.user.id,
            });
            return reply
                .status(constants_1.HTTP_STATUS.OK)
                .send((0, api_types_1.createSuccessResponse)(result, result.message));
        }
        catch (error) {
            logger_1.default.error('Phone verification failed', { error: error.message, code: error.code });
            return reply
                .status(constants_1.HTTP_STATUS.BAD_REQUEST)
                .send((0, api_types_1.createErrorResponse)(error.code, error.message, error.details));
        }
    }
    /**
     * Login user
     * POST /api/auth/login
     */
    async login(request, reply) {
        try {
            const body = request.body;
            const metadata = (0, auth_middleware_1.extractRequestMetadata)(request);
            const result = await auth_service_1.authService.login({
                ...body,
                ipAddress: metadata.ipAddress,
                userAgent: metadata.userAgent,
            });
            logger_1.default.info('User login successful', {
                userId: result.user.id,
            });
            return reply
                .status(constants_1.HTTP_STATUS.OK)
                .send((0, api_types_1.createSuccessResponse)(result, result.message));
        }
        catch (error) {
            logger_1.default.error('Login failed', { error: error.message, code: error.code });
            const statusCode = error.code === api_types_1.ErrorCodes.ACCOUNT_SUSPENDED
                ? constants_1.HTTP_STATUS.FORBIDDEN
                : constants_1.HTTP_STATUS.UNAUTHORIZED;
            return reply
                .status(statusCode)
                .send((0, api_types_1.createErrorResponse)(error.code, error.message));
        }
    }
    /**
     * Refresh access token
     * POST /api/auth/refresh-token
     */
    async refreshToken(request, reply) {
        try {
            const body = request.body;
            const metadata = (0, auth_middleware_1.extractRequestMetadata)(request);
            const result = await auth_service_1.authService.refreshAccessToken({
                refreshToken: body.refreshToken,
                ipAddress: metadata.ipAddress,
                userAgent: metadata.userAgent,
            });
            logger_1.default.info('Token refresh successful');
            return reply
                .status(constants_1.HTTP_STATUS.OK)
                .send((0, api_types_1.createSuccessResponse)(result, 'تم تحديث رمز الوصول بنجاح'));
        }
        catch (error) {
            logger_1.default.error('Token refresh failed', { error: error.message, code: error.code });
            return reply
                .status(constants_1.HTTP_STATUS.UNAUTHORIZED)
                .send((0, api_types_1.createErrorResponse)(error.code, error.message));
        }
    }
    /**
     * Logout user
     * POST /api/auth/logout
     */
    async logout(request, reply) {
        try {
            const userId = request.user.userId;
            const body = request.body;
            const result = await auth_service_1.authService.logout(userId, body.refreshToken);
            logger_1.default.info('User logout successful', { userId });
            return reply
                .status(constants_1.HTTP_STATUS.OK)
                .send((0, api_types_1.createSuccessResponse)(null, result.message));
        }
        catch (error) {
            logger_1.default.error('Logout failed', { error: error.message });
            return reply
                .status(constants_1.HTTP_STATUS.INTERNAL_SERVER_ERROR)
                .send((0, api_types_1.createErrorResponse)(api_types_1.ErrorCodes.INTERNAL_ERROR, 'حدث خطأ أثناء تسجيل الخروج'));
        }
    }
    /**
     * Request password reset OTP
     * POST /api/auth/request-password-reset
     */
    async requestPasswordReset(request, reply) {
        try {
            const body = request.body;
            const metadata = (0, auth_middleware_1.extractRequestMetadata)(request);
            const result = await auth_service_1.authService.requestPasswordReset(body.phoneNumber, metadata.ipAddress, metadata.userAgent);
            logger_1.default.info('Password reset OTP sent', { phoneNumber: body.phoneNumber });
            return reply
                .status(constants_1.HTTP_STATUS.OK)
                .send((0, api_types_1.createSuccessResponse)({ expiresAt: result.expiresAt }, result.message));
        }
        catch (error) {
            logger_1.default.error('Password reset request failed', { error: error.message, code: error.code });
            return reply
                .status(constants_1.HTTP_STATUS.BAD_REQUEST)
                .send((0, api_types_1.createErrorResponse)(error.code, error.message, error.details));
        }
    }
    /**
     * Reset password with OTP
     * POST /api/auth/reset-password
     */
    async resetPassword(request, reply) {
        try {
            const body = request.body;
            const result = await auth_service_1.authService.resetPassword(body.phoneNumber, body.otpCode, body.newPassword);
            logger_1.default.info('Password reset successful', { phoneNumber: body.phoneNumber });
            return reply
                .status(constants_1.HTTP_STATUS.OK)
                .send((0, api_types_1.createSuccessResponse)(null, result.message));
        }
        catch (error) {
            logger_1.default.error('Password reset failed', { error: error.message, code: error.code });
            return reply
                .status(constants_1.HTTP_STATUS.BAD_REQUEST)
                .send((0, api_types_1.createErrorResponse)(error.code, error.message));
        }
    }
    /**
     * Resend OTP
     * POST /api/auth/resend-otp
     */
    async resendOtp(request, reply) {
        try {
            const body = request.body;
            const metadata = (0, auth_middleware_1.extractRequestMetadata)(request);
            const result = await otp_service_1.otpService.generateAndSendOtp({
                phoneNumber: body.phoneNumber,
                purpose: body.purpose,
                ipAddress: metadata.ipAddress,
                userAgent: metadata.userAgent,
            });
            logger_1.default.info('OTP resent', {
                phoneNumber: body.phoneNumber,
                purpose: body.purpose,
            });
            return reply
                .status(constants_1.HTTP_STATUS.OK)
                .send((0, api_types_1.createSuccessResponse)({ expiresAt: result.expiresAt }, result.message));
        }
        catch (error) {
            logger_1.default.error('Resend OTP failed', { error: error.message, code: error.code });
            return reply
                .status(constants_1.HTTP_STATUS.BAD_REQUEST)
                .send((0, api_types_1.createErrorResponse)(error.code, error.message, error.details));
        }
    }
    /**
     * Get current user info
     * GET /api/auth/me
     */
    async getCurrentUser(request, reply) {
        try {
            const userId = request.user.userId;
            // User info is already in request.user from JWT
            const userInfo = {
                userId: request.user.userId,
                phoneNumber: request.user.phoneNumber,
                fullName: request.user.fullName,
                status: request.user.status,
                isOnboarded: request.user.isOnboarded,
            };
            return reply
                .status(constants_1.HTTP_STATUS.OK)
                .send((0, api_types_1.createSuccessResponse)(userInfo));
        }
        catch (error) {
            logger_1.default.error('Get current user failed', { error: error.message });
            return reply
                .status(constants_1.HTTP_STATUS.INTERNAL_SERVER_ERROR)
                .send((0, api_types_1.createErrorResponse)(api_types_1.ErrorCodes.INTERNAL_ERROR, 'حدث خطأ في النظام'));
        }
    }
}
exports.AuthController = AuthController;
exports.authController = new AuthController();
//# sourceMappingURL=auth.controller.js.map