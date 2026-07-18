import Joi from 'joi';
import { FastifyRequest, FastifyReply } from 'fastify';
import { ErrorCodes, createErrorResponse } from '../types/api.types';
import { HTTP_STATUS, PHONE_CONFIG, PASSWORD_CONFIG, VALIDATION_MESSAGES } from '../utils/constants';
import { phoneUtils } from '../utils/helpers';
import logger from '../utils/logger';

/**
 * Validation middleware factory
 */
export const validate = (schema: Joi.ObjectSchema) => {
  return async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
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

        logger.warn('Validation failed', {
          path: request.url,
          errors,
        });

        return reply
          .status(HTTP_STATUS.BAD_REQUEST)
          .send(createErrorResponse(
            ErrorCodes.VALIDATION_ERROR,
            'خطأ في البيانات المدخلة',
            { errors }
          ));
      }

      // Replace body with validated value
      request.body = value;
    } catch (err) {
      logger.error('Validation error', { error: err });
      return reply
        .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
        .send(createErrorResponse(
          ErrorCodes.INTERNAL_ERROR,
          'حدث خطأ في التحقق من البيانات'
        ));
    }
  };
};

/**
 * Query parameters validation
 */
export const validateQuery = (schema: Joi.ObjectSchema) => {
  return async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
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
          .status(HTTP_STATUS.BAD_REQUEST)
          .send(createErrorResponse(
            ErrorCodes.VALIDATION_ERROR,
            'خطأ في معاملات الاستعلام',
            { errors }
          ));
      }

      request.query = value;
    } catch (err) {
      logger.error('Query validation error', { error: err });
      return reply
        .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
        .send(createErrorResponse(
          ErrorCodes.INTERNAL_ERROR,
          'حدث خطأ في التحقق من البيانات'
        ));
    }
  };
};

// Custom Joi validators

/**
 * Jordan phone number validator
 */
export const jordanPhoneValidator = Joi.string()
  .custom((value, helpers) => {
    if (!phoneUtils.validate(value)) {
      return helpers.error('any.invalid');
    }
    return phoneUtils.normalize(value);
  })
  .required()
  .messages({
    'any.invalid': VALIDATION_MESSAGES.INVALID_PHONE,
    'string.empty': VALIDATION_MESSAGES.REQUIRED,
    'any.required': VALIDATION_MESSAGES.REQUIRED,
  });

/**
 * Password validator
 */
export const passwordValidator = Joi.string()
  .min(PASSWORD_CONFIG.MIN_LENGTH)
  .max(PASSWORD_CONFIG.MAX_LENGTH)
  .pattern(PASSWORD_CONFIG.REGEX)
  .required()
  .messages({
    'string.min': `كلمة المرور يجب أن تحتوي على ${PASSWORD_CONFIG.MIN_LENGTH} أحرف على الأقل`,
    'string.max': `كلمة المرور يجب ألا تتجاوز ${PASSWORD_CONFIG.MAX_LENGTH} حرف`,
    'string.pattern.base': VALIDATION_MESSAGES.WEAK_PASSWORD,
    'string.empty': VALIDATION_MESSAGES.REQUIRED,
    'any.required': VALIDATION_MESSAGES.REQUIRED,
  });

/**
 * OTP code validator
 */
export const otpValidator = Joi.string()
  .length(6)
  .pattern(/^\d{6}$/)
  .required()
  .messages({
    'string.length': 'رمز التحقق يجب أن يتكون من 6 أرقام',
    'string.pattern.base': 'رمز التحقق غير صحيح',
    'string.empty': VALIDATION_MESSAGES.REQUIRED,
    'any.required': VALIDATION_MESSAGES.REQUIRED,
  });

/**
 * Amount validator (JOD)
 */
export const amountValidator = Joi.number()
  .positive()
  .precision(2)
  .max(999999.99)
  .required()
  .messages({
    'number.positive': 'المبلغ يجب أن يكون أكبر من صفر',
    'number.max': 'المبلغ يجب ألا يتجاوز 999,999.99',
    'number.base': VALIDATION_MESSAGES.INVALID_AMOUNT,
    'any.required': VALIDATION_MESSAGES.REQUIRED,
  });

/**
 * Date validator (ISO format)
 */
export const dateValidator = Joi.date()
  .iso()
  .required()
  .messages({
    'date.base': VALIDATION_MESSAGES.INVALID_DATE,
    'date.format': VALIDATION_MESSAGES.INVALID_DATE,
    'any.required': VALIDATION_MESSAGES.REQUIRED,
  });

/**
 * UUID validator
 */
export const uuidValidator = Joi.string()
  .uuid()
  .required()
  .messages({
    'string.guid': 'معرف غير صحيح',
    'any.required': VALIDATION_MESSAGES.REQUIRED,
  });

/**
 * Pagination validator
 */
export const paginationValidator = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(20),
  sort: Joi.string().optional(),
  order: Joi.string().valid('asc', 'desc').default('desc'),
});

// ===============================
// AUTH VALIDATION SCHEMAS
// ===============================

export const registerSchema = Joi.object({
  phoneNumber: jordanPhoneValidator,
  email: Joi.string().email().required().messages({
    'string.email': VALIDATION_MESSAGES.INVALID_EMAIL,
    'any.required': VALIDATION_MESSAGES.REQUIRED,
  }),
  fullName: Joi.string().min(2).max(255).required().messages({
    'string.min': 'الاسم يجب أن يحتوي على حرفين على الأقل',
    'string.max': 'الاسم طويل جداً',
    'any.required': VALIDATION_MESSAGES.REQUIRED,
  }),
  birthDate: Joi.date()
    .iso()
    .max('now')
    .required()
    .messages({
      'date.base': VALIDATION_MESSAGES.INVALID_DATE,
      'date.max': 'تاريخ الميلاد يجب أن يكون في الماضي',
      'any.required': VALIDATION_MESSAGES.REQUIRED,
    }),
  password: passwordValidator,
  otpCode: otpValidator,
});

export const requestRegistrationOtpSchema = Joi.object({
  phoneNumber: jordanPhoneValidator,
  email: Joi.string().email().optional().messages({
    'string.email': VALIDATION_MESSAGES.INVALID_EMAIL,
  }),
  username: Joi.string().optional(),
});

export const verifyPhoneSchema = Joi.object({
  phoneNumber: jordanPhoneValidator,
  otpCode: otpValidator,
});

export const loginSchema = Joi.object({
  phoneNumber: jordanPhoneValidator,
  password: Joi.string().required().messages({
    'any.required': VALIDATION_MESSAGES.REQUIRED,
  }),
  deviceId: Joi.string().optional(),
});

export const refreshTokenSchema = Joi.object({
  refreshToken: Joi.string().required().messages({
    'any.required': 'رمز التحديث مطلوب',
  }),
});

export const requestPasswordResetSchema = Joi.object({
  phoneNumber: jordanPhoneValidator,
});

export const requestPasswordResetEmailSchema = Joi.object({
  email: Joi.string().email().required().messages({
    'string.email': VALIDATION_MESSAGES.INVALID_EMAIL,
    'any.required': VALIDATION_MESSAGES.REQUIRED,
  }),
});

export const resetPasswordSchema = Joi.object({
  phoneNumber: jordanPhoneValidator,
  otpCode: otpValidator,
  newPassword: passwordValidator,
});

export const resetPasswordEmailSchema = Joi.object({
  email: Joi.string().email().required().messages({
    'string.email': VALIDATION_MESSAGES.INVALID_EMAIL,
    'any.required': VALIDATION_MESSAGES.REQUIRED,
  }),
  otpCode: otpValidator,
  newPassword: passwordValidator,
});

export const resendOtpSchema = Joi.object({
  phoneNumber: jordanPhoneValidator,
  purpose: Joi.string()
    .valid('REGISTRATION', 'LOGIN', 'PASSWORD_RESET', 'PHONE_VERIFICATION')
    .required()
    .messages({
      'any.only': 'نوع رمز التحقق غير صحيح',
      'any.required': VALIDATION_MESSAGES.REQUIRED,
    }),
});

export const sendEmailVerificationSchema = Joi.object({
  phoneNumber: jordanPhoneValidator,
  email: Joi.string().email().required().messages({
    'string.email': VALIDATION_MESSAGES.INVALID_EMAIL,
    'any.required': VALIDATION_MESSAGES.REQUIRED,
  }),
});

export const verifyEmailSchema = Joi.object({
  phoneNumber: jordanPhoneValidator,
  email: Joi.string().email().required().messages({
    'string.email': VALIDATION_MESSAGES.INVALID_EMAIL,
    'any.required': VALIDATION_MESSAGES.REQUIRED,
  }),
  otpCode: otpValidator,
});

// ===============================
// ONBOARDING VALIDATION SCHEMAS
// ===============================

export const financialInfoSchema = Joi.object({
  monthlyIncome: amountValidator,
  basicExpenses: amountValidator,
  financialGoal: Joi.string().max(500).required().messages({
    'string.max': 'الهدف المالي طويل جداً',
    'any.required': VALIDATION_MESSAGES.REQUIRED,
  }),
  primarySpendingCategory: Joi.string().max(100).required().messages({
    'any.required': VALIDATION_MESSAGES.REQUIRED,
  }),
  // Extended fields per PDF spec
  relationshipWithMoney: Joi.string().valid('SAVING_CAREFULLY', 'BALANCED_SPENDING', 'EMOTIONAL_SPENDING', 'OTHER').optional(),
  monthlyExtraSavingsGoal: amountValidator.optional(),
  mainFinancialGoal12M: Joi.string().valid('EDUCATION', 'TECHNOLOGY', 'TRAVEL', 'CAR', 'OTHER').optional(),
  incomeSources: Joi.array().items(Joi.object({
    sourceType: Joi.string().valid('REGULAR_SALARY', 'TEMPORARY_JOB', 'FAMILY_ALLOWANCE', 'EXTERNAL_HELP', 'RENTAL_INCOME', 'OTHER_INCOME').required(),
    amount: amountValidator.required(),
    description: Joi.string().max(255).optional(),
    pinnedMonths: Joi.number().integer().min(1).max(12).optional(),
  })).optional(),
  fixedExpenses: Joi.array().items(Joi.object({
    category: Joi.string().max(100).required(),
    amount: amountValidator.required(),
    pinnedMonths: Joi.number().integer().min(1).max(12).optional(),
  })).optional(),
  variableExpenses: Joi.array().items(Joi.object({
    category: Joi.string().max(100).required(),
    amount: amountValidator.required(),
    pinnedMonths: Joi.number().integer().min(1).max(12).optional(),
  })).optional(),
  pinnedMonths: Joi.number().integer().min(1).max(12).optional(),
});

export const createFirstGoalSchema = Joi.object({
  icon: Joi.string().max(100).required(),
  name: Joi.string().min(2).max(255).required().messages({
    'string.min': 'اسم الهدف قصير جداً',
    'string.max': 'اسم الهدف طويل جداً',
    'any.required': VALIDATION_MESSAGES.REQUIRED,
  }),
  targetAmount: amountValidator,
  targetDate: Joi.date()
    .iso()
    .greater('now')
    .required()
    .messages({
      'date.greater': 'التاريخ المستهدف يجب أن يكون في المستقبل',
      'any.required': VALIDATION_MESSAGES.REQUIRED,
    }),
  flexibility: Joi.string().valid('FIXED', 'FLEXIBLE').default('FLEXIBLE'),
});

// ===============================
// GOAL VALIDATION SCHEMAS
// ===============================

export const createGoalSchema = createFirstGoalSchema.keys({
  description: Joi.string().max(1000).optional(),
  category: Joi.string().max(50).optional(),
  priority: Joi.string().valid('LOW', 'MEDIUM', 'HIGH', 'URGENT').default('MEDIUM'),
  goalCategory: Joi.string().max(100).optional(),
});

export const updateGoalSchema = Joi.object({
  icon: Joi.string().max(100).optional(),
  name: Joi.string().min(2).max(255).optional(),
  targetAmount: amountValidator.optional(),
  targetDate: Joi.date().iso().greater('now').optional(),
  status: Joi.string().valid('ACTIVE', 'COMPLETED', 'PAUSED', 'CANCELLED').optional(),
  description: Joi.string().max(1000).optional(),
  priority: Joi.string().valid('LOW', 'MEDIUM', 'HIGH', 'URGENT').optional(),
});

export const goalTransactionSchema = Joi.object({
  amount: amountValidator,
  transactionType: Joi.string().valid('DEPOSIT', 'WITHDRAWAL').required().messages({
    'any.only': 'نوع المعاملة يجب أن يكون DEPOSIT أو WITHDRAWAL',
    'any.required': VALIDATION_MESSAGES.REQUIRED,
  }),
  description: Joi.string().max(500).optional(),
});

// ===============================
// EXPENSE VALIDATION SCHEMAS
// ===============================

export const createExpenseSchema = Joi.object({
  categoryId: uuidValidator,
  amount: amountValidator,
  description: Joi.string().max(500).optional(),
  expenseDate: Joi.date().iso().max('now').optional(),
  paymentMethod: Joi.string().valid('CASH', 'CARD', 'BANK_TRANSFER', 'MOBILE_PAYMENT', 'OTHER').optional(),
  location: Joi.string().max(255).optional(),
  receiptUrl: Joi.string().uri().max(500).optional(),
  isRecurring: Joi.boolean().default(false),
  recurringFrequency: Joi.string()
    .valid('DAILY', 'WEEKLY', 'MONTHLY', 'QUARTERLY', 'YEARLY')
    .when('isRecurring', {
      is: true,
      then: Joi.required(),
      otherwise: Joi.optional(),
    }),
  tags: Joi.array().items(Joi.string().max(50)).max(10).optional(),
  notes: Joi.string().max(1000).optional(),
});

export const updateExpenseSchema = Joi.object({
  categoryId: uuidValidator.optional(),
  amount: amountValidator.optional(),
  description: Joi.string().max(500).optional(),
  expenseDate: Joi.date().iso().max('now').optional(),
  paymentMethod: Joi.string().valid('CASH', 'CARD', 'BANK_TRANSFER', 'MOBILE_PAYMENT', 'OTHER').optional(),
  location: Joi.string().max(255).optional(),
  receiptUrl: Joi.string().uri().max(500).optional(),
  isRecurring: Joi.boolean().optional(),
  recurringFrequency: Joi.string().valid('DAILY', 'WEEKLY', 'MONTHLY', 'QUARTERLY', 'YEARLY').optional(),
  tags: Joi.array().items(Joi.string().max(50)).max(10).optional(),
  notes: Joi.string().max(1000).optional(),
});

export const createCategorySchema = Joi.object({
  name: Joi.string().min(2).max(100).required(),
  icon: Joi.string().max(100).optional(),
  color: Joi.string().pattern(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/).optional(),
});

// ===============================
// USER VALIDATION SCHEMAS
// ===============================

// ===============================
// INCOME VALIDATION SCHEMAS
// ===============================

export const createIncomeSchema = Joi.object({
  amount: amountValidator,
  source: Joi.string().max(255).required(),
  description: Joi.string().max(1000).optional(),
  incomeDate: Joi.date().iso().optional(),
  isRecurring: Joi.boolean().default(false),
  frequency: Joi.string()
    .valid('DAILY', 'WEEKLY', 'MONTHLY', 'QUARTERLY', 'YEARLY')
    .when('isRecurring', { is: true, then: Joi.required(), otherwise: Joi.optional() }),
  startDate: Joi.date().iso().optional(),
  endDate: Joi.date().iso().optional(),
});

export const updateIncomeSchema = Joi.object({
  amount: amountValidator.optional(),
  source: Joi.string().max(255).optional(),
  description: Joi.string().max(1000).optional(),
  incomeDate: Joi.date().iso().optional(),
  isRecurring: Joi.boolean().optional(),
  frequency: Joi.string().valid('DAILY', 'WEEKLY', 'MONTHLY', 'QUARTERLY', 'YEARLY').optional(),
  startDate: Joi.date().iso().optional(),
  endDate: Joi.date().iso().optional(),
});

export const updateUserSchema = Joi.object({
  fullName: Joi.string().min(2).max(255).optional(),
  birthDate: Joi.date().iso().max('now').optional(),
});

export const demographicsSchema = Joi.object({
  gender: Joi.string().valid('MALE', 'FEMALE').required().messages({
    'any.only': 'النوع الاجتماعي يجب أن يكون MALE أو FEMALE',
    'any.required': VALIDATION_MESSAGES.REQUIRED,
  }),
  maritalStatus: Joi.string().valid('SINGLE', 'MARRIED', 'OTHER').optional(),
  isHeadOfHousehold: Joi.boolean().default(false),
  isStudent: Joi.boolean().default(false),
});

export const updateProfileSchema = Joi.object({
  monthlyIncome: amountValidator.optional(),
  basicExpenses: amountValidator.optional(),
  financialGoal: Joi.string().max(500).optional(),
  primarySpendingCategory: Joi.string().max(100).optional(),
  occupation: Joi.string().max(100).optional(),
  educationLevel: Joi.string().max(50).optional(),
  familySize: Joi.number().integer().min(1).max(20).optional(),
  hasEmergencyFund: Joi.boolean().optional(),
  riskTolerance: Joi.string().valid('LOW', 'MEDIUM', 'HIGH').optional(),
  changeReason: Joi.string().max(500).optional(),
});

export const changePasswordSchema = Joi.object({
  currentPassword: Joi.string().required().messages({
    'any.required': 'كلمة المرور الحالية مطلوبة',
  }),
  newPassword: passwordValidator,
});

export const updateSettingsSchema = Joi.object({
  notificationsEnabled: Joi.boolean().optional(),
  emailNotifications: Joi.boolean().optional(),
  pushNotifications: Joi.boolean().optional(),
  smsNotifications: Joi.boolean().optional(),
  weeklySummary: Joi.boolean().optional(),
  monthlySummary: Joi.boolean().optional(),
  spendingAlerts: Joi.boolean().optional(),
  goalReminders: Joi.boolean().optional(),
  language: Joi.string().valid('ar', 'en').optional(),
  currency: Joi.string().length(3).optional(),
  timezone: Joi.string().optional(),
  theme: Joi.string().valid('light', 'dark').optional(),
  dataSharing: Joi.boolean().optional(),
  analyticsOptIn: Joi.boolean().optional(),
  marketingOptIn: Joi.boolean().optional(),
  budgetAlertThreshold: Joi.number().integer().min(0).max(100).optional(),
});

// ===============================
// BUDGET VALIDATION SCHEMAS
// ===============================

export const createBudgetSchema = Joi.object({
  name: Joi.string().min(2).max(255).required().messages({
    'string.min': 'اسم الميزانية قصير جداً',
    'string.max': 'اسم الميزانية طويل جداً',
    'any.required': VALIDATION_MESSAGES.REQUIRED,
  }),
  amount: amountValidator,
  period: Joi.string().valid('WEEKLY', 'MONTHLY', 'QUARTERLY', 'YEARLY', 'CUSTOM').required().messages({
    'any.only': 'الفترة يجب أن تكون أسبوعية أو شهرية أو ربع سنوية أو سنوية أو مخصصة',
    'any.required': VALIDATION_MESSAGES.REQUIRED,
  }),
  startDate: Joi.date().iso().required().messages({
    'any.required': VALIDATION_MESSAGES.REQUIRED,
  }),
  endDate: Joi.date().iso().greater(Joi.ref('startDate')).required().messages({
    'date.greater': 'تاريخ النهاية يجب أن يكون بعد تاريخ البداية',
    'any.required': VALIDATION_MESSAGES.REQUIRED,
  }),
  categoryId: uuidValidator.optional(),
  alertAt: Joi.number().integer().min(1).max(100).default(80),
});

export const updateBudgetSchema = Joi.object({
  name: Joi.string().min(2).max(255).optional(),
  amount: amountValidator.optional(),
  period: Joi.string().valid('WEEKLY', 'MONTHLY', 'QUARTERLY', 'YEARLY', 'CUSTOM').optional(),
  startDate: Joi.date().iso().optional(),
  endDate: Joi.date().iso().optional(),
  categoryId: uuidValidator.optional().allow(null),
  alertAt: Joi.number().integer().min(1).max(100).optional(),
  isActive: Joi.boolean().optional(),
});

// ===============================
// INSIGHT VALIDATION SCHEMAS
// ===============================

export const insightFilterSchema = Joi.object({
  type: Joi.string().valid('SPENDING_PATTERN', 'GOAL_RECOMMENDATION', 'BUDGET_ALERT', 'SAVING_TIP').optional(),
  isRead: Joi.boolean().optional(),
  priority: Joi.string().valid('LOW', 'MEDIUM', 'HIGH').optional(),
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(20),
});

// ===============================
// NOTIFICATION VALIDATION SCHEMAS
// ===============================

export const notificationFilterSchema = Joi.object({
  type: Joi.string().valid('GOAL_MILESTONE', 'SPENDING_ALERT', 'WEEKLY_SUMMARY', 'EDUCATIONAL').optional(),
  isRead: Joi.boolean().optional(),
  startDate: Joi.date().iso().optional(),
  endDate: Joi.date().iso().optional(),
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(50),
});
