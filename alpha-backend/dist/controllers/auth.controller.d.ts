import { FastifyRequest, FastifyReply } from 'fastify';
export declare class AuthController {
    /**
     * Register new user
     * POST /api/auth/register
     */
    register(request: FastifyRequest, reply: FastifyReply): Promise<never>;
    /**
     * Verify phone number with OTP
     * POST /api/auth/verify-phone
     */
    verifyPhone(request: FastifyRequest, reply: FastifyReply): Promise<never>;
    /**
     * Login user
     * POST /api/auth/login
     */
    login(request: FastifyRequest, reply: FastifyReply): Promise<never>;
    /**
     * Refresh access token
     * POST /api/auth/refresh-token
     */
    refreshToken(request: FastifyRequest, reply: FastifyReply): Promise<never>;
    /**
     * Logout user
     * POST /api/auth/logout
     */
    logout(request: FastifyRequest, reply: FastifyReply): Promise<never>;
    /**
     * Request password reset OTP
     * POST /api/auth/request-password-reset
     */
    requestPasswordReset(request: FastifyRequest, reply: FastifyReply): Promise<never>;
    /**
     * Reset password with OTP
     * POST /api/auth/reset-password
     */
    resetPassword(request: FastifyRequest, reply: FastifyReply): Promise<never>;
    /**
     * Resend OTP
     * POST /api/auth/resend-otp
     */
    resendOtp(request: FastifyRequest, reply: FastifyReply): Promise<never>;
    /**
     * Get current user info
     * GET /api/auth/me
     */
    getCurrentUser(request: FastifyRequest, reply: FastifyReply): Promise<never>;
}
export declare const authController: AuthController;
//# sourceMappingURL=auth.controller.d.ts.map