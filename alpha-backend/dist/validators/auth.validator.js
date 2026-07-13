"use strict";
/**
 * Authentication Validators
 * Validates all authentication-related requests
 * Implements Input Validation following Security Best Practices
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.changePasswordValidator = exports.resendOtpValidator = exports.resetPasswordValidator = exports.requestPasswordResetValidator = exports.logoutValidator = exports.refreshTokenValidator = exports.loginValidator = exports.verifyPhoneValidator = exports.registerValidator = exports.authValidators = void 0;
const joi_1 = __importDefault(require("joi"));
const base_validator_1 = require("./base.validator");
const client_1 = require("@prisma/client");
class RegisterValidator extends base_validator_1.BaseValidator {
    constructor() {
        super(joi_1.default.object({
            fullName: base_validator_1.commonSchemas.fullName.required(),
            phoneNumber: base_validator_1.commonSchemas.phoneNumber.required(),
            password: base_validator_1.commonSchemas.password.required(),
            birthDate: joi_1.default.date()
                .iso()
                .max(new Date(new Date().setFullYear(new Date().getFullYear() - 18)))
                .required()
                .messages({
                'date.base': 'تاريخ الميلاد غير صحيح',
                'date.format': 'تاريخ الميلاد يجب أن يكون بصيغة ISO (YYYY-MM-DD)',
                'date.max': 'يجب أن يكون العمر 18 سنة على الأقل',
                'any.required': 'تاريخ الميلاد مطلوب',
            }),
        }));
    }
}
class VerifyPhoneValidator extends base_validator_1.BaseValidator {
    constructor() {
        super(joi_1.default.object({
            phoneNumber: base_validator_1.commonSchemas.phoneNumber.required(),
            otpCode: base_validator_1.commonSchemas.otpCode.required(),
        }));
    }
}
class LoginValidator extends base_validator_1.BaseValidator {
    constructor() {
        super(joi_1.default.object({
            phoneNumber: base_validator_1.commonSchemas.phoneNumber.required(),
            password: joi_1.default.string().required().messages({
                'any.required': 'كلمة المرور مطلوبة',
                'string.empty': 'كلمة المرور لا يمكن أن تكون فارغة',
            }),
            deviceId: joi_1.default.string().max(255).optional().messages({
                'string.max': 'معرف الجهاز يجب أن لا يتجاوز 255 حرف',
            }),
        }));
    }
}
class RefreshTokenValidator extends base_validator_1.BaseValidator {
    constructor() {
        super(joi_1.default.object({
            refreshToken: joi_1.default.string().required().messages({
                'any.required': 'رمز التحديث مطلوب',
                'string.empty': 'رمز التحديث لا يمكن أن يكون فارغاً',
            }),
        }));
    }
}
class LogoutValidator extends base_validator_1.BaseValidator {
    constructor() {
        super(joi_1.default.object({
            refreshToken: joi_1.default.string().optional(),
        }));
    }
}
class RequestPasswordResetValidator extends base_validator_1.BaseValidator {
    constructor() {
        super(joi_1.default.object({
            phoneNumber: base_validator_1.commonSchemas.phoneNumber.required(),
        }));
    }
}
class ResetPasswordValidator extends base_validator_1.BaseValidator {
    constructor() {
        super(joi_1.default.object({
            phoneNumber: base_validator_1.commonSchemas.phoneNumber.required(),
            otpCode: base_validator_1.commonSchemas.otpCode.required(),
            newPassword: base_validator_1.commonSchemas.password.required(),
        }));
    }
}
class ResendOtpValidator extends base_validator_1.BaseValidator {
    constructor() {
        super(joi_1.default.object({
            phoneNumber: base_validator_1.commonSchemas.phoneNumber.required(),
            purpose: joi_1.default.string()
                .valid(...Object.values(client_1.OtpPurpose))
                .required()
                .messages({
                'any.only': 'نوع رمز التحقق غير صحيح',
                'any.required': 'نوع رمز التحقق مطلوب',
            }),
        }));
    }
}
class ChangePasswordValidator extends base_validator_1.BaseValidator {
    constructor() {
        super(joi_1.default.object({
            currentPassword: joi_1.default.string().required().messages({
                'any.required': 'كلمة المرور الحالية مطلوبة',
                'string.empty': 'كلمة المرور الحالية لا يمكن أن تكون فارغة',
            }),
            newPassword: base_validator_1.commonSchemas.password.required(),
            confirmPassword: joi_1.default.string()
                .valid(joi_1.default.ref('newPassword'))
                .required()
                .messages({
                'any.only': 'كلمة المرور الجديدة وتأكيد كلمة المرور غير متطابقتين',
                'any.required': 'تأكيد كلمة المرور مطلوب',
            }),
        }));
    }
}
// Export validator instances
exports.authValidators = {
    register: new RegisterValidator(),
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
exports.registerValidator = exports.authValidators.register;
exports.verifyPhoneValidator = exports.authValidators.verifyPhone;
exports.loginValidator = exports.authValidators.login;
exports.refreshTokenValidator = exports.authValidators.refreshToken;
exports.logoutValidator = exports.authValidators.logout;
exports.requestPasswordResetValidator = exports.authValidators.requestPasswordReset;
exports.resetPasswordValidator = exports.authValidators.resetPassword;
exports.resendOtpValidator = exports.authValidators.resendOtp;
exports.changePasswordValidator = exports.authValidators.changePassword;
//# sourceMappingURL=auth.validator.js.map