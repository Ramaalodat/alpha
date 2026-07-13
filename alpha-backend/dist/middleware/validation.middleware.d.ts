import Joi from 'joi';
import { FastifyRequest, FastifyReply } from 'fastify';
/**
 * Validation middleware factory
 */
export declare const validate: (schema: Joi.ObjectSchema) => (request: FastifyRequest, reply: FastifyReply) => Promise<void>;
/**
 * Query parameters validation
 */
export declare const validateQuery: (schema: Joi.ObjectSchema) => (request: FastifyRequest, reply: FastifyReply) => Promise<void>;
/**
 * Jordan phone number validator
 */
export declare const jordanPhoneValidator: Joi.StringSchema<string>;
/**
 * Password validator
 */
export declare const passwordValidator: Joi.StringSchema<string>;
/**
 * OTP code validator
 */
export declare const otpValidator: Joi.StringSchema<string>;
/**
 * Amount validator (JOD)
 */
export declare const amountValidator: Joi.NumberSchema<number>;
/**
 * Date validator (ISO format)
 */
export declare const dateValidator: Joi.DateSchema<Date>;
/**
 * UUID validator
 */
export declare const uuidValidator: Joi.StringSchema<string>;
/**
 * Pagination validator
 */
export declare const paginationValidator: Joi.ObjectSchema<any>;
export declare const registerSchema: Joi.ObjectSchema<any>;
export declare const verifyPhoneSchema: Joi.ObjectSchema<any>;
export declare const loginSchema: Joi.ObjectSchema<any>;
export declare const refreshTokenSchema: Joi.ObjectSchema<any>;
export declare const requestPasswordResetSchema: Joi.ObjectSchema<any>;
export declare const resetPasswordSchema: Joi.ObjectSchema<any>;
export declare const resendOtpSchema: Joi.ObjectSchema<any>;
export declare const financialInfoSchema: Joi.ObjectSchema<any>;
export declare const createFirstGoalSchema: Joi.ObjectSchema<any>;
export declare const createGoalSchema: Joi.ObjectSchema<any>;
export declare const updateGoalSchema: Joi.ObjectSchema<any>;
export declare const goalTransactionSchema: Joi.ObjectSchema<any>;
export declare const createExpenseSchema: Joi.ObjectSchema<any>;
export declare const updateExpenseSchema: Joi.ObjectSchema<any>;
export declare const createCategorySchema: Joi.ObjectSchema<any>;
export declare const updateUserSchema: Joi.ObjectSchema<any>;
export declare const updateProfileSchema: Joi.ObjectSchema<any>;
export declare const changePasswordSchema: Joi.ObjectSchema<any>;
export declare const updateSettingsSchema: Joi.ObjectSchema<any>;
//# sourceMappingURL=validation.middleware.d.ts.map