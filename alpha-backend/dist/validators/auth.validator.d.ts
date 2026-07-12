/**
 * Authentication Validators
 * Validates all authentication-related requests
 * Implements Input Validation following Security Best Practices
 */
import { BaseValidator } from './base.validator';
import { OtpPurpose } from '@prisma/client';
/**
 * Register Request Validator
 */
export interface RegisterRequest {
    fullName: string;
    phoneNumber: string;
    password: string;
    birthDate: string;
}
declare class RegisterValidator extends BaseValidator<RegisterRequest> {
    constructor();
}
/**
 * Verify Phone Request Validator
 */
export interface VerifyPhoneRequest {
    phoneNumber: string;
    otpCode: string;
}
declare class VerifyPhoneValidator extends BaseValidator<VerifyPhoneRequest> {
    constructor();
}
/**
 * Login Request Validator
 */
export interface LoginRequest {
    phoneNumber: string;
    password: string;
    deviceId?: string;
}
declare class LoginValidator extends BaseValidator<LoginRequest> {
    constructor();
}
/**
 * Refresh Token Request Validator
 */
export interface RefreshTokenRequest {
    refreshToken: string;
}
declare class RefreshTokenValidator extends BaseValidator<RefreshTokenRequest> {
    constructor();
}
/**
 * Logout Request Validator
 */
export interface LogoutRequest {
    refreshToken?: string;
}
declare class LogoutValidator extends BaseValidator<LogoutRequest> {
    constructor();
}
/**
 * Request Password Reset Validator
 */
export interface RequestPasswordResetRequest {
    phoneNumber: string;
}
declare class RequestPasswordResetValidator extends BaseValidator<RequestPasswordResetRequest> {
    constructor();
}
/**
 * Reset Password Validator
 */
export interface ResetPasswordRequest {
    phoneNumber: string;
    otpCode: string;
    newPassword: string;
}
declare class ResetPasswordValidator extends BaseValidator<ResetPasswordRequest> {
    constructor();
}
/**
 * Resend OTP Validator
 */
export interface ResendOtpRequest {
    phoneNumber: string;
    purpose: OtpPurpose;
}
declare class ResendOtpValidator extends BaseValidator<ResendOtpRequest> {
    constructor();
}
/**
 * Change Password Validator
 */
export interface ChangePasswordRequest {
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
}
declare class ChangePasswordValidator extends BaseValidator<ChangePasswordRequest> {
    constructor();
}
export declare const authValidators: {
    register: RegisterValidator;
    verifyPhone: VerifyPhoneValidator;
    login: LoginValidator;
    refreshToken: RefreshTokenValidator;
    logout: LogoutValidator;
    requestPasswordReset: RequestPasswordResetValidator;
    resetPassword: ResetPasswordValidator;
    resendOtp: ResendOtpValidator;
    changePassword: ChangePasswordValidator;
};
export declare const registerValidator: RegisterValidator;
export declare const verifyPhoneValidator: VerifyPhoneValidator;
export declare const loginValidator: LoginValidator;
export declare const refreshTokenValidator: RefreshTokenValidator;
export declare const logoutValidator: LogoutValidator;
export declare const requestPasswordResetValidator: RequestPasswordResetValidator;
export declare const resetPasswordValidator: ResetPasswordValidator;
export declare const resendOtpValidator: ResendOtpValidator;
export declare const changePasswordValidator: ChangePasswordValidator;
export {};
//# sourceMappingURL=auth.validator.d.ts.map