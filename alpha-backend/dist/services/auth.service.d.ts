import { User, UserStatus } from '@prisma/client';
interface RegisterParams {
    phoneNumber: string;
    fullName: string;
    birthDate: string;
    password: string;
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
export declare class AuthService {
    /**
     * Register new user
     */
    register(params: RegisterParams): Promise<{
        user: Partial<User>;
        message: string;
    }>;
    /**
     * Verify phone number with OTP and activate account
     */
    verifyPhone(phoneNumber: string, otpCode: string): Promise<{
        user: Partial<User>;
        tokens: TokenPair;
        message: string;
    }>;
    /**
     * Login user
     */
    login(params: LoginParams): Promise<{
        user: Partial<User>;
        tokens: TokenPair;
        message: string;
    }>;
    /**
     * Generate access and refresh token pair
     */
    generateTokenPair(user: Partial<User>, sessionData?: {
        ipAddress?: string;
        userAgent?: string;
        deviceId?: string;
    }): Promise<TokenPair>;
    /**
     * Refresh access token using refresh token
     */
    refreshAccessToken(params: RefreshTokenParams): Promise<TokenPair>;
    /**
     * Logout user (revoke refresh token)
     */
    logout(userId: string, refreshToken?: string): Promise<{
        message: string;
    }>;
    /**
     * Request password reset OTP
     */
    requestPasswordReset(phoneNumber: string, ipAddress?: string, userAgent?: string): Promise<{
        message: string;
        expiresAt: Date;
    }>;
    /**
     * Reset password with OTP
     */
    resetPassword(phoneNumber: string, otpCode: string, newPassword: string): Promise<{
        message: string;
    }>;
    /**
     * Verify JWT token
     */
    verifyAccessToken(token: string): TokenPayload;
    /**
     * Create audit log entry
     */
    private createAuditLog;
}
export declare const authService: AuthService;
export {};
//# sourceMappingURL=auth.service.d.ts.map