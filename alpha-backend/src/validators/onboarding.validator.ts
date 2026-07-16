/**
 * Onboarding Validators
 * Validates all onboarding-related requests
 * Implements Input Validation following Security Best Practices
 */

import Joi from 'joi';
import { BaseValidator } from './base.validator';

// Income source item schema
const incomeSourceSchema = Joi.object({
  sourceType: Joi.string().valid(
    'REGULAR_SALARY', 'TEMPORARY_JOB', 'FAMILY_ALLOWANCE',
    'EXTERNAL_HELP', 'RENTAL_INCOME', 'OTHER_INCOME'
  ).required().messages({
    'any.only': 'نوع مصدر الدخل غير صالح',
    'any.required': 'نوع مصدر الدخل مطلوب',
  }),
  amount: Joi.number().positive().required().messages({
    'number.positive': 'مبلغ الدخل يجب أن يكون أكبر من صفر',
    'any.required': 'مبلغ الدخل مطلوب',
  }),
  description: Joi.string().max(255).optional(),
});

// Fixed expense item schema
const fixedExpenseSchema = Joi.object({
  category: Joi.string().valid(
    'TUITION', 'RENT', 'LOAN', 'UTILITIES', 'TREATMENT', 'SAVINGS', 'OTHER_FIXED'
  ).required().messages({
    'any.only': 'فئة المصروف الثابت غير صالح',
    'any.required': 'فئة المصروف مطلوبة',
  }),
  amount: Joi.number().min(0).required().messages({
    'number.min': 'مبلغ المصروف يجب أن يكون صفر أو أكثر',
    'any.required': 'مبلغ المصروف مطلوب',
  }),
});

// Variable expense item schema
const variableExpenseSchema = Joi.object({
  category: Joi.string().valid(
    'FOOD', 'TRANSPORT', 'CLOTHING', 'EVENTS', 'ENTERTAINMENT',
    'TREATMENT_REHAB', 'PERSONAL_CARE', 'OTHER_VARIABLE'
  ).required().messages({
    'any.only': 'فئة المصروف المتغير غير صالح',
    'any.required': 'فئة المصروف مطلوبة',
  }),
  amount: Joi.number().min(0).required().messages({
    'number.min': 'مبلغ المصروف يجب أن يكون صفر أو أكثر',
    'any.required': 'مبلغ المصروف مطلوب',
  }),
});

/**
 * Income source item
 */
export interface IncomeSourceItem {
  sourceType: string;
  amount: number;
  description?: string;
}

/**
 * Fixed expense item
 */
export interface FixedExpenseItem {
  category: string;
  amount: number;
}

/**
 * Variable expense item
 */
export interface VariableExpenseItem {
  category: string;
  amount: number;
}

/**
 * Financial Data Request (full onboarding financial step)
 */
export interface FinancialDataRequest {
  relationshipWithMoney: string;
  monthlyExtraSavingsGoal?: number;
  mainFinancialGoal12M: string;
  incomeSources: IncomeSourceItem[];
  fixedExpenses: FixedExpenseItem[];
  variableExpenses: VariableExpenseItem[];
  pinnedMonths?: number;
}

class FinancialDataValidator extends BaseValidator<FinancialDataRequest> {
  constructor() {
    super(
      Joi.object({
        relationshipWithMoney: Joi.string().valid(
          'SAVING_CAREFULLY', 'BALANCED_SPENDING', 'EMOTIONAL_SPENDING', 'OTHER'
        ).required().messages({
          'any.only': 'نوع العلاقة مع المال غير صالح',
          'any.required': 'العلاقة مع المال مطلوبة',
        }),
        monthlyExtraSavingsGoal: Joi.number().min(0).optional().messages({
          'number.min': 'مبلغ الادخار الإضافي يجب أن يكون صفر أو أكثر',
        }),
        mainFinancialGoal12M: Joi.string().valid(
          'EDUCATION', 'TECHNOLOGY', 'TRAVEL', 'CAR', 'OTHER'
        ).required().messages({
          'any.only': 'الهدف المالي الرئيسي غير صالح',
          'any.required': 'الهدف المالي الرئيسي مطلوب',
        }),
        incomeSources: Joi.array().items(incomeSourceSchema).min(1).required().messages({
          'array.min': 'يجب إدخال مصدر دخل واحد على الأقل',
          'any.required': 'مصادر الدخل مطلوبة',
        }),
        fixedExpenses: Joi.array().items(fixedExpenseSchema).min(0).required().messages({
          'any.required': 'النفقات الثابتة مطلوبة',
        }),
        variableExpenses: Joi.array().items(variableExpenseSchema).min(0).required().messages({
          'any.required': 'النفقات المتغيرة مطلوبة',
        }),
        pinnedMonths: Joi.number().valid(3, 6, 12).optional().messages({
          'any.only': 'مدة التثبيت يجب أن تكون 3 أو 6 أو 12 شهر',
        }),
      }).custom((value, helpers) => {
        // Budget balance validation: total income must equal total expenses (±1 JOD tolerance)
        const totalIncome = value.incomeSources.reduce((sum: number, s: any) => sum + s.amount, 0);
        const totalFixedExpenses = value.fixedExpenses.reduce((sum: number, e: any) => sum + e.amount, 0);
        const totalVariableExpenses = value.variableExpenses.reduce((sum: number, e: any) => sum + e.amount, 0);
        const totalExpenses = totalFixedExpenses + totalVariableExpenses;

        if (totalExpenses > totalIncome + 1) {
          return helpers.error('any.custom', {
            message: 'مجموع النفقات أكبر من مجموع الدخل، يرجى تصحيح البيانات',
          });
        }

        return value;
      })
    );
  }
}

// Goal item schema
const goalItemSchema = Joi.object({
  name: Joi.string().min(1).max(255).required().messages({
    'string.min': 'اسم الهدف مطلوب',
    'any.required': 'اسم الهدف مطلوب',
  }),
  targetAmount: Joi.number().positive().required().messages({
    'number.positive': 'المبلغ المستهدف يجب أن يكون أكبر من صفر',
    'any.required': 'المبلغ المستهدف مطلوب',
  }),
  targetDate: Joi.string().isoDate().required().messages({
    'string.isoDate': 'تاريخ الهدف غير صالح',
    'any.required': 'تاريخ الهدف مطلوب',
  }),
  flexibility: Joi.string().valid('FIXED', 'FLEXIBLE').required().messages({
    'any.only': 'نوع الهدف يجب أن يكون ثابت أو مرن',
    'any.required': 'نوع الهدف مطلوب',
  }),
  goalCategory: Joi.string().valid(
    'EMERGENCY_FUND', 'LAPTOP', 'GROUP_TRIP', 'HOLIDAY_EXPENSES',
    'TUITION', 'CAR', 'ELECTRONICS', 'FURNITURE', 'CLOTHING', 'OTHER_GOAL'
  ).required().messages({
    'any.only': 'فئة الهدف غير صالحة',
    'any.required': 'فئة الهدف مطلوبة',
  }),
  priority: Joi.string().valid('LOW', 'MEDIUM', 'HIGH', 'URGENT').optional().default('MEDIUM').messages({
    'any.only': 'مستوى الأولوية غير صالح',
  }),
  monthlyAllocation: Joi.number().min(0).optional().messages({
    'number.min': 'التخصيص الشهري يجب أن يكون صفر أو أكثر',
  }),
  icon: Joi.string().max(100).optional(),
});

/**
 * Goal item
 */
export interface GoalItem {
  name: string;
  targetAmount: number;
  targetDate: string;
  flexibility: string;
  goalCategory: string;
  priority?: string;
  monthlyAllocation?: number;
  icon?: string;
}

/**
 * Financial Goals Request (goals onboarding step)
 */
export interface FinancialGoalsRequest {
  goals: GoalItem[];
}

class FinancialGoalsValidator extends BaseValidator<FinancialGoalsRequest> {
  constructor() {
    super(
      Joi.object({
        goals: Joi.array().items(goalItemSchema).min(1).required().messages({
          'array.min': 'يجب إدخال هدف واحد على الأقل',
          'any.required': 'الأهداف المالية مطلوبة',
        }),
      })
    );
  }
}

/**
 * Budget Validation Request (validate without saving)
 */
export interface BudgetValidationRequest {
  incomeSources: IncomeSourceItem[];
  fixedExpenses: FixedExpenseItem[];
  variableExpenses: VariableExpenseItem[];
}

class BudgetValidationValidator extends BaseValidator<BudgetValidationRequest> {
  constructor() {
    super(
      Joi.object({
        incomeSources: Joi.array().items(incomeSourceSchema).min(1).required(),
        fixedExpenses: Joi.array().items(fixedExpenseSchema).min(0).required(),
        variableExpenses: Joi.array().items(variableExpenseSchema).min(0).required(),
      })
    );
  }
}

// Export validator instances
export const onboardingValidators = {
  financialData: new FinancialDataValidator(),
  financialGoals: new FinancialGoalsValidator(),
  budgetValidation: new BudgetValidationValidator(),
};

// Export individual validators
export const financialDataValidator = onboardingValidators.financialData;
export const financialGoalsValidator = onboardingValidators.financialGoals;
export const budgetValidationValidator = onboardingValidators.budgetValidation;
