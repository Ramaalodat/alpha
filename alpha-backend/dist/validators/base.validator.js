"use strict";
/**
 * Base Validator
 * Provides common validation utilities
 * Implements Strategy pattern for validation rules
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createValidationError = exports.commonSchemas = exports.BaseValidator = void 0;
const joi_1 = __importDefault(require("joi"));
const api_types_1 = require("../types/api.types");
const logger_1 = __importDefault(require("../utils/logger"));
class BaseValidator {
    schema;
    constructor(schema) {
        this.schema = schema;
    }
    /**
     * Synchronous validation
     */
    validate(data) {
        const result = this.schema.validate(data, {
            abortEarly: false,
            stripUnknown: true,
        });
        if (result.error) {
            const errors = this.formatJoiErrors(result.error);
            logger_1.default.debug('Validation failed', { errors });
            return {
                valid: false,
                errors,
            };
        }
        return {
            valid: true,
        };
    }
    /**
     * Asynchronous validation
     */
    async validateAsync(data) {
        try {
            await this.schema.validateAsync(data, {
                abortEarly: false,
                stripUnknown: true,
            });
            return {
                valid: true,
            };
        }
        catch (error) {
            if (error.isJoi) {
                const errors = this.formatJoiErrors(error);
                logger_1.default.debug('Async validation failed', { errors });
                return {
                    valid: false,
                    errors,
                };
            }
            throw error;
        }
    }
    /**
     * Format Joi validation errors
     */
    formatJoiErrors(error) {
        return error.details.map((detail) => ({
            field: detail.path.join('.'),
            message: detail.message,
            code: api_types_1.ErrorCodes.VALIDATION_ERROR,
        }));
    }
    /**
     * Validate and throw on error
     */
    validateOrThrow(data) {
        const result = this.validate(data);
        if (!result.valid) {
            throw {
                code: api_types_1.ErrorCodes.VALIDATION_ERROR,
                message: 'بيانات غير صحيحة',
                details: result.errors,
            };
        }
    }
    /**
     * Validate field and throw on error
     */
    async validateAsyncOrThrow(data) {
        const result = await this.validateAsync(data);
        if (!result.valid) {
            throw {
                code: api_types_1.ErrorCodes.VALIDATION_ERROR,
                message: 'بيانات غير صحيحة',
                details: result.errors,
            };
        }
    }
    /**
     * Sanitize and validate data
     */
    sanitizeAndValidate(data) {
        const result = this.schema.validate(data, {
            abortEarly: false,
            stripUnknown: true,
        });
        if (result.error) {
            return {
                valid: false,
                errors: this.formatJoiErrors(result.error),
            };
        }
        return {
            valid: true,
            data: result.value,
        };
    }
}
exports.BaseValidator = BaseValidator;
/**
 * Common Joi schema patterns
 */
exports.commonSchemas = {
    /**
     * UUID validation
     */
    uuid: joi_1.default.string().uuid().messages({
        'string.guid': 'معرف غير صحيح',
        'any.required': 'المعرف مطلوب',
    }),
    /**
     * Phone number validation (Jordan +962)
     */
    phoneNumber: joi_1.default.string()
        .pattern(/^\+962[7][0-9]{8}$/)
        .messages({
        'string.pattern.base': 'رقم الهاتف يجب أن يكون أردني ويبدأ بـ +962',
        'any.required': 'رقم الهاتف مطلوب',
        'string.empty': 'رقم الهاتف لا يمكن أن يكون فارغاً',
    }),
    /**
     * Email validation
     */
    email: joi_1.default.string().email().messages({
        'string.email': 'البريد الإلكتروني غير صحيح',
        'any.required': 'البريد الإلكتروني مطلوب',
    }),
    /**
     * Password validation (strong password)
     */
    password: joi_1.default.string()
        .min(8)
        .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
        .messages({
        'string.min': 'كلمة المرور يجب أن تكون 8 أحرف على الأقل',
        'string.pattern.base': 'كلمة المرور يجب أن تحتوي على حرف كبير وحرف صغير ورقم ورمز خاص',
        'any.required': 'كلمة المرور مطلوبة',
        'string.empty': 'كلمة المرور لا يمكن أن تكون فارغة',
    }),
    /**
     * Date validation
     */
    date: joi_1.default.date().messages({
        'date.base': 'التاريخ غير صحيح',
        'any.required': 'التاريخ مطلوب',
    }),
    /**
     * Date of birth validation (18+ years old)
     */
    dateOfBirth: joi_1.default.date()
        .max(new Date(new Date().setFullYear(new Date().getFullYear() - 18)))
        .messages({
        'date.base': 'تاريخ الميلاد غير صحيح',
        'date.max': 'يجب أن يكون العمر 18 سنة على الأقل',
        'any.required': 'تاريخ الميلاد مطلوب',
    }),
    /**
     * Full name validation (Arabic and English)
     */
    fullName: joi_1.default.string()
        .min(3)
        .max(100)
        .pattern(/^[\u0600-\u06FFa-zA-Z\s]+$/)
        .messages({
        'string.min': 'الاسم يجب أن يكون 3 أحرف على الأقل',
        'string.max': 'الاسم يجب أن لا يتجاوز 100 حرف',
        'string.pattern.base': 'الاسم يجب أن يحتوي على أحرف عربية أو إنجليزية فقط',
        'any.required': 'الاسم الكامل مطلوب',
        'string.empty': 'الاسم الكامل لا يمكن أن يكون فارغاً',
    }),
    /**
     * Amount validation (positive number)
     */
    amount: joi_1.default.number().positive().precision(2).messages({
        'number.base': 'المبلغ يجب أن يكون رقماً',
        'number.positive': 'المبلغ يجب أن يكون موجباً',
        'any.required': 'المبلغ مطلوب',
    }),
    /**
     * Pagination page
     */
    page: joi_1.default.number().integer().min(1).default(1).messages({
        'number.base': 'رقم الصفحة يجب أن يكون رقماً',
        'number.min': 'رقم الصفحة يجب أن يكون 1 على الأقل',
    }),
    /**
     * Pagination limit
     */
    limit: joi_1.default.number().integer().min(1).max(100).default(10).messages({
        'number.base': 'حد الصفحة يجب أن يكون رقماً',
        'number.min': 'حد الصفحة يجب أن يكون 1 على الأقل',
        'number.max': 'حد الصفحة يجب أن لا يتجاوز 100',
    }),
    /**
     * OTP code validation
     */
    otpCode: joi_1.default.string()
        .length(6)
        .pattern(/^\d{6}$/)
        .messages({
        'string.length': 'رمز التحقق يجب أن يكون 6 أرقام',
        'string.pattern.base': 'رمز التحقق يجب أن يحتوي على أرقام فقط',
        'any.required': 'رمز التحقق مطلوب',
        'string.empty': 'رمز التحقق لا يمكن أن يكون فارغاً',
    }),
    /**
     * Description validation
     */
    description: joi_1.default.string().max(500).allow('').messages({
        'string.max': 'الوصف يجب أن لا يتجاوز 500 حرف',
    }),
};
/**
 * Validation middleware helper
 */
const createValidationError = (errors) => ({
    code: api_types_1.ErrorCodes.VALIDATION_ERROR,
    message: 'بيانات غير صحيحة',
    details: errors,
});
exports.createValidationError = createValidationError;
//# sourceMappingURL=base.validator.js.map