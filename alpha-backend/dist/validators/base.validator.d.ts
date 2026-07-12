/**
 * Base Validator
 * Provides common validation utilities
 * Implements Strategy pattern for validation rules
 */
import Joi from 'joi';
import { ErrorCodes } from '../types/api.types';
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
export declare abstract class BaseValidator<T> implements IValidator<T> {
    protected schema: Joi.ObjectSchema;
    constructor(schema: Joi.ObjectSchema);
    /**
     * Synchronous validation
     */
    validate(data: T): ValidationResult;
    /**
     * Asynchronous validation
     */
    validateAsync(data: T): Promise<ValidationResult>;
    /**
     * Format Joi validation errors
     */
    protected formatJoiErrors(error: Joi.ValidationError): ValidationError[];
    /**
     * Validate and throw on error
     */
    validateOrThrow(data: T): void;
    /**
     * Validate field and throw on error
     */
    validateAsyncOrThrow(data: T): Promise<void>;
    /**
     * Sanitize and validate data
     */
    sanitizeAndValidate(data: T): {
        valid: boolean;
        data?: T;
        errors?: ValidationError[];
    };
}
/**
 * Common Joi schema patterns
 */
export declare const commonSchemas: {
    /**
     * UUID validation
     */
    uuid: Joi.StringSchema<string>;
    /**
     * Phone number validation (Jordan +962)
     */
    phoneNumber: Joi.StringSchema<string>;
    /**
     * Email validation
     */
    email: Joi.StringSchema<string>;
    /**
     * Password validation (strong password)
     */
    password: Joi.StringSchema<string>;
    /**
     * Date validation
     */
    date: Joi.DateSchema<Date>;
    /**
     * Date of birth validation (18+ years old)
     */
    dateOfBirth: Joi.DateSchema<Date>;
    /**
     * Full name validation (Arabic and English)
     */
    fullName: Joi.StringSchema<string>;
    /**
     * Amount validation (positive number)
     */
    amount: Joi.NumberSchema<number>;
    /**
     * Pagination page
     */
    page: Joi.NumberSchema<number>;
    /**
     * Pagination limit
     */
    limit: Joi.NumberSchema<number>;
    /**
     * OTP code validation
     */
    otpCode: Joi.StringSchema<string>;
    /**
     * Description validation
     */
    description: Joi.StringSchema<string>;
};
/**
 * Validation middleware helper
 */
export declare const createValidationError: (errors: ValidationError[]) => {
    code: ErrorCodes;
    message: string;
    details: ValidationError[];
};
//# sourceMappingURL=base.validator.d.ts.map