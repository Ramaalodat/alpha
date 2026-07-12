"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.otpService = exports.OtpService = void 0;
const client_1 = require("@prisma/client");
const helpers_1 = require("../utils/helpers");
const constants_1 = require("../utils/constants");
const api_types_1 = require("../types/api.types");
const logger_1 = __importDefault(require("../utils/logger"));
const devStore_1 = require("../utils/devStore");
const prisma = new client_1.PrismaClient();
const devStore = (0, devStore_1.createDevStore)();
class OtpService {
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
            if (fallback && (msg.includes('Authentication failed') || msg.includes("Can't reach database server") || msg.includes('P100'))) {
                return await fallback();
            }
            throw e;
        }
    }
    /**
     * Generate and store OTP code
     */
    async generateOtp(params) {
        const { phoneNumber, purpose, ipAddress, userAgent } = params;
        // Normalize phone number
        const normalizedPhone = helpers_1.phoneUtils.normalize(phoneNumber);
        return this.useDevFallback(async () => {
            // Check rate limits
            const rateLimitCheck = await this.checkRateLimit(normalizedPhone, purpose);
            if (!rateLimitCheck.canSend) {
                logger_1.default.warn('OTP rate limit exceeded', { phoneNumber: normalizedPhone, purpose, reason: rateLimitCheck.reason });
                throw {
                    code: api_types_1.ErrorCodes.OTP_RATE_LIMIT_EXCEEDED,
                    message: constants_1.ERROR_MESSAGES.RATE_LIMIT_EXCEEDED,
                    details: rateLimitCheck,
                };
            }
            // Invalidate previous unused OTP codes for this phone and purpose
            await this.invalidatePreviousOtps(normalizedPhone, purpose);
            // Generate 6-digit OTP code
            const code = helpers_1.stringUtils.randomNumeric(constants_1.OTP_CONFIG.LENGTH);
            // Calculate expiration time
            const expiresAt = new Date(Date.now() + constants_1.OTP_CONFIG.EXPIRY_MINUTES * 60 * 1000);
            // Store OTP in database
            const otp = await prisma.otpCode.create({
                data: {
                    phoneNumber: normalizedPhone,
                    code,
                    purpose,
                    expiresAt,
                    ipAddress,
                    userAgent,
                    isUsed: false,
                    attempts: 0,
                },
            });
            logger_1.default.info('OTP generated', {
                phoneNumber: normalizedPhone,
                purpose,
                otpId: otp.id,
                expiresAt: otp.expiresAt,
            });
            return {
                code,
                expiresAt,
            };
        }, async () => {
            const code = helpers_1.stringUtils.randomNumeric(constants_1.OTP_CONFIG.LENGTH);
            const expiresAt = new Date(Date.now() + constants_1.OTP_CONFIG.EXPIRY_MINUTES * 60 * 1000);
            await devStore.createOtp({
                phoneNumber: normalizedPhone,
                code,
                purpose,
                isUsed: false,
                attempts: 0,
                expiresAt,
            });
            logger_1.default.info('OTP generated (dev fallback)', {
                phoneNumber: normalizedPhone,
                purpose,
                expiresAt,
            });
            return { code, expiresAt };
        });
    }
    /**
     * Verify OTP code
     */
    async verifyOtp(params) {
        const { phoneNumber, code, purpose } = params;
        // Normalize phone number
        const normalizedPhone = helpers_1.phoneUtils.normalize(phoneNumber);
        return this.useDevFallback(async () => {
            // Find the most recent OTP for this phone and purpose
            const otp = await prisma.otpCode.findFirst({
                where: {
                    phoneNumber: normalizedPhone,
                    purpose,
                    isUsed: false,
                },
                orderBy: {
                    createdAt: 'desc',
                },
            });
            // OTP not found
            if (!otp) {
                logger_1.default.warn('OTP not found', { phoneNumber: normalizedPhone, purpose });
                throw {
                    code: api_types_1.ErrorCodes.OTP_INVALID,
                    message: constants_1.ERROR_MESSAGES.OTP_INVALID,
                };
            }
            // Check if OTP has expired
            if (new Date() > otp.expiresAt) {
                logger_1.default.warn('OTP expired', { phoneNumber: normalizedPhone, purpose, otpId: otp.id });
                throw {
                    code: api_types_1.ErrorCodes.OTP_EXPIRED,
                    message: constants_1.ERROR_MESSAGES.OTP_EXPIRED,
                };
            }
            // Check max attempts
            if (otp.attempts >= constants_1.OTP_CONFIG.MAX_ATTEMPTS) {
                logger_1.default.warn('OTP max attempts exceeded', { phoneNumber: normalizedPhone, purpose, otpId: otp.id });
                throw {
                    code: api_types_1.ErrorCodes.OTP_MAX_ATTEMPTS_EXCEEDED,
                    message: constants_1.ERROR_MESSAGES.OTP_MAX_ATTEMPTS,
                };
            }
            // Verify code
            if (otp.code !== code) {
                // Increment attempts
                await prisma.otpCode.update({
                    where: { id: otp.id },
                    data: { attempts: otp.attempts + 1 },
                });
                logger_1.default.warn('OTP verification failed - invalid code', {
                    phoneNumber: normalizedPhone,
                    purpose,
                    otpId: otp.id,
                    attempts: otp.attempts + 1,
                });
                throw {
                    code: api_types_1.ErrorCodes.OTP_INVALID,
                    message: constants_1.ERROR_MESSAGES.OTP_INVALID,
                    details: {
                        remainingAttempts: constants_1.OTP_CONFIG.MAX_ATTEMPTS - (otp.attempts + 1),
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
            logger_1.default.info('OTP verified successfully', {
                phoneNumber: normalizedPhone,
                purpose,
                otpId: otp.id,
            });
            return {
                verified: true,
                userId: otp.userId || undefined,
            };
        }, async () => {
            const otp = await devStore.findLatestOtp(normalizedPhone, purpose);
            if (!otp) {
                logger_1.default.warn('OTP not found (dev fallback)', { phoneNumber: normalizedPhone, purpose });
                throw {
                    code: api_types_1.ErrorCodes.OTP_INVALID,
                    message: constants_1.ERROR_MESSAGES.OTP_INVALID,
                };
            }
            if (new Date() > otp.expiresAt) {
                logger_1.default.warn('OTP expired (dev fallback)', { phoneNumber: normalizedPhone, purpose, otpId: otp.id });
                throw {
                    code: api_types_1.ErrorCodes.OTP_EXPIRED,
                    message: constants_1.ERROR_MESSAGES.OTP_EXPIRED,
                };
            }
            if (otp.attempts >= constants_1.OTP_CONFIG.MAX_ATTEMPTS) {
                logger_1.default.warn('OTP max attempts exceeded (dev fallback)', { phoneNumber: normalizedPhone, purpose, otpId: otp.id });
                throw {
                    code: api_types_1.ErrorCodes.OTP_MAX_ATTEMPTS_EXCEEDED,
                    message: constants_1.ERROR_MESSAGES.OTP_MAX_ATTEMPTS,
                };
            }
            if (otp.code !== code) {
                await devStore.incrementOtpAttempts(otp.id);
                logger_1.default.warn('OTP verification failed - invalid code (dev fallback)', {
                    phoneNumber: normalizedPhone,
                    purpose,
                    otpId: otp.id,
                    attempts: otp.attempts + 1,
                });
                throw {
                    code: api_types_1.ErrorCodes.OTP_INVALID,
                    message: constants_1.ERROR_MESSAGES.OTP_INVALID,
                    details: {
                        remainingAttempts: constants_1.OTP_CONFIG.MAX_ATTEMPTS - (otp.attempts + 1),
                    },
                };
            }
            await devStore.markOtpUsed(otp.id);
            logger_1.default.info('OTP verified successfully (dev fallback)', {
                phoneNumber: normalizedPhone,
                purpose,
                otpId: otp.id,
            });
            return { verified: true };
        });
    }
    /**
     * Check if user can request new OTP (rate limiting)
     */
    async checkRateLimit(phoneNumber, purpose) {
        const normalizedPhone = helpers_1.phoneUtils.normalize(phoneNumber);
        // Time window for rate limiting
        const windowStart = new Date(Date.now() - constants_1.OTP_CONFIG.RATE_LIMIT_WINDOW_MINUTES * 60 * 1000);
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
        if (recentOtpCount >= constants_1.OTP_CONFIG.MAX_ATTEMPTS) {
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
                ? new Date(oldestInWindow.createdAt.getTime() + constants_1.OTP_CONFIG.RATE_LIMIT_WINDOW_MINUTES * 60 * 1000)
                : new Date(Date.now() + constants_1.OTP_CONFIG.RATE_LIMIT_WINDOW_MINUTES * 60 * 1000);
            return {
                canSend: false,
                remainingAttempts: 0,
                blockedUntil,
                reason: `Maximum ${constants_1.OTP_CONFIG.MAX_ATTEMPTS} OTPs per ${constants_1.OTP_CONFIG.RATE_LIMIT_WINDOW_MINUTES} minutes`,
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
        if (dailyOtpCount >= constants_1.OTP_CONFIG.DAILY_LIMIT) {
            const blockedUntil = new Date(todayStart.getTime() + 24 * 60 * 60 * 1000);
            return {
                canSend: false,
                remainingAttempts: 0,
                blockedUntil,
                reason: `Maximum ${constants_1.OTP_CONFIG.DAILY_LIMIT} OTPs per day`,
            };
        }
        return {
            canSend: true,
            remainingAttempts: constants_1.OTP_CONFIG.MAX_ATTEMPTS - recentOtpCount,
        };
    }
    /**
     * Invalidate all previous unused OTPs for phone and purpose
     */
    async invalidatePreviousOtps(phoneNumber, purpose) {
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
        logger_1.default.debug('Previous OTPs invalidated', { phoneNumber, purpose });
    }
    /**
     * Cleanup expired OTPs (for background job)
     */
    async cleanupExpiredOtps() {
        const result = await prisma.otpCode.deleteMany({
            where: {
                expiresAt: {
                    lt: new Date(),
                },
                isUsed: true,
            },
        });
        logger_1.default.info('Expired OTPs cleaned up', { count: result.count });
        return result.count;
    }
    /**
     * Get OTP statistics for monitoring
     */
    async getOtpStats(phoneNumber) {
        const normalizedPhone = helpers_1.phoneUtils.normalize(phoneNumber);
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
    async sendOtpSms(phoneNumber, code) {
        try {
            const localNumber = helpers_1.phoneUtils.getLocalNumber(phoneNumber);
            // TODO: Integrate with actual SMS service (Twilio, AWS SNS, etc.)
            // For now, log the OTP (ONLY IN DEVELOPMENT)
            if (process.env.NODE_ENV === 'development') {
                logger_1.default.info('OTP SMS (DEV MODE)', {
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
            logger_1.default.info('OTP SMS sent', { phoneNumber: localNumber });
            return true;
        }
        catch (error) {
            logger_1.default.error('Failed to send OTP SMS', {
                phoneNumber,
                error: error instanceof Error ? error.message : 'Unknown error',
            });
            throw {
                code: api_types_1.ErrorCodes.SMS_SEND_FAILED,
                message: 'فشل إرسال رمز التحقق. يرجى المحاولة مرة أخرى',
            };
        }
    }
    /**
     * Generate and send OTP (complete flow)
     */
    async generateAndSendOtp(params) {
        const { phoneNumber } = params;
        // Generate OTP
        const { code, expiresAt } = await this.generateOtp(params);
        // Send SMS
        await this.sendOtpSms(phoneNumber, code);
        return {
            success: true,
            expiresAt,
            message: 'تم إرسال رمز التحقق إلى رقم هاتفك',
        };
    }
}
exports.OtpService = OtpService;
exports.otpService = new OtpService();
//# sourceMappingURL=otp.service.js.map