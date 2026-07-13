import { FastifyInstance } from 'fastify';
import { authController } from '../controllers/auth.controller';
import { authenticate } from '../middleware/auth.middleware';
import {
  validate,
  registerSchema,
  verifyPhoneSchema,
  loginSchema,
  refreshTokenSchema,
  requestPasswordResetSchema,
  resetPasswordSchema,
  resendOtpSchema,
} from '../middleware/validation.middleware';

export const authRoutes = async (fastify: FastifyInstance) => {
  // Public routes (no authentication required)

  /**
   * @route   POST /api/auth/register
   * @desc    Register new user
   * @access  Public
   */
  fastify.post(
    '/register',
    {
      preHandler: [validate(registerSchema)],
    },
    authController.register
  );

  /**
   * @route   POST /api/auth/verify-phone
   * @desc    Verify phone number with OTP
   * @access  Public
   */
  fastify.post(
    '/verify-phone',
    {
      preHandler: [validate(verifyPhoneSchema)],
    },
    authController.verifyPhone
  );

  /**
   * @route   POST /api/auth/login
   * @desc    Login user
   * @access  Public
   */
  fastify.post(
    '/login',
    {
      preHandler: [validate(loginSchema)],
    },
    authController.login
  );

  /**
   * @route   POST /api/auth/refresh-token
   * @desc    Refresh access token
   * @access  Public
   */
  fastify.post(
    '/refresh-token',
    {
      preHandler: [validate(refreshTokenSchema)],
    },
    authController.refreshToken
  );

  /**
   * @route   POST /api/auth/request-password-reset
   * @desc    Request password reset OTP
   * @access  Public
   */
  fastify.post(
    '/request-password-reset',
    {
      preHandler: [validate(requestPasswordResetSchema)],
    },
    authController.requestPasswordReset
  );

  /**
   * @route   POST /api/auth/reset-password
   * @desc    Reset password with OTP
   * @access  Public
   */
  fastify.post(
    '/reset-password',
    {
      preHandler: [validate(resetPasswordSchema)],
    },
    authController.resetPassword
  );

  /**
   * @route   POST /api/auth/resend-otp
   * @desc    Resend OTP code
   * @access  Public
   */
  fastify.post(
    '/resend-otp',
    {
      preHandler: [validate(resendOtpSchema)],
    },
    authController.resendOtp
  );

  // Protected routes (authentication required)

  /**
   * @route   POST /api/auth/logout
   * @desc    Logout user
   * @access  Private
   */
  fastify.post(
    '/logout',
    {
      preHandler: [authenticate],
    },
    authController.logout
  );

  /**
   * @route   GET /api/auth/me
   * @desc    Get current user info
   * @access  Private
   */
  fastify.get(
    '/me',
    {
      preHandler: [authenticate],
    },
    authController.getCurrentUser
  );
};
