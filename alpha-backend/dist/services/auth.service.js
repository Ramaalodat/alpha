"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authService = exports.AuthService = void 0;
const client_1 = require("@prisma/client");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const crypto_1 = __importDefault(require("crypto"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const helpers_1 = require("../utils/helpers");
const constants_1 = require("../utils/constants");
const api_types_1 = require("../types/api.types");
const logger_1 = __importDefault(require("../utils/logger"));
const otp_service_1 = require("./otp.service");
const config_1 = __importDefault(require("../config/config"));
const devStore_1 = require("../utils/devStore");
const prisma = new client_1.PrismaClient();
const devStore = (0, devStore_1.createDevStore)();
class AuthService {
    async useDevFallback(operation, fallback) {
        const forceFallback = process.env.FORCE_DEV_FALLBACK === '1' || process.env.USE_DEV_FALLBACK === '1';
        if (forceFallback && fallback) {
            return fallback();
        }
        try {
            return await operation();
        }
        catch (err) {
            const e = err;
            const msg = e?.message || '';
            // If DB auth/connect errors occur, use the fallback store when available
            if (fallback && (msg.includes('Authentication failed') || msg.includes("Can't reach database server") || msg.includes('P100'))) {
                return await fallback();
            }
            throw e;
        }
    }
    /**
     * Register new user
     */
    async register(params) {
        const { phoneNumber, fullName, birthDate, password, ipAddress, userAgent } = params;
        // Normalize phone number
        const normalizedPhone = helpers_1.phoneUtils.normalize(phoneNumber);
        return this.useDevFallback(async () => {
            // Check if phone number already exists
            const existingUser = await prisma.user.findUnique({
                where: { phoneNumber: normalizedPhone },
            });
            if (existingUser) {
                logger_1.default.warn('Registration failed - phone number exists', { phoneNumber: normalizedPhone });
                throw {
                    code: api_types_1.ErrorCodes.PHONE_NUMBER_EXISTS,
                    message: constants_1.ERROR_MESSAGES.PHONE_EXISTS,
                };
            }
            // Hash password
            const passwordHash = await bcryptjs_1.default.hash(password, 12);
            // Parse birth date
            const birthDateObj = new Date(birthDate);
            // Create user
            const user = await prisma.user.create({
                data: {
                    phoneNumber: normalizedPhone,
                    fullName,
                    birthDate: birthDateObj,
                    passwordHash,
                    status: client_1.UserStatus.PENDING_VERIFICATION,
                    isOnboarded: false,
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
            await otp_service_1.otpService.generateAndSendOtp({
                phoneNumber: normalizedPhone,
                purpose: client_1.OtpPurpose.REGISTRATION,
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
            logger_1.default.info('User registered successfully', {
                userId: user.id,
                phoneNumber: normalizedPhone,
            });
            return {
                user,
                message: constants_1.SUCCESS_MESSAGES.USER_REGISTERED + '. ' + constants_1.SUCCESS_MESSAGES.OTP_SENT,
            };
        }, async () => {
            const existingUser = await devStore.findUserByPhone(normalizedPhone);
            if (existingUser) {
                logger_1.default.warn('Registration failed - phone number exists (dev fallback)', { phoneNumber: normalizedPhone });
                throw {
                    code: api_types_1.ErrorCodes.PHONE_NUMBER_EXISTS,
                    message: constants_1.ERROR_MESSAGES.PHONE_EXISTS,
                };
            }
            const passwordHash = await bcryptjs_1.default.hash(password, 12);
            const birthDateObj = new Date(birthDate);
            const user = await devStore.createUser({
                id: `dev-${Date.now()}`,
                phoneNumber: normalizedPhone,
                fullName,
                birthDate: birthDateObj,
                passwordHash,
                status: client_1.UserStatus.PENDING_VERIFICATION,
                isOnboarded: false,
            });
            await otp_service_1.otpService.generateAndSendOtp({
                phoneNumber: normalizedPhone,
                purpose: client_1.OtpPurpose.REGISTRATION,
                ipAddress,
                userAgent,
            });
            logger_1.default.info('User registered successfully (dev fallback)', {
                userId: user.id,
                phoneNumber: normalizedPhone,
            });
            return {
                user: {
                    id: user.id,
                    phoneNumber: user.phoneNumber,
                    fullName: user.fullName,
                    birthDate: user.birthDate,
                    status: user.status,
                    isOnboarded: user.isOnboarded,
                    createdAt: user.createdAt,
                },
                message: constants_1.SUCCESS_MESSAGES.USER_REGISTERED + '. ' + constants_1.SUCCESS_MESSAGES.OTP_SENT,
            };
        });
    }
    /**
     * Verify phone number with OTP and activate account
     */
    async verifyPhone(phoneNumber, otpCode) {
        const normalizedPhone = helpers_1.phoneUtils.normalize(phoneNumber);
        const { verified } = await otp_service_1.otpService.verifyOtp({
            phoneNumber: normalizedPhone,
            code: otpCode,
            purpose: client_1.OtpPurpose.REGISTRATION,
        });
        if (!verified) {
            throw {
                code: api_types_1.ErrorCodes.OTP_INVALID,
                message: constants_1.ERROR_MESSAGES.OTP_INVALID,
            };
        }
        return this.useDevFallback(async () => {
            // Find user
            const user = await prisma.user.findUnique({
                where: { phoneNumber: normalizedPhone },
            });
            if (!user) {
                throw {
                    code: api_types_1.ErrorCodes.NOT_FOUND,
                    message: 'المستخدم غير موجود',
                };
            }
            // Update user status to VERIFIED
            const updatedUser = await prisma.user.update({
                where: { id: user.id },
                data: {
                    status: client_1.UserStatus.VERIFIED,
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
                newValues: { status: client_1.UserStatus.VERIFIED },
            });
            logger_1.default.info('Phone verified successfully', {
                userId: updatedUser.id,
                phoneNumber: normalizedPhone,
            });
            return {
                user: updatedUser,
                tokens,
                message: constants_1.SUCCESS_MESSAGES.ACCOUNT_VERIFIED,
            };
        }, async () => {
            const user = await devStore.findUserByPhone(normalizedPhone);
            logger_1.default.info('Dev fallback phone verification lookup', {
                normalizedPhone,
                userFound: !!user,
                userId: user?.id,
            });
            if (!user) {
                throw {
                    code: api_types_1.ErrorCodes.NOT_FOUND,
                    message: 'المستخدم غير موجود',
                };
            }
            const updatedUser = await devStore.updateUser(normalizedPhone, {
                status: client_1.UserStatus.VERIFIED,
                phoneVerifiedAt: new Date(),
            });
            logger_1.default.info('Dev fallback phone verification update', {
                normalizedPhone,
                updatedUserId: updatedUser?.id,
                updatedStatus: updatedUser?.status,
            });
            const tokens = await this.generateTokenPair({
                id: updatedUser?.id,
                phoneNumber: updatedUser?.phoneNumber,
                fullName: updatedUser?.fullName,
                status: updatedUser?.status,
                isOnboarded: updatedUser?.isOnboarded,
            });
            logger_1.default.info('Phone verified successfully (dev fallback)', {
                userId: updatedUser?.id,
                phoneNumber: normalizedPhone,
            });
            return {
                user: updatedUser ? {
                    id: updatedUser.id,
                    phoneNumber: updatedUser.phoneNumber,
                    fullName: updatedUser.fullName,
                    birthDate: updatedUser.birthDate,
                    status: updatedUser.status,
                    isOnboarded: updatedUser.isOnboarded,
                    phoneVerifiedAt: updatedUser.phoneVerifiedAt ?? null,
                    createdAt: updatedUser.createdAt,
                } : {
                    id: user.id,
                    phoneNumber: user.phoneNumber,
                    fullName: user.fullName,
                    birthDate: user.birthDate,
                    status: user.status,
                    isOnboarded: user.isOnboarded,
                    phoneVerifiedAt: user.phoneVerifiedAt ?? null,
                    createdAt: user.createdAt,
                },
                tokens,
                message: constants_1.SUCCESS_MESSAGES.ACCOUNT_VERIFIED,
            };
        });
    }
    /**
     * Login user
     */
    async login(params) {
        const { phoneNumber, password, ipAddress, userAgent, deviceId } = params;
        // Normalize phone number
        const normalizedPhone = helpers_1.phoneUtils.normalize(phoneNumber);
        return this.useDevFallback(async () => {
            // Find user
            const user = await prisma.user.findUnique({
                where: { phoneNumber: normalizedPhone },
            });
            if (!user) {
                logger_1.default.warn('Login failed - user not found', { phoneNumber: normalizedPhone });
                throw {
                    code: api_types_1.ErrorCodes.INVALID_CREDENTIALS,
                    message: constants_1.ERROR_MESSAGES.INVALID_CREDENTIALS,
                };
            }
            // Check if account is suspended
            if (user.status === client_1.UserStatus.SUSPENDED) {
                logger_1.default.warn('Login failed - account suspended', { userId: user.id });
                throw {
                    code: api_types_1.ErrorCodes.ACCOUNT_SUSPENDED,
                    message: constants_1.ERROR_MESSAGES.ACCOUNT_SUSPENDED,
                };
            }
            // Check if account is verified
            if (user.status === client_1.UserStatus.PENDING_VERIFICATION) {
                logger_1.default.warn('Login failed - account not verified', { userId: user.id });
                throw {
                    code: api_types_1.ErrorCodes.ACCOUNT_NOT_VERIFIED,
                    message: constants_1.ERROR_MESSAGES.ACCOUNT_NOT_VERIFIED,
                };
            }
            // Verify password
            const passwordMatch = await bcryptjs_1.default.compare(password, user.passwordHash);
            if (!passwordMatch) {
                logger_1.default.warn('Login failed - invalid password', { userId: user.id });
                throw {
                    code: api_types_1.ErrorCodes.INVALID_CREDENTIALS,
                    message: constants_1.ERROR_MESSAGES.INVALID_CREDENTIALS,
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
            logger_1.default.info('User logged in successfully', {
                userId: updatedUser.id,
                phoneNumber: normalizedPhone,
            });
            return {
                user: updatedUser,
                tokens,
                message: constants_1.SUCCESS_MESSAGES.LOGIN_SUCCESS,
            };
        }, async () => {
            const user = await devStore.findUserByPhone(normalizedPhone);
            if (!user) {
                logger_1.default.warn('Login failed - user not found (dev fallback)', { phoneNumber: normalizedPhone });
                throw {
                    code: api_types_1.ErrorCodes.INVALID_CREDENTIALS,
                    message: constants_1.ERROR_MESSAGES.INVALID_CREDENTIALS,
                };
            }
            if (user.status === client_1.UserStatus.SUSPENDED) {
                logger_1.default.warn('Login failed - account suspended (dev fallback)', { userId: user.id });
                throw {
                    code: api_types_1.ErrorCodes.ACCOUNT_SUSPENDED,
                    message: constants_1.ERROR_MESSAGES.ACCOUNT_SUSPENDED,
                };
            }
            if (user.status === client_1.UserStatus.PENDING_VERIFICATION) {
                logger_1.default.warn('Login failed - account not verified (dev fallback)', { userId: user.id });
                throw {
                    code: api_types_1.ErrorCodes.ACCOUNT_NOT_VERIFIED,
                    message: constants_1.ERROR_MESSAGES.ACCOUNT_NOT_VERIFIED,
                };
            }
            const passwordMatch = await bcryptjs_1.default.compare(password, user.passwordHash);
            if (!passwordMatch) {
                logger_1.default.warn('Login failed - invalid password (dev fallback)', { userId: user.id });
                throw {
                    code: api_types_1.ErrorCodes.INVALID_CREDENTIALS,
                    message: constants_1.ERROR_MESSAGES.INVALID_CREDENTIALS,
                };
            }
            const updatedUser = await devStore.updateUser(normalizedPhone, { lastLoginAt: new Date() });
            const tokens = await this.generateTokenPair({
                id: updatedUser?.id,
                phoneNumber: updatedUser?.phoneNumber,
                fullName: updatedUser?.fullName,
                status: updatedUser?.status,
                isOnboarded: updatedUser?.isOnboarded,
            }, {
                ipAddress,
                userAgent,
                deviceId,
            });
            logger_1.default.info('User logged in successfully (dev fallback)', {
                userId: updatedUser?.id,
                phoneNumber: normalizedPhone,
            });
            return {
                user: updatedUser ? {
                    id: updatedUser.id,
                    phoneNumber: updatedUser.phoneNumber,
                    fullName: updatedUser.fullName,
                    birthDate: updatedUser.birthDate,
                    status: updatedUser.status,
                    isOnboarded: updatedUser.isOnboarded,
                    lastLoginAt: updatedUser.lastLoginAt ?? null,
                    createdAt: updatedUser.createdAt,
                } : {
                    id: user.id,
                    phoneNumber: user.phoneNumber,
                    fullName: user.fullName,
                    birthDate: user.birthDate,
                    status: user.status,
                    isOnboarded: user.isOnboarded,
                    lastLoginAt: user.lastLoginAt ?? null,
                    createdAt: user.createdAt,
                },
                tokens,
                message: constants_1.SUCCESS_MESSAGES.LOGIN_SUCCESS,
            };
        });
    }
    /**
     * Generate access and refresh token pair
     */
    async generateTokenPair(user, sessionData) {
        const payload = {
            userId: user.id,
            phoneNumber: user.phoneNumber,
            fullName: user.fullName,
            status: user.status,
            isOnboarded: user.isOnboarded,
        };
        // Generate access token
        const accessToken = jsonwebtoken_1.default.sign(payload, config_1.default.jwt.accessTokenSecret, {
            expiresIn: constants_1.JWT_CONFIG.ACCESS_TOKEN_EXPIRY,
            issuer: constants_1.JWT_CONFIG.ISSUER,
            audience: constants_1.JWT_CONFIG.AUDIENCE,
        });
        // Generate refresh token with a unique identifier
        const refreshTokenId = crypto_1.default.randomUUID();
        const refreshToken = jsonwebtoken_1.default.sign({ userId: user.id }, config_1.default.jwt.refreshTokenSecret, {
            expiresIn: constants_1.JWT_CONFIG.REFRESH_TOKEN_EXPIRY,
            issuer: constants_1.JWT_CONFIG.ISSUER,
            audience: constants_1.JWT_CONFIG.AUDIENCE,
            jwtid: refreshTokenId,
        });
        // Hash refresh token for storage
        const refreshTokenHash = await bcryptjs_1.default.hash(refreshToken, 10);
        // Calculate expiration date (7 days)
        const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
        const forceFallback = process.env.FORCE_DEV_FALLBACK === '1' || process.env.USE_DEV_FALLBACK === '1';
        if (forceFallback) {
            // Use dev store for sessions when forced into fallback mode
            await devStore.createSession({
                userId: user.id,
                refreshTokenHash,
                expiresAt,
                ipAddress: sessionData?.ipAddress,
                userAgent: sessionData?.userAgent,
                deviceId: sessionData?.deviceId,
                isActive: true,
                isRevoked: false,
            });
        }
        else {
            try {
                await prisma.userSession.create({
                    data: {
                        userId: user.id,
                        refreshTokenHash,
                        expiresAt,
                        ipAddress: sessionData?.ipAddress,
                        userAgent: sessionData?.userAgent,
                        deviceId: sessionData?.deviceId,
                        isActive: true,
                    },
                });
            }
            catch (error) {
                const message = error instanceof Error ? error.message : String(error);
                if (/Can't reach database server|database server|ECONNREFUSED|P1001|P1000|Connection refused/i.test(message)) {
                    await devStore.createSession({
                        userId: user.id,
                        refreshTokenHash,
                        expiresAt,
                        ipAddress: sessionData?.ipAddress,
                        userAgent: sessionData?.userAgent,
                        deviceId: sessionData?.deviceId,
                        isActive: true,
                        isRevoked: false,
                    });
                }
                else {
                    throw error;
                }
            }
        }
        logger_1.default.debug('Token pair generated', { userId: user.id });
        return {
            accessToken,
            refreshToken,
        };
    }
    /**
     * Refresh access token using refresh token
     */
    async refreshAccessToken(params) {
        const { refreshToken, ipAddress, userAgent } = params;
        try {
            // Verify refresh token
            const decoded = jsonwebtoken_1.default.verify(refreshToken, config_1.default.jwt.refreshTokenSecret, {
                issuer: constants_1.JWT_CONFIG.ISSUER,
                audience: constants_1.JWT_CONFIG.AUDIENCE,
            });
            const forceFallback = process.env.FORCE_DEV_FALLBACK === '1' || process.env.USE_DEV_FALLBACK === '1';
            if (forceFallback) {
                // Use dev store flow
                const user = await devStore.findUserById(decoded.userId);
                if (!user) {
                    throw {
                        code: api_types_1.ErrorCodes.INVALID_TOKEN,
                        message: 'Invalid refresh token',
                    };
                }
                const sessions = await devStore.listSessions(user.id);
                let session = null;
                for (const candidate of sessions) {
                    const isMatch = await bcryptjs_1.default.compare(refreshToken, candidate.refreshTokenHash);
                    if (isMatch) {
                        session = candidate;
                        break;
                    }
                }
                if (!session || !session.isActive || session.isRevoked || new Date(session.expiresAt) <= new Date()) {
                    throw {
                        code: api_types_1.ErrorCodes.INVALID_TOKEN,
                        message: 'Invalid refresh token',
                    };
                }
                await devStore.updateSession(session.id, { lastUsedAt: new Date() });
                const tokens = await this.generateTokenPair({
                    id: user.id,
                    phoneNumber: user.phoneNumber,
                    fullName: user.fullName,
                    status: user.status,
                    isOnboarded: user.isOnboarded,
                }, {
                    ipAddress,
                    userAgent,
                    deviceId: session.deviceId,
                });
                logger_1.default.info('Access token refreshed (dev fallback)', { userId: user.id });
                return tokens;
            }
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
                    code: api_types_1.ErrorCodes.INVALID_TOKEN,
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
                const isMatch = await bcryptjs_1.default.compare(refreshToken, session.refreshTokenHash);
                if (isMatch) {
                    validSession = session;
                    break;
                }
            }
            if (!validSession) {
                throw {
                    code: api_types_1.ErrorCodes.INVALID_TOKEN,
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
            logger_1.default.info('Access token refreshed', { userId: user.id });
            return tokens;
        }
        catch (error) {
            const message = error instanceof Error ? error.message : String(error);
            if (/Can't reach database server|database server|ECONNREFUSED|P1001|P1000|Connection refused/i.test(message)) {
                const decoded = jsonwebtoken_1.default.verify(refreshToken, config_1.default.jwt.refreshTokenSecret, {
                    issuer: constants_1.JWT_CONFIG.ISSUER,
                    audience: constants_1.JWT_CONFIG.AUDIENCE,
                });
                const user = await devStore.findUserById(decoded.userId);
                if (!user) {
                    throw {
                        code: api_types_1.ErrorCodes.INVALID_TOKEN,
                        message: 'Invalid refresh token',
                    };
                }
                const sessions = await devStore.listSessions(user.id);
                let session = null;
                for (const candidate of sessions) {
                    const isMatch = await bcryptjs_1.default.compare(refreshToken, candidate.refreshTokenHash);
                    if (isMatch) {
                        session = candidate;
                        break;
                    }
                }
                if (!session || !session.isActive || session.isRevoked || new Date(session.expiresAt) <= new Date()) {
                    throw {
                        code: api_types_1.ErrorCodes.INVALID_TOKEN,
                        message: 'Invalid refresh token',
                    };
                }
                await devStore.updateSession(session.id, { lastUsedAt: new Date() });
                const tokens = await this.generateTokenPair({
                    id: user.id,
                    phoneNumber: user.phoneNumber,
                    fullName: user.fullName,
                    status: user.status,
                    isOnboarded: user.isOnboarded,
                }, {
                    ipAddress,
                    userAgent,
                    deviceId: session.deviceId,
                });
                logger_1.default.info('Access token refreshed (dev fallback)', { userId: user.id });
                return tokens;
            }
            logger_1.default.warn('Token refresh failed', { error: message });
            if (error.name === 'TokenExpiredError') {
                throw {
                    code: api_types_1.ErrorCodes.TOKEN_EXPIRED,
                    message: 'Refresh token expired',
                };
            }
            throw {
                code: api_types_1.ErrorCodes.INVALID_TOKEN,
                message: 'Invalid refresh token',
            };
        }
    }
    /**
     * Logout user (revoke refresh token)
     */
    async logout(userId, refreshToken) {
        if (refreshToken) {
            // Revoke specific session
            const sessions = await prisma.userSession.findMany({
                where: {
                    userId,
                    isActive: true,
                },
            });
            for (const session of sessions) {
                const isMatch = await bcryptjs_1.default.compare(refreshToken, session.refreshTokenHash);
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
                }
            }
        }
        else {
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
        logger_1.default.info('User logged out', { userId });
        return {
            message: 'تم تسجيل الخروج بنجاح',
        };
    }
    /**
     * Request password reset OTP
     */
    async requestPasswordReset(phoneNumber, ipAddress, userAgent) {
        const normalizedPhone = helpers_1.phoneUtils.normalize(phoneNumber);
        // Find user
        const user = await prisma.user.findUnique({
            where: { phoneNumber: normalizedPhone },
        });
        if (!user) {
            // Don't reveal if user exists for security
            logger_1.default.warn('Password reset requested for non-existent user', { phoneNumber: normalizedPhone });
            throw {
                code: api_types_1.ErrorCodes.NOT_FOUND,
                message: 'رقم الهاتف غير مسجل',
            };
        }
        // Generate and send OTP
        const result = await otp_service_1.otpService.generateAndSendOtp({
            phoneNumber: normalizedPhone,
            purpose: client_1.OtpPurpose.PASSWORD_RESET,
            ipAddress,
            userAgent,
        });
        logger_1.default.info('Password reset OTP sent', { userId: user.id });
        return {
            message: result.message,
            expiresAt: result.expiresAt,
        };
    }
    /**
     * Reset password with OTP
     */
    async resetPassword(phoneNumber, otpCode, newPassword) {
        const normalizedPhone = helpers_1.phoneUtils.normalize(phoneNumber);
        // Verify OTP
        const { verified } = await otp_service_1.otpService.verifyOtp({
            phoneNumber: normalizedPhone,
            code: otpCode,
            purpose: client_1.OtpPurpose.PASSWORD_RESET,
        });
        if (!verified) {
            throw {
                code: api_types_1.ErrorCodes.OTP_INVALID,
                message: constants_1.ERROR_MESSAGES.OTP_INVALID,
            };
        }
        // Find user
        const user = await prisma.user.findUnique({
            where: { phoneNumber: normalizedPhone },
        });
        if (!user) {
            throw {
                code: api_types_1.ErrorCodes.NOT_FOUND,
                message: 'المستخدم غير موجود',
            };
        }
        // Hash new password
        const passwordHash = await bcryptjs_1.default.hash(newPassword, 12);
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
        logger_1.default.info('Password reset successfully', { userId: user.id });
        return {
            message: 'تم إعادة تعيين كلمة المرور بنجاح',
        };
    }
    /**
     * Verify JWT token
     */
    verifyAccessToken(token) {
        try {
            const decoded = jsonwebtoken_1.default.verify(token, config_1.default.jwt.accessTokenSecret, {
                issuer: constants_1.JWT_CONFIG.ISSUER,
                audience: constants_1.JWT_CONFIG.AUDIENCE,
            });
            return decoded;
        }
        catch (error) {
            if (error.name === 'TokenExpiredError') {
                throw {
                    code: api_types_1.ErrorCodes.TOKEN_EXPIRED,
                    message: 'Access token expired',
                };
            }
            throw {
                code: api_types_1.ErrorCodes.INVALID_TOKEN,
                message: 'Invalid access token',
            };
        }
    }
    /**
     * Create audit log entry
     */
    async createAuditLog(data) {
        try {
            await prisma.auditLog.create({
                data: {
                    userId: data.userId,
                    action: data.action,
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
        }
        catch (error) {
            logger_1.default.error('Failed to create audit log', { error });
        }
    }
}
exports.AuthService = AuthService;
exports.authService = new AuthService();
//# sourceMappingURL=auth.service.js.map