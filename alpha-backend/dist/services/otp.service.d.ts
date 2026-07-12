import { OtpPurpose } from '@prisma/client';
interface GenerateOtpParams {
    phoneNumber: string;
    purpose: OtpPurpose;
    ipAddress?: string;
    userAgent?: string;
}
interface VerifyOtpParams {
    phoneNumber: string;
    code: string;
    purpose: OtpPurpose;
}
interface OtpRateLimitCheck {
    canSend: boolean;
    remainingAttempts?: number;
    blockedUntil?: Date;
    reason?: string;
}
export declare class OtpService {
    /**
     * Generate and store OTP code
     */
    generateOtp(params: GenerateOtpParams): Promise<{
        code: string;
        expiresAt: Date;
    }>;
    /**
     * Verify OTP code
     */
    verifyOtp(params: VerifyOtpParams): Promise<{
        verified: boolean;
        userId?: string;
    }>;
    /**
     * Check if user can request new OTP (rate limiting)
     */
    checkRateLimit(phoneNumber: string, purpose: OtpPurpose): Promise<OtpRateLimitCheck>;
    /**
     * Invalidate all previous unused OTPs for phone and purpose
     */
    private invalidatePreviousOtps;
    /**
     * Cleanup expired OTPs (for background job)
     */
    cleanupExpiredOtps(): Promise<number>;
    /**
     * Get OTP statistics for monitoring
     */
    getOtpStats(phoneNumber: string): Promise<{
        totalSent: number;
        totalVerified: number;
        failedAttempts: number;
        lastSentAt?: Date;
    }>;
    /**
     * Send OTP via SMS (integration with SMS service)
     */
    sendOtpSms(phoneNumber: string, code: string): Promise<boolean>;
    /**
     * Generate and send OTP (complete flow)
     */
    generateAndSendOtp(params: GenerateOtpParams): Promise<{
        success: boolean;
        expiresAt: Date;
        message: string;
    }>;
}
export declare const otpService: OtpService;
export {};
//# sourceMappingURL=otp.service.d.ts.map