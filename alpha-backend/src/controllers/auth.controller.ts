import { FastifyRequest, FastifyReply } from 'fastify';
import { authService } from '../services/auth.service';
import { otpService } from '../services/otp.service';
import { createSuccessResponse, createErrorResponse, ErrorCodes } from '../types/api.types';
import { HTTP_STATUS } from '../utils/constants';
import { extractRequestMetadata } from '../middleware/auth.middleware';
import logger from '../utils/logger';
import { OtpPurpose } from '@prisma/client';

export class AuthController {
  /**
   * Request OTP for registration
   * POST /api/auth/request-registration-otp
   */
  async requestRegistrationOtp(request: FastifyRequest, reply: FastifyReply) {
    try {
      const body = request.body as {
        phoneNumber: string;
        email?: string;
        username?: string;
      };

      const metadata = extractRequestMetadata(request);

      const result = await authService.requestRegistrationOtp({
        ...body,
        ipAddress: metadata.ipAddress,
        userAgent: metadata.userAgent,
      });

      logger.info('Registration OTP requested successfully', {
        phoneNumber: body.phoneNumber,
      });

      return reply
        .status(HTTP_STATUS.OK)
        .send(createSuccessResponse({
          expiresAt: result.expiresAt,
          otpCode: result.otpCode,
        }, result.message));
    } catch (error: any) {
      logger.error('Registration OTP request failed', { error: error.message, code: error.code });
      
      const statusCode = error.code === ErrorCodes.PHONE_NUMBER_EXISTS || error.code === ErrorCodes.CONFLICT
        ? HTTP_STATUS.CONFLICT
        : HTTP_STATUS.BAD_REQUEST;

      return reply
        .status(statusCode)
        .send(createErrorResponse(error.code, error.message, error.details));
    }
  }

  /**
   * Register new user
   * POST /api/auth/register
   */
  async register(request: FastifyRequest, reply: FastifyReply) {
    try {
      const body = request.body as {
        phoneNumber: string;
        email: string;
        fullName: string;
        birthDate: string;
        password: string;
        otpCode: string;
      };

      const metadata = extractRequestMetadata(request);

      const result = await authService.register({
        ...body,
        ipAddress: metadata.ipAddress,
        userAgent: metadata.userAgent,
      });

      logger.info('User registration successful', {
        userId: result.user.id,
        phoneNumber: result.user.phoneNumber,
      });

      return reply
        .status(HTTP_STATUS.CREATED)
        .send(createSuccessResponse({
          user: result.user,
          tokens: result.tokens,
        }, result.message));
    } catch (error: any) {
      logger.error('Registration failed', { error: error.message, code: error.code });
      
      const statusCode = error.code === ErrorCodes.PHONE_NUMBER_EXISTS
        ? HTTP_STATUS.CONFLICT
        : HTTP_STATUS.BAD_REQUEST;

      return reply
        .status(statusCode)
        .send(createErrorResponse(error.code, error.message, error.details));
    }
  }

  /**
   * Verify phone number with OTP
   * POST /api/auth/verify-phone
   */
  async verifyPhone(request: FastifyRequest, reply: FastifyReply) {
    try {
      const body = request.body as {
        phoneNumber: string;
        otpCode: string;
      };

      const result = await authService.verifyPhone(body.phoneNumber, body.otpCode);

      logger.info('Phone verification successful', {
        userId: result.user.id,
      });

      return reply
        .status(HTTP_STATUS.OK)
        .send(createSuccessResponse(result, result.message));
    } catch (error: any) {
      logger.error('Phone verification failed', { error: error.message, code: error.code });
      
      return reply
        .status(HTTP_STATUS.BAD_REQUEST)
        .send(createErrorResponse(error.code, error.message, error.details));
    }
  }

  /**
   * Login user
   * POST /api/auth/login
   */
  async login(request: FastifyRequest, reply: FastifyReply) {
    try {
      const body = request.body as {
        phoneNumber: string;
        password: string;
        deviceId?: string;
      };

      const metadata = extractRequestMetadata(request);

      const result = await authService.login({
        ...body,
        ipAddress: metadata.ipAddress,
        userAgent: metadata.userAgent,
      });

      logger.info('User login successful', {
        userId: result.user.id,
      });

      return reply
        .status(HTTP_STATUS.OK)
        .send(createSuccessResponse(result, result.message));
    } catch (error: any) {
      logger.error('Login failed', { error: error.message, code: error.code });
      
      const statusCode = error.code === ErrorCodes.ACCOUNT_SUSPENDED
        ? HTTP_STATUS.FORBIDDEN
        : HTTP_STATUS.UNAUTHORIZED;

      return reply
        .status(statusCode)
        .send(createErrorResponse(error.code, error.message));
    }
  }

  /**
   * Refresh access token
   * POST /api/auth/refresh-token
   */
  async refreshToken(request: FastifyRequest, reply: FastifyReply) {
    try {
      const body = request.body as {
        refreshToken: string;
      };

      const metadata = extractRequestMetadata(request);

      const result = await authService.refreshAccessToken({
        refreshToken: body.refreshToken,
        ipAddress: metadata.ipAddress,
        userAgent: metadata.userAgent,
      });

      logger.info('Token refresh successful');

      return reply
        .status(HTTP_STATUS.OK)
        .send(createSuccessResponse(result, 'تم تحديث رمز الوصول بنجاح'));
    } catch (error: any) {
      logger.error('Token refresh failed', { error: error.message, code: error.code });
      
      return reply
        .status(HTTP_STATUS.UNAUTHORIZED)
        .send(createErrorResponse(error.code, error.message));
    }
  }

  /**
   * Logout user
   * POST /api/auth/logout
   */
  async logout(request: FastifyRequest, reply: FastifyReply) {
    try {
      const userId = request.user!.userId;
      const body = request.body as {
        refreshToken?: string;
      };

      const result = await authService.logout(userId, body.refreshToken);

      logger.info('User logout successful', { userId });

      return reply
        .status(HTTP_STATUS.OK)
        .send(createSuccessResponse(null, result.message));
    } catch (error: any) {
      logger.error('Logout failed', { error: error.message });
      
      return reply
        .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
        .send(createErrorResponse(ErrorCodes.INTERNAL_ERROR, 'حدث خطأ أثناء تسجيل الخروج'));
    }
  }

  /**
   * Request password reset OTP
   * POST /api/auth/request-password-reset
   */
  async requestPasswordReset(request: FastifyRequest, reply: FastifyReply) {
    try {
      const body = request.body as {
        phoneNumber: string;
      };

      const metadata = extractRequestMetadata(request);

      const result = await authService.requestPasswordReset(
        body.phoneNumber,
        metadata.ipAddress,
        metadata.userAgent
      );

      logger.info('Password reset OTP sent', { phoneNumber: body.phoneNumber });

      return reply
        .status(HTTP_STATUS.OK)
        .send(createSuccessResponse(
          { expiresAt: result.expiresAt },
          result.message
        ));
    } catch (error: any) {
      logger.error('Password reset request failed', { error: error.message, code: error.code });
      
      return reply
        .status(HTTP_STATUS.BAD_REQUEST)
        .send(createErrorResponse(error.code, error.message, error.details));
    }
  }

  /**
   * Reset password with OTP
   * POST /api/auth/reset-password
   */
  async resetPassword(request: FastifyRequest, reply: FastifyReply) {
    try {
      const body = request.body as {
        phoneNumber: string;
        otpCode: string;
        newPassword: string;
      };

      const result = await authService.resetPassword(
        body.phoneNumber,
        body.otpCode,
        body.newPassword
      );

      logger.info('Password reset successful', { phoneNumber: body.phoneNumber });

      return reply
        .status(HTTP_STATUS.OK)
        .send(createSuccessResponse(null, result.message));
    } catch (error: any) {
      logger.error('Password reset failed', { error: error.message, code: error.code });
      
      return reply
        .status(HTTP_STATUS.BAD_REQUEST)
        .send(createErrorResponse(error.code, error.message));
    }
  }

  /**
   * Request password reset OTP via Email
   * POST /api/auth/request-password-reset-email
   */
  async requestPasswordResetByEmail(request: FastifyRequest, reply: FastifyReply) {
    try {
      const body = request.body as {
        email: string;
      };

      const metadata = extractRequestMetadata(request);

      const result = await authService.requestPasswordResetByEmail(
        body.email,
        metadata.ipAddress,
        metadata.userAgent
      );

      logger.info('Password reset OTP sent via email', { email: body.email });

      return reply
        .status(HTTP_STATUS.OK)
        .send(createSuccessResponse(
          { expiresAt: result.expiresAt },
          result.message
        ));
    } catch (error: any) {
      logger.error('Password reset request via email failed', { error: error.message, code: error.code });
      
      return reply
        .status(HTTP_STATUS.BAD_REQUEST)
        .send(createErrorResponse(error.code, error.message, error.details));
    }
  }

  /**
   * Reset password with OTP via Email
   * POST /api/auth/reset-password-email
   */
  async resetPasswordByEmail(request: FastifyRequest, reply: FastifyReply) {
    try {
      const body = request.body as {
        email: string;
        otpCode: string;
        newPassword: string;
      };

      const result = await authService.resetPasswordByEmail(
        body.email,
        body.otpCode,
        body.newPassword
      );

      logger.info('Password reset successful via email', { email: body.email });

      return reply
        .status(HTTP_STATUS.OK)
        .send(createSuccessResponse(null, result.message));
    } catch (error: any) {
      logger.error('Password reset via email failed', { error: error.message, code: error.code });
      
      return reply
        .status(HTTP_STATUS.BAD_REQUEST)
        .send(createErrorResponse(error.code, error.message));
    }
  }


  /**
   * Resend OTP
   * POST /api/auth/resend-otp
   */
  async resendOtp(request: FastifyRequest, reply: FastifyReply) {
    try {
      const body = request.body as {
        phoneNumber: string;
        purpose: OtpPurpose;
      };

      const metadata = extractRequestMetadata(request);

      const result = await otpService.generateAndSendOtp({
        phoneNumber: body.phoneNumber,
        purpose: body.purpose,
        ipAddress: metadata.ipAddress,
        userAgent: metadata.userAgent,
      });

      logger.info('OTP resent', {
        phoneNumber: body.phoneNumber,
        purpose: body.purpose,
      });

      return reply
        .status(HTTP_STATUS.OK)
        .send(createSuccessResponse(
          { expiresAt: result.expiresAt, otpCode: result.code },
          result.message
        ));
    } catch (error: any) {
      logger.error('Resend OTP failed', { error: error.message, code: error.code });
      
      return reply
        .status(HTTP_STATUS.BAD_REQUEST)
        .send(createErrorResponse(error.code, error.message, error.details));
    }
  }

  /**
   * Get current user info
   * GET /api/auth/me
   */
  async getCurrentUser(request: FastifyRequest, reply: FastifyReply) {
    try {
      const userId = request.user!.userId;

      // User info is already in request.user from JWT
      const userInfo = {
        userId: request.user!.userId,
        phoneNumber: request.user!.phoneNumber,
        fullName: request.user!.fullName,
        status: request.user!.status,
        isOnboarded: request.user!.isOnboarded,
      };

      return reply
        .status(HTTP_STATUS.OK)
        .send(createSuccessResponse(userInfo));
    } catch (error: any) {
      logger.error('Get current user failed', { error: error.message });
      
      return reply
        .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
        .send(createErrorResponse(ErrorCodes.INTERNAL_ERROR, 'حدث خطأ في النظام'));
    }
  }

  /**
   * Send email verification link
   * POST /api/auth/send-email-verification
   */
  async sendEmailVerification(request: FastifyRequest, reply: FastifyReply) {
    try {
      const body = request.body as {
        phoneNumber: string;
        email: string;
      };

      const result = await authService.sendEmailVerification(body.phoneNumber, body.email);

      logger.info('Email verification sent', { email: body.email });

      return reply
        .status(HTTP_STATUS.OK)
        .send(createSuccessResponse(
          { previewUrl: result.previewUrl, expiresAt: result.expiresAt },
          result.message
        ));
    } catch (error: any) {
      logger.error('Send email verification failed', { error: error.message });

      const statusCode = error.code === ErrorCodes.CONFLICT ? HTTP_STATUS.CONFLICT : HTTP_STATUS.BAD_REQUEST;
      return reply
        .status(statusCode)
        .send(createErrorResponse(error.code, error.message));
    }
  }

  /**
   * Verify email with OTP code
   * POST /api/auth/verify-email
   */
  async verifyEmail(request: FastifyRequest, reply: FastifyReply) {
    try {
      const body = request.body as {
        phoneNumber: string;
        email: string;
        otpCode: string;
      };

      if (!body.phoneNumber || !body.email || !body.otpCode) {
        return reply
          .status(HTTP_STATUS.BAD_REQUEST)
          .send(createErrorResponse(ErrorCodes.VALIDATION_ERROR, 'رقم الهاتف والبريد الإلكتروني ورمز التحقق مطلوبون'));
      }

      const result = await authService.verifyEmailWithOtp(body.phoneNumber, body.email, body.otpCode);

      logger.info('Email verification successful', { phoneNumber: body.phoneNumber });

      return reply
        .status(HTTP_STATUS.OK)
        .send(createSuccessResponse({ verified: result.verified }, result.message));
    } catch (error: any) {
      logger.error('Email verification failed', { error: error.message, code: error.code });

      return reply
        .status(HTTP_STATUS.BAD_REQUEST)
        .send(createErrorResponse(error.code, error.message));
    }
  }

  /**
   * Check email verification status
   * GET /api/auth/email-status?phoneNumber=xxx
   */
  async checkEmailStatus(request: FastifyRequest, reply: FastifyReply) {
    try {
      const query = request.query as { phoneNumber: string };

      if (!query.phoneNumber) {
        return reply
          .status(HTTP_STATUS.BAD_REQUEST)
          .send(createErrorResponse(ErrorCodes.VALIDATION_ERROR, 'رقم الهاتف مطلوب'));
      }

      const result = await authService.checkEmailStatus(query.phoneNumber);

      return reply
        .status(HTTP_STATUS.OK)
        .send(createSuccessResponse(result));
    } catch (error: any) {
      logger.error('Check email status failed', { error: error.message });

      return reply
        .status(HTTP_STATUS.BAD_REQUEST)
        .send(createErrorResponse(error.code, error.message));
    }
  }
}

export const authController = new AuthController();
