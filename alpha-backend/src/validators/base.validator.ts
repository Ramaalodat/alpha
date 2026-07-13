/**
 * Base Validator
 * Provides common validation utilities
 * Implements Strategy pattern for validation rules
 */

import Joi from 'joi';
import { ErrorCodes } from '../types/api.types';
import logger from '../utils/logger';

export interface ValidationResult {
  valid: boolean;
  errors?: ValidationError[];
}

export interface ValidationError {
  field: string;
  message: string;
  code?: string;
}

export interface IValidator<T> {
  validate(data: T): ValidationResult;
  validateAsync(data: T): Promise<ValidationResult>;
}

export abstract class BaseValidator<T> implements IValidator<T> {
  protected schema: Joi.ObjectSchema;

  constructor(schema: Joi.ObjectSchema) {
    this.schema = schema;
  }

  /**
   * Synchronous validation
   */
  validate(data: T): ValidationResult {
    const result = this.schema.validate(data, {
      abortEarly: false,
      stripUnknown: true,
    });

    if (result.error) {
      const errors = this.formatJoiErrors(result.error);
      logger.debug('Validation failed', { errors });
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
  async validateAsync(data: T): Promise<ValidationResult> {
    try {
      await this.schema.validateAsync(data, {
        abortEarly: false,
        stripUnknown: true,
      });

      return {
        valid: true,
      };
    } catch (error: any) {
      if (error.isJoi) {
        const errors = this.formatJoiErrors(error);
        logger.debug('Async validation failed', { errors });
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
  protected formatJoiErrors(error: Joi.ValidationError): ValidationError[] {
    return error.details.map((detail) => ({
      field: detail.path.join('.'),
      message: detail.message,
      code: ErrorCodes.VALIDATION_ERROR,
    }));
  }

  /**
   * Validate and throw on error
   */
  validateOrThrow(data: T): void {
    const result = this.validate(data);
    if (!result.valid) {
      throw {
        code: ErrorCodes.VALIDATION_ERROR,
        message: 'بيانات غير صحيحة',
        details: result.errors,
      };
    }
  }

  /**
   * Validate field and throw on error
   */
  async validateAsyncOrThrow(data: T): Promise<void> {
    const result = await this.validateAsync(data);
    if (!result.valid) {
      throw {
        code: ErrorCodes.VALIDATION_ERROR,
        message: 'بيانات غير صحيحة',
        details: result.errors,
      };
    }
  }

  /**
   * Sanitize and validate data
   */
  sanitizeAndValidate(data: T): { valid: boolean; data?: T; errors?: ValidationError[] } {
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

/**
 * Common Joi schema patterns
 */
export const commonSchemas = {
  /**
   * UUID validation
   */
  uuid: Joi.string().uuid().messages({
    'string.guid': 'معرف غير صحيح',
    'any.required': 'المعرف مطلوب',
  }),

  /**
   * Phone number validation (Jordan +962)
   */
  phoneNumber: Joi.string()
    .pattern(/^\+962[7][0-9]{8}$/)
    .messages({
      'string.pattern.base': 'رقم الهاتف يجب أن يكون أردني ويبدأ بـ +962',
      'any.required': 'رقم الهاتف مطلوب',
      'string.empty': 'رقم الهاتف لا يمكن أن يكون فارغاً',
    }),

  /**
   * Email validation
   */
  email: Joi.string().email().messages({
    'string.email': 'البريد الإلكتروني غير صحيح',
    'any.required': 'البريد الإلكتروني مطلوب',
  }),

  /**
   * Password validation (strong password)
   */
  password: Joi.string()
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
  date: Joi.date().messages({
    'date.base': 'التاريخ غير صحيح',
    'any.required': 'التاريخ مطلوب',
  }),

  /**
   * Date of birth validation (18+ years old)
   */
  dateOfBirth: Joi.date()
    .max(new Date(new Date().setFullYear(new Date().getFullYear() - 18)))
    .messages({
      'date.base': 'تاريخ الميلاد غير صحيح',
      'date.max': 'يجب أن يكون العمر 18 سنة على الأقل',
      'any.required': 'تاريخ الميلاد مطلوب',
    }),

  /**
   * Full name validation (Arabic and English)
   */
  fullName: Joi.string()
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
  amount: Joi.number().positive().precision(2).messages({
    'number.base': 'المبلغ يجب أن يكون رقماً',
    'number.positive': 'المبلغ يجب أن يكون موجباً',
    'any.required': 'المبلغ مطلوب',
  }),

  /**
   * Pagination page
   */
  page: Joi.number().integer().min(1).default(1).messages({
    'number.base': 'رقم الصفحة يجب أن يكون رقماً',
    'number.min': 'رقم الصفحة يجب أن يكون 1 على الأقل',
  }),

  /**
   * Pagination limit
   */
  limit: Joi.number().integer().min(1).max(100).default(10).messages({
    'number.base': 'حد الصفحة يجب أن يكون رقماً',
    'number.min': 'حد الصفحة يجب أن يكون 1 على الأقل',
    'number.max': 'حد الصفحة يجب أن لا يتجاوز 100',
  }),

  /**
   * OTP code validation
   */
  otpCode: Joi.string()
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
  description: Joi.string().max(500).allow('').messages({
    'string.max': 'الوصف يجب أن لا يتجاوز 500 حرف',
  }),
};

/**
 * Validation middleware helper
 */
export const createValidationError = (errors: ValidationError[]) => ({
  code: ErrorCodes.VALIDATION_ERROR,
  message: 'بيانات غير صحيحة',
  details: errors,
});
