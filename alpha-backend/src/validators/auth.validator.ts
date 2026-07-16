/**
 * Authentication Validators
 * Validates all authentication-related requests
 * Implements Input Validation following Security Best Practices
 */

import Joi from 'joi';
import { BaseValidator, commonSchemas } from './base.validator';
import { OtpPurpose } from '@prisma/client';

/**
 * Register Request Validator
 */
export interface RegisterRequest {
  fullName: string;
  phoneNumber: string;
  password: string;
  birthDate: string;
  email?: string;
  username?: string;
}

class RegisterValidator extends BaseValidator<RegisterRequest> {
  constructor() {
    super(
      Joi.object({
        fullName: commonSchemas.fullName.required(),
        phoneNumber: commonSchemas.phoneNumber.required(),
        password: commonSchemas.password.required(),
        birthDate: Joi.date()
          .iso()
          .max(new Date(new Date().setFullYear(new Date().getFullYear() - 18)))
          .required()
          .messages({
            'date.base': 'تاريخ الميلاد غير صحيح',
            'date.format': 'تاريخ الميلاد يجب أن يكون بصيغة ISO (YYYY-MM-DD)',
            'date.max': 'يجب أن يكون العمر 18 سنة على الأقل',
            'any.required': 'تاريخ الميلاد مطلوب',
          }),
        email: Joi.string().email().optional().messages({
          'string.email': 'البريد الإلكتروني غير صالح',
        }),
        username: Joi.string().alphanum().min(3).max(100).optional().messages({
          'string.min': 'اسم المستخدم يجب أن يكون 3 أحرف على الأقل',
          'string.max': 'اسم المستخدم يجب أن لا يتجاوز 100 حرف',
        }),
      })
    );
  }
}

/**
 * Register Demographics Request Validator
 */
export interface RegisterDemographicsRequest {
  gender: string;
  maritalStatus: string;
  isHeadOfHousehold: boolean;
  isStudent: boolean;
}

class RegisterDemographicsValidator extends BaseValidator<RegisterDemographicsRequest> {
  constructor() {
    super(
      Joi.object({
        gender: Joi.string().valid('MALE', 'FEMALE').required().messages({
          'any.only': 'النوع الاجتماعي غير صالح',
          'any.required': 'النوع الاجتماعي مطلوب',
        }),
        maritalStatus: Joi.string().valid('SINGLE', 'MARRIED', 'OTHER').required().messages({
          'any.only': 'الحالة الاجتماعية غير صالحة',
          'any.required': 'الحالة الاجتماعية مطلوبة',
        }),
        isHeadOfHousehold: Joi.boolean().required().messages({
          'any.required': 'حقل رب الأسرة مطلوب',
        }),
        isStudent: Joi.boolean().required().messages({
          'any.required': 'حقل الطالب مطلوب',
        }),
      })
    );
  }
}

/**
 * Verify Phone Request Validator
 */
export interface VerifyPhoneRequest {
  phoneNumber: string;
  otpCode: string;
}

class VerifyPhoneValidator extends BaseValidator<VerifyPhoneRequest> {
  constructor() {
    super(
      Joi.object({
        phoneNumber: commonSchemas.phoneNumber.required(),
        otpCode: commonSchemas.otpCode.required(),
      })
    );
  }
}

/**
 * Login Request Validator
 */
export interface LoginRequest {
  phoneNumber: string;
  password: string;
  deviceId?: string;
}

class LoginValidator extends BaseValidator<LoginRequest> {
  constructor() {
    super(
      Joi.object({
        phoneNumber: commonSchemas.phoneNumber.required(),
        password: Joi.string().required().messages({
          'any.required': 'كلمة المرور مطلوبة',
          'string.empty': 'كلمة المرور لا يمكن أن تكون فارغة',
        }),
        deviceId: Joi.string().max(255).optional().messages({
          'string.max': 'معرف الجهاز يجب أن لا يتجاوز 255 حرف',
        }),
      })
    );
  }
}

/**
 * Refresh Token Request Validator
 */
export interface RefreshTokenRequest {
  refreshToken: string;
}

class RefreshTokenValidator extends BaseValidator<RefreshTokenRequest> {
  constructor() {
    super(
      Joi.object({
        refreshToken: Joi.string().required().messages({
          'any.required': 'رمز التحديث مطلوب',
          'string.empty': 'رمز التحديث لا يمكن أن يكون فارغاً',
        }),
      })
    );
  }
}

/**
 * Logout Request Validator
 */
export interface LogoutRequest {
  refreshToken?: string;
}

class LogoutValidator extends BaseValidator<LogoutRequest> {
  constructor() {
    super(
      Joi.object({
        refreshToken: Joi.string().optional(),
      })
    );
  }
}

/**
 * Request Password Reset Validator
 */
export interface RequestPasswordResetRequest {
  phoneNumber: string;
}

class RequestPasswordResetValidator extends BaseValidator<RequestPasswordResetRequest> {
  constructor() {
    super(
      Joi.object({
        phoneNumber: commonSchemas.phoneNumber.required(),
      })
    );
  }
}

/**
 * Reset Password Validator
 */
export interface ResetPasswordRequest {
  phoneNumber: string;
  otpCode: string;
  newPassword: string;
}

class ResetPasswordValidator extends BaseValidator<ResetPasswordRequest> {
  constructor() {
    super(
      Joi.object({
        phoneNumber: commonSchemas.phoneNumber.required(),
        otpCode: commonSchemas.otpCode.required(),
        newPassword: commonSchemas.password.required(),
      })
    );
  }
}

/**
 * Resend OTP Validator
 */
export interface ResendOtpRequest {
  phoneNumber: string;
  purpose: OtpPurpose;
}

class ResendOtpValidator extends BaseValidator<ResendOtpRequest> {
  constructor() {
    super(
      Joi.object({
        phoneNumber: commonSchemas.phoneNumber.required(),
        purpose: Joi.string()
          .valid(...Object.values(OtpPurpose))
          .required()
          .messages({
            'any.only': 'نوع رمز التحقق غير صحيح',
            'any.required': 'نوع رمز التحقق مطلوب',
          }),
      })
    );
  }
}

/**
 * Change Password Validator
 */
export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

class ChangePasswordValidator extends BaseValidator<ChangePasswordRequest> {
  constructor() {
    super(
      Joi.object({
        currentPassword: Joi.string().required().messages({
          'any.required': 'كلمة المرور الحالية مطلوبة',
          'string.empty': 'كلمة المرور الحالية لا يمكن أن تكون فارغة',
        }),
        newPassword: commonSchemas.password.required(),
        confirmPassword: Joi.string()
          .valid(Joi.ref('newPassword'))
          .required()
          .messages({
            'any.only': 'كلمة المرور الجديدة وتأكيد كلمة المرور غير متطابقتين',
            'any.required': 'تأكيد كلمة المرور مطلوب',
          }),
      })
    );
  }
}

// Export validator instances
export const authValidators = {
  register: new RegisterValidator(),
  registerDemographics: new RegisterDemographicsValidator(),
  verifyPhone: new VerifyPhoneValidator(),
  login: new LoginValidator(),
  refreshToken: new RefreshTokenValidator(),
  logout: new LogoutValidator(),
  requestPasswordReset: new RequestPasswordResetValidator(),
  resetPassword: new ResetPasswordValidator(),
  resendOtp: new ResendOtpValidator(),
  changePassword: new ChangePasswordValidator(),
};

// Export individual validators
export const registerValidator = authValidators.register;
export const registerDemographicsValidator = authValidators.registerDemographics;
export const verifyPhoneValidator = authValidators.verifyPhone;
export const loginValidator = authValidators.login;
export const refreshTokenValidator = authValidators.refreshToken;
export const logoutValidator = authValidators.logout;
export const requestPasswordResetValidator = authValidators.requestPasswordReset;
export const resetPasswordValidator = authValidators.resetPassword;
export const resendOtpValidator = authValidators.resendOtp;
export const changePasswordValidator = authValidators.changePassword;
