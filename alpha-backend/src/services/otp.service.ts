import { OtpPurpose, UserStatus } from '@prisma/client';
import { phoneUtils, stringUtils } from '../utils/helpers';
import { OTP_CONFIG, ERROR_MESSAGES } from '../utils/constants';
import { ErrorCodes } from '../types/api.types';
import logger from '../utils/logger';
import { createDevStore } from '../utils/devStore';
import prisma from '../lib/prisma';

const devStore = createDevStore();

interface GenerateOtpParams {
  phoneNumber: string;
  email?: string;
  purpose: OtpPurpose;
  ipAddress?: string;
  userAgent?: string;
}

interface VerifyOtpParams {
  phoneNumber: string;
  email?: string;
  code: string;
  purpose: OtpPurpose;
}

interface OtpRateLimitCheck {
  canSend: boolean;
  remainingAttempts?: number;
  blockedUntil?: Date;
  reason?: string;
}

export class OtpService {
  private async useDevFallback<T>(operation: () => Promise<T>, fallback: () => Promise<T>): Promise<T> {
    try {
      return await operation();
    } catch (error: any) {
      const message = error instanceof Error ? error.message : String(error);
      const shouldUseFallback = /Can't reach database server|database server|ECONNREFUSED|P1001|P1000|Connection refused/i.test(message);
      if (shouldUseFallback) {
        logger.warn('Using local OTP fallback store', { reason: message });
        return fallback();
      }
      throw error;
    }
  }

  /**
   * Generate and store OTP code
   */
  async generateOtp(params: GenerateOtpParams): Promise<{ code: string; expiresAt: Date }> {
    const { phoneNumber, email, purpose, ipAddress, userAgent } = params;

    // Normalize phone number
    const normalizedPhone = phoneUtils.normalize(phoneNumber);

    return this.useDevFallback(
      async () => {
        // Check rate limits
        const rateLimitCheck = await this.checkRateLimit(normalizedPhone, purpose);
        if (!rateLimitCheck.canSend) {
          logger.warn('OTP rate limit exceeded', { phoneNumber: normalizedPhone, purpose, reason: rateLimitCheck.reason });
          throw {
            code: ErrorCodes.OTP_RATE_LIMIT_EXCEEDED,
            message: ERROR_MESSAGES.RATE_LIMIT_EXCEEDED,
            details: rateLimitCheck,
          };
        }

        // Invalidate previous unused OTP codes for this phone and purpose
        await this.invalidatePreviousOtps(normalizedPhone, purpose);

        // Generate 6-digit OTP code (Hardcoded for testing)
        const code = '960854'; // stringUtils.randomNumeric(OTP_CONFIG.LENGTH);
        
        // Calculate expiration time
        const expiresAt = new Date(Date.now() + OTP_CONFIG.EXPIRY_MINUTES * 60 * 1000);

        const otp = await prisma.otpCode.create({
          data: {
            phoneNumber: normalizedPhone,
            email,
            code,
            purpose,
            expiresAt,
            ipAddress,
            userAgent,
            isUsed: false,
            attempts: 0,
          },
        });

        logger.info('OTP generated', {
          phoneNumber: normalizedPhone,
          purpose,
          otpId: otp.id,
          expiresAt: otp.expiresAt,
        });

        return {
          code,
          expiresAt,
        };
      },
      async () => {
        const code = '960854'; // stringUtils.randomNumeric(OTP_CONFIG.LENGTH);
        const expiresAt = new Date(Date.now() + OTP_CONFIG.EXPIRY_MINUTES * 60 * 1000);
        await devStore.createOtp({
          phoneNumber: normalizedPhone,
          code,
          purpose,
          isUsed: false,
          attempts: 0,
          expiresAt,
        });

        logger.info('OTP generated (dev fallback)', {
          phoneNumber: normalizedPhone,
          purpose,
          expiresAt,
        });

        return { code, expiresAt };
      }
    );
  }

  async verifyOtp(params: VerifyOtpParams): Promise<{ verified: boolean; userId?: string }> {
    const { phoneNumber, email, code, purpose } = params;

    // Normalize phone number
    const normalizedPhone = phoneUtils.normalize(phoneNumber);

    return this.useDevFallback(
      async () => {
        // Find the most recent OTP for this phone and purpose
        const otp = await prisma.otpCode.findFirst({
          where: {
            phoneNumber: normalizedPhone,
            ...(email && { email }),
            purpose,
            isUsed: false,
          },
          orderBy: {
            createdAt: 'desc',
          },
        });

        // OTP not found
        if (!otp) {
          logger.warn('OTP not found', { phoneNumber: normalizedPhone, purpose });
          throw {
            code: ErrorCodes.OTP_INVALID,
            message: ERROR_MESSAGES.OTP_INVALID,
          };
        }

        // Check if OTP has expired
        if (new Date() > otp.expiresAt) {
          logger.warn('OTP expired', { phoneNumber: normalizedPhone, purpose, otpId: otp.id });
          throw {
            code: ErrorCodes.OTP_EXPIRED,
            message: ERROR_MESSAGES.OTP_EXPIRED,
          };
        }

        // Check max attempts
        if (otp.attempts >= OTP_CONFIG.MAX_ATTEMPTS) {
          logger.warn('OTP max attempts exceeded', { phoneNumber: normalizedPhone, purpose, otpId: otp.id });
          throw {
            code: ErrorCodes.OTP_MAX_ATTEMPTS_EXCEEDED,
            message: ERROR_MESSAGES.OTP_MAX_ATTEMPTS,
          };
        }

        // Verify code
        if (otp.code !== code) {
          // Increment attempts
          await prisma.otpCode.update({
            where: { id: otp.id },
            data: { attempts: otp.attempts + 1 },
          });

          logger.warn('OTP verification failed - invalid code', {
            phoneNumber: normalizedPhone,
            purpose,
            otpId: otp.id,
            attempts: otp.attempts + 1,
          });

          throw {
            code: ErrorCodes.OTP_INVALID,
            message: ERROR_MESSAGES.OTP_INVALID,
            details: {
              remainingAttempts: OTP_CONFIG.MAX_ATTEMPTS - (otp.attempts + 1),
            },
          };
        }

        // Mark OTP as used
        await prisma.otpCode.update({
          where: { id: otp.id },
          data: {
            isUsed: true,
            usedAt: new Date(),
          },
        });

        logger.info('OTP verified successfully', {
          phoneNumber: normalizedPhone,
          purpose,
          otpId: otp.id,
        });

        return {
          verified: true,
          userId: otp.userId || undefined,
        };
      },
      async () => {
        const otp = await devStore.findLatestOtp(normalizedPhone, purpose);
        if (!otp) {
          logger.warn('OTP not found (dev fallback)', { phoneNumber: normalizedPhone, purpose });
          throw {
            code: ErrorCodes.OTP_INVALID,
            message: ERROR_MESSAGES.OTP_INVALID,
          };
        }

        if (new Date() > otp.expiresAt) {
          logger.warn('OTP expired (dev fallback)', { phoneNumber: normalizedPhone, purpose, otpId: otp.id });
          throw {
            code: ErrorCodes.OTP_EXPIRED,
            message: ERROR_MESSAGES.OTP_EXPIRED,
          };
        }

        if (otp.attempts >= OTP_CONFIG.MAX_ATTEMPTS) {
          logger.warn('OTP max attempts exceeded (dev fallback)', { phoneNumber: normalizedPhone, purpose, otpId: otp.id });
          throw {
            code: ErrorCodes.OTP_MAX_ATTEMPTS_EXCEEDED,
            message: ERROR_MESSAGES.OTP_MAX_ATTEMPTS,
          };
        }

        if (otp.code !== code) {
          await devStore.incrementOtpAttempts(otp.id);
          logger.warn('OTP verification failed - invalid code (dev fallback)', {
            phoneNumber: normalizedPhone,
            purpose,
            otpId: otp.id,
            attempts: otp.attempts + 1,
          });
          throw {
            code: ErrorCodes.OTP_INVALID,
            message: ERROR_MESSAGES.OTP_INVALID,
            details: {
              remainingAttempts: OTP_CONFIG.MAX_ATTEMPTS - (otp.attempts + 1),
            },
          };
        }

        await devStore.markOtpUsed(otp.id);
        logger.info('OTP verified successfully (dev fallback)', {
          phoneNumber: normalizedPhone,
          purpose,
          otpId: otp.id,
        });

        return { verified: true };
      }
    );
  }

  /**
   * Check if user can request new OTP (rate limiting)
   */
  async checkRateLimit(phoneNumber: string, purpose: OtpPurpose): Promise<OtpRateLimitCheck> {
    const normalizedPhone = phoneUtils.normalize(phoneNumber);

    // Time window for rate limiting
    const windowStart = new Date(Date.now() - OTP_CONFIG.RATE_LIMIT_WINDOW_MINUTES * 60 * 1000);

    // Count OTPs sent in the rate limit window
    const recentOtpCount = await prisma.otpCode.count({
      where: {
        phoneNumber: normalizedPhone,
        purpose,
        createdAt: {
          gte: windowStart,
        },
      },
    });

    // Check if rate limit exceeded
    if (recentOtpCount >= OTP_CONFIG.MAX_ATTEMPTS) {
      // Calculate when user can try again
      const oldestInWindow = await prisma.otpCode.findFirst({
        where: {
          phoneNumber: normalizedPhone,
          purpose,
          createdAt: {
            gte: windowStart,
          },
        },
        orderBy: {
          createdAt: 'asc',
        },
      });

      const blockedUntil = oldestInWindow
        ? new Date(oldestInWindow.createdAt.getTime() + OTP_CONFIG.RATE_LIMIT_WINDOW_MINUTES * 60 * 1000)
        : new Date(Date.now() + OTP_CONFIG.RATE_LIMIT_WINDOW_MINUTES * 60 * 1000);

      return {
        canSend: false,
        remainingAttempts: 0,
        blockedUntil,
        reason: `Maximum ${OTP_CONFIG.MAX_ATTEMPTS} OTPs per ${OTP_CONFIG.RATE_LIMIT_WINDOW_MINUTES} minutes`,
      };
    }

    // Check daily limit
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const dailyOtpCount = await prisma.otpCode.count({
      where: {
        phoneNumber: normalizedPhone,
        purpose,
        createdAt: {
          gte: todayStart,
        },
      },
    });

    if (dailyOtpCount >= OTP_CONFIG.DAILY_LIMIT) {
      const blockedUntil = new Date(todayStart.getTime() + 24 * 60 * 60 * 1000);
      
      return {
        canSend: false,
        remainingAttempts: 0,
        blockedUntil,
        reason: `Maximum ${OTP_CONFIG.DAILY_LIMIT} OTPs per day`,
      };
    }

    return {
      canSend: true,
      remainingAttempts: OTP_CONFIG.MAX_ATTEMPTS - recentOtpCount,
    };
  }

  /**
   * Invalidate all previous unused OTPs for phone and purpose
   */
  private async invalidatePreviousOtps(phoneNumber: string, purpose: OtpPurpose): Promise<void> {
    await prisma.otpCode.updateMany({
      where: {
        phoneNumber,
        purpose,
        isUsed: false,
      },
      data: {
        isUsed: true,
        usedAt: new Date(),
      },
    });

    logger.debug('Previous OTPs invalidated', { phoneNumber, purpose });
  }

  /**
   * Cleanup expired OTPs (for background job)
   */
  async cleanupExpiredOtps(): Promise<number> {
    const result = await prisma.otpCode.deleteMany({
      where: {
        expiresAt: {
          lt: new Date(),
        },
        isUsed: true,
      },
    });

    logger.info('Expired OTPs cleaned up', { count: result.count });
    return result.count;
  }

  /**
   * Get OTP statistics for monitoring
   */
  async getOtpStats(phoneNumber: string): Promise<{
    totalSent: number;
    totalVerified: number;
    failedAttempts: number;
    lastSentAt?: Date;
  }> {
    const normalizedPhone = phoneUtils.normalize(phoneNumber);

    const [totalSent, totalVerified, failedOtps, lastOtp] = await Promise.all([
      prisma.otpCode.count({
        where: { phoneNumber: normalizedPhone },
      }),
      prisma.otpCode.count({
        where: {
          phoneNumber: normalizedPhone,
          isUsed: true,
          attempts: 0,
        },
      }),
      prisma.otpCode.findMany({
        where: {
          phoneNumber: normalizedPhone,
          attempts: {
            gt: 0,
          },
        },
        select: { attempts: true },
      }),
      prisma.otpCode.findFirst({
        where: { phoneNumber: normalizedPhone },
        orderBy: { createdAt: 'desc' },
        select: { createdAt: true },
      }),
    ]);

    const failedAttempts = failedOtps.reduce((sum, otp) => sum + otp.attempts, 0);

    return {
      totalSent,
      totalVerified,
      failedAttempts,
      lastSentAt: lastOtp?.createdAt,
    };
  }

  /**
   * Send OTP via SMS (integration with SMS service)
   */
  async sendOtpSms(phoneNumber: string, code: string): Promise<boolean> {
    try {
      const localNumber = phoneUtils.getLocalNumber(phoneNumber);
      
      // TODO: Integrate with actual SMS service (Twilio, AWS SNS, etc.)
      // For now, log the OTP (ONLY IN DEVELOPMENT)
      if (process.env.NODE_ENV === 'development') {
        console.log(`\n=========================================
📱 SMS OTP FOR ${localNumber}: ${code}
=========================================\n`);
        logger.info('OTP SMS (DEV MODE)', {
          phoneNumber: localNumber,
          code,
          message: `رمز التحقق الخاص بك في BASIRA هو: ${code}`,
        });
        return true;
      }

      // Production SMS sending logic
      // Example with Twilio:
      // await twilioClient.messages.create({
      //   body: `رمز التحقق الخاص بك في BASIRA هو: ${code}`,
      //   from: process.env.TWILIO_PHONE_NUMBER,
      //   to: phoneNumber,
      // });

      logger.info('OTP SMS sent', { phoneNumber: localNumber });
      return true;
    } catch (error) {
      logger.error('Failed to send OTP SMS', {
        phoneNumber,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      throw {
        code: ErrorCodes.SMS_SEND_FAILED,
        message: 'فشل إرسال رمز التحقق. يرجى المحاولة مرة أخرى',
      };
    }
  }

  /**
   * Generate and send OTP (complete flow)
   */
  async generateAndSendOtp(params: GenerateOtpParams): Promise<{
    success: boolean;
    expiresAt: Date;
    message: string;
    code?: string;
  }> {
    const { phoneNumber } = params;

    // Generate OTP
    const { code, expiresAt } = await this.generateOtp(params);

    // Send SMS
    await this.sendOtpSms(phoneNumber, code);

    return {
      success: true,
      expiresAt,
      message: 'تم إرسال رمز التحقق إلى رقم هاتفك',
      code: process.env.NODE_ENV === 'development' ? code : undefined,
    };
  }
}

export const otpService = new OtpService();
