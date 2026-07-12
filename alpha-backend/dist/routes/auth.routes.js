"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authRoutes = void 0;
const auth_controller_1 = require("../controllers/auth.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const validation_middleware_1 = require("../middleware/validation.middleware");
const authRoutes = async (fastify) => {
    // Public routes (no authentication required)
    /**
     * @route   POST /api/auth/register
     * @desc    Register new user
     * @access  Public
     */
    fastify.post('/register', {
        preHandler: [(0, validation_middleware_1.validate)(validation_middleware_1.registerSchema)],
    }, auth_controller_1.authController.register);
    /**
     * @route   POST /api/auth/verify-phone
     * @desc    Verify phone number with OTP
     * @access  Public
     */
    fastify.post('/verify-phone', {
        preHandler: [(0, validation_middleware_1.validate)(validation_middleware_1.verifyPhoneSchema)],
    }, auth_controller_1.authController.verifyPhone);
    /**
     * @route   POST /api/auth/login
     * @desc    Login user
     * @access  Public
     */
    fastify.post('/login', {
        preHandler: [(0, validation_middleware_1.validate)(validation_middleware_1.loginSchema)],
    }, auth_controller_1.authController.login);
    /**
     * @route   POST /api/auth/refresh-token
     * @desc    Refresh access token
     * @access  Public
     */
    fastify.post('/refresh-token', {
        preHandler: [(0, validation_middleware_1.validate)(validation_middleware_1.refreshTokenSchema)],
    }, auth_controller_1.authController.refreshToken);
    /**
     * @route   POST /api/auth/request-password-reset
     * @desc    Request password reset OTP
     * @access  Public
     */
    fastify.post('/request-password-reset', {
        preHandler: [(0, validation_middleware_1.validate)(validation_middleware_1.requestPasswordResetSchema)],
    }, auth_controller_1.authController.requestPasswordReset);
    /**
     * @route   POST /api/auth/reset-password
     * @desc    Reset password with OTP
     * @access  Public
     */
    fastify.post('/reset-password', {
        preHandler: [(0, validation_middleware_1.validate)(validation_middleware_1.resetPasswordSchema)],
    }, auth_controller_1.authController.resetPassword);
    /**
     * @route   POST /api/auth/resend-otp
     * @desc    Resend OTP code
     * @access  Public
     */
    fastify.post('/resend-otp', {
        preHandler: [(0, validation_middleware_1.validate)(validation_middleware_1.resendOtpSchema)],
    }, auth_controller_1.authController.resendOtp);
    // Protected routes (authentication required)
    /**
     * @route   POST /api/auth/logout
     * @desc    Logout user
     * @access  Private
     */
    fastify.post('/logout', {
        preHandler: [auth_middleware_1.authenticate],
    }, auth_controller_1.authController.logout);
    /**
     * @route   GET /api/auth/me
     * @desc    Get current user info
     * @access  Private
     */
    fastify.get('/me', {
        preHandler: [auth_middleware_1.authenticate],
    }, auth_controller_1.authController.getCurrentUser);
};
exports.authRoutes = authRoutes;
//# sourceMappingURL=auth.routes.js.map