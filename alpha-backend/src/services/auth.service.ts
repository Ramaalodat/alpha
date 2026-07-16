import { User, UserStatus, OtpPurpose } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { phoneUtils } from '../utils/helpers';
import { JWT_CONFIG, ERROR_MESSAGES, SUCCESS_MESSAGES } from '../utils/constants';
import { ErrorCodes } from '../types/api.types';
import logger from '../utils/logger';
import { otpService } from './otp.service';
import { emailService } from './email.service';
import config from '../config/config';
import { createDevStore } from '../utils/devStore';
import prisma from '../lib/prisma';

const devStore = createDevStore();

interface RegisterParams {
  phoneNumber: string;
  fullName: string;
  birthDate: string; // ISO date string
  password: string;
  email?: string;
  username?: string;
  ipAddress?: string;
  userAgent?: string;
}

interface LoginParams {
  phoneNumber: string;
  password: string;
  ipAddress?: string;
  userAgent?: string;
  deviceId?: string;
}

interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

interface TokenPayload {
  userId: string;
  phoneNumber: string;
  fullName: string;
  status: UserStatus;
  isOnboarded: boolean;
}

interface RefreshTokenParams {
  refreshToken: string;
  ipAddress?: string;
  userAgent?: string;
}

export class AuthService {
  private async useDevFallback<T>(operation: () => Promise<T>, fallback: () => Promise<T>): Promise<T> {
    try {
      return await operation();
    } catch (error: any) {
      const message = error instanceof Error ? error.message : String(error);
      const shouldUseFallback = /Can't reach database server|database server|ECONNREFUSED|P1001|P1000|Connection refused/i.test(message);
      if (shouldUseFallback) {
        logger.warn('Using local authentication fallback store', { reason: message });
        return fallback();
      }
      throw error;
    }
  }

  /**
   * Register new user
   */
  async register(params: RegisterParams): Promise<{
    user: Partial<User>;
    message: string;
    otpCode?: string;
  }> {
    const { phoneNumber, fullName, birthDate, password, email, username, ipAddress, userAgent } = params;

    // Normalize phone number
    const normalizedPhone = phoneUtils.normalize(phoneNumber);

    return this.useDevFallback(
      async () => {
        // Check if phone number already exists
        const existingUser = await prisma.user.findUnique({
          where: { phoneNumber: normalizedPhone },
        });

        if (existingUser) {
          logger.warn('Registration failed - phone number exists', { phoneNumber: normalizedPhone });
          throw {
            code: ErrorCodes.PHONE_NUMBER_EXISTS,
            message: ERROR_MESSAGES.PHONE_EXISTS,
          };
        }

        // Check if email already exists
        if (email) {
          const existingEmail = await prisma.user.findFirst({ where: { email } });
          if (existingEmail) {
            logger.warn('Registration failed - email exists', { email });
            throw {
              code: ErrorCodes.CONFLICT,
              message: ERROR_MESSAGES.EMAIL_ALREADY_EXISTS,
            };
          }
        }

        // Check if username already exists
        if (username) {
          const existingUsername = await prisma.user.findFirst({ where: { username } });
          if (existingUsername) {
            logger.warn('Registration failed - username exists', { username });
            throw {
              code: ErrorCodes.CONFLICT,
              message: ERROR_MESSAGES.USERNAME_ALREADY_EXISTS,
            };
          }
        }

        // Hash password
        const passwordHash = await bcrypt.hash(password, 12);

        // Parse birth date
        const birthDateObj = new Date(birthDate);

        // Check if email was verified via OTP
        let emailVerifiedAt: Date | null = null;
        if (email) {
          const verifiedOtp = await prisma.otpCode.findFirst({
            where: {
              phoneNumber: normalizedPhone,
              email,
              purpose: OtpPurpose.EMAIL_VERIFICATION,
              isUsed: true,
            },
            orderBy: { createdAt: 'desc' },
          });
          if (verifiedOtp) {
            emailVerifiedAt = new Date();
          }
        }

        // Create user
        const user = await prisma.user.create({
          data: {
            phoneNumber: normalizedPhone,
            fullName,
            birthDate: birthDateObj,
            passwordHash,
            status: UserStatus.PENDING_VERIFICATION,
            isOnboarded: false,
            ...(email && { email }),
            ...(emailVerifiedAt && { emailVerifiedAt }),
            ...(username && { username }),
          },
          select: {
            id: true,
            phoneNumber: true,
            fullName: true,
            birthDate: true,
            status: true,
            isOnboarded: true,
            createdAt: true,
          },
        });

        // Generate and send OTP for phone verification
        const otpResult = await otpService.generateAndSendOtp({
          phoneNumber: normalizedPhone,
          purpose: OtpPurpose.REGISTRATION,
          ipAddress,
          userAgent,
        });

        // Create audit log
        await this.createAuditLog({
          userId: user.id,
          action: 'CREATE',
          entityType: 'User',
          entityId: user.id,
          newValues: {
            phoneNumber: normalizedPhone,
            fullName,
            status: user.status,
          },
          ipAddress,
          userAgent,
          method: 'POST',
          endpoint: '/auth/register',
        });

        logger.info('User registered successfully', {
          userId: user.id,
          phoneNumber: normalizedPhone,
        });

        return {
          user,
          message: SUCCESS_MESSAGES.USER_REGISTERED + '. ' + SUCCESS_MESSAGES.OTP_SENT,
          otpCode: otpResult.code,
        };
      },
      async () => {
        const existingUser = await devStore.findUserByPhone(normalizedPhone);
        if (existingUser) {
          logger.warn('Registration failed - phone number exists (dev fallback)', { phoneNumber: normalizedPhone });
          throw {
            code: ErrorCodes.PHONE_NUMBER_EXISTS,
            message: ERROR_MESSAGES.PHONE_EXISTS,
          };
        }

        const passwordHash = await bcrypt.hash(password, 12);
        const birthDateObj = new Date(birthDate);
        const user = await devStore.createUser({
          id: `dev-${Date.now()}`,
          phoneNumber: normalizedPhone,
          fullName,
          birthDate: birthDateObj,
          passwordHash,
          status: UserStatus.PENDING_VERIFICATION,
          isOnboarded: false,
        });

        const otpResult = await otpService.generateAndSendOtp({
          phoneNumber: normalizedPhone,
          purpose: OtpPurpose.REGISTRATION,
          ipAddress,
          userAgent,
        });

        logger.info('User registered successfully (dev fallback)', {
          userId: user.id,
          phoneNumber: normalizedPhone,
        });

        return {
          user: {
            id: user.id,
            phoneNumber: user.phoneNumber,
            fullName: user.fullName,
            birthDate: user.birthDate,
            status: user.status as UserStatus,
            isOnboarded: user.isOnboarded,
            createdAt: user.createdAt,
          },
          message: SUCCESS_MESSAGES.USER_REGISTERED + '. ' + SUCCESS_MESSAGES.OTP_SENT,
          otpCode: otpResult.code,
        };
      }
    );
  }

  /**
   * Verify phone number with OTP and activate account
   */
  async verifyPhone(phoneNumber: string, otpCode: string): Promise<{
    user: Partial<User>;
    tokens: TokenPair;
    message: string;
  }> {
    const normalizedPhone = phoneUtils.normalize(phoneNumber);

    const { verified } = await otpService.verifyOtp({
      phoneNumber: normalizedPhone,
      code: otpCode,
      purpose: OtpPurpose.REGISTRATION,
    });

    if (!verified) {
      throw {
        code: ErrorCodes.OTP_INVALID,
        message: ERROR_MESSAGES.OTP_INVALID,
      };
    }

    return this.useDevFallback(
      async () => {
        // Find user
        const user = await prisma.user.findUnique({
          where: { phoneNumber: normalizedPhone },
        });

        if (!user) {
          throw {
            code: ErrorCodes.NOT_FOUND,
            message: 'User not found',
          };
        }

        // Update user status to VERIFIED
        const updatedUser = await prisma.user.update({
          where: { id: user.id },
          data: {
            status: UserStatus.VERIFIED,
            phoneVerifiedAt: new Date(),
          },
          select: {
            id: true,
            phoneNumber: true,
            fullName: true,
            birthDate: true,
            status: true,
            isOnboarded: true,
            phoneVerifiedAt: true,
            createdAt: true,
          },
        });

        // Generate tokens
        const tokens = await this.generateTokenPair(updatedUser);

        // Create audit log
        await this.createAuditLog({
          userId: user.id,
          action: 'VERIFY',
          entityType: 'User',
          entityId: user.id,
          oldValues: { status: user.status },
          newValues: { status: UserStatus.VERIFIED },
        });

        logger.info('Phone verified successfully', {
          userId: updatedUser.id,
          phoneNumber: normalizedPhone,
        });

        return {
          user: updatedUser,
          tokens,
          message: SUCCESS_MESSAGES.ACCOUNT_VERIFIED,
        };
      },
      async () => {
        const user = await devStore.findUserByPhone(normalizedPhone);
        logger.info('Dev fallback phone verification lookup', {
          normalizedPhone,
          userFound: !!user,
          userId: user?.id,
        });
        if (!user) {
          throw {
            code: ErrorCodes.NOT_FOUND,
            message: 'User not found',
          };
        }

        const updatedUser = await devStore.updateUser(normalizedPhone, {
          status: UserStatus.VERIFIED,
          phoneVerifiedAt: new Date(),
        });
        logger.info('Dev fallback phone verification update', {
          normalizedPhone,
          updatedUserId: updatedUser?.id,
          updatedStatus: updatedUser?.status,
        });

        const tokens = await this.generateTokenPair({
          id: updatedUser?.id,
          phoneNumber: updatedUser?.phoneNumber,
          fullName: updatedUser?.fullName,
          status: updatedUser?.status as UserStatus,
          isOnboarded: updatedUser?.isOnboarded,
        });

        logger.info('Phone verified successfully (dev fallback)', {
          userId: updatedUser?.id,
          phoneNumber: normalizedPhone,
        });

        return {
          user: updatedUser ? {
            id: updatedUser.id,
            phoneNumber: updatedUser.phoneNumber,
            fullName: updatedUser.fullName,
            birthDate: updatedUser.birthDate,
            status: updatedUser.status as UserStatus,
            isOnboarded: updatedUser.isOnboarded,
            phoneVerifiedAt: updatedUser.phoneVerifiedAt ?? null,
            createdAt: updatedUser.createdAt,
          } : {
            id: user.id,
            phoneNumber: user.phoneNumber,
            fullName: user.fullName,
            birthDate: user.birthDate,
            status: user.status as UserStatus,
            isOnboarded: user.isOnboarded,
            phoneVerifiedAt: user.phoneVerifiedAt ?? null,
            createdAt: user.createdAt,
          },
          tokens,
          message: SUCCESS_MESSAGES.ACCOUNT_VERIFIED,
        };
      }
    );
  }

  /**
   * Login user
   */
  async login(params: LoginParams): Promise<{
    user: Partial<User>;
    tokens: TokenPair;
    message: string;
  }> {
    const { phoneNumber, password, ipAddress, userAgent, deviceId } = params;

    // Normalize phone number
    const normalizedPhone = phoneUtils.normalize(phoneNumber);

    return this.useDevFallback(
      async () => {
        // Find user
        const user = await prisma.user.findUnique({
          where: { phoneNumber: normalizedPhone },
        });

        if (!user) {
          logger.warn('Login failed - user not found', { phoneNumber: normalizedPhone });
          throw {
            code: ErrorCodes.INVALID_CREDENTIALS,
            message: ERROR_MESSAGES.INVALID_CREDENTIALS,
          };
        }

        // Check if account is suspended
        if (user.status === UserStatus.SUSPENDED) {
          logger.warn('Login failed - account suspended', { userId: user.id });
          throw {
            code: ErrorCodes.ACCOUNT_SUSPENDED,
            message: ERROR_MESSAGES.ACCOUNT_SUSPENDED,
          };
        }

        // Check if account is verified
        if (user.status === UserStatus.PENDING_VERIFICATION) {
          logger.warn('Login failed - account not verified', { userId: user.id });
          throw {
            code: ErrorCodes.ACCOUNT_NOT_VERIFIED,
            message: ERROR_MESSAGES.ACCOUNT_NOT_VERIFIED,
          };
        }

        // Check if email is verified (if user has an email)
        if (user.email && !user.emailVerifiedAt) {
          logger.warn('Login failed - email not verified', { userId: user.id, email: user.email });
          throw {
            code: ErrorCodes.EMAIL_NOT_VERIFIED,
            message: ERROR_MESSAGES.EMAIL_NOT_VERIFIED,
          };
        }

        // Verify password
        const passwordMatch = await bcrypt.compare(password, user.passwordHash);
        if (!passwordMatch) {
          const oldPasswords = await prisma.passwordHistory.findMany({
            where: { userId: user.id },
            orderBy: { createdAt: 'desc' }
          });
          
          for (const oldPass of oldPasswords) {
            const isOldMatch = await bcrypt.compare(password, oldPass.passwordHash);
            if (isOldMatch) {
              const diffMs = Date.now() - oldPass.createdAt.getTime();
              const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
              let timeStr = diffDays > 0 ? `${diffDays} days` : 'less than a day';
              logger.warn('Login failed - old password used', { userId: user.id });
              throw {
                code: ErrorCodes.OLD_PASSWORD_USED,
                message: `This was your old password. It was changed ${timeStr} ago.`,
              };
            }
          }

          logger.warn('Login failed - invalid password', { userId: user.id });
          throw {
            code: ErrorCodes.INVALID_CREDENTIALS,
            message: ERROR_MESSAGES.INVALID_CREDENTIALS,
          };
        }

        // Update last login
        const updatedUser = await prisma.user.update({
          where: { id: user.id },
          data: { lastLoginAt: new Date() },
          select: {
            id: true,
            phoneNumber: true,
            fullName: true,
            birthDate: true,
            status: true,
            isOnboarded: true,
            lastLoginAt: true,
            createdAt: true,
          },
        });

        // Generate tokens
        const tokens = await this.generateTokenPair(updatedUser, {
          ipAddress,
          userAgent,
          deviceId,
        });

        // Create audit log
        await this.createAuditLog({
          userId: user.id,
          action: 'LOGIN',
          entityType: 'User',
          entityId: user.id,
          ipAddress,
          userAgent,
          method: 'POST',
          endpoint: '/auth/login',
        });

        logger.info('User logged in successfully', {
          userId: updatedUser.id,
          phoneNumber: normalizedPhone,
        });

        return {
          user: updatedUser,
          tokens,
          message: SUCCESS_MESSAGES.LOGIN_SUCCESS,
        };
      },
      async () => {
        const user = await devStore.findUserByPhone(normalizedPhone);
        if (!user) {
          logger.warn('Login failed - user not found (dev fallback)', { phoneNumber: normalizedPhone });
          throw {
            code: ErrorCodes.INVALID_CREDENTIALS,
            message: ERROR_MESSAGES.INVALID_CREDENTIALS,
          };
        }

        if (user.status === UserStatus.SUSPENDED) {
          logger.warn('Login failed - account suspended (dev fallback)', { userId: user.id });
          throw {
            code: ErrorCodes.ACCOUNT_SUSPENDED,
            message: ERROR_MESSAGES.ACCOUNT_SUSPENDED,
          };
        }

        if (user.status === UserStatus.PENDING_VERIFICATION) {
          logger.warn('Login failed - account not verified (dev fallback)', { userId: user.id });
          throw {
            code: ErrorCodes.ACCOUNT_NOT_VERIFIED,
            message: ERROR_MESSAGES.ACCOUNT_NOT_VERIFIED,
          };
        }

        if (user.email && !user.emailVerifiedAt) {
          logger.warn('Login failed - email not verified (dev fallback)', { userId: user.id, email: user.email });
          throw {
            code: ErrorCodes.EMAIL_NOT_VERIFIED,
            message: ERROR_MESSAGES.EMAIL_NOT_VERIFIED,
          };
        }

        const passwordMatch = await bcrypt.compare(password, user.passwordHash);
        if (!passwordMatch) {
          logger.warn('Login failed - invalid password (dev fallback)', { userId: user.id });
          throw {
            code: ErrorCodes.INVALID_CREDENTIALS,
            message: ERROR_MESSAGES.INVALID_CREDENTIALS,
          };
        }

        const updatedUser = await devStore.updateUser(normalizedPhone, { lastLoginAt: new Date() });
        const tokens = await this.generateTokenPair({
          id: updatedUser?.id,
          phoneNumber: updatedUser?.phoneNumber,
          fullName: updatedUser?.fullName,
          status: updatedUser?.status as UserStatus,
          isOnboarded: updatedUser?.isOnboarded,
        }, {
          ipAddress,
          userAgent,
          deviceId,
        });

        logger.info('User logged in successfully (dev fallback)', {
          userId: updatedUser?.id,
          phoneNumber: normalizedPhone,
        });

        return {
          user: updatedUser ? {
            id: updatedUser.id,
            phoneNumber: updatedUser.phoneNumber,
            fullName: updatedUser.fullName,
            birthDate: updatedUser.birthDate,
            status: updatedUser.status as UserStatus,
            isOnboarded: updatedUser.isOnboarded,
            lastLoginAt: updatedUser.lastLoginAt ?? null,
            createdAt: updatedUser.createdAt,
          } : {
            id: user.id,
            phoneNumber: user.phoneNumber,
            fullName: user.fullName,
            birthDate: user.birthDate,
            status: user.status as UserStatus,
            isOnboarded: user.isOnboarded,
            lastLoginAt: user.lastLoginAt ?? null,
            createdAt: user.createdAt,
          },
          tokens,
          message: SUCCESS_MESSAGES.LOGIN_SUCCESS,
        };
      }
    );
  }

  /**
   * Generate access and refresh token pair
   */
  async generateTokenPair(
    user: Partial<User>,
    sessionData?: {
      ipAddress?: string;
      userAgent?: string;
      deviceId?: string;
    }
  ): Promise<TokenPair> {
    const payload: TokenPayload = {
      userId: user.id!,
      phoneNumber: user.phoneNumber!,
      fullName: user.fullName!,
      status: user.status!,
      isOnboarded: user.isOnboarded!,
    };

    // Generate access token
    const accessToken = jwt.sign(payload, config.jwt.accessTokenSecret, {
      expiresIn: JWT_CONFIG.ACCESS_TOKEN_EXPIRY,
      issuer: JWT_CONFIG.ISSUER,
      audience: JWT_CONFIG.AUDIENCE,
    });

    // Generate refresh token
    const refreshToken = jwt.sign(
      { userId: user.id },
      config.jwt.refreshTokenSecret,
      {
        expiresIn: JWT_CONFIG.REFRESH_TOKEN_EXPIRY,
        issuer: JWT_CONFIG.ISSUER,
        audience: JWT_CONFIG.AUDIENCE,
      }
    );

    // Hash refresh token for storage
    const refreshTokenHash = await bcrypt.hash(refreshToken, 10);

    // Calculate expiration date (7 days)
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    try {
      await prisma.userSession.create({
        data: {
          userId: user.id!,
          refreshTokenHash,
          expiresAt,
          ipAddress: sessionData?.ipAddress,
          userAgent: sessionData?.userAgent,
          deviceId: sessionData?.deviceId,
          isActive: true,
        },
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      if (/Can't reach database server|database server|ECONNREFUSED|P1001|P1000|Connection refused/i.test(message)) {
        await devStore.createSession({
          userId: user.id!,
          refreshTokenHash,
          expiresAt,
          ipAddress: sessionData?.ipAddress,
          userAgent: sessionData?.userAgent,
          deviceId: sessionData?.deviceId,
          isActive: true,
          isRevoked: false,
        });
      } else {
        throw error;
      }
    }

    logger.debug('Token pair generated', { userId: user.id });

    return {
      accessToken,
      refreshToken,
    };
  }

  /**
   * Refresh access token using refresh token
   */
  async refreshAccessToken(params: RefreshTokenParams): Promise<TokenPair> {
    const { refreshToken, ipAddress, userAgent } = params;

    try {
      // Verify refresh token
      const decoded = jwt.verify(
        refreshToken,
        config.jwt.refreshTokenSecret,
        {
          issuer: JWT_CONFIG.ISSUER,
          audience: JWT_CONFIG.AUDIENCE,
        }
      ) as { userId: string };

      const user = await prisma.user.findUnique({
        where: { id: decoded.userId },
        select: {
          id: true,
          phoneNumber: true,
          fullName: true,
          status: true,
          isOnboarded: true,
        },
      });

      if (!user) {
        throw {
          code: ErrorCodes.INVALID_TOKEN,
          message: 'Invalid refresh token',
        };
      }

      const sessions = await prisma.userSession.findMany({
        where: {
          userId: user.id,
          isActive: true,
          isRevoked: false,
          expiresAt: {
            gt: new Date(),
          },
        },
      });

      let validSession = null;
      for (const session of sessions) {
        const isMatch = await bcrypt.compare(refreshToken, session.refreshTokenHash);
        if (isMatch) {
          validSession = session;
          break;
        }
      }

      if (!validSession) {
        throw {
          code: ErrorCodes.INVALID_TOKEN,
          message: 'Invalid refresh token',
        };
      }

      await prisma.userSession.update({
        where: { id: validSession.id },
        data: { lastUsedAt: new Date() },
      });

      const tokens = await this.generateTokenPair(user, {
        ipAddress,
        userAgent,
        deviceId: validSession.deviceId || undefined,
      });

      logger.info('Access token refreshed', { userId: user.id });

      return tokens;
    } catch (error: any) {
      const message = error instanceof Error ? error.message : String(error);
      if (/Can't reach database server|database server|ECONNREFUSED|P1001|P1000|Connection refused/i.test(message)) {
        const decoded = jwt.verify(refreshToken, config.jwt.refreshTokenSecret, {
          issuer: JWT_CONFIG.ISSUER,
          audience: JWT_CONFIG.AUDIENCE,
        }) as { userId: string };

        const user = await devStore.findUserById(decoded.userId);
        if (!user) {
          throw {
            code: ErrorCodes.INVALID_TOKEN,
            message: 'Invalid refresh token',
          };
        }

        const sessions = await devStore.listSessions(user.id);
        let session = null;
        for (const candidate of sessions) {
          const isMatch = await bcrypt.compare(refreshToken, candidate.refreshTokenHash);
          if (isMatch) {
            session = candidate;
            break;
          }
        }

        if (!session || !session.isActive || session.isRevoked || new Date(session.expiresAt) <= new Date()) {
          throw {
            code: ErrorCodes.INVALID_TOKEN,
            message: 'Invalid refresh token',
          };
        }

        await devStore.updateSession(session.id, { lastUsedAt: new Date() });
        const tokens = await this.generateTokenPair({
          id: user.id,
          phoneNumber: user.phoneNumber,
          fullName: user.fullName,
          status: user.status as any,
          isOnboarded: user.isOnboarded,
        }, {
          ipAddress,
          userAgent,
          deviceId: session.deviceId,
        });

        logger.info('Access token refreshed (dev fallback)', { userId: user.id });
        return tokens;
      }

      logger.warn('Token refresh failed', { error: message });

      if (error.name === 'TokenExpiredError') {
        throw {
          code: ErrorCodes.TOKEN_EXPIRED,
          message: 'Refresh token expired',
        };
      }

      throw {
        code: ErrorCodes.INVALID_TOKEN,
        message: 'Invalid refresh token',
      };
    }
  }

  /**
   * Logout user (revoke refresh token)
   */
  async logout(userId: string, refreshToken?: string): Promise<{ message: string }> {
    if (refreshToken) {
      // Revoke specific session
      const sessions = await prisma.userSession.findMany({
        where: {
          userId,
          isActive: true,
        },
      });

      for (const session of sessions) {
        const isMatch = await bcrypt.compare(refreshToken, session.refreshTokenHash);
        if (isMatch) {
          await prisma.userSession.update({
            where: { id: session.id },
            data: {
              isActive: false,
              isRevoked: true,
              revokedAt: new Date(),
              revokeReason: 'User logout',
            },
          });
          break;
        }
      }
    } else {
      // Revoke all sessions for user
      await prisma.userSession.updateMany({
        where: {
          userId,
          isActive: true,
        },
        data: {
          isActive: false,
          isRevoked: true,
          revokedAt: new Date(),
          revokeReason: 'User logout all sessions',
        },
      });
    }

    // Create audit log
    await this.createAuditLog({
      userId,
      action: 'LOGOUT',
      entityType: 'User',
      entityId: userId,
    });

    logger.info('User logged out', { userId });

    return {
      message: 'Logged out successfully',
    };
  }

  /**
   * Request password reset OTP
   */
  async requestPasswordReset(phoneNumber: string, ipAddress?: string, userAgent?: string): Promise<{
    message: string;
    expiresAt: Date;
  }> {
    const normalizedPhone = phoneUtils.normalize(phoneNumber);

    // Find user
    const user = await prisma.user.findUnique({
      where: { phoneNumber: normalizedPhone },
    });

    if (!user) {
      // Don't reveal if user exists for security
      logger.warn('Password reset requested for non-existent user', { phoneNumber: normalizedPhone });
      throw {
        code: ErrorCodes.NOT_FOUND,
        message: 'Phone number is not registered',
      };
    }

    // Generate and send OTP
    const result = await otpService.generateAndSendOtp({
      phoneNumber: normalizedPhone,
      purpose: OtpPurpose.PASSWORD_RESET,
      ipAddress,
      userAgent,
    });

    logger.info('Password reset OTP sent', { userId: user.id });

    return {
      message: result.message,
      expiresAt: result.expiresAt,
    };
  }

  /**
   * Reset password with OTP
   */
  async resetPassword(phoneNumber: string, otpCode: string, newPassword: string): Promise<{
    message: string;
  }> {
    const normalizedPhone = phoneUtils.normalize(phoneNumber);

    // Verify OTP
    const { verified } = await otpService.verifyOtp({
      phoneNumber: normalizedPhone,
      code: otpCode,
      purpose: OtpPurpose.PASSWORD_RESET,
    });

    if (!verified) {
      throw {
        code: ErrorCodes.OTP_INVALID,
        message: ERROR_MESSAGES.OTP_INVALID,
      };
    }

    // Find user
    const user = await prisma.user.findUnique({
      where: { phoneNumber: normalizedPhone },
    });

    if (!user) {
      throw {
        code: ErrorCodes.NOT_FOUND,
        message: 'User not found',
      };
    }

    // Hash new password
    const passwordHash = await bcrypt.hash(newPassword, 12);

    // Update password
    await prisma.user.update({
      where: { id: user.id },
      data: { passwordHash },
    });

    // Revoke all sessions
    await prisma.userSession.updateMany({
      where: { userId: user.id },
      data: {
        isActive: false,
        isRevoked: true,
        revokedAt: new Date(),
        revokeReason: 'Password reset',
      },
    });

    // Create audit log
    await this.createAuditLog({
      userId: user.id,
      action: 'RESET_PASSWORD',
      entityType: 'User',
      entityId: user.id,
    });

    logger.info('Password reset successfully', { userId: user.id });

    return {
      message: 'Password reset successfully',
    };
  }

  /**
   * Request password reset OTP via Email
   */
  async requestPasswordResetByEmail(email: string, ipAddress?: string, userAgent?: string): Promise<{
    message: string;
    expiresAt: Date;
    otpCode?: string; // For development/logging
  }> {
    return this.useDevFallback(
      async () => {
        // Find user
        const user = await prisma.user.findFirst({
          where: { email },
        });

        if (!user) {
          // Don't reveal if user exists for security
          logger.warn('Password reset requested for non-existent email', { email });
          throw {
            code: ErrorCodes.NOT_FOUND,
            message: 'Email is not registered',
          };
        }

        // Generate OTP
        const { code, expiresAt } = await otpService.generateOtp({
          phoneNumber: user.phoneNumber, // We need to pass phoneNumber because otpCode is linked to it mostly, but let's pass email as well
          email: user.email!,
          purpose: OtpPurpose.PASSWORD_RESET,
        });

        console.log(`\n=========================================
📧 EMAIL PASSWORD RESET OTP FOR ${email}: ${code}
=========================================\n`);

        // Send email asynchronously to not block the request
        emailService.sendVerificationEmail(email, code, user.fullName).catch(err => {
          logger.warn('Failed to send email asynchronously, but OTP is generated', { email, error: err });
        });

        logger.info('Password reset OTP generated via email', { userId: user.id });

        return {
          message: SUCCESS_MESSAGES.OTP_SENT,
          expiresAt,
          otpCode: process.env.NODE_ENV === 'development' ? code : undefined,
        };
      },
      async () => {
        throw new Error('Email reset not supported in dev fallback store');
      }
    );
  }

  /**
   * Reset password with OTP via Email
   */
  async resetPasswordByEmail(email: string, otpCode: string, newPassword: string): Promise<{
    message: string;
  }> {
    return this.useDevFallback(
      async () => {
        // Find user
        const user = await prisma.user.findFirst({
          where: { email },
        });

        if (!user) {
          throw {
            code: ErrorCodes.NOT_FOUND,
            message: 'User not found',
          };
        }

        // Verify OTP
        const { verified } = await otpService.verifyOtp({
          phoneNumber: user.phoneNumber,
          email,
          code: otpCode,
          purpose: OtpPurpose.PASSWORD_RESET,
        });

        if (!verified) {
          throw {
            code: ErrorCodes.OTP_INVALID,
            message: ERROR_MESSAGES.OTP_INVALID,
          };
        }

        // Save current password to history
        await prisma.passwordHistory.create({
          data: {
            userId: user.id,
            passwordHash: user.passwordHash,
          }
        });

        // Hash new password
        const passwordHash = await bcrypt.hash(newPassword, 12);

        // Update password
        await prisma.user.update({
          where: { id: user.id },
          data: { passwordHash },
        });

        // Revoke all sessions
        await prisma.userSession.updateMany({
          where: { userId: user.id },
          data: {
            isActive: false,
            isRevoked: true,
            revokedAt: new Date(),
            revokeReason: 'Password reset',
          },
        });

        // Create audit log
        await this.createAuditLog({
          userId: user.id,
          action: 'RESET_PASSWORD',
          entityType: 'User',
          entityId: user.id,
        });

        logger.info('Password reset successfully via email', { userId: user.id });

        return {
          message: 'Password reset successfully',
        };
      },
      async () => {
        throw new Error('Email reset not supported in dev fallback store');
      }
    );
  }


  /**
   * Verify JWT token
   */
  verifyAccessToken(token: string): TokenPayload {
    try {
      const decoded = jwt.verify(token, config.jwt.accessTokenSecret, {
        issuer: JWT_CONFIG.ISSUER,
        audience: JWT_CONFIG.AUDIENCE,
      }) as TokenPayload;

      return decoded;
    } catch (error: any) {
      if (error.name === 'TokenExpiredError') {
        throw {
          code: ErrorCodes.TOKEN_EXPIRED,
          message: 'Access token expired',
        };
      }

      throw {
        code: ErrorCodes.INVALID_TOKEN,
        message: 'Invalid access token',
      };
    }
  }

  /**
   * Update user demographics
   */
  async updateDemographics(userId: string, data: { gender: string; maritalStatus: string; isHeadOfHousehold: boolean; isStudent: boolean }) {
    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        gender: data.gender as any,
        maritalStatus: data.maritalStatus as any,
        isHeadOfHousehold: data.isHeadOfHousehold,
        isStudent: data.isStudent,
      },
    });

    // Create audit log
    await prisma.auditLog.create({
      data: {
        userId,
        action: 'UPDATE',
        entityType: 'User',
        entityId: userId,
        newValues: data as any,
      },
    });

    return user;
  }

  /**
   * Send email verification OTP code
   */
  async sendEmailVerification(phoneNumber: string, email: string): Promise<{
    message: string;
    previewUrl?: string;
    expiresAt: Date;
    otpCode?: string;
  }> {
    const normalizedPhone = phoneUtils.normalize(phoneNumber);

    return this.useDevFallback(
      async () => {
        // Check if email is already taken by a registered and verified user
        const existingEmailUser = await prisma.user.findFirst({
          where: { email },
        });
        if (existingEmailUser && existingEmailUser.emailVerifiedAt && existingEmailUser.phoneNumber !== normalizedPhone) {
          throw { code: ErrorCodes.CONFLICT, message: ERROR_MESSAGES.EMAIL_ALREADY_EXISTS };
        }

        // Generate OTP in OtpCode table (this works even if User doesn't exist)
        const { code, expiresAt } = await otpService.generateOtp({
          phoneNumber: normalizedPhone,
          email,
          purpose: OtpPurpose.EMAIL_VERIFICATION,
        });

        // Try to get user's name if they exist, otherwise use 'مستخدم جديد'
        let userName = 'مستخدم جديد';
        const user = await prisma.user.findUnique({ where: { phoneNumber: normalizedPhone } });
        if (user) {
          userName = user.fullName;
          // Optionally link the email to the user if they exist but haven't verified
          if (!user.emailVerifiedAt) {
            await prisma.user.update({
              where: { id: user.id },
              data: { email },
            });
          }
        }

        // Send email with OTP
        let result: any = {};
        console.log(`\n=========================================
📧 EMAIL OTP FOR ${email}: ${code}
=========================================\n`);
        try {
          result = await emailService.sendVerificationEmail(email, code, userName);
          logger.info('Email verification OTP sent', { phone: normalizedPhone, email });
        } catch (err) {
          logger.warn('Failed to send email, but continuing for dev mode', { email, error: err });
        }

        return {
          message: SUCCESS_MESSAGES.OTP_SENT,
          previewUrl: result.previewUrl,
          expiresAt,
          otpCode: process.env.NODE_ENV === 'development' ? code : undefined,
        };
      },
      async () => {
        // Dev fallback
        const code = Math.floor(100000 + Math.random() * 900000).toString();
        const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

        console.log(`\n=========================================\n📧 EMAIL OTP FOR ${email}: ${code}\n=========================================\n`);

        const result = await emailService.sendVerificationEmail(email, code, normalizedPhone);

        logger.info('Email verification OTP sent', { phone: normalizedPhone, email, previewUrl: result?.previewUrl });

        return {
          message: SUCCESS_MESSAGES.OTP_SENT,
          previewUrl: result.previewUrl,
          expiresAt,
          otpCode: code,
        };
      }
    );
  }

  /**
   * Verify email with OTP code
   */
  async verifyEmailWithOtp(phoneNumber: string, email: string, otpCode: string): Promise<{ message: string; verified: boolean }> {
    const normalizedPhone = phoneUtils.normalize(phoneNumber);

    return this.useDevFallback(
      async () => {
        // Verify the OTP code
        const { verified } = await otpService.verifyOtp({
          phoneNumber: normalizedPhone,
          email,
          code: otpCode,
          purpose: OtpPurpose.EMAIL_VERIFICATION,
        });

        if (!verified) {
          throw { code: ErrorCodes.OTP_INVALID, message: ERROR_MESSAGES.OTP_INVALID };
        }

        // If user already exists, update their emailVerifiedAt
        const user = await prisma.user.findUnique({
          where: { phoneNumber: normalizedPhone },
        });

        if (user) {
          await prisma.user.update({
            where: { id: user.id },
            data: {
              email,
              emailVerifiedAt: new Date(),
            },
          });
        }

        logger.info('Email verified successfully via OTP', { phone: normalizedPhone, email });

        return { message: 'Email verified successfully', verified: true };
      },
      async () => {
        // In dev fallback, just log the verification
        logger.info('Email verified (dev fallback)', { phone: normalizedPhone, email, otpCode });
        return { message: 'Email verified successfully', verified: true };
      }
    );
  }

  /**
   * Check email verification status
   */
  async checkEmailStatus(phoneNumber: string): Promise<{ verified: boolean; email?: string }> {
    const normalizedPhone = phoneUtils.normalize(phoneNumber);

    return this.useDevFallback(
      async () => {
        const user = await prisma.user.findUnique({
          where: { phoneNumber: normalizedPhone },
          select: { email: true, emailVerifiedAt: true },
        });

        if (!user) {
          throw { code: ErrorCodes.NOT_FOUND, message: 'User not found' };
        }

        return {
          verified: !!user.emailVerifiedAt,
          email: user.email || undefined,
        };
      },
      async () => {
        return { verified: false, email: undefined };
      }
    );
  }

  /**
   * Create audit log entry
   */
  private async createAuditLog(data: {
    userId?: string;
    action: string;
    entityType: string;
    entityId?: string;
    oldValues?: any;
    newValues?: any;
    ipAddress?: string;
    userAgent?: string;
    method?: string;
    endpoint?: string;
  }): Promise<void> {
    try {
      await prisma.auditLog.create({
        data: {
          userId: data.userId,
          action: data.action as any,
          entityType: data.entityType,
          entityId: data.entityId,
          oldValues: data.oldValues,
          newValues: data.newValues,
          ipAddress: data.ipAddress,
          userAgent: data.userAgent,
          method: data.method,
          endpoint: data.endpoint,
        },
      });
    } catch (error) {
      logger.error('Failed to create audit log', { error });
    }
  }
}

export const authService = new AuthService();
