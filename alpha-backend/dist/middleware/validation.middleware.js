"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateSettingsSchema = exports.changePasswordSchema = exports.updateProfileSchema = exports.updateUserSchema = exports.updateIncomeSchema = exports.createIncomeSchema = exports.createCategorySchema = exports.updateExpenseSchema = exports.createExpenseSchema = exports.goalTransactionSchema = exports.updateGoalSchema = exports.createGoalSchema = exports.createFirstGoalSchema = exports.financialInfoSchema = exports.resendOtpSchema = exports.resetPasswordSchema = exports.requestPasswordResetSchema = exports.refreshTokenSchema = exports.loginSchema = exports.verifyPhoneSchema = exports.registerSchema = exports.paginationValidator = exports.uuidValidator = exports.dateValidator = exports.amountValidator = exports.otpValidator = exports.passwordValidator = exports.jordanPhoneValidator = exports.validateQuery = exports.validate = void 0;
const joi_1 = __importDefault(require("joi"));
const api_types_1 = require("../types/api.types");
const constants_1 = require("../utils/constants");
const helpers_1 = require("../utils/helpers");
const logger_1 = __importDefault(require("../utils/logger"));
/**
 * Validation middleware factory
 */
const validate = (schema) => {
    return async (request, reply) => {
        try {
            const { error, value } = schema.validate(request.body, {
                abortEarly: false,
                stripUnknown: true,
            });
            if (error) {
                const errors = error.details.map((detail) => ({
                    field: detail.path.join('.'),
                    message: detail.message,
                    type: detail.type,
                }));
                logger_1.default.warn('Validation failed', {
                    path: request.url,
                    errors,
                });
                return reply
                    .status(constants_1.HTTP_STATUS.BAD_REQUEST)
                    .send((0, api_types_1.createErrorResponse)(api_types_1.ErrorCodes.VALIDATION_ERROR, 'خطأ في البيانات المدخلة', { errors }));
            }
            // Replace body with validated value
            request.body = value;
        }
        catch (err) {
            logger_1.default.error('Validation error', { error: err });
            return reply
                .status(constants_1.HTTP_STATUS.INTERNAL_SERVER_ERROR)
                .send((0, api_types_1.createErrorResponse)(api_types_1.ErrorCodes.INTERNAL_ERROR, 'حدث خطأ في التحقق من البيانات'));
        }
    };
};
exports.validate = validate;
/**
 * Query parameters validation
 */
const validateQuery = (schema) => {
    return async (request, reply) => {
        try {
            const { error, value } = schema.validate(request.query, {
                abortEarly: false,
                stripUnknown: true,
            });
            if (error) {
                const errors = error.details.map((detail) => ({
                    field: detail.path.join('.'),
                    message: detail.message,
                    type: detail.type,
                }));
                return reply
                    .status(constants_1.HTTP_STATUS.BAD_REQUEST)
                    .send((0, api_types_1.createErrorResponse)(api_types_1.ErrorCodes.VALIDATION_ERROR, 'خطأ في معاملات الاستعلام', { errors }));
            }
            request.query = value;
        }
        catch (err) {
            logger_1.default.error('Query validation error', { error: err });
            return reply
                .status(constants_1.HTTP_STATUS.INTERNAL_SERVER_ERROR)
                .send((0, api_types_1.createErrorResponse)(api_types_1.ErrorCodes.INTERNAL_ERROR, 'حدث خطأ في التحقق من البيانات'));
        }
    };
};
exports.validateQuery = validateQuery;
// Custom Joi validators
/**
 * Jordan phone number validator
 */
exports.jordanPhoneValidator = joi_1.default.string()
    .custom((value, helpers) => {
    if (!helpers_1.phoneUtils.validate(value)) {
        return helpers.error('any.invalid');
    }
    return helpers_1.phoneUtils.normalize(value);
})
    .required()
    .messages({
    'any.invalid': constants_1.VALIDATION_MESSAGES.INVALID_PHONE,
    'string.empty': constants_1.VALIDATION_MESSAGES.REQUIRED,
    'any.required': constants_1.VALIDATION_MESSAGES.REQUIRED,
});
/**
 * Password validator
 */
exports.passwordValidator = joi_1.default.string()
    .min(constants_1.PASSWORD_CONFIG.MIN_LENGTH)
    .max(constants_1.PASSWORD_CONFIG.MAX_LENGTH)
    .pattern(constants_1.PASSWORD_CONFIG.REGEX)
    .required()
    .messages({
    'string.min': `كلمة المرور يجب أن تحتوي على ${constants_1.PASSWORD_CONFIG.MIN_LENGTH} أحرف على الأقل`,
    'string.max': `كلمة المرور يجب ألا تتجاوز ${constants_1.PASSWORD_CONFIG.MAX_LENGTH} حرف`,
    'string.pattern.base': constants_1.VALIDATION_MESSAGES.WEAK_PASSWORD,
    'string.empty': constants_1.VALIDATION_MESSAGES.REQUIRED,
    'any.required': constants_1.VALIDATION_MESSAGES.REQUIRED,
});
/**
 * OTP code validator
 */
exports.otpValidator = joi_1.default.string()
    .length(6)
    .pattern(/^\d{6}$/)
    .required()
    .messages({
    'string.length': 'رمز التحقق يجب أن يتكون من 6 أرقام',
    'string.pattern.base': 'رمز التحقق غير صحيح',
    'string.empty': constants_1.VALIDATION_MESSAGES.REQUIRED,
    'any.required': constants_1.VALIDATION_MESSAGES.REQUIRED,
});
/**
 * Amount validator (JOD)
 */
exports.amountValidator = joi_1.default.number()
    .positive()
    .precision(2)
    .max(999999.99)
    .required()
    .messages({
    'number.positive': 'المبلغ يجب أن يكون أكبر من صفر',
    'number.max': 'المبلغ يجب ألا يتجاوز 999,999.99',
    'number.base': constants_1.VALIDATION_MESSAGES.INVALID_AMOUNT,
    'any.required': constants_1.VALIDATION_MESSAGES.REQUIRED,
});
/**
 * Date validator (ISO format)
 */
exports.dateValidator = joi_1.default.date()
    .iso()
    .required()
    .messages({
    'date.base': constants_1.VALIDATION_MESSAGES.INVALID_DATE,
    'date.format': constants_1.VALIDATION_MESSAGES.INVALID_DATE,
    'any.required': constants_1.VALIDATION_MESSAGES.REQUIRED,
});
/**
 * UUID validator
 */
exports.uuidValidator = joi_1.default.string()
    .uuid()
    .required()
    .messages({
    'string.guid': 'معرف غير صحيح',
    'any.required': constants_1.VALIDATION_MESSAGES.REQUIRED,
});
/**
 * Pagination validator
 */
exports.paginationValidator = joi_1.default.object({
    page: joi_1.default.number().integer().min(1).default(1),
    limit: joi_1.default.number().integer().min(1).max(100).default(20),
    sort: joi_1.default.string().optional(),
    order: joi_1.default.string().valid('asc', 'desc').default('desc'),
});
// ===============================
// AUTH VALIDATION SCHEMAS
// ===============================
exports.registerSchema = joi_1.default.object({
    phoneNumber: exports.jordanPhoneValidator,
    fullName: joi_1.default.string().min(2).max(255).required().messages({
        'string.min': 'الاسم يجب أن يحتوي على حرفين على الأقل',
        'string.max': 'الاسم طويل جداً',
        'any.required': constants_1.VALIDATION_MESSAGES.REQUIRED,
    }),
    birthDate: joi_1.default.date()
        .iso()
        .max('now')
        .required()
        .messages({
        'date.base': constants_1.VALIDATION_MESSAGES.INVALID_DATE,
        'date.max': 'تاريخ الميلاد يجب أن يكون في الماضي',
        'any.required': constants_1.VALIDATION_MESSAGES.REQUIRED,
    }),
    password: exports.passwordValidator,
});
exports.verifyPhoneSchema = joi_1.default.object({
    phoneNumber: exports.jordanPhoneValidator,
    otpCode: exports.otpValidator,
});
exports.loginSchema = joi_1.default.object({
    phoneNumber: exports.jordanPhoneValidator,
    password: joi_1.default.string().required().messages({
        'any.required': constants_1.VALIDATION_MESSAGES.REQUIRED,
    }),
    deviceId: joi_1.default.string().optional(),
});
exports.refreshTokenSchema = joi_1.default.object({
    refreshToken: joi_1.default.string().required().messages({
        'any.required': 'رمز التحديث مطلوب',
    }),
});
exports.requestPasswordResetSchema = joi_1.default.object({
    phoneNumber: exports.jordanPhoneValidator,
});
exports.resetPasswordSchema = joi_1.default.object({
    phoneNumber: exports.jordanPhoneValidator,
    otpCode: exports.otpValidator,
    newPassword: exports.passwordValidator,
});
exports.resendOtpSchema = joi_1.default.object({
    phoneNumber: exports.jordanPhoneValidator,
    purpose: joi_1.default.string()
        .valid('REGISTRATION', 'LOGIN', 'PASSWORD_RESET', 'PHONE_VERIFICATION')
        .required()
        .messages({
        'any.only': 'نوع رمز التحقق غير صحيح',
        'any.required': constants_1.VALIDATION_MESSAGES.REQUIRED,
    }),
});
// ===============================
// ONBOARDING VALIDATION SCHEMAS
// ===============================
exports.financialInfoSchema = joi_1.default.object({
    monthlyIncome: exports.amountValidator,
    basicExpenses: exports.amountValidator,
    financialGoal: joi_1.default.string().max(500).required().messages({
        'string.max': 'الهدف المالي طويل جداً',
        'any.required': constants_1.VALIDATION_MESSAGES.REQUIRED,
    }),
    primarySpendingCategory: joi_1.default.string().max(100).required().messages({
        'any.required': constants_1.VALIDATION_MESSAGES.REQUIRED,
    }),
});
exports.createFirstGoalSchema = joi_1.default.object({
    icon: joi_1.default.string().max(100).required(),
    name: joi_1.default.string().min(2).max(255).required().messages({
        'string.min': 'اسم الهدف قصير جداً',
        'string.max': 'اسم الهدف طويل جداً',
        'any.required': constants_1.VALIDATION_MESSAGES.REQUIRED,
    }),
    targetAmount: exports.amountValidator,
    targetDate: joi_1.default.date()
        .iso()
        .greater('now')
        .required()
        .messages({
        'date.greater': 'التاريخ المستهدف يجب أن يكون في المستقبل',
        'any.required': constants_1.VALIDATION_MESSAGES.REQUIRED,
    }),
});
// ===============================
// GOAL VALIDATION SCHEMAS
// ===============================
exports.createGoalSchema = exports.createFirstGoalSchema.keys({
    description: joi_1.default.string().max(1000).optional(),
    category: joi_1.default.string().max(50).optional(),
    priority: joi_1.default.string().valid('LOW', 'MEDIUM', 'HIGH', 'URGENT').default('MEDIUM'),
});
exports.updateGoalSchema = joi_1.default.object({
    icon: joi_1.default.string().max(100).optional(),
    name: joi_1.default.string().min(2).max(255).optional(),
    targetAmount: exports.amountValidator.optional(),
    targetDate: joi_1.default.date().iso().greater('now').optional(),
    status: joi_1.default.string().valid('ACTIVE', 'COMPLETED', 'PAUSED', 'CANCELLED').optional(),
    description: joi_1.default.string().max(1000).optional(),
    priority: joi_1.default.string().valid('LOW', 'MEDIUM', 'HIGH', 'URGENT').optional(),
});
exports.goalTransactionSchema = joi_1.default.object({
    amount: exports.amountValidator,
    transactionType: joi_1.default.string().valid('DEPOSIT', 'WITHDRAWAL').required().messages({
        'any.only': 'نوع المعاملة يجب أن يكون DEPOSIT أو WITHDRAWAL',
        'any.required': constants_1.VALIDATION_MESSAGES.REQUIRED,
    }),
    description: joi_1.default.string().max(500).optional(),
});
// ===============================
// EXPENSE VALIDATION SCHEMAS
// ===============================
exports.createExpenseSchema = joi_1.default.object({
    categoryId: exports.uuidValidator,
    amount: exports.amountValidator,
    description: joi_1.default.string().max(500).optional(),
    expenseDate: joi_1.default.date().iso().max('now').optional(),
    paymentMethod: joi_1.default.string().valid('CASH', 'CARD', 'BANK_TRANSFER', 'MOBILE_PAYMENT', 'OTHER').optional(),
    location: joi_1.default.string().max(255).optional(),
    receiptUrl: joi_1.default.string().uri().max(500).optional(),
    isRecurring: joi_1.default.boolean().default(false),
    recurringFrequency: joi_1.default.string()
        .valid('DAILY', 'WEEKLY', 'MONTHLY', 'QUARTERLY', 'YEARLY')
        .when('isRecurring', {
        is: true,
        then: joi_1.default.required(),
        otherwise: joi_1.default.optional(),
    }),
    tags: joi_1.default.array().items(joi_1.default.string().max(50)).max(10).optional(),
    notes: joi_1.default.string().max(1000).optional(),
});
exports.updateExpenseSchema = joi_1.default.object({
    categoryId: exports.uuidValidator.optional(),
    amount: exports.amountValidator.optional(),
    description: joi_1.default.string().max(500).optional(),
    expenseDate: joi_1.default.date().iso().max('now').optional(),
    paymentMethod: joi_1.default.string().valid('CASH', 'CARD', 'BANK_TRANSFER', 'MOBILE_PAYMENT', 'OTHER').optional(),
    location: joi_1.default.string().max(255).optional(),
    receiptUrl: joi_1.default.string().uri().max(500).optional(),
    isRecurring: joi_1.default.boolean().optional(),
    recurringFrequency: joi_1.default.string().valid('DAILY', 'WEEKLY', 'MONTHLY', 'QUARTERLY', 'YEARLY').optional(),
    tags: joi_1.default.array().items(joi_1.default.string().max(50)).max(10).optional(),
    notes: joi_1.default.string().max(1000).optional(),
});
exports.createCategorySchema = joi_1.default.object({
    name: joi_1.default.string().min(2).max(100).required(),
    icon: joi_1.default.string().max(100).optional(),
    color: joi_1.default.string().pattern(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/).optional(),
});
// ===============================
// USER VALIDATION SCHEMAS
// ===============================
// ===============================
// INCOME VALIDATION SCHEMAS
// ===============================
exports.createIncomeSchema = joi_1.default.object({
    amount: exports.amountValidator,
    source: joi_1.default.string().max(255).required(),
    description: joi_1.default.string().max(1000).optional(),
    incomeDate: joi_1.default.date().iso().optional(),
    isRecurring: joi_1.default.boolean().default(false),
    frequency: joi_1.default.string()
        .valid('DAILY', 'WEEKLY', 'MONTHLY', 'QUARTERLY', 'YEARLY')
        .when('isRecurring', { is: true, then: joi_1.default.required(), otherwise: joi_1.default.optional() }),
    startDate: joi_1.default.date().iso().optional(),
    endDate: joi_1.default.date().iso().optional(),
});
exports.updateIncomeSchema = joi_1.default.object({
    amount: exports.amountValidator.optional(),
    source: joi_1.default.string().max(255).optional(),
    description: joi_1.default.string().max(1000).optional(),
    incomeDate: joi_1.default.date().iso().optional(),
    isRecurring: joi_1.default.boolean().optional(),
    frequency: joi_1.default.string().valid('DAILY', 'WEEKLY', 'MONTHLY', 'QUARTERLY', 'YEARLY').optional(),
    startDate: joi_1.default.date().iso().optional(),
    endDate: joi_1.default.date().iso().optional(),
});
exports.updateUserSchema = joi_1.default.object({
    fullName: joi_1.default.string().min(2).max(255).optional(),
    birthDate: joi_1.default.date().iso().max('now').optional(),
});
exports.updateProfileSchema = joi_1.default.object({
    monthlyIncome: exports.amountValidator.optional(),
    basicExpenses: exports.amountValidator.optional(),
    financialGoal: joi_1.default.string().max(500).optional(),
    primarySpendingCategory: joi_1.default.string().max(100).optional(),
    occupation: joi_1.default.string().max(100).optional(),
    educationLevel: joi_1.default.string().max(50).optional(),
    familySize: joi_1.default.number().integer().min(1).max(20).optional(),
    hasEmergencyFund: joi_1.default.boolean().optional(),
    riskTolerance: joi_1.default.string().valid('LOW', 'MEDIUM', 'HIGH').optional(),
    changeReason: joi_1.default.string().max(500).optional(),
});
exports.changePasswordSchema = joi_1.default.object({
    currentPassword: joi_1.default.string().required().messages({
        'any.required': 'كلمة المرور الحالية مطلوبة',
    }),
    newPassword: exports.passwordValidator,
});
exports.updateSettingsSchema = joi_1.default.object({
    notificationsEnabled: joi_1.default.boolean().optional(),
    emailNotifications: joi_1.default.boolean().optional(),
    pushNotifications: joi_1.default.boolean().optional(),
    smsNotifications: joi_1.default.boolean().optional(),
    weeklySummary: joi_1.default.boolean().optional(),
    monthlySummary: joi_1.default.boolean().optional(),
    spendingAlerts: joi_1.default.boolean().optional(),
    goalReminders: joi_1.default.boolean().optional(),
    language: joi_1.default.string().valid('ar', 'en').optional(),
    currency: joi_1.default.string().length(3).optional(),
    timezone: joi_1.default.string().optional(),
    theme: joi_1.default.string().valid('light', 'dark').optional(),
    dataSharing: joi_1.default.boolean().optional(),
    analyticsOptIn: joi_1.default.boolean().optional(),
    marketingOptIn: joi_1.default.boolean().optional(),
    budgetAlertThreshold: joi_1.default.number().integer().min(0).max(100).optional(),
});
//# sourceMappingURL=validation.middleware.js.map