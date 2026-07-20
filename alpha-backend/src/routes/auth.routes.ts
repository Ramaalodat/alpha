import { FastifyInstance } from 'fastify';
import { authController } from '../controllers/auth.controller';
import { authenticate } from '../middleware/auth.middleware';
import { authRateLimit, otpRateLimit } from '../config/security.config';
import prisma from '../lib/prisma';
import {
  validate,
  registerSchema,
  verifyPhoneSchema,
  loginSchema,
  refreshTokenSchema,
  requestPasswordResetSchema,
  resetPasswordSchema,
  requestPasswordResetEmailSchema,
  resetPasswordEmailSchema,
  resendOtpSchema,
  sendEmailVerificationSchema,
  verifyEmailSchema,
  requestRegistrationOtpSchema,
} from '../middleware/validation.middleware';

export const authRoutes = async (fastify: FastifyInstance) => {
  // Temporary route to delete test user for debugging
  fastify.get(
    '/temp-delete-799999999',
    async (request, reply) => {
      try {
        await prisma.user.deleteMany({
          where: { phoneNumber: '+962799999999' }
        });
        return { success: true, message: 'Deleted test user 799999999' };
      } catch (e: any) {
        return { success: false, error: e.message };
      }
    }
  );
  // Public routes (no authentication required)

  /**
   * @route   POST /api/auth/request-registration-otp
   * @desc    Request OTP for registration
   * @access  Public
   */
  fastify.post(
    '/request-registration-otp',
    {
      preHandler: [validate(requestRegistrationOtpSchema)],
      config: { rateLimit: authRateLimit },
    },
    authController.requestRegistrationOtp
  );

  /**
   * @route   POST /api/auth/register
   * @desc    Register new user
   * @access  Public
   */
  fastify.post(
    '/register',
    {
      preHandler: [validate(registerSchema)],
      config: { rateLimit: authRateLimit },
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
      config: { rateLimit: otpRateLimit },
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
      config: { rateLimit: authRateLimit },
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
      config: { rateLimit: otpRateLimit },
    },
    authController.resetPassword
  );

  /**
   * @route   POST /api/auth/request-password-reset-email
   * @desc    Request password reset OTP via Email
   * @access  Public
   */
  fastify.post(
    '/request-password-reset-email',
    {
      preHandler: [validate(requestPasswordResetEmailSchema)],
    },
    authController.requestPasswordResetByEmail
  );

  /**
   * @route   POST /api/auth/reset-password-email
   * @desc    Reset password with OTP via Email
   * @access  Public
   */
  fastify.post(
    '/reset-password-email',
    {
      preHandler: [validate(resetPasswordEmailSchema)],
      config: { rateLimit: otpRateLimit },
    },
    authController.resetPasswordByEmail
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
      config: { rateLimit: otpRateLimit },
    },
    authController.resendOtp
  );

  /**
   * @route   POST /api/auth/send-email-verification
   * @desc    Send email verification link
   * @access  Public
   */
  fastify.post(
    '/send-email-verification',
    {
      preHandler: [validate(sendEmailVerificationSchema)],
      config: { rateLimit: otpRateLimit },
    },
    authController.sendEmailVerification
  );

  /**
   * @route   POST /api/auth/verify-email
   * @desc    Verify email with OTP
   * @access  Public
   */
  fastify.post(
    '/verify-email',
    {
      preHandler: [validate(verifyEmailSchema)],
      config: { rateLimit: otpRateLimit },
    },
    authController.verifyEmail
  );

  /**
   * @route   GET /api/auth/email-status
   * @desc    Check email verification status
   * @access  Public
   */
  fastify.get(
    '/email-status',
    authController.checkEmailStatus
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
